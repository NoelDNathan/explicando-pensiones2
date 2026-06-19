import { ChevronDown, Euro } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { SalarySlider } from '../ui/SalarySlider'
import './WorkerSalaryBaseCard.css'

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

function formatNumber(value: number) {
  return euroFormatter.format(Number.isFinite(value) ? value : 0)
}

function parseNumber(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

const salaryRanges: Record<PayPeriod, { min: number; max: number; step: number; markers: number[] }> = {
  annual: {
    min: 14000,
    max: 120000,
    step: 500,
    markers: [14000, 35000, 60000, 90000, 120000],
  },
  monthly: {
    min: 1000,
    max: 10000,
    step: 100,
    markers: [1000, 2500, 5000, 7500, 10000],
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function WorkerSalaryBaseCard({
  initialSalary = 35000,
  initialPayPeriod = 'annual',
  initialPayCount = '14',
  initialSalaryComplements = 2000,
  initialInKindSalary = 500,
  onValuesChange,
}: WorkerSalaryBaseCardProps) {
  const [salary, setSalary] = useState(initialSalary)
  const [payPeriod, setPayPeriod] = useState<PayPeriod>(initialPayPeriod)
  const [payCount, setPayCount] = useState<PayCount>(initialPayCount)
  const [salaryComplements, setSalaryComplements] = useState(initialSalaryComplements)
  const [inKindSalary, setInKindSalary] = useState(initialInKindSalary)
  const salaryRange = salaryRanges[payPeriod]

  const realBase = useMemo(() => {
    const annualSalary = payPeriod === 'annual' ? salary : salary * Number(payCount)
    return annualSalary + salaryComplements + inKindSalary
  }, [inKindSalary, payCount, payPeriod, salary, salaryComplements])

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
        <label className="wsbc-label" htmlFor="wsbc-salary">Salario anual o mensual</label>
        <div className="wsbc-control-row">
          <SalarySlider
            id="wsbc-salary"
            value={salary}
            onChange={setSalary}
            min={salaryRange.min}
            max={salaryRange.max}
            step={salaryRange.step}
            markers={salaryRange.markers}
            unitLabel={payPeriod === 'annual' ? 'brutos al año' : 'brutos al mes'}
            ariaLabel="Salario anual o mensual en euros"
          />

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
        </div>

        <label className="wsbc-label" htmlFor="wsbc-pay-count">12 o 14 pagas</label>
        <div className="wsbc-control-row wsbc-control-row--single">
          <div className="wsbc-select-shell">
            <select
              id="wsbc-pay-count"
              value={payCount}
              onChange={(event) => setPayCount(event.target.value as PayCount)}
            >
              <option value="12">12 pagas</option>
              <option value="14">14 pagas</option>
            </select>
            <ChevronDown size={18} strokeWidth={2.3} aria-hidden="true" />
          </div>
        </div>

        <label className="wsbc-label" htmlFor="wsbc-complements">Complementos salariales anuales</label>
        <div className="wsbc-control-row wsbc-control-row--single">
          <div className="wsbc-input-shell">
            <input
              id="wsbc-complements"
              inputMode="decimal"
              value={formatNumber(salaryComplements)}
              onChange={(event) => setSalaryComplements(parseNumber(event.target.value))}
              aria-label="Complementos salariales anuales en euros"
            />
            <span className="wsbc-period-tag">al año</span>
            <Euro size={18} strokeWidth={2.4} aria-hidden="true" />
          </div>
        </div>

        <label className="wsbc-label" htmlFor="wsbc-kind">Salario en especie anual</label>
        <div className="wsbc-control-row wsbc-control-row--single">
          <div className="wsbc-input-shell">
            <input
              id="wsbc-kind"
              inputMode="decimal"
              value={formatNumber(inKindSalary)}
              onChange={(event) => setInKindSalary(parseNumber(event.target.value))}
              aria-label="Salario en especie anual en euros"
            />
            <span className="wsbc-period-tag">al año</span>
            <Euro size={18} strokeWidth={2.4} aria-hidden="true" />
          </div>
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
