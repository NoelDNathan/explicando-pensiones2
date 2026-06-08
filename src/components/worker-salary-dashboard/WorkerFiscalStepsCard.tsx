import {
  BarChart3,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Lightbulb,
  Scale,
  Shield,
  ShoppingCart,
  UserRound,
  WalletCards,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import './WorkerFiscalStepsCard.css'

type WorkerFiscalStep = {
  id: number
  title: string
  subtitle: string
  description: string
  checklist: string[]
  helpTitle: string
  helpBody: string
  important: string
  Icon: typeof Calculator
}

type WorkerFiscalStepsCardProps = {
  activeStepId?: number
  onStepChange?: (stepId: number) => void
}

const WORKER_FISCAL_STEPS: WorkerFiscalStep[] = [
  {
    id: 1,
    title: 'Base real',
    subtitle: 'Calcula tu base real de salario',
    description: 'Aqui introduces tu salario y los conceptos que forman parte de tu remuneracion. La idea es calcular una base real antes de aplicar limites o impuestos.',
    checklist: ['Salario anual o mensual', '12 o 14 pagas', 'Complementos salariales', 'Salario en especie'],
    helpTitle: 'Que es la base real?',
    helpBody: 'Es la suma de todas tus retribuciones dinerarias y en especie antes de aplicar cotizaciones, reducciones o impuestos. Sera la referencia para los siguientes pasos.',
    important: 'Cuanto mas precisa sea tu base real, mas exacto sera el resultado final.',
    Icon: Calculator,
  },
  {
    id: 2,
    title: 'Limites de cotizacion',
    subtitle: 'Compara con los limites de tu grupo',
    description: 'Este paso compara tu base real con la base minima y maxima aplicable al grupo de cotizacion para saber que base se usa en Seguridad Social.',
    checklist: ['Grupo de cotizacion', 'Base minima aplicable', 'Base maxima aplicable', 'Base usada para cotizar'],
    helpTitle: 'Por que hay limites?',
    helpBody: 'La Seguridad Social no siempre cotiza sobre todo el salario. Usa bases con minimos y maximos que dependen del grupo y del ejercicio.',
    important: 'Si tu salario supera la base maxima, la parte excedente no entra en la cotizacion ordinaria.',
    Icon: Scale,
  },
  {
    id: 3,
    title: 'Cotizaciones sociales',
    subtitle: 'Que paga tu y que paga la empresa',
    description: 'Separamos la cuota del trabajador, la aportacion de la empresa y el coste laboral total asociado al salario.',
    checklist: ['Contingencias comunes', 'Desempleo y formacion', 'MEI si procede', 'Aportacion empresa'],
    helpTitle: 'Que se calcula aqui?',
    helpBody: 'Las cotizaciones reducen tu salario bruto y tambien generan una aportacion adicional de la empresa que no aparece en la nomina neta.',
    important: 'El coste de empresa y el salario neto responden a preguntas distintas; conviene mostrarlos separados.',
    Icon: Shield,
  },
  {
    id: 4,
    title: 'Reducciones',
    subtitle: 'Aplica tus reducciones personales',
    description: 'Recoge situacion familiar, discapacidad, ascendientes y deducciones verificadas para ajustar la base o la cuota.',
    checklist: ['Hijos y menores de 3 anos', 'Discapacidad', 'Ascendientes', 'Deducciones verificadas'],
    helpTitle: 'Que cambia con tus datos?',
    helpBody: 'La situacion personal puede reducir la base sometida a impuesto o la cuota final, segun el ejercicio y la comunidad autonoma.',
    important: 'No conviene automatizar una deduccion sin comprobar antes sus requisitos.',
    Icon: UserRound,
  },
  {
    id: 5,
    title: 'IRPF por tramos',
    subtitle: 'Entiende tu IRPF segun tu comunidad',
    description: 'El impuesto se calcula de forma progresiva: cada tramo aplica un porcentaje solo a la parte de renta que cae dentro de ese tramo.',
    checklist: ['Base liquidable', 'Tramo activo', 'Cuota estatal', 'Cuota autonomica'],
    helpTitle: 'Como leer los tramos?',
    helpBody: 'Un tipo marginal no se aplica a todo el salario. Solo afecta al siguiente euro dentro de ese tramo.',
    important: 'El tipo efectivo suele ser menor que el ultimo tipo marginal.',
    Icon: BarChart3,
  },
  {
    id: 6,
    title: 'Salario neto',
    subtitle: 'Lo que realmente cobras',
    description: 'Resume salario bruto, cotizaciones del trabajador e IRPF para mostrar el salario neto anual y mensual.',
    checklist: ['Bruto anual', 'Cotizacion trabajador', 'IRPF anual', 'Neto mensual'],
    helpTitle: 'Que incluye el neto?',
    helpBody: 'El neto laboral descuenta IRPF y cotizaciones del trabajador. No descuenta consumo, IVA ni otros impuestos indirectos.',
    important: 'Separar salario neto e impuestos de consumo evita dobles lecturas del resultado.',
    Icon: WalletCards,
  },
  {
    id: 7,
    title: 'IVA y otros impuestos',
    subtitle: 'Impuestos sobre tu consumo',
    description: 'Anade una estimacion separada de IVA, impuestos especiales, IBI u otros tributos para completar el contexto fiscal.',
    checklist: ['Gasto por categorias', 'IVA estimado', 'Impuestos especiales', 'IBI u otros tributos'],
    helpTitle: 'Por que va separado?',
    helpBody: 'Los impuestos indirectos dependen del consumo, no del salario bruto. Por eso se explican como contexto, no como descuento de nomina.',
    important: 'El ahorro y la inversion pueden cambiar mucho el peso real de estos impuestos.',
    Icon: ShoppingCart,
  },
]

export function WorkerFiscalStepsCard({ activeStepId, onStepChange }: WorkerFiscalStepsCardProps) {
  const [internalActiveStepId, setInternalActiveStepId] = useState(1)
  const currentStepId = activeStepId ?? internalActiveStepId
  const activeIndex = WORKER_FISCAL_STEPS.findIndex((step) => step.id === currentStepId)
  const activeStep = WORKER_FISCAL_STEPS[activeIndex] ?? WORKER_FISCAL_STEPS[0]
  const progress = useMemo(() => activeStep.id / WORKER_FISCAL_STEPS.length * 100, [activeStep.id])
  const ActiveIcon = activeStep.Icon

  const setActiveStep = (nextStepId: number) => {
    const clampedStepId = Math.min(WORKER_FISCAL_STEPS.length, Math.max(1, nextStepId))
    setInternalActiveStepId(clampedStepId)
    onStepChange?.(clampedStepId)
  }

  const goToPrevious = () => {
    setActiveStep(activeStep.id - 1)
  }

  const goToNext = () => {
    setActiveStep(activeStep.id + 1)
  }

  return (
    <section className="wfsc" aria-labelledby="wfsc-title">
      <nav className="wfsc-steps" aria-label="Pasos de la calculadora fiscal">
        {WORKER_FISCAL_STEPS.map((step) => {
          const StepIcon = step.Icon
          const isActive = step.id === activeStep.id
          return (
            <button
              key={step.id}
              type="button"
              className={isActive ? 'is-active' : undefined}
              onClick={() => setActiveStep(step.id)}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="wfsc-step-number">{step.id}</span>
              <StepIcon size={31} strokeWidth={2.15} aria-hidden="true" />
              <strong>{step.title}</strong>
              <small>{step.subtitle}</small>
            </button>
          )
        })}
      </nav>

      <p className="wfsc-hint">Haz clic en cualquier paso para ir directamente</p>

      <div className="wfsc-stage">
        <button
          className="wfsc-nav wfsc-nav--previous"
          type="button"
          onClick={goToPrevious}
          disabled={activeStep.id === 1}
          aria-label="Ir al paso anterior"
        >
          <ChevronLeft size={26} aria-hidden="true" />
          <span>Anterior</span>
        </button>

        <div className="wfsc-hero">
          <div className="wfsc-hero-main">
            <span className="wfsc-step-orb" aria-hidden="true">
              <ActiveIcon size={34} strokeWidth={2.35} />
              <b>{activeStep.id}</b>
            </span>
            <div className="wfsc-copy">
              <p>Paso {activeStep.id} de {WORKER_FISCAL_STEPS.length}</p>
              <h2 id="wfsc-title">{activeStep.title}</h2>
              <span>{activeStep.description}</span>
              <ul aria-label="Conceptos incluidos en este paso">
                {activeStep.checklist.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="wfsc-help" aria-label="Ayuda del paso activo">
            <div className="wfsc-help__head">
              <h3>{activeStep.helpTitle}</h3>
              <Info size={20} aria-hidden="true" />
            </div>
            <p>{activeStep.helpBody}</p>
            <div className="wfsc-important">
              <strong><Lightbulb size={18} aria-hidden="true" /> Importante</strong>
              <span>{activeStep.important}</span>
            </div>
          </aside>
        </div>

        <button
          className="wfsc-nav wfsc-nav--next"
          type="button"
          onClick={goToNext}
          disabled={activeStep.id === WORKER_FISCAL_STEPS.length}
          aria-label="Ir al paso siguiente"
        >
          <ChevronRight size={26} aria-hidden="true" />
          <span>Siguiente</span>
        </button>

        <div className="wfsc-progress" aria-label={`${Math.round(progress)}% completado`}>
          <span style={{ width: `${progress}%` }} />
          <b style={{ left: `clamp(54px, ${progress}%, calc(100% - 54px))` }}>{Math.round(progress)}% completado</b>
        </div>
      </div>
    </section>
  )
}

export default WorkerFiscalStepsCard
