import { Baby, BriefcaseBusiness, HeartHandshake, Landmark, ReceiptText, ShieldCheck, UsersRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  calculateInKindBenefits2025,
} from '../fiscal-worker-dashboard/irpf2025Adjustments'
import type { Irpf2025AdjustmentInput } from '../fiscal-worker-dashboard/irpf2025Adjustments'
import { InfoButton } from '../ui/InfoButton'
import './Irpf2025StructuredAdjustmentsForm.css'

type Props = {
  focus: 'reductions' | 'deductions-benefits'
  value: Irpf2025AdjustmentInput
  declaredInKindSalary?: number
  onChange: (value: Irpf2025AdjustmentInput) => void
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
  'Aportante, beneficiario y patrimonio cumplen requisitos': 'Confirmacion formal para no aplicar una reduccion de patrimonio protegido sin base documental suficiente.',
  'Reduccion autonomica calculada': 'Importe de una reduccion propia de tu comunidad autonoma ya calculada fuera de esta pantalla.',
  'Codigo o nombre de la reduccion autonomica': 'Nombre identificable de la regla autonomica usada, para que el calculo sea trazable.',
  'Fuente oficial de la reduccion': 'Enlace a la norma, manual o fuente oficial que justifica la reduccion autonomica.',
  'Base, porcentaje y limite utilizados': 'Resumen de la formula aplicada: sobre que base se calcula, porcentaje usado y limite maximo.',
  'Reduccion autonomica documentada y verificada': 'Solo al marcar esto la calculadora trata la reduccion como utilizable. Evita mezclar importes no comprobados.',
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
  'Deduccion autonomica ya calculada': 'Importe de una deduccion propia de tu comunidad autonoma calculada aparte.',
  'Codigo o nombre de la deduccion autonomica': 'Nombre identificable de la deduccion autonomica para poder auditar el calculo.',
  'Fuente oficial de la deduccion': 'Enlace oficial que justifica la regla autonomica usada.',
  'Regla autonomica, fuente y requisitos verificados': 'Solo al marcarlo se considera que la deduccion autonomica es suficientemente trazable.',
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

function TextField({ label, value, onChange, help, hint, type = 'text' }: {
  label: string
  value: string
  onChange: (value: string) => void
  help?: string
  hint?: string
  type?: 'text' | 'url'
}) {
  return (
    <label className="irpf-rule-field">
      <HelpLabel label={label} help={help} />
      <input aria-label={label} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
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

function ReductionQuestion({ question, description, children, initiallyRelevant = false, onNo }: {
  question: string
  description: string
  children: ReactNode
  initiallyRelevant?: boolean
  onNo: () => void
}) {
  const [answer, setAnswer] = useState<'unanswered' | 'yes' | 'no'>(() => initiallyRelevant ? 'yes' : 'unanswered')
  const chooseNo = () => {
    onNo()
    setAnswer('no')
  }

  return (
    <section className={`irpf-reduction-question is-${answer}`} aria-label={question}>
      <div className="irpf-reduction-question__prompt">
        <span aria-hidden="true">?</span>
        <div>
          <h3>{question}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="irpf-reduction-question__choices" role="group" aria-label={`Respuesta: ${question}`}>
        <button className={answer === 'yes' ? 'is-selected' : ''} type="button" onClick={() => setAnswer('yes')}>Sí, me aplica</button>
        <button className={answer === 'no' ? 'is-selected' : ''} type="button" onClick={chooseNo}>No, continuar</button>
      </div>
      {answer === 'yes' ? <div className="irpf-reduction-question__body">{children}</div> : null}
      {answer === 'no' ? <p className="irpf-reduction-question__skip">Perfecto, no aplicaremos nada de este apartado. Puedes cambiar la respuesta cuando quieras.</p> : null}
    </section>
  )
}

export function Irpf2025StructuredAdjustmentsForm({ focus, value, declaredInKindSalary = 0, onChange }: Props) {
  const update = <Key extends keyof Irpf2025AdjustmentInput>(key: Key, nextValue: Irpf2025AdjustmentInput[Key]) => {
    onChange({ ...value, [key]: nextValue })
  }
  const benefits = calculateInKindBenefits2025(value)
  const benefitsMismatch = benefits.declaredBenefitsTotal > declaredInKindSalary

  if (focus === 'reductions') {
    return (
      <section className="irpf-rule-form" aria-label="Datos exactos para reducciones IRPF 2025">
        <div className="irpf-reduction-question-list">
          <ReductionQuestion question="¿Tienes ingresos fuera de tu nómina?" description="Por ejemplo, alquileres, intereses, actividades o ganancias." initiallyRelevant={value.otherIncomeKnown || value.otherNonExemptNonWorkIncome > 0} onNo={() => onChange({ ...value, otherIncomeKnown: false, otherNonExemptNonWorkIncome: 0 })}>
            <div className="irpf-rule-grid"><CheckField label="Sé si tengo esos otros ingresos" checked={value.otherIncomeKnown} onChange={(checked) => update('otherIncomeKnown', checked)} hint="Es necesario para aplicar algunos límites." /><NumberField label="¿Cuánto suman al año?" value={value.otherNonExemptNonWorkIncome} onChange={(amount) => update('otherNonExemptNonWorkIncome', amount)} unit="EUR" /></div>
          </ReductionQuestion>
          <ReductionQuestion question="¿Pagas cuota de un sindicato?" description="Indica solo lo que hayas pagado tú este año." initiallyRelevant={value.unionDues > 0} onNo={() => update('unionDues', 0)}>
            <NumberField label="¿Cuánto has pagado este año?" value={value.unionDues} onChange={(amount) => update('unionDues', amount)} />
          </ReductionQuestion>
          <ReductionQuestion question="¿Pagas un colegio profesional obligatorio para trabajar?" description="Por ejemplo, si tu profesión exige estar colegiado." initiallyRelevant={value.professionalDues > 0 || value.professionalMembershipMandatory} onNo={() => onChange({ ...value, professionalDues: 0, professionalMembershipMandatory: false })}>
            <div className="irpf-rule-grid"><NumberField label="¿Cuánto has pagado este año?" value={value.professionalDues} onChange={(amount) => update('professionalDues', amount)} hint="El máximo aplicable es 500 EUR." /><CheckField label="Estar colegiado es obligatorio para ejercer" checked={value.professionalMembershipMandatory} onChange={(checked) => update('professionalMembershipMandatory', checked)} /></div>
          </ReductionQuestion>
          <ReductionQuestion question="¿Has pagado un abogado por un problema con tu trabajo?" description="Solo por un conflicto laboral con tu empresa." initiallyRelevant={value.legalDefenseCosts > 0} onNo={() => update('legalDefenseCosts', 0)}>
            <NumberField label="¿Cuánto has pagado este año?" value={value.legalDefenseCosts} onChange={(amount) => update('legalDefenseCosts', amount)} hint="El máximo aplicable es 300 EUR." />
          </ReductionQuestion>
          <ReductionQuestion question="¿Te mudaste a otro municipio para empezar un trabajo?" description="Debe haber sido un traslado real de residencia después de estar inscrito como demandante de empleo." initiallyRelevant={value.wasRegisteredJobseeker || value.acceptedJobOtherMunicipality || value.movedResidence} onNo={() => onChange({ ...value, wasRegisteredJobseeker: false, acceptedJobOtherMunicipality: false, movedResidence: false, moveTaxYear: 0, newJobIntegralIncome: 0, newJobSpecificExpenses: 0 })}>
            <div className="irpf-rule-grid"><CheckField label="Estaba inscrito como demandante de empleo" checked={value.wasRegisteredJobseeker} onChange={(checked) => update('wasRegisteredJobseeker', checked)} /><CheckField label="Acepté un empleo en otro municipio" checked={value.acceptedJobOtherMunicipality} onChange={(checked) => update('acceptedJobOtherMunicipality', checked)} /><CheckField label="Me mudé de residencia por ese empleo" checked={value.movedResidence} onChange={(checked) => update('movedResidence', checked)} /><CountField label="¿En qué año te mudaste?" value={value.moveTaxYear} onChange={(year) => update('moveTaxYear', year)} max={2025} unit="año" /><NumberField label="Salario bruto de ese nuevo empleo" value={value.newJobIntegralIncome} onChange={(amount) => update('newJobIntegralIncome', amount)} /><NumberField label="Gastos específicos de ese nuevo empleo" value={value.newJobSpecificExpenses} onChange={(amount) => update('newJobSpecificExpenses', amount)} /></div>
          </ReductionQuestion>
          <ReductionQuestion question="¿Pagas tú un plan de pensiones o una mutualidad profesional?" description="Incluye solo tus aportaciones personales." initiallyRelevant={value.personalPensionContribution > 0 || value.mutualityContribution > 0} onNo={() => onChange({ ...value, personalPensionContribution: 0, mutualityContribution: 0 })}>
            <div className="irpf-rule-grid"><NumberField label="¿Cuánto has aportado a tu plan?" value={value.personalPensionContribution} onChange={(amount) => update('personalPensionContribution', amount)} /><NumberField label="¿Cuánto has aportado a una mutualidad?" value={value.mutualityContribution} onChange={(amount) => update('mutualityContribution', amount)} /></div>
          </ReductionQuestion>
          <ReductionQuestion question="¿Tu empresa aporta a un plan de pensiones para ti?" description="Míralo en tu nómina, certificado de la empresa o entidad del plan." initiallyRelevant={value.employerPensionContribution > 0 || value.workerEmploymentPensionContribution > 0} onNo={() => onChange({ ...value, employerPensionContribution: 0, workerEmploymentPensionContribution: 0, grossIncomeFromPensionEmployer: 0 })}>
            <div className="irpf-rule-grid"><NumberField label="Aportación anual de tu empresa" value={value.employerPensionContribution} onChange={(amount) => update('employerPensionContribution', amount)} /><NumberField label="Tu aportación al mismo plan" value={value.workerEmploymentPensionContribution} onChange={(amount) => update('workerEmploymentPensionContribution', amount)} /><NumberField label="Tu salario bruto en esa empresa" value={value.grossIncomeFromPensionEmployer} onChange={(amount) => update('grossIncomeFromPensionEmployer', amount)} /></div>
          </ReductionQuestion>
          <ReductionQuestion question="¿Has aportado al plan de pensiones de tu pareja?" description="Solo se aplica en ciertos casos de ingresos bajos de la pareja." initiallyRelevant={value.spousePensionContribution > 0} onNo={() => onChange({ ...value, spousePensionContribution: 0, spouseNetWorkAndBusinessIncome: 0, spousePensionEligible: false })}>
            <div className="irpf-rule-grid"><NumberField label="¿Cuánto has aportado?" value={value.spousePensionContribution} onChange={(amount) => update('spousePensionContribution', amount)} /><NumberField label="Ingresos netos anuales de tu pareja" value={value.spouseNetWorkAndBusinessIncome} onChange={(amount) => update('spouseNetWorkAndBusinessIncome', amount)} /><CheckField label="El plan cumple los requisitos" checked={value.spousePensionEligible} onChange={(checked) => update('spousePensionEligible', checked)} /></div>
          </ReductionQuestion>
          <ReductionQuestion question="¿Pagas una pensión a tu expareja?" description="Debe estar fijada por sentencia o convenio regulador formalizado." initiallyRelevant={value.compensatoryPensionPaid > 0 || value.compensatoryPensionFormalized} onNo={() => onChange({ ...value, compensatoryPensionPaid: 0, compensatoryPensionFormalized: false })}>
            <div className="irpf-rule-grid"><NumberField label="¿Cuánto has pagado este año?" value={value.compensatoryPensionPaid} onChange={(amount) => update('compensatoryPensionPaid', amount)} /><CheckField label="Hay sentencia o convenio regulador formalizado" checked={value.compensatoryPensionFormalized} onChange={(checked) => update('compensatoryPensionFormalized', checked)} /></div>
          </ReductionQuestion>
          <ReductionQuestion question="¿Vas a hacer la declaración conjunta?" description="Elige la situación que corresponda a tu unidad familiar." initiallyRelevant={value.jointTaxationType !== 'individual'} onNo={() => update('jointTaxationType', 'individual')}>
            <SelectField label="¿Con quién presentas la declaración?" value={value.jointTaxationType} onChange={(next) => update('jointTaxationType', next as Irpf2025AdjustmentInput['jointTaxationType'])}><option value="individual">La presento individual</option><option value="married">Con mi cónyuge</option><option value="single_parent">Como unidad monoparental</option><option value="single_parent_cohabiting">Monoparental conviviendo con el otro progenitor</option></SelectField>
          </ReductionQuestion>
          <ReductionQuestion question="¿Has aportado a un patrimonio protegido de una persona con discapacidad?" description="Es una figura específica; déjalo en No si no te suena." initiallyRelevant={value.protectedAssetsContribution > 0} onNo={() => onChange({ ...value, protectedAssetsContribution: 0, protectedAssetsTotalContributors: 0, protectedAssetsEligible: false })}>
            <div className="irpf-rule-grid"><NumberField label="¿Cuánto has aportado?" value={value.protectedAssetsContribution} onChange={(amount) => update('protectedAssetsContribution', amount)} /><NumberField label="Total aportado entre todas las personas" value={value.protectedAssetsTotalContributors} onChange={(amount) => update('protectedAssetsTotalContributors', amount)} /><CheckField label="La aportación cumple los requisitos" checked={value.protectedAssetsEligible} onChange={(checked) => update('protectedAssetsEligible', checked)} /></div>
          </ReductionQuestion>
          <ReductionQuestion question="¿Tienes una reducción autonómica ya calculada y comprobada?" description="Solo si tienes la norma y el cálculo revisados; si no, déjalo en No." initiallyRelevant={value.verifiedRegionalReduction > 0} onNo={() => onChange({ ...value, verifiedRegionalReduction: 0, regionalReductionCode: '', regionalReductionSourceUrl: '', regionalReductionCalculation: '', regionalReductionVerified: false })}>
            <div className="irpf-rule-grid"><NumberField label="Importe de la reducción" value={value.verifiedRegionalReduction} onChange={(amount) => update('verifiedRegionalReduction', amount)} /><TextField label="Nombre de la reducción" value={value.regionalReductionCode} onChange={(next) => update('regionalReductionCode', next)} /><TextField label="Enlace a la fuente oficial" type="url" value={value.regionalReductionSourceUrl} onChange={(next) => update('regionalReductionSourceUrl', next)} /><TextField label="Cómo has hecho el cálculo" value={value.regionalReductionCalculation} onChange={(next) => update('regionalReductionCalculation', next)} /><CheckField label="He comprobado requisitos y fuente" checked={value.regionalReductionVerified} onChange={(checked) => update('regionalReductionVerified', checked)} /></div>
          </ReductionQuestion>
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
        description="Donativos, alquiler y vivienda transitorios, empresa nueva y deduccion autonomica verificada."
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
          <NumberField label="Deduccion autonomica ya calculada" value={value.verifiedRegionalDeduction} onChange={(amount) => update('verifiedRegionalDeduction', amount)} />
          <TextField label="Codigo o nombre de la deduccion autonomica" value={value.regionalDeductionCode} onChange={(next) => update('regionalDeductionCode', next)} />
          <TextField label="Fuente oficial de la deduccion" type="url" value={value.regionalDeductionSourceUrl} onChange={(next) => update('regionalDeductionSourceUrl', next)} />
          <TextField label="Base, porcentaje y limite utilizados" value={value.regionalDeductionCalculation} onChange={(next) => update('regionalDeductionCalculation', next)} />
          <CheckField label="Regla autonomica, fuente y requisitos verificados" checked={value.regionalDeductionVerified} onChange={(checked) => update('regionalDeductionVerified', checked)} />
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
