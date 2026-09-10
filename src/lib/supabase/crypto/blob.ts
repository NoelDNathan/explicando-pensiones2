/*
 * Formato EPS1: como viaja un escenario cifrado.
 *
 *   offset  bytes  contenido
 *   0       4      magic "EPS1"
 *   4       1      version del formato
 *   5       1      suite (1 = HKDF-SHA256 + AES-256-GCM + gzip)
 *   6       12     IV aleatorio
 *   18      n      ciphertext || tag GCM (16 B)
 *
 * Por que HKDF por escenario en lugar de usar la DEK directamente: AES-GCM con
 * IV aleatorio de 96 bits empieza a incomodar a partir de ~2^32 mensajes bajo la
 * misma clave. Aqui no se llegara nunca, pero HKDF cuesta una llamada y elimina
 * la clase de problema entera, ademas de dar claves separadas para el contenido,
 * la etiqueta y el tag de comparacion.
 *
 * Por que se comprime antes de cifrar: el JSON de un escenario ronda 4-8 KB y
 * baja a ~1 KB. La objecion clasica (CRIME/BREACH) no aplica: requiere que el
 * atacante inyecte texto elegido en el mismo blob que el secreto y observe el
 * tamanyo muchas veces, y aqui el blob es un documento propio que se sube entero.
 */

const MAGIC = new Uint8Array([0x45, 0x50, 0x53, 0x31]) // "EPS1"
const FORMAT_VERSION = 1
const SUITE_HKDF_AESGCM_GZIP = 1
const IV_BYTES = 12
const HEADER_BYTES = 6
export const MIN_BLOB_BYTES = HEADER_BYTES + IV_BYTES

export type BlobField = 'payload' | 'label'

export type BlobContext = {
  userId: string
  scenarioId: string
  dekId: string
  schemaVersion: number
}

/**
 * Ata cada blob a su fila.
 *
 * Sin esto, quien pudiera escribir en la base podria intercambiar el payload del
 * escenario A por el del B, o reinyectar una version antigua: el descifrado
 * funcionaria porque la clave es la misma. Con AAD, el tag falla.
 */
function blobAad(context: BlobContext, field: BlobField): Uint8Array {
  return new TextEncoder().encode(
    `eps1|${context.userId}|${context.scenarioId}|${context.dekId}|${context.schemaVersion}|${field}`,
  )
}

async function importHkdfKey(dek: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', dek as unknown as BufferSource, 'HKDF', false, ['deriveKey', 'deriveBits'])
}

async function deriveAesKey(
  hkdfKey: CryptoKey,
  scenarioId: string,
  info: string,
  usages: KeyUsage[],
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new TextEncoder().encode(scenarioId) as unknown as BufferSource,
      info: new TextEncoder().encode(info) as unknown as BufferSource,
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    usages,
  )
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as unknown as BlobPart]).stream().pipeThrough(new CompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as unknown as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** Cifra un texto (el JSON del escenario, o su nombre) al formato EPS1. */
export async function encryptToBlob(
  plaintext: string,
  dek: Uint8Array,
  context: BlobContext,
  field: BlobField,
): Promise<Uint8Array> {
  const hkdfKey = await importHkdfKey(dek)
  const aesKey = await deriveAesKey(hkdfKey, context.scenarioId, `eps1-${field}`, ['encrypt'])

  const comprimido = await gzip(new TextEncoder().encode(plaintext))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))

  const cifrado = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource, additionalData: blobAad(context, field) as unknown as BufferSource },
      aesKey,
      comprimido as unknown as BufferSource,
    ),
  )

  const blob = new Uint8Array(HEADER_BYTES + IV_BYTES + cifrado.length)
  blob.set(MAGIC, 0)
  blob[4] = FORMAT_VERSION
  blob[5] = SUITE_HKDF_AESGCM_GZIP
  blob.set(iv, HEADER_BYTES)
  blob.set(cifrado, HEADER_BYTES + IV_BYTES)
  return blob
}

/** Descifra un blob EPS1. Lanza si la clave no es, o si algo se ha tocado. */
export async function decryptFromBlob(
  blob: Uint8Array,
  dek: Uint8Array,
  context: BlobContext,
  field: BlobField,
): Promise<string> {
  if (blob.length < MIN_BLOB_BYTES) throw new Error('blob demasiado corto')
  if (blob[0] !== MAGIC[0] || blob[1] !== MAGIC[1] || blob[2] !== MAGIC[2] || blob[3] !== MAGIC[3]) {
    throw new Error('esto no es un blob EPS1')
  }
  if (blob[4] !== FORMAT_VERSION) throw new Error(`version de formato no soportada: ${blob[4]}`)
  if (blob[5] !== SUITE_HKDF_AESGCM_GZIP) throw new Error(`suite no soportada: ${blob[5]}`)

  const iv = blob.slice(HEADER_BYTES, HEADER_BYTES + IV_BYTES)
  const cifrado = blob.slice(HEADER_BYTES + IV_BYTES)

  const hkdfKey = await importHkdfKey(dek)
  const aesKey = await deriveAesKey(hkdfKey, context.scenarioId, `eps1-${field}`, ['decrypt'])

  const comprimido = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource, additionalData: blobAad(context, field) as unknown as BufferSource },
      aesKey,
      cifrado as unknown as BufferSource,
    ),
  )

  return new TextDecoder().decode(await gunzip(comprimido))
}

/**
 * Marca del contenido, para saber si un escenario ha cambiado sin descifrarlo.
 *
 * Es un HMAC con clave derivada de la DEK, NO un SHA-256 del texto plano. La
 * diferencia importa: el espacio de escenarios posibles es pequenyo (salario x
 * comunidad x hijos), asi que con un hash sin clave el servidor podria probar
 * conjeturas hasta acertar. Sin la DEK, el HMAC no dice nada.
 */
export async function contentTag(plaintext: string, dek: Uint8Array, scenarioId: string): Promise<Uint8Array> {
  const hkdfKey = await importHkdfKey(dek)

  const macKeyBytes = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new TextEncoder().encode(scenarioId) as unknown as BufferSource,
      info: new TextEncoder().encode('eps1-tag') as unknown as BufferSource,
    },
    hkdfKey,
    256,
  )

  const macKey = await crypto.subtle.importKey(
    'raw',
    macKeyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const firma = await crypto.subtle.sign('HMAC', macKey, new TextEncoder().encode(plaintext))
  return new Uint8Array(firma)
}
