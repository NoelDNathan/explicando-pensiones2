/*
 * Paso 11 «Comprueba lo aprendido»: repaso opcional del recorrido.
 *
 * - Ninguna respuesta se escribe: opcion unica, opcion multiple, verdadero o
 *   falso, ordenar, emparejar, clasificar y deslizador.
 * - Ordenar y emparejar se arrastran con eventos de puntero (raton y dedo).
 *   Las flechas de «ordenar» y el clic de «emparejar» siguen ahi como
 *   alternativa accesible con teclado.
 * - Se corrige apartado a apartado y cada pregunta lleva un boton «No me quedo
 *   claro» para senalar que la explicacion del paso no funciona.
 * - El progreso se guarda en el navegador (localStorage). Al terminar, el
 *   resultado se envia solo y de forma anonima (ver `knowledgeCheckReporting`):
 *   aciertos por apartado y preguntas marcadas, nada de la calculadora ni de la
 *   persona.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  GraduationCap,
  GripVertical,
  Lightbulb,
  ListChecks,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import {
  KNOWLEDGE_CHECK_SECTIONS,
  KNOWLEDGE_CHECK_TOTAL_QUESTIONS,
  KNOWLEDGE_CHECK_VERSION,
} from './workerKnowledgeCheckQuestions'
import type {
  KnowledgeMatchPair,
  KnowledgeOrderItem,
  KnowledgeQuestion,
  KnowledgeSection,
} from './workerKnowledgeCheckQuestions'
import { sendKnowledgeCheckReport } from './knowledgeCheckReporting'
import type { KnowledgeCheckReport, ReportStatus } from './knowledgeCheckReporting'
import { useFiscalVariant } from '../fiscal-worker-dashboard/fiscalVariant'
import './WorkerKnowledgeCheckCard.css'

const STORAGE_KEY = 'fwd-knowledge-check-2025-v2'
/** Pixeles que hay que recorrer antes de tratar un clic como arrastre. */
const ORDER_DRAG_THRESHOLD = 4

type AnswerValue =
  | { kind: 'single'; choiceId: string }
  | { kind: 'multiple'; choiceIds: string[] }
  | { kind: 'truefalse'; values: Record<string, boolean> }
  | { kind: 'order'; order: string[] }
  | { kind: 'match'; links: Record<string, string> }
  | { kind: 'classify'; assignments: Record<string, string> }
  | { kind: 'slider'; value: number }

type AnswerMap = Record<string, AnswerValue>

/*
 * Arrastre de «ordenar» y «emparejar». Se hace con eventos de puntero (no con
 * la API HTML5 de drag & drop) para que funcione igual con raton y con dedo, y
 * porque el elemento que sigue al cursor se dibuja aparte (`wkcc-drag-ghost`).
 */
type DragState =
  | { kind: 'order'; questionId: string; itemId: string; label: string; x: number; y: number }
  | {
      kind: 'match'
      questionId: string
      pairId: string
      label: string
      x: number
      y: number
      /** Tarjeta de la izquierda sobre la que se esta soltando, si hay alguna. */
      over: string | null
    }

type StoredState = {
  phase: Phase
  sectionIndex: number
  answers: AnswerMap
  checkedSections: Record<string, boolean>
  unclear: Record<string, boolean>
}

type Phase = 'intro' | 'quiz' | 'results'

type WorkerKnowledgeCheckCardProps = {
  /** Salta a otro paso del recorrido (repasar un apartado o continuar). */
  onGoToStep?: (stepId: number) => void
  /** Paso al que lleva «Saltar este paso» y «Continuar». */
  nextStepId?: number
}

const percentFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 })
const decimalFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 })
const euroFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 })

function formatSliderValue(value: number, unit: string) {
  if (unit === '€') return `${euroFormatter.format(value)} €`
  if (unit === '%') return `${decimalFormatter.format(value)} %`
  return `${value} ${unit}`.trim()
}

function sameMembers(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((value, index) => value === sortedB[index])
}

function isAnswered(question: KnowledgeQuestion, answer: AnswerValue | undefined) {
  if (!answer) return false
  switch (question.kind) {
    case 'single':
      return answer.kind === 'single'
    case 'multiple':
      return answer.kind === 'multiple' && answer.choiceIds.length > 0
    case 'truefalse':
      return answer.kind === 'truefalse' && question.statements.every((item) => typeof answer.values[item.id] === 'boolean')
    case 'order':
      return answer.kind === 'order' && answer.order.length === question.items.length
    case 'match':
      return answer.kind === 'match' && question.pairs.every((pair) => Boolean(answer.links[pair.id]))
    case 'classify':
      return answer.kind === 'classify' && question.items.every((item) => Boolean(answer.assignments[item.id]))
    case 'slider':
      return answer.kind === 'slider'
  }
}

function isCorrect(question: KnowledgeQuestion, answer: AnswerValue | undefined) {
  if (!answer) return false
  switch (question.kind) {
    case 'single':
      return answer.kind === 'single' && answer.choiceId === question.correctId
    case 'multiple':
      return answer.kind === 'multiple' && sameMembers(answer.choiceIds, question.correctIds)
    case 'truefalse':
      return answer.kind === 'truefalse' && question.statements.every((item) => answer.values[item.id] === item.isTrue)
    case 'order':
      return answer.kind === 'order' && question.correctOrder.every((id, index) => answer.order[index] === id)
    case 'match':
      return answer.kind === 'match' && question.pairs.every((pair) => answer.links[pair.id] === pair.id)
    case 'classify':
      return answer.kind === 'classify' && question.items.every((item) => answer.assignments[item.id] === item.bucketId)
    case 'slider':
      return answer.kind === 'slider' && Math.abs(answer.value - question.correct) <= question.tolerance
  }
}

/*
 * Capturar el puntero mantiene el arrastre atado al asa aunque el dedo se salga
 * del elemento. Algunos navegadores lanzan si el puntero ya no esta activo.
 */
function capturePointer(event: ReactPointerEvent<HTMLElement>) {
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    /* sin captura el arrastre sigue funcionando mientras no se salga del asa */
  }
}

function releasePointer(event: ReactPointerEvent<HTMLElement>) {
  try {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  } catch {
    /* ya liberado */
  }
}

function defaultOrder(question: Extract<KnowledgeQuestion, { kind: 'order' }>) {
  return question.items.map((item) => item.id)
}

function readStoredState(): StoredState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredState>
    if (!parsed || typeof parsed !== 'object') return null
    return {
      phase: parsed.phase === 'quiz' || parsed.phase === 'results' ? parsed.phase : 'intro',
      sectionIndex: typeof parsed.sectionIndex === 'number' ? parsed.sectionIndex : 0,
      answers: (parsed.answers ?? {}) as AnswerMap,
      checkedSections: parsed.checkedSections ?? {},
      unclear: parsed.unclear ?? {},
    }
  } catch {
    return null
  }
}

export function WorkerKnowledgeCheckCard({ onGoToStep, nextStepId = 12 }: WorkerKnowledgeCheckCardProps) {
  const variant = useFiscalVariant()
  const stored = useMemo(() => readStoredState(), [])
  const [phase, setPhase] = useState<Phase>(stored?.phase ?? 'intro')
  const [sectionIndex, setSectionIndex] = useState(stored?.sectionIndex ?? 0)
  const [answers, setAnswers] = useState<AnswerMap>(stored?.answers ?? {})
  const [checkedSections, setCheckedSections] = useState<Record<string, boolean>>(stored?.checkedSections ?? {})
  const [unclear, setUnclear] = useState<Record<string, boolean>>(stored?.unclear ?? {})
  const [missingWarning, setMissingWarning] = useState(false)
  const [activeMatchLeft, setActiveMatchLeft] = useState<Record<string, string | null>>({})
  const [drag, setDrag] = useState<DragState | null>(null)
  /** Tras soltar una ficha, el navegador aun dispara el `click`: hay que ignorarlo. */
  const skipNextMatchClick = useRef(false)
  /** Fila de «ordenar» pulsada, a la espera de moverse lo bastante para arrastrar. */
  const orderPress = useRef<{
    questionId: string
    itemId: string
    label: string
    pointerId: number
    x: number
    y: number
  } | null>(null)
  const [reportStatus, setReportStatus] = useState<ReportStatus>(stored?.phase === 'results' ? 'queued' : 'idle')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const payload: StoredState = { phase, sectionIndex, answers, checkedSections, unclear }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* almacenamiento no disponible: el repaso sigue funcionando en memoria */
    }
  }, [phase, sectionIndex, answers, checkedSections, unclear])

  const section = KNOWLEDGE_CHECK_SECTIONS[Math.min(sectionIndex, KNOWLEDGE_CHECK_SECTIONS.length - 1)]
  const isSectionChecked = Boolean(checkedSections[section.id])

  const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((current) => ({ ...current, [questionId]: value }))
    setMissingWarning(false)
  }, [])

  const scoreOf = useCallback(
    (target: KnowledgeSection) => target.questions.filter((question) => isCorrect(question, answers[question.id])).length,
    [answers],
  )

  const answeredCount = useMemo(
    () =>
      KNOWLEDGE_CHECK_SECTIONS.reduce(
        (total, item) => total + item.questions.filter((question) => isAnswered(question, answers[question.id])).length,
        0,
      ),
    [answers],
  )

  const totalScore = useMemo(
    () => KNOWLEDGE_CHECK_SECTIONS.reduce((total, item) => total + scoreOf(item), 0),
    [scoreOf],
  )

  const unclearCount = useMemo(() => Object.values(unclear).filter(Boolean).length, [unclear])

  const pendingInSection = section.questions.filter((question) => !isAnswered(question, answers[question.id])).length

  const handleCheckSection = () => {
    if (pendingInSection > 0) {
      setMissingWarning(true)
      return
    }
    setMissingWarning(false)
    setCheckedSections((current) => ({ ...current, [section.id]: true }))
  }

  const buildReport = (): KnowledgeCheckReport => ({
    quizVersion: KNOWLEDGE_CHECK_VERSION,
    completedAt: new Date().toISOString(),
    score: totalScore,
    total: KNOWLEDGE_CHECK_TOTAL_QUESTIONS,
    sections: KNOWLEDGE_CHECK_SECTIONS.map((item) => ({
      sectionId: item.id,
      stepId: item.stepId,
      score: scoreOf(item),
      total: item.questions.length,
      unclearQuestionIds: item.questions.filter((question) => unclear[question.id]).map((question) => question.id),
    })),
  })

  /** Cerrar el repaso envia el resultado solo, una vez y de forma anonima. */
  const finishQuiz = () => {
    setPhase('results')
    setReportStatus('sending')
    sendKnowledgeCheckReport(buildReport()).then(setReportStatus)
  }

  const handleNextSection = () => {
    if (sectionIndex >= KNOWLEDGE_CHECK_SECTIONS.length - 1) {
      finishQuiz()
      return
    }
    setSectionIndex(sectionIndex + 1)
    setMissingWarning(false)
  }

  const handleRestart = () => {
    setAnswers({})
    setCheckedSections({})
    setUnclear({})
    setSectionIndex(0)
    setMissingWarning(false)
    setReportStatus('idle')
    setPhase('quiz')
  }

  const toggleUnclear = (questionId: string) => {
    setUnclear((current) => ({ ...current, [questionId]: !current[questionId] }))
  }

  const renderQuestion = (question: KnowledgeQuestion, index: number) => {
    const answer = answers[question.id]
    const answered = isAnswered(question, answer)
    const correct = isCorrect(question, answer)
    const showFeedback = isSectionChecked
    const stateClass = !showFeedback ? '' : correct ? ' is-correct' : ' is-wrong'

    return (
      <article className={`wkcc-question${stateClass}`} key={question.id}>
        <header className="wkcc-question__head">
          <span className="wkcc-question__index" aria-hidden="true">
            {index + 1}
          </span>
          <div className="wkcc-question__title">
            <h4>{question.prompt}</h4>
            {question.hint ? <p className="wkcc-question__hint">{question.hint}</p> : null}
          </div>
          {showFeedback ? (
            <span className={`wkcc-verdict${correct ? ' wkcc-verdict--ok' : ' wkcc-verdict--ko'}`}>
              {correct ? <Check size={15} aria-hidden="true" /> : <X size={15} aria-hidden="true" />}
              {correct ? 'Correcto' : 'Repasa esto'}
            </span>
          ) : answered ? (
            <span className="wkcc-verdict wkcc-verdict--done">Respondida</span>
          ) : null}
        </header>

        <div className="wkcc-question__body">{renderQuestionBody(question, answer, showFeedback)}</div>

        {showFeedback ? (
          <p className="wkcc-explanation">
            <Lightbulb size={16} aria-hidden="true" />
            <span>{question.explanation}</span>
          </p>
        ) : null}

        <button
          type="button"
          className={`wkcc-unclear${unclear[question.id] ? ' is-active' : ''}`}
          onClick={() => toggleUnclear(question.id)}
          aria-pressed={Boolean(unclear[question.id])}
        >
          <Flag size={14} aria-hidden="true" />
          {unclear[question.id] ? 'Marcada: esto no estaba bien explicado' : 'Esto no estaba bien explicado'}
        </button>
      </article>
    )
  }

  const renderQuestionBody = (question: KnowledgeQuestion, answer: AnswerValue | undefined, showFeedback: boolean) => {
    switch (question.kind) {
      case 'single': {
        const selected = answer?.kind === 'single' ? answer.choiceId : null
        return (
          <ul className="wkcc-choices" role="radiogroup" aria-label={question.prompt}>
            {question.choices.map((choice) => {
              const isSelected = selected === choice.id
              const isRight = choice.id === question.correctId
              const tone = !showFeedback ? '' : isRight ? ' is-right' : isSelected ? ' is-wrong' : ''
              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`wkcc-choice${isSelected ? ' is-selected' : ''}${tone}`}
                    onClick={() => setAnswer(question.id, { kind: 'single', choiceId: choice.id })}
                    disabled={showFeedback}
                  >
                    <span className="wkcc-choice__mark" aria-hidden="true" />
                    <span>{choice.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )
      }

      case 'multiple': {
        const selected = answer?.kind === 'multiple' ? answer.choiceIds : []
        return (
          <ul className="wkcc-choices">
            {question.choices.map((choice) => {
              const isSelected = selected.includes(choice.id)
              const isRight = question.correctIds.includes(choice.id)
              const tone = !showFeedback ? '' : isRight ? ' is-right' : isSelected ? ' is-wrong' : ''
              return (
                <li key={choice.id}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    className={`wkcc-choice wkcc-choice--multi${isSelected ? ' is-selected' : ''}${tone}`}
                    onClick={() =>
                      setAnswer(question.id, {
                        kind: 'multiple',
                        choiceIds: isSelected ? selected.filter((id) => id !== choice.id) : [...selected, choice.id],
                      })
                    }
                    disabled={showFeedback}
                  >
                    <span className="wkcc-choice__mark" aria-hidden="true" />
                    <span>{choice.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )
      }

      case 'truefalse': {
        const values = answer?.kind === 'truefalse' ? answer.values : {}
        return (
          <ul className="wkcc-statements">
            {question.statements.map((statement) => {
              const value = values[statement.id]
              const answeredRight = value === statement.isTrue
              const rowTone = !showFeedback || typeof value !== 'boolean' ? '' : answeredRight ? ' is-right' : ' is-wrong'
              return (
                <li className={`wkcc-statement${rowTone}`} key={statement.id}>
                  <span className="wkcc-statement__text">{statement.text}</span>
                  <span className="wkcc-tf">
                    {[true, false].map((option) => (
                      <button
                        key={String(option)}
                        type="button"
                        aria-pressed={value === option}
                        className={`wkcc-tf__btn${value === option ? ' is-selected' : ''}${
                          showFeedback && option === statement.isTrue ? ' is-right' : ''
                        }`}
                        onClick={() =>
                          setAnswer(question.id, {
                            kind: 'truefalse',
                            values: { ...values, [statement.id]: option },
                          })
                        }
                        disabled={showFeedback}
                      >
                        {option ? 'Verdadero' : 'Falso'}
                      </button>
                    ))}
                  </span>
                </li>
              )
            })}
          </ul>
        )
      }

      case 'order': {
        const order = answer?.kind === 'order' ? answer.order : defaultOrder(question)
        const dragging = drag?.kind === 'order' && drag.questionId === question.id ? drag : null

        const move = (from: number, to: number) => {
          if (to < 0 || to >= order.length || from === to) return
          const next = [...order]
          const [moved] = next.splice(from, 1)
          next.splice(to, 0, moved)
          setAnswer(question.id, { kind: 'order', order: next })
        }

        /*
         * Se agarra desde cualquier punto de la fila. Con raton el arrastre
         * empieza en cuanto el puntero se mueve un poco (asi un clic suelto no
         * lo dispara); con el dedo solo desde el asa, para que el resto de la
         * fila siga sirviendo para desplazar la pagina.
         */
        const pressRow = (event: ReactPointerEvent<HTMLLIElement>, item: KnowledgeOrderItem) => {
          if (showFeedback) return
          if (event.pointerType === 'mouse' && event.button !== 0) return
          const target = event.target instanceof Element ? event.target : null
          if (target?.closest('.wkcc-order__moves')) return
          if (event.pointerType !== 'mouse' && !target?.closest('.wkcc-order__grip')) return
          if (event.pointerType === 'mouse') event.preventDefault()
          orderPress.current = {
            questionId: question.id,
            itemId: item.id,
            label: item.label,
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
          }
          capturePointer(event)
        }

        /* Reordena en vivo: la pieza arrastrada ocupa la fila que hay bajo el cursor. */
        const moveRow = (event: ReactPointerEvent<HTMLLIElement>) => {
          if (!dragging) {
            const press = orderPress.current
            if (!press || press.questionId !== question.id || press.pointerId !== event.pointerId) return
            const travelled = Math.abs(event.clientX - press.x) + Math.abs(event.clientY - press.y)
            if (travelled < ORDER_DRAG_THRESHOLD) return
            setDrag({
              kind: 'order',
              questionId: question.id,
              itemId: press.itemId,
              label: press.label,
              x: event.clientX,
              y: event.clientY,
            })
            return
          }

          setDrag({ ...dragging, x: event.clientX, y: event.clientY })
          const under = document.elementFromPoint(event.clientX, event.clientY)
          const slot = under?.closest('[data-order-slot]')
          if (!(slot instanceof HTMLElement) || slot.dataset.orderQuestion !== question.id) return
          const target = Number(slot.dataset.orderSlot)
          const from = order.indexOf(dragging.itemId)
          if (from < 0 || Number.isNaN(target)) return
          move(from, target)
        }

        const releaseRow = (event: ReactPointerEvent<HTMLLIElement>) => {
          releasePointer(event)
          orderPress.current = null
          setDrag(null)
        }

        return (
          <div className="wkcc-order">
            <p className="wkcc-order__edge">{question.topLabel}</p>
            <ol className="wkcc-order__list">
              {order.map((itemId, position) => {
                const item = question.items.find((candidate) => candidate.id === itemId)
                if (!item) return null
                const isRight = question.correctOrder[position] === itemId
                const tone = !showFeedback ? '' : isRight ? ' is-right' : ' is-wrong'
                const isDragged = dragging?.itemId === itemId
                return (
                  <li
                    className={`wkcc-order__item${tone}${isDragged ? ' is-dragging' : ''}${showFeedback ? '' : ' is-draggable'}`}
                    key={itemId}
                    data-order-slot={position}
                    data-order-question={question.id}
                    onPointerDown={(event) => pressRow(event, item)}
                    onPointerMove={moveRow}
                    onPointerUp={releaseRow}
                    onPointerCancel={releaseRow}
                  >
                    <span className="wkcc-order__grip" aria-hidden="true">
                      <GripVertical size={16} />
                    </span>
                    <span className="wkcc-order__position" aria-hidden="true">
                      {position + 1}
                    </span>
                    <span className="wkcc-order__label">{item.label}</span>
                    <span className="wkcc-order__moves">
                      <button
                        type="button"
                        onClick={() => move(position, position - 1)}
                        disabled={showFeedback || position === 0}
                        aria-label={`Subir «${item.label}»`}
                      >
                        <ChevronUp size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(position, position + 1)}
                        disabled={showFeedback || position === order.length - 1}
                        aria-label={`Bajar «${item.label}»`}
                      >
                        <ChevronDown size={16} aria-hidden="true" />
                      </button>
                    </span>
                  </li>
                )
              })}
            </ol>
            <p className="wkcc-order__edge">{question.bottomLabel}</p>
          </div>
        )
      }

      case 'match': {
        const links = answer?.kind === 'match' ? answer.links : {}
        const activeLeft = activeMatchLeft[question.id] ?? null
        const rights = question.rightOrder
          .map((pairId) => question.pairs.find((pair) => pair.id === pairId))
          .filter((pair): pair is NonNullable<typeof pair> => Boolean(pair))
        const usedRights = new Set(Object.values(links))
        const dragging = drag?.kind === 'match' && drag.questionId === question.id ? drag : null

        /* Una ficha de la derecha solo puede estar en una tarjeta: se libera la anterior. */
        const link = (leftPairId: string, rightPairId: string) => {
          const nextLinks: Record<string, string> = {}
          Object.entries(links).forEach(([leftId, value]) => {
            if (value !== rightPairId) nextLinks[leftId] = value
          })
          nextLinks[leftPairId] = rightPairId
          setAnswer(question.id, { kind: 'match', links: nextLinks })
          setActiveMatchLeft((current) => ({ ...current, [question.id]: null }))
        }

        const startDrag = (event: ReactPointerEvent<HTMLButtonElement>, pair: KnowledgeMatchPair) => {
          if (showFeedback) return
          if (event.pointerType === 'mouse' && event.button !== 0) return
          capturePointer(event)
          setDrag({
            kind: 'match',
            questionId: question.id,
            pairId: pair.id,
            label: pair.right,
            x: event.clientX,
            y: event.clientY,
            over: null,
          })
        }

        const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
          if (!dragging) return
          const under = document.elementFromPoint(event.clientX, event.clientY)
          const slot = under?.closest('[data-match-drop]')
          const over =
            slot instanceof HTMLElement && slot.dataset.matchQuestion === question.id
              ? slot.dataset.matchDrop ?? null
              : null
          setDrag({ ...dragging, x: event.clientX, y: event.clientY, over })
        }

        const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
          releasePointer(event)
          if (dragging?.over) {
            link(dragging.over, dragging.pairId)
            skipNextMatchClick.current = true
          }
          setDrag(null)
        }

        return (
          <div className="wkcc-match">
            <ul className="wkcc-match__column">
              {question.pairs.map((pair) => {
                const linked = links[pair.id]
                const linkedPair = linked ? question.pairs.find((candidate) => candidate.id === linked) : undefined
                const tone = !showFeedback ? '' : linked === pair.id ? ' is-right' : ' is-wrong'
                const isDropTarget = dragging?.over === pair.id
                return (
                  <li key={pair.id} data-match-drop={pair.id} data-match-question={question.id}>
                    <button
                      type="button"
                      className={`wkcc-match__left${activeLeft === pair.id ? ' is-active' : ''}${linked ? ' is-linked' : ''}${isDropTarget ? ' is-drop' : ''}${tone}`}
                      onClick={() => {
                        if (showFeedback) return
                        if (linked) {
                          const nextLinks = { ...links }
                          delete nextLinks[pair.id]
                          setAnswer(question.id, { kind: 'match', links: nextLinks })
                          setActiveMatchLeft((current) => ({ ...current, [question.id]: pair.id }))
                          return
                        }
                        setActiveMatchLeft((current) => ({
                          ...current,
                          [question.id]: current[question.id] === pair.id ? null : pair.id,
                        }))
                      }}
                      disabled={showFeedback}
                      aria-pressed={activeLeft === pair.id}
                    >
                      <strong>{pair.left}</strong>
                      <em>{linkedPair ? linkedPair.right : 'Sin emparejar'}</em>
                    </button>
                  </li>
                )
              })}
            </ul>
            <ul className="wkcc-match__column wkcc-match__column--right">
              {rights.map((pair) => {
                const used = usedRights.has(pair.id)
                const isDragged = dragging?.pairId === pair.id
                return (
                  <li key={pair.id}>
                    <button
                      type="button"
                      className={`wkcc-match__right${used ? ' is-used' : ''}${isDragged ? ' is-dragging' : ''}`}
                      onPointerDown={(event) => startDrag(event, pair)}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      onClick={() => {
                        if (skipNextMatchClick.current) {
                          skipNextMatchClick.current = false
                          return
                        }
                        if (!activeLeft) return
                        link(activeLeft, pair.id)
                      }}
                      disabled={showFeedback}
                      aria-label={`${pair.right}. Arrástralo hasta su pareja de la izquierda`}
                    >
                      <span className="wkcc-match__grip" aria-hidden="true">
                        <GripVertical size={15} />
                      </span>
                      <span>{pair.right}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            {!showFeedback ? (
              <p className="wkcc-match__note">
                {dragging
                  ? 'Suelta la ficha sobre la tarjeta de la izquierda que le corresponda.'
                  : activeLeft
                    ? 'Ahora elige su pareja en la columna de la derecha.'
                    : 'Arrastra cada ficha de la derecha hasta su tarjeta de la izquierda. También puedes tocar primero una tarjeta y después su ficha.'}
              </p>
            ) : null}
          </div>
        )
      }

      case 'classify': {
        const assignments = answer?.kind === 'classify' ? answer.assignments : {}
        return (
          <ul className="wkcc-classify">
            {question.items.map((item) => {
              const assigned = assignments[item.id]
              const tone = !showFeedback || !assigned ? '' : assigned === item.bucketId ? ' is-right' : ' is-wrong'
              return (
                <li className={`wkcc-classify__row${tone}`} key={item.id}>
                  <span className="wkcc-classify__label">{item.label}</span>
                  <span className="wkcc-classify__buckets">
                    {question.buckets.map((bucket) => (
                      <button
                        key={bucket.id}
                        type="button"
                        aria-pressed={assigned === bucket.id}
                        className={`wkcc-bucket${assigned === bucket.id ? ' is-selected' : ''}${
                          showFeedback && bucket.id === item.bucketId ? ' is-right' : ''
                        }`}
                        onClick={() =>
                          setAnswer(question.id, {
                            kind: 'classify',
                            assignments: { ...assignments, [item.id]: bucket.id },
                          })
                        }
                        disabled={showFeedback}
                      >
                        {bucket.label}
                      </button>
                    ))}
                  </span>
                </li>
              )
            })}
          </ul>
        )
      }

      case 'slider': {
        const midpoint = question.min + (question.max - question.min) / 2
        const value = answer?.kind === 'slider' ? answer.value : midpoint
        const hasAnswer = answer?.kind === 'slider'
        return (
          <div className="wkcc-slider">
            <input
              type="range"
              min={question.min}
              max={question.max}
              step={question.step}
              value={value}
              onChange={(event) => setAnswer(question.id, { kind: 'slider', value: Number(event.target.value) })}
              disabled={showFeedback}
              aria-label={question.prompt}
            />
            <div className="wkcc-slider__scale" aria-hidden="true">
              <span>{formatSliderValue(question.min, question.unit)}</span>
              <span>{formatSliderValue(question.max, question.unit)}</span>
            </div>
            <p className="wkcc-slider__value">
              <span>Tu respuesta</span>
              <strong>{hasAnswer ? formatSliderValue(value, question.unit) : 'Mueve el deslizador'}</strong>
            </p>
            {showFeedback ? (
              <p className="wkcc-slider__target">
                Respuesta correcta: <strong>{formatSliderValue(question.correct, question.unit)}</strong> (se daba por
                buena una diferencia de ±{formatSliderValue(question.tolerance, question.unit)})
              </p>
            ) : null}
          </div>
        )
      }
    }
  }

  const progressPercent = Math.round((answeredCount / KNOWLEDGE_CHECK_TOTAL_QUESTIONS) * 100)

  return (
    <section className={`wkcc${drag ? ' is-dragging' : ''}`} aria-labelledby="wkcc-title">
      <header className="wkcc-header">
        <div className="wkcc-heading">
          <span className="wkcc-step">
            <span aria-hidden="true" />
            Paso 11 de 12
          </span>
          <h2 id="wkcc-title">11. Comprueba lo aprendido</h2>
          <p>
            Un repaso por apartados para ver qué se te ha quedado del recorrido. No hay nota que valga para nada:
            sirve para detectar lo que aún no está claro.
          </p>
          {variant === 'escenario' ? (
            <div className="wkcc-scenario-metrics" aria-label={`${KNOWLEDGE_CHECK_TOTAL_QUESTIONS} preguntas en ${KNOWLEDGE_CHECK_SECTIONS.length} apartados`}>
              <span><strong>{KNOWLEDGE_CHECK_TOTAL_QUESTIONS}</strong><small>preguntas</small></span>
              <span><strong>{KNOWLEDGE_CHECK_SECTIONS.length}</strong><small>apartados</small></span>
            </div>
          ) : null}
        </div>
        <div className="wkcc-badges">
          <span className="wkcc-badge wkcc-badge--optional">
            <Sparkles size={15} aria-hidden="true" />
            Paso opcional
          </span>
          <span className="wkcc-badge">
            <Clock size={15} aria-hidden="true" />
            10–15 min
          </span>
          <span className="wkcc-badge">
            <ListChecks size={15} aria-hidden="true" />
            {KNOWLEDGE_CHECK_TOTAL_QUESTIONS} preguntas · {KNOWLEDGE_CHECK_SECTIONS.length} apartados
          </span>
        </div>
      </header>

      {phase === 'intro' ? (
        <div className="wkcc-intro">
          <div className="wkcc-intro__main">
            <p className="wkcc-intro__lead">
              <strong>Este paso es opcional.</strong> Puedes saltártelo y seguir con el recorrido sin perder nada de lo
              calculado.
            </p>
            <p className="wkcc-intro__ask">
              Pero si tienes 10 o 15 minutos, <strong>para nosotros es muy importante que lo hagas</strong>. Cada
              pregunta está atada a un paso concreto: cuando muchas personas fallan en el mismo sitio, sabemos que ese
              apartado no está bien explicado y lo reescribimos. Es la mejor forma de decirnos dónde nos hemos
              explicado mal.
            </p>

            <div className="wkcc-intro__privacy" role="note">
              <ShieldCheck size={20} aria-hidden="true" />
              <div>
                <p>
                  <strong>Qué se envía.</strong> Al terminar, tus respuestas viajan a nuestra base de datos{' '}
                  <strong>de forma anónima</strong>, solo para entender cómo mejorar el contenido: cuántas acertaste en
                  cada apartado y cuáles marcaste como mal explicadas.
                </p>
                <p>
                  <strong>Qué no se envía.</strong> Nada de tu información personal ni ninguna de las cifras que hayas
                  puesto en la calculadora: ni salario, ni comunidad, ni situación familiar. Y si prefieres no hacerlo,
                  el cuestionario es opcional.
                </p>
              </div>
            </div>

            <ul className="wkcc-intro__facts">
              <li>
                <strong>{KNOWLEDGE_CHECK_TOTAL_QUESTIONS} preguntas</strong> repartidas en{' '}
                {KNOWLEDGE_CHECK_SECTIONS.length} apartados, uno por cada bloque del recorrido.
              </li>
              <li>
                <strong>No hay que escribir nada</strong>: se responde eligiendo, arrastrando piezas para ordenarlas
                o emparejarlas, clasificando o moviendo un deslizador.
              </li>
              <li>
                <strong>Se corrige apartado a apartado</strong>, con la explicación al momento y un enlace para volver
                al paso correspondiente.
              </li>
              <li>
                <strong>Puedes marcar cualquier pregunta</strong> con «Esto no estaba bien explicado», aunque la hayas
                acertado.
              </li>
              <li>
                <strong>Se guarda en tu navegador</strong>: puedes salir, seguir con el recorrido y volver donde lo
                dejaste.
              </li>
            </ul>

            <div className="wkcc-intro__actions">
              <button type="button" className="wkcc-cta" onClick={() => setPhase('quiz')}>
                <GraduationCap size={18} aria-hidden="true" />
                Empezar el repaso
              </button>
              <button type="button" className="wkcc-ghost" onClick={() => onGoToStep?.(nextStepId)}>
                Saltar este paso
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
            {answeredCount > 0 ? (
              <p className="wkcc-intro__resume">
                Tienes {answeredCount} de {KNOWLEDGE_CHECK_TOTAL_QUESTIONS} preguntas respondidas de una vez anterior.
                Al entrar seguirás donde lo dejaste.
              </p>
            ) : null}
          </div>

          <aside className="wkcc-intro__aside" aria-label="Apartados del repaso">
            <h3>Qué vas a repasar</h3>
            <ol className="wkcc-intro__sections">
              {KNOWLEDGE_CHECK_SECTIONS.map((item) => (
                <li key={item.id}>
                  <span className="wkcc-intro__section-step">Paso {item.stepId}</span>
                  <span className="wkcc-intro__section-title">{item.title}</span>
                  <span className="wkcc-intro__section-count">{item.questions.length} preguntas</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      ) : null}

      {phase === 'quiz' ? (
        <div className="wkcc-quiz">
          <nav className="wkcc-rail" aria-label="Apartados del repaso">
            {KNOWLEDGE_CHECK_SECTIONS.map((item, index) => {
              const done = Boolean(checkedSections[item.id])
              const isActive = index === sectionIndex
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`wkcc-rail__item${isActive ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                  onClick={() => {
                    setSectionIndex(index)
                    setMissingWarning(false)
                  }}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="wkcc-rail__index" aria-hidden="true">
                    {done ? <Check size={13} strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="wkcc-rail__label">{item.title}</span>
                </button>
              )
            })}
          </nav>

          <div className="wkcc-progress" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="wkcc-progress__label">
            {answeredCount} de {KNOWLEDGE_CHECK_TOTAL_QUESTIONS} preguntas respondidas
          </p>

          <div className="wkcc-section">
            <header className="wkcc-section__head">
              <div>
                <p className="wkcc-section__eyebrow">
                  Apartado {sectionIndex + 1} de {KNOWLEDGE_CHECK_SECTIONS.length} · se explica en el paso{' '}
                  {section.stepId}
                </p>
                <h3>{section.title}</h3>
                <p className="wkcc-section__subtitle">{section.subtitle}</p>
              </div>
              <button type="button" className="wkcc-ghost wkcc-ghost--small" onClick={() => onGoToStep?.(section.stepId)}>
                Repasar el paso {section.stepId}
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </header>

            <div className="wkcc-questions">
              {section.questions.map((question, index) => renderQuestion(question, index))}
            </div>

            {missingWarning ? (
              <p className="wkcc-warning" role="alert">
                Te quedan {pendingInSection} preguntas por responder en este apartado.
              </p>
            ) : null}

            <footer className="wkcc-section__foot">
              {!isSectionChecked ? (
                <button type="button" className="wkcc-cta" onClick={handleCheckSection}>
                  <Check size={18} aria-hidden="true" />
                  Corregir apartado
                </button>
              ) : (
                <>
                  <p className="wkcc-section__score">
                    {scoreOf(section)} de {section.questions.length} correctas en este apartado
                  </p>
                  <button type="button" className="wkcc-cta" onClick={handleNextSection}>
                    {sectionIndex >= KNOWLEDGE_CHECK_SECTIONS.length - 1 ? 'Ver resultados' : 'Siguiente apartado'}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </>
              )}
              <button type="button" className="wkcc-ghost wkcc-ghost--small" onClick={() => onGoToStep?.(nextStepId)}>
                Salir del cuestionario
              </button>
            </footer>
          </div>
        </div>
      ) : null}

      {phase === 'results' ? (
        <div className="wkcc-results">
          <div className="wkcc-results__score">
            <p className="wkcc-results__eyebrow">Resultado del repaso</p>
            <p className="wkcc-results__big">
              <strong>{totalScore}</strong> de {KNOWLEDGE_CHECK_TOTAL_QUESTIONS}
            </p>
            <p className="wkcc-results__percent">
              {percentFormatter.format((totalScore / KNOWLEDGE_CHECK_TOTAL_QUESTIONS) * 100)} % de aciertos
              {unclearCount > 0
                ? ` · ${unclearCount} ${unclearCount === 1 ? 'pregunta marcada como poco clara' : 'preguntas marcadas como poco claras'}`
                : ''}
            </p>
            <p className="wkcc-results__thanks">
              Gracias por llegar hasta aquí. Los apartados donde más se falla son los que reescribimos primero.
            </p>
          </div>

          <ul className="wkcc-results__list">
            {KNOWLEDGE_CHECK_SECTIONS.map((item) => {
              const score = scoreOf(item)
              const ratio = score / item.questions.length
              const flagged = item.questions.filter((question) => unclear[question.id]).length
              const tone = ratio >= 0.8 ? 'is-good' : ratio >= 0.5 ? 'is-mid' : 'is-low'
              return (
                <li className={`wkcc-results__row ${tone}`} key={item.id}>
                  <div className="wkcc-results__row-main">
                    <p className="wkcc-results__row-title">
                      <span>{item.title}</span>
                      <strong>
                        {score}/{item.questions.length}
                      </strong>
                    </p>
                    <div className="wkcc-results__bar" aria-hidden="true">
                      <span style={{ width: `${ratio * 100}%` }} />
                    </div>
                    {flagged > 0 ? (
                      <p className="wkcc-results__flagged">
                        <Flag size={13} aria-hidden="true" />
                        {flagged} pregunta{flagged === 1 ? '' : 's'} marcada{flagged === 1 ? '' : 's'} como poco clara
                        {flagged === 1 ? '' : 's'}
                      </p>
                    ) : null}
                  </div>
                  <button type="button" className="wkcc-ghost wkcc-ghost--small" onClick={() => onGoToStep?.(item.stepId)}>
                    Repasar el paso {item.stepId}
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>

          <aside className="wkcc-results__feedback" aria-live="polite">
            <h3>
              <ShieldCheck size={18} aria-hidden="true" />
              {reportStatus === 'sending'
                ? 'Enviando tus respuestas…'
                : reportStatus === 'sent'
                  ? 'Respuestas enviadas de forma anónima'
                  : 'Respuestas listas para enviarse'}
            </h3>
            <p>
              {reportStatus === 'sent'
                ? 'Ya nos han llegado tus aciertos por apartado y las preguntas que marcaste como mal explicadas. Con eso sabemos qué reescribir.'
                : 'Tus aciertos por apartado y las preguntas que marcaste como mal explicadas se envían solos, de forma anónima, en cuanto haya conexión con nuestra base de datos.'}{' '}
              No se envía nada que te identifique ni ninguna cifra de la calculadora: tu salario, tu comunidad y tu
              situación familiar se quedan en tu navegador.
            </p>
          </aside>

          <div className="wkcc-results__actions">
            <button type="button" className="wkcc-ghost" onClick={handleRestart}>
              <RotateCcw size={16} aria-hidden="true" />
              Repetir el repaso
            </button>
            <button type="button" className="wkcc-cta" onClick={() => onGoToStep?.(nextStepId)}>
              Continuar con el recorrido
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Ficha que sigue al dedo mientras se arrastra; no intercepta el puntero. */}
      {drag ? (
        <div className="wkcc-drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          {drag.label}
        </div>
      ) : null}
    </section>
  )
}

export default WorkerKnowledgeCheckCard
