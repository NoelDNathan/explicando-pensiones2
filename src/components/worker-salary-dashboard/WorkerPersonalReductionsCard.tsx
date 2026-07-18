import { Accessibility, CheckCircle2, FileText, HandHeart, Heart, Percent, TrendingDown, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import {
  createDependentProfiles,
  qualifiesDependent,
} from '../fiscal-worker-dashboard/familyMinimum2025'
import type {
  DependentProfile,
  DisabilityPercent,
} from '../fiscal-worker-dashboard/familyMinimum2025'
import {
  createEmptyIrpf2025Adjustments,
} from '../fiscal-worker-dashboard/irpf2025Adjustments'
import type { Irpf2025AdjustmentInput } from '../fiscal-worker-dashboard/irpf2025Adjustments'
import { Irpf2025StructuredAdjustmentsForm } from './Irpf2025StructuredAdjustmentsForm'
import { InfoButton } from '../ui/InfoButton'
import './WorkerPersonalReductionsCard.css'

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'
export type SelectOption = { value: string; label: string }
export type { DependentProfile, DisabilityPercent }

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
  adjustments: Irpf2025AdjustmentInput
  reductionsTotal: number
  deductionsTotal: number
  calculationWarnings: Array<{
    section: 'reductions' | 'deductions'
    message: string
  }>
  reductionLines: Record<ReductionKey, number | boolean>
  deductionLines: Record<DeductionKey, string>
}

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
  statePersonalFamilyMinimum?: number
  regionalPersonalFamilyMinimum?: number
  appliedQuotaDeductions?: number
  refundableDeductionsGenerated?: number
  finalDeclarationResult?: number
  declaredInKindSalary?: number
  engineWarnings?: string[]
  onResultChange?: (result: PersonalReductionResult) => void
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

type FieldOption = {
  value: string
  label: string
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

const countOptions = Array.from({ length: 5 }, (_, index) => ({ value: String(index), label: String(index) }))
const ascendantCountOptions = Array.from({ length: 4 }, (_, index) => ({ value: String(index), label: String(index) }))
const yesNoOptions: FieldOption[] = [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Si' }]
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
const incomeOptions: FieldOption[] = [
  { value: 'no_more_than_8000', label: 'Hasta 8.000 EUR' },
  { value: 'over_8000', label: 'Mas de 8.000 EUR' },
]
const returnOptions: FieldOption[] = [
  { value: 'no_or_up_to_1800', label: 'No, o hasta 1.800 EUR' },
  { value: 'over_1800', label: 'Si, con mas de 1.800 EUR' },
]
const shareOptions: FieldOption[] = [
  { value: '1', label: '100 %' },
  { value: '0.5', label: '50 %' },
]
const descendantMinimums = [2_400, 2_700, 4_000, 4_500]

function SelectControl({ value, options, label, onChange }: {
  value: string
  options: FieldOption[]
  label: string
  onChange: (value: string) => void
}) {
  return (
    <span className="wprc-select">
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </span>
  )
}

function TopFieldSelect({ value, options, label, onChange }: {
  value: string
  options: FieldOption[]
  label: string
  onChange: (value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <div
      className={`wprc-top-select${isOpen ? ' is-open' : ''}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Cambiar ${label}. Valor actual: ${selected?.label ?? value}`}
        className="wprc-top-select__trigger"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true" />
      </button>
      {isOpen ? (
        <div aria-label={`Opciones para ${label}`} className="wprc-top-select__menu" role="listbox">
          {options.map((option) => (
            <button
              aria-selected={option.value === value}
              className={option.value === value ? 'is-selected' : ''}
              key={option.value}
              role="option"
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function TopField({ icon: Icon, label, value, options, onChange }: {
  icon: IconComponent
  label: string
  value: string
  options: FieldOption[]
  onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)
  return (
    <div className="wprc-top-field">
      <Icon aria-hidden="true" />
      <span className="wprc-top-field__copy"><span>{label}</span><strong>{selected?.label ?? value}</strong></span>
      <TopFieldSelect label={label} value={value} options={options} onChange={onChange} />
    </div>
  )
}

function DependentFieldLabel({ label, help }: { label: string; help?: string }) {
  return (
    <span className="wprc-dependent-label">
      <span>{label}</span>
      {help ? (
        <InfoButton label={`Ayuda: ${label}`} size="sm" placement="end" className="wprc-help">
          <p>{help}</p>
        </InfoButton>
      ) : null}
    </span>
  )
}

function DependentEditor({ type, title, profiles, count, onChange }: {
  type: 'descendant' | 'ascendant'
  title: string
  profiles: DependentProfile[]
  count: number
  onChange: <Key extends keyof DependentProfile>(index: number, field: Key, value: DependentProfile[Key]) => void
}) {
  const activeProfiles = profiles.slice(0, count)
  const ageOptions = type === 'descendant' ? descendantAgeOptions : ascendantAgeOptions
  return (
    <article className={`wprc-dependent-card wprc-dependent-card--${type}`}>
      <header><div><h3>{title}</h3><p>Se comprueban edad, convivencia, rentas, declaracion y reparto del derecho.</p></div></header>
      {activeProfiles.length === 0 ? <p className="wprc-empty">Indica cuantas personas hay para desplegar el detalle.</p> : null}
      <div className="wprc-dependent-list">
        {activeProfiles.map((profile, index) => {
          const label = type === 'descendant' ? `Descendiente ${index + 1}` : `Ascendiente ${index + 1}`
          const eligible = qualifiesDependent(profile, type)
          return (
            <section className={`wprc-dependent ${eligible ? 'is-eligible' : 'is-excluded'}`} key={`${type}-${index}`}>
              <div className="wprc-dependent__head"><strong>{label}</strong><span>{eligible ? 'Computa' : 'No computa'}</span></div>
              <label><span>Edad</span><SelectControl label={`${label}: edad`} value={profile.ageBand} options={ageOptions} onChange={(next) => onChange(index, 'ageBand', next)} /></label>
              <label><span>{type === 'ascendant' ? 'Convive al menos medio ano' : 'Convive o depende economicamente'}</span><SelectControl label={`${label}: convivencia`} value={profile.livesWith} options={yesNoOptions} onChange={(next) => onChange(index, 'livesWith', next as DependentProfile['livesWith'])} /></label>
              <label><DependentFieldLabel label="Ingresos propios sujetos a IRPF" help="Son sus ingresos anuales que sí tributan. No cuentes becas, prestaciones u otras rentas exentas. El límite habitual para que compute es 8.000 EUR al año." /><SelectControl label={`${label}: ingresos propios sujetos a IRPF`} value={profile.ownIncome} options={incomeOptions} onChange={(next) => onChange(index, 'ownIncome', next as DependentProfile['ownIncome'])} /></label>
              <label><span>Declaracion propia</span><SelectControl label={`${label}: declaracion`} value={profile.filesReturn} options={returnOptions} onChange={(next) => onChange(index, 'filesReturn', next as DependentProfile['filesReturn'])} /></label>
              <label><span>Grado discapacidad</span><SelectControl label={`${label}: discapacidad`} value={profile.disabilityPercent} options={disabilityOptions} onChange={(next) => onChange(index, 'disabilityPercent', next as DependentProfile['disabilityPercent'])} /></label>
              <label><span>Ayuda o movilidad reducida</span><SelectControl label={`${label}: asistencia`} value={profile.assistance} options={yesNoOptions} onChange={(next) => onChange(index, 'assistance', next as DependentProfile['assistance'])} /></label>
              <label><DependentFieldLabel label="Porcentaje del mínimo que te corresponde" help="El mínimo familiar se reparte entre las personas que pueden aplicarlo: elige 100 % si te corresponde entero o 50 % si lo compartes a partes iguales con otra persona." /><SelectControl label={`${label}: porcentaje del mínimo`} value={profile.entitlementShare} options={shareOptions} onChange={(next) => onChange(index, 'entitlementShare', next as DependentProfile['entitlementShare'])} /></label>
              {type === 'descendant' ? (
                <>
                  <label>
                    <DependentFieldLabel label="Pensión de alimentos que pagas por este hijo" help="Indica el total anual pagado por alimentos solo si existe una resolución judicial o un convenio regulador formalizado. No es la pensión compensatoria al otro progenitor." />
                    <span className="wprc-dependent-number"><input aria-label={`${label}: anualidad por alimentos`} min="0" step="0.01" type="number" value={profile.childSupportAnnual} onChange={(event) => onChange(index, 'childSupportAnnual', Math.max(0, Number(event.target.value) || 0))} /><span>EUR</span></span>
                  </label>
                  <label className="wprc-dependent-check"><input type="checkbox" checked={profile.childSupportFormalized} onChange={(event) => onChange(index, 'childSupportFormalized', event.target.checked)} /><span><strong>Hay sentencia o convenio regulador formalizado</strong><small>Márcalo solo si el pago se fija en ese documento. En ese caso, este hijo no suma el mínimo por descendiente en esta declaración.</small></span></label>
                </>
              ) : null}
            </section>
          )
        })}
      </div>
    </article>
  )
}

function formatEuro(value: number) {
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })} EUR`
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
  statePersonalFamilyMinimum = 0,
  regionalPersonalFamilyMinimum = 0,
  appliedQuotaDeductions = 0,
  refundableDeductionsGenerated = 0,
  finalDeclarationResult = 0,
  declaredInKindSalary = 0,
  engineWarnings = [],
  onResultChange,
}: WorkerPersonalReductionsCardProps) {
  const showReductionsSection = focus === 'reductions'
  const [children, setChildren] = useState(() => String(initialResult?.children ?? initialChildren))
  const [ascendants, setAscendants] = useState(() => String(initialResult?.ascendants ?? initialAscendants))
  const [disabilityPercent, setDisabilityPercent] = useState(() => String(initialResult?.disabilityPercent ?? initialDisabilityPercent))
  const [taxpayerAssistance, setTaxpayerAssistance] = useState(() => initialResult?.taxpayerAssistance ?? 'no')
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(() => initialResult?.maritalStatus ?? initialMaritalStatus)
  const [descendantProfiles, setDescendantProfiles] = useState(() => initialResult?.descendantProfiles ?? createDependentProfiles(4, 'descendant'))
  const [ascendantProfiles, setAscendantProfiles] = useState(() => initialResult?.ascendantProfiles ?? createDependentProfiles(3, 'ascendant'))
  const [adjustments, setAdjustments] = useState<Irpf2025AdjustmentInput>(() => initialResult?.adjustments ?? createEmptyIrpf2025Adjustments())

  const updateDependent = <Key extends keyof DependentProfile>(
    type: 'descendant' | 'ascendant',
    index: number,
    field: Key,
    value: DependentProfile[Key],
  ) => {
    const setter = type === 'descendant' ? setDescendantProfiles : setAscendantProfiles
    setter((profiles) => profiles.map((profile, profileIndex) => profileIndex === index ? { ...profile, [field]: value } : profile))
  }

  const result = useMemo<PersonalReductionResult>(() => {
    const selectedDescendants = descendantProfiles.slice(0, Number(children))
    const selectedAscendants = ascendantProfiles.slice(0, Number(ascendants))
    const eligibleDescendants = selectedDescendants.filter((profile) => qualifiesDependent(profile, 'descendant'))
    const eligibleAscendants = selectedAscendants.filter((profile) => qualifiesDependent(profile, 'ascendant'))
    const childSupportProfiles = selectedDescendants.filter((profile) => profile.childSupportAnnual > 0)
    const childSupportPaid = childSupportProfiles.reduce((sum, profile) => sum + profile.childSupportAnnual, 0)
    const effectiveAdjustments: Irpf2025AdjustmentInput = {
      ...adjustments,
      childSupportPaid,
      childSupportFormalized: childSupportProfiles.length > 0 && childSupportProfiles.every((profile) => profile.childSupportFormalized),
      childSupportMinimumExcluded: childSupportProfiles.length > 0 && childSupportProfiles.every((profile) => profile.childSupportFormalized),
    }
    const dependentDisabilityMinimum = [...eligibleDescendants, ...eligibleAscendants].reduce((sum, profile) => {
      const base = profile.disabilityPercent === '65' ? 9_000 : profile.disabilityPercent === '33' ? 3_000 : 0
      const assistance = base > 0 && (profile.assistance === 'yes' || profile.disabilityPercent === '65') ? 3_000 : 0
      return sum + (base + assistance) * Number(profile.entitlementShare)
    }, 0)
    const taxpayerDisabilityAssistanceMinimum = Number(disabilityPercent) > 0 && (taxpayerAssistance === 'yes' || disabilityPercent === '65') ? 3_000 : 0
    const reductionsTotal = effectiveAdjustments.personalPensionContribution
      + effectiveAdjustments.mutualityContribution
      + effectiveAdjustments.employerPensionContribution
      + effectiveAdjustments.workerEmploymentPensionContribution
      + effectiveAdjustments.spousePensionContribution
      + effectiveAdjustments.compensatoryPensionPaid
      + effectiveAdjustments.protectedAssetsContribution
      + effectiveAdjustments.verifiedRegionalReduction
    const deductionsTotal = effectiveAdjustments.donationAmount
      + effectiveAdjustments.rentPaid
      + effectiveAdjustments.homeInvestmentPaid
      + effectiveAdjustments.newCompanyInvestment
      + effectiveAdjustments.verifiedRegionalDeduction

    return {
      children: Number(children),
      eligibleChildren: eligibleDescendants.length,
      childrenUnder3: eligibleDescendants.filter((profile) => profile.ageBand === 'under3').length,
      disabilityPercent: Number(disabilityPercent) as DisabilityPercent,
      taxpayerAssistance,
      taxpayerDisabilityAssistanceMinimum,
      maritalStatus,
      ascendants: Number(ascendants),
      eligibleAscendants: eligibleAscendants.length,
      ascendantsOver75: eligibleAscendants.filter((profile) => profile.ageBand === '75_plus').length,
      dependentDisabilityMinimum,
      descendantProfiles,
      ascendantProfiles,
      adjustments: effectiveAdjustments,
      reductionsTotal,
      deductionsTotal,
      calculationWarnings: [],
      reductionLines: {
        pensionPlans: effectiveAdjustments.personalPensionContribution,
        companyPensionPlan: effectiveAdjustments.employerPensionContribution + effectiveAdjustments.workerEmploymentPensionContribution,
        mutualities: effectiveAdjustments.mutualityContribution,
        compensatoryPension: effectiveAdjustments.compensatoryPensionPaid,
        childSupport: childSupportPaid,
        jointTaxation: effectiveAdjustments.jointTaxationType !== 'individual',
        protectedAssets: effectiveAdjustments.protectedAssetsContribution,
        regionalReductions: effectiveAdjustments.verifiedRegionalReduction,
        unionAndProfessionalFees: effectiveAdjustments.unionDues + effectiveAdjustments.professionalDues,
      },
      deductionLines: {
        maternity: effectiveAdjustments.maternityEligible ? 'applies' : 'none',
        daycare: String(effectiveAdjustments.daycareTotalExpense),
        largeFamily: effectiveAdjustments.largeFamilyCategory,
        dependentDisability: effectiveAdjustments.disabilityEligiblePersonMonths > 0 ? 'yes' : 'no',
        donations: String(effectiveAdjustments.donationAmount),
        rent: String(effectiveAdjustments.rentPaid),
        oldHomePurchase: String(effectiveAdjustments.homeInvestmentPaid),
        newCompanyInvestment: String(effectiveAdjustments.newCompanyInvestment),
        regionalDeductions: effectiveAdjustments.regionalDeductionVerified ? 'verified' : 'none',
      },
    }
  }, [adjustments, ascendantProfiles, ascendants, children, descendantProfiles, disabilityPercent, maritalStatus, taxpayerAssistance])

  useEffect(() => onResultChange?.(result), [onResultChange, result])

  const selectedDescendants = result.descendantProfiles.slice(0, result.children)
  const minimumDescendants = selectedDescendants.filter((profile) => qualifiesDependent(profile, 'descendant') && !(profile.childSupportAnnual > 0 && profile.childSupportFormalized))
  const descendantMinimum = minimumDescendants.reduce((sum, profile, index) => (
    sum
    + descendantMinimums[Math.min(index, 3)] * Number(profile.entitlementShare)
    + (profile.ageBand === 'under3' ? 2_800 * Number(profile.entitlementShare) : 0)
  ), 0)
  const ascendantMinimum = result.ascendantProfiles.slice(0, result.ascendants)
    .filter((profile) => qualifiesDependent(profile, 'ascendant'))
    .reduce((sum, profile) => (
      sum + (1_150 + (profile.ageBand === '75_plus' ? 1_400 : 0)) * Number(profile.entitlementShare)
    ), 0)
  const familyMinimumPreview = descendantMinimum
    + ascendantMinimum
    + result.dependentDisabilityMinimum
    + (result.disabilityPercent === 65 ? 9_000 : result.disabilityPercent === 33 ? 3_000 : 0)
    + result.taxpayerDisabilityAssistanceMinimum
  const explainedBaseInitial = Math.max(0, initialBaseBeforeReductions)
  const explainedQuotaBefore = Math.max(0, quotaBeforeDeductions)
  const appliedFamilyMinimum = Math.max(0, statePersonalFamilyMinimum || familyMinimumPreview)
  const appliedRegionalFamilyMinimum = Math.max(0, regionalPersonalFamilyMinimum)
  const hasFamilyAnswer = Number(children) > 0
    || Number(ascendants) > 0
    || Number(disabilityPercent) > 0
    || taxpayerAssistance === 'yes'

  return (
    <section className={`wprc wprc--${focus}`} aria-labelledby="wprc-title">
      <div className="wprc-hero">
        <header className="wprc-header">
          <div className="wprc-step-orb" aria-hidden="true">{stepNumber}</div>
          <div className="wprc-title">
            <span>Paso {stepNumber} de {totalSteps}</span>
            <h2 id="wprc-title">{showReductionsSection ? 'Responde unas preguntas y ajustamos tu IRPF' : 'Deducciones y salario en especie'}</h2>
            <p>{showReductionsSection ? 'No necesitas saber de impuestos: responde solo a lo que se parezca a tu situación. Si algo no te aplica, elige No o déjalo cerrado.' : 'Separa deducciones de cuota, reembolsables, pagos a cuenta y beneficios exentos.'}</p>
          </div>
        </header>
        <aside className="wprc-hero-panel">
          <h3>{showReductionsSection ? 'Vamos paso a paso' : 'Resultado anual completo'}</h3>
          <ul>
            <li><CheckCircle2 /> Primero, cuéntanos tu situación personal y familiar.</li>
            <li><CheckCircle2 /> Después, abre solo las preguntas que te correspondan.</li>
            <li><CheckCircle2 /> Verás el resultado actualizado en todo momento.</li>
          </ul>
          <strong>{formatEuro(showReductionsSection ? appliedFamilyMinimum : appliedQuotaDeductions)}</strong>
          <span>{showReductionsSection ? 'Mínimo personal y familiar estatal aplicado en la cuota.' : 'Deducciones ordinarias aplicadas a la cuota.'}</span>
        </aside>
      </div>

      {showReductionsSection ? (
        <>
          <section className="wprc-question-intro" aria-labelledby="wprc-family-questions">
            <span aria-hidden="true">1</span>
            <div>
              <h3 id="wprc-family-questions">Empezamos por ti y tu familia</h3>
              <p>Estas respuestas sirven para calcular el mínimo personal y familiar. No reducen la base directamente, pero sí pueden bajar el IRPF final.</p>
            </div>
          </section>
          <div className="wprc-top-grid wprc-top-grid--questions">
            <TopField icon={UsersRound} label="¿Cuántos hijos incluyes?" value={children} options={countOptions} onChange={setChildren} />
            <TopField icon={HandHeart} label="¿Cuántos ascendientes incluyes?" value={ascendants} options={ascendantCountOptions} onChange={setAscendants} />
            <TopField icon={Accessibility} label="¿Tienes discapacidad reconocida?" value={disabilityPercent} options={disabilityOptions} onChange={setDisabilityPercent} />
            <TopField icon={HandHeart} label="¿Necesitas ayuda o movilidad reducida?" value={taxpayerAssistance} options={yesNoOptions} onChange={setTaxpayerAssistance} />
            <TopField icon={Heart} label="¿Cuál es tu estado civil?" value={maritalStatus} options={maritalOptions} onChange={(next) => setMaritalStatus(next as MaritalStatus)} />
          </div>
          <section className="wprc-explained wprc-explained--sticky" aria-label="Cómo cambian la base y el IRPF">
            <div>
              <h3>Tu base, siempre a la vista</h3>
              <p>{appliedBaseReductions > 0
                ? 'Las reducciones de base declaradas ya se han descontado con sus límites legales.'
                : 'Ahora no hay reducciones de base declaradas. Los datos familiares sí se aplican, pero al calcular la cuota del IRPF.'}</p>
            </div>
            <dl>
              <div><dt>Base antes de reducciones</dt><dd>{formatEuro(explainedBaseInitial)}</dd></div>
              <div className="is-minus"><dt>Reducciones de base aplicadas</dt><dd>- {formatEuro(appliedBaseReductions)}</dd></div>
              <div className="is-result"><dt>Base liquidable</dt><dd>{formatEuro(Math.max(0, explainedBaseInitial - appliedBaseReductions))}</dd></div>
              <div className="is-minimum"><dt>Mínimo personal y familiar</dt><dd>{formatEuro(appliedFamilyMinimum)}</dd><small>{appliedRegionalFamilyMinimum > 0 ? `${formatEuro(appliedRegionalFamilyMinimum)} en la escala autonómica.` : 'Se aplica al calcular la cuota; no resta la base.'}</small></div>
            </dl>
          </section>
          <div className="wprc-dependent-grid">
            <DependentEditor type="descendant" title="Cuéntanos un poco de cada hijo" profiles={descendantProfiles} count={Number(children)} onChange={(index, field, value) => updateDependent('descendant', index, field, value)} />
            <DependentEditor type="ascendant" title="Cuéntanos un poco de cada ascendiente" profiles={ascendantProfiles} count={Number(ascendants)} onChange={(index, field, value) => updateDependent('ascendant', index, field, value)} />
          </div>
          {hasFamilyAnswer ? (
            <section className="wprc-family-preview" aria-label="Resumen de tus respuestas familiares">
              <div className="wprc-flow">
                <article><span>{minimumDescendants.length}</span><p>Hijos que computan</p></article>
                <article><span>{result.childrenUnder3}</span><p>Menores de 3 años</p></article>
                <article><span>{result.eligibleAscendants}</span><p>Ascendientes que computan</p></article>
                <article><span>{formatEuro(result.dependentDisabilityMinimum)}</span><p>Apoyo por discapacidad</p></article>
              </div>
              {Number(children) > 0 ? <section className="wprc-minimum-panel">
                <div><h3>Así se reparte el mínimo por hijos</h3><p>La cantidad aumenta con cada hijo que cumpla los requisitos.</p></div>
                <ol>{descendantMinimums.map((amount, index) => <li className={index < minimumDescendants.length ? 'is-active' : ''} key={amount}><span>{index + 1}</span><strong>{formatEuro(amount)}</strong></li>)}</ol>
              </section> : null}
            </section>
          ) : null}
        </>
      ) : null}

      <Irpf2025StructuredAdjustmentsForm focus={focus} value={adjustments} declaredInKindSalary={declaredInKindSalary} onChange={setAdjustments} />

      {engineWarnings.length > 0 ? (
        <aside className="wprc-calculation-warnings" aria-label="Ajustes no estimados">
          <strong>Datos pendientes: estos importes no se aplican</strong>
          <ul>{engineWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        </aside>
      ) : null}

      {!showReductionsSection ? <section className="wprc-explained">
        <div><h3>Resultado explicado</h3><p>Las deducciones ordinarias y reembolsables se muestran por separado.</p></div>
        <dl>
          <>
            <div><dt>Cuota antes de deducciones</dt><dd>{formatEuro(explainedQuotaBefore)}</dd></div>
            <div className="is-minus"><dt>Deducciones ordinarias</dt><dd>- {formatEuro(appliedQuotaDeductions)}</dd></div>
            <div><dt>Deducciones reembolsables generadas</dt><dd>- {formatEuro(refundableDeductionsGenerated)}</dd></div>
            <div className="is-result"><dt>Resultado estimado declaracion</dt><dd>{formatEuro(finalDeclarationResult)}</dd></div>
          </>
        </dl>
      </section> : null}

      {!showReductionsSection ? <footer className="wprc-summary">
        <span className="wprc-summary-icon" aria-hidden="true"><FileText /></span>
        <div className="wprc-summary-copy"><p>Calculo 2025 con datos declarados.</p><span>Los requisitos no confirmados quedan como no estimados y no reducen el IRPF.</span></div>
        <output className={`wprc-total ${showReductionsSection ? 'wprc-total--reductions' : 'wprc-total--deductions'}`}>
          {showReductionsSection ? <TrendingDown /> : <Percent />}
          <span>{showReductionsSection ? 'Reducciones aplicadas' : 'Deducciones aplicadas'}</span>
          <strong>{formatEuro(showReductionsSection ? appliedBaseReductions : appliedQuotaDeductions)}</strong>
        </output>
      </footer> : null}
    </section>
  )
}

export default WorkerPersonalReductionsCard
