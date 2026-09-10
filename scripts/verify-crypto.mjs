/*
 * Comprueba la boveda de claves.
 *
 * Lo que se verifica aqui no es «el codigo corre», sino las propiedades de las
 * que depende la promesa del aviso de privacidad:
 *
 * - Una frase incorrecta NO abre el sobre.
 * - Cambiar la frase no obliga a recifrar nada.
 * - Un blob manipulado falla, aunque sea un solo bit.
 * - Un blob no se puede mover de una fila a otra (los AAD lo atan).
 * - El texto plano no aparece en ninguna parte del cifrado.
 *
 * Se usa el perfil Argon2id reducido en casi todas las pruebas: con 64 MiB y
 * tres pasadas, cada derivacion tarda cerca de un segundo y el conjunto se haria
 * insoportable. El perfil completo se prueba una vez, aparte.
 */

import assert from 'node:assert/strict'
import {
  ARGON2_FULL,
  ARGON2_REDUCED,
  PBKDF2_ITERATIONS,
  deriveBestEffort,
  deriveKeyBytes,
  isWeakKdf,
  newSalt,
  normalizePassphrase,
} from '../src/lib/supabase/crypto/kdf.ts'
import {
  fromPgBytea,
  generateDek,
  toPgBytea,
  unwrapDek,
  wrapDek,
  WRAPPED_DEK_BYTES,
} from '../src/lib/supabase/crypto/envelope.ts'
import {
  contentTag,
  decryptFromBlob,
  encryptToBlob,
} from '../src/lib/supabase/crypto/blob.ts'
import {
  checkConfirmation,
  formatRecoveryCode,
  generateRecoveryCode,
  isValidRecoveryCode,
  normalizeRecoveryCode,
  pickConfirmationPositions,
  RECOVERY_CODE_LENGTH,
} from '../src/lib/supabase/crypto/recoveryCode.ts'

let checks = 0
async function check(label, fn) {
  await fn()
  checks += 1
  console.log(`  OK  ${label}`)
}

const rapido = (salt) => ({
  kdf: 'argon2id',
  salt,
  iterations: ARGON2_REDUCED.iterations,
  memoryKiB: ARGON2_REDUCED.memoryKiB,
  parallelism: ARGON2_REDUCED.parallelism,
})

const USER = '11111111-1111-4111-8111-111111111111'
const DEK_ID = '22222222-2222-4222-8222-222222222222'
const SCENARIO = '33333333-3333-4333-8333-333333333333'
const FRASE = 'caballo grapa batería correcto'

const contexto = { userId: USER, scenarioId: SCENARIO, dekId: DEK_ID, schemaVersion: 1 }

// --- Derivacion --------------------------------------------------------------

await check('la misma frase y sal dan siempre la misma clave', async () => {
  const salt = newSalt()
  const a = await deriveKeyBytes(FRASE, rapido(salt))
  const b = await deriveKeyBytes(FRASE, rapido(salt))
  assert.deepEqual([...a], [...b])
  assert.equal(a.length, 32)
})

await check('sales distintas dan claves distintas', async () => {
  const a = await deriveKeyBytes(FRASE, rapido(newSalt()))
  const b = await deriveKeyBytes(FRASE, rapido(newSalt()))
  assert.notDeepEqual([...a], [...b])
})

await check('la frase se normaliza: acentos compuestos y sueltos coinciden', async () => {
  const salt = newSalt()
  // "batería" con e+acento combinado frente a e-acute precompuesta.
  const compuesta = 'caballo grapa batería correcto'
  const precompuesta = 'caballo grapa batería correcto'
  assert.notEqual(compuesta, precompuesta)
  assert.equal(normalizePassphrase(compuesta), normalizePassphrase(precompuesta))

  const a = await deriveKeyBytes(compuesta, rapido(salt))
  const b = await deriveKeyBytes(precompuesta, rapido(salt))
  assert.deepEqual([...a], [...b])
})

await check('los espacios de los extremos no cambian la clave', async () => {
  const salt = newSalt()
  const a = await deriveKeyBytes(FRASE, rapido(salt))
  const b = await deriveKeyBytes(`  ${FRASE}  `, rapido(salt))
  assert.deepEqual([...a], [...b])
})

await check('los espacios interiores SI forman parte de la frase', async () => {
  const salt = newSalt()
  const a = await deriveKeyBytes('dos palabras', rapido(salt))
  const b = await deriveKeyBytes('dos  palabras', rapido(salt))
  assert.notDeepEqual([...a], [...b])
})

await check('PBKDF2 sigue disponible como plan B', async () => {
  const params = {
    kdf: 'pbkdf2-sha256',
    salt: newSalt(),
    iterations: 1000, // rebajado solo para que la prueba no tarde
    memoryKiB: null,
    parallelism: null,
  }
  const clave = await deriveKeyBytes(FRASE, params)
  assert.equal(clave.length, 32)
  assert.equal(isWeakKdf(params), true)
  assert.equal(isWeakKdf({ kdf: 'argon2id' }), false)
  assert.equal(PBKDF2_ITERATIONS, 600000)
})

await check('deriveBestEffort elige Argon2id y devuelve sus parametros', async () => {
  const { key, params } = await deriveBestEffort(FRASE, newSalt())
  assert.equal(key.length, 32)
  assert.equal(params.kdf, 'argon2id')
  assert.equal(params.memoryKiB, ARGON2_FULL.memoryKiB)
  assert.equal(params.iterations, ARGON2_FULL.iterations)
})

// --- El sobre ----------------------------------------------------------------

await check('la DEK se envuelve y se recupera igual', async () => {
  const dek = generateDek()
  const sobre = await wrapDek(dek, FRASE, rapido(newSalt()), USER, DEK_ID, 'passphrase')

  assert.equal(sobre.wrappedDek.length, WRAPPED_DEK_BYTES)
  assert.equal(sobre.iv.length, 12)

  const recuperada = await unwrapDek(sobre, FRASE, USER, DEK_ID, 'passphrase')
  assert.deepEqual([...recuperada], [...dek])
})

await check('una frase incorrecta NO abre el sobre', async () => {
  const dek = generateDek()
  const sobre = await wrapDek(dek, FRASE, rapido(newSalt()), USER, DEK_ID, 'passphrase')

  await assert.rejects(() => unwrapDek(sobre, 'caballo grapa bateria incorrecto', USER, DEK_ID, 'passphrase'))
})

await check('el sobre esta atado a su usuario, su DEK y su proposito', async () => {
  const dek = generateDek()
  const sobre = await wrapDek(dek, FRASE, rapido(newSalt()), USER, DEK_ID, 'passphrase')

  // Otro usuario, misma frase: no abre.
  await assert.rejects(() => unwrapDek(sobre, FRASE, 'otro-usuario', DEK_ID, 'passphrase'))
  // Otra DEK: no abre.
  await assert.rejects(() => unwrapDek(sobre, FRASE, USER, 'otra-dek', 'passphrase'))
  // Movido al hueco del codigo de rescate: no abre.
  await assert.rejects(() => unwrapDek(sobre, FRASE, USER, DEK_ID, 'recovery_code'))
})

await check('la DEK no aparece en claro dentro del sobre', async () => {
  const dek = generateDek()
  const sobre = await wrapDek(dek, FRASE, rapido(newSalt()), USER, DEK_ID, 'passphrase')

  const envuelto = [...sobre.wrappedDek].join(',')
  const cruda = [...dek].join(',')
  assert.ok(!envuelto.includes(cruda), 'los bytes de la DEK no deberian verse en el sobre')
})

await check('cambiar la frase NO obliga a recifrar los escenarios', async () => {
  const dek = generateDek()
  const sobreViejo = await wrapDek(dek, FRASE, rapido(newSalt()), USER, DEK_ID, 'passphrase')

  const blob = await encryptToBlob('{"salario":42000}', dek, contexto, 'payload')

  // Cambio de frase: nueva sal, nuevo sobre, LA MISMA DEK.
  const sobreNuevo = await wrapDek(dek, 'otra frase distinta del todo', rapido(newSalt()), USER, DEK_ID, 'passphrase')
  assert.notDeepEqual([...sobreViejo.wrappedDek], [...sobreNuevo.wrappedDek])

  const dekTrasCambio = await unwrapDek(sobreNuevo, 'otra frase distinta del todo', USER, DEK_ID, 'passphrase')
  assert.deepEqual([...dekTrasCambio], [...dek])

  // Y el escenario cifrado antes sigue abriendo.
  assert.equal(await decryptFromBlob(blob, dekTrasCambio, contexto, 'payload'), '{"salario":42000}')
})

await check('la misma DEK se envuelve con frase y con codigo de rescate', async () => {
  const dek = generateDek()
  const codigo = generateRecoveryCode()

  const conFrase = await wrapDek(dek, FRASE, rapido(newSalt()), USER, DEK_ID, 'passphrase')
  const conCodigo = await wrapDek(dek, codigo, rapido(newSalt()), USER, DEK_ID, 'recovery_code')

  assert.deepEqual([...(await unwrapDek(conFrase, FRASE, USER, DEK_ID, 'passphrase'))], [...dek])
  assert.deepEqual([...(await unwrapDek(conCodigo, codigo, USER, DEK_ID, 'recovery_code'))], [...dek])
})

// --- El blob -----------------------------------------------------------------

const dekFija = generateDek()

await check('un escenario se cifra y se recupera igual', async () => {
  const texto = JSON.stringify({ salario: 42000, region: 'cataluna', hijos: 2 })
  const blob = await encryptToBlob(texto, dekFija, contexto, 'payload')
  assert.equal(await decryptFromBlob(blob, dekFija, contexto, 'payload'), texto)
})

await check('el blob empieza por la cabecera EPS1', async () => {
  const blob = await encryptToBlob('hola', dekFija, contexto, 'payload')
  assert.deepEqual([...blob.slice(0, 4)], [0x45, 0x50, 0x53, 0x31])
  assert.equal(blob[4], 1, 'version de formato')
  assert.equal(blob[5], 1, 'suite')
})

await check('el texto plano no aparece en el blob', async () => {
  const texto = JSON.stringify({ salario: 42000, region: 'cataluna' })
  const blob = await encryptToBlob(texto, dekFija, contexto, 'payload')
  const comoTexto = new TextDecoder('latin1').decode(blob)

  assert.ok(!comoTexto.includes('42000'), 'el salario no puede verse en el blob')
  assert.ok(!comoTexto.includes('cataluna'), 'la comunidad no puede verse en el blob')
  assert.ok(!comoTexto.includes('salario'), 'ni los nombres de campo')
})

await check('comprimir antes de cifrar reduce el tamanyo de verdad', async () => {
  const escenario = JSON.stringify({ ajustes: Object.fromEntries(
    Array.from({ length: 80 }, (_, i) => [`campoNumeroLargo${i}`, 0]),
  ) })
  const blob = await encryptToBlob(escenario, dekFija, contexto, 'payload')

  assert.ok(blob.length < escenario.length / 2,
    `el blob (${blob.length} B) deberia bajar de la mitad del JSON (${escenario.length} B)`)
})

await check('cambiar un solo bit del blob lo invalida', async () => {
  const blob = await encryptToBlob('{"salario":42000}', dekFija, contexto, 'payload')
  const tocado = new Uint8Array(blob)
  tocado[tocado.length - 5] ^= 0x01

  await assert.rejects(() => decryptFromBlob(tocado, dekFija, contexto, 'payload'))
})

await check('un blob no se puede mover a otra fila', async () => {
  const blob = await encryptToBlob('{"salario":42000}', dekFija, contexto, 'payload')

  await assert.rejects(() => decryptFromBlob(blob, dekFija, { ...contexto, scenarioId: 'otro-escenario' }, 'payload'))
  await assert.rejects(() => decryptFromBlob(blob, dekFija, { ...contexto, userId: 'otro-usuario' }, 'payload'))
  await assert.rejects(() => decryptFromBlob(blob, dekFija, { ...contexto, schemaVersion: 2 }, 'payload'))
})

await check('el payload y la etiqueta usan claves distintas', async () => {
  const blob = await encryptToBlob('Mi sueldo real', dekFija, contexto, 'label')
  // Cifrado como etiqueta, no debe abrir como payload.
  await assert.rejects(() => decryptFromBlob(blob, dekFija, contexto, 'payload'))
  assert.equal(await decryptFromBlob(blob, dekFija, contexto, 'label'), 'Mi sueldo real')
})

await check('otra DEK no abre el blob', async () => {
  const blob = await encryptToBlob('{"salario":42000}', dekFija, contexto, 'payload')
  await assert.rejects(() => decryptFromBlob(blob, generateDek(), contexto, 'payload'))
})

await check('un blob que no es EPS1 se rechaza con un mensaje claro', async () => {
  const basura = new Uint8Array(40)
  await assert.rejects(
    () => decryptFromBlob(basura, dekFija, contexto, 'payload'),
    /EPS1/,
  )
  await assert.rejects(
    () => decryptFromBlob(new Uint8Array(4), dekFija, contexto, 'payload'),
    /corto/,
  )
})

await check('la marca de contenido depende de la clave, no solo del texto', async () => {
  const texto = '{"salario":42000}'
  const tagA = await contentTag(texto, dekFija, SCENARIO)
  const tagB = await contentTag(texto, generateDek(), SCENARIO)

  assert.equal(tagA.length, 32)
  assert.notDeepEqual([...tagA], [...tagB], 'con otra DEK la marca tiene que cambiar')

  // Y es estable para el mismo texto y la misma clave.
  assert.deepEqual([...(await contentTag(texto, dekFija, SCENARIO))], [...tagA])
  // Y distinta si cambia el texto.
  assert.notDeepEqual([...(await contentTag('{"salario":42001}', dekFija, SCENARIO))], [...tagA])
})

// --- bytea -------------------------------------------------------------------

await check('la conversion a bytea de Postgres va y vuelve', async () => {
  const bytes = new Uint8Array([0, 1, 15, 16, 254, 255])
  const texto = toPgBytea(bytes)

  assert.equal(texto, '\\x00010f10feff')
  assert.deepEqual([...fromPgBytea(texto)], [...bytes])
  assert.deepEqual([...fromPgBytea('00010f10feff')], [...bytes])
})

// --- Codigo de rescate -------------------------------------------------------

await check('el codigo de rescate tiene la forma esperada', async () => {
  const codigo = generateRecoveryCode()

  assert.equal(codigo.length, RECOVERY_CODE_LENGTH)
  assert.ok(/^[ABCDEFGHJKMNPQRSTVWXYZ23456789]+$/.test(codigo), `alfabeto inesperado: ${codigo}`)
  assert.ok(!/[ILOU01]/.test(codigo), 'no deberia llevar caracteres que se confunden')
  assert.equal(formatRecoveryCode(codigo), codigo.match(/.{4}/g).join('-'))
  assert.equal(isValidRecoveryCode(formatRecoveryCode(codigo)), true)
})

await check('dos codigos seguidos no se repiten', async () => {
  const vistos = new Set(Array.from({ length: 200 }, () => generateRecoveryCode()))
  assert.equal(vistos.size, 200)
})

await check('al transcribir, O vale por 0 y I o L por 1', async () => {
  assert.equal(normalizeRecoveryCode('abcd-efgh'), 'ABCDEFGH')
  assert.equal(normalizeRecoveryCode('O0Il1'), '00111')
  assert.equal(normalizeRecoveryCode(' a b c '), 'ABC')
})

await check('la confirmacion obliga a mirar el codigo', async () => {
  const codigo = generateRecoveryCode()
  const posiciones = pickConfirmationPositions()
  const correctas = posiciones.map((p) => codigo[p])

  assert.equal(posiciones.length, 4)
  assert.equal(new Set(posiciones).size, 4, 'las posiciones no deberian repetirse')
  assert.equal(checkConfirmation(codigo, posiciones, correctas), true)
  assert.equal(checkConfirmation(codigo, posiciones, ['X', 'X', 'X', 'X']), false)
  assert.equal(checkConfirmation(codigo, posiciones, correctas.slice(0, 3)), false)
})

// --- Perfil completo, una sola vez ------------------------------------------

await check('el perfil Argon2id de 64 MiB funciona y es notablemente mas lento', async () => {
  const salt = newSalt()

  const t0 = performance.now()
  await deriveKeyBytes(FRASE, {
    kdf: 'argon2id',
    salt,
    iterations: ARGON2_FULL.iterations,
    memoryKiB: ARGON2_FULL.memoryKiB,
    parallelism: ARGON2_FULL.parallelism,
  })
  const completo = performance.now() - t0

  const t1 = performance.now()
  await deriveKeyBytes(FRASE, rapido(salt))
  const reducido = performance.now() - t1

  assert.ok(completo > reducido,
    `el perfil completo (${completo.toFixed(0)} ms) deberia costar mas que el reducido (${reducido.toFixed(0)} ms)`)
  console.log(`      64 MiB: ${completo.toFixed(0)} ms · 19 MiB: ${reducido.toFixed(0)} ms`)
})

console.log(`\nBoveda de claves verificada: ${checks} comprobaciones superadas.`)
