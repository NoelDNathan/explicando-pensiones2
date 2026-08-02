import { ChevronDown, Euro, Percent } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { InfoButton } from '../ui/InfoButton'
import { SalarySlider } from '../ui/SalarySlider'
import './WorkerSalaryBaseCard.css'

const SALARY_COMPLEMENTS_HELP =
  'Pagos que sumas al salario fijo durante el año: plus de convenio, nocturnidad, productividad, comisiones u otros conceptos en dinero. Puedes indicar el importe anual en euros o como porcentaje de tu salario fijo; ambos campos se mantienen sincronizados.'

const IN_KIND_SALARY_HELP =
  'Beneficios que recibes de la empresa en lugar de dinero en la nomina: seguro medico, coche, vales comida o transporte, guarderia, etc. Indica su valor anual estimado en euros o como porcentaje de tu salario fijo para calcular tu base real completa.'

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
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

function formatNumber(value: number) {
  return euroFormatter.format(Number.isFinite(value) ? value : 0)
}

function formatPercent(value: number) {
  return percentFormatter.format(Number.isFinite(value) ? value : 0)
}

function parseNumber(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function eurosFromPercent(percent: number, annualSalary: number) {
  if (annualSalary <= 0) return 0
  return Math.max(0, Math.round((annualSalary * percent) / 100))
}

function percentFromEuros(euros: number, annualSalary: number) {
  if (annualSalary <= 0) return 0
  return Math.max(0, (euros / annualSalary) * 100)
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

  const annualSalary = useMemo(
    () => (payPeriod === 'annual' ? salary : salary * Number(payCount)),
    [payCount, payPeriod, salary],
  )

  const complementsPercent = percentFromEuros(salaryComplements, annualSalary)
  const inKindPercent = percentFromEuros(inKindSalary, annualSalary)

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
          <div className="wsbc-input-shell">
            <input
              id="wsbc-complements"
              inputMode="decimal"
              value={formatNumber(salaryComplements)}
              onChange={(event) => setSalaryComplements(Math.max(0, parseNumber(event.target.value)))}
              aria-label="Complementos salariales anuales en euros"
            />
            <span className="wsbc-period-tag">al año</span>
            <Euro size={18} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <div className="wsbc-input-shell wsbc-input-shell--percent">
            <input
              id="wsbc-complements-percent"
              inputMode="decimal"
              value={formatPercent(complementsPercent)}
              onChange={(event) => setSalaryComplements(eurosFromPercent(parseNumber(event.target.value), annualSalary))}
              aria-label="Complementos salariales como porcentaje del salario"
            />
            <Percent size={18} strokeWidth={2.4} aria-hidden="true" />
          </div>
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
          <div className="wsbc-input-shell">
            <input
              id="wsbc-kind"
              inputMode="decimal"
              value={formatNumber(inKindSalary)}
              onChange={(event) => setInKindSalary(Math.max(0, parseNumber(event.target.value)))}
              aria-label="Salario en especie anual en euros"
            />
            <span className="wsbc-period-tag">al año</span>
            <Euro size={18} strokeWidth={2.4} aria-hidden="true" />
          </div>
          <div className="wsbc-input-shell wsbc-input-shell--percent">
            <input
              id="wsbc-kind-percent"
              inputMode="decimal"
              value={formatPercent(inKindPercent)}
              onChange={(event) => setInKindSalary(eurosFromPercent(parseNumber(event.target.value), annualSalary))}
              aria-label="Salario en especie como porcentaje del salario"
            />
            <Percent size={18} strokeWidth={2.4} aria-hidden="true" />
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
