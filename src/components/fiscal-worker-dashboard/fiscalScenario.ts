/*
 * El escenario de la calculadora fiscal: todo lo que ha puesto quien calcula,
 * en un unico objeto serializable.
 *
 * Hasta ahora ese estado vivia repartido en una veintena de `useState` sueltos
 * dentro de `FiscalWorkerDashboard`, sin forma de guardarlo ni de recuperarlo:
 * al recargar la pagina se perdia todo, aunque el aviso de privacidad prometiera
 * lo contrario. Este modulo le da forma, nombre y version.
 *
 * Reglas que conviene respetar al tocarlo:
 *
 * - `deserializeScenario` NUNCA confia en lo que lee. El JSON puede venir de una
 *   version anterior de la aplicacion, de otro dispositivo o de alguien que lo
 *   ha editado a mano en el almacenamiento del navegador. Cada campo se valida
 *   y, si no encaja, se usa el valor por defecto. Un escenario corrupto degrada
 *   a los valores de inicio; no rompe la calculadora.
 * - Todo campo nuevo se anyade con su valor por defecto en `DEFAULT_SCENARIO`,
 *   para que un escenario viejo siga abriendo sin dejar huecos `undefined`.
 * - Si un cambio hace incompatible el formato, sube `FISCAL_SCENARIO_VERSION` y
 *   anyade el paso correspondiente en `migrateScenario`.
 */

import type { DisabilityMode } from './types.ts'
import type { Irpf2025AdjustmentInput } from './irpf2025Adjustments.ts'
import { createEmptyIrpf2025Adjustments } from './irpf2025Adjustments.ts'
import type {
  ConsumptionTaxesDraft,
  ConsumptionTaxesResult,
  PersonalReductionResult,
  WealthTaxesDraft,
  WealthTaxesResult,
  WorkerContractType,
} from '../worker-salary-dashboard'
/*
 * Ojo: aqui solo entran importaciones de TIPO del barril de componentes, que se
 * borran al compilar. Importar un valor arrastraria los .tsx y sus .css, y este
 * modulo dejaria de poder ejecutarse fuera del navegador, que es justo lo que
 * permite verificarlo con `pnpm verify:scenario`.
 */

export const FISCAL_SCENARIO_VERSION = 1

export type FiscalScenarioTaxYear = '2025' | '2005'
export type FiscalScenarioPayPeriod = 'annual' | 'monthly'
export type FiscalScenarioPayCount = '12' | '14'

export type FiscalScenario = {
  version: number
  /** Cuando se guardo, en ISO. Sirve para ordenar y para depurar. */
  savedAt: string

  taxYear: FiscalScenarioTaxYear

  /** Salario anualizado, que es como lo consume el motor. */
  salary: number
  salaryComplements: number
  /* payPeriod y payCount no entran en el calculo, pero sin ellos alguien que
   * escribio "2.000 al mes en 14 pagas" volveria y veria "28.000 al anyo": la
   * cifra correcta, presentada como no la escribio. */
  payPeriod: FiscalScenarioPayPeriod
  payCount: FiscalScenarioPayCount

  region: string
  contributionGroupId: number
  contractType: WorkerContractType
  occupationalAccidentsCategoryId: string

  selectedChildren: number
  children: number
  childrenUnder3: number
  selectedAscendants: number
  ascendants: number
  ascendantsOver75: number
  disability: DisabilityMode
  dependentDisabilityMinimum: number
  taxpayerDisabilityAssistanceMinimum: number

  /** El objeto mas grande: incluye los ~80 campos de `Irpf2025AdjustmentInput`. */
  personalAdjustments: PersonalReductionResult | null

  /* De consumo y patrimonio se guardan el borrador y el resultado. El borrador
   * repuebla el formulario; el resultado evita que el resumen aparezca a cero
   * hasta que alguien vuelva a visitar ese paso. */
  consumptionTaxesDraft: ConsumptionTaxesDraft | null
  consumptionTaxes: ConsumptionTaxesResult | null
  wealthTaxesDraft: WealthTaxesDraft | null
  wealthTaxes: WealthTaxesResult | null

  activeWorkerStepId: number
}

const CONTRACT_TYPES: readonly WorkerContractType[] = [
  'indefinite',
  'temporary',
  'internship',
  'training',
]
const DISABILITY_MODES: readonly DisabilityMode[] = ['none', '33_64', '65_or_more']
const TAX_YEARS: readonly FiscalScenarioTaxYear[] = ['2025', '2005']

/** Los mismos valores con los que arranca hoy el dashboard. */
export const DEFAULT_SCENARIO: FiscalScenario = {
  version: FISCAL_SCENARIO_VERSION,
  savedAt: '',
  taxYear: '2025',
  salary: 35000,
  salaryComplements: 0,
  payPeriod: 'annual',
  payCount: '12',
  region: 'madrid',
  contributionGroupId: 7,
  contractType: 'indefinite',
  // Cadena vacia = «sin elegir»: el dashboard pone entonces la categoria por
  // defecto de la tarjeta AT/EP. Asi este modulo no necesita conocerla.
  occupationalAccidentsCategoryId: '',
  selectedChildren: 0,
  children: 0,
  childrenUnder3: 0,
  selectedAscendants: 0,
  ascendants: 0,
  ascendantsOver75: 0,
  disability: 'none',
  dependentDisabilityMinimum: 0,
  taxpayerDisabilityAssistanceMinimum: 0,
  personalAdjustments: null,
  consumptionTaxesDraft: null,
  consumptionTaxes: null,
  wealthTaxesDraft: null,
  wealthTaxes: null,
  activeWorkerStepId: 0,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Numero finito y no negativo, con tope: descarta NaN, Infinity y basura. */
function readNumber(value: unknown, fallback: number, max = 1_000_000_000): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  if (value < 0 || value > max) return fallback
  return value
}

function readInteger(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) return fallback
  if (value < min || value > max) return fallback
  return value
}

function readString(value: unknown, fallback: string, maxLength = 128): string {
  if (typeof value !== 'string' || value.length > maxLength) return fallback
  return value
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

/**
 * Rellena los ajustes leidos sobre el objeto vacio del motor.
 *
 * Es la pieza que hace que un escenario guardado con una version anterior siga
 * abriendo: los campos que no existian entonces toman su valor por defecto en
 * lugar de quedarse en `undefined` y propagar `NaN` por todo el calculo.
 */
function readAdjustments(value: unknown): Irpf2025AdjustmentInput {
  const empty = createEmptyIrpf2025Adjustments()
  if (!isRecord(value)) return empty

  const result = { ...empty } as Record<string, unknown>
  for (const key of Object.keys(empty)) {
    const saved = value[key]
    const expected = typeof (empty as Record<string, unknown>)[key]
    // Solo se acepta el valor guardado si conserva el tipo que espera el motor.
    if (typeof saved === expected && (expected !== 'number' || Number.isFinite(saved))) {
      result[key] = saved
    }
  }
  return result as Irpf2025AdjustmentInput
}

function readPersonalAdjustments(value: unknown): PersonalReductionResult | null {
  if (!isRecord(value)) return null

  // Se conserva la forma tal cual (incluidos perfiles y lineas de calculo) y se
  // sanean los campos que el dashboard lee directamente para repartir estado.
  return {
    ...(value as unknown as PersonalReductionResult),
    children: readInteger(value.children, 0, 0, 20),
    eligibleChildren: readInteger(value.eligibleChildren, 0, 0, 20),
    childrenUnder3: readInteger(value.childrenUnder3, 0, 0, 20),
    ascendants: readInteger(value.ascendants, 0, 0, 20),
    eligibleAscendants: readInteger(value.eligibleAscendants, 0, 0, 20),
    ascendantsOver75: readInteger(value.ascendantsOver75, 0, 0, 20),
    dependentDisabilityMinimum: readNumber(value.dependentDisabilityMinimum, 0),
    taxpayerDisabilityAssistanceMinimum: readNumber(value.taxpayerDisabilityAssistanceMinimum, 0),
    reductionsTotal: readNumber(value.reductionsTotal, 0),
    deductionsTotal: readNumber(value.deductionsTotal, 0),
    descendantProfiles: Array.isArray(value.descendantProfiles) ? value.descendantProfiles : [],
    ascendantProfiles: Array.isArray(value.ascendantProfiles) ? value.ascendantProfiles : [],
    adjustments: readAdjustments(value.adjustments),
  }
}

function readConsumptionDraft(value: unknown): ConsumptionTaxesDraft | null {
  if (!isRecord(value)) return null

  const shares: Record<string, number> = {}
  if (isRecord(value.sharePercents)) {
    for (const [key, share] of Object.entries(value.sharePercents)) {
      if (typeof share === 'number' && Number.isFinite(share) && share >= 0 && share <= 100) {
        shares[key] = share
      }
    }
  }

  return {
    budgetAnnual: readNumber(value.budgetAnnual, 0),
    sharePercents: shares,
  }
}

function readWealthDraft(value: unknown): WealthTaxesDraft | null {
  if (!isRecord(value)) return null

  const list = (candidate: unknown) => (Array.isArray(candidate) ? candidate : [])

  return {
    ...(value as unknown as WealthTaxesDraft),
    propertyIbis: list(value.propertyIbis),
    propertyPurchases: list(value.propertyPurchases),
    vehiclePurchases: list(value.vehiclePurchases),
    vehicleIvtms: list(value.vehicleIvtms),
  }
}

/** Los resultados son derivados: si no encajan, se recalculan al abrir el paso. */
function readDerived<T>(value: unknown): T | null {
  return isRecord(value) ? (value as T) : null
}

export function serializeScenario(scenario: FiscalScenario): string {
  return JSON.stringify({ ...scenario, version: FISCAL_SCENARIO_VERSION, savedAt: new Date().toISOString() })
}

/**
 * Lleva un escenario de una version anterior a la actual.
 *
 * Hoy solo existe la version 1, asi que no hay ningun paso que dar. Cuando haya
 * mas, cada salto se escribe aqui, uno a uno, sin saltarse versiones
 * intermedias: es lo que permite abrir un escenario guardado hace un anyo.
 */
function migrateScenario(raw: Record<string, unknown>): Record<string, unknown> {
  const version = readInteger(raw.version, 0, 0, 999)

  if (version > FISCAL_SCENARIO_VERSION) {
    // Guardado por una version mas nueva de la aplicacion (otra pestanya ya
    // actualizada, por ejemplo). No se adivina: se empieza de cero.
    return {}
  }

  return raw
}

export function deserializeScenario(input: string | null | undefined): FiscalScenario {
  if (typeof input !== 'string' || input.length === 0) return { ...DEFAULT_SCENARIO }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch {
    return { ...DEFAULT_SCENARIO }
  }

  if (!isRecord(parsed)) return { ...DEFAULT_SCENARIO }

  const raw = migrateScenario(parsed)

  return {
    version: FISCAL_SCENARIO_VERSION,
    savedAt: readString(raw.savedAt, DEFAULT_SCENARIO.savedAt, 40),
    taxYear: readEnum(raw.taxYear, TAX_YEARS, DEFAULT_SCENARIO.taxYear),
    salary: readNumber(raw.salary, DEFAULT_SCENARIO.salary),
    salaryComplements: readNumber(raw.salaryComplements, DEFAULT_SCENARIO.salaryComplements),
    payPeriod: readEnum(raw.payPeriod, ['annual', 'monthly'] as const, DEFAULT_SCENARIO.payPeriod),
    payCount: readEnum(raw.payCount, ['12', '14'] as const, DEFAULT_SCENARIO.payCount),
    region: readString(raw.region, DEFAULT_SCENARIO.region, 64),
    contributionGroupId: readInteger(raw.contributionGroupId, DEFAULT_SCENARIO.contributionGroupId, 1, 11),
    contractType: readEnum(raw.contractType, CONTRACT_TYPES, DEFAULT_SCENARIO.contractType),
    occupationalAccidentsCategoryId: readString(
      raw.occupationalAccidentsCategoryId,
      DEFAULT_SCENARIO.occupationalAccidentsCategoryId,
      64,
    ),
    selectedChildren: readInteger(raw.selectedChildren, DEFAULT_SCENARIO.selectedChildren, 0, 20),
    children: readInteger(raw.children, DEFAULT_SCENARIO.children, 0, 20),
    childrenUnder3: readInteger(raw.childrenUnder3, DEFAULT_SCENARIO.childrenUnder3, 0, 20),
    selectedAscendants: readInteger(raw.selectedAscendants, DEFAULT_SCENARIO.selectedAscendants, 0, 20),
    ascendants: readInteger(raw.ascendants, DEFAULT_SCENARIO.ascendants, 0, 20),
    ascendantsOver75: readInteger(raw.ascendantsOver75, DEFAULT_SCENARIO.ascendantsOver75, 0, 20),
    disability: readEnum(raw.disability, DISABILITY_MODES, DEFAULT_SCENARIO.disability),
    dependentDisabilityMinimum: readNumber(raw.dependentDisabilityMinimum, 0),
    taxpayerDisabilityAssistanceMinimum: readNumber(raw.taxpayerDisabilityAssistanceMinimum, 0),
    personalAdjustments: readPersonalAdjustments(raw.personalAdjustments),
    consumptionTaxesDraft: readConsumptionDraft(raw.consumptionTaxesDraft),
    consumptionTaxes: readDerived<ConsumptionTaxesResult>(raw.consumptionTaxes),
    wealthTaxesDraft: readWealthDraft(raw.wealthTaxesDraft),
    wealthTaxes: readDerived<WealthTaxesResult>(raw.wealthTaxes),
    activeWorkerStepId: readInteger(raw.activeWorkerStepId, DEFAULT_SCENARIO.activeWorkerStepId, 0, 50),
  }
}

/**
 * Huella del contenido de un escenario, sin la marca de tiempo.
 *
 * Sirve para responder «esto sigue siendo exactamente lo que me pasaron?».
 * `savedAt` cambia en cada guardado, asi que compararlo estropearia la
 * comparacion.
 */
export function scenarioSignature(scenario: FiscalScenario): string {
  return JSON.stringify({ ...scenario, savedAt: '' })
}

/** Cierto si el escenario sigue siendo el de inicio, sin nada escrito. */
export function isPristineScenario(scenario: FiscalScenario): boolean {
  return (
    scenario.salary === DEFAULT_SCENARIO.salary &&
    scenario.salaryComplements === DEFAULT_SCENARIO.salaryComplements &&
    scenario.region === DEFAULT_SCENARIO.region &&
    scenario.personalAdjustments === null &&
    scenario.consumptionTaxesDraft === null &&
    scenario.wealthTaxesDraft === null
  )
}
