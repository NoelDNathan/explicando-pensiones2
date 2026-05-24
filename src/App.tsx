import './App.css'

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
