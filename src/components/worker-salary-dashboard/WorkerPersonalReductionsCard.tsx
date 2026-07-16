import {
  Accessibility,
  Baby,
  BriefcaseBusiness,
  Bus,
  ChevronDown,
  CheckCircle2,
  FileText,
  HandHeart,
  Heart,
  Landmark,
  Percent,
  ShieldCheck,
  TrendingDown,
  UsersRound,
  Utensils,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import './WorkerPersonalReductionsCard.css'

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'
export type DisabilityPercent = 0 | 33 | 65
export type SelectOption = {
  value: string
  label: string
}

export type PersonalReductionResult = {
  children: number
  eligibleChildren: number
  childrenUnder3: number
  disabilityPercent: DisabilityPercent
  taxpayerAssistance: string
  taxpayerDisabilityAssistanceMinimum: number
  maritalStatus: MaritalStatus
  ascendants: number
  eligibleAscendants: number
  ascendantsOver75: number
  dependentDisabilityMinimum: number
  descendantProfiles: DependentProfile[]
  ascendantProfiles: DependentProfile[]
  reductionsTotal: number
  deductionsTotal: number
  calculationWarnings: Array<{
    section: 'reductions' | 'deductions'
    message: string
  }>
  reductionLines: Record<ReductionKey, number | boolean>
  deductionLines: Record<DeductionKey, string>
}

type ReductionKey =
  | 'pensionPlans'
  | 'companyPensionPlan'
  | 'mutualities'
  | 'compensatoryPension'
  | 'childSupport'
  | 'jointTaxation'
  | 'protectedAssets'
  | 'regionalReductions'
  | 'unionAndProfessionalFees'

type DeductionKey =
  | 'maternity'
  | 'daycare'
  | 'largeFamily'
  | 'dependentDisability'
  | 'donations'
  | 'rent'
  | 'oldHomePurchase'
  | 'newCompanyInvestment'
  | 'regionalDeductions'

type WorkerPersonalReductionsCardProps = {
  focus?: 'reductions' | 'deductions-benefits'
  stepNumber?: number
  totalSteps?: number
  initialChildren?: number
  initialDisabilityPercent?: DisabilityPercent
  initialMaritalStatus?: MaritalStatus
  initialAscendants?: number
  initialResult?: PersonalReductionResult | null
  initialBaseBeforeReductions?: number
  quotaBeforeDeductions?: number
  appliedBaseReductions?: number
  appliedQuotaDeductions?: number
  onResultChange?: (result: PersonalReductionResult) => void
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

type FieldOption = {
  value: string
  label: string
}

type TopFieldProps = {
  icon: IconComponent
  label: string
  value: string
  options: FieldOption[]
  onChange: (value: string) => void
}

type AdjustmentRowProps = {
  icon: IconComponent
  label: string
  value: string
  options: FieldOption[]
  accent: 'cyan' | 'violet'
  onChange: (value: string) => void
}

export type DependentProfile = {
  livesWith: string
  ownIncome: string
  filesReturn: string
  disabilityPercent: string
  assistance: string
  ageBand: string
}

type DependentEditorProps = {
  type: 'descendant' | 'ascendant'
  title: string
  profiles: DependentProfile[]
  count: number
  onChange: (index: number, field: keyof DependentProfile, value: string) => void
}

type BenefitStatus = 'exempt' | 'partial' | 'taxable' | 'review'

type BenefitItem = {
  id: string
  label: string
  status: BenefitStatus
  icon: IconComponent
  defaultAmount: number
  maxMonthly?: number
  limitLabel: string
}

const maritalOptions: FieldOption[] = [
  { value: 'single', label: 'Soltero/a' },
  { value: 'married', label: 'Casado/a' },
  { value: 'divorced', label: 'Divorciado/a' },
  { value: 'widowed', label: 'Viudo/a' },
]

const disabilityOptions: FieldOption[] = [
  { value: '0', label: '0%' },
  { value: '33', label: '33%' },
  { value: '65', label: '65%' },
]

const countOptions: FieldOption[] = Array.from({ length: 5 }, (_, index) => ({
  value: String(index),
  label: String(index),
}))

const ascendantCountOptions: FieldOption[] = Array.from({ length: 4 }, (_, index) => ({
  value: String(index),
  label: String(index),
}))

const moneyOptions: FieldOption[] = [
  { value: '0', label: '0 €' },
  { value: '1000', label: '1.000 €' },
  { value: '2000', label: '2.000 €' },
  { value: '3000', label: '3.000 €' },
]

const largerMoneyOptions: FieldOption[] = [
  ...moneyOptions,
  { value: '5000', label: '5.000 EUR' },
  { value: '8000', label: '8.000 EUR' },
]

const yesNoOptions: FieldOption[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Si' },
]

const jointTaxationOptions: FieldOption[] = [
  { value: 'no', label: 'Individual' },
  { value: 'yes', label: 'Conjunta' },
]

const largeFamilyOptions: FieldOption[] = [
  { value: 'none', label: 'No' },
  { value: 'general', label: 'General' },
  { value: 'special', label: 'Especial' },
]

const yesNoPositiveOptions: FieldOption[] = [
  { value: 'yes', label: 'Si' },
  { value: 'no', label: 'No' },
]

const descendantAgeOptions: FieldOption[] = [
  { value: 'under3', label: 'Menor de 3' },
  { value: '3_to_24', label: '3 a 24' },
  { value: '25_plus_disabled', label: '25+ con discapacidad' },
]

const ascendantAgeOptions: FieldOption[] = [
  { value: 'under65_disabled', label: 'Menor de 65 con discapacidad' },
  { value: '65_74', label: '65 a 74' },
  { value: '75_plus', label: '75 o mas' },
]

const maternityOptions: FieldOption[] = [
  { value: 'none', label: 'No aplica' },
  { value: 'applies', label: 'Aplica' },
]

const configureOptions: FieldOption[] = [
  { value: 'configure', label: 'Configurar' },
  { value: 'none', label: 'Sin deduccion' },
]

const descendantMinimums = [2400, 2700, 4000, 4500]

const benefitItems: BenefitItem[] = [
  {
    id: 'meal-card',
    label: 'Tarjeta comida',
    status: 'partial',
    icon: Utensils,
    defaultAmount: 0,
    maxMonthly: 220,
    limitLabel: 'Max. exento: 11 EUR/dia; 220 EUR si 20 dias',
  },
  {
    id: 'transport-card',
    label: 'Tarjeta transporte',
    status: 'partial',
    icon: Bus,
    defaultAmount: 0,
    maxMonthly: 136.36,
    limitLabel: 'Max. exento: 136,36 EUR/mes; 1.500 EUR/ano',
  },
  {
    id: 'health-insurance',
    label: 'Seguro medico',
    status: 'partial',
    icon: ShieldCheck,
    defaultAmount: 0,
    maxMonthly: 41.67,
    limitLabel: 'Max. exento: 41,67 EUR/mes por persona',
  },
  {
    id: 'company-daycare',
    label: 'Guarderia empresa',
    status: 'partial',
    icon: Baby,
    defaultAmount: 0,
    limitLabel: 'Sin tope mensual general si cumple requisitos',
  },
]


function SelectControl({ value, options, label, onChange }: {
  value: string
  options: FieldOption[]
  label: string
  onChange: (value: string) => void
}) {
  return (
    <span className="wprc-select">
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" />
    </span>
  )
}

function qualifiesBase(profile: DependentProfile) {
  return profile.livesWith === 'yes' && profile.ownIncome === 'no' && profile.filesReturn === 'no'
}

function qualifiesDescendant(profile: DependentProfile) {
  return qualifiesBase(profile)
    && (profile.ageBand !== '25_plus_disabled' || profile.disabilityPercent !== '0')
}

function qualifiesAscendant(profile: DependentProfile) {
  return qualifiesBase(profile)
    && (profile.ageBand !== 'under65_disabled' || profile.disabilityPercent !== '0')
}

function dependentMinimum(profile: DependentProfile) {
  const disabilityMinimum = profile.disabilityPercent === '65'
    ? 9000
    : profile.disabilityPercent === '33'
      ? 3000
      : 0
  const assistanceMinimum = disabilityMinimum > 0 && (profile.assistance === 'yes' || profile.disabilityPercent === '65')
    ? 3000
    : 0
  return disabilityMinimum + assistanceMinimum
}

function taxpayerDisabilityAssistance(disabilityPercent: string, assistance: string) {
  return disabilityPercent !== '0' && (assistance === 'yes' || disabilityPercent === '65') ? 3000 : 0
}

function taxpayerDisabilityMinimum(disabilityPercent: string) {
  return disabilityPercent === '65' ? 9000 : disabilityPercent === '33' ? 3000 : 0
}

function descendantMinimumAt(index: number) {
  return descendantMinimums[Math.min(index, descendantMinimums.length - 1)]
}

function clampBenefitAmount(value: number, maxMonthly?: number) {
  const positiveValue = Number.isFinite(value) ? Math.max(0, value) : 0
  return typeof maxMonthly === 'number' ? Math.min(positiveValue, maxMonthly) : positiveValue
}

function TopField({ icon: Icon, label, value, options, onChange }: TopFieldProps) {
  const selected = options.find((option) => option.value === value)

  return (
    <label className="wprc-top-field">
      <Icon aria-hidden="true" />
      <span className="wprc-top-field__copy">
        <span>{label}</span>
        <strong>{selected?.label ?? value}</strong>
      </span>
      <SelectControl label={label} value={value} options={options} onChange={onChange} />
    </label>
  )
}

function DependentEditor({ type, title, profiles, count, onChange }: DependentEditorProps) {
  const activeProfiles = profiles.slice(0, count)
  const ageOptions = type === 'descendant' ? descendantAgeOptions : ascendantAgeOptions

  return (
    <article className={`wprc-dependent-card wprc-dependent-card--${type}`}>
      <header>
        <div>
          <h3>{title}</h3>
          <p>Solo computan si conviven, no tienen rentas propias relevantes y no presentan declaracion.</p>
        </div>
      </header>

      {activeProfiles.length > 0 ? (
        <div className="wprc-dependent-list">
          {activeProfiles.map((profile, index) => {
            const label = type === 'descendant' ? `Descendiente ${index + 1}` : `Ascendiente ${index + 1}`
            const isEligible = type === 'descendant'
              ? qualifiesDescendant(profile)
              : qualifiesAscendant(profile)

            return (
              <section className={`wprc-dependent ${isEligible ? 'is-eligible' : 'is-excluded'}`} key={`${type}-${index}`}>
                <div className="wprc-dependent__head">
                  <strong>{label}</strong>
                  <span>{isEligible ? 'Computa' : 'No computa'}</span>
                </div>
                <label>
                  <span>{type === 'descendant' ? 'Edad' : 'Edad ascendiente'}</span>
                  <SelectControl
                    label={`${label}: edad`}
                    value={profile.ageBand}
                    options={ageOptions}
                    onChange={(value) => onChange(index, 'ageBand', value)}
                  />
                </label>
                <label>
                  <span>Convive contigo</span>
                  <SelectControl
                    label={`${label}: convive contigo`}
                    value={profile.livesWith}
                    options={yesNoPositiveOptions}
                    onChange={(value) => onChange(index, 'livesWith', value)}
                  />
                </label>
                <label>
                  <span>Rentas propias</span>
                  <SelectControl
                    label={`${label}: rentas propias`}
                    value={profile.ownIncome}
                    options={yesNoOptions}
                    onChange={(value) => onChange(index, 'ownIncome', value)}
                  />
                </label>
                <label>
                  <span>Presenta declaracion</span>
                  <SelectControl
                    label={`${label}: presenta declaracion`}
                    value={profile.filesReturn}
                    options={yesNoOptions}
                    onChange={(value) => onChange(index, 'filesReturn', value)}
                  />
                </label>
                <label>
                  <span>Grado discapacidad</span>
                  <SelectControl
                    label={`${label}: grado de discapacidad`}
                    value={profile.disabilityPercent}
                    options={disabilityOptions}
                    onChange={(value) => onChange(index, 'disabilityPercent', value)}
                  />
                </label>
                <label>
                  <span>Ayuda o movilidad reducida</span>
                  <SelectControl
                    label={`${label}: ayuda de terceras personas o movilidad reducida`}
                    value={profile.assistance}
                    options={yesNoOptions}
                    onChange={(value) => onChange(index, 'assistance', value)}
                  />
                </label>
              </section>
            )
          })}
        </div>
      ) : (
        <p className="wprc-empty">Indica cuantas personas hay para desplegar el detalle.</p>
      )}
    </article>
  )
}

function BenefitGrid() {
  const [amounts, setAmounts] = useState<Record<string, number>>(() => (
    Object.fromEntries(benefitItems.map((item) => [item.id, item.defaultAmount]))
  ))
  const totalBenefits = benefitItems.reduce((total, item) => total + (amounts[item.id] ?? 0), 0)

  return (
    <section className="wprc-benefits" aria-labelledby="wprc-benefits-title">
      <div className="wprc-benefits__intro">
        <div className="wprc-benefits__heading">
          <span className="wprc-benefits__icon" aria-hidden="true">
            <BriefcaseBusiness />
          </span>
          <div>
            <span>2.</span>
            <h3 id="wprc-benefits-title">Salario en especie y beneficios</h3>
            <p>Importes mensuales con tratamiento fiscal orientativo por beneficio.</p>
          </div>
        </div>

        <div className="wprc-benefits__total" aria-label="Importe mensual informado">
          <span>Importe mensual</span>
          <strong>{totalBenefits.toLocaleString('es-ES', { maximumFractionDigits: 2 })} EUR</strong>
        </div>


      </div>

      <div className="wprc-benefit-list">
        {benefitItems.map((item) => (
          <label className={`wprc-benefit wprc-benefit--${item.status}`} key={item.id}>
            <span className="wprc-benefit__main">
              <span className="wprc-benefit__icon" aria-hidden="true">
                <item.icon />
              </span>
              <span>{item.label}</span>
            </span>
            <span className="wprc-benefit__amount">
              <input
                aria-label={`${item.label}: importe mensual`}
                inputMode="numeric"
                max={item.maxMonthly}
                min="0"
                step="0.01"
                type="number"
                value={amounts[item.id] ?? 0}
                onChange={(event) => {
                  const nextValue = Number(event.target.value)
                  setAmounts((currentAmounts) => ({
                    ...currentAmounts,
                    [item.id]: clampBenefitAmount(nextValue, item.maxMonthly),
                  }))
                }}
              />
              <span>EUR</span>
            </span>
            <span className="wprc-benefit__limit">{item.limitLabel}</span>
          </label>
        ))}
      </div>
    </section>
  )
}

function AdjustmentRow({ icon: Icon, label, value, options, accent, onChange }: AdjustmentRowProps) {
  return (
    <label className={`wprc-adjustment-row wprc-adjustment-row--${accent}`}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <SelectControl label={label} value={value} options={options} onChange={onChange} />
    </label>
  )
}

function formatEuro(value: number) {
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €`
}

function createDependentProfiles(count: number, type: 'descendant' | 'ascendant'): DependentProfile[] {
  return Array.from({ length: count }, () => ({
    livesWith: 'yes',
    ownIncome: 'no',
    filesReturn: 'no',
    disabilityPercent: '0',
    assistance: 'no',
    ageBand: type === 'descendant' ? '3_to_24' : '65_74',
  }))
}

export function WorkerPersonalReductionsCard({
  focus = 'reductions',
  stepNumber = 4,
  totalSteps = 9,
  initialChildren = 1,
  initialDisabilityPercent = 0,
  initialMaritalStatus = 'married',
  initialAscendants = 0,
  initialResult = null,
  initialBaseBeforeReductions = 0,
  quotaBeforeDeductions = 0,
  appliedBaseReductions = 0,
  appliedQuotaDeductions = 0,
  onResultChange,
}: WorkerPersonalReductionsCardProps) {
  const showReductionsSection = focus === 'reductions'
  const showDeductionsSection = focus === 'deductions-benefits'
  const stepTitle = showReductionsSection ? 'Reducciones y minimo familiar' : 'Deducciones y salario en especie'
  const stepDescription = showReductionsSection
    ? 'Detalla quien convive contigo y que requisitos cumple antes de llevarlo al IRPF.'
    : 'Indica deducciones de cuota y beneficios en especie que pueden quedar exentos o tributar de forma distinta.'
  const [children, setChildren] = useState(() => String(initialResult?.children ?? initialChildren))
  const [disabilityPercent, setDisabilityPercent] = useState(() => String(initialResult?.disabilityPercent ?? initialDisabilityPercent))
  const [taxpayerAssistance, setTaxpayerAssistance] = useState(() => initialResult?.taxpayerAssistance ?? 'no')
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(() => initialResult?.maritalStatus ?? initialMaritalStatus)
  const [ascendants, setAscendants] = useState(() => String(initialResult?.ascendants ?? initialAscendants))
  const [pensionPlans, setPensionPlans] = useState(() => String(initialResult?.reductionLines.pensionPlans ?? 0))
  const [companyPensionPlan, setCompanyPensionPlan] = useState(() => String(initialResult?.reductionLines.companyPensionPlan ?? 0))
  const [mutualities, setMutualities] = useState(() => String(initialResult?.reductionLines.mutualities ?? 0))
  const [compensatoryPension, setCompensatoryPension] = useState(() => String(initialResult?.reductionLines.compensatoryPension ?? 0))
  const [childSupport, setChildSupport] = useState(() => String(initialResult?.reductionLines.childSupport ?? 0))
  const [jointTaxation, setJointTaxation] = useState(() => initialResult?.reductionLines.jointTaxation === true ? 'yes' : 'no')
  const [protectedAssets, setProtectedAssets] = useState(() => String(initialResult?.reductionLines.protectedAssets ?? 0))
  const [regionalReductions, setRegionalReductions] = useState(() => String(initialResult?.reductionLines.regionalReductions ?? 0))
  const [unionAndProfessionalFees, setUnionAndProfessionalFees] = useState(() => String(initialResult?.reductionLines.unionAndProfessionalFees ?? 0))
  const [maternity, setMaternity] = useState(() => initialResult?.deductionLines.maternity ?? 'none')
  const [daycare, setDaycare] = useState(() => initialResult?.deductionLines.daycare ?? '0')
  const [largeFamily, setLargeFamily] = useState(() => initialResult?.deductionLines.largeFamily ?? 'none')
  const [dependentDisability, setDependentDisability] = useState(() => initialResult?.deductionLines.dependentDisability ?? 'no')
  const [donations, setDonations] = useState(() => initialResult?.deductionLines.donations ?? '0')
  const [rent, setRent] = useState(() => initialResult?.deductionLines.rent ?? '0')
  const [oldHomePurchase, setOldHomePurchase] = useState(() => initialResult?.deductionLines.oldHomePurchase ?? '0')
  const [newCompanyInvestment, setNewCompanyInvestment] = useState(() => initialResult?.deductionLines.newCompanyInvestment ?? '0')
  const [regionalDeductions, setRegionalDeductions] = useState(() => initialResult?.deductionLines.regionalDeductions ?? 'configure')
  const [descendantProfiles, setDescendantProfiles] = useState(() => initialResult?.descendantProfiles ?? createDependentProfiles(4, 'descendant'))
  const [ascendantProfiles, setAscendantProfiles] = useState(() => initialResult?.ascendantProfiles ?? createDependentProfiles(3, 'ascendant'))

  const updateDescendant = (index: number, field: keyof DependentProfile, value: string) => {
    setDescendantProfiles((profiles) => profiles.map((profile, profileIndex) => (
      profileIndex === index ? { ...profile, [field]: value } : profile
    )))
  }

  const updateAscendant = (index: number, field: keyof DependentProfile, value: string) => {
    setAscendantProfiles((profiles) => profiles.map((profile, profileIndex) => (
      profileIndex === index ? { ...profile, [field]: value } : profile
    )))
  }

  const result = useMemo<PersonalReductionResult>(() => {
    const selectedChildrenCount = Number(children)
    const selectedAscendantsCount = Number(ascendants)
    const eligibleDescendants = descendantProfiles.slice(0, selectedChildrenCount).filter(qualifiesDescendant)
    const eligibleAscendants = ascendantProfiles.slice(0, selectedAscendantsCount).filter(qualifiesAscendant)
    const dependentDisabilityMinimum = [...eligibleDescendants, ...eligibleAscendants]
      .reduce((total, profile) => total + dependentMinimum(profile), 0)
    const taxpayerDisabilityAssistanceMinimum = taxpayerDisabilityAssistance(disabilityPercent, taxpayerAssistance)
    const pensionPlanAmount = Number(pensionPlans)
    const companyPensionPlanAmount = Number(companyPensionPlan)
    const mutualitiesAmount = Number(mutualities)
    const compensatoryAmount = Number(compensatoryPension)
    const childSupportAmount = Number(childSupport)
    const jointTaxationReduction = jointTaxation === 'yes' ? 3400 : 0
    const protectedAssetsAmount = Number(protectedAssets)
    const regionalReductionsAmount = Number(regionalReductions)
    const unionAndProfessionalFeesAmount = Number(unionAndProfessionalFees)
    const reductionsTotal =
      pensionPlanAmount
      + companyPensionPlanAmount
      + mutualitiesAmount
      + compensatoryAmount
      + childSupportAmount
      + jointTaxationReduction
      + protectedAssetsAmount
      + regionalReductionsAmount
      + unionAndProfessionalFeesAmount
    const deductionsTotal =
      (maternity === 'applies' ? 1200 : 0)
      + Number(daycare)
      + (largeFamily === 'special' ? 2400 : largeFamily === 'general' ? 1200 : 0)
      + (dependentDisability === 'yes' ? 1200 : 0)
      + Number(donations)
      + Number(rent)
      + Number(oldHomePurchase)
      + Number(newCompanyInvestment)
    const calculationWarnings: PersonalReductionResult['calculationWarnings'] = []
    if (pensionPlanAmount + companyPensionPlanAmount + mutualitiesAmount > 0) {
      calculationWarnings.push({
        section: 'reductions',
        message: 'Prevision social: se aplica solo el limite general conjunto de 1.500 EUR y el 30 % del rendimiento neto. El incremento de planes de empleo requiere datos adicionales.',
      })
    }
    if (compensatoryAmount > 0) {
      calculationWarnings.push({ section: 'reductions', message: 'Pension compensatoria no aplicada: falta confirmar resolucion judicial o convenio formalizado.' })
    }
    if (childSupportAmount > 0) {
      calculationWarnings.push({ section: 'reductions', message: 'Anualidades a hijos no aplicadas: requieren el calculo por escalas separadas y comprobar la incompatibilidad con el minimo por descendientes.' })
    }
    if (jointTaxation === 'yes') {
      calculationWarnings.push({ section: 'reductions', message: 'Tributacion conjunta no aplicada: falta identificar la unidad familiar legal y la convivencia con el otro progenitor.' })
    }
    if (protectedAssetsAmount > 0) {
      calculationWarnings.push({ section: 'reductions', message: 'Patrimonio protegido no aplicado: faltan aportante, beneficiario, aportaciones totales y excesos pendientes.' })
    }
    if (regionalReductionsAmount > 0) {
      calculationWarnings.push({ section: 'reductions', message: 'Reduccion autonomica no aplicada: el importe necesita codigo legal, fuente y requisitos verificados.' })
    }
    if (unionAndProfessionalFeesAmount > 0) {
      calculationWarnings.push({ section: 'reductions', message: 'Cuotas sindicales o profesionales no aplicadas: deben separarse y confirmar la colegiacion obligatoria y su limite.' })
    }
    if (maternity !== 'none') {
      calculationWarnings.push({ section: 'deductions', message: 'Maternidad no aplicada: faltan hijo, meses con derecho, situacion habilitante y abonos anticipados.' })
    }
    if (Number(daycare) > 0) {
      calculationWarnings.push({ section: 'deductions', message: 'Guarderia no aplicada: faltan meses completos, centro autorizado, gasto neto, ayudas y pagos exentos de empresa.' })
    }
    if (largeFamily !== 'none') {
      calculationWarnings.push({ section: 'deductions', message: 'Familia numerosa no aplicada: faltan titulo, categoria, meses, reparto y abonos anticipados.' })
    }
    if (dependentDisability === 'yes') {
      calculationWarnings.push({ section: 'deductions', message: 'Discapacidad a cargo no aplicada: debe calcularse por persona y mes, con reparto y anticipos.' })
    }
    if (Number(donations) > 0) {
      calculationWarnings.push({ section: 'deductions', message: 'Donativo no aplicado: faltan entidad beneficiaria, recurrencia y limite sobre la base liquidable.' })
    }
    if (Number(rent) > 0) {
      calculationWarnings.push({ section: 'deductions', message: 'Alquiler no aplicado: hay que distinguir el regimen estatal transitorio de la deduccion autonomica y comprobar el contrato.' })
    }
    if (Number(oldHomePurchase) > 0) {
      calculationWarnings.push({ section: 'deductions', message: 'Vivienda anterior a 2013 no aplicada: falta acreditar el regimen transitorio, titularidad y pagos admisibles.' })
    }
    if (Number(newCompanyInvestment) > 0) {
      calculationWarnings.push({ section: 'deductions', message: 'Empresa nueva no aplicada: faltan certificacion y requisitos societarios.' })
    }
    if (regionalDeductions !== 'none') {
      calculationWarnings.push({ section: 'deductions', message: 'Deducciones autonomicas no aplicadas: cada comunidad exige una regla y documentacion propias.' })
    }

    return {
      children: selectedChildrenCount,
      eligibleChildren: eligibleDescendants.length,
      childrenUnder3: eligibleDescendants.filter((profile) => profile.ageBand === 'under3').length,
      disabilityPercent: Number(disabilityPercent) as DisabilityPercent,
      taxpayerAssistance,
      taxpayerDisabilityAssistanceMinimum,
      maritalStatus,
      ascendants: selectedAscendantsCount,
      eligibleAscendants: eligibleAscendants.length,
      ascendantsOver75: eligibleAscendants.filter((profile) => profile.ageBand === '75_plus').length,
      dependentDisabilityMinimum,
      descendantProfiles,
      ascendantProfiles,
      reductionsTotal,
      deductionsTotal,
      calculationWarnings,
      reductionLines: {
        pensionPlans: pensionPlanAmount,
        companyPensionPlan: companyPensionPlanAmount,
        mutualities: mutualitiesAmount,
        compensatoryPension: compensatoryAmount,
        childSupport: childSupportAmount,
        jointTaxation: jointTaxation === 'yes',
        protectedAssets: protectedAssetsAmount,
        regionalReductions: regionalReductionsAmount,
        unionAndProfessionalFees: unionAndProfessionalFeesAmount,
      },
      deductionLines: {
        maternity,
        daycare,
        largeFamily,
        dependentDisability,
        donations,
        rent,
        oldHomePurchase,
        newCompanyInvestment,
        regionalDeductions,
      },
    }
  }, [
    ascendants,
    ascendantProfiles,
    childSupport,
    children,
    companyPensionPlan,
    compensatoryPension,
    daycare,
    dependentDisability,
    descendantProfiles,
    disabilityPercent,
    donations,
    jointTaxation,
    largeFamily,
    maritalStatus,
    maternity,
    mutualities,
    newCompanyInvestment,
    oldHomePurchase,
    pensionPlans,
    protectedAssets,
    regionalReductions,
    regionalDeductions,
    rent,
    taxpayerAssistance,
    unionAndProfessionalFees,
  ])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  const selectedDescendants = descendantProfiles.slice(0, Number(children))
  const eligibleDescendants = selectedDescendants.filter(qualifiesDescendant)
  const selectedAscendants = ascendantProfiles.slice(0, Number(ascendants))
  const eligibleAscendants = selectedAscendants.filter(qualifiesAscendant)
  const descendantMinimumTotal = eligibleDescendants.reduce((total, _profile, index) => total + descendantMinimumAt(index), 0)
  const under3Minimum = result.childrenUnder3 * 2800
  const ascendantMinimumTotal = result.eligibleAscendants * 1150 + result.ascendantsOver75 * 1400
  const taxpayerDisabilityMinimumTotal = taxpayerDisabilityMinimum(disabilityPercent)
  const familyMinimumPreview = descendantMinimumTotal
    + under3Minimum
    + ascendantMinimumTotal
    + taxpayerDisabilityMinimumTotal
    + result.dependentDisabilityMinimum
    + result.taxpayerDisabilityAssistanceMinimum
  const explainedBaseInitial = Math.max(0, initialBaseBeforeReductions)
  const explainedBaseLiquidable = Math.max(0, explainedBaseInitial - appliedBaseReductions)
  const explainedQuotaBeforeDeductions = Math.max(0, quotaBeforeDeductions)
  const explainedQuotaFinal = Math.max(0, explainedQuotaBeforeDeductions - appliedQuotaDeductions)
  const visibleWarnings = result.calculationWarnings.filter((warning) => (
    warning.section === (showReductionsSection ? 'reductions' : 'deductions')
  ))

  return (
    <section className={`wprc wprc--${focus}`} aria-labelledby="wprc-title">
      <div className="wprc-hero">
        <header className="wprc-header">
          <div className="wprc-step-orb" aria-hidden="true">{stepNumber}</div>
          <div className="wprc-title">
            <span>Paso {stepNumber} de {totalSteps}</span>
            <h2 id="wprc-title">{stepTitle}</h2>
            <p>{stepDescription}</p>
          </div>
        </header>

        {showReductionsSection ? (
          <aside className="wprc-hero-panel" aria-label="Resumen de requisitos">
            <h3>En el IRPF: que estoy viendo?</h3>
            <ul>
              <li><CheckCircle2 aria-hidden="true" /> Convive contigo o depende economicamente.</li>
              <li><CheckCircle2 aria-hidden="true" /> No tiene rentas propias relevantes.</li>
              <li><CheckCircle2 aria-hidden="true" /> No presenta declaracion que impida aplicar el minimo.</li>
            </ul>
            <strong>{formatEuro(familyMinimumPreview)}</strong>
            <span>Minimo familiar orientativo segun los campos seleccionados.</span>
          </aside>
        ) : (
          <aside className="wprc-hero-panel" aria-label="Resumen de deducciones y beneficios">
            <h3>Que ocurre despues de calcular la cuota?</h3>
            <ul>
              <li><CheckCircle2 aria-hidden="true" /> Las deducciones restan directamente del impuesto calculado.</li>
              <li><CheckCircle2 aria-hidden="true" /> Los beneficios en especie se revisan uno a uno.</li>
              <li><CheckCircle2 aria-hidden="true" /> Cada beneficio puede quedar exento, tributar parcialmente o revisarse.</li>
            </ul>
            <strong>{formatEuro(appliedQuotaDeductions)}</strong>
            <span>Deducciones calculadas con los datos suficientes.</span>
          </aside>
        )}
      </div>

      {showReductionsSection ? (
        <>
          <div className="wprc-flow" aria-label="Resumen de personas dependientes">
            <article>
              <span>{eligibleDescendants.length}</span>
              <p>Descendientes que computan</p>
            </article>
            <article>
              <span>{result.childrenUnder3}</span>
              <p>Menores de 3 anos</p>
            </article>
            <article>
              <span>{eligibleAscendants.length}</span>
              <p>Ascendientes que computan</p>
            </article>
            <article>
              <span>{formatEuro(result.dependentDisabilityMinimum)}</span>
              <p>Minimo por discapacidad dependiente</p>
            </article>
          </div>

          <section className="wprc-minimum-panel" aria-labelledby="wprc-minimum-title">
            <div>
              <h3 id="wprc-minimum-title">Minimo por descendientes</h3>
              <p>Los importes suben con el numero de hijos que cumplen requisitos.</p>
            </div>
            <ol>
              {descendantMinimums.map((amount, index) => (
                <li className={index < eligibleDescendants.length ? 'is-active' : ''} key={amount}>
                  <span>{index + 1}</span>
                  <strong>{formatEuro(amount)}</strong>
                </li>
              ))}
            </ol>
          </section>

          <div className="wprc-top-grid" aria-label="Situacion personal">
            <TopField
              icon={UsersRound}
              label="Descendientes"
              value={children}
              options={countOptions}
              onChange={setChildren}
            />
            <TopField
              icon={HandHeart}
              label="Ascendientes"
              value={ascendants}
              options={ascendantCountOptions}
              onChange={setAscendants}
            />
            <TopField
              icon={Accessibility}
              label="Tu discapacidad"
              value={disabilityPercent}
              options={disabilityOptions}
              onChange={setDisabilityPercent}
            />
            <TopField
              icon={HandHeart}
              label="Ayuda o movilidad"
              value={taxpayerAssistance}
              options={yesNoOptions}
              onChange={setTaxpayerAssistance}
            />
            <TopField
              icon={Heart}
              label="Estado civil"
              value={maritalStatus}
              options={maritalOptions}
              onChange={(value) => setMaritalStatus(value as MaritalStatus)}
            />
          </div>

          <div className="wprc-dependent-grid">
            <DependentEditor
              type="descendant"
              title="Detalle de descendientes"
              profiles={descendantProfiles}
              count={Number(children)}
              onChange={updateDescendant}
            />
            <DependentEditor
              type="ascendant"
              title="Detalle de ascendientes"
              profiles={ascendantProfiles}
              count={Number(ascendants)}
              onChange={updateAscendant}
            />
          </div>
        </>
      ) : null}

      {showDeductionsSection ? <BenefitGrid /> : null}

      <div className="wprc-panels">
        {showReductionsSection ? (
          <article className="wprc-panel wprc-panel--reductions">
          <div className="wprc-panel-heading">
            <span className="wprc-panel-icon" aria-hidden="true">
              <TrendingDown />
            </span>
            <div>
              <h3>Reducciones</h3>
              <p>Reducen la base sobre la que se calcula el IRPF.</p>
            </div>
          </div>

          <div className="wprc-adjustment-list">
            <AdjustmentRow
              icon={UsersRound}
              label="Planes de pensiones"
              value={pensionPlans}
              options={largerMoneyOptions}
              accent="cyan"
              onChange={setPensionPlans}
            />
            <AdjustmentRow
              icon={UsersRound}
              label="Plan de pensiones de empresa"
              value={companyPensionPlan}
              options={largerMoneyOptions}
              accent="cyan"
              onChange={setCompanyPensionPlan}
            />
            <AdjustmentRow
              icon={HandHeart}
              label="Mutualidades de prevision social"
              value={mutualities}
              options={largerMoneyOptions}
              accent="cyan"
              onChange={setMutualities}
            />
            <AdjustmentRow
              icon={HandHeart}
              label="Pension compensatoria"
              value={compensatoryPension}
              options={moneyOptions}
              accent="cyan"
              onChange={setCompensatoryPension}
            />
            <AdjustmentRow
              icon={Utensils}
              label="Anualidades por alimentos"
              value={childSupport}
              options={moneyOptions}
              accent="cyan"
              onChange={setChildSupport}
            />
            <AdjustmentRow
              icon={UsersRound}
              label="Tributacion conjunta"
              value={jointTaxation}
              options={jointTaxationOptions}
              accent="cyan"
              onChange={setJointTaxation}
            />
            <AdjustmentRow
              icon={Accessibility}
              label="Patrimonios protegidos discapacidad"
              value={protectedAssets}
              options={largerMoneyOptions}
              accent="cyan"
              onChange={setProtectedAssets}
            />
            <AdjustmentRow
              icon={Landmark}
              label="Reducciones autonomicas verificadas"
              value={regionalReductions}
              options={moneyOptions}
              accent="cyan"
              onChange={setRegionalReductions}
            />
            <AdjustmentRow
              icon={FileText}
              label="Cuotas sindicales / colegios"
              value={unionAndProfessionalFees}
              options={moneyOptions}
              accent="cyan"
              onChange={setUnionAndProfessionalFees}
            />
          </div>
        </article>
        ) : null}

        {showDeductionsSection ? (
        <article className="wprc-panel wprc-panel--deductions">
          <div className="wprc-panel-heading">
            <span className="wprc-panel-icon" aria-hidden="true">
              <Percent />
            </span>
            <div>
              <h3>Deducciones</h3>
              <p>Reducen directamente la cuota final del IRPF.</p>
            </div>
          </div>

          <div className="wprc-adjustment-list">
            <AdjustmentRow
              icon={Baby}
              label="Maternidad"
              value={maternity}
              options={maternityOptions}
              accent="violet"
              onChange={setMaternity}
            />
            <AdjustmentRow
              icon={Baby}
              label="Gastos de guarderia"
              value={daycare}
              options={moneyOptions}
              accent="violet"
              onChange={setDaycare}
            />
            <AdjustmentRow
              icon={UsersRound}
              label="Familia numerosa"
              value={largeFamily}
              options={largeFamilyOptions}
              accent="violet"
              onChange={setLargeFamily}
            />
            <AdjustmentRow
              icon={Accessibility}
              label="Discapacidad a cargo"
              value={dependentDisability}
              options={yesNoOptions}
              accent="violet"
              onChange={setDependentDisability}
            />
            <AdjustmentRow
              icon={Heart}
              label="Donativos"
              value={donations}
              options={moneyOptions}
              accent="violet"
              onChange={setDonations}
            />
            <AdjustmentRow
              icon={Landmark}
              label="Alquiler vivienda habitual"
              value={rent}
              options={moneyOptions}
              accent="violet"
              onChange={setRent}
            />
            <AdjustmentRow
              icon={Landmark}
              label="Compra vivienda antigua"
              value={oldHomePurchase}
              options={moneyOptions}
              accent="violet"
              onChange={setOldHomePurchase}
            />
            <AdjustmentRow
              icon={TrendingDown}
              label="Inversion en empresas nuevas"
              value={newCompanyInvestment}
              options={moneyOptions}
              accent="violet"
              onChange={setNewCompanyInvestment}
            />
            <AdjustmentRow
              icon={Landmark}
              label="Deducciones autonomicas"
              value={regionalDeductions}
              options={configureOptions}
              accent="violet"
              onChange={setRegionalDeductions}
            />
          </div>
        </article>
        ) : null}
      </div>

      {visibleWarnings.length > 0 ? (
        <aside className="wprc-calculation-warnings" aria-label="Ajustes pendientes de verificar">
          <strong>Aun no se incorporan al calculo</strong>
          <ul>
            {visibleWarnings.map((warning) => <li key={warning.message}>{warning.message}</li>)}
          </ul>
        </aside>
      ) : null}

      {showReductionsSection || showDeductionsSection ? (
      <section className="wprc-explained" aria-labelledby="wprc-explained-title">
        <div>
          <h3 id="wprc-explained-title">Resultado explicado</h3>
          <p>
            {showReductionsSection
              ? 'Las reducciones bajan la base antes de calcular el impuesto.'
              : 'Las deducciones se restan despues del impuesto calculado.'}
          </p>
        </div>
        <dl>
          {showReductionsSection ? (
            <>
              <div>
                <dt>Base inicial</dt>
                <dd>{formatEuro(explainedBaseInitial)}</dd>
              </div>
              <div className="is-minus">
                <dt>Reducciones aplicadas</dt>
                <dd>- {formatEuro(appliedBaseReductions)}</dd>
              </div>
              <div className="is-result">
                <dt>Base liquidable</dt>
                <dd>{formatEuro(explainedBaseLiquidable)}</dd>
              </div>
            </>
          ) : null}
          {showDeductionsSection ? (
            <>
              <div>
                <dt>Cuota antes de deducciones</dt>
                <dd>{formatEuro(explainedQuotaBeforeDeductions)}</dd>
              </div>
              <div className="is-minus">
                <dt>Deducciones aplicadas</dt>
                <dd>- {formatEuro(appliedQuotaDeductions)}</dd>
              </div>
              <div className="is-result">
                <dt>Cuota final estimada</dt>
                <dd>{formatEuro(explainedQuotaFinal)}</dd>
              </div>
            </>
          ) : null}
        </dl>
      </section>
      ) : null}

      <footer className="wprc-summary">
        <span className="wprc-summary-icon" aria-hidden="true">
          <FileText />
        </span>
        <div className="wprc-summary-copy">
          <p>Solo se aplican ajustes con datos suficientes.</p>
          <span>Las selecciones incompletas quedan pendientes y no reducen el IRPF.</span>
        </div>
        {showReductionsSection ? (
        <output className="wprc-total wprc-total--reductions" aria-label="Total reducciones aplicadas">
          <TrendingDown aria-hidden="true" />
          <span>Reduccion aplicada</span>
          <strong>{formatEuro(appliedBaseReductions)}</strong>
        </output>
        ) : null}
        {showDeductionsSection ? (
        <output className="wprc-total wprc-total--deductions" aria-label="Total deducciones aplicadas">
          <Percent aria-hidden="true" />
          <span>Deduccion aplicada</span>
          <strong>{formatEuro(appliedQuotaDeductions)}</strong>
        </output>
        ) : null}
      </footer>
    </section>
  )
}

export default WorkerPersonalReductionsCard
