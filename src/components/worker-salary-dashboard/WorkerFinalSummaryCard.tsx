import { useMemo, useState } from 'react'
import { ArrowRight, Car, Home, Landmark, ShieldCheck } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TooltipProps } from 'recharts'
import stateRevenueJson from '../../../data/processed/fiscal/2026-09-01_igae-recaudacion-por-figura-aapp-2024.json'
import { SalarySlider } from '../ui/SalarySlider'
import './WorkerFinalSummaryCard.css'

/** Identificadores de las porciones del grafico de coste laboral. */
type CostSliceId =
  | 'take-home'
  | 'employer-contributions'
  | 'worker-contributions'
  | 'irpf'
  | 'vat'
  | 'special-taxes'
  | 'wealth-taxes'

type CostSlice = {
  id: CostSliceId
  label: string
  detail: string
  amountAnnual: number
  sharePercent: number
}

/** Figuras del bloque «que recauda el Estado». Los ids casan con el dataset IGAE. */
type StateFigureId =
  | 'social_contributions'
  | 'irpf'
  | 'vat'
  | 'special_taxes'
  | 'property_tax'
  | 'vehicle_tax'

type StateFigureCopy = {
  id: StateFigureId
  /** Nombre corto para la tarjeta, independiente de la etiqueta del dataset. */
  label: string
  yours: string
  destination: string
  effect: string
}

type WorkerFinalSummaryCardProps = {
  grossSalaryAnnual?: number
  employerContributionsAnnual?: number
  workerContributionsAnnual?: number
  irpfAnnual?: number
  vatAnnual?: number
  specialTaxesAnnual?: number
  propertyTaxAnnual?: number
  vehicleTaxAnnual?: number
  propertyPurchaseTaxTotal?: number
  vehiclePurchaseTaxTotal?: number
  onSalaryChange?: (salary: number) => void
  onGoToWealthStep?: () => void
  onContinue?: () => void
}

const REVENUE = stateRevenueJson

const REVENUE_BY_ID = new Map(REVENUE.figures.map((figure) => [figure.id, figure]))

/**
 * Texto editorial del bloque del Estado. Se mantiene aqui, fuera del dataset,
 * para no mezclar datos procesados con contenido editorial.
 */
const STATE_FIGURES: StateFigureCopy[] = [
  {
    id: 'social_contributions',
    label: 'Cotizaciones sociales',
    yours: 'Las tuyas y las de tu empresa sobre la base de cotización',
    destination:
      'Financian las prestaciones contributivas de la Seguridad Social: pensiones de jubilación, viudedad e incapacidad, bajas y desempleo. Es la única figura con destino legalmente reservado, y en 2024 el gasto en pensiones fue de 200.475 M€ frente a 203.298 M€ recaudados.',
    effect:
      'Encarecen el puesto de trabajo por encima de lo que tú ves en la nómina: la empresa mira el coste total, no el bruto. Cuando ese coste sube, buena parte acaba absorbida por salarios brutos más bajos o por menos contratación.',
  },
  {
    id: 'irpf',
    label: 'IRPF',
    yours: 'La retención mensual de tu nómina y el resultado de la declaración',
    destination:
      'Va al presupuesto general y se reparte entre Estado y comunidades autónomas, que lo usan sobre todo en sanidad y educación. No está reservado a ningún gasto concreto: en 2024 las Administraciones gastaron 725.001 M€ en total, de los que 102.942 M€ fueron sanidad.',
    effect:
      'Como es progresivo, cada euro extra que ganas tributa a un tipo más alto que el anterior. Eso reduce lo que te llevas por una hora extra, un ascenso o un segundo empleo: es el argumento clásico sobre el desincentivo a trabajar más.',
  },
  {
    id: 'vat',
    label: 'IVA',
    yours: 'Lo pagas al gastar, ya incluido en el precio de casi todo',
    destination:
      'Es la mayor figura indirecta y también se reparte entre Estado y comunidades autónomas para el gasto general. No aparece en tu nómina, pero se lleva una parte de cada compra que haces con el neto.',
    effect:
      'Encarece el consumo y reduce tu poder adquisitivo real sin tocar tu nómina. Pesa más sobre las rentas bajas, que gastan casi todo lo que ingresan, y menos sobre quien puede ahorrar una parte.',
  },
  {
    id: 'special_taxes',
    label: 'Impuestos especiales',
    yours: 'Carburante, tabaco, alcohol y electricidad, por encima del IVA',
    destination:
      'Entran también en el presupuesto general. Casi seis de cada diez euros vienen del impuesto sobre hidrocarburos y otros tres del tabaco.',
    effect:
      'Están pensados para desincentivar consumos con coste sanitario o ambiental, y por eso pesan mucho en proporción al precio. El efecto colateral es que encarecen desplazarse en coche o calentar la casa, que para muchos hogares no es una elección.',
  },
  {
    id: 'property_tax',
    label: 'IBI',
    yours: 'El recibo anual de tu ayuntamiento por tu vivienda',
    destination:
      'Es el principal ingreso propio de los ayuntamientos y paga servicios locales: recogida de residuos, alumbrado, policía local, parques y mantenimiento urbano.',
    effect:
      'Se paga por tener el inmueble, aunque ese año no ingreses nada por él. En vivienda alquilada, el propietario suele trasladar parte del recibo al precio del alquiler.',
  },
  {
    id: 'vehicle_tax',
    label: 'IVTM',
    yours: 'El impuesto de circulación de tu coche',
    destination:
      'También es municipal y refuerza el presupuesto del ayuntamiento donde tienes el vehículo domiciliado.',
    effect:
      'Es un coste fijo de tener coche: no cambia si conduces mucho o poco. Junto con el seguro y la ITV, es parte de lo que hace caro mantener un coche incluso parado.',
  },
]

const SLICE_ORDER: CostSliceId[] = [
  'take-home',
  'employer-contributions',
  'worker-contributions',
  'irpf',
  'vat',
  'special-taxes',
  'wealth-taxes',
]

function formatEuro(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
    // es-ES agrupa por defecto solo a partir de 5 cifras: aqui siempre.
    useGrouping: 'always',
  }).format(Math.round(value))
}

function formatPercent(value: number, decimals = 1) {
  return `${value.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} %`
}

/** Millones de euros con separador de miles, para las cifras del Estado. */
function formatMillionEuro(value: number) {
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: 0, useGrouping: 'always' })} M€`
}

type CostTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{ payload?: CostSlice }>
}

function CostTooltip({ active, payload }: CostTooltipProps) {
  const slice = payload?.[0]?.payload
  if (!active || !slice) return null

  return (
    <div className="wfin-chart__tooltip" role="status">
      <strong>{slice.label}</strong>
      <span>{formatPercent(slice.sharePercent)} del coste laboral</span>
      <span>{formatEuro(slice.amountAnnual)} al año</span>
    </div>
  )
}

export function WorkerFinalSummaryCard({
  grossSalaryAnnual = 35_000,
  employerContributionsAnnual = 10_700,
  workerContributionsAnnual = 2_270,
  irpfAnnual = 4_350,
  vatAnnual = 1_836,
  specialTaxesAnnual = 0,
  propertyTaxAnnual = 0,
  vehicleTaxAnnual = 0,
  propertyPurchaseTaxTotal = 0,
  vehiclePurchaseTaxTotal = 0,
  onSalaryChange,
  onGoToWealthStep,
  onContinue,
}: WorkerFinalSummaryCardProps) {
  const [period, setPeriod] = useState<'month' | 'year'>('year')

  const laborCostAnnual = grossSalaryAnnual + employerContributionsAnnual
  const wealthTaxesAnnual = propertyTaxAnnual + vehicleTaxAnnual
  const takeHomeAnnual = Math.max(
    0,
    grossSalaryAnnual
      - workerContributionsAnnual
      - irpfAnnual
      - vatAnnual
      - specialTaxesAnnual
      - wealthTaxesAnnual,
  )
  const totalTaxesAnnual = laborCostAnnual - takeHomeAnnual

  const slices = useMemo<CostSlice[]>(() => {
    const amounts: Record<CostSliceId, { label: string; detail: string; amount: number }> = {
      'take-home': {
        label: 'Te lo quedas tú',
        detail: 'Lo que puedes gastar o ahorrar después de todos los impuestos de este recorrido',
        amount: takeHomeAnnual,
      },
      'employer-contributions': {
        label: 'Cotizaciones de la empresa',
        detail: 'No pasan por tu nómina, pero forman parte de lo que cuesta tu puesto',
        amount: employerContributionsAnnual,
      },
      'worker-contributions': {
        label: 'Cotizaciones tuyas',
        detail: 'La parte de la cotización que sí se descuenta de tu nómina',
        amount: workerContributionsAnnual,
      },
      irpf: {
        label: 'IRPF',
        detail: 'Retención de la nómina y resultado final de la declaración',
        amount: irpfAnnual,
      },
      vat: {
        label: 'IVA',
        detail: 'Lo pagas al gastar tu neto, ya incluido en los precios',
        amount: vatAnnual,
      },
      'special-taxes': {
        label: 'Impuestos especiales',
        detail: 'Carburante, tabaco, alcohol y electricidad, del paso de consumo',
        amount: specialTaxesAnnual,
      },
      'wealth-taxes': {
        label: 'IBI e IVTM',
        detail: 'Tu casa y tu coche: se pagan por tenerlos, no por gastar',
        amount: wealthTaxesAnnual,
      },
    }

    return SLICE_ORDER
      .map((id) => ({
        id,
        label: amounts[id].label,
        detail: amounts[id].detail,
        amountAnnual: amounts[id].amount,
        sharePercent: laborCostAnnual > 0 ? (amounts[id].amount / laborCostAnnual) * 100 : 0,
      }))
      .filter((slice) => slice.amountAnnual > 0)
  }, [
    employerContributionsAnnual,
    irpfAnnual,
    laborCostAnnual,
    specialTaxesAnnual,
    takeHomeAnnual,
    vatAnnual,
    wealthTaxesAnnual,
    workerContributionsAnnual,
  ])

  const divisor = period === 'month' ? 12 : 1
  const periodSuffix = period === 'month' ? 'al mes' : 'al año'
  const formatPeriodEuro = (value: number) => formatEuro(value / divisor)
  const takeHomePer100 = laborCostAnnual > 0 ? Math.round((takeHomeAnnual / laborCostAnnual) * 100) : 0
  const chartSummary = slices
    .map((slice) => `${slice.label}: ${formatPercent(slice.sharePercent)}`)
    .join('; ')

  const hasWealthTaxes = wealthTaxesAnnual > 0
  const purchaseTaxTotal = propertyPurchaseTaxTotal + vehiclePurchaseTaxTotal

  return (
    <section className="wfin" aria-labelledby="wfin-title">
      <header className="wfin-header">
        <p className="wfin-step">Paso 10 · Resumen</p>
        <h2 id="wfin-title">A dónde va el dinero que cuesta tu trabajo</h2>
        <p className="wfin-lead">
          Todo lo que has calculado, junto. Primero, cómo se reparte el coste de tu puesto entre
          lo que te llevas y cada impuesto. Después, cuánto recauda el Estado por esas mismas
          figuras y qué hace con ellas.
        </p>
      </header>

      <div className="wfin-controls">
        <div className="wfin-controls__salary">
          <SalarySlider
            id="wfin-salary"
            value={grossSalaryAnnual}
            onChange={onSalaryChange ?? (() => undefined)}
            min={14_000}
            max={500_000}
            step={1_000}
            markers={[14_000, 50_000, 120_000, 250_000, 500_000]}
            scale="log"
            unitLabel="brutos al año"
            ariaLabel="Salario bruto anual para el resumen final"
          />
        </div>

        <div className="wfin-period" role="group" aria-label="Ver las cifras al mes o al año">
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

      <div className="wfin-grid">
        <figure className="wfin-chart" aria-label={`Reparto del coste laboral. ${chartSummary}`}>
          <figcaption className="wfin-chart__title">
            <span>Reparto del coste laboral</span>
            <small>
              Coste total de tu puesto: {formatPeriodEuro(laborCostAnnual)} {periodSuffix}
            </small>
          </figcaption>

          <div className="wfin-chart__viz">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="sharePercent"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="88%"
                  paddingAngle={slices.length > 1 ? 1.5 : 0}
                  strokeWidth={2}
                  stroke="transparent"
                  // El grafico se recalcula al mover el salario: sin animacion
                  // el reparto responde al instante y no reinicia el barrido.
                  isAnimationActive={false}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.id} fill={`var(--wfin-chart-${slice.id})`} />
                  ))}
                </Pie>
                <Tooltip content={<CostTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="wfin-chart__center" aria-hidden="true">
              <strong>{takeHomePer100} €</strong>
              <span>de cada 100 € son para ti</span>
            </div>
          </div>

          <ul className="wfin-legend">
            {slices.map((slice) => (
              <li key={slice.id} className={`wfin-legend__item wfin-legend__item--${slice.id}`}>
                <span className="wfin-legend__swatch" aria-hidden="true" />
                <div className="wfin-legend__main">
                  <p className="wfin-legend__label">{slice.label}</p>
                  <p className="wfin-legend__detail">{slice.detail}</p>
                </div>
                <p className="wfin-legend__value">
                  <strong>{formatPeriodEuro(slice.amountAnnual)}</strong>
                  <span>{formatPercent(slice.sharePercent)}</span>
                </p>
              </li>
            ))}
          </ul>
        </figure>

        <div className="wfin-side">
          <article className="wfin-headline">
            <p>
              De los {formatPeriodEuro(laborCostAnnual)} {periodSuffix} que cuesta tu puesto,
              se van en impuestos y cotizaciones
            </p>
            <strong>{formatPeriodEuro(totalTaxesAnnual)}</strong>
            <span>
              {formatPercent(laborCostAnnual > 0 ? (totalTaxesAnnual / laborCostAnnual) * 100 : 0)}{' '}
              del coste laboral · te quedan {formatPeriodEuro(takeHomeAnnual)} {periodSuffix}
            </span>
          </article>

          <article className="wfin-home" aria-labelledby="wfin-home-title">
            <header className="wfin-home__header">
              <span className="wfin-home__icon" aria-hidden="true"><Home size={18} /></span>
              <h3 id="wfin-home-title">Tu casa y tu coche</h3>
            </header>

            {hasWealthTaxes || purchaseTaxTotal > 0 ? (
              <>
                <ul className="wfin-home__rows">
                  <li>
                    <span className="wfin-home__row-icon" aria-hidden="true"><Home size={15} /></span>
                    <div>
                      <p>IBI de tu vivienda</p>
                      <small>Cada año, mientras seas propietario</small>
                    </div>
                    <strong>{formatPeriodEuro(propertyTaxAnnual)}</strong>
                  </li>
                  <li>
                    <span className="wfin-home__row-icon" aria-hidden="true"><Car size={15} /></span>
                    <div>
                      <p>IVTM de tu coche</p>
                      <small>El impuesto de circulación del ayuntamiento</small>
                    </div>
                    <strong>{formatPeriodEuro(vehicleTaxAnnual)}</strong>
                  </li>
                </ul>

                <p className="wfin-home__note">
                  Son el {formatPercent(
                    laborCostAnnual > 0 ? (wealthTaxesAnnual / laborCostAnnual) * 100 : 0,
                    2,
                  )}{' '}
                  del coste de tu puesto, pero los pagas aunque ese año no ganes nada: gravan
                  lo que tienes, no lo que ingresas.
                </p>

                {purchaseTaxTotal > 0 ? (
                  <p className="wfin-home__oneoff">
                    <strong>{formatEuro(purchaseTaxTotal)}</strong> pagaste una sola vez al comprar
                    ({formatEuro(propertyPurchaseTaxTotal)} de vivienda y{' '}
                    {formatEuro(vehiclePurchaseTaxTotal)} de coche). No entra en el gráfico porque
                    no se repite cada año.
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="wfin-home__empty">
                  No has declarado vivienda ni coche en propiedad, así que el gráfico no incluye
                  IBI ni IVTM. Si los tienes, el paso 9 los añade al reparto.
                </p>
                {onGoToWealthStep ? (
                  <button type="button" className="wfin-home__cta" onClick={onGoToWealthStep}>
                    Volver al paso 9
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                ) : null}
              </>
            )}
          </article>
        </div>
      </div>

      <section className="wfin-state" aria-labelledby="wfin-state-title">
        <header className="wfin-state__header">
          <h3 id="wfin-state-title">La otra cara: qué recauda el Estado con esos impuestos</h3>
          <p>
            Cifras del conjunto de Administraciones Públicas en {REVENUE.reference_year}, en
            contabilidad nacional. El PIB de ese año fue de{' '}
            {formatMillionEuro(REVENUE.denominators.gdp_million_eur)} y los ingresos públicos
            totales, {formatMillionEuro(REVENUE.denominators.public_revenue_non_financial_million_eur)}.
          </p>
        </header>

        <ul className="wfin-state__list">
          {STATE_FIGURES.map((figure) => {
            const data = REVENUE_BY_ID.get(figure.id)
            if (!data) return null
            const revenue = data.revenue_million_eur
            const shareOfRevenue =
              (revenue / REVENUE.denominators.public_revenue_non_financial_million_eur) * 100
            const shareOfGdp = (revenue / REVENUE.denominators.gdp_million_eur) * 100

            return (
              <li className={`wfin-state__item wfin-state__item--${figure.id}`} key={figure.id}>
                <div className="wfin-state__head">
                  <h4>{figure.label}</h4>
                  <p>{figure.yours}</p>
                </div>

                <dl className="wfin-state__figures">
                  <div>
                    <dt>Recaudación</dt>
                    <dd>{formatMillionEuro(revenue)}</dd>
                  </div>
                  <div>
                    <dt>De los ingresos públicos</dt>
                    <dd>{formatPercent(shareOfRevenue)}</dd>
                  </div>
                  <div>
                    <dt>Del PIB</dt>
                    <dd>{formatPercent(shareOfGdp, 2)}</dd>
                  </div>
                </dl>

                <div className="wfin-state__lines">
                  <p className="wfin-state__line wfin-state__line--where">
                    <span className="wfin-state__line-icon" aria-hidden="true"><Landmark size={15} /></span>
                    <span>
                      <b>En qué se gasta.</b> {figure.destination}
                    </span>
                  </p>
                  <p className="wfin-state__line wfin-state__line--effect">
                    <span className="wfin-state__line-icon" aria-hidden="true"><ShieldCheck size={15} /></span>
                    <span>
                      <b>Qué efecto tiene.</b> {figure.effect}
                    </span>
                  </p>
                </div>
              </li>
            )
          })}
        </ul>

        <p className="wfin-state__source">
          Fuente: IGAE, «Impuestos y cotizaciones sociales de las Administraciones públicas»
          (SEC 2010, {REVENUE.reference_year} provisional), y serie BDMACRO de PIB y gasto
          público. Las seis figuras no suman el total de ingresos: quedan fuera Sociedades,
          sucesiones, plusvalía municipal, tasas y transferencias.
        </p>
      </section>

      <footer className="wfin-footer">
        <p>
          El reparto es una estimación construida con tus datos: la nómina real cambia según
          contrato, situación personal y comunidad autónoma, y el IVA depende de cómo gastes.
        </p>
        {onContinue ? (
          <button type="button" className="wfin-footer__cta" onClick={onContinue}>
            Ver fuentes del cálculo
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : null}
      </footer>
    </section>
  )
}

export default WorkerFinalSummaryCard
