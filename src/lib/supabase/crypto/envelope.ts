/*
 * El sobre: la DEK envuelta con una KEK derivada de un secreto.
 *
 * Por que hay una DEK en medio y no se cifra directamente con la frase:
 * cambiar la frase reescribe 48 bytes y nada mas. Si la frase cifrara los
 * escenarios, cambiarla obligaria a bajarlos todos, descifrarlos, recifrarlos y
 * volver a subirlos, con todo lo que puede salir mal a medio camino.
 *
 * La misma DEK se envuelve dos veces, con dos secretos distintos: la frase y el
 * codigo de rescate. Perder uno no pierde los datos.
 */

import { deriveKeyBytes, type KdfParams } from './kdf.ts'

export const DEK_BYTES = 32
export const IV_BYTES = 12
/** 32 bytes de DEK + 16 de tag GCM. */
export const WRAPPED_DEK_BYTES = 48

export type Envelope = {
  params: KdfParams
  iv: Uint8Array
  wrappedDek: Uint8Array
}

export type EnvelopePurpose = 'passphrase' | 'recovery_code'

/**
 * Datos autenticados adicionales del sobre.
 *
 * Atan el sobre a su usuario, su DEK y su proposito. Sin esto, alguien con
 * acceso de escritura a la base podria mover el sobre de rescate de una cuenta
 * al hueco de la frase de otra: el descifrado funcionaria y el tag no se
 * quejaria. Con AAD, falla.
 */
function envelopeAad(userId: string, dekId: string, purpose: EnvelopePurpose): Uint8Array {
  return new TextEncoder().encode(`eps1-envelope|${userId}|${dekId}|${purpose}`)
}

async function importAesKey(raw: Uint8Array, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', raw as unknown as BufferSource, 'AES-GCM', false, usages)
}

/** Genera una DEK nueva. Solo se llama una vez por cuenta. */
export function generateDek(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(DEK_BYTES))
}

export async function wrapDek(
  dek: Uint8Array,
  secret: string,
  params: KdfParams,
  userId: string,
  dekId: string,
  purpose: EnvelopePurpose,
): Promise<Envelope> {
  const kekBytes = await deriveKeyBytes(secret, params)
  const kek = await importAesKey(kekBytes, ['encrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))

  const wrapped = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource, additionalData: envelopeAad(userId, dekId, purpose) as unknown as BufferSource },
    kek,
    dek as unknown as BufferSource,
  )

  kekBytes.fill(0)
  return { params, iv, wrappedDek: new Uint8Array(wrapped) }
}

/**
 * Abre el sobre. Lanza si el secreto no es el correcto.
 *
 * No hay forma de distinguir «frase incorrecta» de «sobre manipulado»: en los
 * dos casos falla el tag de GCM, y esa indistincion es deliberada. Quien llama
 * debe traducirlo a «esa frase no es», que es lo unico que le sirve a quien la
 * escribio.
 */
export async function unwrapDek(
  envelope: Envelope,
  secret: string,
  userId: string,
  dekId: string,
  purpose: EnvelopePurpose,
): Promise<Uint8Array> {
  const kekBytes = await deriveKeyBytes(secret, envelope.params)
  const kek = await importAesKey(kekBytes, ['decrypt'])

  try {
    const dek = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: envelope.iv as unknown as BufferSource, additionalData: envelopeAad(userId, dekId, purpose) as unknown as BufferSource },
      kek,
      envelope.wrappedDek as unknown as BufferSource,
    )
    return new Uint8Array(dek)
  } finally {
    kekBytes.fill(0)
  }
}

/* --- Conversion a/desde el formato de Postgres --------------------------- */

/** `bytea` en hexadecimal, tal y como lo espera PostgREST. */
export function toPgBytea(bytes: Uint8Array): string {
  let hex = ''
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0')
  return `\\x${hex}`
}

/** Lee un `bytea` devuelto por PostgREST (viene como `\x...`). */
export function fromPgBytea(value: string): Uint8Array {
  const hex = value.startsWith('\\x') ? value.slice(2) : value
  if (hex.length % 2 !== 0) throw new Error('bytea con longitud impar')

  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}
