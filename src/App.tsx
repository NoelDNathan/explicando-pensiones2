import './App.css'
import { InfoButton } from './components/InfoButton'
import { PopulationPyramid } from './components/PopulationPyramid'

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
