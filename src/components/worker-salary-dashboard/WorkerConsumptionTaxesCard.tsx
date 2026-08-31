import {
  Calculator,
  Car,
  ExternalLink,
  Home,
  Info,
  Lightbulb,
  PenLine,
  Percent,
  Plus,
  Receipt,
  RotateCcw,
  Trash2,
  WalletCards,
} from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TooltipProps } from 'recharts'
import { InfoButton } from '../ui/InfoButton'
import './WorkerConsumptionTaxesCard.css'

type ConsumptionTaxTone = 'green' | 'blue' | 'cyan' | 'orange' | 'purple' | 'red' | 'neutral'

export type ConsumptionTaxCategory = {
  id: string
  label: string
  initialSharePercent: number
  vatRate: number
  specialRate?: number
  statutoryLabel: string
  tone: ConsumptionTaxTone
  note?: string
  help?: string
}

export type ConsumptionTaxLine = ConsumptionTaxCategory & {
  sharePercent: number
  spendAnnual: number
  vatAnnual: number
  specialAnnual: number
  taxAnnual: number
}

export type ConsumptionTaxesResult = {
  lines: ConsumptionTaxLine[]
  assignedSpendAnnual: number
  totalBudgetAnnual: number
  totalSharePercent: number
  vatAnnual: number
  specialTaxesAnnual: number
  propertyTaxAnnual: number
  vehicleTaxAnnual: number
  totalTaxAnnual: number
  effectiveRate: number
}

type WorkerConsumptionTaxesCardProps = {
  categories?: ConsumptionTaxCategory[]
  initialBudgetAnnual?: number
  initialCadastralValue?: number
  initialHasOwnedHome?: boolean
  initialDraft?: ConsumptionTaxesDraft | null
  /** `once` muestra el dialogo de valores medios solo la primera vez. */
  introChoiceMode?: 'once' | 'off'
  onResultChange?: (result: ConsumptionTaxesResult) => void
  onDraftChange?: (draft: ConsumptionTaxesDraft) => void
}

export type ConsumptionTaxesIntroChoice = 'average' | 'manual'

const INTRO_STORAGE_KEY = 'explicando-pensiones.wctc-iva-intro-seen'

function readIntroChoice(): ConsumptionTaxesIntroChoice | null {
  try {
    const stored = window.localStorage.getItem(INTRO_STORAGE_KEY)
    if (stored === 'average' || stored === 'manual') return stored
    if (stored === '1') return 'manual'
    return null
  } catch {
    return null
  }
}

function markIvaIntroChoice(choice: ConsumptionTaxesIntroChoice) {
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, choice)
  } catch {
    // modo privado o cuota: el dialogo puede volver a salir
  }
}

type ConsumptionTaxesIntroDialogProps = {
  open: boolean
  onChoose: (choice: ConsumptionTaxesIntroChoice) => void
}

export function ConsumptionTaxesIntroDialog({
  open,
  onChoose,
}: ConsumptionTaxesIntroDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const firstChoiceRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    firstChoiceRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onChoose('manual')
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onChoose])

  if (!open) return null

  return (
    <div className="wctc-intro-layer" role="presentation">
      <div className="wctc-intro-backdrop" />
      <section
        className="wctc-intro-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="wctc-intro-header">
          <span className="wctc-intro-icon" aria-hidden="true">
            <Receipt size={26} strokeWidth={2.1} />
          </span>
          <div>
            <h2 id={titleId}>¿Cómo quieres rellenar el IVA?</h2>
            <p id={descriptionId}>
            Ahora vamos a calcular cuánto pagas de IVA. Puedes utilizar los valores por defecto, basados en el gasto medio de una persona en España, o introducir tus propios gastos manualmente para obtener una estimación más ajustada a ti.
            </p>
          </div>
        </header>

        <div className="wctc-intro-choices">
          <button
            ref={firstChoiceRef}
            type="button"
            className="wctc-intro-choice wctc-intro-choice--average"
            onClick={() => onChoose('average')}
          >
            <span>
              <strong>Usar valores medios</strong>
              <small>
                Rellena cada categoría con un porcentaje orientativo del gasto
                medio en España. Luego puedes ajustarlo.
              </small>
            </span>
          </button>

          <button
            type="button"
            className="wctc-intro-choice"
            onClick={() => onChoose('manual')}
          >
            <PenLine size={22} aria-hidden="true" />
            <span>
              <strong>Rellenarlos yo</strong>
              <small>
                Abre la app de tu banco. Según el banco, suele haber un resumen
                de gasto por categorías (alimentación, ocio, transporte…)
                para copiar importe y %.
              </small>
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}

const DEFAULT_BUDGET_ANNUAL = 28145.92

const CATASTRO_URL = 'https://www.sedecatastro.gob.es/'

const IBI_HELP =
  'El IBI (Impuesto sobre Bienes Inmuebles) lo cobra tu ayuntamiento por la vivienda en propiedad. Este bloque es opcional y no forma parte del reparto del 100 % de gasto. La calculadora estima una cuota anual aproximada como valor catastral x tipo IBI; el tipo real lo fija cada municipio y puede variar bastante. No es IVA ni impuesto especial de consumo.'

type OwnershipAnswer = 'unanswered' | 'yes' | 'no'

type PropertyIbi = {
  id: string
  cadastralValue: number
  ibiRatePercent: number
}

const PURCHASE_TAX_HELP =
  'Al comprar una vivienda nueva se paga IVA (10 % en peninsula y Baleares; IGIC en Canarias) mas AJD, que varia por comunidad autonoma. En segunda mano se paga ITP: la primera vivienda habitual suele tener tipos reducidos, pero la segunda o mas tributa al tipo general, mas alto en muchas CCAA. Son pagos unicos en la compra, no mensuales como el IBI. Los tipos aqui son orientativos y no incluyen bonificaciones por edad, ingresos o VPO.'

const CAR_PURCHASE_TAX_HELP =
  'Al comprar un coche nuevo se paga IVA (21 % en peninsula y Baleares; IGIC en Canarias) incluido en el precio, mas el impuesto de matriculacion segun las emisiones de CO2. En segunda mano a un particular no hay IVA, pero suele pagarse ITP al transferir la titularidad; a un concesionario el precio suele llevar IVA. Son pagos unicos en la compra; no son el IVTM anual ni el gasto mensual de gasolina. Los tipos aqui son orientativos y no incluyen bonificaciones ni regimenes especiales.'

const IVTM_HELP =
  'El IVTM (impuesto sobre vehiculos de traccion mecanica), tambien llamado impuesto de circulacion, lo cobra tu ayuntamiento por tener un vehiculo matriculado. Este bloque es opcional y no forma parte del reparto del 100 % de gasto. La calculadora estima una cuota anual aproximada como potencia fiscal x tipo IVTM; el tipo real lo fija cada municipio segun CV, combustible y antiguedad. No es IVA ni impuesto de compra.'

type ResidenceRole = 'habitual' | 'additional'

type PropertyPurchase = {
  id: string
  purchasePrice: number
  region: string
  propertyType: 'new' | 'used'
  residenceRole: ResidenceRole
}

const DEFAULT_IBI_RATE_PERCENT = 0.6

const REGION_OPTIONS = [
  { value: 'madrid', label: 'Madrid' },
  { value: 'andalucia', label: 'Andalucia' },
  { value: 'aragon', label: 'Aragon' },
  { value: 'asturias', label: 'Asturias' },
  { value: 'illes_balears', label: 'Illes Balears' },
  { value: 'canarias', label: 'Canarias' },
  { value: 'cantabria', label: 'Cantabria' },
  { value: 'castilla_la_mancha', label: 'Castilla-La Mancha' },
  { value: 'castilla_y_leon', label: 'Castilla y Leon' },
  { value: 'cataluna', label: 'Cataluna' },
  { value: 'extremadura', label: 'Extremadura' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'murcia', label: 'Region de Murcia' },
  { value: 'la_rioja', label: 'La Rioja' },
  { value: 'comunitat_valenciana', label: 'Comunitat Valenciana' },
] as const

/** Tipos ITP orientativos para primera vivienda habitual (sin bonificaciones extra de edad o ingresos). */
const ITP_HABITUAL_RATES_PERCENT: Record<string, number> = {
  andalucia: 7,
  aragon: 8,
  asturias: 8,
  illes_balears: 8,
  canarias: 6.5,
  cantabria: 9,
  castilla_la_mancha: 9,
  castilla_y_leon: 8,
  cataluna: 10,
  extremadura: 8,
  galicia: 8,
  madrid: 6,
  murcia: 8,
  la_rioja: 7,
  comunitat_valenciana: 10,
}

/** Tipos ITP orientativos para segunda vivienda o mas (tipo general sin bonificaciones). */
const ITP_ADDITIONAL_RATES_PERCENT: Record<string, number> = {
  andalucia: 7,
  aragon: 8,
  asturias: 8,
  illes_balears: 11,
  canarias: 6.5,
  cantabria: 10,
  castilla_la_mancha: 9,
  castilla_y_leon: 10,
  cataluna: 10,
  extremadura: 11,
  galicia: 10,
  madrid: 6,
  murcia: 8,
  la_rioja: 7,
  comunitat_valenciana: 10,
}

const NEW_HOUSING_VAT_RATE_PERCENT = 10
const CANARIAS_IGIC_RATE_PERCENT = 6.5

/** AJD orientativo en compra de obra nueva; varia por CCAA. */
const AJD_RATES_PERCENT: Record<string, number> = {
  andalucia: 1.2,
  aragon: 1.5,
  asturias: 1.2,
  illes_balears: 1.2,
  canarias: 0.75,
  cantabria: 1.5,
  castilla_la_mancha: 1.5,
  castilla_y_leon: 1.5,
  cataluna: 1.5,
  extremadura: 1.5,
  galicia: 1.5,
  madrid: 0.75,
  murcia: 1.5,
  la_rioja: 1,
  comunitat_valenciana: 1.5,
}

function getItpRate(region: string, residenceRole: ResidenceRole) {
  const table = residenceRole === 'habitual' ? ITP_HABITUAL_RATES_PERCENT : ITP_ADDITIONAL_RATES_PERCENT
  return table[region] ?? (residenceRole === 'habitual' ? 7 : 9)
}

function getIncludedPurchaseTaxRate(region: string) {
  return region === 'canarias' ? CANARIAS_IGIC_RATE_PERCENT : NEW_HOUSING_VAT_RATE_PERCENT
}

function getIncludedPurchaseTaxLabel(region: string) {
  return region === 'canarias' ? 'IGIC' : 'IVA'
}

function createPurchaseId() {
  return `purchase-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createPropertyIbiId() {
  return `ibi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createEmptyPropertyIbi(): PropertyIbi {
  return {
    id: createPropertyIbiId(),
    cadastralValue: 0,
    ibiRatePercent: DEFAULT_IBI_RATE_PERCENT,
  }
}

function calculatePropertyIbiAnnual(property: PropertyIbi) {
  return property.cadastralValue * (property.ibiRatePercent / 100)
}

function OwnershipGate({
  question,
  description,
  answer,
  onYes,
  onNo,
  children,
}: {
  question: string
  description: string
  answer: OwnershipAnswer
  onYes: () => void
  onNo: () => void
  children?: ReactNode
}) {
  return (
    <section className={`wctc-ownership-gate is-${answer}`} aria-label={question}>
      <div className="wctc-ownership-gate__top">
        <div className="wctc-ownership-gate__prompt">
          <span aria-hidden="true">?</span>
          <div>
            <h4>{question}</h4>
            <p>{description}</p>
          </div>
        </div>
        <div className="wctc-ownership-gate__choices" role="group" aria-label={`Respuesta: ${question}`}>
          <button
            type="button"
            className={answer === 'yes' ? 'is-selected' : ''}
            onClick={onYes}
          >
            Sí
          </button>
          <button
            type="button"
            className={answer === 'no' ? 'is-selected' : ''}
            onClick={onNo}
          >
            No
          </button>
        </div>
      </div>
      {answer === 'yes' && children ? (
        <div className="wctc-ownership-gate__body">{children}</div>
      ) : null}
      {answer === 'no' ? (
        <p className="wctc-ownership-gate__skip">
          De acuerdo, no estimaremos impuestos de este apartado. Puedes cambiar la respuesta cuando quieras.
        </p>
      ) : null}
    </section>
  )
}

function createEmptyPurchase(residenceRole: ResidenceRole = 'habitual'): PropertyPurchase {
  return {
    id: createPurchaseId(),
    purchasePrice: 0,
    region: 'madrid',
    propertyType: 'used',
    residenceRole,
  }
}

type VehicleCondition = 'new' | 'used_dealer' | 'used_private'
type RegistrationCo2Tier = 'exempt' | 'low' | 'medium' | 'high'

type VehiclePurchase = {
  id: string
  purchasePrice: number
  region: string
  condition: VehicleCondition
  co2Tier: RegistrationCo2Tier
}

const NEW_CAR_VAT_RATE_PERCENT = 21
const CAR_IGIC_RATE_PERCENT = 7

const REGISTRATION_TAX_RATES_PERCENT: Record<RegistrationCo2Tier, number> = {
  exempt: 0,
  low: 4.75,
  medium: 9.75,
  high: 14.75,
}

/** ITP orientativo en compraventa entre particulares; varia por CCAA. */
const VEHICLE_ITP_RATES_PERCENT: Record<string, number> = {
  andalucia: 4.5,
  aragon: 4,
  asturias: 4,
  illes_balears: 4,
  canarias: 5.5,
  cantabria: 5,
  castilla_la_mancha: 6,
  castilla_y_leon: 5,
  cataluna: 5,
  extremadura: 4,
  galicia: 5,
  madrid: 4,
  murcia: 4,
  la_rioja: 4,
  comunitat_valenciana: 6,
}

function createVehicleId() {
  return `vehicle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createEmptyVehiclePurchase(): VehiclePurchase {
  return {
    id: createVehicleId(),
    purchasePrice: 0,
    region: 'madrid',
    condition: 'used_private',
    co2Tier: 'medium',
  }
}

type VehicleIvtm = {
  id: string
  fiscalPowerCv: number
  ivtmRatePerCv: number
}

const DEFAULT_IVTM_RATE_PER_CV = 9.5

function createVehicleIvtmId() {
  return `ivtm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createEmptyVehicleIvtm(): VehicleIvtm {
  return {
    id: createVehicleIvtmId(),
    fiscalPowerCv: 0,
    ivtmRatePerCv: DEFAULT_IVTM_RATE_PER_CV,
  }
}

function calculateVehicleIvtmAnnual(vehicle: VehicleIvtm) {
  return vehicle.fiscalPowerCv * vehicle.ivtmRatePerCv
}

export interface ConsumptionTaxesDraft {
  budgetAnnual: number
  sharePercents: Record<string, number>
  hasOwnedHome: OwnershipAnswer
  ownsVehicle: OwnershipAnswer
  propertyIbis: PropertyIbi[]
  propertyPurchases: PropertyPurchase[]
  vehiclePurchases: VehiclePurchase[]
  vehicleIvtms: VehicleIvtm[]
}

function getVehicleIncludedTaxRate(region: string) {
  return region === 'canarias' ? CAR_IGIC_RATE_PERCENT : NEW_CAR_VAT_RATE_PERCENT
}

function getVehicleIncludedTaxLabel(region: string) {
  return region === 'canarias' ? 'IGIC' : 'IVA'
}

function calculatePurchaseTax(purchase: PropertyPurchase) {
  if (purchase.purchasePrice <= 0) return 0

  if (purchase.propertyType === 'new') {
    const includedRate = getIncludedPurchaseTaxRate(purchase.region)
    const includedTax = purchase.purchasePrice * (includedRate / (100 + includedRate))
    const ajdRate = AJD_RATES_PERCENT[purchase.region] ?? 1.2
    const ajdTax = purchase.purchasePrice * (ajdRate / 100)
    return includedTax + ajdTax
  }

  const itpRate = getItpRate(purchase.region, purchase.residenceRole)
  return purchase.purchasePrice * (itpRate / 100)
}

function calculateVehiclePurchaseTax(purchase: VehiclePurchase) {
  if (purchase.purchasePrice <= 0) return 0

  const includedRate = getVehicleIncludedTaxRate(purchase.region)

  if (purchase.condition === 'new') {
    const includedTax = purchase.purchasePrice * (includedRate / (100 + includedRate))
    const baseBeforeIncludedTax = purchase.purchasePrice - includedTax
    const registrationRate = REGISTRATION_TAX_RATES_PERCENT[purchase.co2Tier]
    const registrationTax = baseBeforeIncludedTax * (registrationRate / 100)
    return includedTax + registrationTax
  }

  if (purchase.condition === 'used_dealer') {
    return purchase.purchasePrice * (includedRate / (100 + includedRate))
  }

  const itpRate = VEHICLE_ITP_RATES_PERCENT[purchase.region] ?? 5
  return purchase.purchasePrice * (itpRate / 100)
}

const DEFAULT_CATEGORIES: ConsumptionTaxCategory[] = [
  {
    id: 'saving',
    label: 'Ahorro / inversion',
    initialSharePercent: 0,
    vatRate: 0,
    statutoryLabel: '0% ahora',
    tone: 'green',
    help: 'No es consumo corriente ni deuda: aqui va el dinero que reservas en lugar de gastarlo ya. Depositos, fondos, acciones, aportaciones a pensiones privadas... No paga IVA al guardarlo, pero lo que luego compres con ese dinero si tributara en su categoria.',
  },
  {
    id: 'mortgage-debt',
    label: 'Hipoteca / deudas',
    initialSharePercent: 0,
    vatRate: 0,
    statutoryLabel: '0% en la cuota',
    tone: 'neutral',
    note: 'Mas abajo puedes estimar el IVA o ITP pagado al comprar.',
    help: 'No lo sumamos aquí. Esta calculadora estima el IVA que pagas ahora, cada mes. La cuota de hipoteca o préstamo no lleva IVA: estás devolviendo dinero, no comprando otra vez. El IVA o el ITP ya se pagó al adquirir (IVA si era nuevo; ITP si era de segunda mano) y no se reparte entre las cuotas, porque fue un pago único de entonces. El alquiler de vivienda habitual tampoco lleva IVA. El impuesto recurrente de la vivienda en propiedad es el IBI, más abajo.',
  },
  {
    id: 'basic-food',
    label: 'Alimentacion basica',
    initialSharePercent: 0,
    vatRate: 4,
    statutoryLabel: '4%',
    tone: 'green',
    help: 'La frontera legal del IVA (4 % vs 10 %) no es obvia. Basica: pan, leche, huevos, fruta/verdura fresca, etc. General: resto de comida del supermercado no incluida en la basica.',
  },
  {
    id: 'general-food',
    label: 'Alimentacion general',
    initialSharePercent: 0,
    vatRate: 10,
    statutoryLabel: '10%',
    tone: 'orange',
    help: 'La frontera legal del IVA (4 % vs 10 %) no es obvia. Basica: pan, leche, huevos, fruta/verdura fresca, etc. General: resto de comida del supermercado no incluida en la basica.',
  },
  {
    id: 'restaurants',
    label: 'Restaurantes / delivery',
    initialSharePercent: 0,
    vatRate: 10,
    statutoryLabel: '10%',
    tone: 'orange',
    help: 'Comidas fuera de casa y delivery. Puede solaparse con alimentacion general si compras comida preparada para llevar; aqui va lo que consumes en restaurante o te lo traen a domicilio.',
  },
  {
    id: 'shopping',
    label: 'Compras generales',
    initialSharePercent: 0,
    vatRate: 21,
    statutoryLabel: '21%',
    tone: 'blue',
    help: 'Es el cajon de sastre del 21 %. Ropa, electronica, muebles, higiene no farmaceutica, etc. Lo que no encaje en otra fila.',
  },
  {
    id: 'leisure',
    label: 'Ocio / suscripciones *',
    initialSharePercent: 0,
    vatRate: 21,
    statutoryLabel: '21%',
    tone: 'purple',
    note: 'Algunos servicios de ocio o cultura pueden tributar al 10%.',
    help: 'Streaming, gimnasio, cine, videojuegos... Por defecto 21 %; algunos servicios culturales/de ocio pueden ir al 10 %.',
  },
  { id: 'public-transport', label: 'Transporte publico', initialSharePercent: 0, vatRate: 10, statutoryLabel: '10%', tone: 'green' },
  {
    id: 'fuel',
    label: 'Gasolina',
    initialSharePercent: 0,
    vatRate: 21,
    specialRate: 20,
    statutoryLabel: '21% + 20%',
    tone: 'orange',
    note: 'Mas abajo puedes estimar el IVA o ITP de la compra y el IVTM anual.',
    help: 'El tipo 21 % + 20 % mezcla IVA e impuesto especial sobre hidrocarburos. El segundo no es IVA: es un tributo distinto que se suma al precio en surtidor.',
  },
  {
    id: 'electricity',
    label: 'Electricidad',
    initialSharePercent: 0,
    vatRate: 21,
    specialRate: 5.11,
    statutoryLabel: '21% + 5,11%',
    tone: 'cyan',
    help: 'El 21 % + 5,11 % combina IVA e impuesto especial sobre la electricidad. Esta fila no incluye gas, agua u otros suministros si no los has repartido en otra categoria.',
  },
  {
    id: 'health',
    label: 'Salud / farmacia *',
    initialSharePercent: 0,
    vatRate: 0,
    statutoryLabel: '0%',
    tone: 'cyan',
    note: 'Segun el caso, algunos productos o servicios pueden tributar a tipos superiores, incluso al 21%.',
    help: 'Medicamentos con receta y productos sanitarios basicos suelen ir al 0 % o tipos reducidos; otros productos de farmacia/parafarmacia (cosmetica, optica...) pueden ir al 21 %.',
  },
  {
    id: 'tobacco',
    label: 'Tabaco',
    initialSharePercent: 0,
    vatRate: 21,
    specialRate: 55,
    statutoryLabel: '21% + 55%',
    tone: 'red',
    help: 'Cigarrillos, tabaco de liar y productos derivados del tabaco. El 21 % + 55 % combina IVA e impuesto especial: el segundo no es IVA y pesa mucho en el precio final.',
  },
  {
    id: 'alcohol',
    label: 'Alcohol',
    initialSharePercent: 0,
    vatRate: 21,
    specialRate: 5,
    statutoryLabel: '21% + 5%',
    tone: 'orange',
    help: 'Bebidas alcoholicas: cerveza, vino, licores, etc. El 21 % + 5 % mezcla IVA e impuesto especial sobre el alcohol; el tipo especial varia segun producto, aqui usamos una cifra orientativa.',
  },
]

/** Reparto orientativo (% del gasto) inspirado en patron medio espanol: vivienda ~34 %, alimentacion ~22 %, transporte ~9 %, etc. */
const AVERAGE_SPAIN_SHARE_PRESETS: Record<string, number> = {
  saving: 8,
  'mortgage-debt': 34,
  'basic-food': 7,
  'general-food': 10,
  restaurants: 5,
  shopping: 11,
  leisure: 7,
  'public-transport': 4,
  fuel: 5,
  electricity: 4,
  health: 3,
  tobacco: 0.5,
  alcohol: 1.5,
}

function formatEuro(value: number, decimals = 2) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function formatNumber(value: number, decimals = 2) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

type SpendChartSlice = {
  id: string
  name: string
  sharePercent: number
  amountMonthly: number
  color: string
}

function getCategoryChartColor(categoryId: string) {
  return `var(--wctc-chart-${categoryId})`
}

type SpendDonutTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    payload?: SpendChartSlice
  }>
}

function SpendDonutTooltip({ active, payload }: SpendDonutTooltipProps) {
  const slice = payload?.[0]?.payload
  if (!active || !slice) return null

  return (
    <div className="wctc-spend-chart__tooltip" role="status">
      <strong>{slice.name}</strong>
      <span>{formatNumber(slice.sharePercent)} % del gasto</span>
      <span>{formatEuro(slice.amountMonthly)} / mes</span>
    </div>
  )
}

type ConsumptionSpendDonutProps = {
  lines: ConsumptionTaxLine[]
  monthlyTotal: number
}

function ConsumptionSpendDonut({ lines, monthlyTotal }: ConsumptionSpendDonutProps) {
  const slices = useMemo<SpendChartSlice[]>(() => (
    lines
      .filter((line) => line.sharePercent > 0.005)
      .map((line) => ({
        id: line.id,
        name: line.label.replace(/\s*\*$/, '').trim(),
        sharePercent: line.sharePercent,
        amountMonthly: line.spendAnnual / 12,
        color: getCategoryChartColor(line.id),
      }))
  ), [lines])

  const chartSummary = slices.length > 0
    ? slices.map((slice) => `${slice.name}: ${formatNumber(slice.sharePercent)} %`).join('; ')
    : 'Sin gasto asignado'

  if (slices.length === 0) {
    return (
      <figure className="wctc-spend-chart wctc-spend-chart--empty" aria-label={chartSummary}>
        <figcaption className="wctc-spend-chart__title">Distribución del gasto</figcaption>
        <p>Asigna importe o porcentaje a las categorías para ver el reparto.</p>
      </figure>
    )
  }

  return (
    <figure className="wctc-spend-chart" aria-label={`Distribución del gasto. ${chartSummary}`}>
      <figcaption className="wctc-spend-chart__title">Distribución del gasto</figcaption>
      <div className="wctc-spend-chart__body">
        <div className="wctc-spend-chart__viz">
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="sharePercent"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="56%"
                outerRadius="84%"
                paddingAngle={slices.length > 1 ? 1.5 : 0}
                strokeWidth={2}
                stroke="transparent"
              >
                {slices.map((slice) => (
                  <Cell key={slice.id} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip content={<SpendDonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="wctc-spend-chart__center" aria-hidden="true">
            <strong>{formatEuro(monthlyTotal)}</strong>
            <span>al mes</span>
          </div>
        </div>

        <ul className="wctc-spend-chart__legend">
          {slices.map((slice) => (
            <li key={slice.id}>
              <span
                className="wctc-spend-chart__swatch"
                style={{ background: slice.color, boxShadow: `0 0 10px color-mix(in srgb, ${slice.color} 45%, transparent)` }}
                aria-hidden="true"
              />
              <span className="wctc-spend-chart__legend-label">{slice.name}</span>
              <span className="wctc-spend-chart__legend-value">{formatNumber(slice.sharePercent)} %</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

function getAverageConsumptionTaxRate(
  lines: ConsumptionTaxLine[],
  assignedSpendAnnual: number,
  vatAnnual: number,
  specialTaxesAnnual: number,
) {
  if (assignedSpendAnnual > 0) {
    return ((vatAnnual + specialTaxesAnnual) / assignedSpendAnnual) * 100
  }

  const totalSharePercent = lines.reduce((total, line) => total + line.sharePercent, 0)
  if (totalSharePercent <= 0) return 0

  return lines.reduce(
    (total, line) => total + line.sharePercent * (line.vatRate + (line.specialRate ?? 0)),
    0,
  ) / totalSharePercent
}

function clampNumber(value: number, min = 0, max = Number.POSITIVE_INFINITY) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function getPurchaseTaxLabel(purchase: PropertyPurchase) {
  if (purchase.propertyType === 'new') {
    const includedLabel = getIncludedPurchaseTaxLabel(purchase.region)
    const includedRate = getIncludedPurchaseTaxRate(purchase.region)
    const ajdRate = AJD_RATES_PERCENT[purchase.region] ?? 1.2
    return `${includedLabel} ${formatNumber(includedRate)} % + AJD ${formatNumber(ajdRate)} %`
  }

  const itpRate = getItpRate(purchase.region, purchase.residenceRole)
  const roleLabel = purchase.residenceRole === 'habitual' ? 'habitual' : '2ª o mas'
  return `ITP ${formatNumber(itpRate)} % (${roleLabel})`
}

function getVehiclePurchaseTaxLabel(purchase: VehiclePurchase) {
  const includedLabel = getVehicleIncludedTaxLabel(purchase.region)
  const includedRate = getVehicleIncludedTaxRate(purchase.region)

  if (purchase.condition === 'new') {
    const registrationRate = REGISTRATION_TAX_RATES_PERCENT[purchase.co2Tier]
    return `${includedLabel} ${formatNumber(includedRate)} % + matriculacion ${formatNumber(registrationRate)} %`
  }

  if (purchase.condition === 'used_dealer') {
    return `${includedLabel} ${formatNumber(includedRate)} %`
  }

  const itpRate = VEHICLE_ITP_RATES_PERCENT[purchase.region] ?? 5
  return `ITP ${formatNumber(itpRate)} % (particular)`
}

export function WorkerConsumptionTaxesCard({
  categories = DEFAULT_CATEGORIES,
  initialBudgetAnnual = DEFAULT_BUDGET_ANNUAL,
  initialCadastralValue = 0,
  initialHasOwnedHome = false,
  initialDraft = null,
  introChoiceMode = 'once',
  onResultChange,
  onDraftChange,
}: WorkerConsumptionTaxesCardProps) {
  const storedIntroChoice = introChoiceMode === 'once' ? readIntroChoice() : null
  const [budgetAnnual, setBudgetAnnual] = useState(
    initialDraft?.budgetAnnual ?? initialBudgetAnnual,
  )
  const [shares, setShares] = useState(() =>
    categories.map((category) => ({
      ...category,
      sharePercent: initialDraft?.sharePercents[category.id]
        ?? (storedIntroChoice === 'average'
          ? AVERAGE_SPAIN_SHARE_PRESETS[category.id] ?? 0
          : category.initialSharePercent),
    })),
  )
  const [hasOwnedHome, setHasOwnedHome] = useState<OwnershipAnswer>(() => (
    initialDraft?.hasOwnedHome
    ?? (initialHasOwnedHome || initialCadastralValue > 0 ? 'yes' : 'unanswered')
  ))
  const [ownsVehicle, setOwnsVehicle] = useState<OwnershipAnswer>(
    () => initialDraft?.ownsVehicle ?? 'unanswered',
  )
  const [propertyIbis, setPropertyIbis] = useState<PropertyIbi[]>(() => (
    initialDraft?.propertyIbis.length
      ? initialDraft.propertyIbis.map((property) => ({ ...property }))
      : [{
        ...createEmptyPropertyIbi(),
        cadastralValue: initialCadastralValue,
      }]
  ))
  const [propertyPurchases, setPropertyPurchases] = useState<PropertyPurchase[]>(() => (
    initialDraft?.propertyPurchases.length
      ? initialDraft.propertyPurchases.map((purchase) => ({ ...purchase }))
      : [createEmptyPurchase()]
  ))
  const [vehiclePurchases, setVehiclePurchases] = useState<VehiclePurchase[]>(() => (
    initialDraft?.vehiclePurchases.length
      ? initialDraft.vehiclePurchases.map((purchase) => ({ ...purchase }))
      : [createEmptyVehiclePurchase()]
  ))
  const [vehicleIvtms, setVehicleIvtms] = useState<VehicleIvtm[]>(() => (
    initialDraft?.vehicleIvtms.length
      ? initialDraft.vehicleIvtms.map((vehicle) => ({ ...vehicle }))
      : [createEmptyVehicleIvtm()]
  ))
  const [introOpen, setIntroOpen] = useState(() => (
    introChoiceMode === 'once' && storedIntroChoice === null && initialDraft === null
  ))

  useEffect(() => {
    if (initialDraft) return
    setBudgetAnnual(initialBudgetAnnual)
  }, [initialBudgetAnnual, initialDraft])

  const propertyTaxAnnual = hasOwnedHome === 'yes'
    ? propertyIbis.reduce((total, property) => total + calculatePropertyIbiAnnual(property), 0)
    : 0
  const vehicleTaxAnnual = ownsVehicle === 'yes'
    ? vehicleIvtms.reduce((total, vehicle) => total + calculateVehicleIvtmAnnual(vehicle), 0)
    : 0
  const purchaseTaxTotal = propertyPurchases.reduce((total, purchase) => total + calculatePurchaseTax(purchase), 0)
  const vehiclePurchaseTaxTotal = vehiclePurchases.reduce(
    (total, purchase) => total + calculateVehiclePurchaseTax(purchase),
    0,
  )

  const result = useMemo<ConsumptionTaxesResult>(() => {
    const lines = shares.map((row) => {
      const spendAnnual = budgetAnnual * (row.sharePercent / 100)
      const vatAnnual = spendAnnual * (row.vatRate / 100)
      const specialAnnual = spendAnnual * ((row.specialRate ?? 0) / 100)

      return {
        ...row,
        spendAnnual,
        vatAnnual,
        specialAnnual,
        taxAnnual: vatAnnual + specialAnnual,
      }
    })
    const assignedSpendAnnual = lines.reduce((total, line) => total + line.spendAnnual, 0)
    const totalSharePercent = lines.reduce((total, line) => total + line.sharePercent, 0)
    const vatAnnual = lines.reduce((total, line) => total + line.vatAnnual, 0)
    const specialTaxesAnnual = lines.reduce((total, line) => total + line.specialAnnual, 0)
    const totalTaxAnnual = vatAnnual + specialTaxesAnnual + propertyTaxAnnual + vehicleTaxAnnual

    return {
      lines,
      assignedSpendAnnual,
      totalBudgetAnnual: budgetAnnual,
      totalSharePercent,
      vatAnnual,
      specialTaxesAnnual,
      propertyTaxAnnual,
      vehicleTaxAnnual,
      totalTaxAnnual,
      effectiveRate: assignedSpendAnnual > 0 ? (totalTaxAnnual / assignedSpendAnnual) * 100 : 0,
    }
  }, [budgetAnnual, propertyTaxAnnual, shares, vehicleTaxAnnual])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  useEffect(() => {
    onDraftChange?.({
      budgetAnnual,
      sharePercents: Object.fromEntries(shares.map((row) => [row.id, row.sharePercent])),
      hasOwnedHome,
      ownsVehicle,
      propertyIbis,
      propertyPurchases,
      vehiclePurchases,
      vehicleIvtms,
    })
  }, [
    budgetAnnual,
    hasOwnedHome,
    onDraftChange,
    ownsVehicle,
    propertyIbis,
    propertyPurchases,
    shares,
    vehicleIvtms,
    vehiclePurchases,
  ])

  function updateShare(id: string, nextSharePercent: number) {
    setShares((current) =>
      current.map((row) => (
        row.id === id ? { ...row, sharePercent: clampNumber(nextSharePercent, 0, 100) } : row
      )),
    )
  }

  function updateAmount(id: string, nextMonthlyAmount: number) {
    const budgetMonthly = budgetAnnual / 12
    const sharePercent = budgetMonthly > 0
      ? (clampNumber(nextMonthlyAmount, 0, budgetMonthly) / budgetMonthly) * 100
      : 0
    updateShare(id, sharePercent)
  }

  function applyAverageSharePresets() {
    setShares((current) =>
      current.map((row) => ({
        ...row,
        sharePercent: AVERAGE_SPAIN_SHARE_PRESETS[row.id] ?? 0,
      })),
    )
  }

  function resetShares() {
    setShares(
      categories.map((category) => ({
        ...category,
        sharePercent: category.initialSharePercent,
      })),
    )
  }

  const handleIntroChoice = useCallback((choice: ConsumptionTaxesIntroChoice) => {
    if (choice === 'average') {
      setShares((current) =>
        current.map((row) => ({
          ...row,
          sharePercent: AVERAGE_SPAIN_SHARE_PRESETS[row.id] ?? 0,
        })),
      )
    }
    if (introChoiceMode === 'once') markIvaIntroChoice(choice)
    setIntroOpen(false)
  }, [introChoiceMode])

  function updatePurchase(id: string, patch: Partial<Omit<PropertyPurchase, 'id'>>) {
    setPropertyPurchases((current) =>
      current.map((purchase) => (purchase.id === id ? { ...purchase, ...patch } : purchase)),
    )
  }

  function addPurchase() {
    setPropertyPurchases((current) => [...current, createEmptyPurchase('additional')])
  }

  function removePurchase(id: string) {
    setPropertyPurchases((current) => (
      current.length <= 1 ? current : current.filter((purchase) => purchase.id !== id)
    ))
  }

  function updateVehiclePurchase(id: string, patch: Partial<Omit<VehiclePurchase, 'id'>>) {
    setVehiclePurchases((current) =>
      current.map((purchase) => (purchase.id === id ? { ...purchase, ...patch } : purchase)),
    )
  }

  function addVehiclePurchase() {
    setVehiclePurchases((current) => [...current, createEmptyVehiclePurchase()])
  }

  function removeVehiclePurchase(id: string) {
    setVehiclePurchases((current) => (
      current.length <= 1 ? current : current.filter((purchase) => purchase.id !== id)
    ))
  }

  function updatePropertyIbi(id: string, patch: Partial<Omit<PropertyIbi, 'id'>>) {
    setPropertyIbis((current) =>
      current.map((property) => (property.id === id ? { ...property, ...patch } : property)),
    )
  }

  function addPropertyIbi() {
    setPropertyIbis((current) => [...current, createEmptyPropertyIbi()])
  }

  function removePropertyIbi(id: string) {
    setPropertyIbis((current) => (
      current.length <= 1 ? current : current.filter((property) => property.id !== id)
    ))
  }

  function handleOwnedHomeNo() {
    setHasOwnedHome('no')
    setPropertyIbis([createEmptyPropertyIbi()])
    setPropertyPurchases([createEmptyPurchase()])
  }

  function updateVehicleIvtm(id: string, patch: Partial<Omit<VehicleIvtm, 'id'>>) {
    setVehicleIvtms((current) =>
      current.map((vehicle) => (vehicle.id === id ? { ...vehicle, ...patch } : vehicle)),
    )
  }

  function addVehicleIvtm() {
    setVehicleIvtms((current) => [...current, createEmptyVehicleIvtm()])
  }

  function removeVehicleIvtm(id: string) {
    setVehicleIvtms((current) => (
      current.length <= 1 ? current : current.filter((vehicle) => vehicle.id !== id)
    ))
  }

  function handleOwnsVehicleNo() {
    setOwnsVehicle('no')
    setVehiclePurchases([createEmptyVehiclePurchase()])
    setVehicleIvtms([createEmptyVehicleIvtm()])
  }

  const maxLineAmount = Math.max(...result.lines.map((line) => line.spendAnnual), 1)
  const toMonthly = (value: number) => value / 12
  const totalStatus = Math.abs(result.totalSharePercent - 100) <= 0.05 ? 'ok' : 'warn'
  const shareDifference = 100 - result.totalSharePercent
  const shareGapPercent = Math.abs(shareDifference)
  const amountGapMonthly = toMonthly(budgetAnnual * shareGapPercent / 100)
  const averageConsumptionTaxRate = getAverageConsumptionTaxRate(
    result.lines,
    result.assignedSpendAnnual,
    result.vatAnnual,
    result.specialTaxesAnnual,
  )
  const showAverageConsumptionTaxRate = result.assignedSpendAnnual > 0 || result.totalSharePercent > 0
  const formatShareOfSpend = (value: number) => result.assignedSpendAnnual > 0
    ? `${formatNumber((value / result.assignedSpendAnnual) * 100)}% del gasto`
    : 'Sin gasto asignado'

  return (
    <>
    <ConsumptionTaxesIntroDialog open={introOpen} onChoose={handleIntroChoice} />
    <section className="wctc" aria-labelledby="wctc-title">
      <header className="wctc-header">
        <div className="wctc-heading">
          <span className="wctc-step"><span aria-hidden="true" />Paso 7 de 10</span>
          <h2 id="wctc-title">7. IVA y otros impuestos</h2>
          <p>Distribuye tu gasto y calcula cuanto pagas al mes en IVA e impuestos especiales.</p>
        </div>

        <div className="wctc-header-actions">
          <button type="button" className="wctc-action wctc-action--primary" onClick={applyAverageSharePresets}>
            <span>Valores medios (España)</span>
          </button>
          <button type="button" className="wctc-action" onClick={resetShares}>
            <RotateCcw size={18} aria-hidden="true" />
            <span>Restablecer</span>
          </button>
        </div>
      </header>

      <aside className="wctc-tip" role="note">
        <Lightbulb size={20} aria-hidden="true" />
        <p>
          <strong>Consejo.</strong> En la app de tu banco suele aparecer el gasto mensual y el
          porcentaje de cada categoria (alimentacion, ocio, transporte...). Usa esas cifras
          para rellenar importe y % con tu patron real, no con una media.
        </p>
      </aside>

      <div className="wctc-layout">
        <section className="wctc-left" aria-label="Distribucion del gasto">
          <ConsumptionSpendDonut
            lines={result.lines}
            monthlyTotal={toMonthly(result.assignedSpendAnnual)}
          />
          <div className="wctc-spend-scroll">
            <div className="wctc-grid-head" aria-hidden="true">
              <span>Categoria de gasto</span>
              <span>Tipo impositivo / regla</span>
              <span>Importe mensual (€)</span>
              <span>% del gasto</span>
              <span />
            </div>

            <div className="wctc-rows">
            {result.lines.map((line, index) => (
              <article key={line.id} className={`wctc-row wctc-row--${line.tone}`}>
                <div className="wctc-category">
                  <span className="wctc-index">{index + 1}</span>
                  <span className="wctc-category-dot" aria-hidden="true" />
                  <span className="wctc-category-label">
                    <span className="wctc-category-copy">
                      <strong>{line.label}</strong>
                      {line.note && <small className="wctc-row-note">{line.note}</small>}
                    </span>
                    {line.help && (
                      <InfoButton
                        label={`Que incluye ${line.label.replace(/\s*\*$/, '')}`}
                        size="sm"
                        placement="end"
                        className="wctc-help"
                      >
                        <p>{line.help}</p>
                      </InfoButton>
                    )}
                  </span>
                </div>

                <p className="wctc-rule">{line.statutoryLabel}</p>

                <label className="wctc-input wctc-input--euro">
                  <span className="sr-only">Importe mensual en {line.label}</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={Number(toMonthly(line.spendAnnual).toFixed(2))}
                    onChange={(event) => updateAmount(line.id, Number(event.target.value))}
                  />
                  <b>€</b>
                </label>

                <label className="wctc-input wctc-input--percent">
                  <span className="sr-only">Porcentaje del gasto en {line.label}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={Number(line.sharePercent.toFixed(2))}
                    onChange={(event) => updateShare(line.id, Number(event.target.value))}
                  />
                  <b>%</b>
                </label>

                <div className="wctc-mini">
                  <span style={{ width: `${Math.max(5, (line.spendAnnual / maxLineAmount) * 100)}%` }} />
                </div>
              </article>
            ))}

            <article className={`wctc-row wctc-row--total is-${totalStatus}`}>
              <div className="wctc-category">
                <span className="wctc-index" aria-hidden="true">Σ</span>
                <strong>TOTAL</strong>
              </div>
              <output className="wctc-rule wctc-rule--total" aria-label="Tipo impositivo medio del reparto">
                {showAverageConsumptionTaxRate
                  ? `${formatNumber(averageConsumptionTaxRate)} % medio`
                  : '—'}
              </output>
              <output className="wctc-total-cell">{formatEuro(toMonthly(result.assignedSpendAnnual))}</output>
              <output className="wctc-total-cell">{formatNumber(result.totalSharePercent)}%</output>
              <small className="wctc-total-hint">
                {totalStatus === 'ok' ? (
                  'Distribución completa'
                ) : (
                  <>
                    <span className="wctc-total-hint__percent">
                      {shareDifference > 0
                        ? `Falta ${formatNumber(shareGapPercent)} %`
                        : `Sobran ${formatNumber(shareGapPercent)} %`}
                    </span>
                    <span className="wctc-total-hint__amount">{formatEuro(amountGapMonthly)} / mes</span>
                  </>
                )}
              </small>
            </article>
          </div>
          </div>

          <section className="wctc-home-strip" aria-labelledby="wctc-home-title">
            <div className="wctc-home-strip__title">
              <Home size={22} aria-hidden="true" />
              <h3 id="wctc-home-title">Vivienda en propiedad <span>(opcional)</span></h3>
            </div>

            <OwnershipGate
              question="¿Tienes vivienda en propiedad?"
              description="Cuenta aunque aun pagues hipoteca: si eres dueno o duena, responde Si."
              answer={hasOwnedHome}
              onYes={() => setHasOwnedHome('yes')}
              onNo={handleOwnedHomeNo}
            >
              <div className="wctc-ibi-block">
                <div className="wctc-ibi-head">
                  <strong>IBI</strong>
                  <InfoButton label="Que es el IBI estimado" size="sm" placement="end" className="wctc-help">
                    <p>{IBI_HELP}</p>
                  </InfoButton>
                  <small>* Simplificacion orientativa</small>
                </div>

                <div className="wctc-ibi-list">
                  {propertyIbis.map((property, index) => {
                    const ibiAnnual = calculatePropertyIbiAnnual(property)

                    return (
                      <article key={property.id} className="wctc-ibi-row">
                        <div className="wctc-ibi-row__header">
                          <span className="wctc-ibi-index">{index + 1}</span>
                          <button
                            type="button"
                            className="wctc-purchase-remove"
                            onClick={() => removePropertyIbi(property.id)}
                            disabled={propertyIbis.length <= 1}
                            aria-label={`Quitar vivienda ${index + 1}`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>

                        <div className="wctc-ibi-row__fields">
                          <label className="wctc-ibi-field">
                            <span className="wctc-ibi-field-label">Valor catastral (€)</span>
                            <a
                              className="wctc-ibi-link"
                              href={CATASTRO_URL}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Consultar en el Catastro
                              <ExternalLink size={12} aria-hidden="true" />
                            </a>
                            <input
                              type="number"
                              min={0}
                              step={1000}
                              value={Number(property.cadastralValue.toFixed(2))}
                              onChange={(event) => updatePropertyIbi(property.id, {
                                cadastralValue: clampNumber(Number(event.target.value), 0, 10000000),
                              })}
                            />
                          </label>

                          <label className="wctc-ibi-field wctc-ibi-field--rate">
                            <span>Tipo IBI estimado (%)</span>
                            <input
                              type="number"
                              min={0}
                              max={5}
                              step={0.01}
                              value={Number(property.ibiRatePercent.toFixed(2))}
                              onChange={(event) => updatePropertyIbi(property.id, {
                                ibiRatePercent: clampNumber(Number(event.target.value), 0, 5),
                              })}
                            />
                          </label>
                        </div>

                        <output className="wctc-ibi-amounts" aria-label={`Cuota IBI estimada vivienda ${index + 1}`}>
                          <span className="wctc-ibi-amount">
                            <small>Anual</small>
                            <strong>{formatEuro(ibiAnnual)}</strong>
                          </span>
                          <span className="wctc-ibi-amount">
                            <small>Mensual</small>
                            <strong>{formatEuro(ibiAnnual / 12)}</strong>
                          </span>
                        </output>
                      </article>
                    )
                  })}
                </div>

                <div className="wctc-ibi-footer">
                  <button type="button" className="wctc-purchase-add" onClick={addPropertyIbi}>
                    <Plus size={16} aria-hidden="true" />
                    <span>Anadir otra vivienda</span>
                  </button>
                  <output className="wctc-purchase-total" aria-label="Total IBI estimado">
                    <small>Total IBI estimado</small>
                    <strong>{formatEuro(propertyTaxAnnual)}</strong>
                  </output>
                </div>
              </div>

              <div className="wctc-purchase-block">
                <div className="wctc-purchase-head">
                  <div className="wctc-purchase-title">
                    <strong>Impuesto en la compra (IVA o ITP)</strong>
                    <InfoButton label="Que es el impuesto en la compra" size="sm" placement="end" className="wctc-help">
                      <p>{PURCHASE_TAX_HELP}</p>
                    </InfoButton>
                  </div>
                  <small>Pago unico al adquirir la vivienda; no es IBI ni cuota mensual.</small>
                </div>

                <div className="wctc-purchase-list">
                  {propertyPurchases.map((purchase, index) => (
                    <article key={purchase.id} className="wctc-purchase-row">
                      <span className="wctc-purchase-index">{index + 1}</span>

                      <label className="wctc-purchase-field">
                        <span>Precio de compra (€)</span>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={Number(purchase.purchasePrice.toFixed(2))}
                          onChange={(event) => updatePurchase(purchase.id, {
                            purchasePrice: clampNumber(Number(event.target.value), 0, 50000000),
                          })}
                        />
                      </label>

                      <label className="wctc-purchase-field">
                        <span>Comunidad autonoma</span>
                        <select
                          value={purchase.region}
                          onChange={(event) => updatePurchase(purchase.id, { region: event.target.value })}
                        >
                          {REGION_OPTIONS.map((region) => (
                            <option key={region.value} value={region.value}>{region.label}</option>
                          ))}
                        </select>
                      </label>

                      <label className="wctc-purchase-field">
                        <span>Tipo de vivienda</span>
                        <select
                          value={purchase.propertyType}
                          onChange={(event) => updatePurchase(purchase.id, {
                            propertyType: event.target.value as PropertyPurchase['propertyType'],
                          })}
                        >
                          <option value="used">Segunda mano (ITP)</option>
                          <option value="new">Obra nueva (IVA)</option>
                        </select>
                      </label>

                      <label className="wctc-purchase-field">
                        <span>Uso en la compra</span>
                        <select
                          value={purchase.residenceRole}
                          onChange={(event) => updatePurchase(purchase.id, {
                            residenceRole: event.target.value as ResidenceRole,
                          })}
                        >
                          <option value="habitual">Primera habitual</option>
                          <option value="additional">Segunda o mas</option>
                        </select>
                      </label>

                      <output className="wctc-purchase-tax" aria-label={`Impuesto estimado vivienda ${index + 1}`}>
                        <small>{getPurchaseTaxLabel(purchase)}</small>
                        <strong>{formatEuro(calculatePurchaseTax(purchase))}</strong>
                      </output>

                      <button
                        type="button"
                        className="wctc-purchase-remove"
                        onClick={() => removePurchase(purchase.id)}
                        disabled={propertyPurchases.length <= 1}
                        aria-label={`Quitar vivienda ${index + 1}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </article>
                  ))}
                </div>

                <div className="wctc-purchase-footer">
                  <button type="button" className="wctc-purchase-add" onClick={addPurchase}>
                    <Plus size={16} aria-hidden="true" />
                    <span>Anadir otra vivienda</span>
                  </button>
                  <output className="wctc-purchase-total" aria-label="Total impuesto en compras de vivienda">
                    <small>Total estimado en compras</small>
                    <strong>{formatEuro(purchaseTaxTotal)}</strong>
                  </output>
                </div>
              </div>
            </OwnershipGate>
          </section>

          <section className="wctc-home-strip wctc-vehicle-strip" aria-labelledby="wctc-vehicle-title">
            <div className="wctc-home-strip__title">
              <Car size={22} aria-hidden="true" />
              <h3 id="wctc-vehicle-title">Coche en propiedad <span>(opcional)</span></h3>
            </div>

            <OwnershipGate
              question="¿Tienes coche en propiedad?"
              description="Si tienes un vehiculo a tu nombre, responde Si para estimar el IVTM anual y el impuesto de la compra."
              answer={ownsVehicle}
              onYes={() => setOwnsVehicle('yes')}
              onNo={handleOwnsVehicleNo}
            >
              <div className="wctc-ibi-block">
                <div className="wctc-ibi-head">
                  <strong>IVTM (circulacion)</strong>
                  <InfoButton label="Que es el IVTM estimado" size="sm" placement="end" className="wctc-help">
                    <p>{IVTM_HELP}</p>
                  </InfoButton>
                  <small>* Simplificacion orientativa</small>
                </div>

                <div className="wctc-ibi-list">
                  {vehicleIvtms.map((vehicle, index) => {
                    const ivtmAnnual = calculateVehicleIvtmAnnual(vehicle)

                    return (
                      <article key={vehicle.id} className="wctc-ibi-row">
                        <div className="wctc-ibi-row__header">
                          <span className="wctc-ibi-index">{index + 1}</span>
                          <button
                            type="button"
                            className="wctc-purchase-remove"
                            onClick={() => removeVehicleIvtm(vehicle.id)}
                            disabled={vehicleIvtms.length <= 1}
                            aria-label={`Quitar coche ${index + 1}`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>

                        <div className="wctc-ibi-row__fields">
                          <label className="wctc-ibi-field">
                            <span className="wctc-ibi-field-label">Potencia fiscal (CV)</span>
                            <small>Aparece en el permiso de circulacion</small>
                            <input
                              type="number"
                              min={0}
                              max={50}
                              step={1}
                              value={Number(vehicle.fiscalPowerCv.toFixed(0))}
                              onChange={(event) => updateVehicleIvtm(vehicle.id, {
                                fiscalPowerCv: clampNumber(Number(event.target.value), 0, 50),
                              })}
                            />
                          </label>

                          <label className="wctc-ibi-field wctc-ibi-field--rate">
                            <span>Tipo IVTM estimado (€/CV)</span>
                            <input
                              type="number"
                              min={0}
                              max={30}
                              step={0.1}
                              value={Number(vehicle.ivtmRatePerCv.toFixed(2))}
                              onChange={(event) => updateVehicleIvtm(vehicle.id, {
                                ivtmRatePerCv: clampNumber(Number(event.target.value), 0, 30),
                              })}
                            />
                          </label>
                        </div>

                        <output className="wctc-ibi-amounts" aria-label={`Cuota IVTM estimada coche ${index + 1}`}>
                          <span className="wctc-ibi-amount">
                            <small>Anual</small>
                            <strong>{formatEuro(ivtmAnnual)}</strong>
                          </span>
                          <span className="wctc-ibi-amount">
                            <small>Mensual</small>
                            <strong>{formatEuro(ivtmAnnual / 12)}</strong>
                          </span>
                        </output>
                      </article>
                    )
                  })}
                </div>

                <div className="wctc-ibi-footer">
                  <button type="button" className="wctc-purchase-add" onClick={addVehicleIvtm}>
                    <Plus size={16} aria-hidden="true" />
                    <span>Anadir otro coche</span>
                  </button>
                  <output className="wctc-purchase-total" aria-label="Total IVTM estimado">
                    <small>Total IVTM estimado</small>
                    <strong>{formatEuro(vehicleTaxAnnual)}</strong>
                  </output>
                </div>
              </div>

              <div className="wctc-purchase-block wctc-purchase-block--vehicle">
                <div className="wctc-purchase-head">
                  <div className="wctc-purchase-title">
                    <strong>Impuesto en la compra (IVA, IGIC o ITP)</strong>
                    <InfoButton label="Que es el impuesto en la compra del coche" size="sm" placement="end" className="wctc-help">
                      <p>{CAR_PURCHASE_TAX_HELP}</p>
                    </InfoButton>
                  </div>
                  <small>Pago unico al adquirir el vehiculo; no es IVTM ni gasto mensual de combustible.</small>
                </div>

                <div className="wctc-purchase-list">
                  {vehiclePurchases.map((purchase, index) => (
                    <article key={purchase.id} className="wctc-purchase-row wctc-purchase-row--vehicle">
                      <span className="wctc-purchase-index">{index + 1}</span>

                      <label className="wctc-purchase-field">
                        <span>Precio de compra (€)</span>
                        <input
                          type="number"
                          min={0}
                          step={500}
                          value={Number(purchase.purchasePrice.toFixed(2))}
                          onChange={(event) => updateVehiclePurchase(purchase.id, {
                            purchasePrice: clampNumber(Number(event.target.value), 0, 5000000),
                          })}
                        />
                      </label>

                      <label className="wctc-purchase-field">
                        <span>Comunidad autonoma</span>
                        <select
                          value={purchase.region}
                          onChange={(event) => updateVehiclePurchase(purchase.id, { region: event.target.value })}
                        >
                          {REGION_OPTIONS.map((region) => (
                            <option key={region.value} value={region.value}>{region.label}</option>
                          ))}
                        </select>
                      </label>

                      <label className="wctc-purchase-field">
                        <span>Tipo de compra</span>
                        <select
                          value={purchase.condition}
                          onChange={(event) => updateVehiclePurchase(purchase.id, {
                            condition: event.target.value as VehiclePurchase['condition'],
                          })}
                        >
                          <option value="new">Nuevo (IVA o IGIC)</option>
                          <option value="used_dealer">Segunda mano en concesionario</option>
                          <option value="used_private">Segunda mano entre particulares</option>
                        </select>
                      </label>

                      <label className="wctc-purchase-field">
                        <span>Emisiones CO2 (matriculacion)</span>
                        <select
                          value={purchase.co2Tier}
                          disabled={purchase.condition !== 'new'}
                          onChange={(event) => updateVehiclePurchase(purchase.id, {
                            co2Tier: event.target.value as VehiclePurchase['co2Tier'],
                          })}
                        >
                          <option value="exempt">0 % (0 g/km)</option>
                          <option value="low">4,75 % (hasta 120 g/km)</option>
                          <option value="medium">9,75 % (121-160 g/km)</option>
                          <option value="high">14,75 % (mas de 160 g/km)</option>
                        </select>
                      </label>

                      <output className="wctc-purchase-tax" aria-label={`Impuesto estimado coche ${index + 1}`}>
                        <small>{getVehiclePurchaseTaxLabel(purchase)}</small>
                        <strong>{formatEuro(calculateVehiclePurchaseTax(purchase))}</strong>
                      </output>

                      <button
                        type="button"
                        className="wctc-purchase-remove"
                        onClick={() => removeVehiclePurchase(purchase.id)}
                        disabled={vehiclePurchases.length <= 1}
                        aria-label={`Quitar coche ${index + 1}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </article>
                  ))}
                </div>

                <div className="wctc-purchase-footer">
                  <button type="button" className="wctc-purchase-add" onClick={addVehiclePurchase}>
                    <Plus size={16} aria-hidden="true" />
                    <span>Anadir otro coche</span>
                  </button>
                  <output className="wctc-purchase-total" aria-label="Total impuesto en compras de coches">
                    <small>Total estimado en compras</small>
                    <strong>{formatEuro(vehiclePurchaseTaxTotal)}</strong>
                  </output>
                </div>
              </div>
            </OwnershipGate>
          </section>
        </section>

        <aside className="wctc-summary" aria-label="Resumen de impacto fiscal">
          <div className="wctc-summary-title">
            <Percent size={22} aria-hidden="true" />
            <h3>Resumen de impacto fiscal</h3>
          </div>

          <output className="wctc-summary-card wctc-summary-card--green">
            <WalletCards size={34} aria-hidden="true" />
            <span><b>Gasto asignado</b><small>Total al mes distribuido</small></span>
            <strong>{formatEuro(toMonthly(result.assignedSpendAnnual))}</strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--orange">
            <Receipt size={34} aria-hidden="true" />
            <span><b>IVA estimado</b><small>Aprox. al mes</small></span>
            <strong>{formatEuro(toMonthly(result.vatAnnual))}<small>{formatShareOfSpend(result.vatAnnual)}</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--blue">
            <Info size={34} aria-hidden="true" />
            <span><b>Impuestos especiales</b><small>Aprox. al mes</small></span>
            <strong>{formatEuro(toMonthly(result.specialTaxesAnnual))}<small>{formatShareOfSpend(result.specialTaxesAnnual)}</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--purple">
            <Home size={34} aria-hidden="true" />
            <span><b>IBI estimado</b><small>Aprox. al mes</small></span>
            <strong>{formatEuro(toMonthly(result.propertyTaxAnnual))}<small>{formatShareOfSpend(result.propertyTaxAnnual)}</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--purple">
            <Car size={34} aria-hidden="true" />
            <span><b>IVTM estimado</b><small>Aprox. al mes</small></span>
            <strong>{formatEuro(toMonthly(result.vehicleTaxAnnual))}<small>{formatShareOfSpend(result.vehicleTaxAnnual)}</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--cyan wctc-summary-card--total">
            <Calculator size={34} aria-hidden="true" />
            <span><b>Impacto total aprox.</b><small>Suma al mes</small></span>
            <strong>{formatEuro(toMonthly(result.totalTaxAnnual))}<small>{formatShareOfSpend(result.totalTaxAnnual)}</small></strong>
          </output>
        </aside>
      </div>
    </section>
    </>
  )
}

export default WorkerConsumptionTaxesCard
