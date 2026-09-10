/*
 * Guardado del escenario en el navegador.
 *
 * Esto es lo que hace cierta la frase del aviso de privacidad: «si recargas la
 * pagina veras lo que ya habias puesto, porque queda guardado dentro de tu
 * navegador». Hasta ahora esa frase era falsa.
 *
 * Tres decisiones que conviene no deshacer:
 *
 * - **Se lee de forma sincrona, antes del primer render.** El dashboard reparte
 *   el estado a las tarjetas por props `initial*`, y esas tarjetas las leen solo
 *   al montarse. Cargar el escenario en un efecto llegaria tarde: las tarjetas
 *   ya estarian montadas con los valores por defecto, y habria que empujarles el
 *   estado con `setState` desde un efecto, justo el patron que el linter del
 *   proyecto marca como cascada de renders.
 * - **Escribir nunca puede romper la calculadora.** El almacenamiento puede
 *   estar lleno, deshabilitado o ser inaccesible en modo privado. Si falla, se
 *   pierde el guardado, no el calculo.
 * - **Se guarda con retardo.** Quien mueve el deslizador del salario genera
 *   decenas de cambios por segundo; serializar en cada uno seria trabajo tirado.
 */

import { deserializeScenario, isPristineScenario, serializeScenario } from './fiscalScenario.ts'
import type { FiscalScenario } from './fiscalScenario.ts'
import { clearScenarioFragment, readScenarioFromFragment } from './fiscalScenarioTransfer.ts'

/*
 * La clave lleva el prefijo `fwd-` como el resto de claves de la calculadora
 * (`fwd-privacy-notice-open`, `fwd-stats-consent`) y termina en la version del
 * formato: si algun dia el formato cambia de forma incompatible, la clave nueva
 * convive con la vieja en lugar de intentar leerla mal.
 */
export const SCENARIO_STORAGE_KEY = 'fwd-fiscal-scenario-v1'

/** Milisegundos de espera tras el ultimo cambio antes de escribir. */
const SAVE_DEBOUNCE_MS = 400

/**
 * Comprueba que el almacenamiento existe y admite escritura.
 *
 * No basta con mirar si `window.localStorage` esta definido: Safari en modo
 * privado lo expone y luego lanza al escribir, y algunos navegadores lo
 * bloquean por configuracion de cookies de terceros.
 */
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    const storage = window.localStorage
    const probe = '__fwd_probe__'
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return storage
  } catch {
    return null
  }
}

export type ScenarioSource = 'link' | 'storage'

/**
 * El escenario con el que arranca la calculadora, y de donde sale.
 *
 * Un escenario que venga en el enlace manda sobre lo guardado: quien abre un
 * enlace compartido espera ver ESE caso, no el suyo. El fragmento se limpia de
 * la barra de direcciones para no reenviar sin querer las cifras de otra
 * persona al copiar la URL.
 *
 * Quien llama necesita saber el origen porque **un escenario que llega por
 * enlace no debe guardarse solo**: destruiria en silencio lo que el visitante
 * tuviera guardado, con solo abrir un enlace ajeno.
 */
export function loadScenario(): { scenario: FiscalScenario; source: ScenarioSource } {
  if (typeof window !== 'undefined') {
    const shared = readScenarioFromFragment(window.location.hash)
    if (shared !== null) {
      clearScenarioFragment()
      return { scenario: shared, source: 'link' }
    }
  }

  const storage = getStorage()
  if (storage === null) return { scenario: deserializeScenario(null), source: 'storage' }

  try {
    return { scenario: deserializeScenario(storage.getItem(SCENARIO_STORAGE_KEY)), source: 'storage' }
  } catch {
    return { scenario: deserializeScenario(null), source: 'storage' }
  }
}

export function saveScenario(scenario: FiscalScenario): void {
  const storage = getStorage()
  if (storage === null) return

  try {
    storage.setItem(SCENARIO_STORAGE_KEY, serializeScenario(scenario))
  } catch {
    /* almacenamiento lleno o no disponible: se pierde el guardado, no el calculo */
  }
}

export function clearScenario(): void {
  const storage = getStorage()
  if (storage === null) return

  try {
    storage.removeItem(SCENARIO_STORAGE_KEY)
  } catch {
    /* nada que hacer */
  }
}

let pendingSave: ReturnType<typeof setTimeout> | null = null

/**
 * Guarda con retardo, agrupando los cambios seguidos.
 *
 * Un escenario que sigue siendo el de inicio no se guarda: escribir en el
 * almacenamiento de quien solo ha entrado a mirar es innecesario, y ademas deja
 * la calculadora en un estado «con datos» que nadie ha puesto.
 */
export function scheduleScenarioSave(scenario: FiscalScenario): void {
  if (isPristineScenario(scenario)) return

  if (pendingSave !== null) clearTimeout(pendingSave)
  pendingSave = setTimeout(() => {
    pendingSave = null
    saveScenario(scenario)
  }, SAVE_DEBOUNCE_MS)
}

/**
 * Fuerza el guardado pendiente.
 *
 * Necesario al ocultarse la pestanya: si alguien cierra el navegador dentro de
 * la ventana de retardo, lo ultimo que escribio se perderia.
 */
export function flushScenarioSave(scenario: FiscalScenario): void {
  if (pendingSave !== null) {
    clearTimeout(pendingSave)
    pendingSave = null
  }
  if (isPristineScenario(scenario)) return
  saveScenario(scenario)
}
