import { ArrowRight, Building2, Landmark, Percent, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { SalarySlider } from '../ui/SalarySlider'
import './WorkerFiscalSummaryCard.css'

type SummaryDisplayMode = 'absolute' | 'percentage'

type WorkerFiscalSummaryCardProps = {
  grossSalaryAnnual?: number
  employerContributionsAnnual?: number
  workerContributionsAnnual?: number
  irpfAnnual?: number
  onSalaryChange?: (salary: number) => void
  onExploreDetails?: () => void
}

const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function formatEuro(value: number) {
  return euroFormatter.format(Math.round(value))
}

export function WorkerFiscalSummaryCard({
  grossSalaryAnnual = 35_000,
  employerContributionsAnnual = 10_700,
  workerContributionsAnnual = 2_270,
  irpfAnnual = 4_350,
  onSalaryChange,
  onExploreDetails,
}: WorkerFiscalSummaryCardProps) {
  const [displayMode, setDisplayMode] = useState<SummaryDisplayMode>('absolute')
  const companyCostAnnual = grossSalaryAnnual + employerContributionsAnnual
  const workerPaymentsAnnual = workerContributionsAnnual + irpfAnnual
  const netSalaryAnnual = Math.max(0, grossSalaryAnnual - workerPaymentsAnnual)

  const formatMetric = (value: number) => {
    if (displayMode === 'absolute') return formatEuro(value)
    const percentage = grossSalaryAnnual > 0 ? value / grossSalaryAnnual * 100 : 0
    return `${percentFormatter.format(percentage)} %`
  }

  return (
    <section className="wfsc-summary" aria-labelledby="wfsc-summary-title">
      <header className="wfsc-summary__header">
        <div>
          <p className="wfsc-summary__eyebrow">Tu trabajo, en una sola imagen</p>
          <h2 id="wfsc-summary-title">Lo esencial de tu nómina</h2>
          <p>Una aproximación anual con los datos que has introducido. Cambia el salario y compara euros con porcentaje del bruto.</p>
        </div>

        <div className="wfsc-summary__mode" role="group" aria-label="Unidad de los resultados">
          <button
            type="button"
            className={displayMode === 'absolute' ? 'is-active' : undefined}
            onClick={() => setDisplayMode('absolute')}
            aria-pressed={displayMode === 'absolute'}
          >
            €
            <span>Euros</span>
          </button>
          <button
            type="button"
            className={displayMode === 'percentage' ? 'is-active' : undefined}
            onClick={() => setDisplayMode('percentage')}
            aria-pressed={displayMode === 'percentage'}
          >
            <Percent size={15} aria-hidden="true" />
            <span>Porcentaje</span>
          </button>
        </div>
      </header>

      <div className="wfsc-summary__salary">
        <SalarySlider
          id="wfsc-summary-salary"
          value={grossSalaryAnnual}
          onChange={onSalaryChange ?? (() => undefined)}
          min={14_000}
          max={500_000}
          step={1_000}
          markers={[14_000, 50_000, 120_000, 250_000, 500_000]}
          unitLabel="brutos al año"
          ariaLabel="Salario bruto anual para el resumen fiscal"
        />
      </div>

      <div className="wfsc-summary__metrics" aria-live="polite">
        <article className="wfsc-summary__metric wfsc-summary__metric--company">
          <span className="wfsc-summary__icon" aria-hidden="true"><Building2 size={24} /></span>
          <div>
            <p>Tu empresa paga por tu trabajo</p>
            <strong>{formatMetric(companyCostAnnual)}</strong>
            <small>
              {formatEuro(grossSalaryAnnual)} de salario + {formatEuro(employerContributionsAnnual)} de cotizaciones de empresa
            </small>
          </div>
        </article>

        <article className="wfsc-summary__metric wfsc-summary__metric--tax">
          <span className="wfsc-summary__icon" aria-hidden="true"><Landmark size={24} /></span>
          <div>
            <p>Tú pagas en impuestos y cotizaciones</p>
            <strong>{formatMetric(workerPaymentsAnnual)}</strong>
            <small>
              {formatEuro(workerContributionsAnnual)} de cotizaciones + {formatEuro(irpfAnnual)} de IRPF
            </small>
          </div>
        </article>

        <article className="wfsc-summary__metric wfsc-summary__metric--net">
          <span className="wfsc-summary__icon" aria-hidden="true"><WalletCards size={24} /></span>
          <div>
            <p>Te queda como salario neto</p>
            <strong>{formatMetric(netSalaryAnnual)}</strong>
            <small>Lo que recibes tras restar cotizaciones del trabajador e IRPF</small>
          </div>
        </article>
      </div>

      <footer className="wfsc-summary__footer">
        <p>
          {displayMode === 'percentage'
            ? 'Los porcentajes toman tu salario bruto como referencia; por eso el coste total de empresa puede superar el 100 %.'
            : 'Son importes aproximados: una nómina real puede variar por contrato, situación personal, comunidad autónoma y otros ajustes.'}
        </p>
        <button type="button" onClick={onExploreDetails}>
          Ver cómo funciona, paso a paso
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </footer>
    </section>
  )
}

export default WorkerFiscalSummaryCard
