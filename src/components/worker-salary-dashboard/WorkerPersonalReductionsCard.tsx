import {
  Accessibility,
  Baby,
  ChevronDown,
  CheckCircle2,
  FileText,
  HandHeart,
  Heart,
  Landmark,
  Percent,
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
  childrenUnder3: number
  disabilityPercent: DisabilityPercent
  maritalStatus: MaritalStatus
  ascendants: number
  ascendantsOver75: number
  dependentDisabilityMinimum: number
  reductionsTotal: number
  deductionsTotal: number
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
  initialChildren?: number
  initialDisabilityPercent?: DisabilityPercent
  initialMaritalStatus?: MaritalStatus
  initialAscendants?: number
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

type DependentProfile = {
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
  { value: '3_or_more', label: '3 o mas' },
]

const ascendantAgeOptions: FieldOption[] = [
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
  { id: 'meal-card', label: 'Tickets restaurante', status: 'partial' },
  { id: 'transport-card', label: 'Transporte colectivo', status: 'partial' },
  { id: 'health-insurance', label: 'Seguro medico', status: 'partial' },
  { id: 'company-daycare', label: 'Guarderia empresa', status: 'review' },
  { id: 'training', label: 'Formacion', status: 'exempt' },
  { id: 'company-car', label: 'Coche de empresa', status: 'taxable' },
  { id: 'company-home', label: 'Vivienda de empresa', status: 'taxable' },
  { id: 'devices', label: 'Movil / portatil', status: 'review' },
  { id: 'stock-options', label: 'Acciones / stock options', status: 'review' },
  { id: 'company-loan', label: 'Prestamos empresa', status: 'review' },
]

const benefitStatusLabels: Record<BenefitStatus, string> = {
  exempt: 'Exento',
  partial: 'Parcial',
  taxable: 'Tributa',
  review: 'Revisar requisitos',
}

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

function qualifies(profile: DependentProfile) {
  return profile.livesWith === 'yes' && profile.ownIncome === 'no' && profile.filesReturn === 'no'
}

function dependentMinimum(profile: DependentProfile) {
  const disabilityMinimum = profile.disabilityPercent === '65'
    ? 9000
    : profile.disabilityPercent === '33'
      ? 3000
      : 0
  return disabilityMinimum + (profile.assistance === 'yes' && disabilityMinimum > 0 ? 3000 : 0)
}

function descendantMinimumAt(index: number) {
  return descendantMinimums[Math.min(index, descendantMinimums.length - 1)]
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
            const isEligible = qualifies(profile)

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
  return (
    <section className="wprc-benefits" aria-labelledby="wprc-benefits-title">
      <div className="wprc-benefits__heading">
        <h3 id="wprc-benefits-title">Beneficios de empresa</h3>
        <p>El salario en especie puede estar exento, parcialmente exento o tributar segun limites y requisitos.</p>
      </div>
      <div className="wprc-benefit-grid">
        {benefitItems.map((item) => (
          <article className={`wprc-benefit wprc-benefit--${item.status}`} key={item.id}>
            <span>{item.label}</span>
            <strong>{benefitStatusLabels[item.status]}</strong>
          </article>
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
    ageBand: type === 'descendant' ? '3_or_more' : '65_74',
  }))
}

export function WorkerPersonalReductionsCard({
  initialChildren = 1,
  initialDisabilityPercent = 0,
  initialMaritalStatus = 'married',
  initialAscendants = 0,
  onResultChange,
}: WorkerPersonalReductionsCardProps) {
  const [children, setChildren] = useState(String(initialChildren))
  const [disabilityPercent, setDisabilityPercent] = useState(String(initialDisabilityPercent))
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(initialMaritalStatus)
  const [ascendants, setAscendants] = useState(String(initialAscendants))
  const [pensionPlans, setPensionPlans] = useState('0')
  const [companyPensionPlan, setCompanyPensionPlan] = useState('0')
  const [mutualities, setMutualities] = useState('0')
  const [compensatoryPension, setCompensatoryPension] = useState('0')
  const [childSupport, setChildSupport] = useState('0')
  const [jointTaxation, setJointTaxation] = useState('no')
  const [protectedAssets, setProtectedAssets] = useState('0')
  const [regionalReductions, setRegionalReductions] = useState('0')
  const [unionAndProfessionalFees, setUnionAndProfessionalFees] = useState('0')
  const [maternity, setMaternity] = useState('none')
  const [daycare, setDaycare] = useState('0')
  const [largeFamily, setLargeFamily] = useState('none')
  const [dependentDisability, setDependentDisability] = useState('no')
  const [donations, setDonations] = useState('0')
  const [rent, setRent] = useState('0')
  const [oldHomePurchase, setOldHomePurchase] = useState('0')
  const [newCompanyInvestment, setNewCompanyInvestment] = useState('0')
  const [regionalDeductions, setRegionalDeductions] = useState('configure')
  const [descendantProfiles, setDescendantProfiles] = useState(() => createDependentProfiles(4, 'descendant'))
  const [ascendantProfiles, setAscendantProfiles] = useState(() => createDependentProfiles(3, 'ascendant'))

  useEffect(() => {
    setChildren(String(initialChildren))
  }, [initialChildren])

  useEffect(() => {
    setDisabilityPercent(String(initialDisabilityPercent))
  }, [initialDisabilityPercent])

  useEffect(() => {
    setMaritalStatus(initialMaritalStatus)
  }, [initialMaritalStatus])

  useEffect(() => {
    setAscendants(String(initialAscendants))
  }, [initialAscendants])

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
    const eligibleDescendants = descendantProfiles.slice(0, Number(children)).filter(qualifies)
    const eligibleAscendants = ascendantProfiles.slice(0, Number(ascendants)).filter(qualifies)
    const dependentDisabilityMinimum = [...eligibleDescendants, ...eligibleAscendants]
      .reduce((total, profile) => total + dependentMinimum(profile), 0)
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

    return {
      children: eligibleDescendants.length,
      childrenUnder3: eligibleDescendants.filter((profile) => profile.ageBand === 'under3').length,
      disabilityPercent: Number(disabilityPercent) as DisabilityPercent,
      maritalStatus,
      ascendants: eligibleAscendants.length,
      ascendantsOver75: eligibleAscendants.filter((profile) => profile.ageBand === '75_plus').length,
      dependentDisabilityMinimum,
      reductionsTotal,
      deductionsTotal,
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
    unionAndProfessionalFees,
  ])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  const selectedDescendants = descendantProfiles.slice(0, Number(children))
  const eligibleDescendants = selectedDescendants.filter(qualifies)
  const selectedAscendants = ascendantProfiles.slice(0, Number(ascendants))
  const eligibleAscendants = selectedAscendants.filter(qualifies)
  const descendantMinimumTotal = eligibleDescendants.reduce((total, _profile, index) => total + descendantMinimumAt(index), 0)
  const under3Minimum = result.childrenUnder3 * 2800
  const ascendantMinimumTotal = result.ascendants * 1150 + result.ascendantsOver75 * 1400
  const familyMinimumPreview = descendantMinimumTotal + under3Minimum + ascendantMinimumTotal + result.dependentDisabilityMinimum
  const explainedBaseInitial = 32000
  const explainedBaseLiquidable = Math.max(0, explainedBaseInitial - result.reductionsTotal)
  const explainedQuotaBeforeDeductions = 5200
  const explainedQuotaFinal = Math.max(0, explainedQuotaBeforeDeductions - result.deductionsTotal)

  return (
    <section className="wprc" aria-labelledby="wprc-title">
      <div className="wprc-hero">
        <header className="wprc-header">
          <div className="wprc-step-orb" aria-hidden="true">4</div>
          <div className="wprc-title">
            <span>Paso 4 de 8</span>
            <h2 id="wprc-title">Reducciones y minimo familiar</h2>
            <p>Detalla quien convive contigo y que requisitos cumple antes de llevarlo al IRPF.</p>
          </div>
        </header>

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
      </div>

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

      <BenefitGrid />

      <div className="wprc-panels">
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
      </div>

      <section className="wprc-explained" aria-labelledby="wprc-explained-title">
        <div>
          <h3 id="wprc-explained-title">Resultado explicado</h3>
          <p>Las reducciones bajan la base; las deducciones se restan despues del impuesto calculado.</p>
        </div>
        <dl>
          <div>
            <dt>Base inicial</dt>
            <dd>{formatEuro(explainedBaseInitial)}</dd>
          </div>
          <div className="is-minus">
            <dt>Reducciones aplicadas</dt>
            <dd>- {formatEuro(result.reductionsTotal)}</dd>
          </div>
          <div className="is-result">
            <dt>Base liquidable</dt>
            <dd>{formatEuro(explainedBaseLiquidable)}</dd>
          </div>
          <div>
            <dt>Cuota antes de deducciones</dt>
            <dd>{formatEuro(explainedQuotaBeforeDeductions)}</dd>
          </div>
          <div className="is-minus">
            <dt>Deducciones aplicadas</dt>
            <dd>- {formatEuro(result.deductionsTotal)}</dd>
          </div>
          <div className="is-result">
            <dt>Cuota final estimada</dt>
            <dd>{formatEuro(explainedQuotaFinal)}</dd>
          </div>
        </dl>
      </section>

      <footer className="wprc-summary">
        <span className="wprc-summary-icon" aria-hidden="true">
          <FileText />
        </span>
        <div className="wprc-summary-copy">
          <p>Estos ajustes se aplicaran en el calculo del IRPF.</p>
          <span>Revisa tus datos para obtener un calculo mas preciso.</span>
        </div>
        <output className="wprc-total wprc-total--reductions" aria-label="Total reducciones">
          <TrendingDown aria-hidden="true" />
          <span>Total reducciones</span>
          <strong>{formatEuro(result.reductionsTotal)}</strong>
        </output>
        <output className="wprc-total wprc-total--deductions" aria-label="Total deducciones">
          <Percent aria-hidden="true" />
          <span>Total deducciones</span>
          <strong>{formatEuro(result.deductionsTotal)}</strong>
        </output>
      </footer>
    </section>
  )
}

export default WorkerPersonalReductionsCard
