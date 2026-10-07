/*
 * Recorrido de la v3 (/calculadora-fiscal/v3): por donde va la persona, que ha
 * confirmado y como se calcula su «ticket» y la aproximacion inicial con la que
 * se compara. El calculo es el mismo motor que el resto de versiones
 * (computeFiscalResult); aqui solo se combinan sus entradas.
 *
 * Analisis y propuesta: ai/rediseno-calculadora/04-psicologia-finalizacion-v2.md.
 */
import { DEFAULT_SCENARIO } from '../fiscalScenario'
import { computeFiscalResult, getContributionRatesForYear } from '../fiscalResult'
import type { FiscalResultInputs } from '../fiscalResult'
import {
  DEFAULT_AT_EP_2025_CATEGORY_ID,
  calculateSocialContributions,
  getOccupationalAccidentsRate,
} from '../../worker-salary-dashboard'
import type { WorkerContractType } from '../../worker-salary-dashboard'

/** Los cuatro bloques del recorrido corto, en orden. */
export const V3_BLOCKS = ['nomina', 'situacion', 'compras', 'patrimonio'] as const
export type V3Block = (typeof V3_BLOCKS)[number]

export type V3Stage = 'pregunta' | 'salario' | 'revelacion' | V3Block | 'ticket' | 'aprender'

export const V3_BLOCK_LABELS: Record<V3Block, { title: string; short: string }> = {
  nomina: { title: 'Tu nómina', short: 'tu nómina' },
  situacion: { title: 'Tu situación', short: 'tu situación' },
  compras: { title: 'Lo que compras', short: 'compras' },
  patrimonio: { title: 'Lo que tienes', short: 'casa y coche' },
}

export type V3FlowState = {
  stage: V3Stage
  /** Bloques que la persona ha cerrado con «Seguir». */
  done: Record<V3Block, boolean>
  /**
   * Predicciones opcionales antes de cada revelación: sin la clave, aún no se ha
   * contestado; `null`, se saltó; un número, la respuesta.
   */
  predictions: { empresa?: number | null; iva?: number | null }
  /** Paso del modo «Aprender» y pantalla a la que se vuelve al salir de él. */
  returnStage: V3Stage
}

export const INITIAL_V3_FLOW: V3FlowState = {
  stage: 'pregunta',
  done: { nomina: false, situacion: false, compras: false, patrimonio: false },
  predictions: {},
  returnStage: 'revelacion',
}

/*
 * Se guarda aparte del escenario: el escenario viaja en los enlaces y en las
 * copias descargadas, y por donde va cada persona no es parte de su caso.
 */
const V3_FLOW_STORAGE_KEY = 'fwd-v3-flow-v1'
const STAGES: V3Stage[] = ['pregunta', 'salario', 'revelacion', ...V3_BLOCKS, 'ticket', 'aprender']

function readPrediction(value: unknown): number | null | undefined {
  if (value === null) return null
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined
}

export function loadV3Flow(hasGuess: boolean): V3FlowState {
  const fallback: V3FlowState = { ...INITIAL_V3_FLOW, stage: hasGuess ? 'revelacion' : 'pregunta' }
  try {
    const raw = window.localStorage.getItem(V3_FLOW_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<V3FlowState>
    const stage = STAGES.includes(parsed.stage as V3Stage) ? (parsed.stage as V3Stage) : fallback.stage
    const returnStage = STAGES.includes(parsed.returnStage as V3Stage) ? (parsed.returnStage as V3Stage) : 'revelacion'
    const done = { ...INITIAL_V3_FLOW.done }
    for (const block of V3_BLOCKS) done[block] = parsed.done?.[block] === true
    return {
      // Sin respuesta guardada no se puede enseñar la comparación: se vuelve a preguntar.
      stage: !hasGuess && (stage === 'revelacion' || stage === 'salario') ? 'pregunta' : stage,
      done,
      predictions: {
        empresa: readPrediction(parsed.predictions?.empresa),
        iva: readPrediction(parsed.predictions?.iva),
      },
      returnStage: returnStage === 'aprender' ? 'revelacion' : returnStage,
    }
  } catch {
    return fallback
  }
}

export function saveV3Flow(state: V3FlowState) {
  try {
    window.localStorage.setItem(V3_FLOW_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* sin almacenamiento se pierde por donde ibas, no el cálculo */
  }
}

/** Lo que cuesta el puesto y a dónde va, en euros al año. */
export type V3Ticket = {
  laborCost: number
  gross: number
  employer: number
  worker: number
  irpf: number
  /** Neto de la nómina: bruto − tus cotizaciones − IRPF. */
  netPayroll: number
  vat: number
  special: number
  wealth: number
  /** Lo que queda después de todo lo anterior. */
  takeHome: number
  /** Euros de cada 100 del coste que te quedan, con decimales. */
  takeHomePer100: number
  /** Euros de cada 100 que acaban en impuestos y cotizaciones, redondeado como en el paso 0. */
  taxesPer100: number
  /** Tipo efectivo del IVA usado: el de la EPF para tu tramo o el de tu reparto de gasto. */
  vatRate: number
}

export type V3TicketContext = {
  contractType: WorkerContractType
  occupationalAccidentsCategoryId: string
}

export function evaluateTicket(inputs: FiscalResultInputs, context: V3TicketContext): V3Ticket {
  const result = computeFiscalResult(inputs)
  const baseRates = getContributionRatesForYear(inputs.taxYear)
  const rates = {
    ...baseRates,
    company: {
      ...baseRates.company,
      occupationalAccidents: getOccupationalAccidentsRate(
        context.occupationalAccidentsCategoryId || DEFAULT_AT_EP_2025_CATEGORY_ID,
      ),
    },
  }
  const social = calculateSocialContributions({
    grossSalaryAnnual: result.grossSalaryAnnual,
    grossSalaryMonthly: result.grossSalaryAnnual / 12,
    contributionBaseAnnual: result.contributionBase * 12,
    contributionBaseMonthly: result.contributionBase,
    contractType: context.contractType,
    rates,
  })
  const gross = result.grossSalaryAnnual
  const employer = social.companyContributionsAnnual
  const worker = social.workerContributionsAnnual
  const irpf = result.irpf
  const vat = result.vat
  const special = inputs.consumptionTaxes?.specialTaxesAnnual ?? 0
  const wealth = inputs.wealthRecurringTaxAnnual
  const laborCost = gross + employer
  const netPayroll = Math.max(0, gross - worker - irpf)
  const takeHome = Math.max(0, netPayroll - vat - special - wealth)
  const takeHomePer100 = laborCost > 0 ? (takeHome / laborCost) * 100 : 0
  return {
    laborCost,
    gross,
    employer,
    worker,
    irpf,
    netPayroll,
    vat,
    special,
    wealth,
    takeHome,
    takeHomePer100,
    taxesPer100: 100 - Math.round(takeHomePer100),
    vatRate: result.vatRate,
  }
}

/*
 * La aproximación del principio: el mismo sueldo con los supuestos con los que
 * arranca la calculadora (los de DEFAULT_SCENARIO). Se recalcula con el sueldo
 * actual para que la comparación «antes / ahora» solo refleje lo que la persona
 * ha contado de su caso, no un cambio de sueldo.
 */
export const BASELINE_OVERRIDES = {
  region: DEFAULT_SCENARIO.region,
  personalAdjustments: null,
  children: DEFAULT_SCENARIO.children,
  childrenUnder3: DEFAULT_SCENARIO.childrenUnder3,
  ascendants: DEFAULT_SCENARIO.ascendants,
  ascendantsOver75: DEFAULT_SCENARIO.ascendantsOver75,
  disability: DEFAULT_SCENARIO.disability,
  dependentDisabilityMinimum: DEFAULT_SCENARIO.dependentDisabilityMinimum,
  taxpayerDisabilityAssistanceMinimum: DEFAULT_SCENARIO.taxpayerDisabilityAssistanceMinimum,
  consumptionTaxes: null,
  wealthRecurringTaxAnnual: 0,
  contributionGroupId: DEFAULT_SCENARIO.contributionGroupId,
} satisfies Partial<FiscalResultInputs>

export const BASELINE_CONTEXT: V3TicketContext = {
  contractType: DEFAULT_SCENARIO.contractType,
  occupationalAccidentsCategoryId: DEFAULT_AT_EP_2025_CATEGORY_ID,
}

export type V3Attribution = { id: string; label: string; delta: number }

/**
 * Qué movió la cifra desde la aproximación: se añaden las respuestas de una en una
 * (comunidad → situación → compras → casa y coche → el resto de ajustes) y se
 * mide cuánto cambia «de cada 100 €, para ti» en cada paso.
 */
export function attributeChanges(inputs: FiscalResultInputs, context: V3TicketContext): {
  baseline: V3Ticket
  current: V3Ticket
  steps: V3Attribution[]
} {
  const baselineInputs: FiscalResultInputs = { ...inputs, ...BASELINE_OVERRIDES }
  const layers: { id: string; label: string; inputs: FiscalResultInputs; context: V3TicketContext }[] = []
  let acc = baselineInputs
  acc = { ...acc, region: inputs.region }
  layers.push({ id: 'region', label: 'Tu comunidad autónoma', inputs: acc, context: BASELINE_CONTEXT })
  acc = {
    ...acc,
    personalAdjustments: inputs.personalAdjustments,
    children: inputs.children,
    childrenUnder3: inputs.childrenUnder3,
    ascendants: inputs.ascendants,
    ascendantsOver75: inputs.ascendantsOver75,
    disability: inputs.disability,
    dependentDisabilityMinimum: inputs.dependentDisabilityMinimum,
    taxpayerDisabilityAssistanceMinimum: inputs.taxpayerDisabilityAssistanceMinimum,
  }
  layers.push({ id: 'situacion', label: 'Tu situación personal', inputs: acc, context: BASELINE_CONTEXT })
  acc = { ...acc, consumptionTaxes: inputs.consumptionTaxes }
  layers.push({ id: 'compras', label: 'Tu forma de gastar', inputs: acc, context: BASELINE_CONTEXT })
  acc = { ...acc, wealthRecurringTaxAnnual: inputs.wealthRecurringTaxAnnual }
  layers.push({ id: 'patrimonio', label: 'Tu casa y tu coche', inputs: acc, context: BASELINE_CONTEXT })
  layers.push({ id: 'otros', label: 'Grupo, contrato y actividad', inputs, context })

  const baseline = evaluateTicket(baselineInputs, BASELINE_CONTEXT)
  let previous = baseline
  const steps: V3Attribution[] = []
  for (const layer of layers) {
    const ticket = evaluateTicket(layer.inputs, layer.context)
    steps.push({ id: layer.id, label: layer.label, delta: ticket.takeHomePer100 - previous.takeHomePer100 })
    previous = ticket
  }
  return { baseline, current: previous, steps }
}

/*
 * «Trabajas hasta el día D para pagar impuestos y cotizaciones»: la parte del
 * coste del puesto que va a impuestos, contada en días de un año de 365, como
 * si se pagara toda primero. Es una forma de leer el mismo reparto, no un dato
 * nuevo; la pantalla dice cómo se cuenta.
 */
export function taxFreedomDay(ticket: V3Ticket, year = 2025) {
  const share = ticket.laborCost > 0 ? 1 - ticket.takeHome / ticket.laborCost : 0
  const days = Math.min(365, Math.max(0, Math.round(share * 365)))
  const date = new Date(Date.UTC(year, 0, 1))
  date.setUTCDate(date.getUTCDate() + Math.max(0, days - 1))
  return {
    days,
    label: new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(date),
  }
}

/** «2.021 €»: con punto de miles también en cifras de cuatro dígitos (Intl no lo pone en es-ES). */
export function euro(value: number) {
  const rounded = Math.round(value)
  const digits = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${rounded < 0 ? '−' : ''}${digits} €`
}

export const per100 = (value: number, digits = 1) =>
  `${value.toLocaleString('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits })} €`

/** «+0,8 €» / «−1,2 €»; vacío si el cambio no llega a una décima. */
export function signedPer100(delta: number) {
  if (Math.abs(delta) < 0.05) return ''
  const abs = Math.abs(delta).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return `${delta > 0 ? '+' : '−'}${abs} €`
}
