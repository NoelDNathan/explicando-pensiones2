import assert from 'node:assert/strict'
import fiscalParams from '../data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json' with { type: 'json' }
import autonomicCoverage from '../data/processed/fiscal/2026-06-01_aeat-irpf-2025-ccaa-regimen-comun-cobertura.json' with { type: 'json' }
import {
  calculateIrpf2025Core,
  calculateLowWorkIncomeDeduction2025,
  calculateWorkReduction2025,
} from '../src/components/fiscal-worker-dashboard/irpf2025Calc.ts'

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

function calculateCase(grossWorkIncome, basicPensionContributions = 0) {
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

console.log(`IRPF 2025 verificado: ${goldenCases.length + 4} comprobaciones superadas.`)
