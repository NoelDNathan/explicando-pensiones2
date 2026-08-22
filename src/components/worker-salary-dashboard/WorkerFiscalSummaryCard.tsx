import { ArrowRight, Building2, Landmark, Percent, PiggyBank, ReceiptText, ShoppingCart, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { SalarySlider } from '../ui/SalarySlider'
import './WorkerFiscalSummaryCard.css'

type SummaryDisplayMode = 'absolute' | 'percentage'
type SummaryPeriod = 'month' | 'year'
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

const percentFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function formatEuro(value: number) {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  const digits = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}${digits} €`
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
  const [period, setPeriod] = useState<SummaryPeriod>('month')
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

  if (!isFinal) {
    const divisor = period === 'month' ? 12 : 1
    const periodSuffix = period === 'month' ? 'al mes' : 'al año'
    const formatPeriodEuro = (value: number) => formatEuro(value / divisor)
    const shareOfCost = (value: number) => (companyCostAnnual > 0 ? value / companyCostAnnual * 100 : 0)
    const takeHomePer100 = Math.round(shareOfCost(remainingAfterConsumption))

    const flowSegments = [
      {
        id: 'net',
        label: 'Te lo quedas tú',
        value: remainingAfterConsumption,
        icon: <PiggyBank size={20} aria-hidden="true" />,
        detail: 'Lo que puedes gastar o ahorrar después de todo',
      },
      {
        id: 'worker',
        label: 'IRPF y cotizaciones tuyas',
        value: workerContributionsRounded + irpfRounded,
        icon: <Landmark size={20} aria-hidden="true" />,
        detail: 'Lo que se descuenta directamente de tu nómina',
      },
      {
        id: 'company',
        label: 'Cotizaciones de tu empresa',
        value: roundEuro(employerContributionsAnnual),
        icon: <Building2 size={20} aria-hidden="true" />,
        detail: 'No sale de tu nómina, pero tu empresa lo paga por ti',
      },
      {
        id: 'consumption',
        label: 'IVA y otros al gastar',
        value: vatRounded + otherTaxesRounded,
        icon: <ShoppingCart size={20} aria-hidden="true" />,
        detail: 'Se te van poco a poco cada vez que compras algo',
      },
    ].filter((segment) => segment.value > 0)

    return (
      <section className="wfsc-summary wfsc-summary--intro wfsc-theme--soft" aria-labelledby="wfsc-summary-title">
        <header className="wfsc-intro__header">
          <h2 id="wfsc-summary-title">¿Cuántos impuestos pagas?</h2>
          <p className="wfsc-intro__lead">
            Mueve tu sueldo y verás, en un vistazo, cuánto acaba en tu bolsillo y cuánto se
            reparte entre impuestos y cotizaciones. Después lo iremos afinando paso a paso.
          </p>
        </header>

        <div className="wfsc-intro__controls">
          <div className="wfsc-intro__salary">
            <SalarySlider
              id="wfsc-summary-salary"
              value={grossSalaryAnnual}
              onChange={onSalaryChange ?? (() => undefined)}
              min={14_000}
              max={500_000}
              step={1_000}
              markers={[14_000, 50_000, 120_000, 250_000, 500_000]}
              scale="log"
              unitLabel="brutos al año"
              ariaLabel="Salario bruto anual para el resumen fiscal"
            />
          </div>

          <div className="wfsc-intro__period" role="group" aria-label="Ver las cifras al mes o al año">
            <button
              type="button"
              className={period === 'month' ? 'is-active' : undefined}
              onClick={() => setPeriod('month')}
              aria-pressed={period === 'month'}
            >
              Al mes
            </button>
            <button
              type="button"
              className={period === 'year' ? 'is-active' : undefined}
              onClick={() => setPeriod('year')}
              aria-pressed={period === 'year'}
            >
              Al año
            </button>
          </div>
        </div>

        <div className="wfsc-intro__headline" aria-live="polite">
          <p>
            De cada <strong>100 €</strong> que le cuestas a tu empresa, a tu bolsillo llegan
          </p>
          <p className="wfsc-intro__headline-number">
            <strong>{takeHomePer100} €</strong>
          </p>
          <p className="wfsc-intro__headline-note">
            Son {formatPeriodEuro(remainingAfterConsumption)} {periodSuffix} de los{' '}
            {formatPeriodEuro(companyCostAnnual)} {periodSuffix} que cuesta tu puesto.
          </p>
        </div>

        <div className="wfsc-intro__flow">
          <div className="wfsc-intro__bar" role="img" aria-label={`Reparto del coste total de tu puesto: ${flowSegments.map((segment) => `${segment.label}, ${Math.round(shareOfCost(segment.value))} por ciento`).join('; ')}`}>
            {flowSegments.map((segment) => (
              <span
                key={segment.id}
                className={`wfsc-intro__bar-part wfsc-intro__bar-part--${segment.id}`}
                style={{ flexGrow: segment.value }}
              />
            ))}
          </div>

          <ul className="wfsc-intro__legend">
            {flowSegments.map((segment) => (
              <li key={segment.id} className={`wfsc-intro__legend-item wfsc-intro__legend-item--${segment.id}`}>
                <span className="wfsc-intro__legend-icon">{segment.icon}</span>
                <div>
                  <p className="wfsc-intro__legend-label">{segment.label}</p>
                  <p className="wfsc-intro__legend-value">
                    <strong>{formatPeriodEuro(segment.value)}</strong>
                    <span>{Math.round(shareOfCost(segment.value))} %</span>
                  </p>
                  <p className="wfsc-intro__legend-detail">{segment.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="wfsc-intro__footer">
          <button type="button" className="wfsc-intro__cta" onClick={onExploreDetails}>
            Ver cómo se calcula, paso a paso
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <p>
            Son cifras aproximadas: tu nómina real cambia según el contrato, tu situación
            personal y tu comunidad autónoma. En los siguientes pasos lo ajustamos contigo.
          </p>
        </footer>
      </section>
    )
  }

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
          scale="log"
          unitLabel="brutos al año"
          ariaLabel="Salario bruto anual para el resumen fiscal"
        />
      </div>

      <div className="wfsc-summary__metrics" aria-live="polite">
        <article className="wfsc-summary__metric wfsc-summary__metric--company">
          <span className="wfsc-summary__icon" aria-hidden="true"><Building2 size={24} /></span>
          <div>
            <p>{isFinal ? 'Coste total para la empresa' : 'Tu empresa paga por tu trabajo'}</p>
            <strong>{formatMetric(companyCostAnnual)}</strong>
            <small>
              {formatEuro(grossSalaryAnnual)} de salario + {formatEuro(employerContributionsAnnual)} de cotizaciones de empresa
            </small>
          </div>
        </article>

        <article className="wfsc-summary__metric wfsc-summary__metric--tax">
          <span className="wfsc-summary__icon" aria-hidden="true"><Landmark size={24} /></span>
          <div>
            <p>{isFinal ? 'Descuentos e impuestos del trabajador' : 'Tú pagas en IRPF, cotizaciones e IVA'}</p>
            <strong>{formatMetric(workerPaymentsAnnual)}</strong>
            <small>{workerBreakdown}</small>
          </div>
        </article>

        <article className="wfsc-summary__metric wfsc-summary__metric--total-tax">
          <span className="wfsc-summary__icon" aria-hidden="true"><ReceiptText size={24} /></span>
          <div>
            <p>{isFinal ? 'Recaudación total asociada al empleo' : 'Impuestos y cotizaciones pagados en total'}</p>
            <strong>{formatMetric(totalTaxesAnnual)}</strong>
            <small>
              {formatEuro(employerContributionsAnnual)} de empresa + {formatEuro(workerPaymentsAnnual)} del trabajador
            </small>
          </div>
        </article>

        <article className="wfsc-summary__metric wfsc-summary__metric--net">
          <span className="wfsc-summary__icon" aria-hidden="true"><WalletCards size={24} /></span>
          <div>
            <p>{isFinal ? 'Neto disponible tras nómina y consumo' : 'Te queda como salario neto'}</p>
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
