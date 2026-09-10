/*
 * Vigila que los estilos nuevos usen los tokens de disenyo.
 *
 * Por que existe: la regla 1 de AGENTS.md pide usar los colores definidos como
 * tokens antes de introducir valores nuevos, y la regla 7 pide comprobar cada
 * cambio visual en pantalla. Las dos se pueden incumplir sin que nada avise, y
 * el resultado tipico es una pieza que se ve bien en el editor y en la web
 * aparece con la paleta equivocada: un recuadro azul marino sobre una pagina
 * clara, o texto oscuro sobre fondo oscuro.
 *
 * Como funciona: NO prohibe los colores literales, porque el repo ya tiene mas
 * de dos mil y reescribirlos seria otro proyecto. Lo que hace es fijar una
 * linea base por archivo y fallar cuando esa cuenta SUBE o cuando aparece un
 * archivo CSS nuevo con colores literales. Es decir, vigila lo que se escribe a
 * partir de ahora, sin obligar a arreglar el pasado.
 *
 * Uso:
 *   node scripts/verify-styles.mjs           comprueba
 *   node scripts/verify-styles.mjs --write   regenera la linea base
 *
 * Bajar un numero es siempre bienvenido (se regenera con --write). Subirlo hay
 * que justificarlo: si un color de verdad no existe como token, lo correcto casi
 * siempre es anyadir el token, no el literal.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')
const srcDir = join(repoRoot, 'src')
const baselinePath = join(here, 'styles-baseline.json')

/*
 * Archivos donde los colores literales SI son correctos: es donde se definen
 * los tokens. Todo lo demas deberia consumirlos con var().
 */
const TOKEN_FILES = new Set([
  'src/index.css',
  'src/components/fiscal-worker-dashboard/FiscalSoftTheme.css',
])

const COLOR_PATTERN = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g

function listCssFiles(dir) {
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      found.push(...listCssFiles(full))
    } else if (entry.endsWith('.css')) {
      found.push(full)
    }
  }
  return found
}

function toRepoPath(fullPath) {
  return relative(repoRoot, fullPath).split(sep).join('/')
}

function countLiterals(fullPath) {
  const contents = readFileSync(fullPath, 'utf8')
  // Los comentarios no pintan nada: no deberian contar como infraccion.
  const withoutComments = contents.replace(/\/\*[\s\S]*?\*\//g, '')
  return (withoutComments.match(COLOR_PATTERN) ?? []).length
}

const actual = {}
for (const file of listCssFiles(srcDir)) {
  const repoPath = toRepoPath(file)
  if (TOKEN_FILES.has(repoPath)) continue
  const count = countLiterals(file)
  if (count > 0) actual[repoPath] = count
}

if (process.argv.includes('--write')) {
  const ordenado = Object.fromEntries(Object.entries(actual).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(baselinePath, `${JSON.stringify(ordenado, null, 2)}\n`, 'utf8')
  const total = Object.values(ordenado).reduce((suma, n) => suma + n, 0)
  console.log(`Linea base regenerada: ${Object.keys(ordenado).length} archivos, ${total} colores literales.`)
  process.exit(0)
}

if (!existsSync(baselinePath)) {
  console.error('No hay linea base. Generala con: node scripts/verify-styles.mjs --write')
  process.exit(1)
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))

const nuevos = []
const empeorados = []
const mejorados = []

for (const [file, count] of Object.entries(actual)) {
  const previo = baseline[file]
  if (previo === undefined) {
    nuevos.push({ file, count })
  } else if (count > previo) {
    empeorados.push({ file, previo, count })
  } else if (count < previo) {
    mejorados.push({ file, previo, count })
  }
}

for (const { file, previo, count } of mejorados) {
  console.log(`  mejora  ${file}: ${previo} -> ${count}`)
}

if (nuevos.length === 0 && empeorados.length === 0) {
  const total = Object.values(actual).reduce((suma, n) => suma + n, 0)
  console.log(`\nEstilos verificados: ningun color literal nuevo (${total} heredados en ${Object.keys(actual).length} archivos).`)
  if (mejorados.length > 0) {
    console.log('Hay mejoras sin registrar: ejecuta `pnpm verify:styles --write` para bajar la linea base.')
  }
  process.exit(0)
}

console.error('\nEstilos NO verificados.\n')

if (nuevos.length > 0) {
  console.error('Archivos CSS nuevos con colores literales:')
  for (const { file, count } of nuevos) {
    console.error(`  ${file}: ${count} colores escritos a mano`)
  }
  console.error('')
}

if (empeorados.length > 0) {
  console.error('Archivos con mas colores literales que antes:')
  for (const { file, previo, count } of empeorados) {
    console.error(`  ${file}: ${previo} -> ${count}`)
  }
  console.error('')
}

console.error('Usa los tokens en lugar de escribir el color a mano:')
console.error('  - Paginas del sitio: los de `:root` en src/index.css')
console.error('    (--bg, --surface, --text, --muted, --heading, --border, --accent...)')
console.error('  - Dentro de la calculadora fiscal: los de FiscalSoftTheme.css')
console.error('    (--fiscal-surface, --fiscal-ink, --fiscal-copy, --fiscal-line, --fiscal-primary...)')
console.error('')
console.error('Si el color no existe como token, casi siempre lo correcto es anyadir el token.')
console.error('Si aun asi el literal esta justificado: node scripts/verify-styles.mjs --write')
process.exit(1)
