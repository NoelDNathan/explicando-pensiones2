/*
 * Llevarse el escenario: enlace compartible y copia en archivo.
 *
 * Dos caminos, los dos sin servidor:
 *
 * - **Compartir**: el escenario viaja codificado en el FRAGMENTO de la URL (lo
 *   que va detras de `#`). El fragmento no se envia al servidor en ninguna
 *   peticion: no aparece en los registros de acceso, ni en la cabecera
 *   `Referer`, ni en las analiticas de nadie. Es la unica parte de una URL de
 *   la que se puede decir eso, y por eso no se usa la query.
 * - **Guardar**: un archivo JSON que se descarga y se puede volver a abrir.
 *
 * Lo que ninguno de los dos evita: cualquiera que reciba el enlace o el archivo
 * ve el salario, la comunidad y la situacion familiar de quien lo genero. La
 * interfaz tiene que decirlo antes de que se comparta, no despues.
 */

import { deserializeScenario, serializeScenario } from './fiscalScenario.ts'
import type { FiscalScenario } from './fiscalScenario.ts'

/** Prefijo del fragmento. Con nombre, para no chocar con anclas normales. */
const FRAGMENT_KEY = 'escenario'

/*
 * Tope de seguridad al leer. Un escenario normal ronda 1-3 KB codificado; 256 KB
 * es holgado y a la vez impide que un enlace enorme bloquee el arranque.
 */
const MAX_FRAGMENT_CHARS = 256 * 1024

/**
 * Base64 apto para URL: sin `+`, sin `/` y sin `=` de relleno, que en un
 * fragmento obligarian a escapar y ensuciarian el enlace.
 */
function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(encoded: string): string | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

/** Enlace absoluto a la calculadora con el escenario dentro del fragmento. */
export function buildShareUrl(scenario: FiscalScenario, origin: string, pathname: string): string {
  return `${origin}${pathname}#${FRAGMENT_KEY}=${toBase64Url(serializeScenario(scenario))}`
}

/**
 * Lee el escenario del fragmento actual, si lo hay.
 *
 * Devuelve `null` cuando no hay fragmento o no se puede interpretar, para que
 * quien llama siga con lo que tuviera guardado en el navegador.
 */
export function readScenarioFromFragment(hash: string): FiscalScenario | null {
  if (typeof hash !== 'string' || hash.length <= 1) return null
  if (hash.length > MAX_FRAGMENT_CHARS) return null

  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const params = new URLSearchParams(raw)
  const encoded = params.get(FRAGMENT_KEY)
  if (encoded === null || encoded.length === 0) return null

  const json = fromBase64Url(encoded)
  if (json === null) return null

  const scenario = deserializeScenario(json)
  /*
   * `deserializeScenario` nunca falla: ante basura devuelve los valores por
   * defecto. Se compara con el JSON de partida para distinguir «me han pasado
   * un escenario valido» de «el fragmento no era un escenario», y no anunciar
   * una restauracion que no ha ocurrido.
   */
  return scenario.savedAt.length > 0 ? scenario : null
}

/** Borra el escenario de la barra de direcciones sin recargar ni dejar historial. */
export function clearScenarioFragment(): void {
  if (typeof window === 'undefined') return
  try {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  } catch {
    /* si el navegador no deja tocar el historial, el enlace se queda visible */
  }
}

export function buildScenarioFileName(now = new Date()): string {
  return `calculadora-fiscal-${now.toISOString().slice(0, 10)}.json`
}

/**
 * Descarga el escenario como archivo.
 *
 * Se usa un blob y un enlace temporal en lugar de un `data:` URI porque algunos
 * navegadores limitan el tamanyo de estos ultimos, y porque el blob permite dar
 * al archivo un nombre legible.
 */
export function downloadScenarioFile(scenario: FiscalScenario): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false

  try {
    const blob = new Blob([serializeScenario(scenario)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = buildScenarioFileName()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // Se libera en el siguiente ciclo: revocarlo de inmediato cancela la descarga.
    setTimeout(() => URL.revokeObjectURL(url), 0)
    return true
  } catch {
    return false
  }
}

/** Lee un archivo elegido por quien calcula. `null` si no es un escenario. */
export async function readScenarioFile(file: File): Promise<FiscalScenario | null> {
  try {
    const text = await file.text()
    const scenario = deserializeScenario(text)
    return scenario.savedAt.length > 0 ? scenario : null
  } catch {
    return null
  }
}

/**
 * Copia texto al portapapeles.
 *
 * Puede fallar sin que sea culpa de nadie: la API exige contexto seguro
 * (HTTPS o localhost) y, en algunos navegadores, permiso explicito. Quien llama
 * debe ofrecer el enlace a la vista para copiarlo a mano cuando devuelva `false`.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard === undefined) return false
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
