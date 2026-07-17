import { Baby, BriefcaseBusiness, FileCheck2, HeartHandshake, Landmark, ReceiptText, ShieldCheck, UsersRound } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  calculateInKindBenefits2025,
} from '../fiscal-worker-dashboard/irpf2025Adjustments'
import type { Irpf2025AdjustmentInput } from '../fiscal-worker-dashboard/irpf2025Adjustments'
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
  hint?: string
  max?: number
  min?: number
  step?: number
  unit?: string
}

function NumberField({ label, value, onChange, hint, max, min = 0, step = 0.01, unit = 'EUR' }: NumberFieldProps) {
  return (
    <label className="irpf-rule-field">
      <span>{label}</span>
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

function CountField({ label, value, onChange, max = 12, hint, unit }: NumberFieldProps) {
  return (
    <label className="irpf-rule-field">
      <span>{label}</span>
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

function CheckField({ label, checked, onChange, hint }: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}) {
  return (
    <label className="irpf-rule-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
    </label>
  )
}

function TextField({ label, value, onChange, hint, type = 'text' }: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  type?: 'text' | 'url'
}) {
  return (
    <label className="irpf-rule-field">
      <span>{label}</span>
      <input aria-label={label} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

function SelectField({ label, value, onChange, children, hint }: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="irpf-rule-field">
      <span>{label}</span>
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

export function Irpf2025StructuredAdjustmentsForm({ focus, value, declaredInKindSalary = 0, onChange }: Props) {
  const update = <Key extends keyof Irpf2025AdjustmentInput>(key: Key, nextValue: Irpf2025AdjustmentInput[Key]) => {
    onChange({ ...value, [key]: nextValue })
  }
  const benefits = calculateInKindBenefits2025(value)
  const benefitsMismatch = benefits.declaredBenefitsTotal > declaredInKindSalary

  if (focus === 'reductions') {
    return (
      <section className="irpf-rule-form" aria-label="Datos exactos para reducciones IRPF 2025">
        <RuleGroup
          title="Rentas y gastos del trabajo"
          description="Datos previos al articulo 20: otras rentas, sindicato, colegio y defensa juridica."
          icon={ReceiptText}
          open
        >
          <div className="irpf-rule-grid">
            <CheckField
              label="Conozco todas mis otras rentas no exentas"
              checked={value.otherIncomeKnown}
              onChange={(checked) => update('otherIncomeKnown', checked)}
              hint="Afectan a los umbrales de 6.500 EUR."
            />
            <NumberField
              label="Otras rentas no exentas distintas del trabajo"
              value={value.otherNonExemptNonWorkIncome}
              onChange={(amount) => update('otherNonExemptNonWorkIncome', amount)}
            />
            <NumberField label="Cuotas sindicales pagadas" value={value.unionDues} onChange={(amount) => update('unionDues', amount)} />
            <NumberField
              label="Cuotas de colegio profesional"
              value={value.professionalDues}
              onChange={(amount) => update('professionalDues', amount)}
              hint="El motor limita el gasto a 500 EUR."
            />
            <CheckField
              label="La colegiacion es obligatoria para ejercer"
              checked={value.professionalMembershipMandatory}
              onChange={(checked) => update('professionalMembershipMandatory', checked)}
            />
            <NumberField
              label="Defensa juridica laboral"
              value={value.legalDefenseCosts}
              onChange={(amount) => update('legalDefenseCosts', amount)}
              hint="Litigios laborales; maximo 300 EUR."
            />
            <CheckField label="Estaba inscrito como demandante de empleo" checked={value.wasRegisteredJobseeker} onChange={(checked) => update('wasRegisteredJobseeker', checked)} />
            <CheckField label="Acepte un empleo en otro municipio" checked={value.acceptedJobOtherMunicipality} onChange={(checked) => update('acceptedJobOtherMunicipality', checked)} />
            <CheckField label="Traslade mi residencia" checked={value.movedResidence} onChange={(checked) => update('movedResidence', checked)} />
            <CountField label="Ejercicio del traslado" value={value.moveTaxYear} onChange={(year) => update('moveTaxYear', year)} max={2025} unit="año" hint="Solo 2024 o 2025 generan incremento en 2025." />
            <NumberField label="Rendimiento integro del nuevo empleo" value={value.newJobIntegralIncome} onChange={(amount) => update('newJobIntegralIncome', amount)} />
            <NumberField label="Gastos especificos del nuevo empleo" value={value.newJobSpecificExpenses} onChange={(amount) => update('newJobSpecificExpenses', amount)} />
          </div>
        </RuleGroup>

        <RuleGroup
          title="Prevision social"
          description="Aportaciones ordinarias, mutualidades, empleo y aportaciones al sistema del conyuge."
          icon={UsersRound}
        >
          <div className="irpf-rule-grid">
            <NumberField label="Plan personal" value={value.personalPensionContribution} onChange={(amount) => update('personalPensionContribution', amount)} />
            <NumberField label="Mutualidad admisible" value={value.mutualityContribution} onChange={(amount) => update('mutualityContribution', amount)} />
            <NumberField label="Contribucion empresarial imputada" value={value.employerPensionContribution} onChange={(amount) => update('employerPensionContribution', amount)} />
            <NumberField label="Aportacion propia al mismo plan de empleo" value={value.workerEmploymentPensionContribution} onChange={(amount) => update('workerEmploymentPensionContribution', amount)} />
            <NumberField
              label="Rendimiento integro del empleador del plan"
              value={value.grossIncomeFromPensionEmployer}
              onChange={(amount) => update('grossIncomeFromPensionEmployer', amount)}
              hint="Determina el coeficiente de la aportacion vinculada."
            />
            <NumberField label="Aportacion al sistema del conyuge" value={value.spousePensionContribution} onChange={(amount) => update('spousePensionContribution', amount)} />
            <NumberField label="Rendimientos netos del conyuge" value={value.spouseNetWorkAndBusinessIncome} onChange={(amount) => update('spouseNetWorkAndBusinessIncome', amount)} />
            <CheckField
              label="El sistema del conyuge cumple los requisitos"
              checked={value.spousePensionEligible}
              onChange={(checked) => update('spousePensionEligible', checked)}
              hint="Limite independiente de 1.000 EUR si sus rendimientos son inferiores a 8.000 EUR."
            />
          </div>
        </RuleGroup>

        <RuleGroup
          title="Otras reducciones de base"
          description="Solo se aplican cuando se confirma el requisito formal correspondiente."
          icon={FileCheck2}
        >
          <div className="irpf-rule-grid">
            <NumberField label="Pension compensatoria pagada" value={value.compensatoryPensionPaid} onChange={(amount) => update('compensatoryPensionPaid', amount)} />
            <CheckField
              label="Existe resolucion o convenio formalizado"
              checked={value.compensatoryPensionFormalized}
              onChange={(checked) => update('compensatoryPensionFormalized', checked)}
            />
            <SelectField
              label="Modalidad de declaracion"
              value={value.jointTaxationType}
              onChange={(next) => update('jointTaxationType', next as Irpf2025AdjustmentInput['jointTaxationType'])}
            >
              <option value="individual">Individual</option>
              <option value="married">Conjunta: matrimonio no separado</option>
              <option value="single_parent">Conjunta: unidad monoparental</option>
              <option value="single_parent_cohabiting">Monoparental conviviendo con el otro progenitor</option>
            </SelectField>
            <NumberField label="Aportacion a patrimonio protegido" value={value.protectedAssetsContribution} onChange={(amount) => update('protectedAssetsContribution', amount)} />
            <NumberField
              label="Total aportado por todos al mismo patrimonio"
              value={value.protectedAssetsTotalContributors}
              onChange={(amount) => update('protectedAssetsTotalContributors', amount)}
            />
            <CheckField
              label="Aportante, beneficiario y patrimonio cumplen requisitos"
              checked={value.protectedAssetsEligible}
              onChange={(checked) => update('protectedAssetsEligible', checked)}
            />
            <NumberField label="Reduccion autonomica calculada" value={value.verifiedRegionalReduction} onChange={(amount) => update('verifiedRegionalReduction', amount)} />
            <TextField label="Codigo o nombre de la reduccion autonomica" value={value.regionalReductionCode} onChange={(next) => update('regionalReductionCode', next)} />
            <TextField label="Fuente oficial de la reduccion" type="url" value={value.regionalReductionSourceUrl} onChange={(next) => update('regionalReductionSourceUrl', next)} />
            <TextField label="Base, porcentaje y limite utilizados" value={value.regionalReductionCalculation} onChange={(next) => update('regionalReductionCalculation', next)} />
            <CheckField
              label="Reduccion autonomica documentada y verificada"
              checked={value.regionalReductionVerified}
              onChange={(checked) => update('regionalReductionVerified', checked)}
            />
          </div>
        </RuleGroup>
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
