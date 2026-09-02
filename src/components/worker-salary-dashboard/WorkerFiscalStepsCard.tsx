import {
  BadgePercent,
  BarChart3,
  BookOpenCheck,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Gift,
  GraduationCap,
  Home,
  Scale,
  Shield,
  ShoppingCart,
  UserRound,
  WalletCards,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  SocialContributionRates,
  SocialContributionResult,
  WorkerContractType,
} from './WorkerSocialContributionsCard'
import './WorkerFiscalStepsCard.css'

type WorkerFiscalStepConcept = {
  id: string
  title: string
  body: ReactNode
}

type WorkerFiscalStep = {
  id: number
  title: string
  subtitle: string
  description: string
  concepts?: WorkerFiscalStepConcept[]
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
  /** Retribucion en especie detallada en el paso 4: alimenta la linea BASE IRPF ESPECIE. */
  inKindSalaryAnnual: number
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

function getStepDescription(step: WorkerFiscalStep, live?: PayrollLiveData) {
  if (step.id !== 3 || !live) return step.description

  const { socialContributions } = live
  const contributionBaseMonthly = formatPayrollNumber(live.contributionBaseMonthly)
  const workerRate = formatPayrollPercent(socialContributions.workerContributionRate)
  const workerMonthly = formatPayrollNumber(socialContributions.workerContributionsMonthly)
  const companyRate = formatPayrollPercent(socialContributions.companyContributionRate)
  const companyMonthly = formatPayrollNumber(socialContributions.companyContributionsMonthly)

  return `Las cotizaciones sociales son las cantidades que se pagan cada mes a la Seguridad Social. Se calculan aplicando distintos porcentajes sobre tu base de cotización (mirar paso 2).
     Una parte se descuenta directamente de tu salario bruto y aparece en tu nómina como cotización del trabajador. Por eso reduce tu salario neto, es decir, lo que finalmente cobras. 
     La otra parte la paga la empresa además de tu salario bruto. No se resta de tu nómina, pero sí forma parte del coste total que tiene la empresa por contratarte. 
     Estas cotizaciones sirven para financiar prestaciones como la jubilación, las bajas por enfermedad, el desempleo, la formación profesional, los accidentes laborales o el refuerzo del sistema de pensiones. 
    Con el salario que has introducido, tu base de cotización es de ${contributionBaseMonthly} € al mes. Si la parte del trabajador suma un ${workerRate} %, se descontarían unos ${workerMonthly} € de tu salario bruto. Además, la empresa tendría que pagar sus propias cotizaciones: en este caso, un ${companyRate} %, unos ${companyMonthly} € adicionales al mes, que no se descuentan de tu nómina, pero sí aumentan el coste total de contratarte.`
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
  const inKindMonthly = live.inKindSalaryAnnual / 12
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
    { id: 'in-kind', label: 'BASE IRPF ESPECIE', value: formatPayrollNumber(inKindMonthly) },
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
    4: formatPayrollNumber(inKindMonthly),
    5: formatPayrollNumber(grossMonthly),
    6: formatPayrollNumber(irpfMonthly),
    7: '',
    8: `${formatPayrollNumber(netMonthly)}#`,
    9: formatPayrollNumber(netMonthly),
    10: `${formatPayrollNumber(netMonthly)}#`,
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
    id: 0,
    title: 'Resumen rápido',
    subtitle: 'Las cifras esenciales antes de entrar en detalle',
    description: 'Empieza con una vista condensada de cuánto cuesta tu trabajo a la empresa, cuánto pagas tú en cotizaciones e IRPF y cuánto salario neto te queda. Puedes comparar los resultados en euros o como porcentaje de tu salario bruto.\n\nCuando quieras entender de dónde sale cada cifra, continúa por los trece pasos del recorrido.',
    checklist: [],
    helpTitle: 'Una primera aproximación',
    helpBody: 'El resumen reúne los resultados principales. Los pasos siguientes explican las bases, límites, cuotas y ajustes que hay detrás.',
    details: [],
    important: 'El resumen orienta; el detalle explica.',
    Icon: Zap,
  },
  {
    id: 1,
    title: 'Base real',
    subtitle: 'Empieza por lo que cobras antes de descuentos',
    description: `Tu salario bruto anual reúne salario fijo, pagas extra, complementos y retribuciones en especie antes de descuentos.

La calculadora lo convierte en una referencia mensual dividiendo el total anual entre 12. No es todavía la base de cotización ni la base liquidable del IRPF.`,
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
    description: ` Para calcular cuánto pagas a la Seguridad Social, se toma como referencia tu salario. Sin embargo, cada grupo de cotización establece una base mínima y una máxima.
                   
    Si ganas menos que la base mínima, cotizarás por esa cantidad, por lo que pagarás algo más de lo que cotizarías por tu salario, pero también generarás derecho a prestaciones más altas (Ej. Pension). En cambio, si ganas más que la base máxima, solo cotizarás hasta ese límite, por lo que pagarás proporcionalmente menos, aunque tus prestaciones también estarán limitadas por esa base máxima.
    
    En este paso, calculamos tu base de cotización y en el siguiente veremos cuanto pagas en consecuencia de esta base.`,
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
    description: `Las cotizaciones se calculan aplicando varios porcentajes sobre la base del paso anterior. Una parte se descuenta de tu nómina y otra la paga la empresa además de tu salario.

Aquí puedes comparar ambas aportaciones y ver qué financia cada concepto.`,
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
    title: 'Retribución en especie',
    subtitle: 'Lo que la empresa te paga sin darte dinero',
    description: `Algunas empresas pagan parte de lo que ganas en forma de beneficios, no de dinero: ticket restaurante, abono de transporte, seguro médico o guardería. Si no tienes ninguno, responde «No» y continúa. Es un paso de una sola pregunta.
 
 
    Aquí es donde la Seguridad Social y el IRPF dejan de ir juntos. El salario del paso 1 que has puesto ya debería incluir la retribución en especie, asegúrate de haberlo puesto bien. 

`,
    concepts: [
      {
        id: 'exemption',
        title: '¿Exención, reducción o deducción?',
        body: (
          <>
            <div className="wfsc-concept__lead">
              <p>
                Son tres formas distintas de pagar menos y actúan en tres momentos distintos del cálculo.
                La <strong>exención</strong> es la primera: esa renta ni siquiera llega a contarse como
                ingreso.
              </p>
              <p>
                Por eso los tickets exentos no aparecen luego como una resta: simplemente el bruto sobre
                el que se calcula todo lo demás ya sale más bajo.
              </p>
            </div>
            <div className="wfsc-concept__formulas">
              <p className="wfsc-concept__formula">
                <b>exención</b>
                <span>no entra en el bruto</span>
                <em>este paso</em>
              </p>
              <p className="wfsc-concept__formula">
                <b>reducción</b>
                <span>resta de la base: baja la cantidad sobre la que se calcula cuánto tienes que pagar</span>
                <em>paso 5</em>
              </p>
              <p className="wfsc-concept__formula">
                <b>deducción</b>
                <span>resta de la cuota: baja directamente el impuesto que tienes que pagar</span>
                <em>paso 7</em>
              </p>
            </div>
          </>
        ),
      },
    ],
    checklist: [],
    helpTitle: 'Exento para Hacienda, no para la Seguridad Social',
    helpBody: 'Desde 2013 casi toda la retribución en especie cotiza a la Seguridad Social por su valor completo. La exención del IRPF no cambia lo que cotizaste en el paso 3: solo baja el bruto que tributa.',
    details: [
      'El ticket restaurante queda exento hasta 11 EUR por dia efectivamente trabajado; lo que pase de ahi tributa.',
      'El abono de transporte queda exento hasta 136,36 EUR al mes y 1.500 EUR al ano.',
      'El seguro medico queda exento hasta 500 EUR por persona asegurada, o 1.500 EUR si tiene discapacidad; la guarderia de empresa no tiene tope si cumple los requisitos.',
      'Si la empresa asume el ingreso a cuenta y no te lo repercute, ese importe suma a la valoracion en lugar de restar.',
    ],
    important: 'La parte exenta no es una resta que veas despues: baja el bruto desde el que arrancan todos los pasos siguientes.',
    Icon: Gift,
  },
  {
    id: 5,
    title: 'Base liquidable',
    subtitle: 'Calculando las reducciones y el mínimo personal y familiar',
    description: `Ya tenemos tu bruto del paso 1, lo que pagas a la Seguridad Social del paso 3 y la parte de especie que queda exenta del paso 4.

Ahora vamos a calcular tu base liquidable, que es la cantidad que se utiliza para calcular cuánto IRPF tienes que pagar.

Para hacerlo, empezamos por los gastos deducibles de tu trabajo; después veremos si puedes aplicar alguna reducción y calcularemos tu mínimo personal y familiar.

Completa únicamente los apartados que correspondan a tu situación.`,
    concepts: [
      {
        id: 'reductions',
        title: '¿Qué son las reducciones?',
        body: (
          <>
            <p>
              Una reducción es una cantidad que puedes restar de tu base imponible si cumples
              determinados requisitos. Por ejemplo, con una base imponible de 30.000 € y una reducción
              de 2.000 €:
            </p>
            <p className="wfsc-concept__formula">30.000 € − 2.000 € = 28.000 € de base liquidable</p>
            <p>
            Los tramos del IRPF se calculan como si estuvieras «cobrando» 28.000 € en lugar de 30.000 €, así que pagas menos. La cantidad que puedes dejar exenta depende de tu situación personal y económica.
            </p>
          </>
        ),
      },
      {
        id: 'minimum',
        title: '¿Qué es el mínimo personal y familiar?',
        body: (
          <>
            <p>
            Es la cantidad que el Estado considera necesaria para cubrir tus necesidades básicas y las de tu familia, y es por eso que no paga IRPF.
            Pero si se tienen en cuenta para calcular el IRPF, ya que primero se aplica los tramos a tu renta y luego se resta la parte que corresponde al mínimo personal y familiar.
            </p>
            
            <p className="wfsc-concept__later">
              Por eso su efecto no se ve aquí, aquí solo calculamos su valor. Su efecto se verá
               en el paso 6, «IRPF por tramos», cuando ya tengamos la cuota de IRPF que tienes que pagar calculada, que es donde se descontará.
            </p>
          </>
        ),
      },
    ],
    checklist: [],
    helpTitle: 'Gasto deducible, reducción y mínimo',
    helpBody: 'Un gasto deducible resta del salario bruto y da el rendimiento neto. Una reducción resta después, de la base imponible. El mínimo no resta de la base: deja sin pagar la parte de cuota que le corresponde.',
    details: [
      'Los gastos deducibles (Seguridad Social, los 2.000 EUR generales, sindicato, colegio o defensa jurídica) se restan primero y dan el rendimiento neto del trabajo.',
      'Las reducciones (planes de pensiones, pensión compensatoria, declaración conjunta, patrimonio protegido) se restan después y dan la base liquidable, que es la que entra en los tramos.',
      'Los mínimos personales y familiares protegen una parte de la renta según edad, convivencia, discapacidad y familiares a cargo; convivencia, rentas propias o presentar declaración pueden dejar fuera a un familiar.',
    ],
    important: 'Dos personas con el mismo salario pueden pagar IRPF distinto por su situación personal y su comunidad.',
    Icon: UserRound,
  },
  {
    id: 6,
    title: 'IRPF por tramos',
    subtitle: 'El IRPF no aplica un unico porcentaje',
    description: `El IRPF reparte la base liquidable entre una escala estatal y otra autonómica. Cada porcentaje se aplica solo a la parte de renta que cae en ese tramo.

El tipo marginal afecta al siguiente euro; el tipo efectivo resume lo pagado sobre el conjunto.`,
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
    id: 7,
    title: 'Deducciones de cuota',
    subtitle: 'Lo que restas de la cuota, no de la base',
    description: `En el paso 5 calculamos la base liquidable y en el 6 has visto salir la cuota por tramos. Lo que respondas aquí resta de esa cuota, euro a euro.

Es el último ajuste del IRPF: donativos, alquiler, inversión en empresa nueva, las deducciones reembolsables y lo que ya te han retenido en la nómina.

Completa únicamente lo que puedas acreditar. Mira los importes en tu nómina o certificado de retenciones.`,
    concepts: [
      {
        id: 'reduction-vs-deduction',
        title: '¿Reducción o deducción?',
        body: (
          <>
            <p>
              No es lo mismo restar de la base que restar de la cuota. Una reducción baja la cantidad sobre
              la que se calculan los tramos: ahorras tu tipo marginal. Una deducción resta al final, de lo
              que ya salía a pagar: 1 € de deducción te ahorra 1 €.
            </p>
            <p className="wfsc-concept__formula">1 € de deducción = 1 € menos a pagar</p>
            <p className="wfsc-concept__formula">1 € de reducción ≈ tu tipo marginal (por ejemplo, 0,30 €)</p>
            <p className="wfsc-concept__later">
              La cuota de la que restamos aquí es la que acaba de salir en el paso 6, «IRPF por tramos».
              Allí has visto cómo se forma; aquí la bajamos con lo que puedas acreditar.
            </p>
          </>
        ),
      },
      {
        id: 'refundable',
        title: '¿Qué es una deducción reembolsable?',
        body: (
          <>
            <p>
              La mayoría de deducciones solo pueden bajar la cuota hasta cero: si no te sale a pagar, no
              te devuelven el resto. Las reembolsables (maternidad, guardería, familia numerosa, discapacidad
              a cargo) sí: te las abonan aunque tu cuota sea 0 €.
            </p>
            <p className="wfsc-concept__formula">cuota 0 € − 1.200 € de maternidad = 1.200 € a devolver</p>
            <p>
              Si ya has cobrado el abono anticipado durante el año, ese importe se descuenta para no
              pagártelo dos veces.
            </p>
          </>
        ),
      },
    ],
    checklist: [],
    helpTitle: '¿Por qué van después de los tramos?',
    helpBody: 'Una deducción necesita una cuota de la que restar. Hasta que el paso 6 no calcula esa cuota, no hay nada que descontar: por eso este paso cierra el IRPF y no lo abre.',
    details: [
      'Las deducciones se revisan al final y dependen de requisitos, ejercicio fiscal y comunidad autónoma.',
      'La mayoría solo puede bajar la cuota hasta cero; las reembolsables se abonan aunque la cuota sea 0 €.',
      'Las retenciones que ya te ha practicado la empresa se restan aquí: por eso el resultado puede salir a devolver.',
    ],
    important: 'Estas partidas se aplican en el cálculo del IRPF, no como línea de deducciones de la nómina mensual.',
    Icon: BadgePercent,
  },
  {
    id: 8,
    title: 'IVA y consumo diario',
    subtitle: 'Impuestos que dependen de como gastas',
    description: `El IVA y los impuestos especiales dependen de cómo gastas, no solo de lo que cobras. Distribuye tu gasto mensual para obtener una estimación por categorías.

Si no completas el reparto, el resumen mantendrá una aproximación general claramente identificada.`,
    checklist: [],
    helpTitle: 'Que son categorias de gasto?',
    helpBody: 'Son grupos de consumo: vivienda, comida, transporte, ocio, energia, etc. Cada grupo puede tener un tipo de IVA o un impuesto distinto.',
    details: [
      'El IVA se paga al comprar bienes o servicios y no sale directamente de la nomina.',
      'Los impuestos especiales afectan a consumos concretos, como carburantes, alcohol, tabaco o energia, segun el caso.',
      'Este paso solo mide el consumo corriente: lo que pagas por tener vivienda o coche va en el paso siguiente.',
    ],
    important: 'Dos personas con el mismo neto pueden pagar impuestos indirectos muy distintos si consumen de forma diferente.',
    Icon: ShoppingCart,
  },
  {
    id: 9,
    title: 'Vivienda y coche',
    subtitle: 'Impuestos por tener, no por gastar',
    description: `Hay impuestos que no dependen de tu consumo, sino de lo que posees. El IBI (Impuesto sobre Bienes Inmuebles) de tu vivienda y el IVTM (Impuesto sobre Vehículos de Tracción Mecánica, el llamado «impuesto de circulación») de tu coche se cobran cada año, así que se reparten al mes y entran en el resumen.

Aquí también puedes recuperar lo que pagaste al comprar (IVA, ITP, AJD o matriculación). Fue un pago único de entonces y por eso se muestra aparte, sin sumarse a tu mes.

Si no tienes vivienda ni coche en propiedad, responde «No» a las dos preguntas y continúa.`,
    checklist: [],
    helpTitle: 'Por que no va con el IVA?',
    helpBody: 'El IVA lo pagas cada vez que compras algo. El IBI y el IVTM los pagas por ser propietario, aunque ese año no gastes nada. Son dos hechos distintos y por eso ocupan pasos distintos.',
    details: [
      'El IBI lo fija tu ayuntamiento sobre el valor catastral; el IVTM, sobre la potencia fiscal del vehiculo. Ambos son anuales y recurrentes.',
      'El impuesto de la compra (IVA o ITP en vivienda; IVA, ITP o matriculacion en coche) fue un pago unico y no se reparte entre las cuotas de la hipoteca o del prestamo.',
      'Pais Vasco y Navarra tienen regimen foral propio en transmisiones y aqui no se estiman.',
    ],
    important: 'Solo el IBI y el IVTM se suman a tu impacto mensual. Los impuestos de la compra son contexto historico.',
    Icon: Home,
  },
  {
    id: 10,
    title: 'Resumen del cálculo',
    subtitle: 'A dónde va el dinero que cuesta tu trabajo',
    description: `El gráfico reparte el coste total de tu puesto entre lo que te llevas y cada impuesto: cotizaciones de empresa, cotizaciones tuyas, IRPF, IVA, impuestos especiales y el IBI y el IVTM de tu casa y tu coche.

Debajo verás la otra cara de esas mismas figuras: cuánto recauda el conjunto de Administraciones Públicas con cada una, en euros, sobre los ingresos públicos y sobre el PIB, en qué se gasta y qué efecto tiene sobre ti.`,
    checklist: ['Reparto del coste laboral', 'Casa y coche', 'Recaudación por impuesto', 'Destino y efecto de cada figura'],
    helpTitle: 'Como leer este resumen?',
    helpBody: 'Empieza por el gráfico: la porción verde es lo que te queda de cada 100 € que cuesta tu puesto. El resto son impuestos y cotizaciones ordenados por tamaño. Después contrasta tu cifra con lo que recauda el Estado por esa misma figura.',
    details: [
      'El reparto usa el coste laboral (bruto mas cotizaciones de empresa) como total, no el salario bruto.',
      'El IBI y el IVTM se pagan por tener vivienda o coche, aunque ese ano no ingreses nada por ellos.',
      'Las cifras de recaudacion son de 2024 en contabilidad nacional y corresponden al conjunto de Administraciones Publicas, no a una persona.',
    ],
    important: 'El resumen no inventa datos nuevos: consolida lo que ya has calculado y lo compara con la recaudacion oficial de cada figura.',
    Icon: WalletCards,
  },
  {
    id: 11,
    title: 'Comprueba lo aprendido',
    subtitle: 'Repaso opcional por apartados · 10-15 min',
    description: `Este paso es opcional: puedes saltarlo y seguir con el recorrido sin perder ninguna cifra.

Si le dedicas 10 o 15 minutos, para nosotros es muy importante. Cada pregunta está atada a un paso concreto, así que cuando muchas personas fallan en el mismo sitio sabemos que ese apartado no está bien explicado y lo reescribimos.

No hay que escribir nada: se responde eligiendo, ordenando, emparejando, clasificando o moviendo un deslizador. Se corrige apartado a apartado, con la explicación al momento.

Tus respuestas se envían de forma anónima, solo para saber qué apartados explicamos mal. No se envía tu información personal ni ninguna cifra de la calculadora.`,
    checklist: [],
    helpTitle: 'Para que sirve el repaso?',
    helpBody: 'No es un examen ni guarda nota en ningun sitio. Sirve para localizar los apartados que no se entienden y reescribirlos.',
    details: [
      'Diez apartados, uno por cada bloque del recorrido, con preguntas de varios tipos.',
      'Cada pregunta se puede marcar como «esto no estaba bien explicado», aunque la aciertes.',
      'El progreso se guarda en tu navegador: puedes salir, seguir con el recorrido y volver donde lo dejaste.',
      'Solo viaja el resultado del cuestionario, y de forma anonima: nunca tu salario, tu comunidad ni tu situacion familiar.',
    ],
    important: 'Es un paso opcional, pero es la mejor forma de decirnos donde nos hemos explicado mal.',
    Icon: GraduationCap,
  },
  {
    id: 12,
    title: 'Preguntas frecuentes',
    subtitle: 'Resuelve dudas despues del resumen',
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
  {
    id: 13,
    title: 'Fuentes del calculo',
    subtitle: 'Origen y valor de cada parametro',
    description: 'Consulta en una sola pantalla las fuentes oficiales utilizadas, el enlace al documento original y el valor concreto aplicado a tu calculo.',
    checklist: ['Nombre del parametro', 'Organismo oficial', 'Valor utilizado', 'Enlace verificable'],
    helpTitle: 'Como comprobar el resultado',
    helpBody: 'Cada bloque conecta el valor aplicado con su norma o dataset institucional.',
    details: [],
    important: 'Los valores cambian cuando modificas tus datos; las fuentes permanecen visibles para que el calculo sea auditable.',
    Icon: BookOpenCheck,
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
    resultLabel: 'BASE IRPF ESPECIE',
    resultValue: '0,00',
    highlightRows: ['in-kind', 'gross-total'],
  },
  5: {
    resultLabel: 'BASE IRPF',
    resultValue: '1.750,00',
    highlightRows: ['irpf-base', 'irpf'],
  },
  6: {
    resultLabel: 'RETENCION IRPF',
    resultValue: '210,00',
    highlightRows: ['irpf', 'irpf-withholding'],
  },
  8: {
    resultLabel: 'IMPORTE',
    resultValue: '1.426,24#',
    highlightRows: ['net-pay'],
  },
  9: {
    resultLabel: 'IMPORTE',
    resultValue: '1.426,24#',
    highlightRows: ['net-pay'],
  },
  10: {
    resultLabel: 'LIQUIDO TOTAL',
    resultValue: '1.426,24',
    highlightRows: ['gross-total', 'worker-ss', 'irpf-withholding', 'deductions-total', 'net-pay'],
  },
  11: {
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
  const showDualHighlightLegend = Boolean(example.highlightWorkerRows?.length || example.highlightCompanyRows?.length)

  return (
    <figure className="wfsc-payroll" aria-label="Nómina simplificada con la parte de este paso resaltada">
      <figcaption>Nómina simplificada: lo resaltado es la parte que se trata en este paso.</figcaption>
      {showDualHighlightLegend ? (
        <ul className="wfsc-payroll-legend" aria-label="Leyenda de colores en la nómina">
          <li className="wfsc-payroll-legend__item wfsc-payroll-legend__item--worker">
            <span className="wfsc-payroll-legend__swatch" aria-hidden="true" />
            <span>Azul: cotización del trabajador</span>
          </li>
          <li className="wfsc-payroll-legend__item wfsc-payroll-legend__item--company">
            <span className="wfsc-payroll-legend__swatch" aria-hidden="true" />
            <span>Verde: aportación de la empresa</span>
          </li>
        </ul>
      ) : null}
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
              <span>01.05.2025 - 31.05.2025</span>
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
  const [internalActiveStepId, setInternalActiveStepId] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const skipInitialScrollRef = useRef(true)
  const currentStepId = activeStepId ?? internalActiveStepId
  const activeIndex = WORKER_FISCAL_STEPS.findIndex((step) => step.id === currentStepId)
  const activeStep = WORKER_FISCAL_STEPS[activeIndex] ?? WORKER_FISCAL_STEPS[0]
  const activeDescription = getStepDescription(activeStep, payrollLiveData)
  const descriptionParagraphs = activeDescription.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
  const stepConcepts = activeStep.concepts ?? []
  const detailStepCount = WORKER_FISCAL_STEPS.length - 1
  const progress = useMemo(() => activeStep.id / detailStepCount * 100, [activeStep.id, detailStepCount])
  const nextStep = WORKER_FISCAL_STEPS[activeIndex + 1]
  const ActiveIcon = activeStep.Icon
  const showPayrollHelp = activeStep.id !== 0 && activeStep.id !== 7 && activeStep.id < 11
  const showConceptHelp = activeStep.id === 7
  const isSummaryStep = activeStep.id === 0
  const isCompactStep = activeStep.id >= 11
  const heroIsSingle = !showPayrollHelp && !showConceptHelp
  const statusLabel = activeStep.id === 0
    ? 'Resumen rápido'
    : `Paso ${activeStep.id} de ${detailStepCount} · ${activeStep.title}`

  const setActiveStep = (nextStepId: number) => {
    const clampedStepId = Math.min(detailStepCount, Math.max(0, nextStepId))
    setInternalActiveStepId(clampedStepId)
    onStepChange?.(clampedStepId)
  }

  const goToPrevious = () => {
    setActiveStep(activeStep.id - 1)
  }

  const goToNext = () => {
    setActiveStep(activeStep.id + 1)
  }

  useEffect(() => {
    if (skipInitialScrollRef.current) {
      skipInitialScrollRef.current = false
      return
    }

    sectionRef.current?.scrollIntoView({ block: 'start' })
  }, [currentStepId])

  return (
    <section
      ref={sectionRef}
      className="wfsc"
      aria-labelledby={isCompactStep ? undefined : 'wfsc-title'}
      aria-label={isCompactStep ? 'Navegacion del recorrido fiscal' : undefined}
    >
      {!isCompactStep ? (
        <div className={`wfsc-stage wfsc-stage--step-${activeStep.id}${isSummaryStep ? ' wfsc-stage--summary' : ''}${showConceptHelp ? ' wfsc-stage--concept' : ''}`}>
          <div className={`wfsc-hero${heroIsSingle ? ' wfsc-hero--single' : ''}${showConceptHelp ? ' wfsc-hero--concept' : ''}`}>
            <div className="wfsc-hero-main">
              <span className="wfsc-step-orb" aria-hidden="true">
                <ActiveIcon size={34} strokeWidth={2.35} />
                <b>{activeStep.id === 0 ? 'R' : activeStep.id}</b>
              </span>
              <div className="wfsc-copy">
                <p>{activeStep.id === 0 ? 'Antes de empezar' : `Paso ${activeStep.id} de ${detailStepCount}`}</p>
                <h2 id="wfsc-title">{activeStep.title}</h2>
                <p className="wfsc-copy__subtitle">{activeStep.subtitle}</p>
                <div className="wfsc-description">
                  {descriptionParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {showPayrollHelp ? (
              <aside className="wfsc-help" aria-label="Ayuda del paso activo">
                <PayrollExamplePanel stepId={activeStep.id} payrollLiveData={payrollLiveData} />
              </aside>
            ) : null}

            {showConceptHelp ? (
              <aside className="wfsc-help wfsc-help--concept" aria-label="Aclaración del paso activo">
                <p className="wfsc-help__eyebrow">No aparece en la nómina</p>
                <h3>{activeStep.helpTitle}</h3>
                <p>{activeStep.helpBody}</p>
                <p className="wfsc-help__note">{activeStep.important}</p>
              </aside>
            ) : null}
          </div>

          {stepConcepts.length > 0 ? (
            <div className={`wfsc-concepts${stepConcepts.length === 1 ? ' wfsc-concepts--single' : ''}`}>
              {stepConcepts.map((concept) => (
                <section
                  key={concept.id}
                  className="wfsc-concept"
                  aria-labelledby={`wfsc-concept-${concept.id}`}
                >
                  <h3 id={`wfsc-concept-${concept.id}`}>{concept.title}</h3>
                  {concept.body}
                </section>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="wfsc-chrome" role="navigation" aria-label="Navegacion del recorrido fiscal">
        <button
          className="wfsc-nav wfsc-nav--previous"
          type="button"
          onClick={goToPrevious}
          disabled={activeStep.id === 0}
          aria-label="Ir al paso anterior"
        >
          <ChevronLeft size={22} aria-hidden="true" />
          <span>Anterior</span>
        </button>

        <div className="wfsc-chrome__center">
          <p className="wfsc-chrome__status">{statusLabel}</p>
          <nav className="wfsc-step-dots" aria-label="Cambiar paso">
            {WORKER_FISCAL_STEPS.map((step) => {
              const isActive = step.id === activeStep.id
              const isDone = step.id < activeStep.id
              return (
                <button
                  key={step.id}
                  type="button"
                  className={isActive ? 'is-active' : isDone ? 'is-done' : undefined}
                  onClick={() => setActiveStep(step.id)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={step.id === 0 ? 'Ir al resumen rápido' : `Ir al paso ${step.id}: ${step.title}`}
                  title={step.title}
                >
                  {isDone ? <Check size={14} strokeWidth={2.6} aria-hidden="true" /> : <span>{step.id === 0 ? 'R' : step.id}</span>}
                </button>
              )
            })}
          </nav>
        </div>

        <button
          className="wfsc-nav wfsc-nav--next"
          type="button"
          onClick={goToNext}
          disabled={!nextStep}
          aria-label={nextStep ? `Ir al siguiente paso: ${nextStep.title}` : 'No hay más pasos'}
        >
          <span className="wfsc-nav__next-text">
            <strong>{activeStep.id === 0 ? 'Empezar' : 'Continuar'}</strong>
            {nextStep ? <em>{nextStep.title}</em> : null}
          </span>
          <ChevronRight size={22} aria-hidden="true" />
        </button>

        <div
          className="wfsc-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label={statusLabel}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  )
}

export default WorkerFiscalStepsCard
