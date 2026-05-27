import {
  Info,
  Lightbulb,
} from 'lucide-react'
import {
  SALARY_FOOTER_NOTES,
  SALARY_HEADER_ICON,
  SALARY_INTERPRETATION_POINTS,
  SALARY_KPIS,
  SALARY_NATIONALITY_DATA,
  SALARY_PANEL_MAX,
  SALARY_PANEL_TOTAL,
  SALARY_SOURCE_ICON,
} from '../data/salaryNationalityDashboardData'
import './SalaryNationalityDashboard.css'

const formatEuro = (value: number): string =>
  `${Math.round(value).toLocaleString('es-ES')} €`

function SalaryHeader() {
  const HeaderIcon = SALARY_HEADER_ICON
  return (
    <header className="snd__header">
      <div className="snd__title-block">
        <div className="snd__brand-icon" aria-hidden="true">
          <HeaderIcon size={34} strokeWidth={1.7} />
        </div>
        <div>
          <h1>Salario medio mensual por nacionalidad</h1>
          <p>
            <strong>España</strong>
            <span aria-hidden="true">·</span>
            INE EAES 2023 · salario medio bruto anual convertido a mensual
          </p>
        </div>
      </div>

      <aside className="snd__info-note" aria-label="Nota metodológica">
        <Info size={26} strokeWidth={1.9} aria-hidden="true" />
        <p>
          Importes calculados a partir del salario medio bruto anual de la
          Encuesta Anual de Estructura Salarial del INE, dividido entre 12 meses.
          La variable es nacionalidad, no país de nacimiento.
        </p>
      </aside>
    </header>
  )
}

function IconBubble({ item }: { item: (typeof SALARY_NATIONALITY_DATA)[number] }) {
  const Icon = item.icon
  return (
    <span className="snd-icon-bubble" style={{ '--row-accent': item.accent } as React.CSSProperties}>
      <Icon size={21} strokeWidth={1.75} aria-hidden="true" />
    </span>
  )
}

function HorizontalBars() {
  const maxValue = Math.max(...SALARY_NATIONALITY_DATA.map((item) => item.value))

  return (
    <section className="snd-panel snd-panel--bars" aria-labelledby="salary-bars-title">
      <div className="snd-panel__header">
        <h2 id="salary-bars-title">Salario medio mensual por nacionalidad</h2>
        <p>€ brutos mensuales · España · INE EAES 2023</p>
      </div>

      <div className="snd-bars" role="list">
        {SALARY_NATIONALITY_DATA.map((item) => {
          const width = `${(item.value / maxValue) * 100}%`
          return (
            <div className="snd-bars__row" role="listitem" key={item.id}>
              <div className="snd-bars__label">
                <IconBubble item={item} />
                <span className={item.id === 'spanish' ? 'snd-bars__name snd-bars__name--highlight' : 'snd-bars__name'}>
                  {item.label}
                </span>
              </div>
              <div className="snd-bars__track" aria-hidden="true">
                <span className="snd-bars__fill" style={{ width }} />
              </div>
              <strong>{formatEuro(item.value)}</strong>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function LineComparison() {
  const chartWidth = 480
  const chartHeight = 330
  const padding = { top: 28, right: 18, bottom: 44, left: 72 }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom
  const yMax = 2800
  const yTicks = [0, 400, 800, 1200, 1600, 2000, 2400, 2800]

  const points = SALARY_NATIONALITY_DATA.map((item, index) => {
    const x = padding.left + (plotWidth / (SALARY_NATIONALITY_DATA.length - 1)) * index
    const y = padding.top + plotHeight - (item.value / yMax) * plotHeight
    return { x, y, item, index }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  const areaPath = `${linePath} L ${points.at(-1)?.x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`

  return (
    <section className="snd-panel snd-panel--line" aria-labelledby="salary-line-title">
      <div className="snd-panel__header">
        <h2 id="salary-line-title">Comparativa salarial ordenada</h2>
        <p>€ brutos mensuales</p>
      </div>

      <svg className="snd-line-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Gráfico de línea con salarios ordenados de mayor a menor">
        <defs>
          <linearGradient id="salaryArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#16e7ff" stopOpacity="0.54" />
            <stop offset="100%" stopColor="#0c6a88" stopOpacity="0.06" />
          </linearGradient>
          <filter id="salaryGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {yTicks.map((tick) => {
          const y = padding.top + plotHeight - (tick / yMax) * plotHeight
          return (
            <g key={tick}>
              <line x1={padding.left} x2={padding.left + plotWidth} y1={y} y2={y} className="snd-line-chart__grid" />
              <text x={padding.left - 18} y={y + 5} textAnchor="end" className="snd-line-chart__axis">
                {tick.toLocaleString('es-ES')} €
              </text>
            </g>
          )
        })}

        <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} className="snd-line-chart__axis-line" />
        <line x1={padding.left} x2={padding.left + plotWidth} y1={padding.top + plotHeight} y2={padding.top + plotHeight} className="snd-line-chart__axis-line" />
        <path d={areaPath} fill="url(#salaryArea)" />
        <path d={linePath} className="snd-line-chart__line" filter="url(#salaryGlow)" />

        {points.map((point) => (
          <g key={point.item.id}>
            <circle cx={point.x} cy={point.y} r="6" className="snd-line-chart__dot-halo" />
            <circle cx={point.x} cy={point.y} r="4" className="snd-line-chart__dot" />
            <text x={point.x} y={padding.top + plotHeight + 26} textAnchor="middle" className="snd-line-chart__axis">
              {point.index + 1}
            </text>
          </g>
        ))}

        <path d={`M ${points[0].x + 6} ${points[0].y - 6} L ${points[0].x + 40} ${points[0].y - 36}`} className="snd-line-chart__callout-line" />
        <foreignObject x={points[0].x + 18} y={points[0].y - 52} width="150" height="64">
          <div className="snd-line-chart__callout">
            <span>Máximo observado</span>
            <strong>{formatEuro(SALARY_PANEL_MAX.value)}</strong>
          </div>
        </foreignObject>

        <text x={padding.left + plotWidth / 2} y={chartHeight - 8} textAnchor="middle" className="snd-line-chart__label">
          Grupos de nacionalidad
        </text>
      </svg>
    </section>
  )
}

function InterpretationPanel() {
  return (
    <section className="snd-panel snd-panel--interpretation" aria-labelledby="salary-interpretation-title">
      <div className="snd-panel__title-row">
        <Lightbulb size={28} strokeWidth={1.65} aria-hidden="true" />
        <h2 id="salary-interpretation-title">Interpretación</h2>
      </div>
      <ul className="snd-interpretation">
        {SALARY_INTERPRETATION_POINTS.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  )
}

function RankingPanel() {
  const maxValue = SALARY_NATIONALITY_DATA[0].value

  return (
    <section className="snd-panel snd-panel--ranking" aria-labelledby="salary-ranking-title">
      <h2 id="salary-ranking-title">Ranking por nacionalidad</h2>
      <div className="snd-ranking" role="table" aria-label="Ranking por nacionalidad">
        {SALARY_NATIONALITY_DATA.map((item, index) => (
          <div className="snd-ranking__row" role="row" key={item.id}>
            <span className="snd-ranking__position" role="cell">{index + 1}</span>
            <IconBubble item={item} />
            <span className="snd-ranking__group" role="cell">{item.label}</span>
            <span className="snd-ranking__mini" aria-hidden="true">
              <span style={{ width: `${(item.value / maxValue) * 100}%` }} />
            </span>
            <strong role="cell">{formatEuro(item.value)}</strong>
            <span className="snd-ranking__share" role="cell">
              {item.share.toLocaleString('es-ES', { minimumFractionDigits: 1 })}%
            </span>
          </div>
        ))}
      </div>
      <div className="snd-ranking__total">
        <span>Total panel</span>
        <strong>{formatEuro(SALARY_PANEL_TOTAL)}</strong>
        <span>100%</span>
      </div>
    </section>
  )
}

function KpiStrip() {
  return (
    <section className="snd-kpis" aria-label="Indicadores destacados">
      {SALARY_KPIS.map((kpi) => {
        const Icon = kpi.icon
        return (
          <article className={`snd-kpi snd-kpi--${kpi.tone}`} key={kpi.id}>
            <Icon size={42} strokeWidth={1.55} aria-hidden="true" />
            <div className="snd-kpi__copy">
              <h3>{kpi.label}</h3>
              <strong>{kpi.value}</strong>
              {kpi.detail ? <p>{kpi.detail}</p> : null}
            </div>
          </article>
        )
      })}
    </section>
  )
}

function FooterBar() {
  const SourceIcon = SALARY_SOURCE_ICON
  return (
    <footer className="snd-footer">
      <SourceIcon size={19} strokeWidth={1.8} aria-hidden="true" />
      {SALARY_FOOTER_NOTES.map((note) => (
        <span key={note}>{note}</span>
      ))}
    </footer>
  )
}

export function SalaryNationalityDashboard() {
  return (
    <main className="snd-page">
      <div className="snd" aria-label="Dashboard de salario medio mensual por nacionalidad">
        <SalaryHeader />

        <div className="snd__grid">
          <HorizontalBars />
          <LineComparison />
          <div className="snd__right-stack">
            <InterpretationPanel />
            <RankingPanel />
          </div>
        </div>

        <KpiStrip />
        <FooterBar />
      </div>
    </main>
  )
}

export default SalaryNationalityDashboard
