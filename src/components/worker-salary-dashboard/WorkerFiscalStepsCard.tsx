import {
  BadgePercent,
  BarChart3,
  BookOpenCheck,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
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
import { useFiscalVariant } from '../fiscal-worker-dashboard/fiscalVariant'
import { EscRibbon, EscSweepText, EscTitle } from './escenario/EscenarioParts'
import './escenario/EscenarioStep.css'

type WorkerFiscalStepConcept = {
  id: string
  title: string
  body: ReactNode
}

type WorkerFiscalStepDefinition = {
  term: string
  meaning: string
}

type WorkerFiscalStep = {
  id: number
  title: string
  subtitle: string
  description: string
  definitions?: WorkerFiscalStepDefinition[]
  concepts?: WorkerFiscalStepConcept[]
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
  payrollLiveData?: PayrollLiveData
  /** Si devuelve false, no se avanza: sirve para bajar primero a las preguntas del paso. */
  onBeforeNext?: () => boolean
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

const payrollNumberFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPayrollNumber(value: number) {
  return payrollNumberFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatPayrollPercent(rate: number) {
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
    ${buildContributionsLiveParagraph({ contributionBaseMonthly, workerRate, workerMonthly, companyRate, companyMonthly })}`
}

/** Párrafo con las cifras de tu caso del paso 3. La v2 lo coloca junto a las casillas. */
export function buildContributionsLiveParagraph(values: {
  contributionBaseMonthly: string
  workerRate: string
  workerMonthly: string
  companyRate: string
  companyMonthly: string
}) {
  const { contributionBaseMonthly, workerRate, workerMonthly, companyRate, companyMonthly } = values
  return `Con el salario que has introducido, tu base de cotización es de ${contributionBaseMonthly} € al mes. Si la parte del trabajador suma un ${workerRate} %, se descontarían unos ${workerMonthly} € de tu salario bruto. Además, la empresa tendría que pagar sus propias cotizaciones: en este caso, un ${companyRate} %, unos ${companyMonthly} € adicionales al mes, que no se descuentan de tu nómina, pero sí aumentan el coste total de contratarte.`
}

const WORKER_FISCAL_STEPS: WorkerFiscalStep[] = [
  {
    id: 0,
    title: 'Resumen rápido',
    subtitle: 'Las cifras esenciales antes de entrar en detalle',
    description: 'Empieza con una vista condensada de cuánto cuesta tu trabajo a la empresa, cuánto pagas tú en cotizaciones e IRPF y cuánto salario neto te queda. Puedes comparar los resultados en euros o como porcentaje de tu salario bruto.\n\nCuando quieras entender de dónde sale cada cifra, continúa por los doce pasos del recorrido.',
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
    helpTitle: '¿Qué significa base real?',
    helpBody: 'Es una base de trabajo para la calculadora. Intenta acercarse a todo lo que recibes de la empresa antes de restar cotizaciones o impuestos.',
    details: [
      'Incluye dinero y retribuciones en especie, como coche, seguro o vales si forman parte de tu remuneración.',
      'Sirve para ordenar el cálculo: primero se mide el bruto completo y después se aplican límites, cuotas e impuestos.',
      'Si introduces importes mensuales, la calculadora los lleva a una cifra anual para comparar todo con la misma unidad.',
    ],
    important: 'No es todavía la base de cotización ni la base del IRPF. Es el bruto completo desde el que empezamos.',
    Icon: Calculator,
  },
  {
    id: 2,
    title: 'Límites de cotización',
    subtitle: 'Del bruto a la base de cotización',
    description: ` Para calcular cuánto pagas a la Seguridad Social, se toma como referencia tu salario. 
                   
    Sin embargo, si ganas menos que la base mínima, cotizarás por esa cantidad, por lo que pagarás algo más de lo que cotizarías por tu salario, pero también generarás derecho a prestaciones más altas (Ej. Pensión). En cambio, si ganas más que la base máxima, solo cotizarás hasta ese límite, por lo que pagarás proporcionalmente menos, aunque tus prestaciones también estarán limitadas por esa base máxima.
    
    Hay diferentes grupos de cotización dependiendo de tu tipo de trabajo, cada grupo tiene un mínimo y un máximo de cotización distinto.
    
    En este paso, calculamos tu base de cotización y en el siguiente veremos cuánto pagas en consecuencia de esta base.`,
    checklist: [],
    helpTitle: '¿Qué es el grupo de cotización?',
    helpBody: 'Es una categoría laboral de la Seguridad Social. Agrupa puestos parecidos y fija límites de cotización. No siempre coincide con tu puesto comercial o tu convenio.',
    details: [
      'La base mínima actúa como suelo: si tu base queda por debajo, se usa ese mínimo para cotizar.',
      'La base máxima actúa como techo: si tu salario supera el límite, las cuotas ordinarias no crecen por encima de ese tope.',
      'La base usada es la cifra final sobre la que se calculan las cotizaciones sociales del paso siguiente.',
    ],
    important: 'Si tu bruto supera la base máxima, no cotizas más por la parte que queda por encima en las cuotas ordinarias.',
    Icon: Scale,
  },
  {
    id: 3,
    title: 'Cotizaciones sociales',
    subtitle: 'Cuotas del trabajador y de la empresa',
    description: `Las cotizaciones se calculan aplicando varios porcentajes sobre la base del paso anterior. Una parte se descuenta de tu nómina y otra la paga la empresa además de tu salario.

Aquí puedes comparar ambas aportaciones y ver qué financia cada concepto.`,
    checklist: [],
    helpTitle: '¿Qué son las categorías de cotización?',
    helpBody: 'Son destinos de la cuota: jubilación y bajas comunes, desempleo, formación, refuerzo de pensiones o coberturas empresariales. Cada una puede tener un porcentaje distinto.',
    details: [
      'La cuota del trabajador aparece como descuento en la nómina y reduce el salario neto.',
      'La aportación de la empresa no se descuenta de tu nómina, pero forma parte del coste total de contratar.',
      'Algunas categorías financian prestaciones comunes; otras cubren desempleo, formación, accidentes o mecanismos específicos.',
    ],
    important: 'Tu neto baja por la parte del trabajador. La parte de empresa aumenta el coste laboral, pero no se resta de tu nómina.',
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
      'El ticket restaurante queda exento hasta 11 EUR por día efectivamente trabajado; lo que pase de ahí tributa.',
      'El abono de transporte queda exento hasta 136,36 EUR al mes y 1.500 EUR al año.',
      'El seguro médico queda exento hasta 500 EUR por persona asegurada, o 1.500 EUR si tiene discapacidad; la guardería de empresa no tiene tope si cumple los requisitos.',
      'Si la empresa asume el ingreso a cuenta y no te lo repercute, ese importe suma a la valoración en lugar de restar.',
    ],
    important: 'La parte exenta no es una resta que veas después: baja el bruto desde el que arrancan todos los pasos siguientes.',
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
    subtitle: 'El impuesto sobre lo que ganas',
    description: `El IRPF es el Impuesto sobre la Renta de las Personas Físicas: el impuesto personal que pagas a Hacienda sobre lo que ganas en el año. En el paso 5 calculamos la base liquidable, que es la cantidad sobre la que se aplica.

No cobra un único porcentaje sobre toda tu renta. Reparte esa base entre una escala estatal y otra autonómica, y cada porcentaje se aplica solo a la parte que cae en ese tramo.`,
    definitions: [
      {
        term: 'Tipo marginal',
        meaning: 'Afecta al siguiente euro.',
      },
      {
        term: 'Tipo efectivo',
        meaning: 'Resume lo pagado sobre el conjunto.',
      },
    ],
    checklist: [],
    helpTitle: 'Tipo marginal y tipo efectivo',
    helpBody: 'El tipo marginal afecta solo al siguiente euro que entra en ese tramo. El tipo efectivo es la media real que pagas sobre toda la base.',
    details: [
      'La base liquidable se reparte por escalones: cada tramo calcula impuesto solo sobre la parte que cae dentro de él.',
      'El tramo estatal y el autonómico se suman para aproximar la cuota total de IRPF.',
      'El tipo efectivo ayuda a leer el resultado real: cuota total dividida entre la base considerada.',
    ],
    important: 'Subir de tramo no hace que todo tu salario tribute al porcentaje más alto.',
    Icon: BarChart3,
  },
  {
    id: 7,
    title: 'Deducciones de cuota',
    subtitle: 'Bajan el impuesto, no lo que ganas',
    description: `En el paso 6 hemos calculado la cuota: lo que te sale a pagar de IRPF según los tramos.

Una deducción es una cantidad que, si cumples los requisitos, puedes restar de esa cuota. No reduce tu salario ni tu base: reduce el impuesto. Si te salían 3.000 € a pagar y tienes 200 € de deducción, pagas 2.800 €.

Completa únicamente lo que puedas acreditar.`,
    concepts: [
      {
        id: 'reduction-vs-deduction',
        title: '¿Reducción o deducción?',
        body: (
          <>
            <p>
              En el paso 5 las reducciones bajaban la base, y por eso ahorrabas solo una parte: tu tipo
              marginal. Aquí la resta es del impuesto ya calculado: cada euro de deducción te ahorra un euro.
            </p>
            <p className="wfsc-concept__formula">1 € de deducción = 1 € menos a pagar</p>
            <p className="wfsc-concept__formula">1 € de reducción ≈ tu tipo marginal (por ejemplo, 0,30 €)</p>
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
      'El resultado es el IRPF del año completo, el mismo que ya vas adelantando con la retención de cada nómina.',
    ],
    important: 'Estas partidas se aplican en el cálculo del IRPF, no como línea de deducciones de la nómina mensual.',
    Icon: BadgePercent,
  },
  {
    id: 8,
    title: 'IVA y consumo diario',
    subtitle: 'El impuesto sobre lo que compras',
    description: `El IVA es el Impuesto sobre el Valor Añadido: el impuesto que pagas al comprar bienes o servicios. Va incluido en el precio; no se descuenta de la nómina como el IRPF. Los impuestos especiales se suman en consumos concretos, como carburantes, alcohol, tabaco o energía.

Por eso estos impuestos dependen de cómo gastas, no solo de lo que cobras. Distribuye tu gasto mensual para obtener una estimación por categorías.

Si no completas el reparto, el resumen mantendrá una aproximación general claramente identificada.`,
    checklist: [],
    helpTitle: '¿Qué son categorías de gasto?',
    helpBody: 'Son grupos de consumo: vivienda, comida, transporte, ocio, energía, etc. Cada grupo puede tener un tipo de IVA o un impuesto distinto.',
    details: [
      'El IVA se paga al comprar bienes o servicios y no sale directamente de la nómina.',
      'Los impuestos especiales afectan a consumos concretos, como carburantes, alcohol, tabaco o energía, según el caso.',
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
    helpTitle: '¿Por qué no va con el IVA?',
    helpBody: 'El IVA lo pagas cada vez que compras algo. El IBI y el IVTM los pagas por ser propietario, aunque ese año no gastes nada. Son dos hechos distintos y por eso ocupan pasos distintos.',
    details: [
      'El IBI lo fija tu ayuntamiento sobre el valor catastral; el IVTM, sobre la potencia fiscal del vehículo. Ambos son anuales y recurrentes.',
      'El impuesto de la compra (IVA o ITP en vivienda; IVA, ITP o matriculación en coche) fue un pago único y no se reparte entre las cuotas de la hipoteca o del préstamo.',
      'País Vasco y Navarra tienen régimen foral propio en transmisiones y aquí no se estiman.',
    ],
    important: 'Solo el IBI y el IVTM se suman a tu impacto mensual. Los impuestos de la compra son contexto histórico.',
    Icon: Home,
  },
  {
    id: 10,
    title: 'Resumen del cálculo',
    subtitle: 'A dónde va el dinero que cuesta tu trabajo',
    description: `El gráfico reparte el coste total de tu puesto entre lo que te llevas y cada impuesto: cotizaciones de empresa, cotizaciones tuyas, IRPF, IVA, impuestos especiales y el IBI y el IVTM de tu casa y tu coche.

Debajo verás la otra cara de esas mismas figuras: cuánto recauda el conjunto de Administraciones Públicas con cada una, en euros, sobre los ingresos públicos y sobre el PIB, en qué se gasta y qué efecto tiene sobre ti.`,
    checklist: ['Reparto del coste laboral', 'Casa y coche', 'Recaudación por impuesto', 'Destino y efecto de cada figura'],
    helpTitle: '¿Cómo leer este resumen?',
    helpBody: 'Empieza por el gráfico: la porción verde es lo que te queda de cada 100 € que cuesta tu puesto. El resto son impuestos y cotizaciones ordenados por tamaño. Después contrasta tu cifra con lo que recauda el Estado por esa misma figura.',
    details: [
      'El reparto usa el coste laboral (bruto más cotizaciones de empresa) como total, no el salario bruto.',
      'El IBI y el IVTM se pagan por tener vivienda o coche, aunque ese año no ingreses nada por ellos.',
      'Las cifras de recaudación son de 2024 en contabilidad nacional y corresponden al conjunto de Administraciones Públicas, no a una persona.',
    ],
    important: 'El resumen no inventa datos nuevos: consolida lo que ya has calculado y lo compara con la recaudación oficial de cada figura.',
    Icon: WalletCards,
  },
  {
    id: 12,
    title: 'Fuentes del cálculo',
    subtitle: 'Origen y valor de cada parámetro',
    description: 'Consulta en una sola pantalla las fuentes oficiales utilizadas, el enlace al documento original y el valor concreto aplicado a tu cálculo.',
    checklist: ['Nombre del parámetro', 'Organismo oficial', 'Valor utilizado', 'Enlace verificable'],
    helpTitle: 'Cómo comprobar el resultado',
    helpBody: 'Cada bloque conecta el valor aplicado con su norma o dataset institucional.',
    details: [],
    important: 'Los valores cambian cuando modificas tus datos; las fuentes permanecen visibles para que el cálculo sea auditable.',
    Icon: BookOpenCheck,
  },
]

/** Paso de fuentes: pantalla aparte; no entra en contador ni en segmentos del recorrido. */
export const FISCAL_SOURCES_STEP_ID = 12
/** Antiguo paso «Comprueba lo aprendido»; las preguntas viven ahora al final de cada paso. */
export const LEGACY_KNOWLEDGE_CHECK_STEP_ID = 11

export function normalizeWorkerStepId(stepId: number) {
  return stepId === LEGACY_KNOWLEDGE_CHECK_STEP_ID ? 10 : stepId
}
const FISCAL_COUNTED_STEP_TOTAL = WORKER_FISCAL_STEPS.filter(
  (step) => step.id > 0 && step.id !== FISCAL_SOURCES_STEP_ID,
).length
const FISCAL_MAX_STEP_ID = WORKER_FISCAL_STEPS[WORKER_FISCAL_STEPS.length - 1]!.id
const FISCAL_SEGMENT_STEPS = WORKER_FISCAL_STEPS.filter((step) => step.id !== FISCAL_SOURCES_STEP_ID)

function getNextFiscalStep(currentStepId: number) {
  const currentIndex = WORKER_FISCAL_STEPS.findIndex((step) => step.id === currentStepId)
  for (let index = currentIndex + 1; index < WORKER_FISCAL_STEPS.length; index += 1) {
    const step = WORKER_FISCAL_STEPS[index]!
    if (step.id !== FISCAL_SOURCES_STEP_ID) return step
  }
  return undefined
}

function getFiscalDisplayedStepIndex(stepId: number) {
  if (stepId <= 0) return 0
  if (stepId >= FISCAL_SOURCES_STEP_ID) return FISCAL_COUNTED_STEP_TOTAL
  return stepId
}

/** Dibujos de la v2 que acompañan a algunos conceptos (decorativos: el texto ya lo dice). */
const ESCENARIO_CONCEPT_VISUALS: Record<string, ReactNode> = {
  'reduction-vs-deduction': (
    <div className="esc-coins">
      {/* texto nuevo D (aprobado): rótulos de las monedas */}
      <span className="esc-coin esc-coin--big"><strong>1 €</strong><small>deducción</small></span>
      <span className="esc-coin esc-coin--small"><strong>0,30 €</strong><small>reducción</small></span>
    </div>
  ),
  refundable: (
    <p className="esc-refund">
      <span>0 €</span><span className="esc-refund__op">−</span><span className="d-red">1.200 €</span><span className="esc-refund__op">=</span><strong className="d-acc">1.200 €</strong>
    </p>
  ),
}

/**
 * Extras de la v2 por paso. Las frases marcadas y las palabras de la cinta salen
 * literalmente del texto del paso; aquí solo se elige qué resaltar.
 */
const ESCENARIO_STEP_EXTRAS: Record<number, {
  marks?: { phrase: string; tone: 'worker' | 'company' | 'positive' }[]
  ribbon?: string[]
  liveParagraphInCard?: boolean
}> = {
  1: { marks: [{ phrase: 'salario fijo, pagas extra, complementos y retribuciones en especie', tone: 'positive' }] },
  2: { marks: [{ phrase: 'la base mínima', tone: 'worker' }, { phrase: 'la base máxima', tone: 'company' }] },
  4: { marks: [{ phrase: 'Si no tienes ninguno, responde «No» y continúa.', tone: 'positive' }] },
  5: { marks: [{ phrase: 'base liquidable', tone: 'positive' }] },
  6: { marks: [{ phrase: 'una escala estatal', tone: 'worker' }, { phrase: 'otra autonómica', tone: 'company' }] },
  7: { marks: [{ phrase: 'reduce el impuesto', tone: 'positive' }] },
  8: { marks: [{ phrase: 'Va incluido en el precio', tone: 'positive' }] },
  3: {
    marks: [
      { phrase: 'cotización del trabajador', tone: 'worker' },
      { phrase: 'la paga la empresa', tone: 'company' },
    ],
    ribbon: ['jubilación', 'bajas por enfermedad', 'desempleo', 'formación profesional', 'accidentes laborales', 'refuerzo del sistema de pensiones'],
    liveParagraphInCard: true,
  },
}

export function WorkerFiscalStepsCard({
  activeStepId,
  onStepChange,
  payrollLiveData,
  onBeforeNext,
}: WorkerFiscalStepsCardProps) {
  const [internalActiveStepId, setInternalActiveStepId] = useState(0)
  const variant = useFiscalVariant()
  const sectionRef = useRef<HTMLElement>(null)
  const skipInitialScrollRef = useRef(true)
  const currentStepId = activeStepId ?? internalActiveStepId
  const activeIndex = WORKER_FISCAL_STEPS.findIndex((step) => step.id === currentStepId)
  const activeStep = WORKER_FISCAL_STEPS[activeIndex] ?? WORKER_FISCAL_STEPS[0]
  const activeDescription = getStepDescription(activeStep, payrollLiveData)
  const descriptionParagraphs = activeDescription.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
  const stepConcepts = activeStep.concepts ?? []
  const displayedStepIndex = getFiscalDisplayedStepIndex(activeStep.id)
  const progress = useMemo(
    () => (displayedStepIndex / FISCAL_COUNTED_STEP_TOTAL) * 100,
    [displayedStepIndex],
  )
  const onSourcesStep = activeStep.id === FISCAL_SOURCES_STEP_ID
  const nextStep = getNextFiscalStep(activeStep.id)
    ?? (onSourcesStep ? undefined : WORKER_FISCAL_STEPS.find((step) => step.id === FISCAL_SOURCES_STEP_ID))
  const previousStep = activeIndex > 0 ? WORKER_FISCAL_STEPS[activeIndex - 1] : undefined
  const ActiveIcon = activeStep.Icon
  const isSummaryStep = activeStep.id === 0
  const isCompactStep = activeStep.id >= 10
  const statusLabel = activeStep.id === 0
    ? 'Resumen rápido'
    : activeStep.id === FISCAL_SOURCES_STEP_ID
      ? activeStep.title
      : `Paso ${activeStep.id} de ${FISCAL_COUNTED_STEP_TOTAL} · ${activeStep.title}`

  const setActiveStep = (nextStepId: number) => {
    const clampedStepId = Math.min(FISCAL_MAX_STEP_ID, Math.max(0, nextStepId))
    setInternalActiveStepId(clampedStepId)
    onStepChange?.(clampedStepId)
  }

  const goToPrevious = () => {
    if (previousStep) setActiveStep(previousStep.id)
  }

  const goToNext = () => {
    if (!nextStep) return
    if (onBeforeNext && onBeforeNext() === false) return
    setActiveStep(nextStep.id)
  }

  useEffect(() => {
    if (skipInitialScrollRef.current) {
      skipInitialScrollRef.current = false
      return
    }

    sectionRef.current?.scrollIntoView({ block: 'start' })
  }, [currentStepId])

  if (variant === 'escenario') {
    const escenario = ESCENARIO_STEP_EXTRAS[activeStep.id]
    // En la v2 cada salto de línea del texto es un párrafo. El texto no cambia.
    const lines = activeDescription.split(/\n+/).map((line) => line.trim()).filter(Boolean)
    const shownLines = escenario?.liveParagraphInCard && payrollLiveData ? lines.slice(0, -1) : lines
    const [leadLine, ...restLines] = shownLines
    const pairLines = restLines.length >= 2 ? restLines.slice(0, 2) : []
    const tailLines = restLines.slice(pairLines.length)
    const renderLine = (line: string) => (escenario?.marks ? <EscSweepText text={line} marks={escenario.marks} /> : line)

    return (
      <section
        ref={sectionRef}
        className="wfsc esc-step"
        aria-labelledby={isCompactStep || isSummaryStep ? undefined : 'wfsc-title'}
        aria-label={isCompactStep || isSummaryStep ? statusLabel : undefined}
      >
        <div className="esc-step__bar">
          <p className="esc-step__status">{statusLabel}</p>
          <nav className="esc-step__segments" aria-label="Cambiar paso">
            {FISCAL_SEGMENT_STEPS.map((step) => {
              const isActive = step.id === activeStep.id
              const isDone = onSourcesStep ? step.id > 0 : step.id < activeStep.id
              return (
                <button
                  key={step.id}
                  type="button"
                  className={isActive ? 'is-active' : isDone ? 'is-done' : undefined}
                  onClick={() => setActiveStep(step.id)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={step.id === 0 ? 'Ir al resumen rápido' : `Ir al paso ${step.id}: ${step.title}`}
                >
                  <span />
                </button>
              )
            })}
          </nav>
          <span className="esc-step__count" aria-hidden="true">
            {String(displayedStepIndex).padStart(2, '0')}<span>/{FISCAL_COUNTED_STEP_TOTAL}</span>
          </span>
        </div>

        {!isCompactStep && !isSummaryStep ? (
          <>
            <div className="esc-step__hero" key={activeStep.id}>
              <EscTitle id="wfsc-title" text={activeStep.title} />
              <p className="esc-step__subtitle">{activeStep.subtitle}</p>
              {leadLine ? <p className="esc-step__lead">{renderLine(leadLine)}</p> : null}
            </div>
            {pairLines.length > 0 ? (
              <div className="esc-step__pair">
                {pairLines.map((line) => <p key={line}>{renderLine(line)}</p>)}
              </div>
            ) : null}
            {tailLines.map((line) => <p key={line} className="esc-step__text">{renderLine(line)}</p>)}
            {activeStep.definitions && activeStep.definitions.length > 0 ? (
              <dl className="wfsc-defs esc-step__defs">
                {activeStep.definitions.map((item) => (
                  <div key={item.term} className="wfsc-defs__item">
                    <dt>{item.term}</dt>
                    <dd>{item.meaning}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {escenario?.ribbon ? <EscRibbon words={escenario.ribbon} /> : null}
            {stepConcepts.map((concept) => {
              const visual = ESCENARIO_CONCEPT_VISUALS[concept.id]
              return (
                <section
                  key={concept.id}
                  className={`wfsc-concept esc-step__concept${visual ? ' esc-step__concept--visual' : ''}`}
                  aria-labelledby={`wfsc-concept-${concept.id}`}
                >
                  {visual ? <div className="esc-step__concept-visual" aria-hidden="true">{visual}</div> : null}
                  <div className="esc-step__concept-body">
                    <h3 id={`wfsc-concept-${concept.id}`}>{concept.title}</h3>
                    {concept.body}
                  </div>
                </section>
              )
            })}
          </>
        ) : null}

        <nav
          className={`esc-step__nav${nextStep ? '' : ' esc-step__nav--terminal'}`}
          aria-label="Navegación del recorrido fiscal"
        >
          <button
            type="button"
            className="esc-step__back"
            onClick={goToPrevious}
            disabled={activeStep.id === 0}
            aria-label="Ir al paso anterior"
          >
            <ChevronLeft size={20} aria-hidden="true" />
            <span>{previousStep ? previousStep.title : 'Anterior'}</span>
          </button>
          <button
            type="button"
            className={`esc-step__sources${onSourcesStep ? ' is-current' : ''}`}
            onClick={() => setActiveStep(FISCAL_SOURCES_STEP_ID)}
            aria-current={onSourcesStep ? 'page' : undefined}
            disabled={onSourcesStep}
          >
            Fuentes del cálculo
          </button>
          {nextStep ? (
            <button
              type="button"
              className="esc-step__next"
              onClick={goToNext}
              aria-label={`Ir al siguiente paso: ${nextStep.title}`}
            >
              <span>{nextStep.title}</span>
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          ) : (
            <span className="esc-step__nav-spacer" aria-hidden="true" />
          )}
        </nav>
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      className="wfsc"
      aria-labelledby={isCompactStep ? undefined : 'wfsc-title'}
      aria-label={isCompactStep ? 'Navegación del recorrido fiscal' : undefined}
    >
      {!isCompactStep ? (
        <div className={`wfsc-stage wfsc-stage--step-${activeStep.id}${isSummaryStep ? ' wfsc-stage--summary' : ''}`}>
          <div className="wfsc-hero wfsc-hero--single">
            <div className="wfsc-hero-main">
              <span className="wfsc-step-orb" aria-hidden="true">
                <ActiveIcon size={34} strokeWidth={2.35} />
                <b>{activeStep.id === 0 ? 'R' : activeStep.id}</b>
              </span>
              <div className="wfsc-copy">
                <p>
                  {activeStep.id === 0
                    ? 'Antes de empezar'
                    : activeStep.id === FISCAL_SOURCES_STEP_ID
                      ? activeStep.title
                      : `Paso ${activeStep.id} de ${FISCAL_COUNTED_STEP_TOTAL}`}
                </p>
                <h2 id="wfsc-title" key={activeStep.id}>{activeStep.title}</h2>
                <p className="wfsc-copy__subtitle">{activeStep.subtitle}</p>
                <div className="wfsc-description">
                  {descriptionParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {activeStep.definitions && activeStep.definitions.length > 0 ? (
                    <dl className="wfsc-defs">
                      {activeStep.definitions.map((item) => (
                        <div key={item.term} className="wfsc-defs__item">
                          <dt>{item.term}</dt>
                          <dd>{item.meaning}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              </div>
            </div>
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

      <div className="wfsc-chrome" role="navigation" aria-label="Navegación del recorrido fiscal">
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
            {FISCAL_SEGMENT_STEPS.map((step) => {
              const isActive = step.id === activeStep.id
              const isDone = onSourcesStep ? step.id > 0 : step.id < activeStep.id
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
          <button
            type="button"
            className={`wfsc-sources-link${onSourcesStep ? ' is-current' : ''}`}
            onClick={() => setActiveStep(FISCAL_SOURCES_STEP_ID)}
            aria-current={onSourcesStep ? 'page' : undefined}
            disabled={onSourcesStep}
          >
            Fuentes del cálculo
          </button>
        </div>

        {nextStep ? (
          <button
            className="wfsc-nav wfsc-nav--next"
            type="button"
            onClick={goToNext}
            aria-label={`Ir al siguiente paso: ${nextStep.title}`}
          >
            <span className="wfsc-nav__next-text">
              <strong>{activeStep.id === 0 ? 'Empezar' : 'Continuar'}</strong>
              <em>{nextStep.title}</em>
            </span>
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        ) : null}

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
