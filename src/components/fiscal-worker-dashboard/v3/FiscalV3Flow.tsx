/*
 * v3 de la calculadora fiscal (/calculadora-fiscal/v3): recorrido de dos velocidades.
 *
 * Corto: apuesta → salario → primera respuesta con los supuestos a la vista →
 * cuatro bloques (nómina, situación, compras, lo que tienes) → tu ticket fiscal.
 * El contenido didáctico de los pasos 1-10 sigue entero en el modo «Aprender»,
 * que monta el dashboard y al que se llega desde cada línea del resultado.
 *
 * Por qué así: ai/rediseno-calculadora/04-psicologia-finalizacion-v2.md.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import { ArrowRight } from 'lucide-react'
import { SalarySlider } from '../../ui/SalarySlider'
import {
  WorkerConsumptionTaxesCard,
  WorkerWealthTaxesCard,
  averageConsumptionDraft,
} from '../../worker-salary-dashboard'
import type {
  ConsumptionTaxesDraft,
  ConsumptionTaxesResult,
  PersonalReductionResult,
  WealthTaxesDraft,
  WealthTaxesResult,
} from '../../worker-salary-dashboard'
import { DDisclosure, EscGuessRange, EscHundredCells } from '../../worker-salary-dashboard/escenario/EscenarioParts'
import '../../worker-salary-dashboard/escenario/EscenarioSummary.css'
import { DEFAULT_SCENARIO } from '../fiscalScenario'
import { REGION_LABELS } from '../fiscalResult'
import type { FiscalResultInputs } from '../fiscalResult'
import {
  V3AssumptionChips,
  V3Discovery,
  V3LiveFigure,
  V3Nav,
  V3Prediction,
  V3Progress,
} from './V3Parts'
import type { V3Assumption } from './V3Parts'
import { V3Situacion } from './V3Situacion'
import { V3Ticket } from './V3Ticket'
import {
  V3_BLOCKS,
  V3_BLOCK_LABELS,
  attributeChanges,
  euro,
  evaluateTicket,
} from './v3Flow'
import type { V3Block, V3FlowState, V3Stage, V3TicketContext } from './v3Flow'
import './FiscalV3.css'

/** Tope del deslizador de la apuesta: el cálculo real no llega a 70 € de cada 100. */
const GUESS_MAX = 70
const GUESS_TOLERANCE = 3

function guessVerdict(guess: number, real: number) {
  const diff = real - guess
  if (Math.abs(diff) <= GUESS_TOLERANCE) return 'Casi exacto: tu intuición está muy cerca del cálculo.'
  if (diff > 0) {
    return `Te quedaste corto por ${diff} €. Hay dos partes que no se ven en la nómina: la cotización que paga tu empresa y el IVA de lo que compras.`
  }
  return `Te pasaste por ${-diff} €. Con este salario, lo que acaba en Hacienda y la Seguridad Social es menos de lo que pensabas.`
}

export type FiscalV3FlowProps = {
  flow: V3FlowState
  setFlow: (update: (current: V3FlowState) => V3FlowState) => void
  resultInputs: FiscalResultInputs
  ticketContext: V3TicketContext
  /** Bruto anual (salario + complementos) y el cálculo intermedio que piden los bloques. */
  grossSalaryAnnual: number
  personalContext: { baseBeforeReductions: number; netWorkIncome: number }
  taxGuess: number | null
  onTaxGuessChange: (value: number | null) => void
  onSalaryChange: (grossAnnual: number) => void
  regionOptions: { value: string; label: string }[]
  onRegionChange: (region: string) => void
  personalAdjustments: PersonalReductionResult | null
  onPersonalResultChange: (result: PersonalReductionResult) => void
  consumption: {
    draft: ConsumptionTaxesDraft | null
    result: ConsumptionTaxesResult | null
    onDraftChange: (draft: ConsumptionTaxesDraft) => void
    onResultChange: (result: ConsumptionTaxesResult) => void
    onReset: () => void
  }
  wealth: {
    draft: WealthTaxesDraft | null
    onDraftChange: (draft: WealthTaxesDraft) => void
    onResultChange: (result: WealthTaxesResult) => void
  }
  onLearn: (stepId: number) => void
  onRestart: () => void
  actions: { downloadImage: () => void; share: () => void; downloadCopy: () => void }
  notice: string | null
  /** Texto para copiar a mano si el portapapeles no está disponible. */
  fallbackText: string | null
  /** Aviso de «tu cálculo sigue guardado»: solo al abrir la página con un recorrido a medias. */
  resumeOpen: boolean
  onDismissResume: () => void
}

export function FiscalV3Flow(props: FiscalV3FlowProps) {
  const { flow, setFlow, resultInputs, ticketContext } = props
  const stage = flow.stage
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  const { baseline, current, steps } = useMemo(
    () => attributeChanges(resultInputs, ticketContext),
    [resultInputs, ticketContext],
  )
  const evaluate = useCallback(
    (overrides: Partial<FiscalResultInputs>) => evaluateTicket({ ...resultInputs, ...overrides }, ticketContext),
    [resultInputs, ticketContext],
  )

  // La última respuesta que movió la cifra, para la franja fija de los bloques.
  const [lastDelta, setLastDelta] = useState(0)
  const previousValue = useRef(current.takeHomePer100)
  useEffect(() => {
    const delta = current.takeHomePer100 - previousValue.current
    previousValue.current = current.takeHomePer100
    if (Math.abs(delta) >= 0.05) setLastDelta(delta)
  }, [current.takeHomePer100])

  // Cada pantalla empieza arriba y el foco va a su titular.
  const previousStage = useRef(stage)
  useEffect(() => {
    if (previousStage.current === stage) return
    previousStage.current = stage
    setLastDelta(0)
    window.scrollTo({ top: 0 })
    headingRef.current?.focus()
  }, [stage])

  const go = (next: V3Stage) => setFlow((state) => ({ ...state, stage: next }))
  const finishBlock = (block: V3Block, next: V3Stage) =>
    setFlow((state) => ({ ...state, done: { ...state.done, [block]: true }, stage: next }))

  const region = resultInputs.region
  const regionLabel = REGION_LABELS[region] ?? region
  const situacionConfirmed = props.personalAdjustments !== null
  const assumptions: V3Assumption[] = [
    {
      id: 'region',
      label: regionLabel,
      status: flow.done.nomina || region !== DEFAULT_SCENARIO.region ? 'tuyo' : 'supuesto',
      onSelect: () => go('nomina'),
    },
    {
      id: 'situacion',
      label: situacionConfirmed ? 'Tu situación personal' : 'Sin hijos ni otras situaciones',
      status: situacionConfirmed || flow.done.situacion ? 'tuyo' : 'supuesto',
      onSelect: () => go('situacion'),
    },
    {
      id: 'compras',
      label: props.consumption.result ? 'Tu reparto de gastos' : 'Gasto medio (INE)',
      status: props.consumption.result || flow.done.compras ? 'tuyo' : 'supuesto',
      onSelect: () => go('compras'),
    },
    {
      id: 'patrimonio',
      label: current.wealth > 0 ? 'Tu casa o tu coche' : 'Sin vivienda ni coche',
      status: flow.done.patrimonio || current.wealth > 0 ? 'tuyo' : 'supuesto',
      onSelect: () => go('patrimonio'),
    },
  ]

  const resume = props.resumeOpen ? (
    <div className="v3-resume" role="status">
      <p>
        Tu cálculo sigue guardado en este dispositivo.
        {stage !== 'ticket'
          ? ` Te ${V3_BLOCKS.filter((block) => !flow.done[block]).length === 1 ? 'falta' : 'faltan'}: ${V3_BLOCKS.filter((block) => !flow.done[block]).map((block) => V3_BLOCK_LABELS[block].short).join(', ')}.`
          : ''}
      </p>
      <div className="d-row">
        <button type="button" className="d-outline" onClick={props.onDismissResume}>Seguir donde lo dejé</button>
        <button type="button" className="d-ghost" onClick={() => { props.onDismissResume(); props.onRestart() }}>Empezar otro caso</button>
      </div>
    </div>
  ) : null

  if (stage === 'pregunta') return <V3Question headingRef={headingRef} onAnswer={(value) => { props.onTaxGuessChange(value); go('salario') }} initial={props.taxGuess} />

  if (stage === 'salario') {
    return (
      <section className="d-page v3-entry" aria-labelledby="v3-salary-title">
        <div className="d-stack">
          <p className="d-caps">Pregunta 2 de 2</p>
          <h1 id="v3-salary-title" ref={headingRef} tabIndex={-1} className="v3-q__title">
            ¿Cuál es tu <span className="d-acc">salario?</span>
          </h1>
          <p className="d-lead">
            Bruto al año, antes de impuestos. Si no lo sabes exacto, una cifra aproximada vale. El
            cálculo se hace en tu navegador.
          </p>
        </div>
        <div className="d-close">
          <SalarySlider
            id="v3-salary"
            value={props.grossSalaryAnnual}
            onChange={props.onSalaryChange}
            min={14_000}
            max={500_000}
            step={1_000}
            markers={[14_000, 50_000, 120_000, 500_000]}
            scale="log"
            unitLabel="brutos al año"
            ariaLabel="Tu salario bruto anual"
          />
        </div>
        <div className="d-row d-close v3-entry__actions">
          <button type="button" className="d-cta" onClick={() => go('revelacion')}>
            Ver mi resultado <ArrowRight size={22} aria-hidden="true" />
          </button>
          <button type="button" className="d-ghost" onClick={() => go('pregunta')}>Atrás</button>
        </div>
      </section>
    )
  }

  if (stage === 'revelacion') {
    return (
      <V3Reveal
        headingRef={headingRef}
        guess={props.taxGuess}
        ticket={current}
        assumptions={assumptions}
        regionOptions={props.regionOptions}
        region={region}
        onRegionChange={props.onRegionChange}
        grossSalaryAnnual={props.grossSalaryAnnual}
        onSalaryChange={props.onSalaryChange}
        onAdjust={() => go(V3_BLOCKS.find((block) => !flow.done[block]) ?? 'ticket')}
        onLearn={() => props.onLearn(1)}
      />
    )
  }

  if (stage === 'ticket') {
    return (
      <>
        {resume}
        <V3Ticket
          ticket={current}
          baseline={baseline}
          steps={steps}
          guess={props.taxGuess}
          pending={assumptions.filter((item) => item.status === 'supuesto')}
          regionOptions={props.regionOptions}
          region={region}
          salaryInput={resultInputs.salary}
          evaluate={evaluate}
          onLearn={props.onLearn}
          actions={props.actions}
          notice={props.notice}
          fallbackText={props.fallbackText}
        />
        <nav className="v3-nav v3-nav--static" aria-label="Navegación del recorrido">
          <button type="button" className="v3-nav__back" onClick={() => go('patrimonio')}>
            <span aria-hidden="true">←</span> Revisar mis respuestas
          </button>
        </nav>
      </>
    )
  }

  if (stage === 'aprender') return null

  // Bloques
  const block = stage
  const blockIndex = V3_BLOCKS.indexOf(block)
  const previous: V3Stage = blockIndex === 0 ? 'revelacion' : V3_BLOCKS[blockIndex - 1]
  const nextStage: V3Stage = blockIndex + 1 < V3_BLOCKS.length ? V3_BLOCKS[blockIndex + 1] : 'ticket'
  const nextLabel = nextStage === 'ticket'
    ? 'Ver mi ticket fiscal'
    : nextStage === 'patrimonio'
      ? 'Último bloque: casa y coche'
      : `Seguir: ${V3_BLOCK_LABELS[nextStage as V3Block].short}`

  let content: ReactNode = null
  if (block === 'nomina') {
    const grossMonthly = current.gross / 12
    const predictionMax = Math.max(100, Math.round(grossMonthly / 100) * 100)
    content = (
      <>
        <div className="v3-field v3-field--big">
          <div className="v3-field__text">
            <label htmlFor="v3-region" className="v3-field__label">¿Dónde vives?</label>
            <span className="v3-field__help">Están las 15 comunidades de régimen común. País Vasco, Navarra, Ceuta y Melilla aún no.</span>
          </div>
          <select id="v3-region" className="d-select" value={region} onChange={(event) => props.onRegionChange(event.target.value)}>
            {props.regionOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <V3Prediction
          question="¿Cuánto crees que paga tu empresa al mes por ti, además de tu bruto?"
          max={predictionMax}
          step={10}
          format={(value) => euro(value)}
          valueText={(value) => `${value} euros al mes`}
          answer={flow.predictions.empresa}
          onAnswer={(value) => setFlow((state) => ({ ...state, predictions: { ...state.predictions, empresa: value } }))}
          reveal={(answer) => (
            <V3Discovery kicker="Lo que no ves en tu nómina" figure={<span className="d-company">{euro(current.employer / 12)}</span>} tone="company">
              <p>
                al mes paga tu empresa en cotizaciones por ti. No aparecen en tu nómina, pero forman
                parte de lo que cuesta tu puesto: {euro(current.laborCost / 12)} al mes.
              </p>
              {answer !== null ? <p className="d-note">Tú dijiste {euro(answer)}.</p> : null}
            </V3Discovery>
          )}
        />
        <DDisclosure label="Ajustar detalles: grupo, contrato y actividad">
          <div className="d-stack v3-more">
            <p className="d-small">
              Hemos usado el grupo de cotización 7 y la actividad 62. El grupo solo cambia algo si tu
              sueldo está por debajo de la base mínima o por encima de la máxima; la actividad cambia
              lo que paga tu empresa por accidentes de trabajo.
            </p>
            <div className="d-row">
              <button type="button" className="d-outline" onClick={() => props.onLearn(2)}>Grupo de cotización</button>
              <button type="button" className="d-outline" onClick={() => props.onLearn(3)}>Contrato y actividad</button>
            </div>
          </div>
        </DDisclosure>
      </>
    )
  } else if (block === 'situacion') {
    content = (
      <>
        <V3Situacion
          initial={props.personalAdjustments}
          context={{ ...props.personalContext, declaredGrossWorkIncome: current.gross }}
          onChange={props.onPersonalResultChange}
          onLearn={props.onLearn}
        />
        <V3Discovery kicker="Tu IRPF de este año" figure={<span className="d-worker">{euro(current.irpf)}</span>} tone="worker">
          <p>
            es el {((current.irpf / Math.max(1, current.gross)) * 100).toLocaleString('es-ES', { maximumFractionDigits: 1 })} % de tu
            bruto: {euro(current.irpf / 12)} al mes.
          </p>
        </V3Discovery>
      </>
    )
  } else if (block === 'compras') {
    content = (
      <V3Compras
        {...props.consumption}
        ticket={current}
        netAnnual={current.netPayroll}
        prediction={flow.predictions.iva}
        onPrediction={(value) => setFlow((state) => ({ ...state, predictions: { ...state.predictions, iva: value } }))}
      />
    )
  } else {
    content = (
      <WorkerWealthTaxesCard
        compact
        initialDraft={props.wealth.draft}
        onDraftChange={props.wealth.onDraftChange}
        onResultChange={props.wealth.onResultChange}
      />
    )
  }

  const leads: Record<V3Block, string> = {
    nomina: 'Una pregunta: dónde vives. Tu IRPF se calcula con dos escalas distintas: la estatal y la de tu comunidad.',
    situacion: '¿Algo de esto te aplica? Si te aplica, probablemente pagas menos IRPF de lo que muestra la aproximación.',
    compras: 'El impuesto que va dentro del precio. Depende de cómo gastas, no solo de lo que cobras.',
    patrimonio: 'Hay impuestos que no dependen de tu consumo, sino de lo que posees. Dos preguntas.',
  }

  return (
    <>
      {resume}
      <div className="v3-blockbar">
        <V3Progress current={block} done={flow.done} />
        <V3LiveFigure value={current.takeHomePer100} baseline={baseline.takeHomePer100} delta={lastDelta} />
      </div>
      <section className="d-page v3-block" aria-labelledby="v3-block-title" key={block}>
        <div className="d-stack">
          <h1 id="v3-block-title" ref={headingRef} tabIndex={-1} className="v3-block__title" style={{ '--d-chars': 14 } as CSSProperties}>
            {V3_BLOCK_LABELS[block].title}
          </h1>
          <p className="d-lead">{leads[block]}</p>
        </div>
        <div className="d-stack v3-block__content d-close">{content}</div>
      </section>
      <V3Nav onBack={() => go(previous)} next={() => finishBlock(block, nextStage)} nextLabel={nextLabel} />
    </>
  )
}

/** Pregunta 1 de 2, con la promesa de lo que se obtiene encima. */
function V3Question({ headingRef, onAnswer, initial }: {
  headingRef: RefObject<HTMLHeadingElement | null>
  onAnswer: (value: number) => void
  initial: number | null
}) {
  const [draft, setDraft] = useState<number | null>(initial)
  const isPending = draft === null
  return (
    <section className="d-page v3-entry" aria-labelledby="v3-q-title">
      <header className="v3-hero">
        <p className="v3-hero__promise">
          <strong>A dónde van los 100 € que cuesta tu trabajo.</strong> Primera respuesta en 2
          preguntas; después, 4 bloques cortos para ajustarla a tu caso.
        </p>
        <ul className="v3-hero__trust" aria-label="Condiciones">
          <li>Gratis</li>
          <li>Sin registro</li>
          <li>Nada sale de tu navegador</li>
          <li>Normativa del BOE y la AEAT, datos del INE</li>
        </ul>
      </header>
      <div className="d-stack d-close">
        <p className="d-caps">Pregunta 1 de 2</p>
        <h1 id="v3-q-title" ref={headingRef} tabIndex={-1} className="v3-q__title">
          De cada 100 € que cuesta tu trabajo,{' '}
          <span className="d-acc">¿cuántos crees que acaban en Hacienda y la Seguridad Social?</span>
        </h1>
        <p className="d-small">
          Piensa en todo: lo que te descuentan en la nómina, lo que paga tu empresa por tenerte
          contratado y los impuestos de lo que compras.
        </p>
      </div>
      <div className="v3-q__answer d-close">
        <div className="v3-q__figure">
          <p className={`d-fig v3-q__value${isPending ? ' is-pending' : ''}`} aria-hidden="true">
            {isPending ? '¿?' : `${draft} €`}
          </p>
          <p className="d-lab" aria-live="polite">{isPending ? 'Mueve el deslizador para responder' : 'de cada 100 €'}</p>
        </div>
        <div className="d-stack">
          <EscGuessRange
            value={draft}
            max={GUESS_MAX}
            onChange={setDraft}
            ariaLabel="Euros de cada 100 que crees que acaban en Hacienda y la Seguridad Social"
            valueText={isPending ? 'Sin responder' : `${draft} euros de cada 100`}
          />
          <div className="esc-q__scale d-num" aria-hidden="true">
            <span>0 €</span>
            <span>{GUESS_MAX / 2} €</span>
            <span>{GUESS_MAX} €</span>
          </div>
          <div className="esc-q__cells v3-q__cells" aria-hidden="true">
            {Array.from({ length: 100 }, (_, index) => (
              <span key={index} className={!isPending && index < (draft ?? 0) ? 'is-on' : undefined} style={{ animationDelay: `${index * 6}ms` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="d-stack d-close">
        <button type="button" className="d-cta" disabled={isPending} onClick={() => draft !== null && onAnswer(draft)}>
          Siguiente <ArrowRight size={22} aria-hidden="true" />
        </button>
        <p className="d-note">No hay respuesta mala: es para ver cuánto se acerca tu intuición al cálculo.</p>
      </div>
    </section>
  )
}

/** Primera respuesta: la comparación arriba, los supuestos a la vista y la invitación a ajustarlos. */
function V3Reveal({ headingRef, guess, ticket, assumptions, regionOptions, region, onRegionChange, grossSalaryAnnual, onSalaryChange, onAdjust, onLearn }: {
  headingRef: RefObject<HTMLHeadingElement | null>
  guess: number | null
  ticket: ReturnType<typeof evaluateTicket>
  assumptions: V3Assumption[]
  regionOptions: { value: string; label: string }[]
  region: string
  onRegionChange: (region: string) => void
  grossSalaryAnnual: number
  onSalaryChange: (value: number) => void
  onAdjust: () => void
  onLearn: () => void
}) {
  const [regionOpen, setRegionOpen] = useState(false)
  const taxes = ticket.taxesPer100
  const takeHome = 100 - taxes
  const diff = guess !== null ? guess - taxes : 0
  const chips = assumptions.map((item) => (item.id === 'region' ? { ...item, onSelect: () => setRegionOpen((open) => !open) } : item))
  const segments = [
    { id: 'net', label: 'Te lo quedas tú', value: ticket.takeHome, detail: 'Lo que puedes gastar o ahorrar después de todo', tone: 'positive' as const, cls: 'd-acc' },
    { id: 'worker', label: 'IRPF y cotizaciones tuyas', value: ticket.worker + ticket.irpf, detail: 'Lo que se descuenta directamente de tu nómina', tone: 'worker' as const, cls: 'd-worker' },
    { id: 'company', label: 'Cotizaciones de tu empresa', value: ticket.employer, detail: 'No sale de tu nómina, pero tu empresa lo paga por ti', tone: 'company' as const, cls: 'd-company' },
    { id: 'consumption', label: 'IVA y otros al gastar', value: ticket.vat + ticket.special + ticket.wealth, detail: 'Se te van poco a poco cada vez que compras algo', tone: 'state' as const, cls: 'd-blue' },
  ].filter((segment) => segment.value > 0)
  const share = (value: number) => Math.round((value / Math.max(1, ticket.laborCost)) * 100)

  return (
    <section className="d-page v3-reveal" aria-labelledby="v3-reveal-title">
      <div className="d-stack">
        <p className="d-caps">Tu primera respuesta</p>
        <h1 id="v3-reveal-title" ref={headingRef} tabIndex={-1} className="v3-q__title">
          De cada 100 € que cuesta tu trabajo, <span className="d-acc">{taxes} € acaban en Hacienda y la Seguridad Social</span>
        </h1>
      </div>

      {guess !== null ? (
        <section className="d-stack v3-reveal__duel d-close" aria-label="Tu respuesta frente al cálculo">
          <dl className="esc-q__rows">
            <div>
              <dt>Tú dijiste</dt>
              <dd>
                <span className="d-track esc-q__track"><span className="d-bar d-paint-worker" style={{ width: `${guess}%` }} /></span>
                <strong className="d-fig d-fig-m d-worker">{guess} €</strong>
              </dd>
            </div>
            <div>
              <dt>El cálculo</dt>
              <dd>
                <span className="d-track esc-q__track"><span className="d-bar d-paint-positive-light" style={{ width: `${taxes}%`, animationDelay: '250ms' }} /></span>
                <strong className="d-fig d-fig-m d-acc">{taxes} €</strong>
              </dd>
            </div>
          </dl>
          <p className="d-txt v3-reveal__verdict">
            <strong className="d-yellow">{Math.abs(diff) <= GUESS_TOLERANCE ? '≈ ' : diff < 0 ? `−${-diff} € · ` : `+${diff} € · `}</strong>
            {guessVerdict(guess, taxes)}
          </p>
        </section>
      ) : null}

      <p className="d-txt d-close">
        A tu bolsillo llegan <strong className="d-acc">{takeHome} €</strong>: son {euro(ticket.takeHome / 12)} al mes
        de los {euro(ticket.laborCost / 12)} al mes que cuesta tu puesto.
      </p>

      <section className="v3-panel d-close" aria-labelledby="v3-adjust-title">
        <V3AssumptionChips items={chips} />
        {regionOpen ? (
          <div className="v3-field d-unfold">
            <div className="v3-field__text">
              <label htmlFor="v3-reveal-region" className="v3-field__label">¿Dónde vives?</label>
            </div>
            <select id="v3-reveal-region" className="d-select" value={region} onChange={(event) => onRegionChange(event.target.value)}>
              {regionOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        ) : null}
        <p id="v3-adjust-title" className="d-txt">
          Es una aproximación: tu comunidad, tu familia y tu forma de gastar pueden cambiarla.
          ¿Lo afinamos?
        </p>
        <div className="d-row v3-reveal__actions">
          <button type="button" className="d-cta d-cta--big v3-cta" onClick={onAdjust}>
            <span className="v3-cta__text">Ajustar a mi caso</span>
            <span className="v3-cta__meta">4 bloques</span>
            <ArrowRight size={22} aria-hidden="true" />
          </button>
          <button type="button" className="d-ghost" onClick={onLearn}>Ver cómo se calcula</button>
        </div>
      </section>

      <section className="esc-q__split" aria-label="A dónde va cada parte">
        <EscHundredCells
          label={`Reparto del coste total de tu puesto: ${segments.map((segment) => `${segment.label}, ${share(segment.value)} por ciento`).join('; ')}`}
          parts={segments.map((segment) => ({ value: segment.value, tone: segment.tone }))}
        />
        <ul className="esc-q__list">
          {segments.map((segment) => (
            <li key={segment.id}>
              <span className={`d-swatch esc-q__dot esc-q__dot--${segment.id}`} aria-hidden="true" />
              <span className="esc-q__list-text">
                <strong>{segment.label}</strong>
                <span>{segment.detail}</span>
              </span>
              <span className="esc-q__list-value">
                <strong className={`d-fig d-fig-s ${segment.cls}`}>{euro(segment.value / 12)}</strong>
                <span className="d-num">{share(segment.value)} % · al mes</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="d-stack">
        <DDisclosure label={`Cambiar el sueldo (${euro(grossSalaryAnnual)} al año)`}>
          <div className="v3-more">
            <SalarySlider
              id="v3-reveal-salary"
              value={grossSalaryAnnual}
              onChange={onSalaryChange}
              min={14_000}
              max={500_000}
              step={1_000}
              markers={[14_000, 50_000, 120_000, 500_000]}
              scale="log"
              unitLabel="brutos al año"
              ariaLabel="Salario bruto anual"
            />
          </div>
        </DDisclosure>
      </div>
    </section>
  )
}

/** Bloque «Lo que compras»: la media del INE por defecto; ajustar es opcional. */
function V3Compras({ draft, result, onDraftChange, onResultChange, onReset, ticket, netAnnual, prediction, onPrediction }: FiscalV3FlowProps['consumption'] & {
  ticket: ReturnType<typeof evaluateTicket>
  netAnnual: number
  prediction: number | null | undefined
  onPrediction: (value: number | null) => void
}) {
  const [mode, setMode] = useState<'media' | 'ajustar'>(result ? 'ajustar' : 'media')
  const monthlyTax = (ticket.vat + ticket.special) / 12
  const predictionMax = Math.max(50, Math.round((netAnnual / 12) * 0.3 / 10) * 10)
  return (
    <>
      <V3Prediction
        question="¿Cuánto IVA crees que pagas al mes?"
        max={predictionMax}
        step={5}
        format={(value) => euro(value)}
        valueText={(value) => `${value} euros al mes`}
        answer={prediction}
        onAnswer={onPrediction}
        reveal={(answer) => (
          <V3Discovery kicker="Lo que pagas al comprar" figure={<span className="d-blue">{euro(monthlyTax)}</span>} tone="blue">
            <p>al mes se te van en IVA{ticket.special > 0 ? ' e impuestos especiales' : ''}, ya incluidos en los precios.</p>
            {answer !== null ? <p className="d-note">Tú dijiste {euro(answer)}.</p> : null}
          </V3Discovery>
        )}
      />
      <div className="v3-field v3-field--big">
        <div className="v3-field__text">
          <span className="v3-field__label">¿Cómo lo calculamos?</span>
          <span className="v3-field__help">
            {mode === 'media'
              ? `Con la media de los hogares con ingresos parecidos: un ${ticket.vatRate.toLocaleString('es-ES', { maximumFractionDigits: 1 })} % de lo que cobras (INE, Encuesta de Presupuestos Familiares 2024). Es una estimación.`
              : 'Con tu reparto del gasto. Empieza en un reparto orientativo: cámbialo por tus cifras.'}
          </span>
        </div>
        <div className="d-segs" role="group" aria-label="Cómo calcular el IVA">
          <button type="button" aria-pressed={mode === 'media'} onClick={() => { setMode('media'); onReset() }}>Me vale la media</button>
          <button type="button" aria-pressed={mode === 'ajustar'} onClick={() => setMode('ajustar')}>Prefiero ajustarlo</button>
        </div>
      </div>
      {mode === 'ajustar' ? (
        <div className="v3-embed d-unfold">
          <WorkerConsumptionTaxesCard
            introChoiceMode="off"
            initialBudgetAnnual={netAnnual}
            initialDraft={draft ?? averageConsumptionDraft(netAnnual)}
            onDraftChange={onDraftChange}
            onResultChange={onResultChange}
          />
        </div>
      ) : null}
    </>
  )
}
