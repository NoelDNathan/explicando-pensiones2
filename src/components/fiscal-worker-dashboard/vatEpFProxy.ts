import vatProxyJson from '../../../data/processed/fiscal/2026-06-02_ine-epf-2024-iva-medio-proxy-2025.json'

type EpFIncomeBracket = {
  income_label: string
  mean_household_spending_eur: number
  estimated_vat_included_eur: number
  estimated_effective_vat_percent_on_spending: number
}

export type EpFVatEstimate = {
  incomeBracketLabel: string
  monthlyNetIncomeEur: number
  annualConsumption: number
  vatAnnual: number
  vatRate: number
}

const MONTHLY_NET_BRACKET_BOUNDS = [
  { min: 0, max: 499 },
  { min: 500, max: 999 },
  { min: 1_000, max: 1_499 },
  { min: 1_500, max: 1_999 },
  { min: 2_000, max: 2_499 },
  { min: 2_500, max: 2_999 },
  { min: 3_000, max: 4_999 },
  { min: 5_000, max: Number.POSITIVE_INFINITY },
] as const

const householdBrackets = (vatProxyJson.income_brackets as EpFIncomeBracket[])
  .filter((bracket) => bracket.income_label !== 'Total')

const totalHouseholdBracket = (vatProxyJson.income_brackets as EpFIncomeBracket[])
  .find((bracket) => bracket.income_label === 'Total')

export const DEFAULT_VAT_RATE_ON_NET_SALARY_PERCENT =
  totalHouseholdBracket?.estimated_effective_vat_percent_on_spending ?? 9.64

function resolveBracketIndex(monthlyNetIncomeEur: number) {
  const monthlyNet = Math.max(0, monthlyNetIncomeEur)
  const index = MONTHLY_NET_BRACKET_BOUNDS.findIndex(
    (bounds) => monthlyNet >= bounds.min && monthlyNet <= bounds.max,
  )
  return index >= 0 ? index : householdBrackets.length - 1
}

function resolveVatRateOnNetSalary(monthlyNetIncomeEur: number) {
  const bracket = householdBrackets[resolveBracketIndex(monthlyNetIncomeEur)] ?? totalHouseholdBracket
  return bracket?.estimated_effective_vat_percent_on_spending ?? DEFAULT_VAT_RATE_ON_NET_SALARY_PERCENT
}

export function estimateVatFromNetSalary(annualNetSalaryEur: number): EpFVatEstimate {
  const netSalary = Math.max(0, annualNetSalaryEur)
  const monthlyNetIncomeEur = netSalary / 12
  const vatRate = resolveVatRateOnNetSalary(monthlyNetIncomeEur)
  const vatAnnual = netSalary * vatRate / 100
  const bracket = householdBrackets[resolveBracketIndex(monthlyNetIncomeEur)]

  return {
    incomeBracketLabel: bracket?.income_label ?? 'Total',
    monthlyNetIncomeEur,
    annualConsumption: netSalary,
    vatAnnual,
    vatRate,
  }
}

/** @deprecated Usar estimateVatFromNetSalary */
export function estimateVatFromEpFProxy(monthlyNetIncomeEur: number): EpFVatEstimate {
  return estimateVatFromNetSalary(Math.max(0, monthlyNetIncomeEur) * 12)
}
