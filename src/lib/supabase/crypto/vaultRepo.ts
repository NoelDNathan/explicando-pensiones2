/*
 * Lectura y escritura de los sobres de clave contra Supabase.
 *
 * Todo lo que sale de aqui hacia la base son bytes que el servidor no puede
 * interpretar. Lo unico legible que se guarda son los PARAMETROS del KDF (sal,
 * memoria, iteraciones), y eso es a proposito: sin ellos no se podria reproducir
 * la derivacion, y no revelan nada sobre la frase.
 */

import { getSupabaseClient } from '../client.ts'
import {
  fromPgBytea,
  generateDek,
  toPgBytea,
  unwrapDek,
  wrapDek,
  type Envelope,
  type EnvelopePurpose,
} from './envelope.ts'
import { deriveBestEffort, newSalt, type KdfParams } from './kdf.ts'
import { unlockVault } from './keyVault.ts'

export type VaultStatus = 'sin_configurar' | 'configurada' | 'no_disponible'

type EnvelopeRow = {
  purpose: EnvelopePurpose
  kdf: 'argon2id' | 'pbkdf2-sha256'
  kdf_salt: string
  kdf_iterations: number
  kdf_memory_kib: number | null
  kdf_parallelism: number | null
  wrap_iv: string
  wrapped_dek: string
  envelope_version: number
}

function rowToEnvelope(row: EnvelopeRow): Envelope & { version: number } {
  const params: KdfParams = {
    kdf: row.kdf,
    salt: fromPgBytea(row.kdf_salt),
    iterations: row.kdf_iterations,
    memoryKiB: row.kdf_memory_kib,
    parallelism: row.kdf_parallelism,
  }
  return {
    params,
    iv: fromPgBytea(row.wrap_iv),
    wrappedDek: fromPgBytea(row.wrapped_dek),
    version: row.envelope_version,
  }
}

/** El `dek_id` de la cuenta. Lo creo el trigger al darse de alta. */
export async function fetchDekId(): Promise<string | null> {
  const client = getSupabaseClient()
  if (client === null) return null

  const { data, error } = await client.from('user_deks').select('dek_id').maybeSingle()
  if (error !== null || data === null) return null
  return data.dek_id as string
}

export async function fetchEnvelope(purpose: EnvelopePurpose): Promise<(Envelope & { version: number }) | null> {
  const client = getSupabaseClient()
  if (client === null) return null

  const { data, error } = await client
    .from('user_key_envelopes')
    .select('purpose, kdf, kdf_salt, kdf_iterations, kdf_memory_kib, kdf_parallelism, wrap_iv, wrapped_dek, envelope_version')
    .eq('purpose', purpose)
    .maybeSingle()

  if (error !== null || data === null) return null
  return rowToEnvelope(data as EnvelopeRow)
}

export async function readVaultStatus(): Promise<VaultStatus> {
  const client = getSupabaseClient()
  if (client === null) return 'no_disponible'

  const sobre = await fetchEnvelope('passphrase')
  return sobre === null ? 'sin_configurar' : 'configurada'
}

/**
 * Crea la boveda: una DEK nueva, envuelta con la frase y con el codigo de
 * rescate, y la deja abierta.
 *
 * Los dos sobres se escriben en la MISMA operacion. Si solo se guardara el de
 * la frase y algo fallara despues, quedaria una cuenta sin via de rescate: justo
 * el caso que el codigo existe para evitar.
 */
export async function createVault(
  userId: string,
  dekId: string,
  passphrase: string,
  recoveryCode: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const client = getSupabaseClient()
  if (client === null) return { ok: false, message: 'La cuenta no esta configurada en esta instalacion.' }

  const dek = generateDek()

  const conFrase = await wrapDekConMejorPerfil(dek, passphrase, userId, dekId, 'passphrase')
  const conCodigo = await wrapDekConMejorPerfil(dek, recoveryCode, userId, dekId, 'recovery_code')

  const { error } = await client.from('user_key_envelopes').insert([
    envelopeToRow(userId, dekId, 'passphrase', conFrase),
    envelopeToRow(userId, dekId, 'recovery_code', conCodigo),
  ])

  if (error !== null) {
    return { ok: false, message: 'No se ha podido guardar la frase. Vuelve a intentarlo.' }
  }

  await unlockVault(dek, userId, dekId)
  dek.fill(0)
  return { ok: true }
}

async function wrapDekConMejorPerfil(
  dek: Uint8Array,
  secret: string,
  userId: string,
  dekId: string,
  purpose: EnvelopePurpose,
): Promise<Envelope> {
  // deriveBestEffort elige el perfil mas fuerte que aguante este equipo y
  // devuelve los parametros usados, que son los que hay que guardar.
  const { params } = await deriveBestEffort(secret, newSalt())
  return wrapDek(dek, secret, params, userId, dekId, purpose)
}

function envelopeToRow(userId: string, dekId: string, purpose: EnvelopePurpose, envelope: Envelope) {
  return {
    user_id: userId,
    dek_id: dekId,
    purpose,
    kdf: envelope.params.kdf,
    kdf_salt: toPgBytea(envelope.params.salt),
    kdf_iterations: envelope.params.iterations,
    kdf_memory_kib: envelope.params.memoryKiB,
    kdf_parallelism: envelope.params.parallelism,
    wrap_iv: toPgBytea(envelope.iv),
    wrapped_dek: toPgBytea(envelope.wrappedDek),
  }
}

/**
 * Abre la boveda con la frase o con el codigo de rescate.
 *
 * No distingue «secreto incorrecto» de «sobre manipulado»: en los dos casos
 * falla el tag de GCM. Se traduce a lo unico que le sirve a quien lo escribio.
 */
export async function openVault(
  userId: string,
  dekId: string,
  secret: string,
  purpose: EnvelopePurpose,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const sobre = await fetchEnvelope(purpose)
  if (sobre === null) {
    return { ok: false, message: 'No hay ninguna frase guardada en esta cuenta.' }
  }

  try {
    const dek = await unwrapDek(sobre, secret, userId, dekId, purpose)
    await unlockVault(dek, userId, dekId)
    dek.fill(0)
    return { ok: true }
  } catch {
    return {
      ok: false,
      message: purpose === 'passphrase'
        ? 'Esa frase no es. Recuerda que distingue mayusculas y acentos.'
        : 'Ese codigo de rescate no es.',
    }
  }
}
