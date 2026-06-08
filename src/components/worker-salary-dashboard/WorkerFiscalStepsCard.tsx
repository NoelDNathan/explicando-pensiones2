import {
  BarChart3,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
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
  details: string[]
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
    subtitle: 'Empieza por lo que cobras antes de descuentos',
    description: 'La base real es tu sueldo bruto completo: salario fijo, pagas, complementos y salario en especie. Es el punto de partida antes de Seguridad Social e IRPF.',
    checklist: ['Salario bruto', 'Pagas del ano', 'Complementos anuales', 'Salario en especie anual'],
    helpTitle: 'Que significa base real?',
    helpBody: 'Es una base de trabajo para la calculadora. Intenta acercarse a todo lo que recibes de la empresa antes de restar cotizaciones o impuestos.',
    details: [
      'Incluye dinero y retribuciones en especie, como coche, seguro o vales si forman parte de tu remuneracion.',
      'Sirve para ordenar el calculo: primero se mide el bruto completo y despues se aplican limites, cuotas e impuestos.',
      'Si introduces importes mensuales, la calculadora los lleva a una cifra anual para comparar todo con la misma unidad.',
    ],
    important: 'No es todavia la base de cotizacion ni la base del IRPF. Es el bruto completo desde el que empezamos.',
    Icon: Calculator,
  },
  {
    id: 2,
    title: 'Limites de cotizacion',
    subtitle: 'Del bruto a la base de cotizacion',
    description: 'Tu grupo de cotizacion marca una base minima y una base maxima. La Seguridad Social usa una base dentro de esos limites para calcular las cuotas.',
    checklist: ['Grupo o categoria profesional', 'Base minima', 'Base maxima', 'Base usada'],
    helpTitle: 'Que es el grupo de cotizacion?',
    helpBody: 'Es una categoria laboral de la Seguridad Social. Agrupa puestos parecidos y fija limites de cotizacion. No siempre coincide con tu puesto comercial o tu convenio.',
    details: [
      'La base minima actua como suelo: si tu base queda por debajo, se usa ese minimo para cotizar.',
      'La base maxima actua como techo: si tu salario supera el limite, las cuotas ordinarias no crecen por encima de ese tope.',
      'La base usada es la cifra final sobre la que se calculan las cotizaciones sociales del paso siguiente.',
    ],
    important: 'Si tu bruto supera la base maxima, no cotizas mas por la parte que queda por encima en las cuotas ordinarias.',
    Icon: Scale,
  },
  {
    id: 3,
    title: 'Cotizaciones sociales',
    subtitle: 'Cuotas del trabajador y de la empresa',
    description: 'Sobre la base usada se aplican varios porcentajes. Unos se descuentan de tu nomina y otros los paga la empresa ademas de tu salario.',
    checklist: ['Contingencias comunes', 'Desempleo', 'Formacion', 'MEI y empresa'],
    helpTitle: 'Que son las categorias de cotizacion?',
    helpBody: 'Son destinos de la cuota: jubilacion y bajas comunes, desempleo, formacion, refuerzo de pensiones o coberturas empresariales. Cada una puede tener un porcentaje distinto.',
    details: [
      'La cuota del trabajador aparece como descuento en la nomina y reduce el salario neto.',
      'La aportacion de la empresa no se descuenta de tu nomina, pero forma parte del coste total de contratar.',
      'Algunas categorias financian prestaciones comunes; otras cubren desempleo, formacion, accidentes o mecanismos especificos.',
    ],
    important: 'Tu neto baja por la parte del trabajador. La parte de empresa aumenta el coste laboral, pero no se resta de tu nomina.',
    Icon: Shield,
  },
  {
    id: 4,
    title: 'Reducciones',
    subtitle: 'Datos personales que ajustan el IRPF',
    description: 'Hijos, discapacidad, ascendientes y algunas deducciones pueden cambiar la base del impuesto o la cuota final.',
    checklist: ['Minimos personales', 'Reducciones de base', 'Deducciones de cuota', 'Requisitos'],
    helpTitle: 'Reduccion o deduccion?',
    helpBody: 'Una reduccion baja la base sobre la que se calcula el impuesto. Una deduccion baja directamente el impuesto final si cumples sus condiciones.',
    details: [
      'Los minimos personales y familiares intentan dejar una parte de renta fuera de tributacion por necesidades basicas.',
      'Las reducciones se aplican antes de calcular la cuota; por eso cambian la base que entra en los tramos.',
      'Las deducciones se revisan al final y dependen mucho de requisitos, ejercicio fiscal y comunidad autonoma.',
    ],
    important: 'Dos personas con el mismo salario pueden pagar IRPF distinto por su situacion personal y comunidad.',
    Icon: UserRound,
  },
  {
    id: 5,
    title: 'IRPF por tramos',
    subtitle: 'El IRPF no aplica un unico porcentaje',
    description: 'La base liquidable se divide en tramos. Cada tramo paga su propio porcentaje estatal y autonomico.',
    checklist: ['Base liquidable', 'Tramos', 'Tipo marginal', 'Tipo efectivo'],
    helpTitle: 'Tipo marginal y tipo efectivo',
    helpBody: 'El tipo marginal afecta solo al siguiente euro que entra en ese tramo. El tipo efectivo es la media real que pagas sobre toda la base.',
    details: [
      'La base liquidable se reparte por escalones: cada tramo calcula impuesto solo sobre la parte que cae dentro de el.',
      'El tramo estatal y el autonomico se suman para aproximar la cuota total de IRPF.',
      'El tipo efectivo ayuda a leer el resultado real: cuota total dividida entre la base considerada.',
    ],
    important: 'Subir de tramo no hace que todo tu salario tribute al porcentaje mas alto.',
    Icon: BarChart3,
  },
  {
    id: 6,
    title: 'Salario neto',
    subtitle: 'Bruto menos descuentos de nomina',
    description: 'El salario neto es lo que queda de tu trabajo despues de restar cotizaciones del trabajador e IRPF.',
    checklist: ['Salario bruto', 'Cotizaciones trabajador', 'IRPF', 'Neto anual y mensual'],
    helpTitle: 'Que entra en el neto?',
    helpBody: 'Entra lo que se descuenta en la nomina: Seguridad Social del trabajador e IRPF. No incluye lo que luego pagas al consumir.',
    details: [
      'El bruto es lo pactado antes de descuentos; el neto es lo que recibes despues de las retenciones de nomina.',
      'La retencion de IRPF es un pago a cuenta: puede ajustarse en la declaracion anual segun tu situacion final.',
      'El neto mensual depende tambien del numero de pagas: 12 y 14 pagas pueden tener el mismo neto anual repartido distinto.',
    ],
    important: 'Por eso la empresa puede tener un coste mayor que tu bruto y tu bolsillo recibir menos que el bruto.',
    Icon: WalletCards,
  },
  {
    id: 7,
    title: 'IVA y otros impuestos',
    subtitle: 'Impuestos que dependen de tu gasto',
    description: 'IVA, impuestos especiales, IBI u otros tributos se estiman aparte porque no salen directamente de tu nomina.',
    checklist: ['Categorias de gasto', 'Tipo de IVA', 'Impuestos especiales', 'IBI u otros'],
    helpTitle: 'Que son categorias de gasto?',
    helpBody: 'Son grupos de consumo: vivienda, comida, transporte, ocio, energia, etc. Cada grupo puede tener un tipo de IVA o un impuesto distinto.',
    details: [
      'El IVA se paga al comprar bienes o servicios y no sale directamente de la nomina.',
      'Los impuestos especiales afectan a consumos concretos, como carburantes, alcohol, tabaco o energia, segun el caso.',
      'El IBI y otros tributos dependen de patrimonio, municipio o uso de servicios, por eso se muestran como contexto separado.',
    ],
    important: 'Dos personas con el mismo neto pueden pagar impuestos indirectos muy distintos si consumen de forma diferente.',
    Icon: ShoppingCart,
  },
  {
    id: 8,
    title: 'Preguntas frecuentes',
    subtitle: 'Resuelve dudas antes de leer el resultado',
    description: 'Cierra el recorrido con respuestas rapidas a las dudas mas habituales: que se descuenta de la nomina, que paga la empresa y que queda fuera del salario neto.',
    checklist: ['Bruto frente a neto', 'Bases y limites', 'IRPF y retenciones', 'Impuestos de consumo'],
    helpTitle: 'Para que sirve esta seccion?',
    helpBody: 'Sirve como comprobacion final. Si algun resultado parece raro, estas preguntas ayudan a identificar si la diferencia viene de bases, cotizaciones, IRPF o consumo.',
    details: [
      'Usala para separar tres ideas: lo que cobras, lo que cuesta tu empleo y lo que pagas despues al consumir.',
      'Las respuestas son orientativas y explican el modelo de la calculadora; no sustituyen una nomina real ni asesoramiento fiscal.',
      'Si cambias salario, pagas, comunidad o consumo, conviene volver a revisar las preguntas clave porque el resultado puede cambiar.',
    ],
    important: 'La FAQ no anade nuevos impuestos al calculo: solo explica como leer los pasos anteriores.',
    Icon: CircleHelp,
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
            </div>
            <p>{activeStep.helpBody}</p>
            <ul className="wfsc-detail-list" aria-label="Detalles del paso activo">
              {activeStep.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
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
