import {
  Calculator,
  Car,
  ChevronDown,
  ExternalLink,
  Home,
  Landmark,
  Plus,
  Receipt,
  Trash2,
} from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { InfoButton } from '../ui/InfoButton'
import { useFiscalVariant } from '../fiscal-worker-dashboard/fiscalVariant'
import { clampNumber, formatEuro, formatNumber } from './workerTaxesFormat'
import { EscQuestion } from './escenario/EscenarioCommon'
import './WorkerTaxStepShell.css'
import './WorkerWealthTaxesCard.css'

const CATASTRO_URL = 'https://www.sedecatastro.gob.es/'

const IBI_HELP =
  'El IBI (Impuesto sobre Bienes Inmuebles) lo cobra tu ayuntamiento cada año por la vivienda en propiedad. Este bloque es opcional y no forma parte del reparto del 100 % de gasto del paso anterior. La calculadora estima una cuota anual aproximada como valor catastral × tipo IBI; el tipo real lo fija cada municipio y suele estar entre 0,4 % y 1,1 %. No es IVA, ITP ni un impuesto de consumo.'

const PURCHASE_TAX_HELP =
  'Al comprar una vivienda nueva se paga IVA (10 % en península y Baleares; IGIC en Canarias) más AJD, que varía por comunidad autónoma. En segunda mano se paga ITP: la primera vivienda habitual suele tener tipos reducidos, pero la segunda o más tributa al tipo general, más alto en muchas CCAA. Son pagos únicos de entonces, no mensuales como el IBI, y no se suman al impacto de este mes. País Vasco y Navarra tienen régimen foral propio y aquí no se estiman. Los tipos son orientativos y no incluyen bonificaciones por edad, ingresos o VPO.'

const CAR_PURCHASE_TAX_HELP =
  'Al comprar un coche nuevo se paga IVA (21 % en península y Baleares; IGIC en Canarias) incluido en el precio, más el impuesto de matriculación según las emisiones de CO₂. En segunda mano a un particular no hay IVA, pero suele pagarse ITP al transferir la titularidad; a un concesionario el precio suele llevar IVA. Son pagos únicos en la compra; no son el IVTM anual ni el gasto mensual de gasolina. Los tipos aquí son orientativos y no incluyen bonificaciones ni regímenes especiales.'

const IVTM_HELP =
  'El IVTM (Impuesto sobre Vehículos de Tracción Mecánica), también llamado impuesto de circulación, lo cobra tu ayuntamiento por tener un vehículo matriculado. Este bloque es opcional y no forma parte del reparto del 100 % de gasto del paso anterior. La calculadora estima una cuota anual aproximada como potencia fiscal × tipo IVTM; el tipo real lo fija cada municipio según CV, combustible y antigüedad. No es IVA ni impuesto de compra.'

export type OwnershipAnswer = 'unanswered' | 'yes' | 'no'

type ResidenceRole = 'habitual' | 'additional'

export type PropertyIbi = {
  id: string
  cadastralValue: number
  ibiRatePercent: number
}

export type PropertyPurchase = {
  id: string
  purchasePrice: number
  region: string
  propertyType: 'new' | 'used'
  residenceRole: ResidenceRole
  priceIncludesVat?: boolean
}

type OwnedHome = PropertyIbi & {
  purchasePrice: number
  region: string
  propertyType: 'new' | 'used'
  residenceRole: ResidenceRole
  priceIncludesVat: boolean
}

type VehicleCondition = 'new' | 'used_dealer' | 'used_private'
type RegistrationCo2Tier = 'exempt' | 'low' | 'medium' | 'high'

export type VehiclePurchase = {
  id: string
  purchasePrice: number
  region: string
  condition: VehicleCondition
  co2Tier: RegistrationCo2Tier
}

export type VehicleIvtm = {
  id: string
  fiscalPowerCv: number
  ivtmRatePerCv: number
}

export interface WealthTaxesDraft {
  hasOwnedHome: OwnershipAnswer
  ownsVehicle: OwnershipAnswer
  propertyIbis: PropertyIbi[]
  propertyPurchases: PropertyPurchase[]
  vehiclePurchases: VehiclePurchase[]
  vehicleIvtms: VehicleIvtm[]
}

export type WealthTaxesResult = {
  /** IBI anual estimado de todas las viviendas declaradas. */
  propertyTaxAnnual: number
  /** IVTM anual estimado de todos los coches declarados. */
  vehicleTaxAnnual: number
  /** IBI + IVTM: lo unico de este paso que entra en el resumen mensual. */
  recurringTaxAnnual: number
  /** Impuesto pagado al comprar vivienda; pago unico, no mensual. */
  propertyPurchaseTaxTotal: number
  /** Impuesto pagado al comprar coche; pago unico, no mensual. */
  vehiclePurchaseTaxTotal: number
  oneOffPurchaseTaxTotal: number
}

type WorkerWealthTaxesCardProps = {
  initialCadastralValue?: number
  initialHasOwnedHome?: boolean
  initialDraft?: WealthTaxesDraft | null
  onResultChange?: (result: WealthTaxesResult) => void
  onDraftChange?: (draft: WealthTaxesDraft) => void
}

const DEFAULT_IBI_RATE_PERCENT = 0.6

const REGION_OPTIONS = [
  { value: 'madrid', label: 'Madrid' },
  { value: 'andalucia', label: 'Andalucía' },
  { value: 'aragon', label: 'Aragón' },
  { value: 'asturias', label: 'Asturias' },
  { value: 'illes_balears', label: 'Illes Balears' },
  { value: 'canarias', label: 'Canarias' },
  { value: 'cantabria', label: 'Cantabria' },
  { value: 'castilla_la_mancha', label: 'Castilla-La Mancha' },
  { value: 'castilla_y_leon', label: 'Castilla y León' },
  { value: 'cataluna', label: 'Cataluña' },
  { value: 'extremadura', label: 'Extremadura' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'murcia', label: 'Región de Murcia' },
  { value: 'la_rioja', label: 'La Rioja' },
  { value: 'comunitat_valenciana', label: 'Comunitat Valenciana' },
  { value: 'pais_vasco', label: 'País Vasco' },
  { value: 'navarra', label: 'Navarra' },
] as const

const FORAL_REGIONS = new Set(['pais_vasco', 'navarra'])

function isForalRegion(region: string) {
  return FORAL_REGIONS.has(region)
}

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

const DEFAULT_IVTM_RATE_PER_CV = 9.5

function getItpRate(region: string, residenceRole: ResidenceRole) {
  if (isForalRegion(region)) return null
  const table = residenceRole === 'habitual' ? ITP_HABITUAL_RATES_PERCENT : ITP_ADDITIONAL_RATES_PERCENT
  return table[region] ?? (residenceRole === 'habitual' ? 7 : 9)
}

function residenceRoleAffectsItp(region: string) {
  const habitual = getItpRate(region, 'habitual')
  const additional = getItpRate(region, 'additional')
  return habitual !== null && additional !== null && habitual !== additional
}

function getIncludedPurchaseTaxRate(region: string) {
  return region === 'canarias' ? CANARIAS_IGIC_RATE_PERCENT : NEW_HOUSING_VAT_RATE_PERCENT
}

function getIncludedPurchaseTaxLabel(region: string) {
  return region === 'canarias' ? 'IGIC' : 'IVA'
}

function getVehicleIncludedTaxRate(region: string) {
  return region === 'canarias' ? CAR_IGIC_RATE_PERCENT : NEW_CAR_VAT_RATE_PERCENT
}

function getVehicleIncludedTaxLabel(region: string) {
  return region === 'canarias' ? 'IGIC' : 'IVA'
}

function createPropertyIbiId() {
  return `ibi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createEmptyOwnedHome(residenceRole: ResidenceRole = 'habitual'): OwnedHome {
  return {
    id: createPropertyIbiId(),
    cadastralValue: 0,
    ibiRatePercent: DEFAULT_IBI_RATE_PERCENT,
    purchasePrice: 0,
    region: 'madrid',
    propertyType: 'used',
    residenceRole,
    priceIncludesVat: true,
  }
}

function toPropertyIbi(home: OwnedHome): PropertyIbi {
  return {
    id: home.id,
    cadastralValue: home.cadastralValue,
    ibiRatePercent: home.ibiRatePercent,
  }
}

function toPropertyPurchase(home: OwnedHome): PropertyPurchase {
  return {
    id: home.id,
    purchasePrice: home.purchasePrice,
    region: home.region,
    propertyType: home.propertyType,
    residenceRole: home.residenceRole,
    priceIncludesVat: home.priceIncludesVat,
  }
}

function ownedHomesFromLists(
  ibis: PropertyIbi[],
  purchases: PropertyPurchase[],
  initialCadastralValue: number,
): OwnedHome[] {
  if (!ibis.length && !purchases.length) {
    return [{
      ...createEmptyOwnedHome(),
      cadastralValue: initialCadastralValue,
    }]
  }

  const count = Math.max(ibis.length, purchases.length)
  return Array.from({ length: count }, (_, index) => {
    const ibi = ibis[index]
    const purchase = purchases[index]
    const fallback = createEmptyOwnedHome(index === 0 ? 'habitual' : 'additional')

    return {
      id: ibi?.id ?? purchase?.id ?? fallback.id,
      cadastralValue: ibi?.cadastralValue ?? fallback.cadastralValue,
      ibiRatePercent: ibi?.ibiRatePercent ?? fallback.ibiRatePercent,
      purchasePrice: purchase?.purchasePrice ?? fallback.purchasePrice,
      region: purchase?.region ?? fallback.region,
      propertyType: purchase?.propertyType ?? fallback.propertyType,
      residenceRole: purchase?.residenceRole ?? fallback.residenceRole,
      priceIncludesVat: purchase?.priceIncludesVat ?? fallback.priceIncludesVat,
    }
  })
}

function calculatePropertyIbiAnnual(property: Pick<PropertyIbi, 'cadastralValue' | 'ibiRatePercent'>) {
  if (property.cadastralValue <= 0) return 0
  return property.cadastralValue * (property.ibiRatePercent / 100)
}

type PurchaseTaxBreakdown = {
  status: 'empty' | 'foral' | 'ok'
  total: number
  headline: string
  lines: Array<{ label: string; amount: number }>
}

function calculatePurchaseTaxBreakdown(
  purchase: Pick<OwnedHome, 'purchasePrice' | 'region' | 'propertyType' | 'residenceRole' | 'priceIncludesVat'>,
): PurchaseTaxBreakdown {
  if (purchase.purchasePrice <= 0) {
    return { status: 'empty', total: 0, headline: '', lines: [] }
  }

  if (isForalRegion(purchase.region)) {
    return {
      status: 'foral',
      total: 0,
      headline: 'No estimado (régimen foral)',
      lines: [],
    }
  }

  if (purchase.propertyType === 'new') {
    const includedLabel = getIncludedPurchaseTaxLabel(purchase.region)
    const includedRate = getIncludedPurchaseTaxRate(purchase.region)
    const ajdRate = AJD_RATES_PERCENT[purchase.region] ?? 1.2
    const priceIncludesVat = purchase.priceIncludesVat !== false
    const includedTax = priceIncludesVat
      ? purchase.purchasePrice * (includedRate / (100 + includedRate))
      : purchase.purchasePrice * (includedRate / 100)
    const ajdTax = purchase.purchasePrice * (ajdRate / 100)
    const vatLine = priceIncludesVat
      ? `${includedLabel} ${formatNumber(includedRate)} % incluido en el precio`
      : `${includedLabel} ${formatNumber(includedRate)} % sobre el precio`

    return {
      status: 'ok',
      total: includedTax + ajdTax,
      headline: `${includedLabel} + AJD`,
      lines: [
        { label: vatLine, amount: includedTax },
        { label: `AJD ${formatNumber(ajdRate)} %`, amount: ajdTax },
      ],
    }
  }

  const itpRate = getItpRate(purchase.region, purchase.residenceRole) ?? 0
  const amount = purchase.purchasePrice * (itpRate / 100)
  const roleLabel = purchase.residenceRole === 'habitual' ? 'habitual' : '2ª o más'

  return {
    status: 'ok',
    total: amount,
    headline: `ITP ${formatNumber(itpRate)} % (${roleLabel})`,
    lines: [
      {
        label: `ITP ${formatNumber(itpRate)} % sobre ${formatEuro(purchase.purchasePrice, 0)}`,
        amount,
      },
    ],
  }
}

function calculatePurchaseTax(
  purchase: Pick<OwnedHome, 'purchasePrice' | 'region' | 'propertyType' | 'residenceRole' | 'priceIncludesVat'>,
) {
  return calculatePurchaseTaxBreakdown(purchase).total
}

type OwnedVehicle = VehicleIvtm & {
  purchasePrice: number
  region: string
  condition: VehicleCondition
  co2Tier: RegistrationCo2Tier
}

type VehiclePurchaseInput = Pick<VehiclePurchase, 'purchasePrice' | 'region' | 'condition' | 'co2Tier'>

/** Relacion orientativa entre valor catastral y precio de compra, para cuando no se tiene el recibo. */
const CADASTRAL_TO_PRICE_RATIO = 0.55

/** Potencias fiscales tipicas por tamano de coche, para quien no tiene delante el permiso de circulacion. */
const VEHICLE_CV_PRESETS = [
  { label: 'Urbano', cv: 7 },
  { label: 'Compacto', cv: 10 },
  { label: 'Familiar o SUV', cv: 14 },
  { label: 'Grande', cv: 18 },
] as const

function estimateCadastralValue(purchasePrice: number) {
  return Math.round((purchasePrice * CADASTRAL_TO_PRICE_RATIO) / 100) * 100
}

function createVehicleId() {
  return `vehicle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function createEmptyOwnedVehicle(): OwnedVehicle {
  return {
    id: createVehicleId(),
    fiscalPowerCv: 0,
    ivtmRatePerCv: DEFAULT_IVTM_RATE_PER_CV,
    purchasePrice: 0,
    region: 'madrid',
    condition: 'used_private',
    co2Tier: 'medium',
  }
}

function toVehicleIvtm(vehicle: OwnedVehicle): VehicleIvtm {
  return {
    id: vehicle.id,
    fiscalPowerCv: vehicle.fiscalPowerCv,
    ivtmRatePerCv: vehicle.ivtmRatePerCv,
  }
}

function toVehiclePurchase(vehicle: OwnedVehicle): VehiclePurchase {
  return {
    id: vehicle.id,
    purchasePrice: vehicle.purchasePrice,
    region: vehicle.region,
    condition: vehicle.condition,
    co2Tier: vehicle.co2Tier,
  }
}

/** Reconstruye una ficha por coche a partir de las dos listas del borrador (IVTM y compra). */
function ownedVehiclesFromLists(
  ivtms: VehicleIvtm[],
  purchases: VehiclePurchase[],
): OwnedVehicle[] {
  if (!ivtms.length && !purchases.length) {
    return [createEmptyOwnedVehicle()]
  }

  const count = Math.max(ivtms.length, purchases.length)
  return Array.from({ length: count }, (_, index) => {
    const ivtm = ivtms[index]
    const purchase = purchases[index]
    const fallback = createEmptyOwnedVehicle()

    return {
      id: ivtm?.id ?? purchase?.id ?? fallback.id,
      fiscalPowerCv: ivtm?.fiscalPowerCv ?? fallback.fiscalPowerCv,
      ivtmRatePerCv: ivtm?.ivtmRatePerCv ?? fallback.ivtmRatePerCv,
      purchasePrice: purchase?.purchasePrice ?? fallback.purchasePrice,
      region: purchase?.region ?? fallback.region,
      condition: purchase?.condition ?? fallback.condition,
      co2Tier: purchase?.co2Tier ?? fallback.co2Tier,
    }
  })
}

function calculateVehicleIvtmAnnual(vehicle: Pick<VehicleIvtm, 'fiscalPowerCv' | 'ivtmRatePerCv'>) {
  return vehicle.fiscalPowerCv * vehicle.ivtmRatePerCv
}

function calculateVehiclePurchaseTax(purchase: VehiclePurchaseInput) {
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

function getVehiclePurchaseTaxLabel(purchase: VehiclePurchaseInput) {
  const includedLabel = getVehicleIncludedTaxLabel(purchase.region)
  const includedRate = getVehicleIncludedTaxRate(purchase.region)

  if (purchase.condition === 'new') {
    const registrationRate = REGISTRATION_TAX_RATES_PERCENT[purchase.co2Tier]
    return `${includedLabel} ${formatNumber(includedRate)} % + matriculación ${formatNumber(registrationRate)} %`
  }

  if (purchase.condition === 'used_dealer') {
    return `${includedLabel} ${formatNumber(includedRate)} %`
  }

  const itpRate = VEHICLE_ITP_RATES_PERCENT[purchase.region] ?? 5
  return `ITP ${formatNumber(itpRate)} % (particular)`
}

function formatEuroOrDash(value: number, decimals = 2) {
  return value > 0 ? formatEuro(value, decimals) : '—'
}

function emptyableNumberValue(value: number) {
  return value > 0 ? value : ''
}

function answerPillTone(answer: OwnershipAnswer) {
  if (answer === 'yes') return { tone: 'yes', text: 'Sí' }
  if (answer === 'no') return { tone: 'no', text: 'No' }
  return { tone: 'pending', text: 'Sin responder' }
}

type RecurringSummary = { caption: string; main: string; sub: string; muted: boolean }

/** El resumen tiene que decir lo mismo que la respuesta del usuario: un 0,00 € se lee como «me falta algo». */
function recurringSummary(
  answer: OwnershipAnswer,
  annual: number,
  noLabel: string,
): RecurringSummary {
  if (answer === 'no') {
    return { caption: 'Has respondido que no', main: '—', sub: noLabel, muted: true }
  }
  if (answer === 'unanswered') {
    return { caption: 'Sin responder', main: '—', sub: 'Responde la pregunta', muted: true }
  }
  if (annual <= 0) {
    return { caption: 'Sin datos todavía', main: '—', sub: 'Rellena la ficha para estimarlo', muted: true }
  }
  return {
    caption: 'Aprox. al mes',
    main: formatEuro(annual / 12),
    sub: `${formatEuro(annual)} / año`,
    muted: false,
  }
}

/** Escala con el rango habitual del tipo: el numero solo no dice si 0,9 % es mucho o poco. */
function RateScale({
  value,
  min,
  max,
  step,
  marks,
  ariaLabel,
  onChange,
}: {
  value: number
  min: number
  max: number
  step: number
  marks: [string, string, string]
  ariaLabel: string
  onChange: (next: number) => void
}) {
  return (
    <div className="wctc-scale">
      <input
        type="range"
        className="wctc-scale__range"
        min={min}
        max={max}
        step={step}
        value={clampNumber(value, min, max)}
        aria-label={ariaLabel}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="wctc-scale__marks" aria-hidden="true">
        {marks.map((mark) => <span key={mark}>{mark}</span>)}
      </div>
    </div>
  )
}

/** Bloque plegado del impuesto de la compra: es contexto, no entra en el mes. */
function OneOffBlock({
  headline,
  value,
  label,
  children,
}: {
  headline: string
  value: string
  label: string
  children: ReactNode
}) {
  return (
    <details className="wctc-oneoff" aria-label={label}>
      <summary className="wctc-oneoff__summary">
        <ChevronDown size={16} aria-hidden="true" className="wctc-oneoff__chevron" />
        <span className="wctc-home-card__badge">Pago único</span>
        <span className="wctc-oneoff__label">{headline}</span>
        <span className="wctc-oneoff__value">{value}</span>
      </summary>
      <div className="wctc-oneoff__body">{children}</div>
    </details>
  )
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
  const variant = useFiscalVariant()
  if (variant === 'escenario') {
    return (
      <EscQuestion
        question={question}
        help={description}
        value={answer === 'unanswered' ? null : answer === 'yes'}
        onChange={(next) => next ? onYes() : onNo()}
      >
        {answer === 'yes' ? children : null}
      </EscQuestion>
    )
  }
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
            aria-pressed={answer === 'yes'}
            className={answer === 'yes' ? 'is-selected' : ''}
            onClick={onYes}
          >
            Sí
          </button>
          <button
            type="button"
            aria-pressed={answer === 'no'}
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

export function WorkerWealthTaxesCard({
  initialCadastralValue = 0,
  initialHasOwnedHome = false,
  initialDraft = null,
  onResultChange,
  onDraftChange,
}: WorkerWealthTaxesCardProps) {
  const variant = useFiscalVariant()
  const [hasOwnedHome, setHasOwnedHome] = useState<OwnershipAnswer>(() => (
    initialDraft?.hasOwnedHome
    ?? (initialHasOwnedHome || initialCadastralValue > 0 ? 'yes' : 'unanswered')
  ))
  const [ownsVehicle, setOwnsVehicle] = useState<OwnershipAnswer>(
    () => initialDraft?.ownsVehicle ?? 'unanswered',
  )
  const [ownedHomes, setOwnedHomes] = useState<OwnedHome[]>(() => (
    ownedHomesFromLists(
      initialDraft?.propertyIbis ?? [],
      initialDraft?.propertyPurchases ?? [],
      initialCadastralValue,
    )
  ))
  const [ownedVehicles, setOwnedVehicles] = useState<OwnedVehicle[]>(() => (
    ownedVehiclesFromLists(
      initialDraft?.vehicleIvtms ?? [],
      initialDraft?.vehiclePurchases ?? [],
    )
  ))

  const propertyTaxAnnual = hasOwnedHome === 'yes'
    ? ownedHomes.reduce((total, home) => total + calculatePropertyIbiAnnual(home), 0)
    : 0
  const vehicleTaxAnnual = ownsVehicle === 'yes'
    ? ownedVehicles.reduce((total, vehicle) => total + calculateVehicleIvtmAnnual(vehicle), 0)
    : 0
  const purchaseTaxTotal = hasOwnedHome === 'yes'
    ? ownedHomes.reduce((total, home) => total + calculatePurchaseTax(home), 0)
    : 0
  const hasForalPurchase = hasOwnedHome === 'yes'
    && ownedHomes.some((home) => home.purchasePrice > 0 && isForalRegion(home.region))
  const vehiclePurchaseTaxTotal = ownsVehicle === 'yes'
    ? ownedVehicles.reduce((total, vehicle) => total + calculateVehiclePurchaseTax(vehicle), 0)
    : 0

  const result = useMemo<WealthTaxesResult>(() => ({
    propertyTaxAnnual,
    vehicleTaxAnnual,
    recurringTaxAnnual: propertyTaxAnnual + vehicleTaxAnnual,
    propertyPurchaseTaxTotal: purchaseTaxTotal,
    vehiclePurchaseTaxTotal,
    oneOffPurchaseTaxTotal: purchaseTaxTotal + vehiclePurchaseTaxTotal,
  }), [propertyTaxAnnual, purchaseTaxTotal, vehiclePurchaseTaxTotal, vehicleTaxAnnual])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  useEffect(() => {
    onDraftChange?.({
      hasOwnedHome,
      ownsVehicle,
      propertyIbis: ownedHomes.map(toPropertyIbi),
      propertyPurchases: ownedHomes.map(toPropertyPurchase),
      vehiclePurchases: ownedVehicles.map(toVehiclePurchase),
      vehicleIvtms: ownedVehicles.map(toVehicleIvtm),
    })
  }, [hasOwnedHome, onDraftChange, ownsVehicle, ownedHomes, ownedVehicles])

  function updateOwnedHome(id: string, patch: Partial<Omit<OwnedHome, 'id'>>) {
    setOwnedHomes((current) =>
      current.map((home) => (home.id === id ? { ...home, ...patch } : home)),
    )
  }

  function addOwnedHome() {
    setOwnedHomes((current) => [...current, createEmptyOwnedHome('additional')])
  }

  function removeOwnedHome(id: string) {
    setOwnedHomes((current) => (
      current.length <= 1 ? current : current.filter((home) => home.id !== id)
    ))
  }

  function handleOwnedHomeNo() {
    setHasOwnedHome('no')
    setOwnedHomes([createEmptyOwnedHome()])
  }

  function updateOwnedVehicle(id: string, patch: Partial<Omit<OwnedVehicle, 'id'>>) {
    setOwnedVehicles((current) =>
      current.map((vehicle) => (vehicle.id === id ? { ...vehicle, ...patch } : vehicle)),
    )
  }

  function addOwnedVehicle() {
    setOwnedVehicles((current) => [...current, createEmptyOwnedVehicle()])
  }

  function removeOwnedVehicle(id: string) {
    setOwnedVehicles((current) => (
      current.length <= 1 ? current : current.filter((vehicle) => vehicle.id !== id)
    ))
  }

  function handleOwnsVehicleNo() {
    setOwnsVehicle('no')
    setOwnedVehicles([createEmptyOwnedVehicle()])
  }

  const toMonthly = (value: number) => value / 12
  const answeredBoth = hasOwnedHome !== 'unanswered' && ownsVehicle !== 'unanswered'
  const hasNothing = hasOwnedHome === 'no' && ownsVehicle === 'no'
  const homePill = answerPillTone(hasOwnedHome)
  const vehiclePill = answerPillTone(ownsVehicle)
  const homeSummary = recurringSummary(hasOwnedHome, propertyTaxAnnual, 'No tienes vivienda en propiedad')
  const vehicleSummary = recurringSummary(ownsVehicle, vehicleTaxAnnual, 'No tienes coche en propiedad')

  return (
    <section className="wctc wwtc" aria-labelledby="wwtc-title">
      <header className="wctc-header">
        <div className="wctc-heading">
          <span className="wctc-step"><span aria-hidden="true" />Paso 9 de 12</span>
          <h2 id="wwtc-title">{variant === 'escenario' ? 'Vivienda y coche' : '9. Vivienda y coche'}</h2>
          {variant === 'escenario' ? (
            <>
              <p className="wctc-heading__subtitle">Impuestos por tener, no por gastar</p>
              <p>Hay impuestos que no dependen de tu consumo, sino de lo que posees. El IBI (Impuesto sobre Bienes Inmuebles) de tu vivienda y el IVTM (Impuesto sobre Vehículos de Tracción Mecánica, el llamado «impuesto de circulación») de tu coche se cobran cada año, así que se reparten al mes y entran en el resumen.</p>
            </>
          ) : (
            <p>
              Aquí no pagas por gastar, sino por tener: el <b>IBI</b> (Impuesto sobre Bienes
              Inmuebles) de tu vivienda y el <b>IVTM</b> (Impuesto sobre Vehículos de Tracción
              Mecánica, el llamado «impuesto de circulación») de tu coche se cobran cada año.
              También puedes recuperar lo que pagaste al comprar, que fue un pago único.
            </p>
          )}
        </div>
      </header>

      <aside className="wctc-tip" role="note">
        <Landmark size={20} aria-hidden="true" />
        <p>
          <strong>Dos relojes distintos.</strong> El IBI y el IVTM se repiten cada año, así que
          se reparten al mes y entran en el resumen. El IVA, el ITP o el AJD de la compra fueron
          un pago único de entonces: se guardan plegados como contexto y no se suman a tu mes.
        </p>
      </aside>

      <div className="wctc-layout">
        <section className="wctc-left" aria-label="Impuestos de vivienda y coche">
          <section className="wctc-home-strip" aria-labelledby="wwtc-home-title">
            <div className="wctc-home-strip__title">
              <Home size={22} aria-hidden="true" />
              <h3 id="wwtc-home-title">Vivienda en propiedad <span>(opcional)</span></h3>
              <span className={`wctc-strip-state is-${homePill.tone}`}>{homePill.text}</span>
            </div>

            <OwnershipGate
              question="¿Tienes vivienda en propiedad?"
              description="Cuenta aunque aún pagues hipoteca: si eres dueño o dueña, responde Sí."
              answer={hasOwnedHome}
              onYes={() => setHasOwnedHome('yes')}
              onNo={handleOwnedHomeNo}
            >
              <div className="wctc-homes">
                <div className="wctc-homes__list">
                  {ownedHomes.map((home, index) => {
                    const ibiAnnual = calculatePropertyIbiAnnual(home)
                    const purchaseBreakdown = calculatePurchaseTaxBreakdown(home)
                    const showResidenceRole = !isForalRegion(home.region)
                      && home.propertyType === 'used'
                      && residenceRoleAffectsItp(home.region)
                    const showVatToggle = !isForalRegion(home.region) && home.propertyType === 'new'
                    const purchaseSummaryValue = purchaseBreakdown.status === 'ok'
                      ? formatEuro(purchaseBreakdown.total)
                      : purchaseBreakdown.status === 'foral'
                        ? 'No estimado'
                        : '—'

                    return (
                      <article key={home.id} className="wctc-home-card">
                        <div className="wctc-home-card__header">
                          <span className="wctc-ibi-index">{index + 1}</span>
                          <h4>Vivienda {index + 1}</h4>
                          <button
                            type="button"
                            className="wctc-purchase-remove"
                            onClick={() => removeOwnedHome(home.id)}
                            disabled={ownedHomes.length <= 1}
                            title={ownedHomes.length <= 1 ? 'Debe quedar al menos una vivienda' : undefined}
                            aria-label={`Quitar vivienda ${index + 1}`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>

                        <section className="wctc-home-card__now" aria-label={`IBI de este año, vivienda ${index + 1}`}>
                          <div className="wctc-ibi-head">
                            <strong>IBI de este año</strong>
                            <InfoButton label="Qué es el IBI estimado" size="sm" placement="end" className="wctc-help">
                              <p>{IBI_HELP}</p>
                            </InfoButton>
                            <small>Estimación · se reparte al mes</small>
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
                                placeholder="p. ej. 85.000"
                                value={emptyableNumberValue(home.cadastralValue)}
                                onChange={(event) => updateOwnedHome(home.id, {
                                  cadastralValue: event.target.value === ''
                                    ? 0
                                    : clampNumber(Number(event.target.value), 0, 10000000),
                                })}
                              />
                              {home.purchasePrice > 0 ? (
                                <button
                                  type="button"
                                  className="wctc-guess-chip"
                                  onClick={() => updateOwnedHome(home.id, {
                                    cadastralValue: estimateCadastralValue(home.purchasePrice),
                                  })}
                                >
                                  No lo sé: estimar desde el precio de compra
                                  ({formatEuro(estimateCadastralValue(home.purchasePrice), 0)})
                                </button>
                              ) : (
                                <small className="wctc-guess-hint">
                                  Está en el recibo del IBI. Si no lo tienes a mano, indica el precio de
                                  compra en «Lo que pagaste al comprar» y te lo estimamos.
                                </small>
                              )}
                            </label>

                            <label className="wctc-ibi-field wctc-ibi-field--rate">
                              <span>Tipo del ayuntamiento (%)</span>
                              <input
                                type="number"
                                min={0}
                                max={5}
                                step={0.01}
                                value={Number(home.ibiRatePercent.toFixed(2))}
                                onChange={(event) => updateOwnedHome(home.id, {
                                  ibiRatePercent: clampNumber(Number(event.target.value), 0, 5),
                                })}
                              />
                              <RateScale
                                value={home.ibiRatePercent}
                                min={0.4}
                                max={1.1}
                                step={0.01}
                                marks={['mín 0,4 %', 'media 0,6 %', 'máx 1,1 %']}
                                ariaLabel={`Tipo de IBI de la vivienda ${index + 1}`}
                                onChange={(next) => updateOwnedHome(home.id, { ibiRatePercent: next })}
                              />
                            </label>
                          </div>

                          <output className="wctc-ibi-amounts" aria-label={`Cuota IBI estimada vivienda ${index + 1}`}>
                            <span className="wctc-ibi-amount">
                              <small>Al año</small>
                              <strong>{formatEuroOrDash(ibiAnnual)}</strong>
                            </span>
                            <span className="wctc-ibi-amount">
                              <small>Al mes</small>
                              <strong>{formatEuroOrDash(ibiAnnual > 0 ? ibiAnnual / 12 : 0)}</strong>
                            </span>
                          </output>
                        </section>

                        <OneOffBlock
                          headline="Lo que pagaste al comprar"
                          value={purchaseSummaryValue}
                          label={`Impuesto al comprar, vivienda ${index + 1}`}
                        >
                          <p className="wctc-home-card__hint">
                            No es IBI ni cuota mensual: no se suma al impacto de este mes.
                            <InfoButton label="Qué es el impuesto en la compra" size="sm" placement="end" className="wctc-help">
                              <p>{PURCHASE_TAX_HELP}</p>
                            </InfoButton>
                          </p>

                          <div className="wctc-home-card__fields">
                            <label className="wctc-purchase-field">
                              <span>Precio de compra (€)</span>
                              <input
                                type="number"
                                min={0}
                                step={1000}
                                placeholder="p. ej. 180.000"
                                value={emptyableNumberValue(home.purchasePrice)}
                                onChange={(event) => updateOwnedHome(home.id, {
                                  purchasePrice: event.target.value === ''
                                    ? 0
                                    : clampNumber(Number(event.target.value), 0, 50000000),
                                })}
                              />
                            </label>

                            <label className="wctc-purchase-field">
                              <span>Nueva o de segunda mano</span>
                              <select
                                value={home.propertyType}
                                onChange={(event) => updateOwnedHome(home.id, {
                                  propertyType: event.target.value as OwnedHome['propertyType'],
                                })}
                              >
                                <option value="used">Segunda mano (ITP)</option>
                                <option value="new">Obra nueva (IVA o IGIC)</option>
                              </select>
                            </label>

                            <label className="wctc-purchase-field">
                              <span>Comunidad autónoma</span>
                              <select
                                value={home.region}
                                onChange={(event) => updateOwnedHome(home.id, { region: event.target.value })}
                              >
                                {REGION_OPTIONS.map((region) => (
                                  <option key={region.value} value={region.value}>{region.label}</option>
                                ))}
                              </select>
                            </label>

                            {showResidenceRole ? (
                              <label className="wctc-purchase-field">
                                <span>¿Era tu vivienda habitual?</span>
                                <select
                                  value={home.residenceRole}
                                  onChange={(event) => updateOwnedHome(home.id, {
                                    residenceRole: event.target.value as ResidenceRole,
                                  })}
                                >
                                  <option value="habitual">Sí, la habitual</option>
                                  <option value="additional">No, segunda o más</option>
                                </select>
                              </label>
                            ) : null}

                            {showVatToggle ? (
                              <label className="wctc-home-card__check">
                                <input
                                  type="checkbox"
                                  checked={home.priceIncludesVat}
                                  onChange={(event) => updateOwnedHome(home.id, {
                                    priceIncludesVat: event.target.checked,
                                  })}
                                />
                                <span>El precio ya incluye IVA o IGIC</span>
                              </label>
                            ) : null}
                          </div>

                          <output
                            className="wctc-home-card__tax"
                            aria-label={`Impuesto estimado al comprar vivienda ${index + 1}`}
                          >
                            {purchaseBreakdown.status === 'empty' ? (
                              <>
                                <small>Introduce el precio para estimar</small>
                                <strong>—</strong>
                              </>
                            ) : purchaseBreakdown.status === 'foral' ? (
                              <>
                                <small>
                                  En País Vasco y Navarra el impuesto de transmisiones tiene régimen foral propio;
                                  aquí no lo estimamos.
                                </small>
                                <strong>No estimado</strong>
                              </>
                            ) : (
                              <>
                                <small>{purchaseBreakdown.headline}</small>
                                <strong>{formatEuro(purchaseBreakdown.total)}</strong>
                                <ul className="wctc-home-card__tax-lines">
                                  {purchaseBreakdown.lines.map((line) => (
                                    <li key={line.label}>
                                      <span>{line.label}</span>
                                      <span>{formatEuro(line.amount)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </output>
                        </OneOffBlock>
                      </article>
                    )
                  })}
                </div>

                <div className="wctc-homes__footer">
                  <button type="button" className="wctc-purchase-add" onClick={addOwnedHome}>
                    <Plus size={16} aria-hidden="true" />
                    <span>Añadir otra vivienda</span>
                  </button>
                  {propertyTaxAnnual > 0 ? (
                    <output className="wctc-purchase-total" aria-label="Total IBI estimado">
                      <small>Total IBI / año</small>
                      <strong>
                        {formatEuro(propertyTaxAnnual)}
                        <small>≈ {formatEuro(propertyTaxAnnual / 12)} / mes</small>
                      </strong>
                    </output>
                  ) : null}
                  {purchaseTaxTotal > 0 || hasForalPurchase ? (
                    <output className="wctc-purchase-total" aria-label="Total impuesto en compras de vivienda">
                      <small>Total de entonces (no mensual)</small>
                      <strong>
                        {purchaseTaxTotal > 0 ? formatEuro(purchaseTaxTotal) : 'No estimado'}
                        {hasForalPurchase && purchaseTaxTotal > 0 ? (
                          <small>Sin régimen foral</small>
                        ) : null}
                      </strong>
                    </output>
                  ) : null}
                </div>
              </div>
            </OwnershipGate>
          </section>

          <section className="wctc-home-strip wctc-vehicle-strip" aria-labelledby="wwtc-vehicle-title">
            <div className="wctc-home-strip__title">
              <Car size={22} aria-hidden="true" />
              <h3 id="wwtc-vehicle-title">Coche en propiedad <span>(opcional)</span></h3>
              <span className={`wctc-strip-state is-${vehiclePill.tone}`}>{vehiclePill.text}</span>
            </div>

            <OwnershipGate
              question="¿Tienes coche en propiedad?"
              description="Si tienes un vehículo a tu nombre, responde Sí para estimar el IVTM anual y el impuesto de la compra."
              answer={ownsVehicle}
              onYes={() => setOwnsVehicle('yes')}
              onNo={handleOwnsVehicleNo}
            >
              <div className="wctc-homes">
                <div className="wctc-homes__list">
                  {ownedVehicles.map((vehicle, index) => {
                    const ivtmAnnual = calculateVehicleIvtmAnnual(vehicle)
                    const purchaseTax = calculateVehiclePurchaseTax(vehicle)

                    return (
                      <article key={vehicle.id} className="wctc-home-card">
                        <div className="wctc-home-card__header">
                          <span className="wctc-ibi-index">{index + 1}</span>
                          <h4>Coche {index + 1}</h4>
                          <button
                            type="button"
                            className="wctc-purchase-remove"
                            onClick={() => removeOwnedVehicle(vehicle.id)}
                            disabled={ownedVehicles.length <= 1}
                            title={ownedVehicles.length <= 1 ? 'Debe quedar al menos un coche' : undefined}
                            aria-label={`Quitar coche ${index + 1}`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>

                        <section className="wctc-home-card__now" aria-label={`IVTM de este año, coche ${index + 1}`}>
                          <div className="wctc-ibi-head">
                            <strong>IVTM de este año</strong>
                            <InfoButton label="Qué es el IVTM estimado" size="sm" placement="end" className="wctc-help">
                              <p>{IVTM_HELP}</p>
                            </InfoButton>
                            <small>Estimación orientativa · se reparte al mes</small>
                          </div>

                          <div className="wctc-ibi-row__fields">
                            <label className="wctc-ibi-field">
                              <span className="wctc-ibi-field-label">Potencia fiscal (CV)</span>
                              <small className="wctc-guess-hint">Aparece en el permiso de circulación.</small>
                              <input
                                type="number"
                                min={0}
                                max={50}
                                step={1}
                                placeholder="p. ej. 10"
                                value={emptyableNumberValue(vehicle.fiscalPowerCv)}
                                onChange={(event) => updateOwnedVehicle(vehicle.id, {
                                  fiscalPowerCv: event.target.value === ''
                                    ? 0
                                    : clampNumber(Number(event.target.value), 0, 50),
                                })}
                              />
                              <span className="wctc-guess">
                                <span className="wctc-guess__label">No lo sé, usa una media:</span>
                                {VEHICLE_CV_PRESETS.map((preset) => (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    className="wctc-guess-chip"
                                    onClick={() => updateOwnedVehicle(vehicle.id, { fiscalPowerCv: preset.cv })}
                                  >
                                    {preset.label} · {preset.cv} CV
                                  </button>
                                ))}
                              </span>
                            </label>

                            <label className="wctc-ibi-field wctc-ibi-field--rate">
                              <span>Tipo IVTM estimado (€/CV)</span>
                              <input
                                type="number"
                                min={0}
                                max={30}
                                step={0.1}
                                value={Number(vehicle.ivtmRatePerCv.toFixed(2))}
                                onChange={(event) => updateOwnedVehicle(vehicle.id, {
                                  ivtmRatePerCv: clampNumber(Number(event.target.value), 0, 30),
                                })}
                              />
                              <RateScale
                                value={vehicle.ivtmRatePerCv}
                                min={4}
                                max={18}
                                step={0.5}
                                marks={['bajo 4 €', 'media 9,5 €', 'alto 18 €']}
                                ariaLabel={`Tipo de IVTM del coche ${index + 1}`}
                                onChange={(next) => updateOwnedVehicle(vehicle.id, { ivtmRatePerCv: next })}
                              />
                            </label>
                          </div>

                          <output className="wctc-ibi-amounts" aria-label={`Cuota IVTM estimada coche ${index + 1}`}>
                            <span className="wctc-ibi-amount">
                              <small>Al año</small>
                              <strong>{formatEuroOrDash(ivtmAnnual)}</strong>
                            </span>
                            <span className="wctc-ibi-amount">
                              <small>Al mes</small>
                              <strong>{formatEuroOrDash(ivtmAnnual > 0 ? ivtmAnnual / 12 : 0)}</strong>
                            </span>
                          </output>
                        </section>

                        <OneOffBlock
                          headline="Lo que pagaste al comprar"
                          value={vehicle.purchasePrice > 0 ? formatEuro(purchaseTax) : '—'}
                          label={`Impuesto al comprar, coche ${index + 1}`}
                        >
                          <p className="wctc-home-card__hint">
                            No es el IVTM ni el gasto mensual de combustible: no se suma al impacto de este mes.
                            <InfoButton label="Qué es el impuesto en la compra del coche" size="sm" placement="end" className="wctc-help">
                              <p>{CAR_PURCHASE_TAX_HELP}</p>
                            </InfoButton>
                          </p>

                          <div className="wctc-home-card__fields">
                            <label className="wctc-purchase-field">
                              <span>Precio de compra (€)</span>
                              <input
                                type="number"
                                min={0}
                                step={500}
                                placeholder="p. ej. 14.000"
                                value={emptyableNumberValue(vehicle.purchasePrice)}
                                onChange={(event) => updateOwnedVehicle(vehicle.id, {
                                  purchasePrice: event.target.value === ''
                                    ? 0
                                    : clampNumber(Number(event.target.value), 0, 5000000),
                                })}
                              />
                            </label>

                            <label className="wctc-purchase-field">
                              <span>Tipo de compra</span>
                              <select
                                value={vehicle.condition}
                                onChange={(event) => updateOwnedVehicle(vehicle.id, {
                                  condition: event.target.value as VehiclePurchase['condition'],
                                })}
                              >
                                <option value="new">Nuevo (IVA o IGIC)</option>
                                <option value="used_dealer">Segunda mano en concesionario</option>
                                <option value="used_private">Segunda mano entre particulares</option>
                              </select>
                            </label>

                            <label className="wctc-purchase-field">
                              <span>Comunidad autónoma</span>
                              <select
                                value={vehicle.region}
                                onChange={(event) => updateOwnedVehicle(vehicle.id, { region: event.target.value })}
                              >
                                {REGION_OPTIONS.map((region) => (
                                  <option key={region.value} value={region.value}>{region.label}</option>
                                ))}
                              </select>
                            </label>

                            {vehicle.condition === 'new' ? (
                              <label className="wctc-purchase-field">
                                <span>Emisiones CO₂ (matriculación)</span>
                                <select
                                  value={vehicle.co2Tier}
                                  onChange={(event) => updateOwnedVehicle(vehicle.id, {
                                    co2Tier: event.target.value as VehiclePurchase['co2Tier'],
                                  })}
                                >
                                  <option value="exempt">0 % (0 g/km)</option>
                                  <option value="low">4,75 % (hasta 120 g/km)</option>
                                  <option value="medium">9,75 % (121-160 g/km)</option>
                                  <option value="high">14,75 % (más de 160 g/km)</option>
                                </select>
                              </label>
                            ) : null}
                          </div>

                          <output
                            className="wctc-home-card__tax"
                            aria-label={`Impuesto estimado al comprar coche ${index + 1}`}
                          >
                            {vehicle.purchasePrice > 0 ? (
                              <>
                                <small>{getVehiclePurchaseTaxLabel(vehicle)}</small>
                                <strong>{formatEuro(purchaseTax)}</strong>
                              </>
                            ) : (
                              <>
                                <small>Introduce el precio para estimar</small>
                                <strong>—</strong>
                              </>
                            )}
                          </output>
                        </OneOffBlock>
                      </article>
                    )
                  })}
                </div>

                <div className="wctc-homes__footer">
                  <button type="button" className="wctc-purchase-add" onClick={addOwnedVehicle}>
                    <Plus size={16} aria-hidden="true" />
                    <span>Añadir otro coche</span>
                  </button>
                  {vehicleTaxAnnual > 0 ? (
                    <output className="wctc-purchase-total" aria-label="Total IVTM estimado">
                      <small>Total IVTM / año</small>
                      <strong>
                        {formatEuro(vehicleTaxAnnual)}
                        <small>≈ {formatEuro(vehicleTaxAnnual / 12)} / mes</small>
                      </strong>
                    </output>
                  ) : null}
                  {vehiclePurchaseTaxTotal > 0 ? (
                    <output className="wctc-purchase-total" aria-label="Total impuesto en compras de coches">
                      <small>Total de entonces (no mensual)</small>
                      <strong>{formatEuro(vehiclePurchaseTaxTotal)}</strong>
                    </output>
                  ) : null}
                </div>
              </div>
            </OwnershipGate>
          </section>
        </section>

        <aside className="wctc-summary" aria-label="Resumen de impuestos por tener vivienda o coche">
          <div className="wctc-summary-title">
            <Landmark size={22} aria-hidden="true" />
            <h3>Lo que suma a tu mes</h3>
          </div>

          <output className={`wctc-summary-card wctc-summary-card--purple${homeSummary.muted ? ' is-muted' : ''}`}>
            <Home size={34} aria-hidden="true" />
            <span><b>IBI de este año</b><small>{homeSummary.caption}</small></span>
            <strong>{homeSummary.main}<small>{homeSummary.sub}</small></strong>
          </output>

          <output className={`wctc-summary-card wctc-summary-card--purple${vehicleSummary.muted ? ' is-muted' : ''}`}>
            <Car size={34} aria-hidden="true" />
            <span><b>IVTM estimado</b><small>{vehicleSummary.caption}</small></span>
            <strong>{vehicleSummary.main}<small>{vehicleSummary.sub}</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--cyan wctc-summary-card--total">
            <Calculator size={34} aria-hidden="true" />
            <span><b>Total recurrente</b><small>IBI + IVTM al mes</small></span>
            <strong>{formatEuro(toMonthly(result.recurringTaxAnnual))}</strong>
          </output>

          <p className="wctc-summary-split"><span>Fuera de tu mes</span></p>

          <output className="wctc-summary-card wctc-summary-card--orange wctc-summary-card--aside">
            <Receipt size={34} aria-hidden="true" />
            <span><b>Pagos únicos de entonces</b><small>No se suman a tu mes</small></span>
            <strong>
              {result.oneOffPurchaseTaxTotal > 0 ? formatEuro(result.oneOffPurchaseTaxTotal) : '—'}
              <small>{hasForalPurchase ? 'Sin régimen foral' : 'IVA, ITP, AJD y matriculación'}</small>
            </strong>
          </output>

          {hasNothing ? (
            <p className="wctc-summary-note">
              Sin vivienda ni coche en propiedad no hay IBI ni IVTM que sumar. Puedes continuar al resumen.
            </p>
          ) : !answeredBoth ? (
            <p className="wctc-summary-note">
              Responde las dos preguntas para completar el paso. Si no tienes vivienda o coche, marca «No».
            </p>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

export default WorkerWealthTaxesCard
