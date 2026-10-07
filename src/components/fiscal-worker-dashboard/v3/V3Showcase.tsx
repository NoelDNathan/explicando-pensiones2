/*
 * Piezas de la v3 en el laboratorio de componentes (/componentes), con sus
 * variantes y estados. Las cifras son de ejemplo y lo dice cada pieza.
 */
import { useState } from 'react'
import type { ReactNode } from 'react'
import { FiscalVariantContext } from '../fiscalVariant'
import '../FiscalSoftTheme.css'
import '../FiscalEscenario.css'
import {
  V3Amount,
  V3AssumptionChips,
  V3Counter,
  V3Discovery,
  V3LiveFigure,
  V3Nav,
  V3Prediction,
  V3Progress,
} from './V3Parts'
import { euro } from './v3Flow'

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="component-preview component-preview--calculadora fwd--soft fwd-worker-card" aria-label={label}>
      <div className="fwd fwd--soft fwd--escenario fwd--v3 v3-preview">{children}</div>
    </div>
  )
}

export function V3Showcase() {
  const [children, setChildren] = useState(2)
  const [amount, setAmount] = useState(1500)
  const [answer, setAnswer] = useState<number | null | undefined>(undefined)
  const reveal = (value: number | null) => (
    <V3Discovery kicker="Lo que no ves en tu nómina" figure={<span className="d-company">{euro(935)}</span>} tone="company">
      <p>al mes paga tu empresa en cotizaciones por ti (cifra de ejemplo).</p>
      {value !== null ? <p className="d-note">Tú dijiste {euro(value)}.</p> : <p className="d-note">Predicción saltada.</p>}
    </V3Discovery>
  )
  return (
    <FiscalVariantContext.Provider value="escenario">
      <Frame label="Progreso por bloques y cifra viva">
        <V3Progress current="situacion" done={{ nomina: true, situacion: false, compras: false, patrimonio: false }} />
        <V3Progress current="patrimonio" done={{ nomina: true, situacion: true, compras: true, patrimonio: false }} />
        <V3LiveFigure value={53.8} baseline={52.5} delta={0.9} />
        <V3LiveFigure value={51.5} baseline={52.5} delta={-1} />
        <V3LiveFigure value={52.5} baseline={52.5} delta={0} />
      </Frame>
      <Frame label="Supuestos: sin confirmar, confirmados y desactivados">
        <V3AssumptionChips
          items={[
            { id: 'a', label: 'Madrid', status: 'supuesto', onSelect: () => undefined },
            { id: 'b', label: 'Tu situación personal', status: 'tuyo', onSelect: () => undefined },
            { id: 'c', label: 'Sin vivienda ni coche', status: 'supuesto' },
          ]}
        />
      </Frame>
      <Frame label="Descubrimientos en sus cinco tonos">
        <V3Discovery kicker="Ejemplo · empresa" figure={<span className="d-company">935 €</span>} tone="company"><p>tono empresa</p></V3Discovery>
        <V3Discovery kicker="Ejemplo · trabajador" figure={<span className="d-worker">5.195 €</span>} tone="worker"><p>tono trabajador</p></V3Discovery>
        <V3Discovery kicker="Ejemplo · consumo" figure={<span className="d-blue">221 €</span>} tone="blue"><p>tono consumo</p></V3Discovery>
        <V3Discovery kicker="Ejemplo · fecha" figure={<span className="d-yellow">17 de junio</span>} tone="yellow"><p>tono amarillo</p></V3Discovery>
        <V3Discovery kicker="Ejemplo · para ti" figure={<span className="d-acc">2.074 €</span>}><p>tono positivo (por defecto)</p></V3Discovery>
      </Frame>
      <Frame label="Predicción: sin contestar (Ver la cifra deshabilitado hasta mover), contestada y saltada">
        <V3Prediction
          question="¿Cuánto crees que paga tu empresa al mes por ti, además de tu bruto?"
          max={2900}
          step={10}
          format={(value) => euro(value)}
          valueText={(value) => `${value} euros al mes`}
          answer={answer}
          onAnswer={setAnswer}
          reveal={reveal}
        />
        {answer !== undefined ? (
          <button type="button" className="d-ghost" onClick={() => setAnswer(undefined)}>Volver a preguntar</button>
        ) : null}
      </Frame>
      <Frame label="Campos: contador (con mínimo y máximo) e importe">
        <V3Counter label="¿Cuántos?" help="Menores de 25 que viven contigo." value={children} min={1} max={6} onChange={setChildren} />
        <V3Counter label="En el máximo" value={6} max={6} onChange={() => undefined} />
        <V3Amount label="Lo que aportas tú al año" help="Solo tus aportaciones." value={amount} onChange={setAmount} />
      </Frame>
      <Frame label="Navegación del recorrido">
        <V3Nav placement="static" onBack={() => undefined} next={() => undefined} nextLabel="Seguir: tu situación" />
        <V3Nav placement="static" next={() => undefined} nextLabel="Ver mi ticket fiscal" />
      </Frame>
    </FiscalVariantContext.Provider>
  )
}
