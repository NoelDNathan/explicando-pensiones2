import {
  Accessibility,
  Baby,
  ChevronDown,
  FileText,
  HandHeart,
  Heart,
  Info,
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
  disabilityPercent: DisabilityPercent
  maritalStatus: MaritalStatus
  ascendants: number
  reductionsTotal: number
  deductionsTotal: number
  reductionLines: Record<ReductionKey, number | boolean>
  deductionLines: Record<DeductionKey, string>
}

type ReductionKey =
  | 'pensionPlans'
  | 'compensatoryPension'
  | 'childSupport'
  | 'jointTaxation'

type DeductionKey =
  | 'maternity'
  | 'largeFamily'
  | 'dependentDisability'
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

const moneyOptions: FieldOption[] = [
  { value: '0', label: '0 €' },
  { value: '1000', label: '1.000 €' },
  { value: '2000', label: '2.000 €' },
  { value: '3000', label: '3.000 €' },
]

const yesNoOptions: FieldOption[] = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Si' },
]

const maternityOptions: FieldOption[] = [
  { value: 'none', label: 'No aplica' },
  { value: 'applies', label: 'Aplica' },
]

const configureOptions: FieldOption[] = [
  { value: 'configure', label: 'Configurar' },
  { value: 'none', label: 'Sin deduccion' },
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
  const [compensatoryPension, setCompensatoryPension] = useState('0')
  const [childSupport, setChildSupport] = useState('0')
  const [jointTaxation, setJointTaxation] = useState('no')
  const [maternity, setMaternity] = useState('none')
  const [largeFamily, setLargeFamily] = useState('no')
  const [dependentDisability, setDependentDisability] = useState('no')
  const [regionalDeductions, setRegionalDeductions] = useState('configure')
  const [infoOpen, setInfoOpen] = useState(false)

  const result = useMemo<PersonalReductionResult>(() => {
    const pensionPlanAmount = Number(pensionPlans)
    const compensatoryAmount = Number(compensatoryPension)
    const childSupportAmount = Number(childSupport)
    const jointTaxationReduction = jointTaxation === 'yes' ? 3400 : 0
    const reductionsTotal = pensionPlanAmount + compensatoryAmount + childSupportAmount + jointTaxationReduction
    const deductionsTotal =
      (maternity === 'applies' ? 1200 : 0)
      + (largeFamily === 'yes' ? 1200 : 0)
      + (dependentDisability === 'yes' ? 1200 : 0)

    return {
      children: Number(children),
      disabilityPercent: Number(disabilityPercent) as DisabilityPercent,
      maritalStatus,
      ascendants: Number(ascendants),
      reductionsTotal,
      deductionsTotal,
      reductionLines: {
        pensionPlans: pensionPlanAmount,
        compensatoryPension: compensatoryAmount,
        childSupport: childSupportAmount,
        jointTaxation: jointTaxation === 'yes',
      },
      deductionLines: {
        maternity,
        largeFamily,
        dependentDisability,
        regionalDeductions,
      },
    }
  }, [
    ascendants,
    childSupport,
    children,
    compensatoryPension,
    dependentDisability,
    disabilityPercent,
    jointTaxation,
    largeFamily,
    maritalStatus,
    maternity,
    pensionPlans,
    regionalDeductions,
  ])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  return (
    <section className="wprc" aria-labelledby="wprc-title">
      <header className="wprc-header">
        <div className="wprc-title">
          <span aria-hidden="true">4.</span>
          <h2 id="wprc-title">Reducciones y situacion personal</h2>
        </div>
        <button
          className="wprc-info"
          type="button"
          aria-label="Mas informacion sobre reducciones y deducciones"
          aria-expanded={infoOpen}
          onClick={() => setInfoOpen((open) => !open)}
        >
          <Info size={21} strokeWidth={2.35} aria-hidden="true" />
        </button>
      </header>

      {infoOpen && (
        <div className="wprc-popover" role="status">
          Las reducciones bajan la base sobre la que se calcula el IRPF. Las
          deducciones actuan despues y reducen la cuota final. Este componente
          es una pieza de interfaz: los importes deben conectarse a reglas y
          fuentes documentadas antes de uso editorial publico.
        </div>
      )}

      <div className="wprc-top-grid" aria-label="Situacion personal">
        <TopField
          icon={UsersRound}
          label="Hijos"
          value={children}
          options={countOptions}
          onChange={setChildren}
        />
        <TopField
          icon={Accessibility}
          label="Discapacidad"
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
        <TopField
          icon={HandHeart}
          label="Ascendientes a cargo"
          value={ascendants}
          options={countOptions}
          onChange={setAscendants}
        />
      </div>

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
              options={moneyOptions}
              accent="cyan"
              onChange={setPensionPlans}
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
              options={yesNoOptions}
              accent="cyan"
              onChange={setJointTaxation}
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
              icon={UsersRound}
              label="Familia numerosa"
              value={largeFamily}
              options={yesNoOptions}
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
