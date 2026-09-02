// Verifica la trazabilidad de data/: integridad de los archivos, cobertura de
// las fichas de metadata y ausencia de reescrituras de finales de linea.
//
//   node scripts/verify-data-traceability.mjs           comprueba y sale con 1 si hay errores
//   node scripts/verify-data-traceability.mjs --write   regenera data/checksums.sha256
//
// Reglas que aplica, tomadas de data/README.md:
// - todo archivo de data/raw y data/processed tiene un SHA-256 registrado y valido;
// - data/checksums.sha256 no tiene entradas huerfanas;
// - los archivos de texto se guardan con finales de linea LF (ver .gitattributes),
//   porque core.autocrlf reescribe los bytes al hacer checkout y rompe los hashes;
// - todo dataset de data/processed tiene ficha en data/metadata.md;
// - toda carpeta de data/raw esta registrada en data/sources.md (aviso, no error);
// - todo dataset de data/processed aparece en data/inventory.md (aviso, no error).

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'data')
const checksumsFile = path.join(dataDir, 'checksums.sha256')
const write = process.argv.includes('--write')

const CRLF = String.fromCharCode(13, 10)
const LF = String.fromCharCode(10)
const BACKSLASH = String.fromCharCode(92)
const TEXT_EXTENSIONS = new Set(['.csv', '.json', '.html', '.md', '.txt'])

const errors = []
const warnings = []

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else acc.push(full)
  }
  return acc
}

const toPosix = (absolute) => path.relative(root, absolute).split(path.sep).join('/')
const toRecord = (posix) => posix.split('/').join(BACKSLASH)
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex')

const trackedFiles = [
  ...walk(path.join(dataDir, 'processed')),
  ...walk(path.join(dataDir, 'raw')),
]
  .map(toPosix)
  .sort()

// 1. Finales de linea: los archivos de texto se hashean en LF.
const withCrlf = []
for (const file of trackedFiles) {
  if (!TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())) continue
  const content = fs.readFileSync(path.join(root, file)).toString('binary')
  if (content.includes(CRLF)) withCrlf.push(file)
}
if (withCrlf.length > 0) {
  errors.push(
    `${withCrlf.length} archivos de datos tienen finales de linea CRLF y sus hashes no son reproducibles:\n` +
      withCrlf.map((file) => `    ${file}`).join('\n') +
      '\n    Revisa .gitattributes y vuelve a guardarlos en LF.',
  )
}

// 2. Checksums: presentes, validos y sin huerfanos.
if (write) {
  const lines = trackedFiles.map((file) => {
    const hash = sha256(fs.readFileSync(path.join(root, file)))
    return `${hash}  ${toRecord(file)}`
  })
  fs.writeFileSync(checksumsFile, lines.join(LF) + LF)
  console.log(`data/checksums.sha256 regenerado con ${lines.length} entradas.`)
}

const recorded = new Map()
for (const line of fs.readFileSync(checksumsFile, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([0-9a-f]{64})\s+(.+)$/)
  if (match) recorded.set(match[2].split(BACKSLASH).join('/'), match[1])
}

const missingChecksum = []
const wrongChecksum = []
for (const file of trackedFiles) {
  if (!recorded.has(file)) {
    missingChecksum.push(file)
    continue
  }
  if (recorded.get(file) !== sha256(fs.readFileSync(path.join(root, file)))) wrongChecksum.push(file)
}
const orphanChecksum = [...recorded.keys()].filter((file) => !fs.existsSync(path.join(root, file)))

if (missingChecksum.length > 0) {
  errors.push(
    `${missingChecksum.length} archivos sin SHA-256 registrado:\n` +
      missingChecksum.map((file) => `    ${file}`).join('\n'),
  )
}
if (wrongChecksum.length > 0) {
  errors.push(
    `${wrongChecksum.length} archivos cuyo SHA-256 no coincide con data/checksums.sha256:\n` +
      wrongChecksum.map((file) => `    ${file}`).join('\n'),
  )
}
if (orphanChecksum.length > 0) {
  errors.push(
    `${orphanChecksum.length} entradas de data/checksums.sha256 apuntan a archivos que ya no existen:\n` +
      orphanChecksum.map((file) => `    ${file}`).join('\n'),
  )
}

// 3. Cobertura documental.
const metadata = fs.readFileSync(path.join(dataDir, 'metadata.md'), 'utf8')
const sources = fs.readFileSync(path.join(dataDir, 'sources.md'), 'utf8')
const inventory = fs.readFileSync(path.join(dataDir, 'inventory.md'), 'utf8')

const processedFiles = trackedFiles.filter((file) => file.startsWith('data/processed/'))
const notInMetadata = processedFiles.filter((file) => !metadata.includes(path.basename(file)))
const notInInventory = processedFiles.filter((file) => !inventory.includes(path.basename(file)))

if (notInMetadata.length > 0) {
  errors.push(
    `${notInMetadata.length} datasets de data/processed sin ficha en data/metadata.md:\n` +
      notInMetadata.map((file) => `    ${file}`).join('\n'),
  )
}
if (notInInventory.length > 0) {
  warnings.push(
    `${notInInventory.length} datasets de data/processed no aparecen en data/inventory.md ` +
      '(correcto si son pasos intermedios de una serie ya inventariada):\n' +
      notInInventory.map((file) => `    ${file}`).join('\n'),
  )
}

// data/sources.md documenta grupos de fuentes, no archivo a archivo: basta con que
// cada carpeta de data/raw tenga al menos un archivo citado.
const rawFolders = new Map()
for (const file of trackedFiles) {
  if (!file.startsWith('data/raw/')) continue
  const folder = path.posix.dirname(file)
  if (!rawFolders.has(folder)) rawFolders.set(folder, [])
  rawFolders.get(folder).push(file)
}
const uncitedFolders = [...rawFolders.entries()]
  .filter(([, files]) => !files.some((file) => sources.includes(path.basename(file))))
  .map(([folder]) => folder)

if (uncitedFolders.length > 0) {
  warnings.push(
    `${uncitedFolders.length} carpetas de data/raw sin ningun archivo citado en data/sources.md:\n` +
      uncitedFolders.map((folder) => `    ${folder}`).join('\n'),
  )
}

// 4. Resultado.
for (const warning of warnings) console.warn(`AVISO: ${warning}`)
for (const error of errors) console.error(`ERROR: ${error}`)

const checks = trackedFiles.length + processedFiles.length + rawFolders.size
if (errors.length > 0) {
  console.error(`\nTrazabilidad de datos: ${errors.length} errores sobre ${checks} comprobaciones.`)
  process.exit(1)
}
console.log(
  `Trazabilidad de datos verificada: ${checks} comprobaciones superadas ` +
    `(${trackedFiles.length} archivos, ${processedFiles.length} datasets procesados, ${rawFolders.size} carpetas de brutos)` +
    `${warnings.length > 0 ? `, ${warnings.length} avisos` : ''}.`,
)
