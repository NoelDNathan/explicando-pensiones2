import {
  BarChart3,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileText,
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

type PayrollExample = {
  intro: string
  bullets: string[]
  resultLabel: string
  resultValue: string
  highlightRows: string[]
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
    description: `Antes de calcular la Seguridad Social o el IRPF, primero hay que determinar tu salario bruto anual: todo lo que ganas durante el año antes de aplicar descuentos.

Para convertirlo en una base mensual de referencia, se suman el salario fijo, las pagas extra, los complementos y, si existe, el salario en especie. Después, ese total anual se divide entre 12 meses.

Por ejemplo, si cobras 28.000 € al año en 14 pagas, tu salario anual sigue siendo 28.000 €. Al dividirlo entre 12, la base mensual equivalente sería de unos 2.333,33 €. Así, las pagas extra también quedan incluidas aunque se cobren solo en momentos concretos del año.

Esta base mensual sirve como punto de partida para calcular las cotizaciones a la Seguridad Social y la retención de IRPF de la nómina.`,
    checklist: [],
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
    description: `El grupo de cotización es una categoría que usa la Seguridad Social para clasificar tu puesto de trabajo según tus funciones, tu nivel profesional y el convenio que se aplica.

Cada grupo tiene una base mínima y una base máxima. Esto significa que, antes de calcular las cotizaciones, se comprueba si tu base real está dentro de esos límites. Si queda por debajo del mínimo, se usa la base mínima. Si supera el máximo, se usa la base máxima. Y si está dentro del rango, se usa la base real que hemos calculado en el paso anterior.

La base de cotización es la cantidad que se toma como referencia para calcular cuánto se paga a la Seguridad Social cada mes. Sobre esa base se aplican los porcentajes correspondientes, como desempleo, contingencias comunes o formación profesional.

Por eso es importante: una parte de esas cotizaciones se descuenta de tu nómina y otra parte, normalmente mayor, la paga la empresa. Cuanto más alta sea la base de cotización, mayor será el coste de Seguridad Social para ambos.

Además, esta base también influye en futuras prestaciones. Por ejemplo, puede afectar a cuánto cobrarías de paro, durante una baja médica, en una incapacidad o en la pensión de jubilación. En general, una base más alta significa pagar más ahora, pero también puede dar derecho a prestaciones más altas en el futuro.
`,
    checklist: [],
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
    description: `Las cotizaciones sociales son las cantidades que se pagan cada mes a la Seguridad Social. Se calculan aplicando distintos porcentajes sobre tu base de cotización.
     Una parte se descuenta directamente de tu salario bruto y aparece en tu nómina como cotización del trabajador. Por eso reduce tu salario neto, es decir, lo que finalmente cobras. 
     La otra parte la paga la empresa además de tu salario bruto. No se resta de tu nómina, pero sí forma parte del coste total que tiene la empresa por contratarte. 
     Estas cotizaciones sirven para financiar prestaciones como la jubilación, las bajas por enfermedad, el desempleo, la formación profesional, los accidentes laborales o el refuerzo del sistema de pensiones. 
    Por ejemplo, si tu base de cotización es de 1.929 € al mes, los porcentajes se aplican sobre esa cantidad. Si la parte del trabajador suma un 6,48 %, se descontarían unos 125 € de tu salario bruto. Además, la empresa tendría que pagar sus propias cotizaciones. En este caso, supondrían unos 612,22 € adicionales, que no se descuentan de tu nómina, pero sí aumentan el coste total de contratarte.`,
    checklist: [],
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
    description: `En el IRPF hay varias formas de pagar menos impuestos, pero no todas funcionan igual. Las más importantes son las reducciones, las deducciones y algunos beneficios en especie que pueden estar exentos total o parcialmente.

Una reducción baja la cantidad de dinero sobre la que Hacienda calcula el impuesto. Es decir, antes de aplicar los porcentajes del IRPF, se resta una parte de tu renta. Por eso se dice que una reducción afecta a la base imponible o a la base liquidable.

Por ejemplo, imagina que tienes una base de 30.000 €. Si puedes aplicar una reducción de 2.000 €, Hacienda ya no calcula el impuesto sobre 30.000 €, sino sobre 28.000 €. La reducción no te devuelve directamente 2.000 €, sino que hace que el impuesto se calcule sobre una cantidad menor.

Una deducción, en cambio, actúa más tarde. Primero se calcula cuánto impuesto te tocaría pagar y, después, la deducción resta directamente una parte de ese impuesto.

Por ejemplo, si después de hacer todos los cálculos te sale que tienes que pagar 4.000 € de IRPF, y tienes una deducción de 300 €, entonces pagarías 3.700 €. Aquí la deducción sí baja directamente la cuota final.

La diferencia clave es esta: la reducción baja la base antes de calcular el impuesto; la deducción baja el impuesto una vez ya calculado.

Además de esto, existe el salario en especie, que son beneficios que te da la empresa en lugar de pagártelos directamente como dinero. Por ejemplo, una tarjeta comida, una tarjeta transporte, un seguro médico o una ayuda de guardería.

A nivel práctico, algunos de estos beneficios funcionan de forma parecida a una reducción, porque hacen que una parte de lo que recibes no tribute en IRPF. No es exactamente una reducción técnica, porque no se aplica como una reducción general de la base, sino beneficio por beneficio. Pero el efecto para ti puede ser parecido: baja la parte de tu salario que acaba pagando impuestos.

Por ejemplo, no es lo mismo que la empresa te pague 150 € más en nómina que recibir 150 € en tarjeta comida. Si esos 150 € cumplen los requisitos fiscales, una parte puede quedar exenta y no sumarse como salario normal para calcular el IRPF.

El fundamento es bastante sencillo: Hacienda permite ciertos beneficios porque entiende que cubren gastos relacionados con el trabajo o con necesidades habituales del trabajador. Por ejemplo, comer durante la jornada laboral, desplazarte al trabajo, tener cobertura médica o facilitar la conciliación familiar. Por eso existen límites: la ventaja fiscal no está pensada para convertir todo el salario en beneficios exentos, sino para cubrir importes razonables.

Algunos límites habituales son estos: la tarjeta comida puede estar exenta hasta 11 € diarios si cumple los requisitos; el transporte público colectivo puede estar exento con un límite de 1.500 € al año y, en tarjetas o medios electrónicos, con un máximo mensual de 136,36 €; el seguro médico pagado por la empresa puede estar exento hasta 500 € al año por persona cubierta, o 1.500 € si la persona tiene discapacidad; y ciertos servicios educativos o de guardería también pueden tener tratamiento favorable si cumplen las condiciones legales`,
    checklist: [],
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
    description: `La base liquidable es la cantidad final sobre la que se aplican los tramos del IRPF. No suele coincidir con tu salario bruto, porque antes se restan las reducciones permitidas por la ley. A partir de esta base se calcula qué parte de tu renta entra en cada tramo y qué porcentaje paga cada una.

El IRPF no se calcula aplicando un único porcentaje a todo el importe. La base liquidable se reparte entre varios tramos, y cada tramo tributa solo por la parte de renta que le corresponde.

En este paso verás cómo se divide tu base liquidable, qué parte entra en cada tramo y cómo se obtiene la cuota acumulada. También entenderás la diferencia entre el tipo marginal, que se aplica al siguiente euro que ganes, y el tipo efectivo, que representa el porcentaje medio real que pagas sobre toda la base.

Estar en un tramo alto no significa que toda tu renta tribute a ese porcentaje. Solo la parte que supera el límite del tramo anterior paga el tipo más alto.`,
    checklist: [],
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
    description: `El IRPF y la Seguridad Social están ligados a tu salario, pero no son los únicos impuestos que pagas.

También pagas impuestos cuando gastas dinero: al comprar comida, pagar transporte, llenar el depósito, consumir electricidad o pagar una vivienda.

El ejemplo más claro es el IVA, que normalmente ya va incluido en el precio de los productos y servicios. No todos los gastos tienen el mismo IVA: algunos pagan el tipo general y otros tienen tipos reducidos.

También existen impuestos especiales, que afectan a consumos concretos como carburantes, alcohol, tabaco o energía.

Por eso estos impuestos no salen directamente de la nómina. Dependen más de cómo consumes que de cuánto cobras.

Idea clave: dos personas con el mismo sueldo pueden pagar impuestos totales distintos si gastan su dinero de forma diferente.`,
    checklist: [],
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

const PAYROLL_ROWS = [
  { id: 'salary-base', label: 'Salario base', value: '2.100,00 EUR', section: 'DEVENGOS' },
  { id: 'salary-complements', label: 'Complementos salariales', value: '350,00 EUR', section: 'DEVENGOS' },
  { id: 'extra-pay', label: 'Prorrata pagas extra', value: '408,33 EUR', section: 'DEVENGOS' },
  { id: 'in-kind', label: 'Retribucion en especie', value: '0,00 EUR', section: 'DEVENGOS' },
  { id: 'gross-total', label: 'Total devengado', value: '2.858,33 EUR', section: 'DEVENGOS' },
  { id: 'group', label: 'Grupo de cotizacion', value: '7', section: 'COTIZACIONES' },
  { id: 'common-base', label: 'Base contingencias comunes', value: '2.858,33 EUR', section: 'COTIZACIONES' },
  { id: 'unemployment-base', label: 'Base desempleo y formacion', value: '2.858,33 EUR', section: 'COTIZACIONES' },
  { id: 'worker-ss', label: 'Seguridad Social trabajador', value: '-185,16 EUR', section: 'DEDUCCIONES' },
  { id: 'irpf', label: 'Retencion IRPF', value: '-411,60 EUR', section: 'DEDUCCIONES' },
  { id: 'net-pay', label: 'Liquido a percibir', value: '2.261,57 EUR', section: 'RESULTADO' },
]

const PAYROLL_EXAMPLES: Record<number, PayrollExample> = {
  1: {
    intro: 'Aqui localizamos todo lo que suma antes de aplicar descuentos. Es el punto de partida de la calculadora.',
    bullets: ['Salario base', 'Complementos', 'Pagas extra', 'Salario en especie'],
    resultLabel: 'Bruto mensual ejemplo',
    resultValue: '2.858,33 EUR',
    highlightRows: ['salary-base', 'salary-complements', 'extra-pay', 'in-kind', 'gross-total'],
  },
  2: {
    intro: 'Aqui miramos las bases de cotizacion: la cifra sobre la que se calculan varias cuotas de Seguridad Social.',
    bullets: ['Grupo de cotizacion: 7', 'Base contingencias comunes: 2.858,33 EUR', 'Base desempleo y formacion: 2.858,33 EUR'],
    resultLabel: 'Base usada ejemplo',
    resultValue: '2.858,33 EUR',
    highlightRows: ['group', 'common-base', 'unemployment-base'],
  },
  3: {
    intro: 'Aqui se ve que una parte de la Seguridad Social se descuenta de la nomina y otra la paga la empresa fuera del neto.',
    bullets: ['Base de cotizacion', 'Cuotas del trabajador', 'Aportacion empresarial', 'Descuento en nomina'],
    resultLabel: 'Descuento trabajador ejemplo',
    resultValue: '185,16 EUR',
    highlightRows: ['common-base', 'unemployment-base', 'worker-ss'],
  },
  4: {
    intro: 'Aqui conectamos tu situacion personal, beneficios y ajustes con la parte de IRPF que puede cambiar el impuesto final.',
    bullets: ['Minimos personales y familiares', 'Reducciones antes de tramos', 'Deducciones al final', 'Beneficios en especie'],
    resultLabel: 'Fila relacionada en nomina',
    resultValue: 'IRPF y especie',
    highlightRows: ['in-kind', 'irpf'],
  },
  5: {
    intro: 'Aqui miramos la retencion de IRPF como resultado visible en la nomina, aunque el calculo interno se haga por tramos.',
    bullets: ['Base liquidable', 'Tramos estatal y autonomico', 'Tipo marginal', 'Retencion aplicada'],
    resultLabel: 'Retencion ejemplo',
    resultValue: '411,60 EUR',
    highlightRows: ['irpf'],
  },
  6: {
    intro: 'Aqui juntamos los descuentos que salen de la nomina para llegar al importe que finalmente recibes.',
    bullets: ['Total devengado', 'Seguridad Social', 'IRPF', 'Liquido a percibir'],
    resultLabel: 'Neto mensual ejemplo',
    resultValue: '2.261,57 EUR',
    highlightRows: ['gross-total', 'worker-ss', 'irpf', 'net-pay'],
  },
  7: {
    intro: 'Aqui recordamos que IVA e impuestos de consumo no aparecen como descuento de nomina: dependen de como gastas tu neto.',
    bullets: ['No aparece en la nomina', 'Depende del consumo', 'IVA incluido en precios', 'Otros tributos separados'],
    resultLabel: 'En nomina ejemplo',
    resultValue: 'No aparece',
    highlightRows: ['net-pay'],
  },
  8: {
    intro: 'Aqui usamos la nomina como resumen para separar bruto, coste, descuentos y neto antes de cerrar la lectura.',
    bullets: ['Bruto', 'Cotizaciones', 'IRPF', 'Neto'],
    resultLabel: 'Lectura final',
    resultValue: 'Bruto -> Neto',
    highlightRows: ['gross-total', 'worker-ss', 'irpf', 'net-pay'],
  },
}

function PayrollExamplePanel({ stepId }: { stepId: number }) {
  const example = PAYROLL_EXAMPLES[stepId] ?? PAYROLL_EXAMPLES[1]
  let currentSection = ''

  return (
    <div className="wfsc-payroll" aria-label="Ejemplo de nomina">
      <div className="wfsc-payroll__copy">
        <h3>En la nomina: que estoy viendo?</h3>
        <p>{example.intro}</p>
        <ul>
          {example.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <strong>
          <span>{example.resultLabel}</span>
          {example.resultValue}
        </strong>
      </div>

      <figure className="wfsc-payroll__sheet">
        <figcaption>Ejemplo de nomina</figcaption>
        <div className="wfsc-payroll-paper">
          <header>
            <div>
              <strong>EMPRESA EJEMPLO, S.L.</strong>
              <span>CIF: B12345678</span>
            </div>
            <div>
              <strong>Trabajador/a: Juan Perez Lopez</strong>
              <span>Periodo: Mayo 2026</span>
            </div>
          </header>
          <div className="wfsc-payroll-table">
            {PAYROLL_ROWS.map((row) => {
              const showSection = row.section !== currentSection
              currentSection = row.section
              const isHighlighted = example.highlightRows.includes(row.id)

              return (
                <div className={isHighlighted ? 'is-highlighted' : undefined} key={row.id}>
                  {showSection && <span className="wfsc-payroll-section">{row.section}</span>}
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              )
            })}
          </div>
        </div>
      </figure>
    </div>
  )
}

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
                {(activeStep.checklist.length > 0 ? activeStep.checklist : activeStep.details).map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="wfsc-help" aria-label="Ayuda del paso activo">
            <PayrollExamplePanel stepId={activeStep.id} />
            <div className="wfsc-important">
              <strong><FileText size={18} aria-hidden="true" /> {activeStep.helpTitle}</strong>
              <span>{activeStep.helpBody}</span>
            </div>
            <div className="wfsc-important wfsc-important--strong">
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

        <nav className="wfsc-step-dots" aria-label="Cambiar paso">
          {WORKER_FISCAL_STEPS.map((step) => (
            <button
              key={step.id}
              type="button"
              className={step.id === activeStep.id ? 'is-active' : undefined}
              onClick={() => setActiveStep(step.id)}
              aria-current={step.id === activeStep.id ? 'step' : undefined}
              aria-label={`Ir al paso ${step.id}: ${step.title}`}
            >
              <span>{step.id}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  )
}

export default WorkerFiscalStepsCard
