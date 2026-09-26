import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  calculateAdditionalWorkExpenses2025,
  calculateBaseReductions2025,
  calculateGeneralDeductions2025,
  calculateGeographicMobilityIncrement2025,
  calculateInKindBenefits2025,
  calculateRefundableDeductions2025,
  createEmptyIrpf2025Adjustments,
  GEOGRAPHIC_MOBILITY_INCREMENT_2025,
  HEALTH_INSURANCE_EXEMPT_PER_DISABLED_PERSON_2025,
  HEALTH_INSURANCE_EXEMPT_PER_PERSON_2025,
} from '../fiscal-worker-dashboard/irpf2025Adjustments'
import type { Irpf2025AdjustmentInput } from '../fiscal-worker-dashboard/irpf2025Adjustments'
import {
  WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR,
  workBenefitsCouldApply,
} from '../fiscal-worker-dashboard/irpf2025Calc'
import { InfoButton } from '../ui/InfoButton'
import { useFiscalVariant } from '../fiscal-worker-dashboard/fiscalVariant'
import { EscQuestion } from './escenario/EscenarioCommon'
import './Irpf2025StructuredAdjustmentsForm.css'

type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'

type Props = {
  focus: 'reductions' | 'deductions-benefits' | 'in-kind'
  // Los gastos del art. 19 y las reducciones de base se preguntan por separado:
  // no restan en el mismo momento del calculo.
  reductionsGroup?: 'all' | 'work-expenses' | 'base-reductions'
  deductionsGroup?: 'all' | 'in-kind' | 'quota' | 'refundable'
  value: Irpf2025AdjustmentInput
  declaredGrossWorkIncome?: number
  netWorkIncome?: number
  previewBaseAvailable?: number
  previewTaxableIncome?: number
  stateIntegralQuota?: number
  regionalIntegralQuota?: number
  // Tope de las deducciones reembolsables: sale de lo cotizado en el paso 3, no
  // de una pregunta al usuario.
  socialSecurityContributions?: number
  onChange: (value: Irpf2025AdjustmentInput) => void
}
const OTHER_INCOME_THRESHOLD = WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR
const SPOUSE_INCOME_THRESHOLD = 8_000
const SPOUSE_PENSION_MAX_REDUCTION = 1_000
const PERSONAL_PENSION_ABSOLUTE_LIMIT = 1_500

// 'expense' son gastos deducibles: bajan el rendimiento neto del trabajo, no la
// base liquidable. Etiquetarlos como "reduccion" hacia creer que debian aparecer
// en la linea "Reducciones de base" del panel, que solo suma reducciones de base.
type QuestionEffectKind = 'reduction' | 'deduction' | 'exempt' | 'expense'

function QuestionEffect({ amount, kind = 'reduction' }: { amount?: number; kind?: QuestionEffectKind }) {
  if (!amount) return null
  const formatted = Math.abs(amount).toLocaleString('es-ES', { maximumFractionDigits: 2 })
  const label = kind === 'exempt'
    ? `${formatted} EUR exentos`
    : kind === 'deduction'
      ? `Resta ${formatted} EUR de la cuota`
      : kind === 'expense'
        ? `Resta ${formatted} EUR del rendimiento neto del trabajo`
        : `Reduce la base en ${formatted} EUR`
  const visible = kind === 'exempt'
    ? `${formatted} € exentos`
    : kind === 'deduction'
      ? `−${formatted} € deducción`
      : kind === 'expense'
        ? `−${formatted} € gasto deducible`
        : `−${formatted} € reducción`
  return (
    <em className={`irpf-question-effect irpf-question-effect--${kind}`} aria-label={label}>
      {visible}
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
  'Conozco todas mis otras rentas no exentas': 'Algunas reducciones solo se pueden aplicar si conoces si tienes otras rentas no exentas. Si no está confirmado, la calculadora evita aplicar beneficios sujetos a umbral.',
  'Otras rentas no exentas distintas del trabajo': 'Ingresos que no vienen de tu salario y que no están exentos: alquileres, actividades, ganancias, intereses u otros rendimientos. Sirven para comprobar límites.',
  'Cuotas sindicales pagadas': 'Importes pagados a sindicatos. En IRPF pueden reducir el rendimiento neto del trabajo si son cuotas reales y justificables.',
  'Cuotas de colegio profesional': 'Cuotas a un colegio profesional cuando colegiarse es obligatorio para ejercer. La calculadora aplica el límite máximo permitido.',
  'La colegiacion es obligatoria para ejercer': 'Marca si tu profesión exige estar colegiado para trabajar. Si no es obligatorio, la cuota no se trata igual.',
  'Defensa juridica laboral': 'Gastos de abogado o defensa por conflictos laborales con el empleador. Tienen un límite específico anual.',
  'Estaba inscrito como demandante de empleo': 'Dato necesario para aplicar el incremento por movilidad geográfica cuando aceptas trabajo en otro municipio.',
  'Acepte un empleo en otro municipio': 'Se refiere a aceptar un puesto que exige desplazarse a otro municipio, dentro de la regla de movilidad geográfica.',
  'Traslade mi residencia': 'La movilidad geográfica exige traslado efectivo de residencia. Sin este requisito, el incremento no se aplica.',
  'Ejercicio del traslado': 'Indica el año fiscal en que se produjo el traslado. Para 2025 solo importan los ejercicios cubiertos por la regla temporal.',
  'Rendimiento integro del nuevo empleo': 'Salario bruto asociado al empleo que origina la movilidad geográfica.',
  'Gastos especificos del nuevo empleo': 'Gastos vinculados al nuevo empleo que sirven para limitar o calcular el incremento aplicable.',
  'Plan personal': 'Aportaciones tuyas a planes de pensiones individuales u otros sistemas de previsión social con reducción en base.',
  'Mutualidad admisible': 'Aportaciones a mutualidades que fiscalmente pueden actuar como previsión social, si cumplen requisitos.',
  'Contribucion empresarial imputada': 'Aportación que hace la empresa a un plan de empleo y que se atribuye fiscalmente al trabajador.',
  'Aportacion propia al mismo plan de empleo': 'Aportación adicional que haces tú al plan de empleo de la empresa. Puede tener límite conjunto con la contribución empresarial.',
  'Rendimiento integro del empleador del plan': 'Dato usado para decidir el coeficiente o límite aplicable a aportaciones vinculadas al plan de empleo.',
  'Aportacion al sistema del conyuge': 'Aportación a previsión social del cónyuge. Solo reduce si sus rendimientos están por debajo del umbral legal.',
  'Rendimientos netos del conyuge': 'Importe que decide si la aportación al sistema de previsión del cónyuge tiene derecho a reducción.',
  'El sistema del conyuge cumple los requisitos': 'Confirma que el producto y la situación del cónyuge encajan en la regla fiscal. Sin confirmación, no se aplica.',
  'Pension compensatoria pagada': 'Importe pagado al excónyuge por resolución judicial o convenio formalizado. Reduce la base si cumple los requisitos.',
  'Existe resolucion o convenio formalizado': 'La pensión compensatoria necesita respaldo formal para reducir la base.',
  'Modalidad de declaracion': 'Individual o conjunta. La tributación conjunta puede generar reducción, pero depende de la unidad familiar.',
  'Aportacion a patrimonio protegido': 'Aportaciones a un patrimonio protegido de persona con discapacidad. Tienen límites y requisitos específicos.',
  'Total aportado por todos al mismo patrimonio': 'Suma de aportaciones de todos los aportantes al mismo patrimonio protegido. Sirve para aplicar límites globales.',
  'La tarjeta comida cumple los requisitos': 'Vales o tarjeta restaurante con condiciones fiscales. Si cumple, una parte puede estar exenta.',
  'Importe diario de tarjeta comida': 'Importe por día de uso de la tarjeta comida. La exención se limita por día admisible.',
  'Dias admisibles de tarjeta comida': 'Días reales que cumplen requisitos. No todos los días del año tienen por qué computar.',
  'La tarjeta transporte cumple los requisitos': 'Ayuda al transporte colectivo del trabajador. Si cumple requisitos, puede estar exenta con límite mensual/anual.',
  'Importe mensual de transporte': 'Importe mensual de transporte pagado por la empresa o mediante tarjeta.',
  'Meses admisibles de transporte': 'Meses en los que el beneficio de transporte cumple requisitos.',
  'El seguro medico cubre personas admisibles': 'Seguro médico para trabajador, cónyuge o descendientes. La exención depende de las personas cubiertas y límites por persona.',
  'Personas aseguradas sin discapacidad': 'Número de personas cubiertas por el seguro médico sin discapacidad reconocida.',
  'Primas de personas sin discapacidad': 'Prima anual asociada a esas personas. La exención tiene límite por persona.',
  'Personas aseguradas con discapacidad': 'Número de personas cubiertas con discapacidad reconocida, con límite de exención superior.',
  'Primas de personas con discapacidad': 'Prima anual asociada a personas con discapacidad.',
  'La guarderia de empresa cumple el articulo 42.3.b': 'Guardería o educación infantil pagada por la empresa bajo requisitos de retribución en especie exenta.',
  'Guarderia pagada por la empresa': 'Importe anual del beneficio de guardería de empresa.',
  'Ingreso a cuenta no repercutido': 'Pago fiscal que asume la empresa y no te cobra. Puede aumentar la valoración de la retribución en especie.',
  'Donativo 2025': 'Importe donado durante el ejercicio. La deducción depende de entidad, recurrencia y límites.',
  'Entidad incluida en la Ley 49/2002': 'Confirma que la entidad receptora permite aplicar la deducción fiscal de donativos.',
  'Alquiler pagado en 2025': 'Importe anual de alquiler de vivienda habitual, solo relevante si se conserva régimen transitorio.',
  'Contrato anterior a 2015': 'La deducción estatal por alquiler es transitoria. El contrato debe venir de antes de 2015.',
  'Se pagaron cantidades antes de 2015': 'Requisito histórico para mantener el derecho transitorio por alquiler.',
  'Hubo derecho a deduccion antes de 2015': 'Confirma que ya existía derecho fiscal antes de la supresión general de la deducción.',
  'Es la vivienda habitual': 'La deducción de alquiler o vivienda exige que sea tu vivienda habitual, no segunda residencia.',
  'Inversion admisible en vivienda': 'Pagos por adquisición o financiación de vivienda habitual bajo régimen transitorio anterior a 2013.',
  'Acredita regimen transitorio anterior a 2013': 'Confirma que conservas derecho a deducción por vivienda habitual anterior a 2013.',
  'Porcentaje de titularidad': 'Parte de la vivienda que te corresponde fiscalmente. Limita la base atribuible.',
  'Inversion en empresa nueva': 'Inversión en empresas de nueva o reciente creación con derecho potencial a deducción.',
  'Certificacion y requisitos societarios verificados': 'Confirma que la empresa y la inversión cumplen los requisitos fiscales.',
  'Cumple los requisitos de maternidad': 'Deducción reembolsable vinculada a hijos menores de 3 años y situación laboral o prestación habilitante.',
  'Hijos que generan deduccion por maternidad': 'Número de hijos que pueden generar derecho a la deducción.',
  'Suma de meses-hijo con derecho': 'Cuenta meses por hijo. Dos hijos durante doce meses equivalen a veinticuatro meses-hijo.',
  'Cumple los requisitos del incremento de guarderia': 'Incremento asociado a gastos de guardería o centros autorizados, sujeto a requisitos y límites.',
  'Gasto anual de guarderia': 'Importe pagado por guardería antes de restar subvenciones o importes exentos.',
  'Titulo de familia numerosa vigente': 'La deducción exige título oficial vigente durante los meses declarados.',
  'Categoria de familia numerosa': 'General o especial. La categoría cambia el importe mensual base de la deducción.',
  'Parte del derecho que corresponde': 'Porcentaje que te corresponde cuando el derecho se reparte entre contribuyentes.',
  'Suma de meses-persona con discapacidad a cargo': 'Cuenta meses por persona con discapacidad a cargo. Dos personas durante doce meses equivalen a veinticuatro.',
  'Parte del derecho por discapacidad': 'Porcentaje que te corresponde si varios contribuyentes comparten el derecho.',
}

function HelpLabel({ label, help }: { label: string; help?: string }) {
  const helpText = help ?? FIELD_HELP[label]
  return (
    <span className="irpf-rule-label">
      <span>{label}</span>
      {helpText ? (
        <InfoButton label={`Qué significa: ${label}`} size="sm" placement="end" className="wprc-help">
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
        {/* El 0 se pinta vacio: si no, al teclear encima queda "0009990". */}
        <input
          aria-label={label}
          inputMode="decimal"
          max={max}
          min={min}
          step={step}
          type="number"
          value={value === 0 ? '' : value}
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

function ReductionQuestion({ question, description, guide, children, initiallyRelevant = false, effectAmount, effectKind, onYes, onNo }: {
  question: string
  description: string
  guide?: ReactNode
  children?: ReactNode
  initiallyRelevant?: boolean
  effectAmount?: number
  effectKind?: QuestionEffectKind
  onYes?: () => void
  onNo: () => void
}) {
  const variant = useFiscalVariant()
  const [answer, setAnswer] = useState<'unanswered' | 'yes' | 'no'>(() => initiallyRelevant ? 'yes' : 'no')
  const chooseYes = () => {
    onYes?.()
    setAnswer('yes')
  }
  const chooseNo = () => {
    onNo()
    setAnswer('no')
  }

  if (variant === 'escenario') {
    return (
      <EscQuestion
        question={effectKind === 'exempt' ? question : <>{question}<QuestionEffect amount={effectAmount} kind={effectKind} /></>}
        help={<>{description}{guide ? <div className="irpf-reduction-question__guide">{guide}</div> : null}</>}
        value={answer === 'unanswered' ? null : answer === 'yes'}
        onChange={(next) => next ? chooseYes() : chooseNo()}
      >
        {answer === 'yes' ? children : null}
      </EscQuestion>
    )
  }

  return (
    <section className={`irpf-reduction-question is-${answer}`} aria-label={question}>
      <div className="irpf-reduction-question__prompt">
        <span aria-hidden="true">?</span>
        <div>
          <div className="irpf-reduction-question__title-row">
            <h3>{question}</h3>
            <QuestionEffect amount={effectAmount} kind={effectKind} />
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
    return null
  }

  return (
    <div className="irpf-reduction-question-list wprc-work-benefits">
      <ReductionQuestion
        question="¿Tienes otros ingresos además de tu trabajo?"
        description="Por ejemplo alquileres, intereses o actividades por tu cuenta. No cuentan el salario ni los complementos del paso 1: la especie, si la hay, ya va dentro de ese salario. Si superan 6.500 €/año, no aplican algunas ventajas del trabajo."
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

function sliceQuotaDeduction(
  value: Irpf2025AdjustmentInput,
  keys: Array<keyof Irpf2025AdjustmentInput>,
  taxableIncome: number,
  taxableBase: number,
  stateQuota: number,
  regionalQuota: number,
) {
  const empty = createEmptyIrpf2025Adjustments()
  const slice = { ...empty } as Irpf2025AdjustmentInput
  for (const key of keys) {
    ;(slice as Record<string, unknown>)[key] = value[key]
  }
  return calculateGeneralDeductions2025(slice, taxableIncome, taxableBase, stateQuota, regionalQuota)
}

function sliceRefundable(
  value: Irpf2025AdjustmentInput,
  keys: Array<keyof Irpf2025AdjustmentInput>,
  annualTaxAfterOrdinaryDeductions: number,
  socialSecurityContributions: number,
) {
  const empty = createEmptyIrpf2025Adjustments()
  const slice = { ...empty } as Irpf2025AdjustmentInput
  for (const key of keys) {
    ;(slice as Record<string, unknown>)[key] = value[key]
  }
  return calculateRefundableDeductions2025(
    slice,
    annualTaxAfterOrdinaryDeductions,
    socialSecurityContributions,
  )
}

function clearInKindFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    mealCardEligible: false,
    mealCardDailyAmount: 0,
    mealCardEligibleDays: 0,
    transportCardEligible: false,
    transportCardMonthlyAmount: 0,
    transportCardEligibleMonths: 0,
    healthInsuranceEligible: false,
    healthInsuranceOrdinaryPersonsCount: 1,
    healthInsuranceDisabledPersonsCount: 0,
    healthInsurancePremiumOrdinaryPersons: 0,
    healthInsurancePremiumDisabledPersons: 0,
    companyDaycareEligible: false,
    companyDaycareAnnualAmount: 0,
    paymentOnAccountNotPassedOn: 0,
  }
}

function clearDonationFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    donationAmount: 0,
    donationLaw49Eligible: false,
  }
}

function clearRentFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    rentPaid: 0,
    rentContractBefore2015: false,
    rentPaidBefore2015: false,
    rentPriorDeductionRight: false,
    rentIsMainHome: false,
  }
}

function clearHomeFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    homeInvestmentPaid: 0,
    homeTransitionalRight: false,
    homePriorDeductionRight: false,
    homeOwnershipPercent: 100,
  }
}

function clearNewCompanyFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    newCompanyInvestment: 0,
    newCompanyRequirementsVerified: false,
  }
}

function clearMaternityFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    maternityEligible: false,
    maternityEligibleChildren: 1,
    maternityEligibleMonths: 0,
    daycareEligible: false,
    daycareTotalExpense: 0,
  }
}

function clearLargeFamilyFields(value: Irpf2025AdjustmentInput): Irpf2025AdjustmentInput {
  return {
    ...value,
    largeFamilyEligible: false,
    largeFamilyCategory: 'none',
    largeFamilyEligibleMonths: 0,
    largeFamilyEntitlementShare: 1,
    disabilityEligiblePersonMonths: 0,
    disabilityEntitlementShare: 1,
  }
}

const MEAL_CARD_DEFAULT_DAYS = 220
const TRANSPORT_DEFAULT_MONTHS = 12

function roundCents(amount: number) {
  return Math.round(Math.max(0, amount) * 100) / 100
}

function formatEuroAmount(amount: number) {
  return amount.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

// En especie la nomina unas veces trae el importe mensual y otras el anual. Pedimos el que
// tenga a mano y calculamos el otro: dentro del estado siempre se guarda el anual.
type AmountPeriod = 'monthly' | 'annual'

function PeriodAmountField({
  label,
  annualValue,
  onChangeAnnual,
  period,
  onPeriodChange,
  periodsPerYear = 12,
  help,
  hint,
  exempt,
  taxable,
  splitExplanation,
}: {
  label: string
  annualValue: number
  onChangeAnnual: (annual: number) => void
  period: AmountPeriod
  onPeriodChange: (period: AmountPeriod) => void
  periodsPerYear?: number
  help?: string
  hint?: string
  exempt?: number
  taxable?: number
  splitExplanation?: ReactNode
}) {
  const perYear = periodsPerYear > 0 ? periodsPerYear : 12
  const annual = roundCents(annualValue)
  const periodic = roundCents(annual / perYear)
  const isMonthly = period === 'monthly'

  return (
    <div className="irpf-rule-field irpf-period-field">
      <HelpLabel label={label} help={help} />
      <div className="irpf-period-field__row">
        <span className="irpf-rule-field__control">
          <input
            aria-label={`${label} (${isMonthly ? 'al mes' : 'al año'})`}
            inputMode="decimal"
            min={0}
            step={0.01}
            type="number"
            value={isMonthly ? periodic : annual}
            onChange={(event) => {
              const typed = Math.max(0, Number(event.target.value) || 0)
              onChangeAnnual(roundCents(isMonthly ? typed * perYear : typed))
            }}
          />
          <span>{isMonthly ? '€/mes' : '€/año'}</span>
        </span>
        <span className="irpf-period-toggle" role="group" aria-label={`Cómo prefieres ponerlo: ${label}`}>
          <button
            type="button"
            className={isMonthly ? 'is-selected' : ''}
            aria-pressed={isMonthly}
            onClick={() => onPeriodChange('monthly')}
          >
            Al mes
          </button>
          <button
            type="button"
            className={isMonthly ? '' : 'is-selected'}
            aria-pressed={!isMonthly}
            onClick={() => onPeriodChange('annual')}
          >
            Al año
          </button>
        </span>
      </div>
      <small className="irpf-period-field__mirror">
        {isMonthly ? 'Al año: ' : 'Al mes: '}
        <strong>{formatEuroAmount(isMonthly ? annual : periodic)}</strong>
        {perYear !== 12 ? ` (repartido en ${perYear} meses)` : null}
      </small>
      {annual > 0 && splitExplanation ? splitExplanation : null}
      {annual > 0 && !splitExplanation && exempt !== undefined ? (
        <small className="irpf-period-field__split">
          Exento <strong>{formatEuroAmount(roundCents(exempt))}</strong>
          {taxable && taxable > 0 ? ` · tributa ${formatEuroAmount(roundCents(taxable))}` : null}
        </small>
      ) : null}
      {hint ? <small>{hint}</small> : null}
    </div>
  )
}

type InKindPeriodKey = 'meal' | 'transport' | 'health' | 'daycare'

const HEALTH_PEOPLE_MAX = 20

function HealthExemptSplit({
  ordinaryCount,
  disabledCount,
  taxable,
}: {
  ordinaryCount: number
  disabledCount: number
  taxable: number
}) {
  const parts: string[] = []
  if (ordinaryCount > 0) {
    parts.push(
      `${formatEuroAmount(HEALTH_INSURANCE_EXEMPT_PER_PERSON_2025)} /persona × ${ordinaryCount}`,
    )
  }
  if (disabledCount > 0) {
    parts.push(
      `${formatEuroAmount(HEALTH_INSURANCE_EXEMPT_PER_DISABLED_PERSON_2025)} /persona × ${disabledCount}`,
    )
  }
  const cap =
    ordinaryCount * HEALTH_INSURANCE_EXEMPT_PER_PERSON_2025
    + disabledCount * HEALTH_INSURANCE_EXEMPT_PER_DISABLED_PERSON_2025
  const formula = parts.length > 0
    ? `${parts.join(' + ')} = ${formatEuroAmount(cap)}`
    : formatEuroAmount(0)
  const taxableAmount = roundCents(taxable)

  return (
    <small className="irpf-period-field__split">
      Exento {formula}
      {taxableAmount > 0 ? <> · tributa <strong>{formatEuroAmount(taxableAmount)}</strong></> : null}
    </small>
  )
}

function InKindBenefitQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  const [periods, setPeriods] = useState<Record<InKindPeriodKey, AmountPeriod>>({
    meal: 'monthly',
    transport: 'monthly',
    health: 'annual',
    daycare: 'monthly',
  })
  const setPeriod = (key: InKindPeriodKey, next: AmountPeriod) => {
    setPeriods((current) => ({ ...current, [key]: next }))
  }
  const benefits = calculateInKindBenefits2025(value)
  const mealDays = value.mealCardEligibleDays > 0 ? value.mealCardEligibleDays : MEAL_CARD_DEFAULT_DAYS
  const transportMonths = value.transportCardEligibleMonths > 0
    ? value.transportCardEligibleMonths
    : TRANSPORT_DEFAULT_MONTHS
  const mealAnnual = roundCents(Math.max(0, value.mealCardDailyAmount) * Math.max(0, value.mealCardEligibleDays))
  const transportAnnual = roundCents(
    Math.max(0, value.transportCardMonthlyAmount) * Math.max(0, value.transportCardEligibleMonths),
  )
  const healthPremium = roundCents(
    Math.max(0, value.healthInsurancePremiumOrdinaryPersons)
    + Math.max(0, value.healthInsurancePremiumDisabledPersons),
  )
  const coveredPeople = Math.max(
    0,
    Math.trunc(value.healthInsuranceOrdinaryPersonsCount)
    + Math.trunc(value.healthInsuranceDisabledPersonsCount),
  )
  const disabledPeople = Math.max(0, Math.trunc(value.healthInsuranceDisabledPersonsCount))
  const ordinaryPeople = Math.max(0, coveredPeople - disabledPeople)

  const setMealAnnual = (annual: number, days = mealDays) => {
    const safeDays = days > 0 ? days : MEAL_CARD_DEFAULT_DAYS
    const amount = roundCents(annual)
    onChange({
      ...value,
      mealCardEligible: amount > 0,
      mealCardEligibleDays: amount > 0 ? safeDays : 0,
      mealCardDailyAmount: amount > 0 ? amount / safeDays : 0,
    })
  }

  const setTransportAnnual = (annual: number, months = transportMonths) => {
    const safeMonths = months > 0 ? months : TRANSPORT_DEFAULT_MONTHS
    const amount = roundCents(annual)
    onChange({
      ...value,
      transportCardEligible: amount > 0,
      transportCardEligibleMonths: amount > 0 ? safeMonths : 0,
      transportCardMonthlyAmount: amount > 0 ? amount / safeMonths : 0,
    })
  }

  const setHealthCoverage = (premium: number, nextCovered: number, nextDisabled: number) => {
    const amount = roundCents(premium)
    const covered = Math.min(
      HEALTH_PEOPLE_MAX,
      Math.max(amount > 0 ? 1 : 0, Math.trunc(nextCovered) || 0),
    )
    const disabled = Math.min(covered, Math.max(0, Math.trunc(nextDisabled) || 0))
    onChange({
      ...value,
      healthInsuranceEligible: amount > 0,
      healthInsurancePremiumOrdinaryPersons: amount,
      healthInsurancePremiumDisabledPersons: 0,
      healthInsuranceOrdinaryPersonsCount: covered - disabled,
      healthInsuranceDisabledPersonsCount: disabled,
    })
  }

  return (
    <div className="irpf-marital-subflow">
      <p className="irpf-marital-note irpf-marital-note--muted">
        Escribe cuánto te paga la empresa en cada beneficio. Ponlo como lo tengas a mano, al mes o al año:
        la otra cifra se calcula sola. Lo que no tengas, déjalo en 0 €.
      </p>
      <div className="irpf-rule-grid">
        <PeriodAmountField
          label="Ticket restaurante o tarjeta comida"
          annualValue={mealAnnual}
          onChangeAnnual={(amount) => setMealAnnual(amount)}
          period={periods.meal}
          onPeriodChange={(next) => setPeriod('meal', next)}
          exempt={benefits.breakdown.mealExempt}
          taxable={benefits.breakdown.mealTaxable}
          help="Lo que te cargan en cheques o tarjeta de comida. Hacienda exime hasta 11 € por día trabajado; con los 220 días por defecto, hasta 2.420 € al año."
          hint="Si no lo tienes, déjalo en 0 €."
        />
        <PeriodAmountField
          label="Ticket transporte o abono"
          annualValue={transportAnnual}
          onChangeAnnual={(amount) => setTransportAnnual(amount)}
          period={periods.transport}
          onPeriodChange={(next) => setPeriod('transport', next)}
          periodsPerYear={transportMonths}
          exempt={benefits.breakdown.transportExempt}
          taxable={benefits.breakdown.transportTaxable}
          help="Tarjeta o abono de transporte público que paga la empresa. La exención tiene tope de 136,36 € al mes y 1.500 € al año."
          hint="Si no lo tienes, déjalo en 0 €."
        />
        <div className="irpf-health-block">
          <PeriodAmountField
            label="Seguro médico pagado por la empresa"
            annualValue={healthPremium}
            onChangeAnnual={(amount) => setHealthCoverage(amount, coveredPeople, disabledPeople)}
            period={periods.health}
            onPeriodChange={(next) => setPeriod('health', next)}
            exempt={benefits.breakdown.healthExempt}
            taxable={benefits.breakdown.healthTaxable}
            splitExplanation={healthPremium > 0 ? (
              <HealthExemptSplit
                ordinaryCount={ordinaryPeople}
                disabledCount={disabledPeople}
                taxable={benefits.breakdown.healthTaxable}
              />
            ) : null}
            help="Prima que paga la empresa por ti y por tu familia. La exención llega a 500 € por persona al año, o 1.500 € si tiene discapacidad reconocida."
            hint="Si no lo tienes, déjalo en 0 €."
          />
          <div className="irpf-health-block__people">
            <CountField
              label="Personas cubiertas por el seguro"
              value={coveredPeople}
              onChange={(count) => setHealthCoverage(healthPremium, count, disabledPeople)}
              max={HEALTH_PEOPLE_MAX}
              unit="uds."
              help="Inclúyete si estás cubierto. Si hay prima, tiene que haber al menos una persona."
              hint={healthPremium > 0 ? 'Mínimo 1 persona si el seguro no es 0 €.' : undefined}
            />
            <CountField
              label="Personas con discapacidad"
              value={disabledPeople}
              onChange={(count) => setHealthCoverage(healthPremium, coveredPeople, count)}
              max={HEALTH_PEOPLE_MAX}
              unit="uds."
              help="De las cubiertas, cuántas tienen discapacidad reconocida. El tope de exención sube a 1.500 € por cada una."
              hint="No puede ser más que las personas cubiertas."
            />
          </div>
        </div>
        <PeriodAmountField
          label="Guardería pagada por la empresa"
          annualValue={value.companyDaycareAnnualAmount}
          onChangeAnnual={(amount) => onChange({
            ...value,
            companyDaycareAnnualAmount: amount,
            companyDaycareEligible: amount > 0,
          })}
          period={periods.daycare}
          onPeriodChange={(next) => setPeriod('daycare', next)}
          exempt={benefits.breakdown.daycareExempt}
          taxable={benefits.breakdown.daycareTaxable}
          help="Solo si la paga la empresa directamente, no un plus en metálico. Si cumple los requisitos, queda exenta."
          hint="Si no lo tienes, déjalo en 0 €."
        />
      </div>
      {benefits.declaredBenefitsTotal > 0 ? (
        <p className="irpf-inkind-total">
          <span>Total que te da la empresa en especie</span>
          <strong>
            {formatEuroAmount(roundCents(benefits.declaredBenefitsTotal))} al año
          </strong>
          <small>
            {formatEuroAmount(roundCents(benefits.declaredBenefitsTotal / 12))} al mes · queda exento{' '}
            {formatEuroAmount(roundCents(benefits.exemptAmount))}
            {benefits.taxableAmount > 0
              ? ` y tributan ${formatEuroAmount(roundCents(benefits.taxableAmount))}`
              : null}
          </small>
        </p>
      ) : null}
    </div>
  )
}

function DonationQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  return (
    <div className="irpf-marital-subflow">
      <NumberField
        label="¿Cuánto has donado?"
        value={value.donationAmount}
        onChange={(amount) => onChange({ ...value, donationAmount: amount, donationLaw49Eligible: true })}
        help="Suma de todo lo que hayas donado durante el año. Los primeros 250 € deducen el 80 %; el resto, el 40 %."
      />
    </div>
  )
}

function RentQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  return (
    <div className="irpf-marital-subflow">
      <NumberField
        label="¿Cuánto has pagado de alquiler?"
        value={value.rentPaid}
        onChange={(amount) => onChange({ ...value, rentPaid: amount })}
        help="Lo que hayas pagado en todo el año por tu vivienda habitual."
      />
    </div>
  )
}

function HomeQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  return (
    <div className="irpf-marital-subflow">
      <NumberField
        label="¿Cuánto has pagado este año por la vivienda?"
        value={value.homeInvestmentPaid}
        onChange={(amount) => onChange({ ...value, homeInvestmentPaid: amount })}
        help="Las cuotas de la hipoteca del año, intereses incluidos."
      />
      <NumberField
        label="¿Qué parte de la vivienda es tuya?"
        value={value.homeOwnershipPercent}
        onChange={(amount) => onChange({ ...value, homeOwnershipPercent: Math.min(100, amount) })}
        max={100}
        unit="%"
        help="Si la compraste a medias con otra persona, suele ser 50 %."
      />
    </div>
  )
}

function NewCompanyQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  return (
    <div className="irpf-marital-subflow">
      <NumberField
        label="¿Cuánto invertiste?"
        value={value.newCompanyInvestment}
        onChange={(amount) => onChange({ ...value, newCompanyInvestment: amount })}
        help="Se deduce la mitad de lo invertido, hasta 100.000 € al año."
      />
    </div>
  )
}

function MaternityQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  const children = Math.max(1, Math.trunc(value.maternityEligibleChildren))
  // Por dentro la deduccion cuenta meses-hijo, pero eso no se le pregunta a
  // nadie: se piden meses normales y se multiplican por los hijos.
  const months = Math.min(12, Math.round(value.maternityEligibleMonths / children) || 0)

  return (
    <div className="irpf-marital-subflow">
      <CountField
        label="¿Cuántos hijos menores de 3 años tienes?"
        value={value.maternityEligibleChildren}
        onChange={(count) => {
          const nextChildren = Math.max(1, count)
          onChange({
            ...value,
            maternityEligible: true,
            maternityEligibleChildren: nextChildren,
            maternityEligibleMonths: months * nextChildren,
          })
        }}
        max={20}
        unit="uds."
        help="Cada hijo puede generar hasta 1.200 € al año."
      />
      <CountField
        label="¿Cuántos meses del año has estado trabajando?"
        value={months}
        onChange={(count) => onChange({
          ...value,
          maternityEligible: true,
          maternityEligibleMonths: Math.min(12, count) * children,
        })}
        max={12}
        help="Son 100 € por hijo y mes trabajado. Si has trabajado todo el año, son 12."
      />
      <div className="irpf-marital-subask">
        <p>¿Pagas guardería por esos hijos?</p>
        <small>Puede sumar hasta 1.000 € más al año.</small>
        <YesNoChips
          label="Pago de guardería"
          value={value.daycareEligible ? 'yes' : 'no'}
          onChange={(next) => {
            if (next === 'no') {
              onChange({ ...value, daycareEligible: false, daycareTotalExpense: 0 })
              return
            }
            onChange({ ...value, maternityEligible: true, daycareEligible: true })
          }}
        />
      </div>
      {value.daycareEligible ? (
        <NumberField
          label="¿Cuánto has pagado de guardería en el año?"
          value={value.daycareTotalExpense}
          onChange={(amount) => onChange({ ...value, daycareTotalExpense: amount })}
          help="Lo que has pagado tú, sin contar becas ni la parte que pague tu empresa."
        />
      ) : null}
    </div>
  )
}

function LargeFamilyQuestions({
  value,
  onChange,
}: {
  value: Irpf2025AdjustmentInput
  onChange: (value: Irpf2025AdjustmentInput) => void
}) {
  const hasFamily = value.largeFamilyEligible || value.largeFamilyCategory !== 'none'
  const hasDisability = value.disabilityEligiblePersonMonths > 0

  return (
    <div className="irpf-marital-subflow">
      <div className="irpf-marital-subask">
        <p>¿Tienes el título de familia numerosa en vigor?</p>
        <YesNoChips
          label="Título de familia numerosa vigente"
          value={hasFamily ? 'yes' : 'no'}
          onChange={(next) => {
            if (next === 'no') {
              onChange({
                ...value,
                largeFamilyEligible: false,
                largeFamilyCategory: 'none',
                largeFamilyEligibleMonths: 0,
                largeFamilyEntitlementShare: 1,
              })
              return
            }
            onChange({
              ...value,
              largeFamilyEligible: true,
              largeFamilyCategory: 'general',
              largeFamilyEligibleMonths: 12,
            })
          }}
        />
      </div>
      {hasFamily ? (
        <>
          <SelectField
            label="¿General o especial?"
            value={value.largeFamilyCategory === 'none' ? 'general' : value.largeFamilyCategory}
            onChange={(next) => onChange({
              ...value,
              largeFamilyEligible: true,
              largeFamilyCategory: next as Irpf2025AdjustmentInput['largeFamilyCategory'],
              // El titulo se da por vigente el ano entero; no se pregunta por meses.
              largeFamilyEligibleMonths: 12,
            })}
            help="Viene escrito en el título. General: 1.200 € al año. Especial: 2.400 €."
          >
            <option value="general">General</option>
            <option value="special">Especial</option>
          </SelectField>
          <SelectField
            label="¿Lo compartes con la otra persona progenitora?"
            value={String(value.largeFamilyEntitlementShare)}
            onChange={(next) => onChange({ ...value, largeFamilyEntitlementShare: Number(next) })}
          >
            <option value="1">No, me corresponde entero</option>
            <option value="0.5">Sí, a medias</option>
          </SelectField>
        </>
      ) : null}

      <div className="irpf-marital-subask">
        <p>¿Tienes a cargo una persona con discapacidad?</p>
        <small>Hijo, padre, madre o cónyuge con discapacidad que conviva contigo o dependa de ti.</small>
        <YesNoChips
          label="Personas a cargo con discapacidad"
          value={hasDisability ? 'yes' : 'no'}
          onChange={(next) => {
            if (next === 'no') {
              onChange({
                ...value,
                disabilityEligiblePersonMonths: 0,
                disabilityEntitlementShare: 1,
              })
              return
            }
            onChange({ ...value, disabilityEligiblePersonMonths: 12 })
          }}
        />
      </div>
      {hasDisability ? (
        <>
          <CountField
            label="¿Cuántos meses las has tenido a cargo?"
            value={value.disabilityEligiblePersonMonths}
            onChange={(count) => onChange({ ...value, disabilityEligiblePersonMonths: count })}
            max={120}
            help="Son 100 € por persona y mes. Con dos personas todo el año, 24."
            hint="Si es una persona durante todo el año, son 12."
          />
          <SelectField
            label="¿Lo compartes con alguien más?"
            value={String(value.disabilityEntitlementShare)}
            onChange={(next) => onChange({ ...value, disabilityEntitlementShare: Number(next) })}
          >
            <option value="1">No, me corresponde entero</option>
            <option value="0.5">Sí, a medias</option>
          </SelectField>
        </>
      ) : null}
    </div>
  )
}

export function Irpf2025StructuredAdjustmentsForm({
  focus,
  reductionsGroup = 'all',
  deductionsGroup = 'all',
  value,
  declaredGrossWorkIncome = 0,
  netWorkIncome = 0,
  previewBaseAvailable = 0,
  previewTaxableIncome = 0,
  stateIntegralQuota = 0,
  regionalIntegralQuota = 0,
  socialSecurityContributions = 0,
  onChange,
}: Props) {
  const update = <Key extends keyof Irpf2025AdjustmentInput>(key: Key, nextValue: Irpf2025AdjustmentInput[Key]) => {
    onChange({ ...value, [key]: nextValue })
  }
  const benefits = calculateInKindBenefits2025(value)
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
  const taxableIncome = previewTaxableIncome > 0 ? previewTaxableIncome : available
  const taxableBase = previewBaseAvailable > 0 ? previewBaseAvailable : available
  const stateQuota = Math.max(0, stateIntegralQuota)
  const regionalQuota = Math.max(0, regionalIntegralQuota)
  const donationEffect = sliceQuotaDeduction(
    value,
    ['donationAmount', 'donationLaw49Eligible'],
    taxableIncome,
    taxableBase,
    stateQuota,
    regionalQuota,
  ).totalApplied
  const rentEffect = sliceQuotaDeduction(
    value,
    ['rentPaid', 'rentContractBefore2015', 'rentPaidBefore2015', 'rentPriorDeductionRight', 'rentIsMainHome'],
    taxableIncome,
    taxableBase,
    stateQuota,
    regionalQuota,
  ).totalApplied
  const homeEffect = sliceQuotaDeduction(
    value,
    ['homeInvestmentPaid', 'homeTransitionalRight', 'homePriorDeductionRight', 'homeOwnershipPercent'],
    taxableIncome,
    taxableBase,
    stateQuota,
    regionalQuota,
  ).totalApplied
  const newCompanyEffect = sliceQuotaDeduction(
    value,
    ['newCompanyInvestment', 'newCompanyRequirementsVerified'],
    taxableIncome,
    taxableBase,
    stateQuota,
    regionalQuota,
  ).totalApplied
  const maternityKeys: Array<keyof Irpf2025AdjustmentInput> = [
    'maternityEligible',
    'maternityEligibleChildren',
    'maternityEligibleMonths',
    'daycareEligible',
    'daycareTotalExpense',
    'companyDaycareAnnualAmount',
  ]
  const largeFamilyKeys: Array<keyof Irpf2025AdjustmentInput> = [
    'largeFamilyEligible',
    'largeFamilyCategory',
    'largeFamilyEligibleMonths',
    'largeFamilyEntitlementShare',
    'disabilityEligiblePersonMonths',
    'disabilityEntitlementShare',
  ]
  const maternitySlice = sliceRefundable(value, maternityKeys, 0, socialSecurityContributions)
  const largeFamilySlice = sliceRefundable(value, largeFamilyKeys, 0, socialSecurityContributions)
  const maternityEffect = maternitySlice.maternityGenerated + maternitySlice.daycareGenerated
  const largeFamilyEffect = largeFamilySlice.largeFamilyGenerated + largeFamilySlice.disabilityGenerated
  const inKindInitiallyRelevant = value.mealCardEligible
    || value.mealCardDailyAmount > 0
    || value.transportCardEligible
    || value.transportCardMonthlyAmount > 0
    || value.healthInsuranceEligible
    || value.healthInsurancePremiumOrdinaryPersons > 0
    || value.healthInsurancePremiumDisabledPersons > 0
    || value.companyDaycareEligible
    || value.companyDaycareAnnualAmount > 0
    || value.paymentOnAccountNotPassedOn > 0
  const showInKind = deductionsGroup === 'all' || deductionsGroup === 'in-kind'
  const showQuota = deductionsGroup === 'all' || deductionsGroup === 'quota'
  const showRefundable = deductionsGroup === 'all' || deductionsGroup === 'refundable'

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
          <ReductionQuestion question="¿Pagas cuota de un sindicato?" description="Indica solo lo que hayas pagado tú este año." initiallyRelevant={value.unionDues > 0} effectAmount={workExpenses.unionDues} effectKind="expense" onNo={() => update('unionDues', 0)}>
            <NumberField label="¿Cuánto has pagado este año?" value={value.unionDues} onChange={(amount) => update('unionDues', amount)} />
          </ReductionQuestion>
          <ReductionQuestion
            question="¿Pagas un colegio profesional donde es obligatorio estar colegiado?"
            description="Solo si tu profesión exige colegiarse para trabajar, como médico, abogado, farmacéutico o arquitecto."
            initiallyRelevant={value.professionalDues > 0 || value.professionalMembershipMandatory}
            effectAmount={workExpenses.professionalDues}
            effectKind="expense"
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
          <ReductionQuestion question="¿Has pagado un abogado por un problema con tu trabajo?" description="Solo por un conflicto laboral con tu empresa." initiallyRelevant={value.legalDefenseCosts > 0} effectAmount={workExpenses.legalDefense} effectKind="expense" onNo={() => update('legalDefenseCosts', 0)}>
            <NumberField label="¿Cuánto has pagado este año?" value={value.legalDefenseCosts} onChange={(amount) => update('legalDefenseCosts', amount)} hint="El máximo aplicable es 300 EUR." />
          </ReductionQuestion>
          <ReductionQuestion question="¿Te mudaste a otro municipio para empezar un trabajo?" description="Aplica si estabas en paro, aceptaste un empleo en otro municipio y cambiaste de residencia." initiallyRelevant={value.wasRegisteredJobseeker || value.acceptedJobOtherMunicipality || value.movedResidence} effectAmount={mobilityEffect} effectKind="expense" onNo={() => onChange(clearGeographicMobilityFields(value))}>
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
    <section className="irpf-rule-form" aria-label="Datos para deducciones IRPF 2025">
      <div className="irpf-reduction-question-list">
        {showInKind ? (
          <ReductionQuestion
            question="¿Tu empresa te paga comida, transporte, seguro o guardería?"
            description="El salario del paso 1 ya los incluye si los tienes. Aquí solo indica a qué beneficio va cada parte: ticket restaurante, transporte, seguro médico o guardería. Míralo en la nómina o en el certificado de retenciones."
            initiallyRelevant={inKindInitiallyRelevant}
            effectAmount={benefits.exemptAmount}
            effectKind="exempt"
            onNo={() => onChange(clearInKindFields(value))}
          >
            <InKindBenefitQuestions value={value} onChange={onChange} />
          </ReductionQuestion>
        ) : null}
        {showQuota ? (
          <>
            <ReductionQuestion
              question="¿Has donado a una ONG o fundación en 2025?"
              description="Cuenta si te dieron un certificado de la donación: es lo que dan las ONG, fundaciones y entidades declaradas de utilidad pública."
              initiallyRelevant={value.donationAmount > 0 || value.donationLaw49Eligible}
              effectAmount={donationEffect}
              effectKind="deduction"
              onYes={() => {
                if (!value.donationLaw49Eligible) onChange({ ...value, donationLaw49Eligible: true })
              }}
              onNo={() => onChange(clearDonationFields(value))}
            >
              <DonationQuestions value={value} onChange={onChange} />
            </ReductionQuestion>
            <ReductionQuestion
              question="¿Vives de alquiler desde antes de 2015 y ya te lo deducías entonces?"
              description="La deducción por alquiler desapareció para los contratos nuevos. Solo sigue viva si es el mismo alquiler y ya te lo restabas en aquellas declaraciones."
              initiallyRelevant={value.rentPaid > 0 || value.rentContractBefore2015}
              effectAmount={rentEffect}
              effectKind="deduction"
              onYes={() => {
                if (!value.rentContractBefore2015) {
                  onChange({
                    ...value,
                    rentContractBefore2015: true,
                    rentPaidBefore2015: true,
                    rentPriorDeductionRight: true,
                    rentIsMainHome: true,
                  })
                }
              }}
              onNo={() => onChange(clearRentFields(value))}
            >
              <RentQuestions value={value} onChange={onChange} />
            </ReductionQuestion>
            <ReductionQuestion
              question="¿Compraste tu vivienda antes de 2013 y ya te la deducías entonces?"
              description="Esta deducción se cerró en 2013. Solo sigue viva si es la misma vivienda y ya te la restabas en la declaración de 2012 o antes."
              initiallyRelevant={value.homeInvestmentPaid > 0 || value.homeTransitionalRight}
              effectAmount={homeEffect}
              effectKind="deduction"
              onYes={() => {
                if (!value.homeTransitionalRight) {
                  onChange({ ...value, homeTransitionalRight: true, homePriorDeductionRight: true })
                }
              }}
              onNo={() => onChange(clearHomeFields(value))}
            >
              <HomeQuestions value={value} onChange={onChange} />
            </ReductionQuestion>
            <ReductionQuestion
              question="¿Invertiste en una empresa recién creada y te dieron su certificado?"
              description="La empresa tiene que darte un certificado conforme cumple los requisitos. No vale comprar acciones en bolsa."
              initiallyRelevant={value.newCompanyInvestment > 0 || value.newCompanyRequirementsVerified}
              effectAmount={newCompanyEffect}
              effectKind="deduction"
              onYes={() => {
                if (!value.newCompanyRequirementsVerified) {
                  onChange({ ...value, newCompanyRequirementsVerified: true })
                }
              }}
              onNo={() => onChange(clearNewCompanyFields(value))}
            >
              <NewCompanyQuestions value={value} onChange={onChange} />
            </ReductionQuestion>
          </>
        ) : null}
        {showRefundable ? (
          <>
            <ReductionQuestion
              question="¿Tienes hijos menores de 3 años?"
              description="Si trabajas y cotizas, cada hijo menor de 3 años puede darte hasta 1.200 € al año, y más si pagas guardería."
              initiallyRelevant={value.maternityEligible || value.daycareEligible}
              effectAmount={maternityEffect}
              effectKind="deduction"
              onYes={() => {
                if (!value.maternityEligible) onChange({ ...value, maternityEligible: true })
              }}
              onNo={() => onChange(clearMaternityFields(value))}
            >
              <MaternityQuestions value={value} onChange={onChange} />
            </ReductionQuestion>
            <ReductionQuestion
              question="¿Familia numerosa o personas a cargo con discapacidad?"
              description="Te las pagan aunque no te salga nada a pagar por IRPF."
              initiallyRelevant={value.largeFamilyEligible || value.disabilityEligiblePersonMonths > 0}
              effectAmount={largeFamilyEffect}
              effectKind="deduction"
              onNo={() => onChange(clearLargeFamilyFields(value))}
            >
              <LargeFamilyQuestions value={value} onChange={onChange} />
            </ReductionQuestion>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default Irpf2025StructuredAdjustmentsForm
