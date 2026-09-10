import {
  calculateAdditionalWorkExpenses2025,
  calculateBaseReductions2025,
  calculateGeneralDeductions2025,
  calculateIntegralQuotas2025,
  calculateRefundableDeductions2025,
  createEmptyIrpf2025Adjustments,
  protectedAssetsMeetsRequirements,
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

export const WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR = 6_500
export const WORK_REDUCTION_BASIS_LIMIT_EUR = 19_747.5
export const LOW_WORK_INCOME_GROSS_LIMIT_EUR = 18_276
/** Importe maximo de la deduccion por rentas del trabajo bajas de 2025. */
export const LOW_WORK_INCOME_DEDUCTION_MAX_EUR = 340
/** Hasta este bruto la deduccion es entera; a partir de aqui se retira. */
export const LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR = 16_576
/** Euros de deduccion que se pierden por cada euro de bruto en la retirada. */
export const LOW_WORK_INCOME_DEDUCTION_WITHDRAWAL_RATE = 0.2

const WORK_REDUCTION_OTHER_INCOME_LIMIT = WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR
const LOW_WORK_INCOME_DEDUCTION_OTHER_INCOME_LIMIT = WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR

export function workBenefitsCouldApply(netWorkIncome: number, grossWorkIncome: number) {
  const net = Math.max(0, netWorkIncome)
  const gross = Math.max(0, grossWorkIncome)
  return net < WORK_REDUCTION_BASIS_LIMIT_EUR || gross < LOW_WORK_INCOME_GROSS_LIMIT_EUR
}

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

  if (basis >= WORK_REDUCTION_BASIS_LIMIT_EUR || otherIncome > WORK_REDUCTION_OTHER_INCOME_LIMIT) {
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

/**
 * Importe teorico de la deduccion por rentas del trabajo bajas, solo en funcion
 * del bruto: entera hasta LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR y retirada
 * linealmente hasta agotarse en LOW_WORK_INCOME_GROSS_LIMIT_EUR. No aplica el
 * tope de cuota ni el umbral de otras rentas; para eso esta
 * calculateLowWorkIncomeDeduction2025.
 */
export function lowWorkIncomeDeductionTheoretical2025(qualifyingGrossWorkIncome: number) {
  const gross = nonNegative(qualifyingGrossWorkIncome)
  if (gross >= LOW_WORK_INCOME_GROSS_LIMIT_EUR) return 0
  if (gross <= LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR) return LOW_WORK_INCOME_DEDUCTION_MAX_EUR
  return Math.max(
    0,
    LOW_WORK_INCOME_DEDUCTION_MAX_EUR
      - LOW_WORK_INCOME_DEDUCTION_WITHDRAWAL_RATE * (gross - LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR),
  )
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

  if (gross >= LOW_WORK_INCOME_GROSS_LIMIT_EUR || otherIncome > LOW_WORK_INCOME_DEDUCTION_OTHER_INCOME_LIMIT) {
    return { theoretical: 0, limit: attributableQuota, applied: 0 }
  }

  const theoretical = lowWorkIncomeDeductionTheoretical2025(gross)
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
    warnings.push('Las cuotas colegiales no se aplican porque no se ha confirmado que la colegiación sea obligatoria.')
  }
  if (adjustments.compensatoryPensionPaid > 0 && !adjustments.compensatoryPensionFormalized) {
    warnings.push('La pensión compensatoria no se aplica sin resolución o convenio formalizado.')
  }
  if (adjustments.protectedAssetsContribution > 0 && !protectedAssetsMeetsRequirements(adjustments)) {
    if (!adjustments.protectedAssetsFormalEstate) {
      warnings.push('La aportación al patrimonio protegido no se aplica sin un patrimonio protegido constituido formalmente.')
    } else if (!adjustments.protectedAssetsValidContributor) {
      warnings.push('La aportación al patrimonio protegido no se aplica sin parentesco o legitimación válidos para aportar.')
    } else if (!adjustments.protectedAssetsContributorNotBeneficiary) {
      warnings.push('La aportación al patrimonio protegido no se aplica si eres tú el titular del patrimonio.')
    }
  }
  if (adjustments.verifiedRegionalReduction > 0 && !(
    adjustments.regionalReductionVerified
    && adjustments.regionalReductionCode.trim()
    && adjustments.regionalReductionSourceUrl.trim()
    && adjustments.regionalReductionCalculation.trim()
  )) {
    warnings.push('La reducción autonómica manual no se aplica sin verificación documentada.')
  }
  if (adjustments.childSupportPaid > 0 && !(
    adjustments.childSupportFormalized && adjustments.childSupportMinimumExcluded
  )) {
    warnings.push('La especialidad de anualidades no se aplica hasta confirmar el título formal y la exclusión del mínimo por descendiente.')
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
    warnings.push('El alquiler no cumple o no acredita todos los requisitos del régimen transitorio estatal.')
  }
  if (adjustments.homeInvestmentPaid > 0 && !adjustments.homeTransitionalRight) {
    warnings.push('La inversión en vivienda no se aplica sin acreditar el régimen transitorio anterior a 2013.')
  }
  if (adjustments.newCompanyInvestment > 0 && !adjustments.newCompanyRequirementsVerified) {
    warnings.push('La inversión en empresa nueva queda pendiente de verificación documental.')
  }
  if (adjustments.verifiedRegionalDeduction > 0 && !(
    adjustments.regionalDeductionVerified
    && adjustments.regionalDeductionCode.trim()
    && adjustments.regionalDeductionSourceUrl.trim()
    && adjustments.regionalDeductionCalculation.trim()
  )) {
    warnings.push('La deducción autonómica manual no se aplica sin regla, fuente y requisitos verificados.')
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
    grossWorkIncome,
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
  const refundableDeductions = calculateRefundableDeductions2025(
    adjustments,
    irpf,
    nonNegative(input.article19ExpensesBeforeOtherExpenses),
  )

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
