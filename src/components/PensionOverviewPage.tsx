import React from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Gauge,
  HeartPulse,
  Home,
  Info,
  Landmark,
  LineChart,
  MessageSquare,
  Scale,
  Settings2,
  ShieldQuestion,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { DashboardPanel } from './DashboardPanel'
import { InfoButton } from './InfoButton'
import { KeyIndicatorsPanel } from './KeyIndicatorsPanel'
import type { IndicatorItem } from './KeyIndicatorsPanel'
import { PopulationPyramid } from './PopulationPyramid'
import { ReformSimulator } from './ReformSimulator'
import { Sidebar } from './Sidebar'
import { TimeSeriesChart } from './TimeSeriesChart'
import type { ChartMilestone, ChartSeries } from './TimeSeriesChart'
import { YearSelector } from './YearSelector'
import {
  POPULATION_SCALE_MAX,
  POPULATION_YEAR_RANGE,
  POPULATION_YEAR_SUMMARIES,
} from '../data/populationPyramidData'
import './PensionOverviewPage.css'

const CHART_YEARS = [
  '1950', '1955', '1960', '1965', '1970', '1975', '1980', '1985',
  '1990', '1995', '2000', '2005', '2010', '2015', '2020', '2025',
  '2030', '2035', '2040', '2045', '2050', '2055', '2060', '2065', '2070',
]

const HISTORY_SERIES: ChartSeries[] = [
  {
    name: 'Ingresos por cotizaciones',
    values: [3, 5, 8, 12, 18, 28, 44, 61, 74, 82, 88, 102, 116, 128, 137, 148, 166, 185, 203, 217, 228, 236, 242, 246, 250],
    unit: 'Miles de millones de euros',
    axis: 'left',
    kind: 'mixed',
    projectionFrom: 15,
  },
  {
    name: 'Gasto en pensiones',
    values: [2, 4, 7, 11, 19, 34, 55, 78, 102, 129, 151, 166, 181, 197, 215, 228, 246, 271, 301, 331, 356, 379, 398, 413, 429],
    unit: 'Miles de millones de euros',
    axis: 'left',
    kind: 'mixed',
    projectionFrom: 15,
  },
  {
    name: 'Deficit del sistema',
    values: [1, 1, 1, 1, -1, -6, -11, -17, -28, -47, -63, -64, -65, -69, -78, -80, -80, -86, -98, -114, -128, -143, -156, -167, -179],
    unit: 'Miles de millones de euros',
    axis: 'left',
    kind: 'mixed',
    projectionFrom: 15,
  },
  {
    name: 'Gasto pensiones / PIB',
    values: [2.1, 2.3, 2.6, 3.2, 4.4, 5.9, 7.2, 8.1, 9.4, 10.3, 10.1, 9.8, 10.4, 11.2, 12.4, 12.6, 13.1, 14.2, 15.4, 16.2, 16.8, 17.1, 17.3, 17.2, 17.1],
    unit: '% del PIB',
    axis: 'right',
    kind: 'mixed',
    projectionFrom: 15,
  },
]

const HISTORY_MILESTONES: ChartMilestone[] = [
  { index: 15, label: '2025' },
]

const comparisonPoints = [
  { year: '2025', base: 18.4, scenario: 18.0 },
  { year: '2035', base: 15.2, scenario: 12.7 },
  { year: '2045', base: 13.1, scenario: 9.2 },
  { year: '2055', base: 15.8, scenario: 7.6 },
  { year: '2065', base: 17.1, scenario: 6.6 },
  { year: '2070', base: 17.5, scenario: 5.9 },
]

const winnersLosers = [
  { label: 'Jovenes actuales', value: 3.2, tone: 'good' },
  { label: 'Trabajadores 30-50 anos', value: 1.8, tone: 'good' },
  { label: 'Nuevos jubilados', value: -0.4, tone: 'bad' },
  { label: 'Jubilados actuales', value: -2.1, tone: 'bad' },
  { label: 'Rentas bajas', value: 2.3, tone: 'good' },
  { label: 'Rentas altas', value: -1.0, tone: 'bad' },
] as const

function iconNode(Icon: LucideIcon) {
  return <Icon size={18} strokeWidth={1.8} />
}

function MiniLogo() {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="15" stroke="#2d6cff" strokeWidth="5" />
      <path d="M8 28 28 8" stroke="#f5b94b" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function DashboardIcon({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'red' | 'amber' | 'purple' }) {
  return <span className={`pov-metric-icon pov-metric-icon--${tone}`}>{children}</span>
}

const makeIndicators = (year: number): IndicatorItem[] => [
  {
    label: 'Ingresos por cotizaciones',
    value: year <= 2025 ? '129.408 MEUR' : '148.000 MEUR',
    icon: <DashboardIcon tone="green"><TrendingUp size={23} /></DashboardIcon>,
    secondary: year <= 2025 ? 'Dato de maqueta' : 'Escenario demo',
    secondaryColor: '#36d9e0',
  },
  {
    label: 'Gasto en pensiones',
    value: year <= 2025 ? '190.607 MEUR' : '228.000 MEUR',
    icon: <DashboardIcon tone="red"><Landmark size={23} /></DashboardIcon>,
    secondary: year <= 2025 ? '12,6% del PIB' : '12,9% del PIB',
    secondaryColor: '#e86060',
  },
  {
    label: 'Deficit del sistema',
    value: year <= 2025 ? '-61.199 MEUR' : '-80.000 MEUR',
    icon: <DashboardIcon tone="red"><Scale size={23} /></DashboardIcon>,
    secondary: year <= 2025 ? '-4,1% del PIB' : 'Escenario base',
    secondaryColor: '#e86060',
  },
  {
    label: 'Deuda publica',
    value: '1.593.623 MEUR',
    icon: <DashboardIcon tone="amber"><FileText size={23} /></DashboardIcon>,
    secondary: '105,4% del PIB',
    secondaryColor: '#d4a017',
  },
  {
    label: 'Gasto pensiones / Presupuesto',
    value: '43,2%',
    icon: <DashboardIcon tone="purple"><Gauge size={23} /></DashboardIcon>,
    note: 'Orden de magnitud',
    noteColor: '#b370ea',
  },
  {
    label: 'Relacion cotizantes / pensionistas',
    value: year <= 2025 ? '2,15' : '1,92',
    icon: <DashboardIcon tone="blue"><Users size={23} /></DashboardIcon>,
    note: 'Afiliaciones por pensionista',
    noteColor: '#5b95f2',
  },
  {
    label: 'Hucha de las pensiones',
    value: '6.815 MEUR',
    icon: <DashboardIcon tone="amber"><CircleDollarSign size={23} /></DashboardIcon>,
    secondary: '0,4% del PIB',
    secondaryColor: '#d4a017',
  },
  {
    label: 'Edad efectiva de jubilacion',
    value: '64,2 anos',
    icon: <DashboardIcon tone="blue"><CalendarDays size={23} /></DashboardIcon>,
    note: 'Edad legal: 66,0',
    noteColor: '#5b95f2',
  },
  {
    label: 'Esperanza de vida (65 anos)',
    value: '22,6 anos',
    icon: <DashboardIcon tone="red"><HeartPulse size={23} /></DashboardIcon>,
    note: 'Total poblacion',
    noteColor: '#e86060',
  },
  {
    label: 'Tasa de reemplazo',
    value: '78,3%',
    icon: <DashboardIcon tone="purple"><TrendingDown size={23} /></DashboardIcon>,
    note: 'Pension inicial / ultimo salario',
    noteColor: '#b370ea',
  },
]

function TopAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button type="button" className="pov-top-action">
      {icon}
      <span>{label}</span>
    </button>
  )
}

function ImpactMiniChart() {
  const max = 20
  const width = 270
  const height = 118
  const x = (i: number) => 10 + (i / (comparisonPoints.length - 1)) * (width - 20)
  const y = (value: number) => 10 + (1 - value / max) * (height - 28)
  const path = (key: 'base' | 'scenario') =>
    comparisonPoints.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(point[key])}`).join(' ')

  return (
    <div className="pov-mini-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Comparacion de escenario base y escenario reformado">
        {[5, 10, 15, 20].map((tick) => (
          <g key={tick}>
            <line x1="10" x2={width - 10} y1={y(tick)} y2={y(tick)} />
            <text x="0" y={y(tick) + 3}>{tick}%</text>
          </g>
        ))}
        <path d={path('base')} className="pov-mini-chart__line pov-mini-chart__line--base" />
        <path d={path('scenario')} className="pov-mini-chart__line pov-mini-chart__line--scenario" />
        {comparisonPoints.map((point, index) => (
          <text key={point.year} x={x(index)} y={height - 4} className="pov-mini-chart__year">
            {point.year}
          </text>
        ))}
      </svg>
      <div className="pov-mini-legend" aria-hidden="true">
        <span><i className="pov-swatch pov-swatch--base" /> Escenario base</span>
        <span><i className="pov-swatch pov-swatch--scenario" /> Tu escenario</span>
      </div>
    </div>
  )
}

function WinnersLosers() {
  return (
    <ul className="pov-impact-list" aria-label="Impacto por grupos">
      {winnersLosers.map((item) => (
        <li key={item.label} className="pov-impact-row">
          <span className="pov-impact-row__label">{item.label}</span>
          <span className="pov-impact-row__bar" aria-hidden="true">
            <span
              className={`pov-impact-row__fill pov-impact-row__fill--${item.tone}`}
              style={{ width: `${Math.min(100, Math.abs(item.value) * 28)}%` }}
            />
          </span>
          <strong className={`pov-impact-row__value pov-impact-row__value--${item.tone}`}>
            {item.value > 0 ? '+' : ''}{item.value.toLocaleString('es-ES', { minimumFractionDigits: 1 })}%
          </strong>
        </li>
      ))}
    </ul>
  )
}

export function PensionOverviewPage() {
  const [year, setYear] = React.useState(2025)

  const currentSummary = React.useMemo(
    () => POPULATION_YEAR_SUMMARIES.find((summary) => summary.year === year)
      ?? POPULATION_YEAR_SUMMARIES.find((summary) => summary.year === 2025)
      ?? POPULATION_YEAR_SUMMARIES[0],
    [year],
  )

  const indicators = React.useMemo(() => makeIndicators(year), [year])

  return (
    <div className="pov-shell">
      <Sidebar
        className="pov-sidebar"
        brand={{
          title: 'Pensiones',
          subtitle: 'en Espana',
          icon: <MiniLogo />,
        }}
        menu={[
          { id: 'summary', label: 'Resumen', icon: iconNode(Home), active: true, href: '/resumen' },
          { id: 'timeline', label: 'Linea temporal', icon: iconNode(LineChart), href: '#evolucion' },
          { id: 'simulator', label: 'Simulador', icon: iconNode(Settings2), href: '#simulador' },
          { id: 'scenarios', label: 'Escenarios', icon: iconNode(Gauge), href: '#escenarios' },
          { id: 'impact', label: 'Quien gana / pierde', icon: iconNode(Scale), href: '#impacto' },
          { id: 'compare', label: 'Comparador', icon: iconNode(BarChart3), href: '#comparador' },
          { id: 'forum', label: 'Foro de propuestas', icon: iconNode(MessageSquare), href: '#foro' },
          { id: 'method', label: 'Metodologia', icon: iconNode(BookOpen), href: '#metodologia' },
        ]}
        infoCard={{
          title: 'Prototipo',
          body: 'Vista de resumen para integrar componentes y probar narrativa antes de fijar cifras editoriales.',
        }}
        ctaLabel="Revisar fuentes"
        footerText="Aviso legal · Privacidad"
      />

      <main className="pov-main">
        <header className="pov-header">
          <div>
            <h1>El futuro de nuestras pensiones, en tus decisiones</h1>
            <p>Explora, comprende y simula el sistema publico de pensiones espanol.</p>
          </div>
          <div className="pov-actions" aria-label="Acciones superiores">
            <TopAction icon={<ShieldQuestion size={16} />} label="Metodologia" />
            <TopAction icon={<FileText size={16} />} label="Fuentes de datos" />
            <TopAction icon={<MessageSquare size={16} />} label="Foro" />
          </div>
        </header>

        <section className="pov-year-band" aria-label="Selector de ano">
          <YearSelector
            year={year}
            onYearChange={setYear}
            minYear={POPULATION_YEAR_RANGE.min}
            maxYear={2070}
            marks={[1950, 1975, 2000, 2025, 2050, 2070]}
            playIntervalMs={160}
          />
          <button type="button" className="pov-year-jump">
            Ir al ano
            <CalendarDays size={16} />
          </button>
        </section>

        <div className="pov-grid">
          <section className="pov-center">
            <div className="pov-top-grid">
              <DashboardPanel
                className="pov-pyramid-panel"
                title={
                  <span className="pov-panel-title">
                    Piramide poblacional de Espana
                    <InfoButton label="Informacion sobre la piramide" size="sm">
                      <p>
                        La piramide usa el componente existente y cambia con el selector de ano.
                        Las capas por lugar de nacimiento deben tratarse segun su metadata.
                      </p>
                    </InfoButton>
                  </span>
                }
                subtitle="Poblacion por edad, sexo y nacimiento"
                footer={
                  <p className="pov-panel-source">
                    Fuente: INE. Vista de prototipo; revisar metadata antes de uso editorial.
                  </p>
                }
              >
                {currentSummary && (
                  <PopulationPyramid
                    className="pov-pyramid-visual"
                    data={currentSummary.data}
                    scaleMax={POPULATION_SCALE_MAX}
                    legendVariant={currentSummary.hasBirthplaceBreakdown ? 'birthplace' : 'sex'}
                    title={`Piramide poblacional de Espana, ${year}`}
                    subtitle="Poblacion en miles"
                  />
                )}
              </DashboardPanel>

              <KeyIndicatorsPanel
                className="pov-indicators"
                title={`Indicadores clave (${year})`}
                indicators={indicators}
                ctaLabel="Ver todos los indicadores"
              />
            </div>

            <section id="evolucion" className="pov-history">
              <TimeSeriesChart
                title="Evolucion historica de indicadores clave"
                infoLabel="Informacion sobre la evolucion historica"
                categories={CHART_YEARS}
                series={HISTORY_SERIES}
                milestones={HISTORY_MILESTONES}
                footnote="Fuente: Seguridad Social, AIReF, Banco de Espana, INE, IGAE. Series de prototipo para diseno."
                variant="dark"
              />
            </section>
          </section>

          <aside className="pov-right-rail">
            <div id="simulador" className="pov-simulator-wrap">
              <ReformSimulator />
            </div>

            <div id="comparador">
              <DashboardPanel
                className="pov-side-panel"
                title="Comparar con escenario base"
                headerAside="% PIB"
              >
                <ImpactMiniChart />
                <button type="button" className="pov-secondary-button">
                  Ir al comparador completo <ArrowRight size={15} />
                </button>
              </DashboardPanel>
            </div>

            <div id="impacto">
              <DashboardPanel
                className="pov-side-panel"
                title="Quien gana y quien pierde"
                subtitle="Impacto acumulado 2025-2070 vs. escenario base"
                info={<p>Comparacion visual de prototipo para validar el modulo de impacto.</p>}
                infoLabel="Informacion sobre impactos distributivos"
              >
                <WinnersLosers />
                <button type="button" className="pov-secondary-button">
                  Ver analisis detallado <Info size={15} />
                </button>
              </DashboardPanel>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default PensionOverviewPage
