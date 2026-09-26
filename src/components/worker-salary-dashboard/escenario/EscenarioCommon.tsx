import type { ReactNode } from 'react'
import './EscenarioCommon.css'

type EscQuestionProps = {
  question: ReactNode
  help?: ReactNode
  value: boolean | null
  onChange: (value: boolean) => void
  children?: ReactNode
}

/** Pregunta Sí/No de escenario: la respuesta queda siempre disponible para teclado y tacto. */
export function EscQuestion({ question, help, value, onChange, children }: EscQuestionProps) {
  return (
    <section className="esc-question">
      <div className="esc-question__copy">
        <h3>{question}</h3>
        {help ? <div className="esc-question__help">{help}</div> : null}
      </div>
      <div className="esc-question__answer" role="group" aria-label={typeof question === 'string' ? question : 'Respuesta'}>
        <button type="button" aria-pressed={value === true} onClick={() => onChange(true)}>Sí</button>
        <button type="button" aria-pressed={value === false} onClick={() => onChange(false)}>No</button>
      </div>
      {children ? <div className="esc-question__follow-up">{children}</div> : null}
    </section>
  )
}

/** Capítulo de las partes largas del cálculo; conserva el contenido que recibe cada paso. */
export function EscChapter({ number, title, children }: { number: string; title: ReactNode; children: ReactNode }) {
  return (
    <section className="esc-chapter" aria-labelledby={`esc-chapter-${number}`}>
      <span className="esc-chapter__number" aria-hidden="true">{number}</span>
      <div className="esc-chapter__content">
        <h2 id={`esc-chapter-${number}`}>{title}</h2>
        {children}
      </div>
    </section>
  )
}

export type EscPayrollRow = {
  id: string
  code: string
  concept: string
  units?: string
  price?: string
  earnings?: string
  deductions?: string
}

export type EscPayrollTotal = { id: string; label: string; value: string }
export type EscPayrollBase = { id: string; concept: string; base?: string; rate?: string; company?: string }

type EscNominaProps = {
  rows: EscPayrollRow[]
  totals: EscPayrollTotal[]
  baseRows: EscPayrollBase[]
  netPay: string
  resultLabel: string
  resultValue: string
  highlighted: string[]
  workerHighlighted: string[]
  companyHighlighted: string[]
}

function payrollTone(id: string, highlighted: string[], workerHighlighted: string[], companyHighlighted: string[]) {
  if (workerHighlighted.includes(id)) return 'worker'
  if (companyHighlighted.includes(id)) return 'company'
  if (highlighted.includes(id)) return 'positive'
  return 'muted'
}

/** Nómina de escenario: conserva las mismas filas y cifras en vivo de la nómina clásica. */
export function EscNomina({
  rows,
  totals,
  baseRows,
  netPay,
  resultLabel,
  resultValue,
  highlighted,
  workerHighlighted,
  companyHighlighted,
}: EscNominaProps) {
  const tone = (id: string) => payrollTone(id, highlighted, workerHighlighted, companyHighlighted)
  return (
    <figure className="esc-nomina" aria-label="Nómina simplificada con la parte de este paso resaltada">
      <figcaption>Nómina simplificada: lo resaltado es la parte que se trata en este paso.</figcaption>
      <div className="esc-nomina__grid">
        <div className="esc-nomina__main">
          <header className="esc-nomina__header">
            <span>RECIBO INDIVIDUAL JUSTIFICATIVO DEL PAGO DE SALARIOS</span>
            <strong>01.05.2025 – 31.05.2025 · [DATOS PERSONALES OCULTOS]</strong>
          </header>
          <section className="esc-nomina__group" aria-label="Devengos y deducciones">
            <div className="esc-nomina__group-title"><span>DEVENGOS</span><span>DEDUCCIONES</span></div>
            <div className="esc-nomina__head"><span>COD.</span><span>CONCEPTO</span><span>PRECIO</span><span>IMPORTE</span></div>
            {rows.map((row) => (
              <div className={`esc-nomina__row esc-nomina__row--${tone(row.id)}`} key={row.id}>
                <span>{row.code}</span>
                <span>{row.concept}</span>
                <span>{row.price ?? ''}</span>
                <strong>{row.earnings ?? row.deductions ?? ''}</strong>
              </div>
            ))}
          </section>
          <section className="esc-nomina__company" aria-label="Aportación de la empresa">
            <span>APORTACIÓN DE LA EMPRESA</span>
            {baseRows.filter((row) => row.company).map((row) => (
              <div className={`esc-nomina__row esc-nomina__row--${tone(row.id)}`} key={row.id}>
                <span>—</span><span>{row.concept}</span><span>{row.rate ?? ''}</span><strong>{row.company}</strong>
              </div>
            ))}
          </section>
        </div>
        <aside className="esc-nomina__bases" aria-label="Bases y líquido total">
          {totals.map((total) => (
            <div className={`esc-nomina__base esc-nomina__base--${tone(total.id)}`} key={total.id}>
              <span>{total.label}</span><strong>{total.value}</strong>
            </div>
          ))}
          <div className={`esc-nomina__liquid esc-nomina__row--${tone('net-pay')}`}>
            <span>LÍQUIDO TOTAL</span><strong>{netPay}</strong>
          </div>
          <div className="esc-nomina__result"><span>{resultLabel}</span><strong>{resultValue}</strong></div>
        </aside>
      </div>
    </figure>
  )
}
