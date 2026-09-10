/*
 * Verifica el esquema de Supabase sin necesitar Docker ni la CLI de Supabase.
 *
 * Levanta un cluster de Postgres desechable en un directorio temporal, aplica
 * el arnes local, las migraciones en orden y el seed, y luego ejecuta las
 * pruebas de comportamiento: aislamiento por RLS entre dos usuarios, k-anonimato
 * de la vista de publicacion, rechazo de valores fuera de las listas cerradas,
 * limite de peticiones, cuota de escenarios y rotacion de la frase de cifrado.
 *
 * El cluster se crea y se destruye en cada ejecucion, en su propio puerto, y no
 * toca ninguna instalacion de Postgres existente.
 *
 * Uso:
 *   node scripts/verify-supabase-schema.mjs
 *   node scripts/verify-supabase-schema.mjs --keep   (no borra el cluster, para depurar)
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import net from 'node:net'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')
const migrationsDir = join(repoRoot, 'supabase', 'migrations')
const testsDir = join(repoRoot, 'supabase', 'tests')
const seedPath = join(repoRoot, 'supabase', 'seed.sql')

const PORT = process.env.EPS_VERIFY_PGPORT ?? '55433'
const KEEP = process.argv.includes('--keep')
const isWindows = process.platform === 'win32'
const exe = (name) => (isWindows ? `${name}.exe` : name)

/** Localiza los binarios de Postgres: primero el PATH, luego las rutas tipicas. */
function findPostgresBin() {
  const probe = spawnSync(exe('initdb'), ['--version'], { encoding: 'utf8' })
  if (probe.status === 0) return ''

  const candidates = []
  if (isWindows) {
    for (const version of ['18', '17', '16', '15']) {
      candidates.push(`C:\\Program Files\\PostgreSQL\\${version}\\bin`)
    }
  } else {
    candidates.push('/usr/lib/postgresql/17/bin', '/usr/lib/postgresql/16/bin', '/opt/homebrew/bin', '/usr/local/bin')
  }

  for (const dir of candidates) {
    if (existsSync(join(dir, exe('initdb')))) return dir
  }
  return null
}

const binDir = findPostgresBin()
if (binDir === null) {
  console.error('No encuentro los binarios de PostgreSQL (initdb, pg_ctl, psql).')
  console.error('Instala PostgreSQL o anyade su carpeta bin al PATH.')
  process.exit(1)
}

const bin = (name) => (binDir === '' ? exe(name) : join(binDir, exe(name)))

function run(command, args, options = {}) {
  return spawnSync(command, args, { encoding: 'utf8', ...options })
}

/** psql con parada al primer error: cualquier fallo del SQL corta la ejecucion. */
function psql(args) {
  return run(bin('psql'), [
    '-h', '127.0.0.1', '-p', PORT, '-U', 'postgres', '-d', 'postgres',
    '-v', 'ON_ERROR_STOP=1', '-q', ...args,
  ])
}

/*
 * Si el puerto ya esta ocupado, `pg_ctl -w start` se queda esperando hasta que
 * agota su plazo y el fallo real queda enterrado en el log del servidor. Mejor
 * comprobarlo antes y decir exactamente que pasa.
 */
const portInUse = await new Promise((resolve) => {
  const socket = new net.Socket()
  socket.setTimeout(1000)
  socket.once('connect', () => { socket.destroy(); resolve(true) })
  socket.once('timeout', () => { socket.destroy(); resolve(false) })
  socket.once('error', () => { resolve(false) })
  socket.connect(Number(PORT), '127.0.0.1')
})

if (portInUse) {
  console.error(`El puerto ${PORT} ya esta ocupado, asi que no puedo levantar el cluster de pruebas.`)
  console.error('Cierra lo que lo este usando o elige otro: EPS_VERIFY_PGPORT=55444 pnpm verify:supabase')
  process.exit(1)
}

const dataDir = mkdtempSync(join(tmpdir(), 'eps-verify-pg-'))
let started = false

function stopCluster() {
  // Con --keep el cluster se deja EN MARCHA: uno parado no se puede inspeccionar,
  // que es justo para lo que sirve la opcion.
  if (started && !KEEP) {
    run(bin('pg_ctl'), ['-D', dataDir, '-m', 'immediate', 'stop'], { stdio: 'ignore' })
    started = false
  }
  if (!KEEP) {
    try {
      rmSync(dataDir, { recursive: true, force: true })
    } catch {
      /* en Windows el proceso puede tardar en soltar los archivos; no es grave */
    }
  } else {
    console.log(`\nCluster conservado y en marcha en ${dataDir} (puerto ${PORT}).`)
    console.log(`Para pararlo:  pg_ctl -D "${dataDir}" -m immediate stop`)
  }
}

process.on('exit', stopCluster)
process.on('SIGINT', () => { stopCluster(); process.exit(130) })

const pwFile = join(dataDir, '..', `eps-verify-pw-${process.pid}`)
writeFileSync(pwFile, 'eps-verify\n', 'utf8')

/*
 * `--locale=C` fija en ingles los mensajes del servidor. Sin esto, en una
 * instalacion en espanyol los avisos llegan como «NOTA:» en lugar de
 * «NOTICE:», el recuento de comprobaciones sale a cero y no parece que haya
 * fallado nada: el peor tipo de fallo en un verificador.
 */
const init = run(bin('initdb'), [
  '-D', dataDir, '-U', 'postgres', '--auth=trust', '--pwfile', pwFile,
  '-E', 'UTF8', '--locale=C',
])
try {
  rmSync(pwFile, { force: true })
} catch { /* da igual */ }

if (init.status !== 0) {
  console.error('initdb ha fallado:')
  console.error(init.stderr || init.stdout)
  process.exit(1)
}

/*
 * `stdio: 'ignore'` no es cosmetico: pg_ctl arranca el postmaster como hijo, y
 * si la salida va por una tuberia, el servidor hereda ese descriptor y lo
 * mantiene abierto mientras vive. spawnSync espera a que la tuberia se cierre,
 * asi que se quedaria colgado para siempre aunque pg_ctl ya haya terminado.
 * Por eso el servidor escribe en su propio log y aqui no se hereda nada.
 */
const serverLog = join(dataDir, 'server.log')
run(bin('pg_ctl'), [
  '-D', dataDir,
  '-o', `-p ${PORT} -c listen_addresses=127.0.0.1`,
  '-l', serverLog,
  'start',
], { stdio: 'ignore' })
started = true

let ready = false
for (let attempt = 0; attempt < 30; attempt += 1) {
  const probe = run(bin('pg_isready'), ['-h', '127.0.0.1', '-p', PORT, '-U', 'postgres'], { stdio: 'ignore' })
  if (probe.status === 0) {
    ready = true
    break
  }
  // Espera activa breve: no hay setTimeout sincrono y esto solo corre al arrancar.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500)
}

if (!ready) {
  console.error(`El cluster no ha llegado a aceptar conexiones en el puerto ${PORT}.`)
  try {
    console.error(readFileSync(serverLog, 'utf8').split('\n').slice(-10).join('\n'))
  } catch {
    /* sin log que ensenyar */
  }
  process.exit(1)
}

const steps = []
steps.push({ label: 'arnes local', file: join(testsDir, '00_arnes_supabase.sql') })

const migrations = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort()
if (migrations.length === 0) {
  console.error('No hay migraciones en supabase/migrations.')
  process.exit(1)
}
for (const name of migrations) {
  steps.push({ label: `migracion ${name}`, file: join(migrationsDir, name) })
}
steps.push({ label: 'seed', file: seedPath })

for (const step of steps) {
  const result = psql(['-f', step.file])
  if (result.status !== 0) {
    console.error(`FALLO al aplicar ${step.label}:`)
    console.error((result.stderr || result.stdout).trim().split('\n').slice(0, 12).join('\n'))
    process.exit(1)
  }
}
console.log(`Esquema aplicado: ${migrations.length} migraciones y el seed.`)

const tests = readdirSync(testsDir)
  .filter((name) => name.endsWith('.sql') && !name.startsWith('00_'))
  .sort()

let passed = 0
let failed = 0

if (tests.length === 0) {
  console.error(`No hay archivos de prueba en ${testsDir}.`)
  process.exit(1)
}

for (const name of tests) {
  const result = psql(['-f', join(testsDir, name)])
  const output = `${result.stdout}\n${result.stderr}`

  if (process.env.EPS_DEBUG === '1') {
    console.log(`--- salida cruda de ${name} (status ${result.status}) ---`)
    console.log(output.slice(0, 2000))
    console.log('--- fin ---')
  }

  // Dividir por /\r?\n/ y no por '\n': en Windows psql termina las lineas con
  // CRLF, y en una expresion regular de JavaScript \r es un terminador de
  // linea, asi que ni «.» lo cruza ni «$» casa delante de el. Con split('\n')
  // el \r sobrante hacia que no casara ni una sola comprobacion, y el
  // verificador terminaba diciendo «0 comprobaciones superadas» como si todo
  // hubiera ido bien.
  for (const line of output.split(/\r?\n/)) {
    const ok = line.match(/(?:NOTICE|NOTA|AVISO):\s+(OK\s+.*)$/)
    if (ok !== null) {
      console.log(`  ${ok[1].trim()}`)
      passed += 1
    }
  }

  if (result.status !== 0) {
    failed += 1
    const error = output.split('\n').find((line) => line.includes('ERROR:'))
    console.error(`  FALLO en ${name}: ${error?.trim() ?? 'error desconocido'}`)
  }
}

if (failed > 0) {
  console.error(`\nEsquema de Supabase NO verificado: ${failed} archivo(s) de prueba con fallos.`)
  process.exit(1)
}

console.log(`\nEsquema de Supabase verificado: ${passed} comprobaciones superadas.`)
