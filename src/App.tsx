import React from 'react'
import './App.css'
import { InfoButton } from './components/ui/InfoButton'
import { POPULATION_PYRAMID_INFO, PopulationPyramid } from './components/population/PopulationPyramid'
import { TimeSeriesChart } from './components/charts/TimeSeriesChart'
import type { ChartSeries, ChartMilestone } from './components/charts/TimeSeriesChart'
import { KeyIndicatorsPanel } from './components/pension-overview/KeyIndicatorsPanel'
import type { IndicatorItem } from './components/pension-overview/KeyIndicatorsPanel'
import { YearSelector } from './components/ui/YearSelector'
import { SalarySlider } from './components/ui/SalarySlider'
import { ReformSimulator } from './components/pension-overview/ReformSimulator'
import { HealthExpenditureDashboard } from './components/health-expenditure/HealthExpenditureDashboard'
import { SalaryNationalityDashboard } from './components/salary-nationality/SalaryNationalityDashboard'
import { FiscalKpiRow, FiscalWorkerDashboard, ProgressiveIrpfExplainer, SocialSecurityBasesExplainer } from './components/fiscal-worker-dashboard'
import { estimateVatFromNetSalary } from './components/fiscal-worker-dashboard/vatEpFProxy'
import { FiscalPersonalDataCard } from './components/fiscal-worker-dashboard/FiscalPersonalDataCard'
import { WorkerCalculationSourcesCard, WorkerConsumptionTaxesCard, WorkerContributionLimitsCard, WorkerFiscalStepsCard, WorkerFiscalSummaryCard, WorkerIrpfTranchesCard, WorkerPersonalReductionsCard, WorkerSalaryBaseCard, WorkerSocialContributionsCard } from './components/worker-salary-dashboard'
import type { DisabilityMode } from './components/fiscal-worker-dashboard/types'
import { PensionOverviewPage } from './components/pension-overview/PensionOverviewPage'
import { IndicatorInfoModal } from './components/pension-overview/IndicatorInfoModal'
import {
  POPULATION_SCALE_MAX,
  POPULATION_YEAR_RANGE,
  POPULATION_YEAR_SUMMARIES,
} from './data/populationPyramidData'

type PlayButtonProps = {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'ghost'
  disabled?: boolean
  onClick?: () => void
}

function PlayButton({
  label = 'Reproducir',
  size = 'md',
  variant = 'solid',
  disabled = false,
  onClick,
}: PlayButtonProps) {
  return (
    <button
      type="button"
      className={`play-button play-button--${size} play-button--${variant}`}
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
    >
      <span className="play-button__icon" aria-hidden="true"></span>
      <span className="play-button__label">{label}</span>
    </button>
  )
}

function WorkerContributionLimitsShowcase() {
  const [userBaseAnnual, setUserBaseAnnual] = React.useState(37_500)

  return (
    <WorkerContributionLimitsCard
      userBaseAnnual={userBaseAnnual}
      onUserBaseAnnualChange={setUserBaseAnnual}
    />
  )
}

function WorkerFiscalSummaryShowcase() {
  const [salary, setSalary] = React.useState(35_000)
  const salaryFactor = salary / 35_000
  const workerContributionsAnnual = 2_270 * salaryFactor
  const irpfAnnual = 4_350 * salaryFactor
  const netBeforeConsumption = salary - workerContributionsAnnual - irpfAnnual
  const vatAnnual = estimateVatFromNetSalary(netBeforeConsumption).vatAnnual

  return (
    <WorkerFiscalSummaryCard
      grossSalaryAnnual={salary}
      employerContributionsAnnual={10_700 * salaryFactor}
      workerContributionsAnnual={workerContributionsAnnual}
      irpfAnnual={irpfAnnual}
      vatAnnual={vatAnnual}
      onSalaryChange={setSalary}
    />
  )
}

function SalarySliderShowcase() {
  const [linearValue, setLinearValue] = React.useState(35000)
  const [logValue, setLogValue] = React.useState(35000)

  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 520 }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <span style={{ color: '#c1c9df', fontWeight: 820 }}>Escala lineal (14.000 - 120.000 €)</span>
        <SalarySlider
          value={linearValue}
          onChange={setLinearValue}
          min={14000}
          max={120000}
          step={500}
          markers={[14000, 35000, 60000, 90000, 120000]}
          unitLabel="brutos al año"
          ariaLabel="Salario escala lineal"
        />
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        <span style={{ color: '#c1c9df', fontWeight: 820 }}>
          Escala logaritmica (14.000 - 500.000 €, sube mas rapido arriba)
        </span>
        <SalarySlider
          value={logValue}
          onChange={setLogValue}
          min={14000}
          max={500000}
          markers={[14000, 50000, 120000, 250000, 500000]}
          scale="log"
          unitLabel="brutos al año"
          ariaLabel="Salario escala logaritmica"
        />
      </div>
    </div>
  )
}

// ─── Demo data for TimeSeriesChart (Componente 04) ────────────────────────────

const CHART_CATEGORIES: string[] = [
  '2000','2001','2002','2003','2004','2005','2006','2007','2008','2009',
  '2010','2011','2012','2013','2014','2015','2016','2017','2018','2019',
  '2020','2021','2022','2023','2024',
  '2025','2026','2027','2028','2029','2030',
  '2035','2040','2045','2050','2055','2060','2065','2070',
]

const CHART_SERIES: ChartSeries[] = [
  {
    name: 'Gasto en pensiones',
    values: [
      8.4,8.5,8.6,8.7,8.6,8.5,8.2,8.0,8.5,9.5,
      10.1,10.3,10.7,11.0,11.2,11.1,11.0,10.9,10.9,11.2,
      12.5,12.2,11.8,11.9,12.1,
      12.3,12.5,12.7,12.9,13.1,13.3,
      14.2,15.3,16.1,16.8,17.2,17.5,17.3,17.1,
    ],
    unit: '% PIB',
    axis: 'left',
    kind: 'mixed',
    projectionFrom: 24,
  },
  {
    name: 'Ratio afiliados / pensionistas',
    values: [
      3.21,3.28,3.32,3.35,3.40,3.48,3.52,3.58,3.50,3.12,
      2.98,2.92,2.71,2.62,2.55,2.60,2.63,2.68,2.74,2.73,
      2.54,2.62,2.72,2.74,2.72,
      2.68,2.65,2.60,2.55,2.50,2.42,
      2.20,1.95,1.78,1.65,1.58,1.52,1.50,1.49,
    ],
    unit: 'ratio',
    axis: 'right',
    kind: 'mixed',
    projectionFrom: 24,
  },
]

const CHART_MILESTONES: ChartMilestone[] = [
  { index: 11, label: 'Reforma 2011' },
  { index: 13, label: 'Factor sostenibilidad' },
  { index: 21, label: 'Acuerdo Toledo' },
  { index: 24, label: 'Inicio proyección' },
]

// ─── Shared SVG wrapper for demo icons ───────────────────────────────────────

function Ico({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" width={32} height={32} aria-hidden="true">
      {children}
    </svg>
  )
}

// ─── Demo data for KeyIndicatorsPanel (Componente 05) ─────────────────────────

const INDICATORS_2025: IndicatorItem[] = [
  {
    label: 'Ingresos por cotizaciones',
    value: '129.408 M€',
    icon: (
      <Ico>
        <rect x={4} y={20} width={5} height={8} rx={1} fill="#36d9e0" opacity={0.55} />
        <rect x={11} y={14} width={5} height={14} rx={1} fill="#36d9e0" opacity={0.75} />
        <rect x={18} y={8} width={5} height={20} rx={1} fill="#36d9e0" />
        <polyline points="6,19 14,13 21,7 27,3" stroke="#36d9e0" strokeWidth={2} strokeLinecap="round" fill="none" />
        <circle cx={27} cy={3} r={2} fill="#36d9e0" />
      </Ico>
    ),
    secondary: '1,1% del PIB',
    secondaryColor: '#36d9e0',
  },
  {
    label: 'Gasto en pensiones',
    value: '190.607 M€',
    icon: (
      <Ico>
        <polygon points="4,13 16,4 28,13" stroke="#e86060" strokeWidth={1.5} fill="none" />
        <rect x={7}  y={14} width={2.5} height={11} rx={0.5} fill="#e86060" />
        <rect x={12} y={14} width={2.5} height={11} rx={0.5} fill="#e86060" />
        <rect x={17} y={14} width={2.5} height={11} rx={0.5} fill="#e86060" />
        <rect x={22} y={14} width={2.5} height={11} rx={0.5} fill="#e86060" />
        <rect x={4}  y={25} width={24} height={2.5} rx={0.5} fill="#e86060" />
      </Ico>
    ),
    secondary: '12,6% del PIB',
    secondaryColor: '#e86060',
  },
  {
    label: 'Déficit del sistema',
    value: '-61.199 M€',
    icon: (
      <Ico>
        <line x1={16} y1={5}  x2={16} y2={27} stroke="#e86060" strokeWidth={1.5} />
        <line x1={5}  y1={12} x2={27} y2={12} stroke="#e86060" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={5}  y1={12} x2={7}  y2={20} stroke="#e86060" strokeWidth={1} />
        <line x1={12} y1={12} x2={10} y2={20} stroke="#e86060" strokeWidth={1} />
        <path d="M4,20 Q8,23.5 12,20"   stroke="#e86060" strokeWidth={1.5} fill="none" />
        <line x1={20} y1={12} x2={22} y2={20} stroke="#e86060" strokeWidth={1} />
        <line x1={27} y1={12} x2={25} y2={20} stroke="#e86060" strokeWidth={1} />
        <path d="M20,20 Q24,23.5 28,20" stroke="#e86060" strokeWidth={1.5} fill="none" />
        <circle cx={16} cy={8} r={2} stroke="#e86060" strokeWidth={1.5} />
        <line x1={13} y1={27} x2={19} y2={27} stroke="#e86060" strokeWidth={1.5} strokeLinecap="round" />
      </Ico>
    ),
    secondary: '-4,1% del PIB',
    secondaryColor: '#e86060',
  },
  {
    label: 'Deuda pública',
    value: '1.593.623 M€',
    icon: (
      <Ico>
        <rect x={7} y={4} width={18} height={24} rx={2} stroke="#d4a017" strokeWidth={1.5} />
        <rect x={10} y={6.5} width={4} height={4} rx={0.5} fill="#d4a017" opacity={0.5} />
        <line x1={10} y1={14} x2={22} y2={14} stroke="#d4a017" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={10} y1={18} x2={22} y2={18} stroke="#d4a017" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={10} y1={22} x2={18} y2={22} stroke="#d4a017" strokeWidth={1.5} strokeLinecap="round" />
      </Ico>
    ),
    secondary: '105,4% del PIB',
    secondaryColor: '#d4a017',
  },
  {
    label: 'Gasto en pensiones / Presupuesto del Estado',
    value: '43,2%',
    icon: (
      <Ico>
        <circle cx={16} cy={16} r={11} stroke="#7b5eab" strokeWidth={2.5} opacity={0.25} />
        <circle cx={16} cy={16} r={11} stroke="#7b5eab" strokeWidth={2.5}
          strokeDasharray="31 38" strokeDashoffset={0} strokeLinecap="round" />
        <text x={16} y={20} textAnchor="middle" fontSize={10} fontWeight={700}
          fill="#7b5eab" fontFamily="system-ui, sans-serif">%</text>
      </Ico>
    ),
  },
  {
    label: 'Relación cotizantes / pensionistas',
    value: '2,15',
    icon: (
      <Ico>
        <circle cx={11} cy={10} r={3.5} stroke="#36d9e0" strokeWidth={1.5} />
        <path d="M4,26 Q6,18 11,18 Q16,18 18,26" stroke="#36d9e0" strokeWidth={1.5} fill="none" />
        <circle cx={21} cy={9} r={3} stroke="#36d9e0" strokeWidth={1.5} opacity={0.6} />
        <path d="M15,26 Q17,19 21,19 Q25,19 27,26" stroke="#36d9e0" strokeWidth={1.5} fill="none" opacity={0.6} />
      </Ico>
    ),
  },
  {
    label: 'Hucha de las pensiones',
    value: '6.815 M€',
    icon: (
      <Ico>
        <rect x={4} y={9} width={24} height={17} rx={2} stroke="#d4a017" strokeWidth={1.5} />
        <polyline points="4,9 16,18 28,9"
          stroke="#d4a017" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={16} cy={21.5} r={2} fill="#d4a017" opacity={0.6} />
      </Ico>
    ),
    secondary: '0,4% del PIB',
    secondaryColor: '#d4a017',
  },
  {
    label: 'Edad efectiva de jubilación',
    value: '64,2 años',
    icon: (
      <Ico>
        <circle cx={16} cy={16} r={12} stroke="#5b95f2" strokeWidth={1.5} />
        <line x1={16} y1={16} x2={16} y2={8}  stroke="#5b95f2" strokeWidth={2} strokeLinecap="round" />
        <line x1={16} y1={16} x2={22} y2={19} stroke="#5b95f2" strokeWidth={2} strokeLinecap="round" />
        <circle cx={16} cy={16} r={1.5} fill="#5b95f2" />
      </Ico>
    ),
    note: 'Edad legal: 66,0',
    noteColor: '#5b95f2',
  },
  {
    label: 'Esperanza de vida (65 años)',
    value: '22,6 años',
    icon: (
      <Ico>
        <path
          d="M16,26 C16,26 5,18.5 5,12 C5,8.5 8,6.5 11.5,6.5 C13.5,6.5 15.2,7.5 16,9 C16.8,7.5 18.5,6.5 20.5,6.5 C24,6.5 27,8.5 27,12 C27,18.5 16,26 16,26Z"
          stroke="#e86060" strokeWidth={1.5} fill="none"
        />
      </Ico>
    ),
    note: 'Total población',
    noteColor: '#e86060',
  },
  {
    label: 'Tasa de reemplazo',
    value: '78,3%',
    icon: (
      <Ico>
        <circle cx={10} cy={10} r={4} stroke="#b370ea" strokeWidth={1.8} />
        <circle cx={22} cy={22} r={4} stroke="#b370ea" strokeWidth={1.8} />
        <line x1={6} y1={26} x2={26} y2={6} stroke="#b370ea" strokeWidth={1.8} strokeLinecap="round" />
      </Ico>
    ),
    note: 'Pensión inicial / último salario',
    noteColor: '#b370ea',
  },
]

// ─── Component lab ────────────────────────────────────────────────────────────

function ComponentLab() {
  const [indicatorInfoOpen, setIndicatorInfoOpen] = React.useState(false)
  const [demoChildren, setDemoChildren] = React.useState(0)
  const [demoChildrenUnder3, setDemoChildrenUnder3] = React.useState(0)
  const [demoAscendants, setDemoAscendants] = React.useState(0)
  const [demoDisability, setDemoDisability] = React.useState<DisabilityMode>('none')
  const [demoAutonomicDeduction, setDemoAutonomicDeduction] = React.useState(0)

  return (
    <main className="component-lab">
      <header className="lab-header">
        <p className="eyebrow">Laboratorio interno</p>
        <h1>Componentes de la aplicacion</h1>
        <p>
          Pagina de trabajo para probar piezas visuales antes de incorporarlas a
          la narrativa publica.
        </p>
      </header>

      <section className="component-section" aria-labelledby="play-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 01</p>
          <h2 id="play-title">Boton de play</h2>
          <p>
            Pensado para iniciar animaciones, reproducciones guiadas o escenas
            explicativas dentro de los graficos.
          </p>
        </div>

        <div className="component-preview" aria-label="Variantes del boton de play">
          <PlayButton label="Ver explicacion" size="lg" />
          <PlayButton label="Reproducir" />
          <PlayButton label="Vista ligera" variant="ghost" />
          <PlayButton label="No disponible" disabled />
        </div>
      </section>

      <section className="component-section" aria-labelledby="pyramid-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 02</p>
          <h2 id="pyramid-title">Piramide poblacional</h2>
          <p>
            Visualizacion de poblacion por edad, sexo y nacionalidad. Resalta
            la franja en edad de trabajar y diferencia con un tono mas
            saturado los grupos que aportan al sistema.
          </p>
        </div>

        <div
          className="component-preview component-preview--dark"
          aria-label="Vista previa de la piramide poblacional"
        >
          <PopulationPyramid />
        </div>
      </section>

      <section className="component-section" aria-labelledby="info-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 03</p>
          <h2 id="info-title">Boton de informacion</h2>
          <p>
            Control circular para notas metodologicas o definiciones junto a
            graficos. La variante oscura reutiliza los tokens de la piramide
            poblacional.
          </p>
        </div>

        <div className="component-preview-stack">
          <div
            className="component-preview component-preview--dark component-preview--info"
            aria-label="Variantes del boton de informacion sobre fondo oscuro"
          >
            <InfoButton
              label="Informacion sobre la piramide poblacional"
              placement="bottom"
            >
              <p>
                Muestra poblacion por edad, sexo y lugar de nacimiento. La franja
                central marca la edad de trabajar (20-64 en este ejemplo).
              </p>
              <p>
                Los tonos mas saturados corresponden a grupos en edad laboral;
                los apagados, a quienes estan fuera de ella.
              </p>
            </InfoButton>

            <InfoButton label="Tamano pequeno" size="sm">
              <p>Variante compacta para cabeceras de panel o leyendas.</p>
            </InfoButton>

            <InfoButton label="No disponible" disabled>
              <p>Este panel no deberia mostrarse.</p>
            </InfoButton>
          </div>

          <div
            className="component-preview component-preview--info"
            aria-label="Boton de informacion sobre fondo claro"
          >
            <InfoButton
              label="Informacion sobre indicadores"
              variant="on-light"
            >
              <p>
                Variante para tarjetas y modulos sobre el fondo editorial claro
                de la web.
              </p>
            </InfoButton>
          </div>
        </div>
      </section>
      <section
        className="component-section component-section--wide"
        aria-labelledby="chart-title"
      >
        <div className="component-section__intro">
          <p className="eyebrow">Componente 04</p>
          <h2 id="chart-title">Gráfico temporal institucional</h2>
          <p>
            Gráfica de líneas múltiples reutilizable con doble eje, zonas de
            proyección, marcadores de hito e interacción al hover. El ejemplo
            usa datos del sistema público de pensiones en España 2000–2070.
          </p>
        </div>

        <div className="component-preview">
          <TimeSeriesChart
            title="Evolución histórica de indicadores clave"
            infoLabel="Fuentes y metodología del sistema de pensiones"
            categories={CHART_CATEGORIES}
            series={CHART_SERIES}
            milestones={CHART_MILESTONES}
            footnote="Fuente: AIReF (Opinión A/2025/1), IGAE BDMACRO, Seguridad Social"
            variant="dark"
          />
        </div>
      </section>

      <section className="component-section" aria-labelledby="kip-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 05</p>
          <h2 id="kip-title">Panel de indicadores clave</h2>
          <p>
            Panel compuesto por tarjetas de indicador. Cada tarjeta acepta
            icono, etiqueta, valor principal, métrica secundaria y nota
            de contexto. El panel organiza las tarjetas en dos columnas
            y ofrece un botón de acción configurable al pie.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--panel">
          <KeyIndicatorsPanel
            title="Indicadores clave (2025)"
            indicators={INDICATORS_2025}
            ctaLabel="Ver todos los indicadores"
          />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="year-selector-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 06</p>
          <h2 id="year-selector-title">Selector de año</h2>
          <p>
            Control deslizante de año con estética de panel de control futurista.
            Glassmorphism, borde luminoso, indicador circular con efecto LED y
            botón de reproducción animado. Soporta estado controlado y no controlado,
            y avanza automáticamente año a año al pulsar play.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--hud">
          <YearSelector style={{ width: '100%' }} />
        </div>
      </section>

      <section className="component-section" aria-labelledby="reform-sim-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 07</p>
          <h2 id="reform-sim-title">Simulador de reformas</h2>
          <p>
            Tarjeta móvil de estilo fintech/govtech para explorar reformas del
            sistema de pensiones. Muestra una lista de medidas activas con icono,
            valor y fecha de entrada en vigor, pestañas para gestionar el conjunto
            de medidas y un botón de acción que lanza la proyección de impacto.
          </p>
        </div>

        <div className="component-preview component-preview--dark" style={{ justifyContent: 'center' }}>
          <ReformSimulator />
        </div>
      </section>

      <section
        className="component-section component-section--wide"
        aria-labelledby="health-dashboard-title"
      >
        <div className="component-section__intro">
          <p className="eyebrow">Componente 08</p>
          <h2 id="health-dashboard-title">Panel de gasto sanitario por edad</h2>
          <p>
            Dashboard compuesto que combina varias piezas reutilizables: banda
            informativa, paneles oscuros con cabecera y botón de información,
            barras horizontales 100%-apiladas por categoría y grupo de edad,
            curva acumulada con marcador, lista de interpretación, ranking de
            categorías y fila de tarjetas de indicador (`MetricCard`).
          </p>
        </div>

        <div className="component-preview component-preview--dashboard component-preview--bleed">
          <HealthExpenditureDashboard />
        </div>
      </section>

      <section
        className="component-section component-section--wide"
        aria-labelledby="fiscal-dashboard-title"
      >
        <div className="component-section__intro">
          <p className="eyebrow">Componente 09</p>
          <h2 id="fiscal-dashboard-title">Calculadora fiscal del trabajador</h2>
          <p>
            Mockup de dashboard SaaS oscuro para comparar salario neto,
            impuestos y aportacion a pensiones entre dos anos.
          </p>
        </div>

        <div className="component-preview component-preview--dashboard component-preview--bleed">
          <FiscalWorkerDashboard />
        </div>
      </section>

      <section className="component-section" aria-labelledby="indicator-info-modal-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 10</p>
          <h2 id="indicator-info-modal-title">Modal de informacion del indicador</h2>
          <p>
            Ventana glassmorphism para fuentes, metodologia, limitaciones y
            descargas de un indicador. Se abre desde iconos de informacion en
            dashboards oscuros.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--info-modal">
          <button
            type="button"
            className="component-info-modal-trigger"
            onClick={() => setIndicatorInfoOpen(true)}
          >
            Abrir modal
          </button>
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="fiscal-personal-data-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 11</p>
          <h2 id="fiscal-personal-data-title">Tarjeta editable de datos fiscales</h2>
          <p>
            Formulario oscuro de alta fidelidad para introducir minimos
            familiares, discapacidad e importe verificado de deduccion
            autonomica.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--fiscal-card">
          <FiscalPersonalDataCard
            childrenCount={demoChildren}
            childrenUnder3={demoChildrenUnder3}
            ascendants={demoAscendants}
            disability={demoDisability}
            autonomicDeduction={demoAutonomicDeduction}
            onChildrenCountChange={setDemoChildren}
            onChildrenUnder3Change={setDemoChildrenUnder3}
            onAscendantsChange={setDemoAscendants}
            onDisabilityChange={setDemoDisability}
            onAutonomicDeductionChange={setDemoAutonomicDeduction}
          />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="fiscal-kpi-row-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 12</p>
          <h2 id="fiscal-kpi-row-title">Fila KPI fiscal</h2>
          <p>
            Seis tarjetas compactas para el resumen anual de salario, IRPF,
            cotizaciones, Seguridad Social, IVA proxy y otros impuestos.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--fiscal-kpi-row">
          <FiscalKpiRow />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="ssbe-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 13</p>
          <h2 id="ssbe-title">Bases minimas y maximas de cotizacion</h2>
          <p>
            Dashboard educativo oscuro para explicar como una base real se
            compara con los limites de cotizacion y como afecta a Seguridad
            Social, neto e IRPF.
          </p>
        </div>

        <div className="component-preview component-preview--dashboard component-preview--bleed">
          <SocialSecurityBasesExplainer />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="irpf-progressive-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 14</p>
          <h2 id="irpf-progressive-title">Como funciona el IRPF progresivo</h2>
          <p>
            Dashboard educativo oscuro para explicar base liquidable, tramos,
            cuota acumulada y tipo efectivo con un ejemplo editable.
          </p>
        </div>

        <div className="component-preview component-preview--dashboard component-preview--bleed">
          <ProgressiveIrpfExplainer />
        </div>
      </section>

      <section className="component-section" aria-labelledby="salary-slider-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente reutilizable</p>
          <h2 id="salary-slider-title">Slider de salario</h2>
          <p>
            Control de salario reutilizable usado en "Base real" y en "IRPF por
            tramos". Admite escala lineal o logaritmica (sube mas rapido cuanto
            mas alto es el importe).
          </p>
        </div>

        <div className="component-preview component-preview--dark">
          <SalarySliderShowcase />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="worker-fiscal-summary-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente de resumen</p>
          <h2 id="worker-fiscal-summary-title">Resumen fiscal del trabajador</h2>
          <p>
            Vista condensada del coste total para la empresa, los impuestos y
            cotizaciones del trabajador y el salario neto, con lectura en euros
            o porcentaje del bruto.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--worker-salary-card">
          <WorkerFiscalSummaryShowcase />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="worker-salary-base-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 15</p>
          <h2 id="worker-salary-base-title">Base real salarial</h2>
          <p>
            Tarjeta editable para calcular la base real desde salario,
            periodicidad, pagas, complementos y salario en especie.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--worker-salary-card">
          <WorkerSalaryBaseCard />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="worker-contribution-limits-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 16</p>
          <h2 id="worker-contribution-limits-title">Limites de cotizacion del trabajador</h2>
          <p>
            Paso visual para comparar la base real del trabajador con la base
            minima y maxima del grupo de cotizacion, y devolver la base que
            se usara en el calculo de cotizaciones.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--worker-limits">
          <WorkerContributionLimitsShowcase />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="worker-social-contributions-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 17</p>
          <h2 id="worker-social-contributions-title">Cotizaciones sociales</h2>
          <p>
            Paso visual para separar cotizaciones del trabajador, aportacion
            adicional de la empresa, base usada para cotizar y coste total de
            contratar.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--worker-social">
          <WorkerSocialContributionsCard />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="worker-personal-reductions-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 18</p>
          <h2 id="worker-personal-reductions-title">Reducciones y situacion personal</h2>
          <p>
            Paso visual para recoger hijos, discapacidad, estado civil,
            ascendientes a cargo, reducciones de base y deducciones de cuota
            antes de cerrar el calculo del IRPF.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--worker-personal">
          <WorkerPersonalReductionsCard />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="worker-irpf-tranches-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 19</p>
          <h2 id="worker-irpf-tranches-title">IRPF por tramos</h2>
          <p>
            Paso visual para explicar el calculo progresivo del IRPF, con base
            liquidable, tramos activos, cuota estimada y tipo efectivo.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--worker-irpf">
          <WorkerIrpfTranchesCard />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="worker-consumption-taxes-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 20</p>
          <h2 id="worker-consumption-taxes-title">IVA y otros impuestos</h2>
          <p>
            Paso editable para estimar impuestos indirectos por categoria:
            cada fila sincroniza porcentaje e importe anual en euros y anade
            vivienda en propiedad como modulo simplificado de IBI.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--worker-consumption">
          <WorkerConsumptionTaxesCard />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="worker-fiscal-steps-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 21</p>
          <h2 id="worker-fiscal-steps-title">Navegacion fiscal del trabajador</h2>
          <p>
            Cabecera guiada de siete pasos para recorrer base real, limites,
            cotizaciones, reducciones, IRPF, salario neto e impuestos sobre el
            consumo.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--dashboard">
          <WorkerFiscalStepsCard />
        </div>
      </section>

      <section className="component-section component-section--wide" aria-labelledby="worker-calculation-sources-title">
        <div className="component-section__intro">
          <p className="eyebrow">Componente 22</p>
          <h2 id="worker-calculation-sources-title">Fuentes del calculo</h2>
          <p>
            Pantalla final de trazabilidad con el nombre de cada parametro, el organismo oficial,
            el valor aplicado y un enlace legible al documento original.
          </p>
        </div>

        <div className="component-preview component-preview--dark component-preview--dashboard">
          <WorkerCalculationSourcesCard />
        </div>
      </section>

      <IndicatorInfoModal
        open={indicatorInfoOpen}
        onClose={() => setIndicatorInfoOpen(false)}
        content={POPULATION_PYRAMID_INFO}
      />
    </main>
  )
}

function Home() {
  return (
    <main className="home">
      <p className="eyebrow">Explicando pensiones</p>
      <h1>Una web didactica sobre las pensiones en Espana</h1>
      <p>
        Este proyecto esta preparando sus componentes visuales. Puedes abrir el
        resumen en <a href="/resumen">/resumen</a>, el laboratorio interno en <a href="/componentes">/componentes</a>, ver la
        pagina de poblacion en <a href="/poblacion">/poblacion</a> o el panel
        de gasto sanitario en <a href="/gasto-sanitario">/gasto-sanitario</a>.
        Tambien puedes abrir la infografia salarial en{' '}
        <a href="/salario-nacionalidad">/salario-nacionalidad</a> y la
        calculadora fiscal en <a href="/calculadora-fiscal">/calculadora-fiscal</a>.
        El componente educativo de bases de cotizacion esta en{' '}
        <a href="/bases-cotizacion">/bases-cotizacion</a> y la explicacion del
        IRPF progresivo en <a href="/irpf">/irpf</a>.
      </p>
    </main>
  )
}

const formatMillions = (value: number): string =>
  `${(value / 1_000_000).toLocaleString('es-ES', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })} M`

const formatPercent = (part: number, total: number): string =>
  `${((part / total) * 100).toLocaleString('es-ES', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`

const populationStatusLabel = (status: 'observed' | 'projected' | 'modeled'): string => {
  if (status === 'observed') return 'Observado'
  if (status === 'modeled') return 'Modelizado'
  return 'Proyectado'
}

function PopulationPage() {
  const [year, setYear] = React.useState(2025)
  const currentSummary = React.useMemo(
    () => POPULATION_YEAR_SUMMARIES.find((summary) => summary.year === year)
      ?? POPULATION_YEAR_SUMMARIES[0],
    [year],
  )

  if (!currentSummary) return null

  const sourceLabel = currentSummary.hasBirthplaceBreakdown
    ? currentSummary.status === 'modeled'
      ? 'INE ECP + Proyecciones INE, modelo propio por cohortes'
      : 'INE ECP, poblacion por sexo, grupo de edad y lugar de nacimiento'
    : currentSummary.status === 'observed'
      ? 'INE ECP, dato observado a 1 de enero'
      : 'INE Proyecciones de Poblacion, escenario a largo plazo'

  const pyramidSubtitle = currentSummary.hasBirthplaceBreakdown
    ? 'Poblacion por sexo, edad y lugar de nacimiento, en miles de personas'
    : 'Poblacion por sexo y edad, en miles de personas'

  return (
    <main className="population-page">
      <section className="population-hero" aria-labelledby="population-title">
        <div className="population-hero__copy">
          <p className="eyebrow">Demografia</p>
          <h1 id="population-title">Como cambia la poblacion espanola</h1>
          <p>
            Piramide por sexo y edad construida con datos oficiales del INE.
            Pulsa reproducir para ver la evolucion completa desde 1975 hasta 2070.
          </p>
        </div>

        <div className="population-stat-grid" aria-label="Indicadores del ano seleccionado">
          <article className="population-stat">
            <span>Total</span>
            <strong>{formatMillions(currentSummary.totalPopulation)}</strong>
          </article>
          <article className="population-stat">
            <span>20-64 anos</span>
            <strong>{formatPercent(
              currentSummary.workingAgePopulation,
              currentSummary.totalPopulation,
            )}</strong>
          </article>
          <article className="population-stat">
            <span>65+ anos</span>
            <strong>{formatPercent(
              currentSummary.olderPopulation,
              currentSummary.totalPopulation,
            )}</strong>
          </article>
        </div>
      </section>

      <section className="population-stage" aria-label="Piramide poblacional animada">
        <div className="population-stage__header">
          <div>
            <p className="eyebrow">Ano seleccionado</p>
            <h2>{currentSummary.year}</h2>
          </div>
          <span className={`population-badge population-badge--${
            currentSummary.status === 'observed' ? 'observed' : 'projected'
          }`}>
            {populationStatusLabel(currentSummary.status)}
          </span>
        </div>

        <PopulationPyramid
          data={currentSummary.data}
          scaleMax={POPULATION_SCALE_MAX}
          legendVariant={currentSummary.hasBirthplaceBreakdown ? 'birthplace' : 'sex'}
          title={`Piramide poblacional de Espana, ${currentSummary.year}`}
          subtitle={pyramidSubtitle}
        />

        <YearSelector
          year={year}
          onYearChange={setYear}
          minYear={POPULATION_YEAR_RANGE.min}
          maxYear={POPULATION_YEAR_RANGE.max}
          marks={[1975, 1990, 2005, 2025, 2050, 2070]}
          playIntervalMs={180}
          style={{ width: '100%' }}
        />

        <div className="population-jump-controls" aria-label="Saltos rapidos de ano">
          <button
            type="button"
            className="population-jump"
            onClick={() => setYear(2025)}
          >
            2025 observado
          </button>
          <button
            type="button"
            className="population-jump population-jump--projected"
            onClick={() => setYear(2026)}
          >
            Inicio proyeccion
          </button>
          <button
            type="button"
            className="population-jump population-jump--projected"
            onClick={() => setYear(2050)}
          >
            2050
          </button>
          <button
            type="button"
            className="population-jump population-jump--projected"
            onClick={() => setYear(2070)}
          >
            2070
          </button>
        </div>

        <p className="population-source">
          Fuente: {sourceLabel}. Los anos 2002-2025 muestran nacidos en Espana
          y nacidos en el extranjero como dato observado. Desde 2026 la capa por
          nacimiento es una estimacion propia por cohortes: envejece el stock de
          2025, incorpora flujos proyectados de inmigracion y emigracion, aplica
          mortalidad por edad y sexo y calibra cada ano al total oficial INE de
          nacidos en el extranjero. La poblacion total por edad y sexo sigue la
          proyeccion oficial INE.
        </p>
      </section>
    </main>
  )
}

function HealthExpenditurePage() {
  return (
    <main className="health-page">
      <HealthExpenditureDashboard />
    </main>
  )
}

function App() {
  const path = window.location.pathname
  const isComponentLab = path === '/componentes'
  const isPopulationPage = path === '/poblacion'
  const isHealthPage = path === '/gasto-sanitario'
  const isSalaryNationalityPage = path === '/salario-nacionalidad'
  const isFiscalWorkerPage = path === '/calculadora-fiscal'
  const isSocialSecurityBasesPage = path === '/bases-cotizacion'
  const isProgressiveIrpfPage = path === '/irpf'
  const isPensionOverviewPage = path === '/resumen'

  if (isPensionOverviewPage) return <PensionOverviewPage />
  if (isComponentLab) return <ComponentLab />
  if (isPopulationPage) return <PopulationPage />
  if (isHealthPage) return <HealthExpenditurePage />
  if (isSalaryNationalityPage) return <SalaryNationalityDashboard />
  if (isFiscalWorkerPage) return <FiscalWorkerDashboard />
  if (isSocialSecurityBasesPage) return <SocialSecurityBasesExplainer />
  if (isProgressiveIrpfPage) return <ProgressiveIrpfExplainer />
  return <Home />
}

export default App
