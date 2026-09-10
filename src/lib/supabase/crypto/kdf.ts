/*
 * Derivacion de clave a partir de la frase de cifrado.
 *
 * El modelo de amenaza concreto es: alguien se lleva un volcado de
 * `user_key_envelopes` y ataca las frases sin prisa, en su propia maquina. Una
 * frase humana de cuatro o cinco palabras ronda 50-60 bits, asi que lo unico
 * que separa esa frase de la DEK es lo caro que sea probar candidatas.
 *
 * Por eso Argon2id y no PBKDF2 como primario: PBKDF2 solo cuesta CPU, y un
 * atacante con GPU prueba miles de millones en paralelo. Argon2id obliga a
 * reservar memoria por cada intento, que es lo que no se paraleliza barato.
 *
 * Argon2id no esta en WebCrypto y no lo estara, de ahi la dependencia wasm.
 *
 * Los parametros NO se fijan en el codigo: se guardan en la fila del sobre. Eso
 * permite endurecerlos mas adelante y re-envolver en el siguiente desbloqueo,
 * sin tocar ni un escenario ya cifrado.
 */

import { argon2id } from 'hash-wasm'

export type KdfName = 'argon2id' | 'pbkdf2-sha256'

export type KdfParams = {
  kdf: KdfName
  salt: Uint8Array
  iterations: number
  /** Solo Argon2id. */
  memoryKiB: number | null
  /** Solo Argon2id. */
  parallelism: number | null
}

/** Perfil normal: 64 MiB. Tarda 300-900 ms en un equipo corriente. */
export const ARGON2_FULL = { memoryKiB: 65536, iterations: 3, parallelism: 1 } as const

/**
 * Perfil reducido: 19 MiB, el minimo que recomienda OWASP.
 * Para moviles que no consiguen reservar 64 MiB.
 */
export const ARGON2_REDUCED = { memoryKiB: 19456, iterations: 2, parallelism: 1 } as const

/**
 * Plan B si el wasm no carga (CSP hostil, navegador antiguo).
 * 600.000 iteraciones es la recomendacion de OWASP para PBKDF2-SHA256, y aun
 * asi protege bastante menos: por eso la fila queda marcada y la interfaz avisa.
 */
export const PBKDF2_ITERATIONS = 600_000

export const KEY_BYTES = 32
export const SALT_BYTES = 16

export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

export function newSalt(): Uint8Array {
  return randomBytes(SALT_BYTES)
}

/**
 * Normaliza la frase antes de derivar.
 *
 * NFKC porque la misma frase tecleada en dos dispositivos puede llegar con
 * distinta composicion Unicode (acentos precompuestos o no), y entonces la
 * clave saldria distinta y el sobre no abriria. Los espacios de los extremos se
 * recortan porque sobran siempre y son invisibles: nadie entiende que su frase
 * falle por un espacio al final.
 *
 * Los espacios interiores NO se tocan: forman parte de la frase.
 */
export function normalizePassphrase(passphrase: string): string {
  return passphrase.normalize('NFKC').trim()
}

async function deriveWithPbkdf2(passphrase: string, params: KdfParams): Promise<Uint8Array> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: params.salt as unknown as BufferSource,
      iterations: params.iterations,
    },
    material,
    KEY_BYTES * 8,
  )
  return new Uint8Array(bits)
}

async function deriveWithArgon2(passphrase: string, params: KdfParams): Promise<Uint8Array> {
  if (params.memoryKiB === null || params.parallelism === null) {
    throw new Error('Argon2id necesita memoryKiB y parallelism')
  }
  return argon2id({
    password: passphrase,
    salt: params.salt,
    parallelism: params.parallelism,
    iterations: params.iterations,
    memorySize: params.memoryKiB,
    hashLength: KEY_BYTES,
    outputType: 'binary',
  })
}

/** Deriva los 32 bytes de la KEK con los parametros dados. */
export async function deriveKeyBytes(passphrase: string, params: KdfParams): Promise<Uint8Array> {
  const normalizada = normalizePassphrase(passphrase)

  return params.kdf === 'argon2id'
    ? deriveWithArgon2(normalizada, params)
    : deriveWithPbkdf2(normalizada, params)
}

/**
 * Elige los parametros mas fuertes que este equipo aguante, y deriva.
 *
 * El orden importa: se intenta 64 MiB, luego 19 MiB, y solo si el wasm falla del
 * todo se cae a PBKDF2. Devuelve tambien los parametros usados, porque son los
 * que hay que guardar en el sobre para poder reproducir la derivacion.
 */
export async function deriveBestEffort(
  passphrase: string,
  salt: Uint8Array,
): Promise<{ key: Uint8Array; params: KdfParams }> {
  const perfiles = [ARGON2_FULL, ARGON2_REDUCED]

  for (const perfil of perfiles) {
    const params: KdfParams = {
      kdf: 'argon2id',
      salt,
      iterations: perfil.iterations,
      memoryKiB: perfil.memoryKiB,
      parallelism: perfil.parallelism,
    }
    try {
      return { key: await deriveWithArgon2(passphrase, params), params }
    } catch {
      // Normalmente por no poder reservar la memoria. Se prueba el siguiente.
    }
  }

  const params: KdfParams = {
    kdf: 'pbkdf2-sha256',
    salt,
    iterations: PBKDF2_ITERATIONS,
    memoryKiB: null,
    parallelism: null,
  }
  return { key: await deriveWithPbkdf2(normalizePassphrase(passphrase), params), params }
}

/** Cierto si la fila usa la proteccion debil y conviene avisar a quien la tiene. */
export function isWeakKdf(params: Pick<KdfParams, 'kdf'>): boolean {
  return params.kdf === 'pbkdf2-sha256'
}
