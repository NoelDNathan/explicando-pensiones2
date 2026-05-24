import './App.css'
import { InfoButton } from './components/InfoButton'
import { PopulationPyramid } from './components/PopulationPyramid'
import { TimeSeriesChart } from './components/TimeSeriesChart'
import type { ChartSeries, ChartMilestone } from './components/TimeSeriesChart'

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

// ─── Component lab ────────────────────────────────────────────────────────────

function ComponentLab() {
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
            projectionBadge="2025"
            categories={CHART_CATEGORIES}
            series={CHART_SERIES}
            milestones={CHART_MILESTONES}
            footnote="Fuente: AIReF (Opinión A/2025/1), IGAE BDMACRO, Seguridad Social"
            variant="dark"
          />
        </div>
      </section>
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
        laboratorio interno en <a href="/componentes">/componentes</a>.
      </p>
    </main>
  )
}

function App() {
  const isComponentLab = window.location.pathname === '/componentes'

  return isComponentLab ? <ComponentLab /> : <Home />
}

export default App
