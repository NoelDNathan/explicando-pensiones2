import { ArrowRight, Building2, Landmark, Percent, ReceiptText, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { SalarySlider } from '../ui/SalarySlider'
import './WorkerFiscalSummaryCard.css'

type SummaryDisplayMode = 'absolute' | 'percentage'
type SummaryVariant = 'intro' | 'final'

type WorkerFiscalSummaryCardProps = {
  variant?: SummaryVariant
  grossSalaryAnnual?: number
  employerContributionsAnnual?: number
  workerContributionsAnnual?: number
  irpfAnnual?: number
  vatAnnual?: number
  otherTaxesAnnual?: number
  onSalaryChange?: (salary: number) => void
  onExploreDetails?: () => void
  onContinue?: () => void
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

function roundEuro(value: number) {
  return Math.round(value)
}

export function WorkerFiscalSummaryCard({
  variant = 'intro',
  grossSalaryAnnual = 35_000,
  employerContributionsAnnual = 10_700,
  workerContributionsAnnual = 2_270,
  irpfAnnual = 4_350,
  vatAnnual = 1_836,
  otherTaxesAnnual = 0,
  onSalaryChange,
  onExploreDetails,
  onContinue,
}: WorkerFiscalSummaryCardProps) {
  const [displayMode, setDisplayMode] = useState<SummaryDisplayMode>('absolute')
  const isFinal = variant === 'final'
  const workerContributionsRounded = roundEuro(workerContributionsAnnual)
  const irpfRounded = roundEuro(irpfAnnual)
  const vatRounded = roundEuro(vatAnnual)
  const otherTaxesRounded = roundEuro(otherTaxesAnnual)
  const companyCostAnnual = grossSalaryAnnual + employerContributionsAnnual
  const workerPaymentsAnnual = workerContributionsRounded + irpfRounded + vatRounded + otherTaxesRounded
  const totalTaxesAnnual = roundEuro(employerContributionsAnnual) + workerPaymentsAnnual
  const laborNetAnnual = Math.max(0, roundEuro(grossSalaryAnnual) - workerContributionsRounded - irpfRounded)
  const remainingAfterConsumption = Math.max(0, laborNetAnnual - vatRounded - otherTaxesRounded)

  const formatMetric = (value: number) => {
    if (displayMode === 'absolute') return formatEuro(value)
    const percentage = grossSalaryAnnual > 0 ? value / grossSalaryAnnual * 100 : 0
    return `${percentFormatter.format(percentage)} %`
  }

  const workerBreakdown = otherTaxesRounded > 0
    ? `${formatEuro(workerContributionsRounded)} de cotizaciones + ${formatEuro(irpfRounded)} de IRPF + ${formatEuro(vatRounded)} de IVA + ${formatEuro(otherTaxesRounded)} de otros`
    : `${formatEuro(workerContributionsRounded)} de cotizaciones + ${formatEuro(irpfRounded)} de IRPF + ${formatEuro(vatRounded)} de IVA`

  return (
    <section className={`wfsc-summary${isFinal ? ' wfsc-summary--final' : ''}`} aria-labelledby="wfsc-summary-title">
      <header className="wfsc-summary__header">
        <div>
          <p className="wfsc-summary__eyebrow">
            {isFinal ? 'Paso 8 · Resultado de todo el recorrido' : 'Cuanto pagas, cuanto paga tu empresa y con cuanto dinero te quedas'}
          </p>
          <h2 id="wfsc-summary-title">
            {isFinal ? 'Resumen del cálculo' : 'Entiende tu nómina'}
          </h2>
          <p>
            {isFinal
              ? 'Aquí se reúnen las cifras que has construido paso a paso: coste de empresa, cotizaciones, IRPF, IVA y lo que te queda. Puedes seguir ajustando el salario bruto para ver cómo cambia el resultado.'
              : 'En esta primera parte ves una aproximación de cuanto te tocaría pagar a ti y a tu empresa en impuestos por tu salario. En los siguientes pasos calcularemos con más precisión cuanto pagas y te ayudaremos a entender que estás pagando de impuestos'}
          </p>
        </div>

        <div className="wfsc-summary__mode" role="group" aria-label="Unidad de los resultados">
          <button
            type="button"
            className={displayMode === 'absolute' ? 'is-active' : undefined}
            onClick={() => setDisplayMode('absolute')}
            aria-pressed={displayMode === 'absolute'}
            aria-label="Mostrar resultados en euros"
          >
            €
            <span>Euros</span>
          </button>
          <button
            type="button"
            className={displayMode === 'percentage' ? 'is-active' : undefined}
            onClick={() => setDisplayMode('percentage')}
            aria-pressed={displayMode === 'percentage'}
            aria-label="Mostrar resultados en porcentaje"
          >
            <Percent size={15} aria-hidden="true" />
            <span>Porcentaje</span>
          </button>
        </div>
      </header>

      <div className="wfsc-summary__salary">
        <SalarySlider
          id={isFinal ? 'wfsc-summary-salary-final' : 'wfsc-summary-salary'}
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
            <p>{isFinal ? 'Tú pagas en total' : 'Tú pagas en IRPF, cotizaciones e IVA'}</p>
            <strong>{formatMetric(workerPaymentsAnnual)}</strong>
            <small>{workerBreakdown}</small>
          </div>
        </article>

        <article className="wfsc-summary__metric wfsc-summary__metric--total-tax">
          <span className="wfsc-summary__icon" aria-hidden="true"><ReceiptText size={24} /></span>
          <div>
            <p>Impuestos y cotizaciones pagados en total</p>
            <strong>{formatMetric(totalTaxesAnnual)}</strong>
            <small>
              {formatEuro(employerContributionsAnnual)} de empresa + {formatEuro(workerPaymentsAnnual)} del trabajador
            </small>
          </div>
        </article>

        <article className="wfsc-summary__metric wfsc-summary__metric--net">
          <span className="wfsc-summary__icon" aria-hidden="true"><WalletCards size={24} /></span>
          <div>
            <p>{isFinal ? 'Te queda tras nómina y consumo' : 'Te queda como salario neto'}</p>
            <strong>{formatMetric(remainingAfterConsumption)}</strong>
            <small>
              {isFinal
                ? `${formatEuro(laborNetAnnual)} de neto laboral − ${formatEuro(vatRounded + otherTaxesRounded)} de IVA y otros`
                : 'Lo que te queda tras restar cotizaciones del trabajador, IRPF e IVA estimado'}
            </small>
          </div>
        </article>
      </div>

      <footer className="wfsc-summary__footer">
        <p>
          {displayMode === 'percentage'
            ? 'Los porcentajes toman tu salario bruto como referencia; por eso el coste total de empresa puede superar el 100 %.'
            : isFinal
              ? 'Este resumen usa los valores vivos de los pasos anteriores. El neto laboral solo resta cotizaciones e IRPF; el IVA y otros impuestos dependen de tu consumo y van aparte.'
              : 'Son importes aproximados: una nómina real puede variar por contrato, situación personal, comunidad autónoma y otros ajustes. Mira los siguientes pasos para descubir cuanto pagas con mayor precisión.'}
        </p>
        {isFinal ? (
          onContinue ? (
            <button type="button" onClick={onContinue}>
              Ver preguntas frecuentes
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : null
        ) : (
          <button type="button" onClick={onExploreDetails}>
            Ver cómo funciona, paso a paso
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </footer>
    </section>
  )
}

export default WorkerFiscalSummaryCard
