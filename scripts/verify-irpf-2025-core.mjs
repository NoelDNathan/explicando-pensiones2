import assert from 'node:assert/strict'
import fiscalParams from '../data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json' with { type: 'json' }
import autonomicCoverage from '../data/processed/fiscal/2026-06-01_aeat-irpf-2025-ccaa-regimen-comun-cobertura.json' with { type: 'json' }
import {
  calculateIrpf2025Core,
  calculateLowWorkIncomeDeduction2025,
  calculateWorkReduction2025,
} from '../src/components/fiscal-worker-dashboard/irpf2025Calc.ts'
import {
  calculateAdditionalWorkExpenses2025,
  calculateGeneralDeductions2025,
  calculateInKindBenefits2025,
  calculateRefundableDeductions2025,
  createEmptyIrpf2025Adjustments,
} from '../src/components/fiscal-worker-dashboard/irpf2025Adjustments.ts'

const stateScale = fiscalParams.irpf.state_general_scale
const regionalScale = autonomicCoverage.autonomic_general_scales.madrid.brackets
const stateMinimum = fiscalParams.irpf.personal_and_family_minimum_state_eur.taxpayer_general
const regionalMinimum = autonomicCoverage.autonomic_personal_family_minimums.override_by_territory.madrid.taxpayer_general
const employeeRate =
  fiscalParams.social_security.rates_percent.common_contingencies.employee +
  fiscalParams.social_security.rates_percent.unemployment_indefinite.employee +
  fiscalParams.social_security.rates_percent.vocational_training.employee +
  fiscalParams.social_security.rates_percent.mei.employee

function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function calculateCase(grossWorkIncome, basicPensionContributions = 0, adjustments) {
  const employeeSocialSecurity = grossWorkIncome * employeeRate / 100
  return calculateIrpf2025Core({
    grossWorkIncome,
    article19ExpensesBeforeOtherExpenses: employeeSocialSecurity,
    article19OtherExpenses: fiscalParams.irpf.work_income_deductible_expenses_eur.general_other_expenses,
    basicPensionContributions,
    stateMinimum,
    regionalMinimum,
    stateScale,
    regionalScale,
    adjustments,
  })
}

const goldenCases = [
  { gross: 16_576, expectedIrpf: 0 },
  { gross: 18_000, expectedIrpf: 891.13 },
  { gross: 20_000, expectedIrpf: 1_882.99 },
  { gross: 35_000, expectedIrpf: 5_899.62 },
]

for (const testCase of goldenCases) {
  const result = calculateCase(testCase.gross)
  assert.equal(
    roundCents(result.irpf),
    testCase.expectedIrpf,
    `IRPF inesperado para ${testCase.gross} EUR`,
  )
}

const eighteenThousand = calculateCase(18_000)
assert.equal(roundCents(eighteenThousand.workReductionBasis), 16_833.6)
assert.equal(roundCents(eighteenThousand.article19OtherExpensesApplied), 2_000)
assert.equal(roundCents(eighteenThousand.workReductionApplied), 3_834.2)
assert.equal(roundCents(eighteenThousand.lowWorkIncomeDeductionApplied), 55.2)

const pensionCase = calculateCase(35_000, 8_000)
assert.equal(roundCents(pensionCase.pensionReductionApplied), 1_500)
assert.equal(roundCents(pensionCase.irpf), 5_482.62)

const reductionBlockedByOtherIncome = calculateWorkReduction2025(16_000, 14_000, 6_500.01)
assert.equal(reductionBlockedByOtherIncome.applied, 0)

const deductionBlockedByOtherIncome = calculateLowWorkIncomeDeduction2025(16_000, 500, 500, 6_500.01)
assert.equal(deductionBlockedByOtherIncome.applied, 0)

const unionOnly = createEmptyIrpf2025Adjustments()
unionOnly.unionDues = 250
unionOnly.professionalDues = 500
assert.equal(calculateAdditionalWorkExpenses2025(unionOnly).total, 250)

const cappedWorkExpenses = createEmptyIrpf2025Adjustments()
cappedWorkExpenses.professionalDues = 800
cappedWorkExpenses.professionalMembershipMandatory = true
cappedWorkExpenses.legalDefenseCosts = 450
assert.deepEqual(calculateAdditionalWorkExpenses2025(cappedWorkExpenses), {
  unionDues: 0,
  professionalDues: 500,
  legalDefense: 300,
  total: 800,
})

const mealBenefits = createEmptyIrpf2025Adjustments()
mealBenefits.mealCardEligible = true
mealBenefits.mealCardDailyAmount = 15
mealBenefits.mealCardEligibleDays = 200
const mealResult = calculateInKindBenefits2025(mealBenefits)
assert.equal(roundCents(mealResult.exemptAmount), 2_200)
assert.equal(roundCents(mealResult.taxableAmount), 800)

const transportBenefits = createEmptyIrpf2025Adjustments()
transportBenefits.transportCardEligible = true
transportBenefits.transportCardMonthlyAmount = 200
transportBenefits.transportCardEligibleMonths = 6
assert.equal(roundCents(calculateInKindBenefits2025(transportBenefits).exemptAmount), 818.16)

const healthBenefits = createEmptyIrpf2025Adjustments()
healthBenefits.healthInsuranceEligible = true
healthBenefits.healthInsurancePremiumOrdinaryPersons = 600
healthBenefits.healthInsurancePremiumDisabledPersons = 1_700
const healthResult = calculateInKindBenefits2025(healthBenefits)
assert.equal(roundCents(healthResult.exemptAmount), 2_000)
assert.equal(roundCents(healthResult.taxableAmount), 300)

const donation = createEmptyIrpf2025Adjustments()
donation.donationAmount = 400
donation.donationLaw49Eligible = true
const donationResult = calculateGeneralDeductions2025(donation, 30_000, 30_000, 20_000, 20_000)
assert.equal(roundCents(donationResult.donationDeduction), 260)
assert.equal(roundCents(donationResult.stateApplied), 130)
assert.equal(roundCents(donationResult.regionalApplied), 130)

const newRent = createEmptyIrpf2025Adjustments()
newRent.rentPaid = 8_000
newRent.rentIsMainHome = true
const newRentResult = calculateGeneralDeductions2025(newRent, 20_000, 20_000, 20_000, 20_000)
assert.equal(newRentResult.rentDeduction, 0)

const maternity = createEmptyIrpf2025Adjustments()
maternity.maternityEligible = true
maternity.maternityEligibleChildren = 1
maternity.maternityEligibleMonths = 10
maternity.maternityAdvanceReceived = 400
const maternityResult = calculateRefundableDeductions2025(maternity, 3_000)
assert.equal(maternityResult.maternityGenerated, 1_000)
assert.equal(maternityResult.netRefundable, 600)

const employerDaycare = createEmptyIrpf2025Adjustments()
employerDaycare.maternityEligible = true
employerDaycare.daycareEligible = true
employerDaycare.daycareEligibleChildren = 1
employerDaycare.daycareFullMonths = 12
employerDaycare.daycareTotalExpense = 1_000
employerDaycare.daycareEmployerExemptAmount = 1_000
assert.equal(calculateRefundableDeductions2025(employerDaycare, 3_000).daycareGenerated, 0)

const employmentPension = createEmptyIrpf2025Adjustments()
employmentPension.employerPensionContribution = 500
employmentPension.workerEmploymentPensionContribution = 1_250
employmentPension.grossIncomeFromPensionEmployer = 35_000
const employmentPensionResult = calculateCase(35_000, 0, employmentPension)
assert.equal(roundCents(employmentPensionResult.pensionReductionApplied), 1_750)
assert.equal(roundCents(employmentPensionResult.baseReductions.pensionAbsoluteLimit), 3_250)

const compensatory = createEmptyIrpf2025Adjustments()
compensatory.compensatoryPensionPaid = 2_000
compensatory.compensatoryPensionFormalized = true
assert.equal(calculateCase(35_000, 0, compensatory).baseReductions.compensatoryPensionApplied, 2_000)

const joint = createEmptyIrpf2025Adjustments()
joint.jointTaxationType = 'married'
assert.equal(calculateCase(35_000, 0, joint).baseReductions.jointTaxationApplied, 3_400)

const eligibleRent = createEmptyIrpf2025Adjustments()
eligibleRent.rentPaid = 9_000
eligibleRent.rentContractBefore2015 = true
eligibleRent.rentPaidBefore2015 = true
eligibleRent.rentPriorDeductionRight = true
eligibleRent.rentIsMainHome = true
const eligibleRentResult = calculateGeneralDeductions2025(eligibleRent, 16_000, 16_000, 20_000, 20_000)
assert.equal(roundCents(eligibleRentResult.rentDeduction), 904.5)

const home = createEmptyIrpf2025Adjustments()
home.homeInvestmentPaid = 10_000
home.homeTransitionalRight = true
home.homeOwnershipPercent = 100
const homeResult = calculateGeneralDeductions2025(home, 30_000, 30_000, 20_000, 20_000)
assert.equal(roundCents(homeResult.homeStateDeduction), 678)
assert.equal(roundCents(homeResult.homeRegionalDeduction), 678)

const newCompany = createEmptyIrpf2025Adjustments()
newCompany.newCompanyInvestment = 10_000
newCompany.newCompanyRequirementsVerified = true
const newCompanyResult = calculateGeneralDeductions2025(newCompany, 30_000, 30_000, 20_000, 20_000)
assert.equal(roundCents(newCompanyResult.newCompanyDeduction), 5_000)
assert.equal(roundCents(newCompanyResult.regionalApplied), 0)

const largeFamily = createEmptyIrpf2025Adjustments()
largeFamily.largeFamilyEligible = true
largeFamily.largeFamilyCategory = 'general'
largeFamily.largeFamilyEligibleMonths = 12
largeFamily.largeFamilyExtraChildren = 1
largeFamily.largeFamilyEntitlementShare = 1
largeFamily.refundableContributionLimit = 5_000
assert.equal(calculateRefundableDeductions2025(largeFamily, 3_000).largeFamilyGenerated, 1_800)

const checks = goldenCases.length + 19
console.log(`IRPF 2025 verificado: ${checks} comprobaciones superadas.`)
