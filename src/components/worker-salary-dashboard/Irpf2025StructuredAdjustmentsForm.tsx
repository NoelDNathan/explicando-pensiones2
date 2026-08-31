import { Baby, BriefcaseBusiness, ChevronDown, HeartHandshake, Landmark, ReceiptText, ShieldCheck, UsersRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  calculateAdditionalWorkExpenses2025,
  calculateBaseReductions2025,
  calculateGeographicMobilityIncrement2025,
  calculateInKindBenefits2025,
  createEmptyIrpf2025Adjustments,
  GEOGRAPHIC_MOBILITY_INCREMENT_2025,
} from '../fiscal-worker-dashboard/irpf2025Adjustments'
import type { Irpf2025AdjustmentInput } from '../fiscal-worker-dashboard/irpf2025Adjustments'
import {
  WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR,
  workBenefitsCouldApply,
} from '../fiscal-worker-dashboard/irpf2025Calc'
import { InfoButton } from '../ui/InfoButton'
import './Irpf2025StructuredAdjustmentsForm.css'

type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

type Props = {
  focus: 'reductions' | 'deductions-benefits'
  // Los gastos del art. 19 y las reducciones de base se preguntan por separado:
  // no restan en el mismo momento del calculo.
  reductionsGroup?: 'all' | 'work-expenses' | 'base-reductions'
  value: Irpf2025AdjustmentInput
  declaredInKindSalary?: number
  declaredGrossWorkIncome?: number
  netWorkIncome?: number
  previewBaseAvailable?: number
  onChange: (value: Irpf2025AdjustmentInput) => void
}
const OTHER_INCOME_THRESHOLD = WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR
const SPOUSE_INCOME_THRESHOLD = 8_000
const SPOUSE_PENSION_MAX_REDUCTION = 1_000
const PERSONAL_PENSION_ABSOLUTE_LIMIT = 1_500

function QuestionEffect({ amount }: { amount?: number }) {
  if (!amount) return null
  const formatted = Math.abs(amount).toLocaleString('es-ES', { maximumFractionDigits: 2 })
  return (
    <em className="irpf-question-effect irpf-question-effect--reduction" aria-label={`Reduce la base en ${formatted} EUR`}>
      −{formatted} EUR
    </em>
  )
}

function sliceBaseReduction(
  value: Irpf2025AdjustmentInput,
  keys: Array<keyof Irpf2025AdjustmentInput>,
  previewBaseAvailable: number,
  grossWorkIncome = 0,
) {
  const empty = createEmptyIrpf2025Adjustments()
  const slice = { ...empty } as Irpf2025AdjustmentInput
  for (const key of keys) {
    ;(slice as Record<string, unknown>)[key] = value[key]
  }
  const available = Math.max(0, previewBaseAvailable)
  return calculateBaseReductions2025(slice, available, available, 0, 0, grossWorkIncome)
}

type NumberFieldProps = {
  label: string
  value: number
  onChange: (value: number) => void
  help?: string
  hint?: string
  max?: number
  min?: number
  step?: number
  unit?: string
}

const FIELD_HELP: Record<string, string> = {
  'Conozco todas mis otras rentas no exentas': 'Algunas reducciones solo se pueden aplicar si conoces si tienes otras rentas no exentas. Si no esta confirmado, la calculadora evita aplicar beneficios sujetos a umbral.',
  'Otras rentas no exentas distintas del trabajo': 'Ingresos que no vienen de tu salario y que no estan exentos: alquileres, actividades, ganancias, intereses u otros rendimientos. Sirven para comprobar limites.',
  'Cuotas sindicales pagadas': 'Importes pagados a sindicatos. En IRPF pueden reducir el rendimiento neto del trabajo si son cuotas reales y justificables.',
  'Cuotas de colegio profesional': 'Cuotas a un colegio profesional cuando colegiarse es obligatorio para ejercer. La calculadora aplica el limite maximo permitido.',
  'La colegiacion es obligatoria para ejercer': 'Marca si tu profesion exige estar colegiado para trabajar. Si no es obligatorio, la cuota no se trata igual.',
  'Defensa juridica laboral': 'Gastos de abogado o defensa por conflictos laborales con el empleador. Tienen un limite especifico anual.',
  'Estaba inscrito como demandante de empleo': 'Dato necesario para aplicar el incremento por movilidad geografica cuando aceptas trabajo en otro municipio.',
  'Acepte un empleo en otro municipio': 'Se refiere a aceptar un puesto que exige desplazarse a otro municipio, dentro de la regla de movilidad geografica.',
  'Traslade mi residencia': 'La movilidad geografica exige traslado efectivo de residencia. Sin este requisito, el incremento no se aplica.',
  'Ejercicio del traslado': 'Indica el ano fiscal en que se produjo el traslado. Para 2025 solo importan los ejercicios cubiertos por la regla temporal.',
  'Rendimiento integro del nuevo empleo': 'Salario bruto asociado al empleo que origina la movilidad geografica.',
  'Gastos especificos del nuevo empleo': 'Gastos vinculados al nuevo empleo que sirven para limitar o calcular el incremento aplicable.',
  'Plan personal': 'Aportaciones tuyas a planes de pensiones individuales u otros sistemas de prevision social con reduccion en base.',
  'Mutualidad admisible': 'Aportaciones a mutualidades que fiscalmente pueden actuar como prevision social, si cumplen requisitos.',
  'Contribucion empresarial imputada': 'Aportacion que hace la empresa a un plan de empleo y que se atribuye fiscalmente al trabajador.',
  'Aportacion propia al mismo plan de empleo': 'Aportacion adicional que haces tu al plan de empleo de la empresa. Puede tener limite conjunto con la contribucion empresarial.',
  'Rendimiento integro del empleador del plan': 'Dato usado para decidir el coeficiente o limite aplicable a aportaciones vinculadas al plan de empleo.',
  'Aportacion al sistema del conyuge': 'Aportacion a prevision social del conyuge. Solo reduce si sus rendimientos estan por debajo del umbral legal.',
  'Rendimientos netos del conyuge': 'Importe que decide si la aportacion al sistema de prevision del conyuge tiene derecho a reduccion.',
  'El sistema del conyuge cumple los requisitos': 'Confirma que el producto y la situacion del conyuge encajan en la regla fiscal. Sin confirmacion, no se aplica.',
  'Pension compensatoria pagada': 'Importe pagado al exconyuge por resolucion judicial o convenio formalizado. Reduce la base si cumple los requisitos.',
  'Existe resolucion o convenio formalizado': 'La pension compensatoria necesita respaldo formal para reducir la base.',
  'Modalidad de declaracion': 'Individual o conjunta. La tributacion conjunta puede generar reduccion, pero depende de la unidad familiar.',
  'Aportacion a patrimonio protegido': 'Aportaciones a un patrimonio protegido de persona con discapacidad. Tienen limites y requisitos especificos.',
  'Total aportado por todos al mismo patrimonio': 'Suma de aportaciones de todos los aportantes al mismo patrimonio protegido. Sirve para aplicar limites globales.',
  'La tarjeta comida cumple los requisitos': 'Vales o tarjeta restaurante con condiciones fiscales. Si cumple, una parte puede estar exenta.',
  'Importe diario de tarjeta comida': 'Importe por dia de uso de la tarjeta comida. La exencion se limita por dia admisible.',
  'Dias admisibles de tarjeta comida': 'Dias reales que cumplen requisitos. No todos los dias del ano tienen por que computar.',
  'La tarjeta transporte cumple los requisitos': 'Ayuda al transporte colectivo del trabajador. Si cumple requisitos, puede estar exenta con limite mensual/anual.',
  'Importe mensual de transporte': 'Importe mensual de transporte pagado por la empresa o mediante tarjeta.',
  'Meses admisibles de transporte': 'Meses en los que el beneficio de transporte cumple requisitos.',
  'El seguro medico cubre personas admisibles': 'Seguro medico para trabajador, conyuge o descendientes. La exencion depende de las personas cubiertas y limites por persona.',
  'Personas aseguradas sin discapacidad': 'Numero de personas cubiertas por el seguro medico sin discapacidad reconocida.',
  'Primas de personas sin discapacidad': 'Prima anual asociada a esas personas. La exencion tiene limite por persona.',
  'Personas aseguradas con discapacidad': 'Numero de personas cubiertas con discapacidad reconocida, con limite de exencion superior.',
  'Primas de personas con discapacidad': 'Prima anual asociada a personas con discapacidad.',
  'La guarderia de empresa cumple el articulo 42.3.b': 'Guarderia o educacion infantil pagada por la empresa bajo requisitos de retribucion en especie exenta.',
  'Guarderia pagada por la empresa': 'Importe anual del beneficio de guarderia de empresa.',
  'Ingreso a cuenta no repercutido': 'Pago fiscal que asume la empresa y no te cobra. Puede aumentar la valoracion de la retribucion en especie.',
  'Donativo 2025': 'Importe donado durante el ejercicio. La deduccion depende de entidad, recurrencia y limites.',
  'Donado a la misma entidad en 2024': 'Sirve para comprobar fidelidad de donativos a la misma entidad.',
  'Donado a la misma entidad en 2023': 'Sirve junto con 2024 para aplicar, si procede, el tramo incrementado por recurrencia.',
  'Entidad incluida en la Ley 49/2002': 'Confirma que la entidad receptora permite aplicar la deduccion fiscal de donativos.',
  'Alquiler pagado en 2025': 'Importe anual de alquiler de vivienda habitual, solo relevante si se conserva regimen transitorio.',
  'Contrato anterior a 2015': 'La deduccion estatal por alquiler es transitoria. El contrato debe venir de antes de 2015.',
  'Se pagaron cantidades antes de 2015': 'Requisito historico para mantener el derecho transitorio por alquiler.',
  'Hubo derecho a deduccion antes de 2015': 'Confirma que ya existia derecho fiscal antes de la supresion general de la deduccion.',
  'Es la vivienda habitual': 'La deduccion de alquiler o vivienda exige que sea tu vivienda habitual, no segunda residencia.',
  'Inversion admisible en vivienda': 'Pagos por adquisicion o financiacion de vivienda habitual bajo regimen transitorio anterior a 2013.',
  'Acredita regimen transitorio anterior a 2013': 'Confirma que conservas derecho a deduccion por vivienda habitual anterior a 2013.',
  'Porcentaje de titularidad': 'Parte de la vivienda que te corresponde fiscalmente. Limita la base atribuible.',
  'Porcentaje autonomico de vivienda': 'Tramo autonomico de la deduccion por vivienda habitual cuando aplica el regimen transitorio.',
  'Requisitos del 9 % catalan verificados': 'Algunas situaciones en Cataluna usan un porcentaje autonomico especial. Marcado solo si esta comprobado.',
  'Inversion en empresa nueva': 'Inversion en empresas de nueva o reciente creacion con derecho potencial a deduccion.',
  'Certificacion y requisitos societarios verificados': 'Confirma que la empresa y la inversion cumplen los requisitos fiscales.',
  'Cumple los requisitos de maternidad': 'Deduccion reembolsable vinculada a hijos menores de 3 anos y situacion laboral o prestacion habilitante.',
  'Hijos que generan deduccion por maternidad': 'Numero de hijos que pueden generar derecho a la deduccion.',
  'Suma de meses-hijo con derecho': 'Cuenta meses por hijo. Dos hijos durante doce meses equivalen a veinticuatro meses-hijo.',
  'Hijos con incremento unico de 150 EUR': 'Casos que generan el incremento unico previsto en la regla.',
  'Abono anticipado de maternidad cobrado': 'Importe que ya te han pagado por adelantado y se resta del resultado de la declaracion.',
  'Cumple los requisitos del incremento de guarderia': 'Incremento asociado a gastos de guarderia o centros autorizados, sujeto a requisitos y limites.',
  'Hijos que generan incremento de guarderia': 'Numero de hijos por los que se calcula el incremento de guarderia.',
  'Suma de meses completos por hijo': 'Meses completos de guarderia por cada hijo con derecho.',
  'Gasto anual de guarderia': 'Importe pagado por guarderia antes de restar subvenciones o importes exentos.',
  'Subvenciones de guarderia': 'Ayudas recibidas que reducen el gasto computable para el incremento.',
  'Guarderia exenta pagada por la empresa': 'Importe de guarderia tratado como retribucion en especie exenta; no debe duplicarse como gasto deducible.',
  'Titulo de familia numerosa vigente': 'La deduccion exige titulo oficial vigente durante los meses declarados.',
  'Categoria de familia numerosa': 'General o especial. La categoria cambia el importe mensual base de la deduccion.',
  'Meses con derecho a familia numerosa': 'Meses del ejercicio en los que el titulo y requisitos estaban vigentes.',
  'Hijos que exceden el minimo de categoria': 'Hijos por encima del minimo necesario para la categoria, que pueden aumentar la deduccion.',
  'Parte del derecho que corresponde': 'Porcentaje que te corresponde cuando el derecho se reparte entre contribuyentes.',
  'Abono anticipado de familia numerosa': 'Importe ya cobrado por adelantado, que se descuenta al calcular el resultado.',
  'Suma de meses-persona con discapacidad a cargo': 'Cuenta meses por persona con discapacidad a cargo. Dos personas durante doce meses equivalen a veinticuatro.',
  'Parte del derecho por discapacidad': 'Porcentaje que te corresponde si varios contribuyentes comparten el derecho.',
  'Abonos anticipados por discapacidad': 'Importes ya cobrados por adelantado por esta deduccion.',
  'Cotizaciones que limitan estas deducciones': 'Algunas deducciones reembolsables quedan limitadas por cotizaciones cuando el derecho nace por alta laboral.',
  'El derecho nace por prestacion habilitante sin limite de cotizaciones': 'Marca si el derecho procede de una prestacion que elimina el limite de cotizaciones.',
  'Retenciones de IRPF practicadas': 'IRPF que ya te ha retenido la empresa en nomina durante el ano.',
  'Otros ingresos o pagos a cuenta': 'Otros pagos ya realizados a Hacienda, distintos de las retenciones de nomina.',
}

function HelpLabel({ label, help }: { label: string; help?: string }) {
  const helpText = help ?? FIELD_HELP[label]
  return (
    <span className="irpf-rule-label">
      <span>{label}</span>
      {helpText ? (
        <InfoButton label={`Que significa: ${label}`} size="sm" placement="end" className="wprc-help">
          <p>{helpText}</p>
        </InfoButton>
      ) : null}
    </span>
  )
}

function NumberField({ label, value, onChange, help, hint, max, min = 0, step = 0.01, unit = 'EUR' }: NumberFieldProps) {
  return (
    <label className="irpf-rule-field">
      <HelpLabel label={label} help={help} />
      <span className="irpf-rule-field__control">
        <input
          aria-label={label}
          inputMode="decimal"
          max={max}
          min={min}
          step={step}
          type="number"
          value={value}
          onChange={(event) => onChange(Math.max(min, Number(event.target.value) || 0))}
        />
        <span>{unit}</span>
      </span>
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

function CountField({ label, value, onChange, max = 12, help, hint, unit }: NumberFieldProps) {
  return (
    <label className="irpf-rule-field">
      <HelpLabel label={label} help={help} />
      <span className="irpf-rule-field__control irpf-rule-field__control--count">
        <input
          aria-label={label}
          inputMode="numeric"
          max={max}
          min="0"
          step="1"
          type="number"
          value={value}
          onChange={(event) => onChange(Math.min(max, Math.max(0, Math.trunc(Number(event.target.value) || 0))))}
        />
        <span>{unit ?? (max === 12 ? 'meses' : 'uds.')}</span>
      </span>
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

function CheckField({ label, checked, onChange, help, hint }: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  help?: string
  hint?: string
}) {
  return (
    <label className="irpf-rule-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <strong><HelpLabel label={label} help={help} /></strong>
        {hint ? <small>{hint}</small> : null}
      </span>
    </label>
  )
}

function SelectField({ label, value, onChange, children, help, hint }: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
  help?: string
  hint?: string
}) {
  return (
    <label className="irpf-rule-field">
      <HelpLabel label={label} help={help} />
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

function RuleGroup({ title, description, icon: Icon, children, open = false }: {
  title: string
  description: string
  icon: typeof ReceiptText
  children: ReactNode
  open?: boolean
}) {
  return (
    <details className="irpf-rule-group" open={open}>
      <summary>
        <span aria-hidden="true"><Icon /></span>
        <span>
          <strong>{title}</strong>
          <small>{description}</small>
        </span>
      </summary>
      <div className="irpf-rule-group__body">{children}</div>
    </details>
  )
}

function ReductionQuestion({ question, description, guide, children, initiallyRelevant = false, effectAmount, onYes, onNo }: {
  question: string
  description: string
  guide?: ReactNode
  children: ReactNode
  initiallyRelevant?: boolean
  effectAmount?: number
  onYes?: () => void
  onNo: () => void
}) {
  const [answer, setAnswer] = useState<'unanswered' | 'yes' | 'no'>(() => initiallyRelevant ? 'yes' : 'no')
  const chooseYes = () => {
    onYes?.()
    setAnswer('yes')
  }
  const chooseNo = () => {
    onNo()
    setAnswer('no')
  }

  return (
    <section className={`irpf-reduction-question is-${answer}`} aria-label={question}>
      <div className="irpf-reduction-question__prompt">
        <span aria-hidden="true">?</span>
        <div>
          <div className="irpf-reduction-question__title-row">
            <h3>{question}</h3>
            <QuestionEffect amount={effectAmount} />
          </div>
          <p>{description}</p>
          {guide ? <div className="irpf-reduction-question__guide">{guide}</div> : null}
        </div>
      </div>
      <div className="irpf-reduction-question__choices" role="group" aria-label={`Respuesta: ${question}`}>
        <button className={answer === 'yes' ? 'is-selected' : ''} type="button" aria-pressed={answer === 'yes'} onClick={chooseYes}>Sí</button>
        <button className={answer === 'no' ? 'is-selected' : ''} type="button" aria-pressed={answer === 'no'} onClick={chooseNo}>No</button>
      </div>
      {answer === 'yes' ? <div className="irpf-reduction-question__body">{children}</div> : null}
    </section>
  )
}

function JointTaxationGuide({
  maritalStatus,
  childrenCount,
  jointUnitChildrenCount,
}: {
  maritalStatus: MaritalStatus
  childrenCount: number
  jointUnitChildrenCount: number
}) {
  const [expanded, setExpanded] = useState(false)
  const married = maritalStatus === 'married'

  return (
    <aside className="irpf-marital-infobox" aria-label="Quién puede declarar conjunta y requisitos">
      <button
        type="button"
        className="irpf-marital-infobox__toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
      >
        ¿Quién y cuándo puedes declarar conjunta?
        <ChevronDown size={14} aria-hidden="true" className={expanded ? 'is-open' : undefined} />
      </button>
      <div className="irpf-marital-infobox__details" hidden={!expanded}>
        <p className="irpf-marital-note">
          {childrenCount === 0 ? (
            married
              ? 'Aún no has indicado hijos. La unidad familiar puede ser solo tú y tu cónyuge; no hace falta tener hijos para declarar conjunta.'
              : 'Aún no has indicado hijos. Si no convives con hijos que formen unidad, lo habitual es la declaración individual.'
          ) : jointUnitChildrenCount === childrenCount ? (
            `Más abajo puedes indicar ${childrenCount} hijo(s). Si conviven contigo y cumplen edad o discapacidad, esos mismos pueden formar parte de la unidad familiar al declarar conjunta.`
          ) : jointUnitChildrenCount > 0 ? (
            `Más abajo puedes indicar ${childrenCount} hijo(s). Según convivencia y edad, ${jointUnitChildrenCount} podrían entrar en la unidad familiar. Revisa el detalle de cada hijo si falta alguno.`
          ) : (
            `Más abajo puedes indicar ${childrenCount} hijo(s), pero según convivencia y edad ninguno entraría en la unidad familiar por ahora.`
          )}
          {' '}Para el mínimo por hijos pedimos más datos (ingresos, declaración propia…). Aquí solo importa quién puede ir en la misma declaración conjunta.
        </p>
        <dl>
          {married ? (
            <div>
              <dt>Con tu cónyuge</dt>
              <dd>
                Si no estáis separados legalmente. La unidad incluye, si los hay, hijos menores que viven con
                vosotros o hijos mayores incapacitados bajo patria potestad. Puedes tributar conjunta aunque solo
                uno tenga rentas. Reduce la base <strong>3.400 €</strong>.
              </dd>
            </div>
          ) : (
            <div>
              <dt>Como padre o madre sola/o</dt>
              <dd>
                Sin vínculo matrimonial o separado/a legalmente: con todos los hijos que conviven contigo y cumplen
                los requisitos de edad o discapacidad. Reduce la base <strong>2.150 €</strong> si no convives con el
                otro progenitor de esos hijos.
              </dd>
            </div>
          )}
          {!married ? (
            <div>
              <dt>Si convives con el otro progenitor</dt>
              <dd>
                Puedes presentar declaración conjunta como unidad monoparental, pero no se aplica la reducción de
                2.150 € en la base.
              </dd>
            </div>
          ) : null}
          <div>
            <dt>Requisitos comunes</dt>
            <dd>
              Todos los miembros deben tributar por IRPF. Todos deben usar el mismo régimen: si uno presenta
              individual, el resto también. La unidad familiar se determina a 31 de diciembre. Nadie puede estar en
              dos unidades a la vez.
            </dd>
          </div>
          <div>
            <dt>Ejemplos de hijos que forman unidad</dt>
            <dd>
              Los de la primera pregunta que conviven contigo: menores (no los que viven independientes con
              consentimiento de los padres) o mayores incapacitados judicialmente bajo patria potestad.
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}

function SpousePensionProductInfobox() {
  const [expanded, setExpanded] = useState(false)

  return (
    <aside className="irpf-marital-infobox" aria-label="Tipos de producto válidos">
      <button
        type="button"
        className="irpf-marital-infobox__toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
      >
        ¿Cuál es cuál?
        <ChevronDown size={14} aria-hidden="true" className={expanded ? 'is-open' : undefined} />
      </button>
      <div className="irpf-marital-infobox__details" hidden={!expanded}>
        <dl>
          <div>
            <dt>Plan de pensiones</dt>
            <dd>Cuenta de ahorro para la jubilación en un banco o gestora. Tu pareja debe constar en el contrato.</dd>
          </div>
          <div>
            <dt>Mutualidad profesional</dt>
            <dd>Ahorro para la jubilación del colegio de su profesión (médicos, abogados…).</dd>
          </div>
          <div>
            <dt>Seguro de jubilación</dt>
            <dd>Contrato con una aseguradora para ahorrar hasta jubilarse. Tu pareja como titular.</dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}

function clearSpousePensionFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    spousePensionContribution: 0,
    spouseNetWorkAndBusinessIncome: 0,
    spousePensionEligible: false,
    spousePensionProductType: 'none',
  }
}

function markSpousePensionContribution(
  value: Irpf2025AdjustmentInput,
  amount: number,
): Irpf2025AdjustmentInput {
  if (amount <= 0) {
    return clearSpousePensionFields({ ...value, spousePensionContribution: 0 })
  }
  return {
    ...value,
    spousePensionContribution: amount,
    spousePensionEligible: true,
    spousePensionProductType: 'pension_plan',
  }
}
function YesNoChips({
  label,
  value,
  onChange,
}: {
  label: string
  value: 'yes' | 'no' | ''
  onChange: (next: 'yes' | 'no') => void
}) {
  return (
    <div className="irpf-reduction-question__options" role="group" aria-label={label}>
      <button
        type="button"
        className={value === 'yes' ? 'is-selected' : ''}
        aria-pressed={value === 'yes'}
        onClick={() => onChange('yes')}
      >
        Sí
      </button>
      <button
        type="button"
        className={value === 'no' ? 'is-selected' : ''}
        aria-pressed={value === 'no'}
        onClick={() => onChange('no')}
      >
        No
      </button>
    </div>
  )
}

function clearOtherIncomeFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    otherIncomeKnown: false,
    otherNonExemptNonWorkIncome: 0,
  }
}

function confirmNoOtherIncome(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    otherIncomeKnown: true,
    otherNonExemptNonWorkIncome: 0,
  }
}

function OtherIncomeQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  const [knownAnswer, setKnownAnswer] = useState<'yes' | 'no' | ''>(() => {
    if (value.otherNonExemptNonWorkIncome > 0) return 'yes'
    return ''
  })

  return (
    <div className="irpf-marital-subflow">
      <div className="irpf-marital-subask">
        <p>¿Sabes cuánto suman al año?</p>
        <small>
          Algunas ventajas del trabajo solo aplican si otras rentas no exentas no superan{' '}
          {OTHER_INCOME_THRESHOLD.toLocaleString('es-ES')} €.
        </small>
        <YesNoChips
          label="Conocimiento del importe anual de otras rentas"
          value={knownAnswer}
          onChange={(next) => {
            setKnownAnswer(next)
            if (next === 'yes') {
              onChange({ ...value, otherIncomeKnown: true })
              return
            }
            onChange(clearOtherIncomeFields(value))
          }}
        />
      </div>

      {knownAnswer === 'no' ? (
        <p className="irpf-marital-note irpf-marital-note--muted">
          Sin ese dato no podemos aplicar la reducción por rendimientos del trabajo ni la deducción por rentas
          bajas hasta que lo confirmes.
        </p>
      ) : null}

      {knownAnswer === 'yes' ? (
        <>
          <NumberField
            label="¿Cuánto suman al año?"
            value={value.otherNonExemptNonWorkIncome}
            onChange={(amount) => onChange({
              ...value,
              otherIncomeKnown: true,
              otherNonExemptNonWorkIncome: amount,
            })}
            unit="EUR"
            hint={`Solo rentas no exentas fuera de la nómina. Si superan ${OTHER_INCOME_THRESHOLD.toLocaleString('es-ES')} €, no aplican esas ventajas.`}
          />
          {value.otherNonExemptNonWorkIncome > OTHER_INCOME_THRESHOLD ? (
            <p className="irpf-marital-note irpf-marital-note--muted">
              Con más de {OTHER_INCOME_THRESHOLD.toLocaleString('es-ES')} € en otras rentas, la reducción por
              rendimientos del trabajo y la deducción por rentas bajas no se aplican.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

const PROTECTED_ASSETS_MAX_PER_CONTRIBUTOR = 10_000
const PROTECTED_ASSETS_MAX_TOTAL = 24_250

function clearProtectedAssetsFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    protectedAssetsContribution: 0,
    protectedAssetsFormalEstate: false,
    protectedAssetsValidContributor: false,
    protectedAssetsContributorNotBeneficiary: false,
    protectedAssetsTotalContributors: 0,
  }
}

function ProtectedAssetsQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  const [formalEstateAnswer, setFormalEstateAnswer] = useState<'yes' | 'no' | ''>(() => {
    if (value.protectedAssetsFormalEstate) return 'yes'
    if (
      value.protectedAssetsValidContributor
      || value.protectedAssetsContributorNotBeneficiary
      || value.protectedAssetsContribution > 0
    ) return 'yes'
    return ''
  })
  const [validContributorAnswer, setValidContributorAnswer] = useState<'yes' | 'no' | ''>(() => {
    if (value.protectedAssetsValidContributor) return 'yes'
    if (value.protectedAssetsContributorNotBeneficiary || value.protectedAssetsContribution > 0) return 'yes'
    if (value.protectedAssetsFormalEstate) return ''
    return ''
  })
  const [notBeneficiaryAnswer, setNotBeneficiaryAnswer] = useState<'yes' | 'no' | ''>(() => {
    if (value.protectedAssetsContributorNotBeneficiary) return 'yes'
    if (value.protectedAssetsContribution > 0) return 'yes'
    if (value.protectedAssetsValidContributor) return ''
    return ''
  })
  const [otherContributorsAnswer, setOtherContributorsAnswer] = useState<'yes' | 'no' | ''>(() => {
    if (value.protectedAssetsTotalContributors > value.protectedAssetsContribution) return 'yes'
    if (value.protectedAssetsContribution > 0) return 'no'
    return ''
  })

  return (
    <div className="irpf-marital-subflow">
      <div className="irpf-marital-subask">
        <p>¿Existe un patrimonio protegido ya constituido?</p>
        <small>
          No basta con ayudar económicamente: tiene que ser una figura formal para cubrir las necesidades de una
          persona con discapacidad.
        </small>
        <YesNoChips
          label="Patrimonio protegido constituido formalmente"
          value={formalEstateAnswer}
          onChange={(next) => {
            setFormalEstateAnswer(next)
            setValidContributorAnswer('')
            setNotBeneficiaryAnswer('')
            setOtherContributorsAnswer('')
            if (next === 'yes') {
              onChange({ ...value, protectedAssetsFormalEstate: true })
              return
            }
            onChange(clearProtectedAssetsFields(value))
          }}
        />
      </div>

      {formalEstateAnswer === 'no' ? (
        <p className="irpf-marital-note irpf-marital-note--muted">
          Sin patrimonio protegido constituido, esta reducción no aplica aunque hayas ayudado económicamente.
        </p>
      ) : null}

      {formalEstateAnswer === 'yes' ? (
        <div className="irpf-marital-subask">
          <p>¿Eres familiar hasta tercer grado, cónyuge o tutor/acogedor de esa persona?</p>
          <small>Solo pueden aportar con derecho a reducción quienes tengan esa relación o legitimación.</small>
          <YesNoChips
            label="Parentesco o legitimación para aportar"
            value={validContributorAnswer}
            onChange={(next) => {
              setValidContributorAnswer(next)
              setNotBeneficiaryAnswer('')
              setOtherContributorsAnswer('')
              if (next === 'yes') {
                onChange({
                  ...value,
                  protectedAssetsFormalEstate: true,
                  protectedAssetsValidContributor: true,
                })
                return
              }
              onChange({
                ...clearProtectedAssetsFields(value),
                protectedAssetsFormalEstate: true,
              })
            }}
          />
        </div>
      ) : null}

      {formalEstateAnswer === 'yes' && validContributorAnswer === 'no' ? (
        <p className="irpf-marital-note irpf-marital-note--muted">
          Sin parentesco o legitimación válidos, la aportación no genera reducción en tu declaración.
        </p>
      ) : null}

      {formalEstateAnswer === 'yes' && validContributorAnswer === 'yes' ? (
        <div className="irpf-marital-subask">
          <p>¿La aportación la haces tú por esa persona (no eres tú quien tiene el patrimonio)?</p>
          <small>La propia persona con discapacidad titular no puede reducir la base por sus propias aportaciones.</small>
          <YesNoChips
            label="Aportante distinto del titular del patrimonio"
            value={notBeneficiaryAnswer}
            onChange={(next) => {
              setNotBeneficiaryAnswer(next)
              setOtherContributorsAnswer('')
              if (next === 'yes') {
                onChange({
                  ...value,
                  protectedAssetsFormalEstate: true,
                  protectedAssetsValidContributor: true,
                  protectedAssetsContributorNotBeneficiary: true,
                })
                return
              }
              onChange({
                ...clearProtectedAssetsFields(value),
                protectedAssetsFormalEstate: true,
                protectedAssetsValidContributor: true,
              })
            }}
          />
        </div>
      ) : null}

      {formalEstateAnswer === 'yes' && validContributorAnswer === 'yes' && notBeneficiaryAnswer === 'no' ? (
        <p className="irpf-marital-note irpf-marital-note--muted">
          Si eres tú el titular del patrimonio protegido, tus propias aportaciones no generan esta reducción.
        </p>
      ) : null}

      {formalEstateAnswer === 'yes' && validContributorAnswer === 'yes' && notBeneficiaryAnswer === 'yes' ? (
        <>
          <p className="irpf-marital-note">
            Si cumples los requisitos, tu aportación puede reducir la base hasta{' '}
            <strong>{PROTECTED_ASSETS_MAX_PER_CONTRIBUTOR.toLocaleString('es-ES')} € al año</strong>. Si varias
            personas aportan al mismo patrimonio, el conjunto no puede superar{' '}
            <strong>{PROTECTED_ASSETS_MAX_TOTAL.toLocaleString('es-ES')} €</strong>.
          </p>
          <NumberField
            label="¿Cuánto has aportado tú este año?"
            value={value.protectedAssetsContribution}
            onChange={(amount) => {
              const total = otherContributorsAnswer === 'no'
                ? amount
                : Math.max(amount, value.protectedAssetsTotalContributors)
              onChange({
                ...value,
                protectedAssetsFormalEstate: true,
                protectedAssetsValidContributor: true,
                protectedAssetsContributorNotBeneficiary: true,
                protectedAssetsContribution: amount,
                protectedAssetsTotalContributors: total,
              })
            }}
            hint={`Máximo por aportante: ${PROTECTED_ASSETS_MAX_PER_CONTRIBUTOR.toLocaleString('es-ES')} €`}
          />

          {value.protectedAssetsContribution > 0 ? (
            <div className="irpf-marital-subask">
              <p>¿Otras personas también aportaron al mismo patrimonio este año?</p>
              <small>Sirve para repartir el límite global si varios familiares aportan.</small>
              <YesNoChips
                label="Otras aportaciones al mismo patrimonio"
                value={otherContributorsAnswer}
                onChange={(next) => {
                  setOtherContributorsAnswer(next)
                  if (next === 'no') {
                    onChange({
                      ...value,
                      protectedAssetsTotalContributors: value.protectedAssetsContribution,
                    })
                    return
                  }
                  onChange({
                    ...value,
                    protectedAssetsTotalContributors: Math.max(
                      value.protectedAssetsContribution,
                      value.protectedAssetsTotalContributors,
                    ),
                  })
                }}
              />
            </div>
          ) : null}

          {value.protectedAssetsContribution > 0 && otherContributorsAnswer === 'yes' ? (
            <NumberField
              label="¿Cuánto suman todas las aportaciones?"
              value={value.protectedAssetsTotalContributors}
              onChange={(amount) => onChange({
                ...value,
                protectedAssetsTotalContributors: Math.max(amount, value.protectedAssetsContribution),
              })}
              hint={`Incluye la tuya. Si supera ${PROTECTED_ASSETS_MAX_TOTAL.toLocaleString('es-ES')} €, la reducción se reparte proporcionalmente.`}
            />
          ) : null}

          {value.protectedAssetsContribution > PROTECTED_ASSETS_MAX_PER_CONTRIBUTOR ? (
            <p className="irpf-marital-note irpf-marital-note--muted">
              Por encima de {PROTECTED_ASSETS_MAX_PER_CONTRIBUTOR.toLocaleString('es-ES')} €, solo reducirá la base
              hasta ese tope.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function clearGeographicMobilityFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    wasRegisteredJobseeker: false,
    acceptedJobOtherMunicipality: false,
    movedResidence: false,
    moveTaxYear: 0,
    newJobIntegralIncome: 0,
    newJobSpecificExpenses: 0,
  }
}

function GeographicMobilityQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  const [registeredAnswer, setRegisteredAnswer] = useState<'yes' | 'no' | ''>(() => {
    if (value.wasRegisteredJobseeker) return 'yes'
    if (
      value.acceptedJobOtherMunicipality
      || value.movedResidence
      || value.moveTaxYear > 0
      || value.newJobSpecificExpenses > 0
    ) return 'yes'
    return ''
  })
  const [acceptedJobAnswer, setAcceptedJobAnswer] = useState<'yes' | 'no' | ''>(() => {
    if (value.acceptedJobOtherMunicipality) return 'yes'
    if (value.movedResidence || value.moveTaxYear > 0 || value.newJobSpecificExpenses > 0) return 'yes'
    if (value.wasRegisteredJobseeker) return ''
    return ''
  })
  const [movedAnswer, setMovedAnswer] = useState<'yes' | 'no' | ''>(() => {
    if (value.movedResidence) return 'yes'
    if (value.moveTaxYear > 0 || value.newJobSpecificExpenses > 0) return 'yes'
    if (value.acceptedJobOtherMunicipality) return ''
    return ''
  })
  const [recentMoveAnswer, setRecentMoveAnswer] = useState<'yes' | 'no' | ''>(() => {
    if (value.moveTaxYear === 2024 || value.moveTaxYear === 2025) return 'yes'
    if (value.newJobSpecificExpenses > 0) return 'yes'
    if (value.movedResidence) return ''
    return ''
  })

  return (
    <div className="irpf-marital-subflow">
      <div className="irpf-marital-subask">
        <p>¿Estabas inscrito como demandante de empleo?</p>
        <small>Debes figurar en las oficinas de empleo antes de aceptar el nuevo trabajo.</small>
        <YesNoChips
          label="Inscripción como demandante de empleo"
          value={registeredAnswer}
          onChange={(next) => {
            setRegisteredAnswer(next)
            setAcceptedJobAnswer('')
            setMovedAnswer('')
            setRecentMoveAnswer('')
            if (next === 'yes') {
              onChange({ ...value, wasRegisteredJobseeker: true })
              return
            }
            onChange(clearGeographicMobilityFields(value))
          }}
        />
      </div>

      {registeredAnswer === 'no' ? (
        <p className="irpf-marital-note irpf-marital-note--muted">
          Sin inscripción previa como demandante de empleo, el incremento por movilidad geográfica no suele aplicar.
        </p>
      ) : null}

      {registeredAnswer === 'yes' ? (
        <div className="irpf-marital-subask">
          <p>¿Aceptaste un empleo en otro municipio?</p>
          <small>El puesto debe estar en un municipio distinto al de tu residencia anterior.</small>
          <YesNoChips
            label="Empleo en otro municipio"
            value={acceptedJobAnswer}
            onChange={(next) => {
              setAcceptedJobAnswer(next)
              setMovedAnswer('')
              setRecentMoveAnswer('')
              if (next === 'yes') {
                onChange({
                  ...value,
                  wasRegisteredJobseeker: true,
                  acceptedJobOtherMunicipality: true,
                })
                return
              }
              onChange({
                ...clearGeographicMobilityFields(value),
                wasRegisteredJobseeker: true,
              })
            }}
          />
        </div>
      ) : null}

      {registeredAnswer === 'yes' && acceptedJobAnswer === 'no' ? (
        <p className="irpf-marital-note irpf-marital-note--muted">
          Si el trabajo no exigía cambiar de municipio, esta reducción no aplica.
        </p>
      ) : null}

      {registeredAnswer === 'yes' && acceptedJobAnswer === 'yes' ? (
        <div className="irpf-marital-subask">
          <p>¿Te mudaste de residencia por ese empleo?</p>
          <small>No basta con desplazarte: tiene que ser un traslado real de domicilio.</small>
          <YesNoChips
            label="Traslado de residencia"
            value={movedAnswer}
            onChange={(next) => {
              setMovedAnswer(next)
              setRecentMoveAnswer('')
              if (next === 'yes') {
                onChange({
                  ...value,
                  wasRegisteredJobseeker: true,
                  acceptedJobOtherMunicipality: true,
                  movedResidence: true,
                })
                return
              }
              onChange({
                ...clearGeographicMobilityFields(value),
                wasRegisteredJobseeker: true,
                acceptedJobOtherMunicipality: true,
              })
            }}
          />
        </div>
      ) : null}

      {registeredAnswer === 'yes' && acceptedJobAnswer === 'yes' && movedAnswer === 'no' ? (
        <p className="irpf-marital-note irpf-marital-note--muted">
          Sin cambio de residencia, el incremento por movilidad geográfica no se aplica.
        </p>
      ) : null}

      {registeredAnswer === 'yes' && acceptedJobAnswer === 'yes' && movedAnswer === 'yes' ? (
        <>
          <p className="irpf-marital-note">
            Si cumples los tres requisitos, puedes incrementar tus gastos deducibles hasta{' '}
            <strong>{GEOGRAPHIC_MOBILITY_INCREMENT_2025.toLocaleString('es-ES')} €</strong> en el año del traslado
            y el siguiente. El límite del incremento es 2.000 € y no puede superar tu salario bruto del paso 1
            menos los gastos específicos de ese empleo.
          </p>
          <div className="irpf-marital-subask">
            <p>¿Te mudaste en 2024 o 2025?</p>
            <small>El incremento solo aplica si el traslado fue en uno de esos dos ejercicios.</small>
            <YesNoChips
              label="Traslado en 2024 o 2025"
              value={recentMoveAnswer}
              onChange={(next) => {
                setRecentMoveAnswer(next)
                if (next === 'yes') {
                  onChange({
                    ...value,
                    wasRegisteredJobseeker: true,
                    acceptedJobOtherMunicipality: true,
                    movedResidence: true,
                    moveTaxYear: value.moveTaxYear === 2024 ? 2024 : 2025,
                  })
                  return
                }
                onChange({
                  ...value,
                  wasRegisteredJobseeker: true,
                  acceptedJobOtherMunicipality: true,
                  movedResidence: true,
                  moveTaxYear: 0,
                  newJobSpecificExpenses: 0,
                })
              }}
            />
          </div>

          {recentMoveAnswer === 'no' ? (
            <p className="irpf-marital-note irpf-marital-note--muted">
              Si el traslado fue antes de 2024, el incremento por movilidad geográfica no aplica en esta declaración.
            </p>
          ) : null}

          {recentMoveAnswer === 'yes' ? (
            <div className="irpf-rule-grid">
              <NumberField
                label="¿Cuánto suman los gastos específicos de ese empleo?"
                value={value.newJobSpecificExpenses}
                onChange={(amount) => onChange({ ...value, newJobSpecificExpenses: amount })}
                hint={`Solo gastos vinculados a ese trabajo. El incremento máximo es ${GEOGRAPHIC_MOBILITY_INCREMENT_2025.toLocaleString('es-ES')} €.`}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function SpousePensionQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  const [lowIncomeAnswer, setLowIncomeAnswer] = useState<'yes' | 'no' | ''>(() => {
    if (value.spouseNetWorkAndBusinessIncome >= SPOUSE_INCOME_THRESHOLD) return 'no'
    if (
      value.spousePensionContribution > 0
      || value.spousePensionEligible
      || value.spousePensionProductType !== 'none'
    ) return 'yes'
    return ''
  })

  return (
    <div className="irpf-marital-subflow">
      <SpousePensionProductInfobox />
      <div className="irpf-marital-subask">
        <p>¿Tu pareja gana menos de 8.000 € al año por nómina o por trabajar por cuenta propia?</p>
        <small>Solo cuenta lo que gana por trabajo o por su actividad. No incluyas alquileres, pensiones u otras rentas.</small>
        <YesNoChips
          label="Ingresos de la pareja por trabajo o actividad"
          value={lowIncomeAnswer}
          onChange={(next) => {
            setLowIncomeAnswer(next)
            if (next === 'yes') {
              onChange({
                ...value,
                spouseNetWorkAndBusinessIncome: Math.min(value.spouseNetWorkAndBusinessIncome, SPOUSE_INCOME_THRESHOLD - 1),
              })
              return
            }
            onChange(clearSpousePensionFields({
              ...value,
              spouseNetWorkAndBusinessIncome: SPOUSE_INCOME_THRESHOLD,
            }))
          }}
        />
      </div>

      {lowIncomeAnswer === 'yes' ? (
        <>
          <p className="irpf-marital-note">
            Si cumple ese requisito, lo que tú aportes a su plan puede reducir tu base imponible como máximo{' '}
            <strong>{SPOUSE_PENSION_MAX_REDUCTION.toLocaleString('es-ES')} € al año</strong>.
          </p>
          <NumberField
            label="¿Cuánto has aportado tú este año?"
            value={value.spousePensionContribution}
            onChange={(amount) => onChange(markSpousePensionContribution(value, amount))}
            hint={`Máximo que puede reducir la base: ${SPOUSE_PENSION_MAX_REDUCTION.toLocaleString('es-ES')} €`}
          />
        </>
      ) : lowIncomeAnswer === 'no' ? (
        <p className="irpf-marital-note irpf-marital-note--muted">
          Con ingresos de 8.000 € o más al año por trabajo o actividad, esta reducción no suele aplicar.
        </p>
      ) : null}
    </div>
  )
}

function getMaritalReductionVisibility(maritalStatus: MaritalStatus) {
  return {
    jointTaxation: true,
    spousePension: maritalStatus === 'married',
    compensatoryPension: maritalStatus === 'divorced',
  }
}

function MaritalReductionsGroup({
  maritalStatus,
  childrenCount = 0,
  jointUnitChildrenCount = 0,
  value,
  onChange,
  previewBaseAvailable,
}: {
  maritalStatus: MaritalStatus
  childrenCount?: number
  jointUnitChildrenCount?: number
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
  previewBaseAvailable: number
}) {
  const visibility = getMaritalReductionVisibility(maritalStatus)
  const update = <Key extends keyof Irpf2025AdjustmentInput>(key: Key, nextValue: Irpf2025AdjustmentInput[Key]) => {
    onChange({ ...value, [key]: nextValue })
  }
  const available = previewBaseAvailable > 0 ? previewBaseAvailable : 1_000_000
  const spousePensionEffect = sliceBaseReduction(
    value,
    ['spousePensionContribution', 'spouseNetWorkAndBusinessIncome', 'spousePensionProductType'],
    available,
  ).spousePensionApplied
  const compensatoryEffect = sliceBaseReduction(
    value,
    ['compensatoryPensionPaid', 'compensatoryPensionFormalized'],
    available,
  ).compensatoryPensionApplied
  const jointEffect = sliceBaseReduction(value, ['jointTaxationType'], available).jointTaxationApplied

  return (
    <>
      {visibility.spousePension ? (
        <ReductionQuestion
          question="¿Has aportado a la previsión para la jubilación de tu pareja?"
          description="Plan de pensiones, mutualidad profesional o seguro de jubilación. Solo si tu pareja gana poco por trabajo."
          initiallyRelevant={
            value.spousePensionContribution > 0
            || value.spousePensionEligible
            || value.spousePensionProductType !== 'none'
            || (value.spouseNetWorkAndBusinessIncome > 0 && value.spouseNetWorkAndBusinessIncome < SPOUSE_INCOME_THRESHOLD)
          }
          effectAmount={spousePensionEffect}
          onNo={() => onChange(clearSpousePensionFields(value))}
        >
          <SpousePensionQuestions value={value} onChange={onChange} />
        </ReductionQuestion>
      ) : null}

      {visibility.compensatoryPension ? (
        <ReductionQuestion
          question="¿Pagas una pensión a tu expareja?"
          description="Debe estar fijada por sentencia o convenio regulador formalizado."
          initiallyRelevant={value.compensatoryPensionPaid > 0}
          effectAmount={compensatoryEffect}
          onNo={() => onChange({ ...value, compensatoryPensionPaid: 0, compensatoryPensionFormalized: false })}
        >
          <NumberField
            label="¿Cuánto has pagado este año?"
            value={value.compensatoryPensionPaid}
            onChange={(amount) => onChange({
              ...value,
              compensatoryPensionPaid: amount,
              compensatoryPensionFormalized: amount > 0,
            })}
          />
        </ReductionQuestion>
      ) : null}

      {visibility.jointTaxation ? (
        <ReductionQuestion
          question="¿Vas a hacer la declaración conjunta?"
          description="Cada año puedes elegir entre declaración individual o conjunta. Si tienes hijos, los que indiques a continuación pueden formar la unidad si conviven contigo y cumplen edad o discapacidad."
          guide={
            <JointTaxationGuide
              maritalStatus={maritalStatus}
              childrenCount={childrenCount}
              jointUnitChildrenCount={jointUnitChildrenCount}
            />
          }
          initiallyRelevant={value.jointTaxationType !== 'individual'}
          effectAmount={jointEffect}
          onYes={() => {
            if (value.jointTaxationType !== 'individual') return
            update('jointTaxationType', maritalStatus === 'married' ? 'married' : 'single_parent')
          }}
          onNo={() => update('jointTaxationType', 'individual')}
        >
          <SelectField
            label="¿Con quién presentas la declaración?"
            value={value.jointTaxationType}
            onChange={(next) => update('jointTaxationType', next as Irpf2025AdjustmentInput['jointTaxationType'])}
          >
            <option value="individual">La presento individual</option>
            {maritalStatus === 'married' ? (
              <option value="married">Con mi cónyuge</option>
            ) : (
              <>
                <option value="single_parent">Como unidad monoparental</option>
                <option value="single_parent_cohabiting">Monoparental conviviendo con el otro progenitor</option>
              </>
            )}
          </SelectField>
        </ReductionQuestion>
      ) : null}
    </>
  )
}

export { MaritalReductionsGroup }

export function WorkIncomeBenefitsSection({
  value,
  onChange,
  netWorkIncome = 0,
  grossWorkIncome = 0,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
  netWorkIncome?: number
  grossWorkIncome?: number
}) {
  if (!workBenefitsCouldApply(netWorkIncome, grossWorkIncome)) {
    return (
      <p className="wprc-work-benefits-note">
        Con este nivel de salario, otras rentas no cambian las ventajas del trabajo previstas en la ley.
      </p>
    )
  }

  return (
    <div className="irpf-reduction-question-list wprc-work-benefits">
      <ReductionQuestion
        question="¿Tienes otros ingresos además de tu trabajo?"
        description="Por ejemplo alquileres, intereses o actividades por tu cuenta. No cuentan el salario, complementos ni especie del paso 1. Si superan 6.500 €/año, no aplican algunas ventajas del trabajo."
        initiallyRelevant={value.otherNonExemptNonWorkIncome > 0}
        onNo={() => onChange(confirmNoOtherIncome(value))}
      >
        <OtherIncomeQuestions value={value} onChange={onChange} />
      </ReductionQuestion>
    </div>
  )
}

function euros(value: number) {
  return `${Math.round(value).toLocaleString('es-ES', { useGrouping: true })} €`
}

function PensionLimitNote({ netWorkIncome }: { netWorkIncome: number }) {
  const example = netWorkIncome > 0 ? netWorkIncome : 20_000
  const thirtyPercent = example * 0.3
  const percentLimitBinds = thirtyPercent < PERSONAL_PENSION_ABSOLUTE_LIMIT
  const reduced = Math.max(0, example - 2_000)

  return (
    <details className="irpf-pension-limit">
      <summary>¿Qué significa el límite del 30 %?</summary>
      <p>
        Lo que aportas se reduce de la base, pero con dos topes: <strong>1.500 € al año</strong> y el{' '}
        <strong>30 % de tu rendimiento neto del trabajo</strong>. Manda el más pequeño de los dos. El
        tope de 1.500 € sube si tu empresa también aporta a un plan para ti.
      </p>
      <p>
        Con {euros(example)} de rendimiento neto, ese 30 % son {euros(thirtyPercent)}, así que en tu caso
        manda{' '}
        {percentLimitBinds
          ? <>el 30 %: <strong>{euros(thirtyPercent)}</strong></>
          : <>el tope de <strong>{euros(PERSONAL_PENSION_ABSOLUTE_LIMIT)}</strong></>}
        .
      </p>
      <p>
        Ojo con el 30 %: se calcula sobre el rendimiento neto, así que tus gastos deducibles también lo
        bajan. Con {euros(reduced)} de rendimiento, ese 30 % serían {euros(reduced * 0.3)}. Es la otra
        cara de los gastos deducibles: te bajan la base, pero pueden bajarte el máximo que puedes aportar
        al plan con ventaja fiscal.
      </p>
    </details>
  )
}

export function Irpf2025StructuredAdjustmentsForm({
  focus,
  reductionsGroup = 'all',
  value,
  declaredInKindSalary = 0,
  declaredGrossWorkIncome = 0,
  netWorkIncome = 0,
  previewBaseAvailable = 0,
  onChange,
}: Props) {
  const update = <Key extends keyof Irpf2025AdjustmentInput>(key: Key, nextValue: Irpf2025AdjustmentInput[Key]) => {
    onChange({ ...value, [key]: nextValue })
  }
  const benefits = calculateInKindBenefits2025(value)
  const benefitsMismatch = benefits.declaredBenefitsTotal > declaredInKindSalary
  const workExpenses = calculateAdditionalWorkExpenses2025(value)
  // Si aún no hay base liquidable, mostramos el efecto teórico de las respuestas.
  const available = previewBaseAvailable > 0 ? previewBaseAvailable : 1_000_000
  const personalPlanEffect = sliceBaseReduction(
    value,
    ['personalPensionContribution'],
    available,
  ).pensionApplied
  const personalAndMutualityEffect = sliceBaseReduction(
    value,
    ['personalPensionContribution', 'mutualityContribution'],
    available,
  ).pensionApplied
  const mutualityEffect = Math.max(0, personalAndMutualityEffect - personalPlanEffect)
  const withEmployment = sliceBaseReduction(
    value,
    [
      'personalPensionContribution',
      'mutualityContribution',
      'employerPensionContribution',
      'workerEmploymentPensionContribution',
    ],
    available,
    declaredGrossWorkIncome,
  ).pensionApplied
  const employmentPensionEffect = Math.max(0, withEmployment - personalAndMutualityEffect)
  const protectedEffect = sliceBaseReduction(
    value,
    [
      'protectedAssetsContribution',
      'protectedAssetsFormalEstate',
      'protectedAssetsValidContributor',
      'protectedAssetsContributorNotBeneficiary',
      'protectedAssetsTotalContributors',
    ],
    available,
  ).protectedAssetsApplied
  const mobilityEffect = calculateGeographicMobilityIncrement2025(value, declaredGrossWorkIncome)

  if (focus === 'reductions') {
    const showWorkExpenses = reductionsGroup !== 'base-reductions'
    const showBaseReductions = reductionsGroup !== 'work-expenses'

    return (
      <section
        className="irpf-rule-form"
        aria-label={showWorkExpenses && showBaseReductions
          ? 'Datos exactos para reducciones IRPF 2025'
          : showWorkExpenses
            ? 'Gastos deducibles de tu trabajo'
            : 'Aportaciones que reducen la base'}
      >
        <div className="irpf-reduction-question-list">
          {showWorkExpenses ? (
            <>
          <ReductionQuestion question="¿Pagas cuota de un sindicato?" description="Indica solo lo que hayas pagado tú este año." initiallyRelevant={value.unionDues > 0} effectAmount={workExpenses.unionDues} onNo={() => update('unionDues', 0)}>
            <NumberField label="¿Cuánto has pagado este año?" value={value.unionDues} onChange={(amount) => update('unionDues', amount)} />
          </ReductionQuestion>
          <ReductionQuestion
            question="¿Pagas un colegio profesional donde es obligatorio estar colegiado?"
            description="Solo si tu profesión exige colegiarse para trabajar, como médico, abogado, farmacéutico o arquitecto."
            initiallyRelevant={value.professionalDues > 0 || value.professionalMembershipMandatory}
            effectAmount={workExpenses.professionalDues}
            onYes={() => {
              if (!value.professionalMembershipMandatory) {
                onChange({ ...value, professionalMembershipMandatory: true })
              }
            }}
            onNo={() => onChange({ ...value, professionalDues: 0, professionalMembershipMandatory: false })}
          >
            <NumberField
              label="¿Cuánto has pagado este año?"
              value={value.professionalDues}
              onChange={(amount) => onChange({
                ...value,
                professionalDues: amount,
                professionalMembershipMandatory: true,
              })}
              hint="El máximo aplicable es 500 EUR."
            />
          </ReductionQuestion>
          <ReductionQuestion question="¿Has pagado un abogado por un problema con tu trabajo?" description="Solo por un conflicto laboral con tu empresa." initiallyRelevant={value.legalDefenseCosts > 0} effectAmount={workExpenses.legalDefense} onNo={() => update('legalDefenseCosts', 0)}>
            <NumberField label="¿Cuánto has pagado este año?" value={value.legalDefenseCosts} onChange={(amount) => update('legalDefenseCosts', amount)} hint="El máximo aplicable es 300 EUR." />
          </ReductionQuestion>
          <ReductionQuestion question="¿Te mudaste a otro municipio para empezar un trabajo?" description="Aplica si estabas en paro, aceptaste un empleo en otro municipio y cambiaste de residencia." initiallyRelevant={value.wasRegisteredJobseeker || value.acceptedJobOtherMunicipality || value.movedResidence} effectAmount={mobilityEffect} onNo={() => onChange(clearGeographicMobilityFields(value))}>
            <GeographicMobilityQuestions
              value={value}
              onChange={onChange}
            />
          </ReductionQuestion>
            </>
          ) : null}
          {showBaseReductions ? (
            <>
          <ReductionQuestion question="¿Pagas tú un plan de pensiones?" description="Solo tus aportaciones personales, no las de tu empresa." initiallyRelevant={value.personalPensionContribution > 0} effectAmount={personalPlanEffect} onNo={() => update('personalPensionContribution', 0)}>
            <NumberField label="¿Cuánto has aportado este año?" value={value.personalPensionContribution} onChange={(amount) => update('personalPensionContribution', amount)} />
            <PensionLimitNote netWorkIncome={netWorkIncome} />
          </ReductionQuestion>
          <ReductionQuestion question="¿Pagas una mutualidad profesional?" description="Por ejemplo, la del colegio de médicos o abogados." initiallyRelevant={value.mutualityContribution > 0} effectAmount={mutualityEffect} onNo={() => update('mutualityContribution', 0)}>
            <NumberField label="¿Cuánto has aportado este año?" value={value.mutualityContribution} onChange={(amount) => update('mutualityContribution', amount)} />
          </ReductionQuestion>
          <ReductionQuestion question="¿Tu empresa aporta a un plan de pensiones para ti?" description="Míralo en tu nómina, certificado de la empresa o entidad del plan." initiallyRelevant={value.employerPensionContribution > 0 || value.workerEmploymentPensionContribution > 0} effectAmount={employmentPensionEffect} onNo={() => onChange({ ...value, employerPensionContribution: 0, workerEmploymentPensionContribution: 0 })}>
            <div className="irpf-rule-grid">
              <NumberField label="Aportación anual de tu empresa" value={value.employerPensionContribution} onChange={(amount) => update('employerPensionContribution', amount)} />
              <NumberField label="Tu aportación al mismo plan" value={value.workerEmploymentPensionContribution} onChange={(amount) => update('workerEmploymentPensionContribution', amount)} />
            </div>
          </ReductionQuestion>
          <ReductionQuestion question="¿Has aportado a un patrimonio protegido de una persona con discapacidad?" description="Es una figura específica; déjalo en No si no te suena." initiallyRelevant={value.protectedAssetsContribution > 0 || value.protectedAssetsFormalEstate} effectAmount={protectedEffect} onNo={() => onChange(clearProtectedAssetsFields(value))}>
            <ProtectedAssetsQuestions value={value} onChange={onChange} />
          </ReductionQuestion>
            </>
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <section className="irpf-rule-form" aria-label="Datos exactos para deducciones IRPF 2025">
      <RuleGroup
        title="Retribuciones en especie"
        description="Separa la parte exenta de la sujeta y la reconcilia con el salario en especie del paso 1."
        icon={BriefcaseBusiness}
        open
      >
        <div className="irpf-rule-result" role="status">
          <span>Beneficios detallados: <strong>{benefits.declaredBenefitsTotal.toLocaleString('es-ES', { maximumFractionDigits: 2 })} EUR</strong></span>
          <span>Parte exenta: <strong>{benefits.exemptAmount.toLocaleString('es-ES', { maximumFractionDigits: 2 })} EUR</strong></span>
          <span>Salario en especie declarado: <strong>{declaredInKindSalary.toLocaleString('es-ES', { maximumFractionDigits: 2 })} EUR</strong></span>
        </div>
        {benefitsMismatch ? (
          <p className="irpf-rule-alert">Los beneficios detallados superan el salario en especie declarado en el paso 1. Hasta corregirlo, la exencion queda limitada al importe declarado.</p>
        ) : null}
        <div className="irpf-rule-grid">
          <CheckField label="La tarjeta comida cumple los requisitos" checked={value.mealCardEligible} onChange={(checked) => update('mealCardEligible', checked)} />
          <NumberField label="Importe diario de tarjeta comida" value={value.mealCardDailyAmount} onChange={(amount) => update('mealCardDailyAmount', amount)} />
          <CountField label="Dias admisibles de tarjeta comida" value={value.mealCardEligibleDays} onChange={(count) => update('mealCardEligibleDays', count)} max={366} unit="días" />
          <CheckField label="La tarjeta transporte cumple los requisitos" checked={value.transportCardEligible} onChange={(checked) => update('transportCardEligible', checked)} />
          <NumberField label="Importe mensual de transporte" value={value.transportCardMonthlyAmount} onChange={(amount) => update('transportCardMonthlyAmount', amount)} />
          <CountField label="Meses admisibles de transporte" value={value.transportCardEligibleMonths} onChange={(count) => update('transportCardEligibleMonths', count)} />
          <CheckField label="El seguro medico cubre personas admisibles" checked={value.healthInsuranceEligible} onChange={(checked) => update('healthInsuranceEligible', checked)} />
          <CountField label="Personas aseguradas sin discapacidad" value={value.healthInsuranceOrdinaryPersonsCount} onChange={(count) => update('healthInsuranceOrdinaryPersonsCount', count)} max={20} />
          <NumberField label="Primas de personas sin discapacidad" value={value.healthInsurancePremiumOrdinaryPersons} onChange={(amount) => update('healthInsurancePremiumOrdinaryPersons', amount)} />
          <CountField label="Personas aseguradas con discapacidad" value={value.healthInsuranceDisabledPersonsCount} onChange={(count) => update('healthInsuranceDisabledPersonsCount', count)} max={20} />
          <NumberField label="Primas de personas con discapacidad" value={value.healthInsurancePremiumDisabledPersons} onChange={(amount) => update('healthInsurancePremiumDisabledPersons', amount)} />
          <CheckField label="La guarderia de empresa cumple el articulo 42.3.b" checked={value.companyDaycareEligible} onChange={(checked) => update('companyDaycareEligible', checked)} />
          <NumberField label="Guarderia pagada por la empresa" value={value.companyDaycareAnnualAmount} onChange={(amount) => update('companyDaycareAnnualAmount', amount)} />
          <NumberField label="Ingreso a cuenta no repercutido" value={value.paymentOnAccountNotPassedOn} onChange={(amount) => update('paymentOnAccountNotPassedOn', amount)} />
        </div>
      </RuleGroup>

      <RuleGroup
        title="Deducciones generales de cuota"
        description="Donativos, alquiler y vivienda transitorios y empresa nueva."
        icon={Landmark}
      >
        <div className="irpf-rule-grid">
          <NumberField label="Donativo 2025" value={value.donationAmount} onChange={(amount) => update('donationAmount', amount)} />
          <NumberField label="Donado a la misma entidad en 2024" value={value.donation2024} onChange={(amount) => update('donation2024', amount)} />
          <NumberField label="Donado a la misma entidad en 2023" value={value.donation2023} onChange={(amount) => update('donation2023', amount)} />
          <CheckField label="Entidad incluida en la Ley 49/2002" checked={value.donationLaw49Eligible} onChange={(checked) => update('donationLaw49Eligible', checked)} />
          <NumberField label="Alquiler pagado en 2025" value={value.rentPaid} onChange={(amount) => update('rentPaid', amount)} />
          <CheckField label="Contrato anterior a 2015" checked={value.rentContractBefore2015} onChange={(checked) => update('rentContractBefore2015', checked)} />
          <CheckField label="Se pagaron cantidades antes de 2015" checked={value.rentPaidBefore2015} onChange={(checked) => update('rentPaidBefore2015', checked)} />
          <CheckField label="Hubo derecho a deduccion antes de 2015" checked={value.rentPriorDeductionRight} onChange={(checked) => update('rentPriorDeductionRight', checked)} />
          <CheckField label="Es la vivienda habitual" checked={value.rentIsMainHome} onChange={(checked) => update('rentIsMainHome', checked)} />
          <NumberField label="Inversion admisible en vivienda" value={value.homeInvestmentPaid} onChange={(amount) => update('homeInvestmentPaid', amount)} />
          <CheckField label="Acredita regimen transitorio anterior a 2013" checked={value.homeTransitionalRight} onChange={(checked) => update('homeTransitionalRight', checked)} />
          <NumberField label="Porcentaje de titularidad" value={value.homeOwnershipPercent} onChange={(amount) => update('homeOwnershipPercent', Math.min(100, amount))} max={100} unit="%" />
          <SelectField
            label="Porcentaje autonomico de vivienda"
            value={String(value.homeRegionalRate)}
            onChange={(next) => update('homeRegionalRate', Number(next) as 7.5 | 9)}
          >
            <option value="7.5">7,5 % general</option>
            <option value="9">9 % especial Cataluna</option>
          </SelectField>
          <CheckField label="Requisitos del 9 % catalan verificados" checked={value.homeRegionalSpecialVerified} onChange={(checked) => update('homeRegionalSpecialVerified', checked)} />
          <NumberField label="Inversion en empresa nueva" value={value.newCompanyInvestment} onChange={(amount) => update('newCompanyInvestment', amount)} />
          <CheckField label="Certificacion y requisitos societarios verificados" checked={value.newCompanyRequirementsVerified} onChange={(checked) => update('newCompanyRequirementsVerified', checked)} />
        </div>
      </RuleGroup>

      <RuleGroup
        title="Deducciones reembolsables y pagos a cuenta"
        description="Calcula derecho generado, anticipos ya cobrados y resultado estimado de la declaracion."
        icon={HeartHandshake}
      >
        <div className="irpf-rule-subtitle"><Baby /> Maternidad y guarderia</div>
        <div className="irpf-rule-grid">
          <CheckField label="Cumple los requisitos de maternidad" checked={value.maternityEligible} onChange={(checked) => update('maternityEligible', checked)} />
          <CountField label="Hijos que generan deduccion por maternidad" value={value.maternityEligibleChildren} onChange={(count) => update('maternityEligibleChildren', Math.max(1, count))} max={20} />
          <CountField label="Suma de meses-hijo con derecho" value={value.maternityEligibleMonths} onChange={(count) => update('maternityEligibleMonths', count)} max={120} hint="Ejemplo: dos hijos durante 12 meses = 24." />
          <CountField label="Hijos con incremento unico de 150 EUR" value={value.maternityOneTime150Count} onChange={(count) => update('maternityOneTime150Count', count)} max={20} />
          <NumberField label="Abono anticipado de maternidad cobrado" value={value.maternityAdvanceReceived} onChange={(amount) => update('maternityAdvanceReceived', amount)} />
          <CheckField label="Cumple los requisitos del incremento de guarderia" checked={value.daycareEligible} onChange={(checked) => update('daycareEligible', checked)} />
          <CountField label="Hijos que generan incremento de guarderia" value={value.daycareEligibleChildren} onChange={(count) => update('daycareEligibleChildren', Math.max(1, count))} max={20} />
          <CountField label="Suma de meses completos por hijo" value={value.daycareFullMonths} onChange={(count) => update('daycareFullMonths', count)} max={120} />
          <NumberField label="Gasto anual de guarderia" value={value.daycareTotalExpense} onChange={(amount) => update('daycareTotalExpense', amount)} />
          <NumberField label="Subvenciones de guarderia" value={value.daycareSubsidies} onChange={(amount) => update('daycareSubsidies', amount)} />
          <NumberField label="Guarderia exenta pagada por la empresa" value={value.daycareEmployerExemptAmount} onChange={(amount) => update('daycareEmployerExemptAmount', amount)} />
        </div>
        <div className="irpf-rule-subtitle"><UsersRound /> Familia numerosa y discapacidad</div>
        <div className="irpf-rule-grid">
          <CheckField label="Titulo de familia numerosa vigente" checked={value.largeFamilyEligible} onChange={(checked) => update('largeFamilyEligible', checked)} />
          <SelectField label="Categoria de familia numerosa" value={value.largeFamilyCategory} onChange={(next) => update('largeFamilyCategory', next as Irpf2025AdjustmentInput['largeFamilyCategory'])}>
            <option value="none">No aplica</option>
            <option value="general">General</option>
            <option value="special">Especial</option>
          </SelectField>
          <CountField label="Meses con derecho a familia numerosa" value={value.largeFamilyEligibleMonths} onChange={(count) => update('largeFamilyEligibleMonths', count)} />
          <CountField label="Hijos que exceden el minimo de categoria" value={value.largeFamilyExtraChildren} onChange={(count) => update('largeFamilyExtraChildren', count)} max={20} />
          <SelectField label="Parte del derecho que corresponde" value={String(value.largeFamilyEntitlementShare)} onChange={(next) => update('largeFamilyEntitlementShare', Number(next))}>
            <option value="1">100 %</option>
            <option value="0.5">50 %</option>
          </SelectField>
          <NumberField label="Abono anticipado de familia numerosa" value={value.largeFamilyAdvanceReceived} onChange={(amount) => update('largeFamilyAdvanceReceived', amount)} />
          <CountField label="Suma de meses-persona con discapacidad a cargo" value={value.disabilityEligiblePersonMonths} onChange={(count) => update('disabilityEligiblePersonMonths', count)} max={120} hint="Ejemplo: dos personas durante 12 meses = 24." />
          <SelectField label="Parte del derecho por discapacidad" value={String(value.disabilityEntitlementShare)} onChange={(next) => update('disabilityEntitlementShare', Number(next))}>
            <option value="1">100 %</option>
            <option value="0.5">50 %</option>
          </SelectField>
          <NumberField label="Abonos anticipados por discapacidad" value={value.disabilityAdvanceReceived} onChange={(amount) => update('disabilityAdvanceReceived', amount)} />
          <NumberField label="Cotizaciones que limitan estas deducciones" value={value.refundableContributionLimit} onChange={(amount) => update('refundableContributionLimit', amount)} hint="Suma anual que actua como limite cuando el derecho nace por alta." />
          <CheckField label="El derecho nace por prestacion habilitante sin limite de cotizaciones" checked={value.refundableBenefitEntitlement} onChange={(checked) => update('refundableBenefitEntitlement', checked)} />
        </div>
        <div className="irpf-rule-subtitle"><ShieldCheck /> Pagos ya realizados</div>
        <div className="irpf-rule-grid">
          <NumberField label="Retenciones de IRPF practicadas" value={value.withholdings} onChange={(amount) => update('withholdings', amount)} />
          <NumberField label="Otros ingresos o pagos a cuenta" value={value.paymentsOnAccount} onChange={(amount) => update('paymentsOnAccount', amount)} />
        </div>
      </RuleGroup>
    </section>
  )
}

export default Irpf2025StructuredAdjustmentsForm
