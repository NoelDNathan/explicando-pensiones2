import {
  BarChart3,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  FileText,
  Info,
  Lightbulb,
  ListChecks,
  Pencil,
  Star,
  WalletCards,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import './ProgressiveIrpfExplainer.css'

type Tone = 'green' | 'purple' | 'blue' | 'orange' | 'yellow' | 'muted'

type Bracket = {
  id: number
  from: number
  to: number | null
  rate: number
  tone: Tone
}

const IRPF_BRACKETS: Bracket[] = [
  { id: 1, from: 0, to: 12450, rate: 0.19, tone: 'green' },
  { id: 2, from: 12450, to: 20200, rate: 0.24, tone: 'purple' },
  { id: 3, from: 20200, to: 35000, rate: 0.3, tone: 'blue' },
  { id: 4, from: 35000, to: 60000, rate: 0.37, tone: 'muted' },
  { id: 5, from: 60000, to: 300000, rate: 0.45, tone: 'muted' },
  { id: 6, from: 300000, to: null, rate: 0.47, tone: 'muted' },
]

const SCALE_TICKS = [0, 12450, 20200, 35000, 60000, 300000]

const formatEuro = (value: number, decimals = 0) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)

const formatPercent = (value: number) =>
  new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value)

const getScalePosition = (value: number) => {
  if (value <= SCALE_TICKS[0]) return 0
  if (value >= 300000) return 100

  const segment = SCALE_TICKS.findIndex((tick, index) =>
    index < SCALE_TICKS.length - 1 && value >= tick && value <= SCALE_TICKS[index + 1]
  )

  if (segment < 0) return 100

  const start = SCALE_TICKS[segment]
  const end = SCALE_TICKS[segment + 1]
  const localProgress = (value - start) / (end - start)
  return ((segment + localProgress) / 6) * 100
}

function IconBubble({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`pie-icon pie-icon--${tone}`} aria-hidden="true">
      {children}
    </span>
  )
}

function InfoDot({ label }: { label: string }) {
  return (
    <span className="pie-info-dot" aria-label={label} role="img">
      i
    </span>
  )
}

function StepCard({
  tone,
  title,
  children,
  icon,
  featured = false,
}: {
  tone: Tone
  title: string
  children: ReactNode
  icon: ReactNode
  featured?: boolean
}) {
  return (
    <article className={`pie-step-card pie-step-card--${tone}${featured ? ' is-featured' : ''}`}>
      <IconBubble tone={tone}>{icon}</IconBubble>
      <div>
        <h2>{title}</h2>
        {children}
      </div>
    </article>
  )
}

function FlowPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`pie-flow-pill pie-flow-pill--${tone}`}>{children}</span>
}

function BracketBlock({
  bracket,
  taxable,
  active,
  marker,
}: {
  bracket: Bracket
  taxable: number
  active: boolean
  marker?: string
}) {
  const label = bracket.to
    ? `${formatEuro(bracket.from)} - ${formatEuro(bracket.to)}`
    : `> ${formatEuro(bracket.from)}`

  return (
    <article className={`pie-bracket pie-bracket--${active ? bracket.tone : 'muted'}${active ? ' is-active' : ''}`}>
      {marker ? <span className="pie-bracket-marker">{marker}</span> : null}
      <div className="pie-bracket-head">
        <span>{bracket.id}</span>
        <strong>{label}</strong>
      </div>
      <b>{Math.round(bracket.rate * 100)}%</b>
      {active ? (
        <small>
          Importe gravado
          <strong>{formatEuro(taxable)}</strong>
        </small>
      ) : null}
    </article>
  )
}

export function ProgressiveIrpfExplainer() {
  const [base, setBase] = useState(35000)

  const calculations = useMemo(
    () => IRPF_BRACKETS.map((bracket) => {
      const upper = bracket.to ?? Number.POSITIVE_INFINITY
      const taxable = Math.max(0, Math.min(base, upper) - bracket.from)
      return {
        ...bracket,
        taxable,
        quota: taxable * bracket.rate,
        active: taxable > 0,
      }
    }),
    [base],
  )

  const quota = calculations.reduce((total, bracket) => total + bracket.quota, 0)
  const effectiveRate = base > 0 ? (quota / base) * 100 : 0
  const clampedBase = Math.min(Math.max(base, 0), 300000)
  const sliderPosition = getScalePosition(clampedBase)
  const activeRows = calculations.filter((bracket) => bracket.active).slice(0, 3)

  const updateBase = (next: number) => {
    setBase(Math.max(0, Math.min(300000, Math.round(next))))
  }

  return (
    <section className="pie" aria-labelledby="pie-title">
      <div className="pie-shell">
        <header className="pie-header">
          <div className="pie-title">
            <IconBubble tone="blue"><BarChart3 size={27} /></IconBubble>
            <div>
              <h1 id="pie-title">Cómo funciona el IRPF</h1>
              <p>El IRPF es progresivo: cada tramo tributa solo sobre la parte de la base liquidable que cae en ese tramo.</p>
            </div>
          </div>
          <nav className="pie-tabs" aria-label="Secciones del componente">
            <button type="button" className="is-active"><BookOpen size={20} />Explicación</button>
            <button type="button"><Calculator size={20} />Simulador</button>
            <button type="button"><CircleHelp size={20} />Preguntas</button>
          </nav>
        </header>

        <div className="pie-steps" aria-label="Resumen del proceso">
          <StepCard tone="green" title="1. Salario bruto" icon={<WalletCards size={28} />}>
            <strong>{formatEuro(35000)}</strong>
            <p>Ingreso anual antes de retenciones.</p>
          </StepCard>
          <StepCard tone="purple" title="2. Base liquidable" icon={<FileText size={28} />} featured>
            <strong>Lo que realmente tributa</strong>
            <p>Es la cantidad sobre la que se aplica el IRPF, después de restar cotizaciones y reducciones.</p>
          </StepCard>
          <StepCard tone="blue" title="3. Tramos IRPF" icon={<ListChecks size={28} />}>
            <strong>Progresivo</strong>
            <p>Cada tramo tiene su propio tipo.</p>
          </StepCard>
          <StepCard tone="orange" title="4. Cuota resultante" icon={<Calculator size={28} />}>
            <strong>No pagas un único %</strong>
            <p>La media final es menor que el tramo más alto aplicado.</p>
          </StepCard>
        </div>

        <main className="pie-main">
          <section className="pie-panel pie-panel--brackets" aria-labelledby="pie-example-title">
            <div className="pie-panel-top">
              <h2 id="pie-example-title">Ejemplo práctico con base liquidable de {formatEuro(base)}</h2>
              <label className="pie-base-control">
                <span>Base liquidable</span>
                <span className="pie-input-shell">
                  <input
                    aria-label="Base liquidable"
                    inputMode="numeric"
                    value={`${base.toLocaleString('es-ES')} €`}
                    onChange={(event) => updateBase(Number(event.target.value.replace(/\D/g, '')) || 0)}
                  />
                  <Pencil size={18} aria-hidden="true" />
                  <span className="pie-input-arrows" aria-hidden="true">
                    <ChevronUp size={15} />
                    <ChevronDown size={15} />
                  </span>
                </span>
              </label>
              <span className="pie-help-chip"><Lightbulb size={16} />Ajusta la base para ver cambios <InfoDot label="Ayuda sobre la base liquidable" /></span>
            </div>

            <div className="pie-flow" aria-label="Flujo para obtener la base liquidable">
              <FlowPill tone="green">Salario bruto</FlowPill>
              <span aria-hidden="true">→</span>
              <FlowPill tone="purple">− cotizaciones</FlowPill>
              <span aria-hidden="true">→</span>
              <FlowPill tone="purple">− reducciones</FlowPill>
              <span aria-hidden="true">→</span>
              <FlowPill tone="blue">Base liquidable</FlowPill>
            </div>
            <p className="pie-flow-note">Es la base final sobre la que se aplican los tramos del IRPF. <InfoDot label="Definición breve de base liquidable" /></p>

            <div className="pie-inner-tabs" role="tablist" aria-label="Vistas de la explicación">
              <button type="button" className="is-active"><BarChart3 size={18} />Ver tramos</button>
              <button type="button"><ListChecks size={18} />Ver cálculo</button>
              <button type="button"><PercentGlyph />Ver tipo efectivo</button>
            </div>

            <div className="pie-brackets" aria-label="Tramos progresivos de IRPF">
              {calculations.map((bracket, index) => (
                <BracketBlock
                  key={bracket.id}
                  bracket={bracket}
                  taxable={bracket.taxable}
                  active={bracket.active}
                  marker={index === 2 ? `Hasta ${formatEuro(base)}` : undefined}
                />
              ))}
            </div>

            <div className="pie-scale" aria-label="Escala de base liquidable">
              <span className="pie-scale-track" />
              <span className="pie-scale-fill" style={{ width: `${sliderPosition}%` }} />
              <span className="pie-scale-handle" style={{ left: `${sliderPosition}%` }} />
              <div className="pie-scale-labels">
                <span>0 €</span>
                <span>12.450 €</span>
                <span>20.200 €</span>
                <span>35.000 €</span>
                <span>60.000 €</span>
                <span>300.000 €</span>
                <span>+300.000 €</span>
              </div>
            </div>
            <p className="pie-hover-note">Haz hover en cada tramo <InfoDot label="Los tramos activos muestran cuánto tributa en cada bloque" /></p>
          </section>

          <aside className="pie-panel pie-panel--insight" aria-labelledby="pie-key-title">
            <IconBubble tone="yellow"><Lightbulb size={34} /></IconBubble>
            <div className="pie-insight-copy">
              <span className="pie-badge">Insight</span>
              <h2 id="pie-key-title">La clave</h2>
              <p>
                Si tu base llega a <strong className="pie-green">{formatEuro(base)}</strong>, <strong className="pie-red">NO</strong> pagas un 30% sobre todo.
              </p>
              <p>
                Solo pagas el 30% sobre la parte entre <strong className="pie-blue">20.200 € y {formatEuro(base)}</strong>.
              </p>
              <p>Los tramos anteriores mantienen sus tipos.</p>
            </div>
            <div className="pie-star-note">
              <Star size={28} fill="currentColor" aria-hidden="true" />
              <p>El sistema es progresivo y solo grava el tramo que excede cada límite.</p>
            </div>
          </aside>
        </main>

        <footer className="pie-bottom">
          <section className="pie-panel pie-calc" aria-labelledby="pie-calc-title">
            <div className="pie-section-title">
              <IconBubble tone="blue"><Calculator size={24} /></IconBubble>
              <h2 id="pie-calc-title">Cálculo acumulado</h2>
            </div>
            <ul>
              {activeRows.map((row, index) => (
                <li key={row.id} className={`pie-calc-row pie-calc-row--${row.tone}`}>
                  <span />
                  <p>{['Primer', 'Segundo', 'Tercer'][index]} tramo: {formatEuro(row.taxable)} x {Math.round(row.rate * 100)}%</p>
                  <b>= {formatEuro(row.quota, 2)}</b>
                </li>
              ))}
            </ul>
          </section>

          <section className="pie-panel pie-result" aria-label="Resultado estimado">
            <p>Cuota íntegra estimada <InfoDot label="Suma de la cuota de cada tramo" /></p>
            <strong>{formatEuro(quota, 2)}</strong>
            <hr />
            <p>Tipo efectivo aproximado <InfoDot label="Cuota dividida entre base liquidable" /></p>
            <b>{formatPercent(effectiveRate)}%</b>
          </section>

          <section className="pie-panel pie-meaning" aria-labelledby="pie-meaning-title">
            <div className="pie-section-title">
              <IconBubble tone="blue"><Info size={24} /></IconBubble>
              <h2 id="pie-meaning-title">Qué significa base liquidable</h2>
            </div>
            <ol>
              <li><span>1.</span>Partes de tu salario bruto o renta total.</li>
              <li><span>2.</span>Restas cotizaciones y reducciones aplicables.</li>
              <li><span>3.</span>El resultado es la base liquidable: sobre ella se aplican los tramos del IRPF.</li>
            </ol>
            <aside>
              <Star size={28} fill="currentColor" aria-hidden="true" />
              <p>Idea clave: la base liquidable <strong>no es todo lo que ganas</strong>, sino la cantidad que queda para calcular el impuesto.</p>
            </aside>
          </section>
        </footer>
      </div>
    </section>
  )
}

function PercentGlyph() {
  return (
    <span className="pie-percent-glyph" aria-hidden="true">
      %
    </span>
  )
}
