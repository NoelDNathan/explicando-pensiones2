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
 * Calculadora fiscal: ahi no hay linea base. Su CSS se escribe solo con
 * var(--fiscal-*) (tokens en FiscalSoftTheme.css) y cualquier color a mano,
 * token de otra paleta o regla `.fwd--soft` fuera del archivo de tokens hace
 * fallar la comprobacion. Ver checkCalculator() mas abajo.
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

/*
 * CSS de la calculadora fiscal. Todo lo que se pinta dentro de `.fwd` vive aqui.
 * ProgressiveIrpfExplainer, SocialSecurityBasesExplainer, FiscalKpiRow y
 * FiscalPersonalDataCard no se usan en la calculadora (son piezas oscuras del
 * laboratorio y de rutas internas) y siguen con la linea base.
 */
const CALCULATOR_THEME = 'src/components/fiscal-worker-dashboard/FiscalSoftTheme.css'
const isCalculatorCss = (repoPath) =>
  repoPath.startsWith('src/components/worker-salary-dashboard/') ||
  repoPath === 'src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css' ||
  repoPath === 'src/components/fiscal-worker-dashboard/FiscalEscenario.css' ||
  repoPath === 'src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.css'
const isCalculatorScript = (repoPath) =>
  /^src\/components\/(worker-salary-dashboard|fiscal-worker-dashboard)\/(?:escenario\/)?[^/]+\.tsx?$/.test(repoPath)
// Scripts que dibujan en <canvas> o componentes sin uso: no pueden leer var().
const SCRIPT_EXCEPTIONS = new Set([
  'src/components/fiscal-worker-dashboard/shareResultsImage.ts',
  'src/components/fiscal-worker-dashboard/Donut.tsx',
  'src/components/fiscal-worker-dashboard/FiscalLineChart.tsx',
])

function listFiles(dir, test) {
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...listFiles(full, test))
    else if (test(entry)) found.push(full)
  }
  return found
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length
}

function checkCalculator() {
  const errores = []
  for (const file of listCssFiles(srcDir)) {
    const repoPath = toRepoPath(file)
    const raw = readFileSync(file, 'utf8')
    const text = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    if (repoPath === CALCULATOR_THEME) {
      // Literales solo dentro del bloque de tokens `.fwd--soft { ... }`.
      const tokenBlock = text.match(/^\.fwd--soft\s*\{[^}]*\}/m)
      const start = tokenBlock ? tokenBlock.index : -1
      const end = tokenBlock ? start + tokenBlock[0].length : -1
      for (const m of text.matchAll(COLOR_PATTERN)) {
        if (m.index >= start && m.index < end) continue
        errores.push(`${repoPath}:${lineOf(text, m.index)}  color ${m[0]} fuera del bloque de tokens`)
      }
      continue
    }
    if (!isCalculatorCss(repoPath)) continue
    for (const m of text.matchAll(COLOR_PATTERN)) {
      errores.push(`${repoPath}:${lineOf(text, m.index)}  color escrito a mano: ${m[0]}`)
    }
    for (const m of text.matchAll(/var\(--(color-[\w-]+|fwd-[\w-]+|bg|surface|text|muted|heading|border|accent[\w-]*)\)/g)) {
      errores.push(`${repoPath}:${lineOf(text, m.index)}  token de otra paleta: ${m[0]} (usa var(--fiscal-*))`)
    }
    for (const m of text.matchAll(/[:,\s](white|black|red|blue|green|gray|grey|orange|purple|yellow|pink|navy|teal|silver)\s*[;,)!]/gi)) {
      // En una mascara el negro solo marca opacidad: no es un color que se vea.
      const linea = text.split('\n')[lineOf(text, m.index) - 1]
      if (/mask/.test(linea)) continue
      errores.push(`${repoPath}:${lineOf(text, m.index)}  color con nombre: ${m[1]}`)
    }
    for (const m of text.matchAll(/\.fwd--soft\b/g)) {
      errores.push(`${repoPath}:${lineOf(text, m.index)}  regla .fwd--soft: el componente debe usar los tokens directamente, no repintarse por encima`)
    }
  }
  for (const file of listFiles(srcDir, (f) => /\.tsx?$/.test(f))) {
    const repoPath = toRepoPath(file)
    if (!isCalculatorScript(repoPath) || SCRIPT_EXCEPTIONS.has(repoPath)) continue
    const text = readFileSync(file, 'utf8')
    for (const m of text.matchAll(/(["'`])(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))\1/g)) {
      errores.push(`${repoPath}:${lineOf(text, m.index)}  color escrito a mano en el componente: ${m[2]} (usa "var(--fiscal-*)" en style)`)
    }
    for (const m of text.matchAll(/\b(?:bg|text|border|fill|stroke|from|to|via|ring)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black|surface-deep|text-inverted)[\w/-]*/g)) {
      errores.push(`${repoPath}:${lineOf(text, m.index)}  clase de color de Tailwind: ${m[0]} (la calculadora usa var(--fiscal-*))`)
    }
  }
  return errores
}

const erroresCalculadora = checkCalculator()

const actual = {}
for (const file of listCssFiles(srcDir)) {
  const repoPath = toRepoPath(file)
  if (TOKEN_FILES.has(repoPath) || isCalculatorCss(repoPath)) continue
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

if (erroresCalculadora.length > 0) {
  console.error('\nCalculadora fiscal: estilos fuera de los tokens --fiscal-*\n')
  for (const e of erroresCalculadora.slice(0, 60)) console.error('  ' + e)
  if (erroresCalculadora.length > 60) console.error(`  ... y ${erroresCalculadora.length - 60} mas`)
  console.error('\nLos colores de la calculadora se toman de FiscalSoftTheme.css. Si falta uno, anyade el token alli.')
  console.error('Esta regla no tiene linea base: --write no la silencia.')
  process.exit(1)
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
