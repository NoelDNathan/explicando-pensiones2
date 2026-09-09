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

const confirmedNoOtherIncome = createEmptyIrpf2025Adjustments()
confirmedNoOtherIncome.otherIncomeKnown = true
confirmedNoOtherIncome.otherNonExemptNonWorkIncome = 0
const confirmedNoOtherIncomeResult = calculateCase(18_000, 0, confirmedNoOtherIncome)
assert.equal(roundCents(confirmedNoOtherIncomeResult.workReductionApplied), 3_834.2)
assert.equal(roundCents(confirmedNoOtherIncomeResult.lowWorkIncomeDeductionApplied), 55.2)
assert.equal(confirmedNoOtherIncomeResult.warnings.length, 0)

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
healthBenefits.healthInsuranceOrdinaryPersonsCount = 1
healthBenefits.healthInsuranceDisabledPersonsCount = 1
const healthResult = calculateInKindBenefits2025(healthBenefits)
assert.equal(roundCents(healthResult.exemptAmount), 2_000)
assert.equal(roundCents(healthResult.taxableAmount), 300)

const healthPeople = createEmptyIrpf2025Adjustments()
healthPeople.healthInsuranceEligible = true
healthPeople.healthInsurancePremiumOrdinaryPersons = 2_000
healthPeople.healthInsuranceOrdinaryPersonsCount = 3
healthPeople.healthInsuranceDisabledPersonsCount = 0
const healthPeopleResult = calculateInKindBenefits2025(healthPeople)
assert.equal(roundCents(healthPeopleResult.exemptAmount), 1_500)
assert.equal(roundCents(healthPeopleResult.taxableAmount), 500)

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
const maternityResult = calculateRefundableDeductions2025(maternity, 3_000)
assert.equal(maternityResult.maternityGenerated, 1_000)
// El recorrido no pregunta por el abono anticipado: lo generado es lo que resta.
assert.equal(maternityResult.netRefundable, 1_000)

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
home.homePriorDeductionRight = true
home.homeOwnershipPercent = 100
const homeResult = calculateGeneralDeductions2025(home, 30_000, 30_000, 20_000, 20_000)
assert.equal(roundCents(homeResult.homeStateDeduction), 678)
assert.equal(roundCents(homeResult.homeRegionalDeduction), 678)

// La DT18 pide comprar antes de 2013 y haberse deducido la vivienda antes de
// esa fecha. Con solo lo primero no hay deduccion.
const homeWithoutPriorRight = createEmptyIrpf2025Adjustments()
homeWithoutPriorRight.homeInvestmentPaid = 10_000
homeWithoutPriorRight.homeTransitionalRight = true
homeWithoutPriorRight.homeOwnershipPercent = 100
const homeWithoutPriorRightResult = calculateGeneralDeductions2025(homeWithoutPriorRight, 30_000, 30_000, 20_000, 20_000)
assert.equal(roundCents(homeWithoutPriorRightResult.homeStateDeduction), 0)
assert.equal(roundCents(homeWithoutPriorRightResult.homeRegionalDeduction), 0)

const newCompany = createEmptyIrpf2025Adjustments()
newCompany.newCompanyInvestment = 10_000
newCompany.newCompanyRequirementsVerified = true
const newCompanyResult = calculateGeneralDeductions2025(newCompany, 30_000, 30_000, 20_000, 20_000)
assert.equal(roundCents(newCompanyResult.newCompanyDeduction), 5_000)
assert.equal(roundCents(newCompanyResult.regionalApplied), 0)

// El tope de las reembolsables ya no se pregunta: lo pone la cotizacion anual
// del trabajador, que es el tercer argumento.
const largeFamily = createEmptyIrpf2025Adjustments()
largeFamily.largeFamilyEligible = true
largeFamily.largeFamilyCategory = 'general'
largeFamily.largeFamilyEligibleMonths = 12
largeFamily.largeFamilyEntitlementShare = 1
assert.equal(calculateRefundableDeductions2025(largeFamily, 3_000, 5_000).largeFamilyGenerated, 1_200)
assert.equal(calculateRefundableDeductions2025(largeFamily, 3_000, 800).largeFamilyGenerated, 800)

// Media custodia: la mitad del importe anual.
const largeFamilyShared = createEmptyIrpf2025Adjustments()
largeFamilyShared.largeFamilyEligible = true
largeFamilyShared.largeFamilyCategory = 'special'
largeFamilyShared.largeFamilyEligibleMonths = 12
largeFamilyShared.largeFamilyEntitlementShare = 0.5
assert.equal(calculateRefundableDeductions2025(largeFamilyShared, 3_000, 5_000).largeFamilyGenerated, 1_200)

// Guarderia: tope de 1.000 EUR por hijo, prorrateado por meses y limitado por
// el gasto real menos lo que ya paga la empresa como especie exenta.
const daycare = createEmptyIrpf2025Adjustments()
daycare.maternityEligible = true
daycare.maternityEligibleChildren = 1
daycare.maternityEligibleMonths = 12
daycare.daycareEligible = true
daycare.daycareTotalExpense = 3_000
daycare.companyDaycareAnnualAmount = 500
assert.equal(calculateRefundableDeductions2025(daycare, 3_000, 5_000).daycareGenerated, 1_000)
const daycarePartial = { ...daycare, daycareTotalExpense: 900, companyDaycareAnnualAmount: 500 }
assert.equal(calculateRefundableDeductions2025(daycarePartial, 3_000, 5_000).daycareGenerated, 400)

// Donativos: sin tramo de recurrencia, todo lo que pasa de 250 EUR va al 40 %.
const donationLarge = createEmptyIrpf2025Adjustments()
donationLarge.donationAmount = 1_250
donationLarge.donationLaw49Eligible = true
const donationLargeResult = calculateGeneralDeductions2025(donationLarge, 30_000, 30_000, 20_000, 20_000)
assert.equal(roundCents(donationLargeResult.donationDeduction), 600)

const checks = goldenCases.length + 30
console.log(`IRPF 2025 verificado: ${checks} comprobaciones superadas.`)
