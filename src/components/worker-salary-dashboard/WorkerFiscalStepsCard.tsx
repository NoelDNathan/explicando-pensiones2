import {
  BarChart3,
  Calculator,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Scale,
  Shield,
  ShoppingCart,
  UserRound,
  WalletCards,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type {
  SocialContributionRates,
  SocialContributionResult,
  WorkerContractType,
} from './WorkerSocialContributionsCard'
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
  resultLabel: string
  resultValue: string
  highlightRows?: string[]
  highlightWorkerRows?: string[]
  highlightCompanyRows?: string[]
}

type PayrollRow = {
  id: string
  code: string
  concept: string
  units?: string
  price?: string
  earnings?: string
  deductions?: string
}

type PayrollBaseRow = {
  id: string
  concept: string
  base?: string
  rate?: string
  company?: string
}

type WorkerFiscalStepsCardProps = {
  activeStepId?: number
  onStepChange?: (stepId: number) => void
  payrollLiveData?: PayrollLiveData
}

export type PayrollLiveData = {
  grossSalaryAnnual: number
  salaryAnnual: number
  salaryComplementsAnnual: number
  contributionBaseMonthly: number
  socialContributions: SocialContributionResult
  irpfAnnual: number
  netSalaryAnnual: number
  rates: SocialContributionRates
  contractType: WorkerContractType
}

type PayrollSnapshot = {
  rows: PayrollRow[]
  totals: Array<{ id: string; label: string; value: string }>
  baseRows: PayrollBaseRow[]
  netPay: string
  resultValues: Record<number, string>
}

const payrollNumberFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatPayrollNumber(value: number) {
  return payrollNumberFormatter.format(Number.isFinite(value) ? value : 0)
}

function formatPayrollPercent(rate: number) {
  return payrollNumberFormatter.format((Number.isFinite(rate) ? rate : 0) * 100)
}

function buildPayrollSnapshot(live?: PayrollLiveData): PayrollSnapshot {
  if (!live) {
    return {
      rows: PAYROLL_ROWS,
      totals: PAYROLL_TOTALS,
      baseRows: PAYROLL_BASE_ROWS,
      netPay: '1.426,24',
      resultValues: Object.fromEntries(
        Object.entries(PAYROLL_EXAMPLES).map(([stepId, example]) => [Number(stepId), example.resultValue]),
      ),
    }
  }

  const grossMonthly = live.grossSalaryAnnual / 12
  const contributionBaseMonthly = live.contributionBaseMonthly
  const { breakdown } = live.socialContributions
  const workerCommonMonthly = (breakdown.worker.commonContingencies + breakdown.worker.mei) / 12
  const workerUnemploymentMonthly = breakdown.worker.unemployment / 12
  const workerTrainingMonthly = breakdown.worker.professionalTraining / 12
  const workerContributionsMonthly = live.socialContributions.workerContributionsMonthly
  const irpfMonthly = live.irpfAnnual / 12
  const netMonthly = live.netSalaryAnnual / 12
  const deductionsMonthly = workerContributionsMonthly + irpfMonthly
  const workerCommonRate = live.rates.worker.commonContingencies + live.rates.worker.mei
  const workerUnemploymentRate = live.rates.worker.unemployment[live.contractType]
  const workerTrainingRate = live.rates.worker.professionalTraining
  const companyTotalMonthly = live.socialContributions.companyContributionsMonthly
  const companyUnemploymentMonthly = breakdown.company.unemployment / 12
  const companyTrainingMonthly = breakdown.company.professionalTraining / 12
  const companyTotalRate = live.socialContributions.companyContributionRate
  const companyUnemploymentRate = live.rates.company.unemployment[live.contractType]
  const companyTrainingRate = live.rates.company.professionalTraining
  const irpfWithholdingRate = grossMonthly > 0 ? irpfMonthly / grossMonthly : 0

  const rows: PayrollRow[] = [
    {
      id: 'salary-base',
      code: '0001',
      concept: 'SALARIO BASE',
      earnings: formatPayrollNumber(live.salaryAnnual / 12),
    },
    {
      id: 'salary-complements',
      code: '0003',
      concept: 'PLUS CONVENIO',
      earnings: live.salaryComplementsAnnual > 0 ? formatPayrollNumber(live.salaryComplementsAnnual / 12) : '',
    },
    { id: 'salary-extra-complement', code: '0005', concept: 'COMPLEMENTO A DEVENGOS', earnings: '' },
    { id: 'extra-pay', code: '0006', concept: 'PAGA EXTRA PRORRATEADA', earnings: '' },
    {
      id: 'worker-ss',
      code: '/350',
      concept: 'TRAB.CONT.COMUNES',
      price: formatPayrollPercent(workerCommonRate),
      deductions: formatPayrollNumber(workerCommonMonthly),
    },
    {
      id: 'unemployment-worker',
      code: '/370',
      concept: 'TRAB.DESEMPLEO',
      price: formatPayrollPercent(workerUnemploymentRate),
      deductions: formatPayrollNumber(workerUnemploymentMonthly),
    },
    {
      id: 'training-worker',
      code: '/380',
      concept: 'TRAB.FORMAC.PROFESIONAL',
      price: formatPayrollPercent(workerTrainingRate),
      deductions: formatPayrollNumber(workerTrainingMonthly),
    },
    {
      id: 'irpf-withholding',
      code: '/475',
      concept: 'RETENCION IRPF',
      price: formatPayrollPercent(irpfWithholdingRate),
      deductions: formatPayrollNumber(irpfMonthly),
    },
  ]

  const totals = [
    { id: 'gross-total', label: 'REM.TOTALES', value: formatPayrollNumber(grossMonthly) },
    { id: 'in-kind', label: 'BASE IRPF ESPECIE', value: '' },
    { id: 'irpf-base', label: 'BASE IRPF', value: formatPayrollNumber(grossMonthly) },
    { id: 'common-base', label: 'BASE CC.CC.', value: formatPayrollNumber(contributionBaseMonthly) },
    { id: 'professional-base', label: 'BASE CC.PP.', value: formatPayrollNumber(contributionBaseMonthly) },
    { id: 'gross-total-copy', label: 'TOTAL DEVENGADO', value: formatPayrollNumber(grossMonthly) },
    { id: 'deductions-total', label: 'TOT.DEDUCCIONES', value: formatPayrollNumber(deductionsMonthly) },
  ]

  const baseRows: PayrollBaseRow[] = [
    {
      id: 'salary-monthly',
      concept: 'Importe remuneracion mensual',
      base: formatPayrollNumber(contributionBaseMonthly),
    },
    {
      id: 'common-base-detail',
      concept: 'TOTAL',
      base: formatPayrollNumber(contributionBaseMonthly),
      rate: formatPayrollPercent(companyTotalRate),
      company: formatPayrollNumber(companyTotalMonthly),
    },
    {
      id: 'unemployment-base',
      concept: 'Desempleo',
      rate: formatPayrollPercent(companyUnemploymentRate),
      company: formatPayrollNumber(companyUnemploymentMonthly),
    },
    {
      id: 'training-base',
      concept: 'Form. Profesional',
      base: formatPayrollNumber(contributionBaseMonthly),
      rate: formatPayrollPercent(companyTrainingRate),
      company: formatPayrollNumber(companyTrainingMonthly),
    },
    {
      id: 'irpf',
      concept: 'Base sujeta a retencion del IRPF',
      base: formatPayrollNumber(grossMonthly),
    },
  ]

  const resultValues: Record<number, string> = {
    1: formatPayrollNumber(grossMonthly),
    2: formatPayrollNumber(contributionBaseMonthly),
    3: formatPayrollNumber(workerContributionsMonthly),
    4: formatPayrollNumber(grossMonthly),
    5: formatPayrollNumber(irpfMonthly),
    6: formatPayrollNumber(netMonthly),
    7: `${formatPayrollNumber(netMonthly)}#`,
    8: `${formatPayrollNumber(netMonthly)}#`,
  }

  return {
    rows,
    totals,
    baseRows,
    netPay: formatPayrollNumber(netMonthly),
    resultValues,
  }
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
    description: `Las cotizaciones sociales son las cantidades que se pagan cada mes a la Seguridad Social. Se calculan aplicando distintos porcentajes sobre tu base de cotización (mirar paso 2).
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

const PAYROLL_ROWS: PayrollRow[] = [
  { id: 'salary-base', code: '0001', concept: 'SALARIO BASE', earnings: '1.200,40' },
  { id: 'salary-complements', code: '0003', concept: 'PLUS CONVENIO', earnings: '106,40' },
  { id: 'salary-extra-complement', code: '0005', concept: 'COMPLEMENTO A DEVENGOS', earnings: '225,36' },
  { id: 'extra-pay', code: '0006', concept: 'PAGA EXTRA PRORRATEADA', earnings: '217,84' },
  { id: 'worker-ss', code: '/350', concept: 'TRAB.CONT.COMUNES', price: '4,85', deductions: '84,88' },
  { id: 'unemployment-worker', code: '/370', concept: 'TRAB.DESEMPLEO', price: '1,55', deductions: '27,13' },
  { id: 'training-worker', code: '/380', concept: 'TRAB.FORMAC.PROFESIONAL', price: '0,10', deductions: '1,75' },
  { id: 'irpf-withholding', code: '/475', concept: 'RETENCION IRPF', price: '12,00', deductions: '210,00' },
]

const PAYROLL_TOTALS = [
  { id: 'gross-total', label: 'REM.TOTALES', value: '1.750,00' },
  { id: 'in-kind', label: 'BASE IRPF ESPECIE', value: '' },
  { id: 'irpf-base', label: 'BASE IRPF', value: '1.750,00' },
  { id: 'common-base', label: 'BASE CC.CC.', value: '1.750,00' },
  { id: 'professional-base', label: 'BASE CC.PP.', value: '1.750,00' },
  { id: 'gross-total-copy', label: 'TOTAL DEVENGADO', value: '1.750,00' },
  { id: 'deductions-total', label: 'TOT.DEDUCCIONES', value: '323,76' },
]

const PAYROLL_BASE_ROWS: PayrollBaseRow[] = [
  { id: 'salary-monthly', concept: 'Importe remuneracion mensual', base: '1.750,00' },
  { id: 'common-base-detail', concept: 'TOTAL', base: '1.750,00', rate: '24,35', company: '426,12' },
  { id: 'unemployment-base', concept: 'Desempleo', rate: '5,50', company: '96,25' },
  { id: 'training-base', concept: 'Form. Profesional', base: '1.750,00', rate: '0,60', company: '10,50' },
  { id: 'irpf', concept: 'Base sujeta a retencion del IRPF', base: '1.750,00' },
]

const PAYROLL_EXAMPLES: Record<number, PayrollExample> = {
  1: {
    resultLabel: 'TOTAL DEVENGADO',
    resultValue: '1.750,00',
    highlightRows: ['salary-base', 'salary-complements', 'salary-extra-complement', 'extra-pay', 'gross-total', 'gross-total-copy'],
  },
  2: {
    resultLabel: 'BASE CC.CC.',
    resultValue: '1.750,00',
    highlightRows: ['common-base', 'professional-base', 'salary-monthly'],
  },
  3: {
    resultLabel: 'TOT.DEDUCCIONES',
    resultValue: '323,76',
    highlightWorkerRows: ['worker-ss', 'unemployment-worker', 'training-worker'],
    highlightCompanyRows: ['common-base-detail', 'unemployment-base', 'training-base'],
  },
  4: {
    resultLabel: 'BASE IRPF',
    resultValue: '1.750,00',
    highlightRows: ['in-kind', 'irpf', 'irpf-withholding'],
  },
  5: {
    resultLabel: 'RETENCION IRPF',
    resultValue: '210,00',
    highlightRows: ['irpf', 'irpf-withholding'],
  },
  6: {
    resultLabel: 'LIQUIDO TOTAL',
    resultValue: '1.426,24',
    highlightRows: ['gross-total', 'worker-ss', 'irpf-withholding', 'deductions-total', 'net-pay'],
  },
  7: {
    resultLabel: 'IMPORTE',
    resultValue: '1.426,24#',
    highlightRows: ['net-pay'],
  },
  8: {
    resultLabel: 'IMPORTE',
    resultValue: '1.426,24#',
    highlightRows: ['gross-total', 'worker-ss', 'irpf-withholding', 'net-pay'],
  },
}

function getRowHighlightClass(id: string, example: PayrollExample) {
  if (example.highlightWorkerRows?.includes(id)) return 'is-highlighted is-highlighted--worker'
  if (example.highlightCompanyRows?.includes(id)) return 'is-highlighted is-highlighted--company'
  if (example.highlightRows?.includes(id)) return 'is-highlighted'
  return undefined
}

function PayrollExamplePanel({ stepId, payrollLiveData }: { stepId: number; payrollLiveData?: PayrollLiveData }) {
  const example = PAYROLL_EXAMPLES[stepId] ?? PAYROLL_EXAMPLES[1]
  const payrollSnapshot = useMemo(() => buildPayrollSnapshot(payrollLiveData), [payrollLiveData])
  const rowHighlightClass = (id: string) => getRowHighlightClass(id, example)
  const resultValue = payrollSnapshot.resultValues[stepId] ?? example.resultValue

  return (
    <figure className="wfsc-payroll" aria-label="Nómina simplificada con la parte de este paso resaltada">
      <figcaption>Nómina simplificada: lo resaltado es la parte que se trata en este paso.</figcaption>
      <div className="wfsc-payroll__sheet">
        <div className="wfsc-payroll-paper">
          <div className="wfsc-payroll-title">
            <span>RECIBO INDIVIDUAL JUSTIFICATIVO DEL PAGO DE SALARIOS</span>
            <strong>[DATOS PERSONALES OCULTOS]</strong>
          </div>
          <div className="wfsc-payroll-meta" aria-label="Datos de la nomina">
            <div>
              <strong>TRABAJADOR/A</strong>
              <span>[OCULTO]</span>
            </div>
            <div>
              <strong>CENTRO DE TRABAJO</strong>
              <span>BARCELONA</span>
            </div>
            <div>
              <strong>PERIODO LIQUIDACION</strong>
              <span>01.05.2026 - 31.05.2026</span>
            </div>
            <div>
              <strong>DIAS</strong>
              <span>31</span>
            </div>
            <div>
              <strong>N. AFILIA. S.S.</strong>
              <span>[OCULTO]</span>
            </div>
            <div>
              <strong>NIF</strong>
              <span>[OCULTO]</span>
            </div>
            <div>
              <strong>ANTIGUEDAD</strong>
              <span>[OCULTO]</span>
            </div>
            <div>
              <strong>CATEGORIA PROFESIONAL</strong>
              <span>Technical Analyst</span>
            </div>
            <div>
              <strong>CENTRO COMPETENCIA</strong>
              <span>[OCULTO]</span>
            </div>
            <div>
              <strong>G.C.</strong>
              <span>03</span>
            </div>
            <div>
              <strong>G. OCUP.</strong>
              <span>100,00</span>
            </div>
          </div>

          <div className="wfsc-payroll-table" aria-label="Conceptos de nomina">
            <div className="wfsc-payroll-table__head">
              <span>COD.</span>
              <span>CONCEPTO</span>
              <span>UNIDADES</span>
              <span>PRECIO</span>
              <span>DEVENGOS</span>
              <span>DEDUCC.</span>
            </div>
            {payrollSnapshot.rows.map((row) => {
              return (
                <div className={rowHighlightClass(row.id)} key={row.id}>
                  <span>{row.code}</span>
                  <span>{row.concept}</span>
                  <span>{row.units ?? ''}</span>
                  <span>{row.price ?? ''}</span>
                  <strong>{row.earnings ?? ''}</strong>
                  <strong>{row.deductions ?? ''}</strong>
                </div>
              )
            })}
          </div>

          <div className="wfsc-payroll-totals" aria-label="Totales de nomina">
            {payrollSnapshot.totals.map((total) => (
              <div className={rowHighlightClass(total.id)} key={total.id}>
                <span>{total.label}</span>
                <strong>{total.value}</strong>
              </div>
            ))}
          </div>

          <div className="wfsc-payroll-liquid">
            <span>LIQUIDO TOTAL</span>
            <strong className={rowHighlightClass('net-pay')}>{payrollSnapshot.netPay}</strong>
          </div>

          <section className="wfsc-payroll-bases" aria-label="Bases de cotizacion e IRPF">
            <h3>DETERMINACION DE LAS BASES DE COTIZACION A LA SEGURIDAD SOCIAL Y CONCEPTOS DE RECAUDACION CONJUNTA Y DE LA BASE SUJETA A RETENCION DEL IRPF Y APORTACION DE LA EMPRESA</h3>
            <div className="wfsc-payroll-bases__head">
              <span>CONCEPTO</span>
              <span>BASE</span>
              <span>TIPO</span>
              <span>APORTACION EMPRESA</span>
            </div>
            {payrollSnapshot.baseRows.map((row) => (
              <div className={rowHighlightClass(row.id)} key={row.id}>
                <span>{row.concept}</span>
                <strong>{row.base ?? ''}</strong>
                <strong>{row.rate ?? ''}</strong>
                <strong>{row.company ?? ''}</strong>
              </div>
            ))}
          </section>

          <footer className="wfsc-payroll-result">
            <span>{example.resultLabel}</span>
            <strong>{resultValue}</strong>
          </footer>
        </div>
      </div>
    </figure>
  )
}

export function WorkerFiscalStepsCard({ activeStepId, onStepChange, payrollLiveData }: WorkerFiscalStepsCardProps) {
  const [internalActiveStepId, setInternalActiveStepId] = useState(1)
  const currentStepId = activeStepId ?? internalActiveStepId
  const activeIndex = WORKER_FISCAL_STEPS.findIndex((step) => step.id === currentStepId)
  const activeStep = WORKER_FISCAL_STEPS[activeIndex] ?? WORKER_FISCAL_STEPS[0]
  const descriptionParagraphs = activeStep.description.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
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
              <div className="wfsc-description">
                {descriptionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <aside className="wfsc-help" aria-label="Ayuda del paso activo">
            <PayrollExamplePanel stepId={activeStep.id} payrollLiveData={payrollLiveData} />
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
