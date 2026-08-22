import { ChevronDown, Euro } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { InfoButton } from '../ui/InfoButton'
import { SalarySlider } from '../ui/SalarySlider'
import './WorkerSalaryBaseCard.css'

const SALARY_COMPLEMENTS_HELP =
  'Pagos que sumas al salario fijo durante el año: plus de convenio, nocturnidad, productividad, comisiones u otros conceptos en dinero. Elige un porcentaje prefijado o escribe el importe anual; el porcentaje es la referencia y los euros se recalculan si mueves el salario fijo.'

const IN_KIND_SALARY_HELP =
  'Beneficios que recibes de la empresa en lugar de dinero en la nómina: seguro médico, coche, vales comida o transporte, guardería, etc. Elige un porcentaje prefijado o escribe el importe anual; el porcentaje es la referencia y los euros se recalculan si mueves el salario fijo.'

type PayPeriod = 'annual' | 'monthly'
type PayCount = '12' | '14'

type WorkerSalaryBaseCardProps = {
  initialSalary?: number
  initialPayPeriod?: PayPeriod
  initialPayCount?: PayCount
  initialSalaryComplements?: number
  initialInKindSalary?: number
  onValuesChange?: (values: {
    salary: number
    payPeriod: PayPeriod
    payCount: PayCount
    salaryComplements: number
    inKindSalary: number
    realBaseAnnual: number
  }) => void
}

const euroFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
})

const percentDetailFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** Preset percentages for complements and in-kind salary. */
const AMOUNT_PERCENT_PRESETS = [0, 2, 5, 8, 10, 12, 15, 20, 25] as const
type AmountPercentPreset = (typeof AMOUNT_PERCENT_PRESETS)[number]

const CUSTOM_PERCENT_VALUE = 'custom'

function formatNumber(value: number) {
  return euroFormatter.format(Number.isFinite(value) ? value : 0)
}

function eurosFromPercent(percent: number, annualSalary: number) {
  if (annualSalary <= 0) return 0
  return Math.max(0, Math.round((annualSalary * percent) / 100))
}

function percentFromEuros(euros: number, annualSalary: number) {
  if (annualSalary <= 0) return 0
  return Math.max(0, (euros / annualSalary) * 100)
}

function matchingPreset(percent: number): AmountPercentPreset | null {
  return AMOUNT_PERCENT_PRESETS.find((preset) => Math.abs(preset - percent) < 0.0001) ?? null
}

function formatPercentLabel(percent: number) {
  return `${percentDetailFormatter.format(percent)} %`
}

const salaryRanges: Record<PayPeriod, { min: number; max: number; step: number; markers: number[] }> = {
  annual: {
    min: 14000,
    max: 500000,
    step: 1000,
    markers: [14000, 50000, 120000, 250000, 500000],
  },
  monthly: {
    min: 1000,
    max: 42000,
    step: 100,
    markers: [1000, 5000, 12000, 25000, 42000],
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function initialAnnualSalary(salary: number, payPeriod: PayPeriod, payCount: PayCount) {
  return payPeriod === 'annual' ? salary : salary * Number(payCount)
}

function AmountPercentPair({
  percentSelectId,
  eurosInputId,
  percentLabel,
  eurosLabel,
  percent,
  annualSalary,
  onPercentChange,
}: {
  percentSelectId: string
  eurosInputId: string
  percentLabel: string
  eurosLabel: string
  percent: number
  annualSalary: number
  onPercentChange: (percent: number) => void
}) {
  const euros = eurosFromPercent(percent, annualSalary)
  const matchedPreset = matchingPreset(percent)
  const selectValue = matchedPreset !== null ? String(matchedPreset) : CUSTOM_PERCENT_VALUE

  const handleEurosChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value)
    if (!Number.isFinite(parsed)) return
    onPercentChange(percentFromEuros(Math.max(0, parsed), annualSalary))
  }

  const handlePercentSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target
    if (value === CUSTOM_PERCENT_VALUE) return
    onPercentChange(Number(value))
  }

  return (
    <>
      <div className="wsbc-input-shell wsbc-input-shell--amount">
        <input
          id={eurosInputId}
          type="number"
          min={0}
          step={100}
          inputMode="numeric"
          value={euros}
          onChange={handleEurosChange}
          aria-label={eurosLabel}
        />
        <span className="wsbc-period-tag">EUR/año</span>
      </div>

      <div className="wsbc-select-shell wsbc-select-shell--percent">
        <select
          id={percentSelectId}
          value={selectValue}
          onChange={handlePercentSelect}
          aria-label={percentLabel}
        >
          {matchedPreset === null && (
            <option value={CUSTOM_PERCENT_VALUE}>
              {formatPercentLabel(percent)}
            </option>
          )}
          {AMOUNT_PERCENT_PRESETS.map((preset) => (
            <option key={preset} value={String(preset)}>
              {percentFormatter.format(preset)} %
            </option>
          ))}
        </select>
        <ChevronDown size={18} strokeWidth={2.3} aria-hidden="true" />
      </div>
    </>
  )
}

export function WorkerSalaryBaseCard({
  initialSalary = 35000,
  initialPayPeriod = 'annual',
  initialPayCount = '14',
  initialSalaryComplements = 2000,
  initialInKindSalary = 500,
  onValuesChange,
}: WorkerSalaryBaseCardProps) {
  const initialAnnual = initialAnnualSalary(initialSalary, initialPayPeriod, initialPayCount)
  const [salary, setSalary] = useState(initialSalary)
  const [payPeriod, setPayPeriod] = useState<PayPeriod>(initialPayPeriod)
  const [payCount, setPayCount] = useState<PayCount>(initialPayCount)
  const [complementsPercent, setComplementsPercent] = useState(() =>
    percentFromEuros(initialSalaryComplements, initialAnnual),
  )
  const [inKindPercent, setInKindPercent] = useState(() =>
    percentFromEuros(initialInKindSalary, initialAnnual),
  )
  const salaryRange = salaryRanges[payPeriod]

  const annualSalary = useMemo(
    () => (payPeriod === 'annual' ? salary : salary * Number(payCount)),
    [payCount, payPeriod, salary],
  )

  const salaryComplements = eurosFromPercent(complementsPercent, annualSalary)
  const inKindSalary = eurosFromPercent(inKindPercent, annualSalary)

  const realBase = useMemo(
    () => annualSalary + salaryComplements + inKindSalary,
    [annualSalary, inKindSalary, salaryComplements],
  )

  useEffect(() => {
    onValuesChange?.({
      salary,
      payPeriod,
      payCount,
      salaryComplements,
      inKindSalary,
      realBaseAnnual: realBase,
    })
  }, [inKindSalary, onValuesChange, payCount, payPeriod, realBase, salary, salaryComplements])

  const handlePayPeriodChange = (nextPayPeriod: PayPeriod) => {
    if (nextPayPeriod === payPeriod) return

    const convertedSalary = nextPayPeriod === 'monthly'
      ? salary / Number(payCount)
      : salary * Number(payCount)
    const nextRange = salaryRanges[nextPayPeriod]

    setPayPeriod(nextPayPeriod)
    setSalary(clamp(Math.round(convertedSalary / nextRange.step) * nextRange.step, nextRange.min, nextRange.max))
  }

  return (
    <section className="wsbc" aria-labelledby="wsbc-title">
      <header className="wsbc-header">
        <div className="wsbc-title-group">
          <span className="wsbc-step" aria-hidden="true">1.</span>
          <h2 id="wsbc-title">Base real</h2>
        </div>
      </header>

      <div className="wsbc-fields">
        <label className="wsbc-label" htmlFor="wsbc-salary">Salario anual o mensual bruto</label>
        <div className="wsbc-control-row wsbc-control-row--salary">
          <SalarySlider
            id="wsbc-salary"
            value={salary}
            onChange={setSalary}
            min={salaryRange.min}
            max={salaryRange.max}
            step={salaryRange.step}
            markers={salaryRange.markers}
            scale={payPeriod === 'annual' ? 'log' : 'linear'}
            unitLabel={payPeriod === 'annual' ? 'brutos al año' : 'brutos al mes'}
            ariaLabel="Salario anual o mensual en euros"
          />

          <div className="wsbc-salary-side">
            <div className="wsbc-select-shell wsbc-select-shell--period">
              <select
                value={payPeriod}
                onChange={(event) => handlePayPeriodChange(event.target.value as PayPeriod)}
                aria-label="Periodicidad del salario"
              >
                <option value="annual">Anual</option>
                <option value="monthly">Mensual</option>
              </select>
              <Euro size={18} strokeWidth={2.4} aria-hidden="true" />
            </div>

            <div className="wsbc-select-shell wsbc-select-shell--pays">
              <select
                id="wsbc-pay-count"
                value={payCount}
                onChange={(event) => setPayCount(event.target.value as PayCount)}
                aria-label="12 o 14 pagas"
              >
                <option value="12">12 pagas</option>
                <option value="14">14 pagas</option>
              </select>
              <ChevronDown size={18} strokeWidth={2.3} aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="wsbc-label-row">
          <label className="wsbc-label" htmlFor="wsbc-complements">Complementos salariales anuales</label>
          <InfoButton
            label="Que son los complementos salariales anuales"
            size="sm"
            placement="end"
            className="wsbc-help"
          >
            <p>{SALARY_COMPLEMENTS_HELP}</p>
          </InfoButton>
        </div>
        <div className="wsbc-control-row wsbc-control-row--amount">
          <AmountPercentPair
            percentSelectId="wsbc-complements-percent"
            eurosInputId="wsbc-complements"
            percentLabel="Porcentaje de complementos salariales sobre el salario fijo"
            eurosLabel="Complementos salariales anuales en euros"
            percent={complementsPercent}
            annualSalary={annualSalary}
            onPercentChange={setComplementsPercent}
          />
        </div>

        <div className="wsbc-label-row">
          <label className="wsbc-label" htmlFor="wsbc-kind">Salario en especie anual</label>
          <InfoButton
            label="Que es el salario en especie anual"
            size="sm"
            placement="end"
            className="wsbc-help"
          >
            <p>{IN_KIND_SALARY_HELP}</p>
          </InfoButton>
        </div>
        <div className="wsbc-control-row wsbc-control-row--amount">
          <AmountPercentPair
            percentSelectId="wsbc-kind-percent"
            eurosInputId="wsbc-kind"
            percentLabel="Porcentaje de salario en especie sobre el salario fijo"
            eurosLabel="Salario en especie anual en euros"
            percent={inKindPercent}
            annualSalary={annualSalary}
            onPercentChange={setInKindPercent}
          />
        </div>
      </div>

      <output className="wsbc-result" aria-live="polite">
        <span>Base real calculada</span>
        <strong>{formatNumber(realBase)} €</strong>
      </output>
    </section>
  )
}

export default WorkerSalaryBaseCard
