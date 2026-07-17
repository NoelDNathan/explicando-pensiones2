import type { IrpfScaleBracket } from './irpf2025Calc.ts'

export type IrpfCalculationStatus =
  | 'not_applicable'
  | 'estimated_exact'
  | 'requires_document_verification'
  | 'not_estimated'
  | 'manual_verified'

export type Irpf2025AdjustmentInput = {
  otherIncomeKnown: boolean
  otherNonExemptNonWorkIncome: number
  unionDues: number
  professionalDues: number
  professionalMembershipMandatory: boolean
  legalDefenseCosts: number
  wasRegisteredJobseeker: boolean
  acceptedJobOtherMunicipality: boolean
  movedResidence: boolean
  moveTaxYear: number
  newJobIntegralIncome: number
  newJobSpecificExpenses: number
  personalPensionContribution: number
  mutualityContribution: number
  employerPensionContribution: number
  workerEmploymentPensionContribution: number
  grossIncomeFromPensionEmployer: number
  spousePensionContribution: number
  spouseNetWorkAndBusinessIncome: number
  spousePensionEligible: boolean
  compensatoryPensionPaid: number
  compensatoryPensionFormalized: boolean
  jointTaxationType: 'individual' | 'married' | 'single_parent' | 'single_parent_cohabiting'
  protectedAssetsContribution: number
  protectedAssetsEligible: boolean
  protectedAssetsTotalContributors: number
  verifiedRegionalReduction: number
  regionalReductionVerified: boolean
  regionalReductionCode: string
  regionalReductionSourceUrl: string
  regionalReductionCalculation: string
  childSupportPaid: number
  childSupportFormalized: boolean
  childSupportMinimumExcluded: boolean
  donationAmount: number
  donation2024: number
  donation2023: number
  donationLaw49Eligible: boolean
  rentPaid: number
  rentContractBefore2015: boolean
  rentPaidBefore2015: boolean
  rentPriorDeductionRight: boolean
  rentIsMainHome: boolean
  homeInvestmentPaid: number
  homeTransitionalRight: boolean
  homeOwnershipPercent: number
  homeRegionalRate: 7.5 | 9
  homeRegionalSpecialVerified: boolean
  newCompanyInvestment: number
  newCompanyRequirementsVerified: boolean
  verifiedRegionalDeduction: number
  regionalDeductionVerified: boolean
  regionalDeductionCode: string
  regionalDeductionSourceUrl: string
  regionalDeductionCalculation: string
  maternityEligible: boolean
  maternityEligibleChildren: number
  maternityEligibleMonths: number
  maternityOneTime150Eligible: boolean
  maternityOneTime150Count: number
  maternityAdvanceReceived: number
  daycareEligible: boolean
  daycareEligibleChildren: number
  daycareFullMonths: number
  daycareTotalExpense: number
  daycareSubsidies: number
  daycareEmployerExemptAmount: number
  largeFamilyEligible: boolean
  largeFamilyCategory: 'none' | 'general' | 'special'
  largeFamilyEligibleMonths: number
  largeFamilyExtraChildren: number
  largeFamilyEntitlementShare: number
  largeFamilyAdvanceReceived: number
  disabilityEligiblePersonMonths: number
  disabilityEntitlementShare: number
  disabilityAdvanceReceived: number
  refundableContributionLimit: number
  refundableBenefitEntitlement: boolean
  withholdings: number
  paymentsOnAccount: number
  mealCardEligible: boolean
  mealCardDailyAmount: number
  mealCardEligibleDays: number
  transportCardEligible: boolean
  transportCardMonthlyAmount: number
  transportCardEligibleMonths: number
  healthInsuranceEligible: boolean
  healthInsuranceOrdinaryPersonsCount: number
  healthInsuranceDisabledPersonsCount: number
  healthInsurancePremiumOrdinaryPersons: number
  healthInsurancePremiumDisabledPersons: number
  companyDaycareEligible: boolean
  companyDaycareAnnualAmount: number
  paymentOnAccountNotPassedOn: number
}

export function createEmptyIrpf2025Adjustments(): Irpf2025AdjustmentInput {
  return {
    otherIncomeKnown: false,
    otherNonExemptNonWorkIncome: 0,
    unionDues: 0,
    professionalDues: 0,
    professionalMembershipMandatory: false,
    legalDefenseCosts: 0,
    wasRegisteredJobseeker: false,
    acceptedJobOtherMunicipality: false,
    movedResidence: false,
    moveTaxYear: 0,
    newJobIntegralIncome: 0,
    newJobSpecificExpenses: 0,
    personalPensionContribution: 0,
    mutualityContribution: 0,
    employerPensionContribution: 0,
    workerEmploymentPensionContribution: 0,
    grossIncomeFromPensionEmployer: 0,
    spousePensionContribution: 0,
    spouseNetWorkAndBusinessIncome: 0,
    spousePensionEligible: false,
    compensatoryPensionPaid: 0,
    compensatoryPensionFormalized: false,
    jointTaxationType: 'individual',
    protectedAssetsContribution: 0,
    protectedAssetsEligible: false,
    protectedAssetsTotalContributors: 0,
    verifiedRegionalReduction: 0,
    regionalReductionVerified: false,
    regionalReductionCode: '',
    regionalReductionSourceUrl: '',
    regionalReductionCalculation: '',
    childSupportPaid: 0,
    childSupportFormalized: false,
    childSupportMinimumExcluded: false,
    donationAmount: 0,
    donation2024: 0,
    donation2023: 0,
    donationLaw49Eligible: false,
    rentPaid: 0,
    rentContractBefore2015: false,
    rentPaidBefore2015: false,
    rentPriorDeductionRight: false,
    rentIsMainHome: false,
    homeInvestmentPaid: 0,
    homeTransitionalRight: false,
    homeOwnershipPercent: 100,
    homeRegionalRate: 7.5,
    homeRegionalSpecialVerified: false,
    newCompanyInvestment: 0,
    newCompanyRequirementsVerified: false,
    verifiedRegionalDeduction: 0,
    regionalDeductionVerified: false,
    regionalDeductionCode: '',
    regionalDeductionSourceUrl: '',
    regionalDeductionCalculation: '',
    maternityEligible: false,
    maternityEligibleChildren: 1,
    maternityEligibleMonths: 0,
    maternityOneTime150Eligible: false,
    maternityOneTime150Count: 0,
    maternityAdvanceReceived: 0,
    daycareEligible: false,
    daycareEligibleChildren: 1,
    daycareFullMonths: 0,
    daycareTotalExpense: 0,
    daycareSubsidies: 0,
    daycareEmployerExemptAmount: 0,
    largeFamilyEligible: false,
    largeFamilyCategory: 'none',
    largeFamilyEligibleMonths: 0,
    largeFamilyExtraChildren: 0,
    largeFamilyEntitlementShare: 1,
    largeFamilyAdvanceReceived: 0,
    disabilityEligiblePersonMonths: 0,
    disabilityEntitlementShare: 1,
    disabilityAdvanceReceived: 0,
    refundableContributionLimit: 0,
    refundableBenefitEntitlement: false,
    withholdings: 0,
    paymentsOnAccount: 0,
    mealCardEligible: false,
    mealCardDailyAmount: 0,
    mealCardEligibleDays: 0,
    transportCardEligible: false,
    transportCardMonthlyAmount: 0,
    transportCardEligibleMonths: 0,
    healthInsuranceEligible: false,
    healthInsuranceOrdinaryPersonsCount: 1,
    healthInsuranceDisabledPersonsCount: 1,
    healthInsurancePremiumOrdinaryPersons: 0,
    healthInsurancePremiumDisabledPersons: 0,
    companyDaycareEligible: false,
    companyDaycareAnnualAmount: 0,
    paymentOnAccountNotPassedOn: 0,
  }
}

function positive(value: number) {
  return Math.max(0, Number.isFinite(value) ? value : 0)
}

function applyScale(base: number, scale: IrpfScaleBracket[]) {
  const safeBase = positive(base)
  if (safeBase === 0) return 0
  const bracket = scale.find(
    (item) => safeBase >= item.base_from_eur && (item.base_to_eur === null || safeBase < item.base_to_eur),
  )
  if (!bracket) return 0
  return bracket.base_quota_eur + ((safeBase - bracket.base_from_eur) * bracket.marginal_percent) / 100
}

function boundedMonths(value: number) {
  return Math.min(12, Math.max(0, Math.trunc(value)))
}

export type InKindBenefitResult = {
  declaredBenefitsTotal: number
  exemptAmount: number
  taxableAmount: number
  paymentOnAccountAdded: number
  breakdown: {
    mealExempt: number
    mealTaxable: number
    transportExempt: number
    transportTaxable: number
    healthExempt: number
    healthTaxable: number
    daycareExempt: number
    daycareTaxable: number
  }
}

export function calculateInKindBenefits2025(input: Irpf2025AdjustmentInput): InKindBenefitResult {
  const mealTotal = positive(input.mealCardDailyAmount) * Math.max(0, Math.trunc(input.mealCardEligibleDays))
  const mealExempt = input.mealCardEligible
    ? Math.min(mealTotal, 11 * Math.max(0, Math.trunc(input.mealCardEligibleDays)))
    : 0
  const transportMonths = boundedMonths(input.transportCardEligibleMonths)
  const transportTotal = positive(input.transportCardMonthlyAmount) * transportMonths
  const transportExempt = input.transportCardEligible
    ? Math.min(transportTotal, 136.36 * transportMonths, 1_500)
    : 0
  const ordinaryPremiums = positive(input.healthInsurancePremiumOrdinaryPersons)
  const disabledPremiums = positive(input.healthInsurancePremiumDisabledPersons)
  const healthTotal = ordinaryPremiums + disabledPremiums
  const healthExempt = input.healthInsuranceEligible
    ? Math.min(ordinaryPremiums, positive(input.healthInsuranceOrdinaryPersonsCount) * 500)
      + Math.min(disabledPremiums, positive(input.healthInsuranceDisabledPersonsCount) * 1_500)
    : 0
  const daycareTotal = positive(input.companyDaycareAnnualAmount)
  const daycareExempt = input.companyDaycareEligible ? daycareTotal : 0
  const declaredBenefitsTotal = mealTotal + transportTotal + healthTotal + daycareTotal
  const exemptAmount = mealExempt + transportExempt + healthExempt + daycareExempt

  return {
    declaredBenefitsTotal,
    exemptAmount,
    taxableAmount: Math.max(0, declaredBenefitsTotal - exemptAmount),
    paymentOnAccountAdded: positive(input.paymentOnAccountNotPassedOn),
    breakdown: {
      mealExempt,
      mealTaxable: Math.max(0, mealTotal - mealExempt),
      transportExempt,
      transportTaxable: Math.max(0, transportTotal - transportExempt),
      healthExempt,
      healthTaxable: Math.max(0, healthTotal - healthExempt),
      daycareExempt,
      daycareTaxable: Math.max(0, daycareTotal - daycareExempt),
    },
  }
}

export function calculateAdditionalWorkExpenses2025(input: Irpf2025AdjustmentInput) {
  const unionDues = positive(input.unionDues)
  const professionalDues = input.professionalMembershipMandatory
    ? Math.min(positive(input.professionalDues), 500)
    : 0
  const legalDefense = Math.min(positive(input.legalDefenseCosts), 300)

  return {
    unionDues,
    professionalDues,
    legalDefense,
    total: unionDues + professionalDues + legalDefense,
  }
}

function workerEmploymentContributionLimit(input: Irpf2025AdjustmentInput) {
  const employer = positive(input.employerPensionContribution)
  if (positive(input.grossIncomeFromPensionEmployer) > 60_000) return employer
  if (employer <= 500) return employer * 2.5
  if (employer <= 1_500) return 1_250 + 0.25 * (employer - 500)
  return employer
}

export type BaseReductionResult = {
  pensionGeneralApplied: number
  pensionEmploymentIncrease: number
  pensionAbsoluteLimit: number
  pensionPercentLimit: number
  pensionApplied: number
  spousePensionApplied: number
  compensatoryPensionApplied: number
  jointTaxationApplied: number
  protectedAssetsApplied: number
  regionalReductionApplied: number
  totalApplied: number
  excessPending: number
}

export function calculateBaseReductions2025(
  input: Irpf2025AdjustmentInput,
  netWorkIncome: number,
  baseAvailable: number,
  legacyBasicPensionContributions = 0,
  legacyVerifiedBaseReductions = 0,
): BaseReductionResult {
  let available = positive(baseAvailable)
  const ordinaryContributions = positive(input.personalPensionContribution)
    + positive(input.mutualityContribution)
    + positive(legacyBasicPensionContributions)
  const employmentInputsComplete = (
    positive(input.employerPensionContribution) + positive(input.workerEmploymentPensionContribution) === 0
    || positive(input.grossIncomeFromPensionEmployer) > 0
  )
  const employerContribution = employmentInputsComplete ? positive(input.employerPensionContribution) : 0
  const workerEmploymentContribution = employmentInputsComplete ? positive(input.workerEmploymentPensionContribution) : 0
  const admissibleWorkerEmployment = Math.min(
    workerEmploymentContribution,
    workerEmploymentContributionLimit(input),
  )
  const pensionEmploymentIncrease = Math.min(
    8_500,
    employerContribution + admissibleWorkerEmployment,
  )
  const pensionAbsoluteLimit = 1_500 + pensionEmploymentIncrease
  const pensionPercentLimit = positive(netWorkIncome) * 0.3
  const pensionContributionsAdmissible = ordinaryContributions
    + employerContribution
    + admissibleWorkerEmployment
  const pensionApplied = Math.min(
    pensionContributionsAdmissible,
    pensionAbsoluteLimit,
    pensionPercentLimit,
    available,
  )
  available -= pensionApplied

  const spousePensionApplied = input.spousePensionEligible
    && positive(input.spouseNetWorkAndBusinessIncome) < 8_000
    ? Math.min(positive(input.spousePensionContribution), 1_000, available)
    : 0
  available -= spousePensionApplied

  const compensatoryPensionApplied = input.compensatoryPensionFormalized
    ? Math.min(positive(input.compensatoryPensionPaid), available)
    : 0
  available -= compensatoryPensionApplied

  const jointTaxationTheoretical = input.jointTaxationType === 'married'
    ? 3_400
    : input.jointTaxationType === 'single_parent'
      ? 2_150
      : 0
  const jointTaxationApplied = Math.min(jointTaxationTheoretical, available)
  available -= jointTaxationApplied

  const protectedAssetsProportionalLimit = positive(input.protectedAssetsTotalContributors) > 24_250
    ? positive(input.protectedAssetsContribution) * 24_250 / positive(input.protectedAssetsTotalContributors)
    : positive(input.protectedAssetsContribution)
  const protectedAssetsApplied = input.protectedAssetsEligible
    ? Math.min(positive(input.protectedAssetsContribution), 10_000, protectedAssetsProportionalLimit, available)
    : 0
  available -= protectedAssetsApplied

  const regionalReductionMetadataComplete = input.regionalReductionVerified
    && input.regionalReductionCode.trim().length > 0
    && input.regionalReductionSourceUrl.trim().length > 0
    && input.regionalReductionCalculation.trim().length > 0
  const regionalReductionApplied = regionalReductionMetadataComplete
    ? Math.min(positive(input.verifiedRegionalReduction), available)
    : 0
  available -= regionalReductionApplied

  const legacyApplied = Math.min(positive(legacyVerifiedBaseReductions), available)
  available -= legacyApplied
  const totalApplied = positive(baseAvailable) - available
  const contributed = pensionContributionsAdmissible
    + positive(input.spousePensionContribution)
    + positive(input.compensatoryPensionPaid)
    + jointTaxationTheoretical
    + positive(input.protectedAssetsContribution)
    + positive(input.verifiedRegionalReduction)
    + positive(legacyVerifiedBaseReductions)

  return {
    pensionGeneralApplied: Math.min(pensionApplied, 1_500),
    pensionEmploymentIncrease,
    pensionAbsoluteLimit,
    pensionPercentLimit,
    pensionApplied,
    spousePensionApplied,
    compensatoryPensionApplied,
    jointTaxationApplied,
    protectedAssetsApplied,
    regionalReductionApplied: regionalReductionApplied + legacyApplied,
    totalApplied,
    excessPending: Math.max(0, contributed - totalApplied),
  }
}

export type IntegralQuotaResult = {
  stateGrossQuota: number
  stateMinimumQuota: number
  stateIntegralQuota: number
  regionalGrossQuota: number
  regionalMinimumQuota: number
  regionalIntegralQuota: number
  childSupportSpecialityApplied: boolean
}

export function calculateIntegralQuotas2025(
  input: Irpf2025AdjustmentInput,
  taxableBase: number,
  stateMinimum: number,
  regionalMinimum: number,
  stateScale: IrpfScaleBracket[],
  regionalScale: IrpfScaleBracket[],
): IntegralQuotaResult {
  const base = positive(taxableBase)
  const childSupport = positive(input.childSupportPaid)
  const speciality = input.childSupportFormalized
    && input.childSupportMinimumExcluded
    && childSupport > 0
    && childSupport < base
  const stateGrossQuota = speciality
    ? applyScale(childSupport, stateScale) + applyScale(base - childSupport, stateScale)
    : applyScale(base, stateScale)
  const regionalGrossQuota = speciality
    ? applyScale(childSupport, regionalScale) + applyScale(base - childSupport, regionalScale)
    : applyScale(base, regionalScale)
  const minimumIncrement = speciality ? 1_980 : 0
  const stateMinimumQuota = applyScale(
    Math.min(positive(stateMinimum) + minimumIncrement, base),
    stateScale,
  )
  const regionalMinimumQuota = applyScale(
    Math.min(positive(regionalMinimum) + minimumIncrement, base),
    regionalScale,
  )

  return {
    stateGrossQuota,
    stateMinimumQuota,
    stateIntegralQuota: Math.max(0, stateGrossQuota - stateMinimumQuota),
    regionalGrossQuota,
    regionalMinimumQuota,
    regionalIntegralQuota: Math.max(0, regionalGrossQuota - regionalMinimumQuota),
    childSupportSpecialityApplied: speciality,
  }
}

export type GeneralDeductionResult = {
  donationDeduction: number
  rentDeduction: number
  homeStateDeduction: number
  homeRegionalDeduction: number
  newCompanyDeduction: number
  regionalVerifiedDeduction: number
  stateApplied: number
  regionalApplied: number
  totalApplied: number
}

export function calculateGeneralDeductions2025(
  input: Irpf2025AdjustmentInput,
  baseImponibleTotal: number,
  baseLiquidableTotal: number,
  stateIntegralQuota: number,
  regionalIntegralQuota: number,
  legacyStateDeduction = 0,
  legacyRegionalDeduction = 0,
): GeneralDeductionResult {
  const donationBase = input.donationLaw49Eligible
    ? Math.min(positive(input.donationAmount), positive(baseLiquidableTotal) * 0.1)
    : 0
  const donationRecurring = positive(input.donation2024) >= positive(input.donation2023)
    && positive(input.donationAmount) >= positive(input.donation2024)
    && positive(input.donation2023) > 0
  const donationDeduction = Math.min(donationBase, 250) * 0.8
    + Math.max(0, donationBase - 250) * (donationRecurring ? 0.45 : 0.4)

  let rentMaximumBase = 0
  if (input.rentContractBefore2015 && input.rentPaidBefore2015 && input.rentPriorDeductionRight && input.rentIsMainHome) {
    rentMaximumBase = baseImponibleTotal <= 17_707.2
      ? 9_040
      : baseImponibleTotal < 24_107.2
        ? Math.max(0, 9_040 - 1.4125 * (baseImponibleTotal - 17_707.2))
        : 0
  }
  const rentDeduction = Math.min(positive(input.rentPaid), rentMaximumBase) * 0.1005

  const homeEligibleBase = input.homeTransitionalRight
    ? Math.min(positive(input.homeInvestmentPaid) * Math.min(100, positive(input.homeOwnershipPercent)) / 100, 9_040)
    : 0
  const homeStateDeduction = homeEligibleBase * 0.075
  const homeRegionalRate = input.homeRegionalRate === 9 && input.homeRegionalSpecialVerified ? 0.09 : 0.075
  const homeRegionalDeduction = homeEligibleBase * homeRegionalRate
  const newCompanyDeduction = input.newCompanyRequirementsVerified
    ? Math.min(positive(input.newCompanyInvestment), 100_000) * 0.5
    : 0
  const regionalDeductionMetadataComplete = input.regionalDeductionVerified
    && input.regionalDeductionCode.trim().length > 0
    && input.regionalDeductionSourceUrl.trim().length > 0
    && input.regionalDeductionCalculation.trim().length > 0
  const regionalVerifiedDeduction = regionalDeductionMetadataComplete
    ? positive(input.verifiedRegionalDeduction)
    : 0

  const stateTheoretical = donationDeduction * 0.5
    + rentDeduction * 0.5
    + homeStateDeduction
    + newCompanyDeduction
    + positive(legacyStateDeduction)
  const regionalTheoretical = donationDeduction * 0.5
    + rentDeduction * 0.5
    + homeRegionalDeduction
    + regionalVerifiedDeduction
    + positive(legacyRegionalDeduction)
  const stateApplied = Math.min(positive(stateIntegralQuota), stateTheoretical)
  const regionalApplied = Math.min(positive(regionalIntegralQuota), regionalTheoretical)

  return {
    donationDeduction,
    rentDeduction,
    homeStateDeduction,
    homeRegionalDeduction,
    newCompanyDeduction,
    regionalVerifiedDeduction,
    stateApplied,
    regionalApplied,
    totalApplied: stateApplied + regionalApplied,
  }
}

export type RefundableDeductionResult = {
  maternityGenerated: number
  daycareGenerated: number
  largeFamilyGenerated: number
  disabilityGenerated: number
  generatedTotal: number
  advancesReceived: number
  netRefundable: number
  declarationBeforeRefundables: number
  finalDeclarationResult: number
}

export function calculateRefundableDeductions2025(
  input: Irpf2025AdjustmentInput,
  annualTaxBeforePayments: number,
): RefundableDeductionResult {
  const maternityChildren = Math.max(1, Math.trunc(positive(input.maternityEligibleChildren)))
  const maternityBonusCount = Math.min(
    maternityChildren,
    Math.max(
      Math.trunc(positive(input.maternityOneTime150Count)),
      input.maternityOneTime150Eligible ? 1 : 0,
    ),
  )
  const maternityGenerated = input.maternityEligible
    ? Math.min(
      maternityChildren * 1_200 + maternityBonusCount * 150,
      positive(input.maternityEligibleMonths) * 100 + maternityBonusCount * 150,
    )
    : 0
  const daycareNetExpense = Math.max(
    0,
    positive(input.daycareTotalExpense)
      - positive(input.daycareSubsidies)
      - positive(input.daycareEmployerExemptAmount),
  )
  const daycareChildren = Math.max(1, Math.trunc(positive(input.daycareEligibleChildren)))
  const daycareGenerated = input.daycareEligible && input.maternityEligible
    ? Math.min(daycareChildren * 1_000, positive(input.daycareFullMonths) * (1_000 / 12), daycareNetExpense)
    : 0
  const familyAnnualBase = input.largeFamilyCategory === 'special' ? 2_400 : input.largeFamilyCategory === 'general' ? 1_200 : 0
  const refundableLimit = input.refundableBenefitEntitlement
    ? Number.POSITIVE_INFINITY
    : positive(input.refundableContributionLimit)
  const largeFamilyTheoretical = input.largeFamilyEligible
    ? (
      familyAnnualBase / 12 * boundedMonths(input.largeFamilyEligibleMonths)
      + positive(input.largeFamilyExtraChildren) * 50 * boundedMonths(input.largeFamilyEligibleMonths)
    ) * Math.min(1, positive(input.largeFamilyEntitlementShare))
    : 0
  const largeFamilyGenerated = Math.min(largeFamilyTheoretical, refundableLimit)
  const disabilityTheoretical = positive(input.disabilityEligiblePersonMonths)
    * 100
    * Math.min(1, positive(input.disabilityEntitlementShare))
  const disabilityGenerated = Math.min(disabilityTheoretical, refundableLimit)
  const generatedTotal = maternityGenerated + daycareGenerated + largeFamilyGenerated + disabilityGenerated
  const advancesReceived = positive(input.maternityAdvanceReceived)
    + positive(input.largeFamilyAdvanceReceived)
    + positive(input.disabilityAdvanceReceived)
  const netRefundable = generatedTotal - advancesReceived
  const declarationBeforeRefundables = positive(annualTaxBeforePayments)
    - positive(input.withholdings)
    - positive(input.paymentsOnAccount)

  return {
    maternityGenerated,
    daycareGenerated,
    largeFamilyGenerated,
    disabilityGenerated,
    generatedTotal,
    advancesReceived,
    netRefundable,
    declarationBeforeRefundables,
    finalDeclarationResult: declarationBeforeRefundables - generatedTotal + advancesReceived,
  }
}
