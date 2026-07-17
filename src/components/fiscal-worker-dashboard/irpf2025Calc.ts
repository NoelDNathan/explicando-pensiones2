import {
  calculateAdditionalWorkExpenses2025,
  calculateBaseReductions2025,
  calculateGeneralDeductions2025,
  calculateIntegralQuotas2025,
  calculateRefundableDeductions2025,
  createEmptyIrpf2025Adjustments,
} from './irpf2025Adjustments.ts'
import type {
  BaseReductionResult,
  GeneralDeductionResult,
  Irpf2025AdjustmentInput,
  RefundableDeductionResult,
} from './irpf2025Adjustments.ts'

export type IrpfScaleBracket = {
  base_from_eur: number
  base_to_eur: number | null
  base_quota_eur: number
  marginal_percent: number
}

export type Irpf2025CoreInput = {
  grossWorkIncome: number
  article19ExpensesBeforeOtherExpenses: number
  article19OtherExpenses: number
  otherNonExemptNonWorkIncome?: number
  basicPensionContributions?: number
  verifiedBaseReductions?: number
  stateMinimum: number
  regionalMinimum: number
  stateScale: IrpfScaleBracket[]
  regionalScale: IrpfScaleBracket[]
  stateQuotaDeductions?: number
  regionalQuotaDeductions?: number
  adjustments?: Irpf2025AdjustmentInput
}

export type Irpf2025CoreResult = {
  grossWorkIncome: number
  article19ExpensesBeforeOtherExpenses: number
  additionalWorkExpenses: {
    unionDues: number
    professionalDues: number
    legalDefense: number
    total: number
  }
  article19OtherExpensesTheoretical: number
  article19OtherExpensesApplied: number
  netWorkIncome: number
  workReductionBasis: number
  workReductionTheoretical: number
  workReductionApplied: number
  netReducedWorkIncome: number
  basicPensionContributions: number
  pensionReductionPercentLimit: number
  pensionReductionApplied: number
  verifiedBaseReductionsApplied: number
  baseReductions: BaseReductionResult
  taxableBase: number
  stateGrossQuota: number
  stateMinimumQuota: number
  stateIntegralQuota: number
  stateTax: number
  regionalGrossQuota: number
  regionalMinimumQuota: number
  regionalIntegralQuota: number
  regionalTax: number
  childSupportSpecialityApplied: boolean
  generalDeductions: GeneralDeductionResult
  liquidQuotaBeforeWorkDeduction: number
  lowWorkIncomeDeductionTheoretical: number
  lowWorkIncomeDeductionLimit: number
  lowWorkIncomeDeductionApplied: number
  quotaDeductionsApplied: number
  irpf: number
  refundableDeductions: RefundableDeductionResult
  calculationStatus: 'estimated_exact' | 'not_estimated'
  warnings: string[]
}

const WORK_REDUCTION_OTHER_INCOME_LIMIT = 6_500
const LOW_WORK_INCOME_DEDUCTION_OTHER_INCOME_LIMIT = 6_500

function nonNegative(value: number | undefined) {
  return Math.max(0, Number.isFinite(value) ? (value ?? 0) : 0)
}

export function applyIrpfScale(base: number, scale: IrpfScaleBracket[]) {
  const safeBase = nonNegative(base)
  if (safeBase === 0) return 0

  const bracket = scale.find(
    (item) => safeBase >= item.base_from_eur && (item.base_to_eur === null || safeBase < item.base_to_eur),
  )
  if (!bracket) return 0

  return bracket.base_quota_eur + ((safeBase - bracket.base_from_eur) * bracket.marginal_percent) / 100
}

export function calculateWorkReduction2025(
  workReductionBasis: number,
  netWorkIncome: number,
  otherNonExemptNonWorkIncome = 0,
) {
  const basis = nonNegative(workReductionBasis)
  const availableNetWorkIncome = nonNegative(netWorkIncome)
  const otherIncome = nonNegative(otherNonExemptNonWorkIncome)

  if (basis >= 19_747.5 || otherIncome > WORK_REDUCTION_OTHER_INCOME_LIMIT) {
    return { theoretical: 0, applied: 0 }
  }

  const theoretical = basis <= 14_852
    ? 7_302
    : basis <= 17_673.52
      ? 7_302 - 1.75 * (basis - 14_852)
      : Math.max(0, 2_364.34 - 1.14 * (basis - 17_673.52))

  return {
    theoretical,
    applied: Math.min(theoretical, availableNetWorkIncome),
  }
}

export function calculateLowWorkIncomeDeduction2025(
  qualifyingGrossWorkIncome: number,
  attributableIntegralQuota: number,
  liquidQuotaAvailable: number,
  otherNonExemptNonWorkIncome = 0,
) {
  const gross = nonNegative(qualifyingGrossWorkIncome)
  const attributableQuota = nonNegative(attributableIntegralQuota)
  const availableQuota = nonNegative(liquidQuotaAvailable)
  const otherIncome = nonNegative(otherNonExemptNonWorkIncome)

  if (gross >= 18_276 || otherIncome > LOW_WORK_INCOME_DEDUCTION_OTHER_INCOME_LIMIT) {
    return { theoretical: 0, limit: attributableQuota, applied: 0 }
  }

  const theoretical = gross <= 16_576
    ? 340
    : Math.max(0, 340 - 0.2 * (gross - 16_576))
  const limit = Math.min(attributableQuota, availableQuota)

  return {
    theoretical,
    limit,
    applied: Math.min(theoretical, limit),
  }
}

function buildWarnings(adjustments: Irpf2025AdjustmentInput) {
  const warnings: string[] = []
  if (!adjustments.otherIncomeKnown) {
    warnings.push('No se aplican los beneficios sujetos al umbral de 6.500 EUR hasta confirmar las otras rentas no exentas.')
  }
  if (adjustments.professionalDues > 0 && !adjustments.professionalMembershipMandatory) {
    warnings.push('Las cuotas colegiales no se aplican porque no se ha confirmado que la colegiacion sea obligatoria.')
  }
  if (
    adjustments.employerPensionContribution + adjustments.workerEmploymentPensionContribution > 0
    && adjustments.grossIncomeFromPensionEmployer <= 0
  ) {
    warnings.push('El incremento de prevision social de empleo queda no estimado hasta indicar el rendimiento del empleador.')
  }
  if (adjustments.compensatoryPensionPaid > 0 && !adjustments.compensatoryPensionFormalized) {
    warnings.push('La pension compensatoria no se aplica sin resolucion o convenio formalizado.')
  }
  if (adjustments.protectedAssetsContribution > 0 && !adjustments.protectedAssetsEligible) {
    warnings.push('La aportacion al patrimonio protegido no se aplica sin confirmar beneficiario y requisitos legales.')
  }
  if (adjustments.verifiedRegionalReduction > 0 && !(
    adjustments.regionalReductionVerified
    && adjustments.regionalReductionCode.trim()
    && adjustments.regionalReductionSourceUrl.trim()
    && adjustments.regionalReductionCalculation.trim()
  )) {
    warnings.push('La reduccion autonomica manual no se aplica sin verificacion documentada.')
  }
  if (adjustments.childSupportPaid > 0 && !(
    adjustments.childSupportFormalized && adjustments.childSupportMinimumExcluded
  )) {
    warnings.push('La especialidad de anualidades no se aplica hasta confirmar el titulo formal y la exclusion del minimo por descendiente.')
  }
  if (adjustments.donationAmount > 0 && !adjustments.donationLaw49Eligible) {
    warnings.push('El donativo no se aplica hasta confirmar la entidad beneficiaria de la Ley 49/2002.')
  }
  if (adjustments.rentPaid > 0 && !(
    adjustments.rentContractBefore2015
    && adjustments.rentPaidBefore2015
    && adjustments.rentPriorDeductionRight
    && adjustments.rentIsMainHome
  )) {
    warnings.push('El alquiler no cumple o no acredita todos los requisitos del regimen transitorio estatal.')
  }
  if (adjustments.homeInvestmentPaid > 0 && !adjustments.homeTransitionalRight) {
    warnings.push('La inversion en vivienda no se aplica sin acreditar el regimen transitorio anterior a 2013.')
  }
  if (adjustments.newCompanyInvestment > 0 && !adjustments.newCompanyRequirementsVerified) {
    warnings.push('La inversion en empresa nueva queda pendiente de verificacion documental.')
  }
  if (adjustments.verifiedRegionalDeduction > 0 && !(
    adjustments.regionalDeductionVerified
    && adjustments.regionalDeductionCode.trim()
    && adjustments.regionalDeductionSourceUrl.trim()
    && adjustments.regionalDeductionCalculation.trim()
  )) {
    warnings.push('La deduccion autonomica manual no se aplica sin regla, fuente y requisitos verificados.')
  }
  if (
    (adjustments.largeFamilyEligible || adjustments.disabilityEligiblePersonMonths > 0)
    && !adjustments.refundableBenefitEntitlement
    && adjustments.refundableContributionLimit <= 0
  ) {
    warnings.push('Familia numerosa o discapacidad a cargo quedan no estimadas hasta indicar las cotizaciones que limitan el derecho o la prestacion habilitante.')
  }
  return warnings
}

export function calculateIrpf2025Core(input: Irpf2025CoreInput): Irpf2025CoreResult {
  const adjustments = input.adjustments ?? createEmptyIrpf2025Adjustments()
  const warnings = buildWarnings(adjustments)
  const grossWorkIncome = nonNegative(input.grossWorkIncome)
  const additionalWorkExpenses = calculateAdditionalWorkExpenses2025(adjustments)
  const article19ExpensesBeforeOtherExpenses = Math.min(
    grossWorkIncome,
    nonNegative(input.article19ExpensesBeforeOtherExpenses) + additionalWorkExpenses.total,
  )
  const workReductionBasis = Math.max(0, grossWorkIncome - article19ExpensesBeforeOtherExpenses)
  const article19OtherExpensesTheoretical = nonNegative(input.article19OtherExpenses)
  const article19OtherExpensesApplied = Math.min(
    article19OtherExpensesTheoretical,
    workReductionBasis,
  )
  const netWorkIncome = Math.max(0, workReductionBasis - article19OtherExpensesApplied)
  const otherIncome = input.otherNonExemptNonWorkIncome === undefined
    ? nonNegative(adjustments.otherNonExemptNonWorkIncome)
    : nonNegative(input.otherNonExemptNonWorkIncome)
  const benefitsWithIncomeThresholdEnabled = input.adjustments === undefined || adjustments.otherIncomeKnown
  const thresholdIncome = benefitsWithIncomeThresholdEnabled ? otherIncome : WORK_REDUCTION_OTHER_INCOME_LIMIT + 0.01
  const workReduction = calculateWorkReduction2025(workReductionBasis, netWorkIncome, thresholdIncome)
  const netReducedWorkIncome = Math.max(0, netWorkIncome - workReduction.applied)

  const baseReductions = calculateBaseReductions2025(
    adjustments,
    netWorkIncome,
    netReducedWorkIncome,
    input.basicPensionContributions,
    input.verifiedBaseReductions,
  )
  const taxableBase = Math.max(0, netReducedWorkIncome - baseReductions.totalApplied)
  const integralQuotas = calculateIntegralQuotas2025(
    adjustments,
    taxableBase,
    input.stateMinimum,
    input.regionalMinimum,
    input.stateScale,
    input.regionalScale,
  )
  const generalDeductions = calculateGeneralDeductions2025(
    adjustments,
    netReducedWorkIncome,
    taxableBase,
    integralQuotas.stateIntegralQuota,
    integralQuotas.regionalIntegralQuota,
    input.stateQuotaDeductions,
    input.regionalQuotaDeductions,
  )
  const stateTax = Math.max(0, integralQuotas.stateIntegralQuota - generalDeductions.stateApplied)
  const regionalTax = Math.max(0, integralQuotas.regionalIntegralQuota - generalDeductions.regionalApplied)
  const liquidQuotaBeforeWorkDeduction = stateTax + regionalTax

  // El alcance actual solo contiene rendimientos del trabajo. Por ello toda la
  // cuota integra calculada es atribuible a los rendimientos que dan derecho.
  const attributableIntegralQuota = integralQuotas.stateIntegralQuota + integralQuotas.regionalIntegralQuota
  const lowWorkIncomeDeduction = calculateLowWorkIncomeDeduction2025(
    grossWorkIncome,
    attributableIntegralQuota,
    liquidQuotaBeforeWorkDeduction,
    thresholdIncome,
  )
  const irpf = Math.max(0, liquidQuotaBeforeWorkDeduction - lowWorkIncomeDeduction.applied)
  const refundableDeductions = calculateRefundableDeductions2025(adjustments, irpf)

  return {
    grossWorkIncome,
    article19ExpensesBeforeOtherExpenses,
    additionalWorkExpenses,
    article19OtherExpensesTheoretical,
    article19OtherExpensesApplied,
    netWorkIncome,
    workReductionBasis,
    workReductionTheoretical: workReduction.theoretical,
    workReductionApplied: workReduction.applied,
    netReducedWorkIncome,
    basicPensionContributions: nonNegative(input.basicPensionContributions)
      + adjustments.personalPensionContribution
      + adjustments.mutualityContribution
      + adjustments.employerPensionContribution
      + adjustments.workerEmploymentPensionContribution,
    pensionReductionPercentLimit: baseReductions.pensionPercentLimit,
    pensionReductionApplied: baseReductions.pensionApplied,
    verifiedBaseReductionsApplied: Math.max(0, baseReductions.totalApplied - baseReductions.pensionApplied),
    baseReductions,
    taxableBase,
    stateGrossQuota: integralQuotas.stateGrossQuota,
    stateMinimumQuota: integralQuotas.stateMinimumQuota,
    stateIntegralQuota: integralQuotas.stateIntegralQuota,
    stateTax,
    regionalGrossQuota: integralQuotas.regionalGrossQuota,
    regionalMinimumQuota: integralQuotas.regionalMinimumQuota,
    regionalIntegralQuota: integralQuotas.regionalIntegralQuota,
    regionalTax,
    childSupportSpecialityApplied: integralQuotas.childSupportSpecialityApplied,
    generalDeductions,
    liquidQuotaBeforeWorkDeduction,
    lowWorkIncomeDeductionTheoretical: lowWorkIncomeDeduction.theoretical,
    lowWorkIncomeDeductionLimit: lowWorkIncomeDeduction.limit,
    lowWorkIncomeDeductionApplied: lowWorkIncomeDeduction.applied,
    quotaDeductionsApplied: generalDeductions.totalApplied + lowWorkIncomeDeduction.applied,
    irpf,
    refundableDeductions,
    calculationStatus: warnings.length === 0 ? 'estimated_exact' : 'not_estimated',
    warnings,
  }
}
