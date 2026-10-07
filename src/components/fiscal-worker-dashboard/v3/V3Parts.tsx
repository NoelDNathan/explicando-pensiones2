/*
 * Piezas de la v3 de la calculadora. Solo dibujan: las cifras llegan calculadas.
 * Colores con tokens --fiscal-* (FiscalV3.css) sobre el lenguaje «Escenario».
 */
import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { EscFigure, EscGuessRange } from '../../worker-salary-dashboard/escenario/EscenarioParts'
import { V3_BLOCKS, V3_BLOCK_LABELS, per100, signedPer100 } from './v3Flow'
import type { V3Block } from './v3Flow'
import './FiscalV3.css'

/** Progreso por bloques: cuántos quedan, con nombre, en vez de un porcentaje. */
export function V3Progress({ current, done }: { current: V3Block; done: Record<V3Block, boolean> }) {
  const index = V3_BLOCKS.indexOf(current)
  const pending = V3_BLOCKS.filter((block) => block !== current && !done[block])
  const isLast = pending.length === 0
  return (
    <div className="v3-progress">
      <p className="v3-progress__label">
        <strong>Bloque {index + 1} de {V3_BLOCKS.length}</strong>
        <span aria-hidden="true"> · </span>
        <span>{V3_BLOCK_LABELS[current].title}</span>
      </p>
      <ol className="v3-progress__segments" aria-label="Bloques del recorrido">
        {V3_BLOCKS.map((block) => {
          const state = block === current ? 'is-active' : done[block] ? 'is-done' : ''
          return (
            <li key={block} className={state || undefined} aria-current={block === current ? 'step' : undefined}>
              <span className="v3-sr">
                {V3_BLOCK_LABELS[block].title}
                {block === current ? ' (ahora)' : done[block] ? ' (hecho)' : ''}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="v3-progress__rest">
        {isLast
          ? 'Último bloque'
          : `Te ${pending.length === 1 ? 'queda' : 'quedan'}: ${pending.map((block) => V3_BLOCK_LABELS[block].short).join(', ')}`}
      </p>
    </div>
  )
}

/** Franja fija con «de cada 100 €, para ti» y lo que ha cambiado con la última respuesta. */
export function V3LiveFigure({ value, baseline, delta }: { value: number; baseline: number; delta: number }) {
  const deltaText = signedPer100(delta)
  const sinceStart = signedPer100(value - baseline)
  return (
    <div className="v3-live" role="status" aria-live="polite">
      <p className="v3-live__label">De cada 100 € que cuesta tu puesto, <span>para ti</span></p>
      <p className="v3-live__value">
        <EscFigure value={value} format={(v) => per100(v)} className="v3-live__figure" />
        {deltaText ? (
          <span key={`${value}`} className={`v3-live__delta ${delta > 0 ? 'is-up' : 'is-down'}`}>
            {deltaText}
          </span>
        ) : null}
      </p>
      <p className="v3-live__note">
        {sinceStart ? `${sinceStart} frente a la aproximación (${per100(baseline)})` : `Igual que la aproximación inicial`}
      </p>
    </div>
  )
}

export type V3Assumption = {
  id: string
  label: string
  /** `supuesto`: lo pusimos nosotros. `tuyo`: lo has confirmado o cambiado tú. */
  status: 'supuesto' | 'tuyo'
  onSelect?: () => void
}

/** «Hemos supuesto: …» con fichas que llevan a donde se corrige cada cosa. */
export function V3AssumptionChips({ items, title = 'Hemos supuesto' }: { items: V3Assumption[]; title?: string }) {
  const id = useId()
  return (
    <div className="v3-assume" role="group" aria-labelledby={id}>
      <p id={id} className="v3-assume__title">{title}</p>
      <ul className="v3-assume__list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`v3-chip v3-chip--${item.status}`}
              onClick={item.onSelect}
              disabled={!item.onSelect}
            >
              {item.status === 'tuyo' ? <Check size={16} aria-hidden="true" /> : null}
              <span>{item.label}</span>
              <span className="v3-sr">{item.status === 'tuyo' ? ', confirmado' : ', supuesto: cambiar'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Un descubrimiento personal: una cifra tuya y una frase. */
export function V3Discovery({ kicker, figure, children, tone = 'positive' }: {
  kicker: string
  figure: ReactNode
  children: ReactNode
  tone?: 'positive' | 'company' | 'worker' | 'blue' | 'yellow'
}) {
  return (
    <aside className={`v3-discovery v3-discovery--${tone}`}>
      <p className="v3-discovery__kicker">{kicker}</p>
      <p className="v3-discovery__figure">{figure}</p>
      <div className="v3-discovery__text">{children}</div>
    </aside>
  )
}

/**
 * Predicción opcional antes de una revelación: la misma mecánica que la apuesta
 * del principio. Se puede saltar; nunca bloquea el avance.
 */
export function V3Prediction({ question, max, step, format, valueText, answer, onAnswer, reveal }: {
  question: ReactNode
  max: number
  step: number
  format: (value: number) => string
  valueText: (value: number) => string
  /** Respuesta guardada; `undefined` mientras no se ha contestado ni saltado. */
  answer: number | null | undefined
  onAnswer: (value: number | null) => void
  /** Lo que se muestra al contestar o saltar. */
  reveal: (answer: number | null) => ReactNode
}) {
  const [draft, setDraft] = useState<number | null>(null)
  const headingId = useId()
  if (answer !== undefined) return <>{reveal(answer)}</>
  return (
    <section className="v3-predict" aria-labelledby={headingId}>
      <p className="v3-predict__kicker">Antes de verlo</p>
      <h3 id={headingId} className="v3-predict__q">{question}</h3>
      <div className="v3-predict__answer">
        <p className={`v3-predict__value${draft === null ? ' is-pending' : ''}`} aria-hidden="true">
          {draft === null ? '¿?' : format(draft)}
        </p>
        <EscGuessRange
          value={draft}
          max={max}
          step={step}
          onChange={setDraft}
          ariaLabel={typeof question === 'string' ? question : 'Tu predicción'}
          valueText={draft === null ? 'Sin responder' : valueText(draft)}
        />
      </div>
      <div className="v3-predict__actions">
        <button type="button" className="d-cta" disabled={draft === null} onClick={() => onAnswer(draft)}>
          Ver la cifra <ArrowRight size={20} aria-hidden="true" />
        </button>
        <button type="button" className="d-ghost" onClick={() => onAnswer(null)}>
          Saltar
        </button>
      </div>
    </section>
  )
}

/** Fila con un número entero y botones − y +. */
export function V3Counter({ label, help, value, min = 0, max, onChange }: {
  label: string
  help?: ReactNode
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div className="v3-field">
      <div className="v3-field__text">
        <span id={id} className="v3-field__label">{label}</span>
        {help ? <span className="v3-field__help">{help}</span> : null}
      </div>
      <div className="v3-counter" role="group" aria-labelledby={id}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Quitar uno: ${label}`}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Añadir uno: ${label}`}>+</button>
      </div>
    </div>
  )
}

/** Fila con un importe en euros. */
export function V3Amount({ label, help, value, onChange, suffix = '€ al año' }: {
  label: string
  help?: ReactNode
  value: number
  onChange: (value: number) => void
  suffix?: string
}) {
  const id = useId()
  return (
    <div className="v3-field">
      <div className="v3-field__text">
        <label htmlFor={id} className="v3-field__label">{label}</label>
        {help ? <span className="v3-field__help">{help}</span> : null}
      </div>
      <div className="d-input v3-amount">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={10}
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        />
        <span>{suffix}</span>
      </div>
    </div>
  )
}

/** Barra inferior del recorrido: atrás discreto y «seguir» con la siguiente recompensa. */
export function V3Nav({ onBack, backLabel = 'Atrás', next, nextLabel, placement = 'fixed' }: {
  onBack?: () => void
  backLabel?: string
  next: () => void
  nextLabel: string
  /** `static` la deja en su sitio (laboratorio de componentes); en el recorrido va fija abajo. */
  placement?: 'fixed' | 'static'
}) {
  return (
    <nav className={`v3-nav${placement === 'static' ? ' v3-nav--static' : ''}`} aria-label="Navegación del recorrido">
      {onBack ? (
        <button type="button" className="v3-nav__back" onClick={onBack}>
          <span aria-hidden="true">←</span> {backLabel}
        </button>
      ) : <span />}
      <button type="button" className="v3-nav__next" onClick={next}>
        <span>{nextLabel}</span>
        <ArrowRight size={22} aria-hidden="true" />
      </button>
    </nav>
  )
}
