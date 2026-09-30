/*
 * Piezas del diseño «Escenario» (v2 de la calculadora, skill diseno-escenario).
 * Solo dibujan: reciben cifras y textos ya calculados por cada paso. Los colores
 * salen de Escenario.css (tokens --fiscal-*); aquí solo hay anchos y alturas.
 */
import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './Escenario.css'

export type EscTone = 'worker' | 'company' | 'positive' | 'state' | 'neutral'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Cifra que cuenta hasta su nuevo valor (600 ms, ease-out cúbico). */
export function useTweenedNumber(target: number, duration = 600) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  useEffect(() => {
    if (prefersReducedMotion() || !Number.isFinite(target)) {
      fromRef.current = target
      setValue(target)
      return
    }
    const from = fromRef.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      const next = from + (target - from) * eased
      fromRef.current = next
      setValue(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

/** Número animado con su formato. El valor final es el que leen los lectores de pantalla. */
export function EscFigure({ value, format, className }: { value: number; format: (value: number) => string; className?: string }) {
  const shown = useTweenedNumber(value)
  return (
    <span className={`esc-figure${className ? ` ${className}` : ''}`}>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="esc-sr">{format(value)}</span>
    </span>
  )
}

/** Título display: la última palabra en verde, como en la maqueta. */
export function EscTitle({ text, id, as: Tag = 'h2' }: { text: string; id?: string; as?: 'h1' | 'h2' | 'h3' }) {
  const words = text.trim().split(/\s+/)
  // El tamaño se ajusta a la palabra más larga para que ninguna se parta ni se salga.
  const longest = Math.max(...words.map((word) => word.length), 4)
  const last = words.length > 1 ? words.pop() : null
  return (
    <Tag id={id} className="esc-title" key={text} style={{ '--esc-title-chars': longest } as CSSProperties}>
      {words.join(' ')}
      {last ? <> <span className="esc-title__accent">{last}</span></> : null}
    </Tag>
  )
}

/** Texto literal con frases marcadas por un barrido de color (quién paga). */
export function EscSweepText({ text, marks }: { text: string; marks: { phrase: string; tone: 'worker' | 'company' }[] }) {
  const parts: ReactNode[] = []
  let rest = text
  let key = 0
  while (rest) {
    let hit: { index: number; phrase: string; tone: 'worker' | 'company' } | null = null
    for (const mark of marks) {
      const index = rest.indexOf(mark.phrase)
      if (index >= 0 && (!hit || index < hit.index)) hit = { index, ...mark }
    }
    if (!hit) {
      parts.push(rest)
      break
    }
    if (hit.index > 0) parts.push(rest.slice(0, hit.index))
    parts.push(<mark key={key++} className={`esc-sweep esc-sweep--${hit.tone}`}>{hit.phrase}</mark>)
    rest = rest.slice(hit.index + hit.phrase.length)
  }
  return <>{parts}</>
}

/** Cinta decorativa en bucle con palabras del propio texto del paso. */
export function EscRibbon({ words }: { words: string[] }) {
  const line = `${words.join(' • ')} •`
  return (
    <div className="esc-ribbon" aria-hidden="true">
      <div className="esc-ribbon__track">
        <span>{line}</span>
        <span>{line}</span>
      </div>
    </div>
  )
}

/** Reparte 100 casillas por el método del resto mayor. */
function toHundred(values: number[]) {
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0)
  if (total <= 0) return values.map(() => 0)
  const raw = values.map((value) => (Math.max(0, value) / total) * 100)
  const floors = raw.map(Math.floor)
  let left = 100 - floors.reduce((sum, value) => sum + value, 0)
  raw
    .map((value, index) => ({ index, rest: value - floors[index] }))
    .sort((a, b) => b.rest - a.rest)
    .forEach(({ index }) => {
      if (left > 0) {
        floors[index] += 1
        left -= 1
      }
    })
  return floors
}

export function EscHundredCells({ parts, label, caption }: {
  parts: { value: number; tone: EscTone }[]
  label: string
  caption: ReactNode
}) {
  const counts = toHundred(parts.map((part) => part.value))
  const cells: EscTone[] = []
  counts.forEach((count, index) => {
    for (let i = 0; i < count; i += 1) cells.push(parts[index].tone)
  })
  return (
    <figure className="esc-cells">
      <div className="esc-cells__grid" role="img" aria-label={label}>
        {cells.map((tone, index) => (
          <span key={index} className={`esc-cell esc-cell--${tone}`} style={{ animationDelay: `${index * 12}ms` }} />
        ))}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

/** Fila de carrera: etiqueta, tipo, importe y barra. Se abre al tocar para leer su explicación. */
export function EscRaceRow({ label, rate, amount, share, tone, help, muted = false }: {
  label: string
  rate: string
  amount: string
  share: number
  tone: 'worker' | 'company'
  help: ReactNode
  muted?: boolean
}) {
  const [open, setOpen] = useState(false)
  const helpId = useId()
  return (
    <div className={`esc-race${muted ? ' esc-race--muted' : ''}`}>
      <button type="button" className="esc-race__button" aria-expanded={open} aria-controls={helpId} onClick={() => setOpen(!open)}>
        <span className="esc-race__line">
          <span className="esc-race__label">{label}</span>
          <span className="esc-race__rate">{rate}</span>
          <strong className={`esc-race__amount esc-tone--${tone}`}>{amount}</strong>
          <span className={`esc-race__sign esc-tone--${tone}`} aria-hidden="true">{open ? '−' : '+'}</span>
        </span>
        <span className="esc-race__track" aria-hidden="true">
          <span className={`esc-race__bar esc-fill--${tone}`} style={{ width: `${Math.max(0, Math.min(100, share))}%` }} />
        </span>
      </button>
      <div id={helpId} className="esc-race__help" hidden={!open}>{help}</div>
    </div>
  )
}

/** Columnas en escalera (decorativas: la tabla que las acompaña es la fuente accesible). */
export function EscStairs({ columns }: { columns: { label: string; total: string; parts: { value: number; tone: EscTone }[] }[] }) {
  const max = Math.max(...columns.map((column) => column.parts.reduce((sum, part) => sum + part.value, 0)), 0.0001)
  return (
    <div className="esc-stairs" aria-hidden="true">
      {columns.map((column, index) => (
        <div key={column.label} className="esc-stairs__col">
          <span className="esc-stairs__total">{column.total}</span>
          <div className="esc-stairs__stack">
            {column.parts.map((part, partIndex) => (
              <span
                key={partIndex}
                className={`esc-stairs__part esc-fill--${part.tone}`}
                style={{ height: `${(part.value / max) * 100}%`, animationDelay: `${index * 90}ms` }}
              />
            ))}
          </div>
          <span className="esc-stairs__label">{column.label}</span>
        </div>
      ))}
    </div>
  )
}

/** Indicador de escala con aguja. Decorativo: la cifra va escrita al lado. */
export function EscNeedle({ value, min, max, minLabel, maxLabel }: { value: number; min: number; max: number; minLabel: string; maxLabel: string }) {
  const position = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  return (
    <div className="esc-needle" aria-hidden="true">
      <div className="esc-needle__scale" />
      <div className="esc-needle__pin" style={{ left: `${position}%` }}><span /></div>
      <span className="esc-needle__min">{minLabel}</span>
      <span className="esc-needle__max">{maxLabel}</span>
    </div>
  )
}

/** Resumen como ecuación: a − b = c. */
export function EscEquation({ terms, ops, className }: {
  terms: { label: ReactNode; value: ReactNode; tone?: EscTone; hero?: boolean }[]
  ops: string[]
  className?: string
}) {
  return (
    <div className={`esc-equation${className ? ` ${className}` : ''}`}>
      {terms.map((term, index) => (
        <div key={index} className="esc-equation__cell">
          {index > 0 ? <span className="esc-equation__op" aria-hidden="true">{ops[index - 1]}</span> : null}
          <div className="esc-equation__term">
            <span className="esc-equation__label">{term.label}</span>
            <strong className={`esc-equation__value${term.tone ? ` esc-tone--${term.tone}` : ''}${term.hero ? ' esc-equation__value--hero' : ''}`}>{term.value}</strong>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Interruptor segmentado (vista mensual / anual). */
export function EscSegmented<T extends string>({ label, value, options, onChange }: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="esc-segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}
