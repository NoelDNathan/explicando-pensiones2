/*
 * La boveda: donde vive la DEK mientras dura la sesion.
 *
 * Decisiones que conviene no deshacer:
 *
 * - La DEK se importa como `CryptoKey` NO EXTRAIBLE en cuanto se desenvuelve, y
 *   el buffer con los bytes crudos se pone a cero. El cero es mejor esfuerzo (el
 *   recolector de basura de JavaScript no garantiza nada), pero cuesta una linea.
 * - Vive en una variable de MODULO, no en estado de React. Que no este en
 *   `useState` importa: evita que aparezca en React DevTools o en cualquier
 *   serializacion del estado. Con React Compiler activo, ademas, no debe leerse
 *   durante el render.
 * - Nunca en localStorage, sessionStorage ni en la URL.
 * - Se bloquea sola: a los 30 minutos sin actividad, al cerrar sesion y al
 *   cambiar de usuario. Un `BroadcastChannel` propaga el bloqueo a las demas
 *   pestanyas, para que cerrar en una no deje otra abierta.
 *
 * Lo que esto NO protege, y hay que decirlo en la politica de privacidad:
 * nosotros servimos el JavaScript. Un despliegue malicioso —nuestro, o de quien
 * comprometa la cuenta de Vercel o de GitHub— puede capturar la frase al
 * teclearla. Cifrado en el navegador no es cifrado extremo a extremo de una
 * aplicacion firmada. «No podemos leer lo que guardas» es defendible; «es
 * imposible que lo leamos» no lo es.
 */

import { decryptFromBlob, encryptToBlob, contentTag, type BlobContext, type BlobField } from './blob.ts'

const AUTO_LOCK_MS = 30 * 60 * 1000
const CHANNEL_NAME = 'eps-vault'

type VaultState = {
  dekKey: CryptoKey | null
  /** Copia cruda, necesaria porque blob.ts deriva con HKDF desde los bytes. */
  dekBytes: Uint8Array | null
  userId: string | null
  dekId: string | null
  lastActivity: number
}

const state: VaultState = {
  dekKey: null,
  dekBytes: null,
  userId: null,
  dekId: null,
  lastActivity: 0,
}

type Listener = () => void
const listeners = new Set<Listener>()

let channel: BroadcastChannel | null = null
let autoLockTimer: ReturnType<typeof setInterval> | null = null

function notify(): void {
  for (const listener of listeners) listener()
}

export function subscribeToVault(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  if (channel === null) {
    channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = (event) => {
      if (event.data === 'lock') lockLocal()
    }
  }
  return channel
}

function lockLocal(): void {
  state.dekBytes?.fill(0)
  state.dekKey = null
  state.dekBytes = null
  state.userId = null
  state.dekId = null
  state.lastActivity = 0

  if (autoLockTimer !== null) {
    clearInterval(autoLockTimer)
    autoLockTimer = null
  }
  notify()
}

/** Bloquea aqui y en las demas pestanyas. */
export function lockVault(): void {
  lockLocal()
  getChannel()?.postMessage('lock')
}

function startAutoLock(): void {
  if (autoLockTimer !== null) clearInterval(autoLockTimer)
  autoLockTimer = setInterval(() => {
    if (state.dekKey !== null && Date.now() - state.lastActivity > AUTO_LOCK_MS) {
      lockVault()
    }
  }, 60_000)
}

/**
 * Abre la boveda con una DEK ya desenvuelta.
 *
 * Quien llama se encarga de desenvolverla (ver `envelope.ts`); aqui solo se
 * guarda, se importa como clave no extraible y se pone en marcha el autobloqueo.
 */
export async function unlockVault(dek: Uint8Array, userId: string, dekId: string): Promise<void> {
  const copia = new Uint8Array(dek)

  state.dekKey = await crypto.subtle.importKey('raw', copia as unknown as BufferSource, 'HKDF', false, ['deriveKey', 'deriveBits'])
  state.dekBytes = copia
  state.userId = userId
  state.dekId = dekId
  state.lastActivity = Date.now()

  startAutoLock()
  notify()
}

export function isVaultUnlocked(): boolean {
  return state.dekKey !== null
}

export function vaultUserId(): string | null {
  return state.userId
}

export function vaultDekId(): string | null {
  return state.dekId
}

/** Renueva el contador de inactividad. Lo llama cada operacion de cifrado. */
export function touchVault(): void {
  if (state.dekKey !== null) state.lastActivity = Date.now()
}

function requireDek(): Uint8Array {
  if (state.dekBytes === null) {
    throw new Error('La boveda esta bloqueada: hace falta la frase de cifrado.')
  }
  touchVault()
  return state.dekBytes
}

/*
 * El contexto de React solo publica FUNCIONES, nunca la clave. Toda la
 * superficie que ve el resto de la aplicacion es esta: cifrar, descifrar y
 * marcar. La DEK no sale de este modulo.
 */

export async function encryptWithVault(
  plaintext: string,
  context: BlobContext,
  field: BlobField,
): Promise<Uint8Array> {
  return encryptToBlob(plaintext, requireDek(), context, field)
}

export async function decryptWithVault(
  blob: Uint8Array,
  context: BlobContext,
  field: BlobField,
): Promise<string> {
  return decryptFromBlob(blob, requireDek(), context, field)
}

export async function tagWithVault(plaintext: string, scenarioId: string): Promise<Uint8Array> {
  return contentTag(plaintext, requireDek(), scenarioId)
}

/**
 * Engancha la boveda al ciclo de vida de la sesion.
 *
 * Devuelve la funcion para desengancharla. Se llama una vez, desde el proveedor
 * de sesion: si se pierde la sesion, la boveda tiene que cerrarse sola.
 */
export function bindVaultToSession(currentUserId: string | null): void {
  if (currentUserId === null && state.dekKey !== null) {
    lockVault()
    return
  }
  // Cambio de cuenta en la misma pestanya: la DEK anterior no vale y ademas
  // seria un agujero dejarla abierta para otra persona.
  if (currentUserId !== null && state.userId !== null && state.userId !== currentUserId) {
    lockVault()
  }
}
