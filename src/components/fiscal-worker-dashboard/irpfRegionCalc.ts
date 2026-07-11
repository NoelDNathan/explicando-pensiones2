/**
 * Calculo de IRPF anual por comunidad autonoma para un perfil tipo, reutilizando
 * los mismos parametros 2025 (BOE/AEAT) que el motor del dashboard fiscal.
 *
 * Perfil base usado en la comparativa (declarado de forma explicita):
 * - trabajador por cuenta ajena, Regimen General, contrato indefinido;
 * - soltero, 40 anos, sin hijos ni ascendientes a cargo, sin discapacidad;
 * - grupo de cotizacion 7;
 * - salario = bruto anual (sin complementos ni salario en especie).
 *
 * Sirve para comparar el efecto de la escala autonomica y el minimo autonomico
 * entre comunidades. No sustituye al calculo personalizado del dashboard.
 */
import fiscalParams2025Json from '../../../data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json'
import autonomicCoverageJson from '../../../data/processed/fiscal/2026-06-01_aeat-irpf-2025-ccaa-regimen-comun-cobertura.json'

type ScaleBracket = {
  base_from_eur: number
  base_to_eur: number | null
  base_quota_eur: number
  marginal_percent: number
}

type Minimums = {
  taxpayer_general: number
  taxpayer_over_65_increment?: number
  taxpayer_over_75_additional_increment?: number
  descendants?: number[]
  descendant_under_3_increment?: number
  ascendant_over_65_or_disabled?: number
  ascendant_over_75_additional_increment?: number
  disability_33_to_64?: number
  disability_65_or_more?: number
  disability_assistance_or_reduced_mobility_increment?: number
}

type FiscalParams2025 = {
  social_security: {
    base_limits_monthly_eur: {
      max_common_contingencies: number
      min_by_group: Array<{ group: number; min: number; max: number }>
    }
    rates_percent: {
      common_contingencies: { employee: number }
      mei: { employee: number }
      unemployment_indefinite: { employee: number }
      vocational_training: { employee: number }
    }
    solidarity_contribution_monthly: Array<{
      from_eur: number
      to_eur: number | null
      employee_percent: number
    }>
  }
  irpf: {
    state_general_scale: ScaleBracket[]
    personal_and_family_minimum_state_eur: Minimums
    work_income_deductible_expenses_eur: { general_other_expenses: number }
    work_income_reduction_2025: { applies_if_work_net_income_below_eur: number }
  }
}

type AutonomicCoverage = {
  scope: { included_territories: string[] }
  autonomic_general_scales: Record<string, { brackets: ScaleBracket[] }>
  autonomic_personal_family_minimums: {
    override_by_territory: Record<string, Minimums | { uses_state_minimums_except: string }>
  }
}

const params = fiscalParams2025Json as unknown as FiscalParams2025
const coverage = autonomicCoverageJson as unknown as AutonomicCoverage

const CONTRIBUTION_GROUP = 7
const TAXPAYER_AGE = 40

function applyScale(base: number, scale: ScaleBracket[]) {
  if (base <= 0) return 0
  const bracket = scale.find(
    (item) => base >= item.base_from_eur && (item.base_to_eur === null || base < item.base_to_eur),
  )
  if (!bracket) return 0
  return bracket.base_quota_eur + ((base - bracket.base_from_eur) * bracket.marginal_percent) / 100
}

function getMinimums(region: string): Minimums {
  const override = coverage.autonomic_personal_family_minimums.override_by_territory[region]
  if (!override || 'uses_state_minimums_except' in override) {
    return params.irpf.personal_and_family_minimum_state_eur
  }
  return { ...params.irpf.personal_and_family_minimum_state_eur, ...override }
}

/** Minimo personal y familiar del perfil base (solo contribuyente, 40 anos). */
function baseMinimum(minimums: Minimums) {
  let total = minimums.taxpayer_general
  if (TAXPAYER_AGE > 65) total += minimums.taxpayer_over_65_increment ?? 0
  if (TAXPAYER_AGE > 75) total += minimums.taxpayer_over_75_additional_increment ?? 0
  return total
}

function workReduction2025(netWorkIncome: number) {
  if (netWorkIncome >= params.irpf.work_income_reduction_2025.applies_if_work_net_income_below_eur) return 0
  if (netWorkIncome <= 14852) return 7302
  if (netWorkIncome <= 17673.52) return 7302 - 1.75 * (netWorkIncome - 14852)
  return Math.max(0, 2364.34 - 1.14 * (netWorkIncome - 17673.52))
}

function solidarityEmployee(monthlySalary: number) {
  return params.social_security.solidarity_contribution_monthly.reduce((total, bracket) => {
    const to = bracket.to_eur ?? monthlySalary
    const excess = Math.max(0, Math.min(monthlySalary, to) - bracket.from_eur + 0.01)
    return total + (excess * 12 * bracket.employee_percent) / 100
  }, 0)
}

export type RegionalIrpfResult = {
  region: string
  grossSalaryAnnual: number
  taxableBase: number
  stateTax: number
  regionalTax: number
  irpf: number
  /** IRPF como porcentaje del salario bruto. */
  effectiveRate: number
}

/** Lista de comunidades cubiertas por el dataset de regimen comun. */
export function getComparableRegions(): string[] {
  return coverage.scope.included_territories
}

/** Calcula el IRPF anual del perfil base para una comunidad y un bruto anual. */
export function computeRegionalIrpf2025(grossSalaryAnnual: number, region: string): RegionalIrpfResult {
  const gross = Math.max(0, grossSalaryAnnual)
  const monthlySalary = gross / 12

  const group = params.social_security.base_limits_monthly_eur.min_by_group.find(
    (item) => item.group === CONTRIBUTION_GROUP,
  )
  const minBase = group?.min ?? 0
  const maxBase = group?.max ?? params.social_security.base_limits_monthly_eur.max_common_contingencies
  const contributionBase = Math.min(Math.max(monthlySalary, minBase), maxBase)
  const annualContributionBase = contributionBase * 12

  const rates = params.social_security.rates_percent
  const employeeRate =
    rates.common_contingencies.employee +
    rates.unemployment_indefinite.employee +
    rates.vocational_training.employee +
    rates.mei.employee
  const employeeSocialSecurity =
    (annualContributionBase * employeeRate) / 100 + solidarityEmployee(monthlySalary)

  const deductibleExpenses = params.irpf.work_income_deductible_expenses_eur.general_other_expenses
  const netWorkIncomeBeforeReduction = Math.max(0, gross - employeeSocialSecurity - deductibleExpenses)
  const reduction = workReduction2025(netWorkIncomeBeforeReduction)
  const taxableBase = Math.max(0, netWorkIncomeBeforeReduction - reduction)

  const stateScale = params.irpf.state_general_scale
  const stateMinimum = baseMinimum(params.irpf.personal_and_family_minimum_state_eur)
  const regionalScale =
    coverage.autonomic_general_scales[region]?.brackets ??
    coverage.autonomic_general_scales.madrid.brackets
  const regionalMinimum = baseMinimum(getMinimums(region))

  const stateTax = Math.max(
    0,
    applyScale(taxableBase, stateScale) - applyScale(Math.min(stateMinimum, taxableBase), stateScale),
  )
  const regionalTax = Math.max(
    0,
    applyScale(taxableBase, regionalScale) - applyScale(Math.min(regionalMinimum, taxableBase), regionalScale),
  )
  const irpf = stateTax + regionalTax

  return {
    region,
    grossSalaryAnnual: gross,
    taxableBase,
    stateTax,
    regionalTax,
    irpf,
    effectiveRate: gross > 0 ? (irpf / gross) * 100 : 0,
  }
}
