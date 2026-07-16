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
}

export type Irpf2025CoreResult = {
  grossWorkIncome: number
  article19ExpensesBeforeOtherExpenses: number
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
  taxableBase: number
  stateGrossQuota: number
  stateMinimumQuota: number
  stateTax: number
  regionalGrossQuota: number
  regionalMinimumQuota: number
  regionalTax: number
  liquidQuotaBeforeWorkDeduction: number
  lowWorkIncomeDeductionTheoretical: number
  lowWorkIncomeDeductionLimit: number
  lowWorkIncomeDeductionApplied: number
  irpf: number
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

export function calculateIrpf2025Core(input: Irpf2025CoreInput): Irpf2025CoreResult {
  const grossWorkIncome = nonNegative(input.grossWorkIncome)
  const article19ExpensesBeforeOtherExpenses = Math.min(
    grossWorkIncome,
    nonNegative(input.article19ExpensesBeforeOtherExpenses),
  )
  const workReductionBasis = Math.max(0, grossWorkIncome - article19ExpensesBeforeOtherExpenses)
  const article19OtherExpensesTheoretical = nonNegative(input.article19OtherExpenses)
  const article19OtherExpensesApplied = Math.min(
    article19OtherExpensesTheoretical,
    workReductionBasis,
  )
  const netWorkIncome = Math.max(0, workReductionBasis - article19OtherExpensesApplied)
  const otherIncome = nonNegative(input.otherNonExemptNonWorkIncome)
  const workReduction = calculateWorkReduction2025(workReductionBasis, netWorkIncome, otherIncome)
  const netReducedWorkIncome = Math.max(0, netWorkIncome - workReduction.applied)

  const basicPensionContributions = nonNegative(input.basicPensionContributions)
  const pensionReductionPercentLimit = netWorkIncome * 0.3
  const pensionReductionApplied = Math.min(
    basicPensionContributions,
    1_500,
    pensionReductionPercentLimit,
    netReducedWorkIncome,
  )
  const baseAfterPensionReduction = Math.max(0, netReducedWorkIncome - pensionReductionApplied)
  const verifiedBaseReductionsApplied = Math.min(
    nonNegative(input.verifiedBaseReductions),
    baseAfterPensionReduction,
  )
  const taxableBase = Math.max(0, baseAfterPensionReduction - verifiedBaseReductionsApplied)

  const stateGrossQuota = applyIrpfScale(taxableBase, input.stateScale)
  const stateMinimumQuota = applyIrpfScale(Math.min(nonNegative(input.stateMinimum), taxableBase), input.stateScale)
  const stateTax = Math.max(
    0,
    stateGrossQuota - stateMinimumQuota - nonNegative(input.stateQuotaDeductions),
  )
  const regionalGrossQuota = applyIrpfScale(taxableBase, input.regionalScale)
  const regionalMinimumQuota = applyIrpfScale(
    Math.min(nonNegative(input.regionalMinimum), taxableBase),
    input.regionalScale,
  )
  const regionalTax = Math.max(
    0,
    regionalGrossQuota - regionalMinimumQuota - nonNegative(input.regionalQuotaDeductions),
  )
  const liquidQuotaBeforeWorkDeduction = stateTax + regionalTax

  // El alcance actual solo contiene rendimientos del trabajo. Por ello toda la
  // cuota integra calculada es atribuible a los rendimientos que dan derecho.
  const attributableIntegralQuota =
    Math.max(0, stateGrossQuota - stateMinimumQuota) +
    Math.max(0, regionalGrossQuota - regionalMinimumQuota)
  const lowWorkIncomeDeduction = calculateLowWorkIncomeDeduction2025(
    grossWorkIncome,
    attributableIntegralQuota,
    liquidQuotaBeforeWorkDeduction,
    otherIncome,
  )
  const irpf = Math.max(0, liquidQuotaBeforeWorkDeduction - lowWorkIncomeDeduction.applied)

  return {
    grossWorkIncome,
    article19ExpensesBeforeOtherExpenses,
    article19OtherExpensesTheoretical,
    article19OtherExpensesApplied,
    netWorkIncome,
    workReductionBasis,
    workReductionTheoretical: workReduction.theoretical,
    workReductionApplied: workReduction.applied,
    netReducedWorkIncome,
    basicPensionContributions,
    pensionReductionPercentLimit,
    pensionReductionApplied,
    verifiedBaseReductionsApplied,
    taxableBase,
    stateGrossQuota,
    stateMinimumQuota,
    stateTax,
    regionalGrossQuota,
    regionalMinimumQuota,
    regionalTax,
    liquidQuotaBeforeWorkDeduction,
    lowWorkIncomeDeductionTheoretical: lowWorkIncomeDeduction.theoretical,
    lowWorkIncomeDeductionLimit: lowWorkIncomeDeduction.limit,
    lowWorkIncomeDeductionApplied: lowWorkIncomeDeduction.applied,
    irpf,
  }
}
