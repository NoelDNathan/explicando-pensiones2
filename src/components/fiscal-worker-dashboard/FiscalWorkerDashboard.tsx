import { useCallback, useMemo, useState } from 'react'
import {
  Bookmark,
  Info,
  Share2,
} from 'lucide-react'
import fiscalParams2025Json from '../../../data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json'
import fiscalParams2005Json from '../../../data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2005.json'
import autonomicCoverageJson from '../../../data/processed/fiscal/2026-06-01_aeat-irpf-2025-ccaa-regimen-comun-cobertura.json'
import atEpParamsJson from '../../../data/processed/fiscal/2026-07-12_boe-tarifa-at-ep-2025-seleccion.json'
import {
  WorkerConsumptionTaxesCard,
  WorkerCalculationSourcesCard,
  WorkerContributionLimitsCard,
  WorkerFinalSummaryCard,
  WorkerFiscalStepsCard,
  WorkerFiscalSummaryCard,
  WorkerIrpfRegionComparison,
  WorkerKnowledgeCheckCard,
  WorkerPrivacyNotice,
  WorkerStatsConsent,
  WorkerIrpfTranchesCard,
  WorkerPersonalReductionsCard,
  WorkerSalaryBaseCard,
  WorkerSocialContributionsCard,
  WorkerWealthTaxesCard,
  DEFAULT_AT_EP_2025_CATEGORY_ID,
  calculateSocialContributions,
  getOccupationalAccidentsRate,
  getOccupationalAccidentsCategory,
} from '../worker-salary-dashboard'
import type {
  CalculationSourceItem,
  ContributionGroup,
  ConsumptionTaxesDraft,
  ConsumptionTaxesResult,
  PersonalReductionResult,
  SocialContributionRates,
  WealthTaxesDraft,
  WealthTaxesResult,
  WorkerContractType,
} from '../worker-salary-dashboard'
import type { DisabilityMode } from './types'
import { calculateFamilyMinimum2025 } from './familyMinimum2025'
import { calculateIrpf2025Core } from './irpf2025Calc'
import { calculateGeographicMobilityIncrement2025, calculateInKindBenefits2025 } from './irpf2025Adjustments'
import { VAT_PROXY_SOURCE, estimateVatFromNetSalary } from './vatEpFProxy'
import { describeSource, resolveAtEpSourceRef, resolveFiscalSourceRefs } from './fiscalSourceRefs'
import './FiscalWorkerDashboard.css'
import './FiscalSoftTheme.css'

type ScaleBracket = {
  base_from_eur: number
  base_to_eur: number | null
  base_quota_eur: number
  marginal_percent: number
}

type Minimums = {
  taxpayer_general?: number
  taxpayer_over_65_increment?: number
  taxpayer_over_75_additional_increment?: number
  descendants?: number[]
  descendant_under_3_increment?: number
  ascendant_over_65_or_disabled?: number
  ascendant_over_75_additional_increment?: number
  disability_33_to_64?: number
  disability_65_or_more?: number
  disability_assistance_or_reduced_mobility_increment?: number
  descendant_disability_33_to_64?: number
  descendant_disability_65_or_more?: number
  disability_assistance_or_reduced_mobility_increment_general?: number
  uses_state_minimums_except?: string
}

type FiscalParams = {
  social_security: {
    base_limits_monthly_eur: {
      max_common_contingencies: number
      min_by_group: Array<{ group: number; min: number; max: number; label: string }>
    }
    rates_percent: {
      common_contingencies: { employer: number; employee: number }
      mei: { employer: number; employee: number }
      unemployment_indefinite: { employer: number; employee: number }
      fogasa: { employer: number; employee: number }
      vocational_training: { employer: number; employee: number }
    }
    solidarity_contribution_monthly: Array<{
      from_eur: number
      to_eur: number | null
      employer_percent: number
      employee_percent: number
    }>
  }
  irpf: {
    state_general_scale: ScaleBracket[]
    personal_and_family_minimum_state_eur: Minimums
    work_income_deductible_expenses_eur: {
      general_other_expenses: number
      geographic_mobility_increment: number
      active_worker_disability_33_to_64_increment: number
      active_worker_disability_65_or_more_or_assistance_increment: number
    }
    work_income_reduction_2025: {
      applies_if_work_net_income_below_eur: number
      brackets: Array<{ rnt_from_eur: number; rnt_to_eur: number; formula: string }>
    }
  }
}

type LegacyFiscalParams2005 = {
  social_security: {
    base_limits_monthly_eur: {
      max_common_contingencies: number
      min_by_group: Array<{ group: number; min: number; max: number; label: string }>
    }
    rates_percent: {
      common_contingencies: { employer: number; employee: number }
      unemployment_indefinite: { employer: number; employee: number }
      fogasa: { employer: number; employee: number }
      vocational_training: { employer: number; employee: number }
    }
  }
  irpf: {
    state_general_scale: ScaleBracket[]
    madrid_or_complementary_general_scale: { scale: ScaleBracket[] }
    personal_and_family_base_reductions_eur: {
      taxpayer_general: number
      descendants: number[]
      descendant_under_3_care_reduction: number
      taxpayer_over_65_reduction: number
      taxpayer_over_75_assistance_reduction: number
      ascendant_over_65_or_disabled_reduction: number
      disability_33_to_64: number
      disability_65_or_more: number
      active_worker_disability_33_to_64: number
      active_worker_disability_65_or_more_or_assistance: number
    }
    work_income_reduction_2005: {
      brackets: Array<{
        net_work_income_from_eur: number
        net_work_income_to_eur: number | null
        formula: string
      }>
    }
  }
  vat: { rates_percent: { general: number } }
}

type AutonomicCoverage = {
  scope: { year: number; included_territories: string[] }
  autonomic_general_scales: Record<string, { source_url: string; brackets: ScaleBracket[] }>
  autonomic_personal_family_minimums: {
    override_by_territory: Record<string, Minimums>
  }
  autonomic_deductions: {
    coverage_status: { calculation_ready: boolean }
    priority_families_for_project: string[]
  }
}

type TaxYear = '2025' | '2005'

const fiscalParams2025 = fiscalParams2025Json as FiscalParams
const fiscalParams2005 = fiscalParams2005Json as LegacyFiscalParams2005
const autonomicCoverage = autonomicCoverageJson as AutonomicCoverage

const REGION_LABELS: Record<string, string> = {
  andalucia: 'Andalucia',
  aragon: 'Aragon',
  asturias: 'Asturias',
  illes_balears: 'Illes Balears',
  canarias: 'Canarias',
  cantabria: 'Cantabria',
  castilla_la_mancha: 'Castilla-La Mancha',
  castilla_y_leon: 'Castilla y Leon',
  cataluna: 'Cataluna',
  extremadura: 'Extremadura',
  galicia: 'Galicia',
  madrid: 'Madrid',
  murcia: 'Region de Murcia',
  la_rioja: 'La Rioja',
  comunitat_valenciana: 'Comunitat Valenciana',
}

const CONTRIBUTION_GROUP_LABELS: Record<number, string> = {
  1: 'Ingenieros y Licenciados',
  2: 'Ingenieros Tecnicos, Peritos y Ayudantes Titulados',
  3: 'Jefes Administrativos y de Taller',
  4: 'Ayudantes no Titulados',
  5: 'Oficiales Administrativos',
  6: 'Subalternos',
  7: 'Auxiliares Administrativos',
}

function buildContributionGroups(params: FiscalParams | LegacyFiscalParams2005): ContributionGroup[] {
  return params.social_security.base_limits_monthly_eur.min_by_group.map((group) => ({
    id: group.group,
    name: group.label ?? CONTRIBUTION_GROUP_LABELS[group.group] ?? `Grupo ${group.group}`,
    minBaseMonthly: group.min,
    maxBaseMonthly: group.max,
  }))
}

function formatEuro(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

function applyScale(base: number, scale: ScaleBracket[]) {
  if (base <= 0) return 0
  const bracket = scale.find((item) => base >= item.base_from_eur && (item.base_to_eur === null || base < item.base_to_eur))
  if (!bracket) return 0
  return bracket.base_quota_eur + (base - bracket.base_from_eur) * bracket.marginal_percent / 100
}

function getMinimums(region: string): Minimums {
  const override = autonomicCoverage.autonomic_personal_family_minimums.override_by_territory[region]
  if (!override) return fiscalParams2025.irpf.personal_and_family_minimum_state_eur
  return { ...fiscalParams2025.irpf.personal_and_family_minimum_state_eur, ...override }
}

function familyMinimum(
  minimums: Minimums,
  age: number,
  children: number,
  childrenUnder3: number,
  ascendants: number,
  ascendantsOver75: number,
  disability: DisabilityMode,
  taxpayerDisabilityAssistanceMinimum: number,
  dependentDisabilityMinimum: number,
) {
  let total = minimums.taxpayer_general ?? 0
  if (age > 65) total += minimums.taxpayer_over_65_increment ?? 0
  if (age > 75) total += minimums.taxpayer_over_75_additional_increment ?? 0
  const descendantAmounts = minimums.descendants ?? []
  for (let index = 0; index < children; index += 1) {
    total += descendantAmounts[Math.min(index, descendantAmounts.length - 1)] ?? 0
  }
  total += Math.min(childrenUnder3, children) * (minimums.descendant_under_3_increment ?? 0)
  total += ascendants * (minimums.ascendant_over_65_or_disabled ?? 0)
  total += ascendantsOver75 * (minimums.ascendant_over_75_additional_increment ?? 0)
  if (disability === '33_64') total += minimums.disability_33_to_64 ?? 0
  if (disability === '65_or_more') total += minimums.disability_65_or_more ?? 0
  total += taxpayerDisabilityAssistanceMinimum
  total += dependentDisabilityMinimum
  return total
}

function workReduction2005(netWorkIncome: number, age: number, mobility: boolean) {
  const baseReduction =
    netWorkIncome <= 8200
      ? 3500
      : netWorkIncome <= 13000
        ? Math.max(2400, 3500 - 0.2291 * (netWorkIncome - 8200))
        : 2400
  return baseReduction * (1 + (age >= 65 ? 1 : 0) + (mobility ? 1 : 0))
}

function familyBaseReduction2005(age: number, children: number, childrenUnder3: number, ascendants: number, disability: DisabilityMode) {
  const reductions = fiscalParams2005.irpf.personal_and_family_base_reductions_eur
  let total = reductions.taxpayer_general
  if (age >= 65) total += reductions.taxpayer_over_65_reduction
  if (age >= 75) total += reductions.taxpayer_over_75_assistance_reduction
  for (let index = 0; index < children; index += 1) {
    total += reductions.descendants[Math.min(index, reductions.descendants.length - 1)] ?? 0
  }
  total += Math.min(childrenUnder3, children) * reductions.descendant_under_3_care_reduction
  total += ascendants * reductions.ascendant_over_65_or_disabled_reduction
  if (disability === '33_64') total += reductions.disability_33_to_64 + reductions.active_worker_disability_33_to_64
  if (disability === '65_or_more') total += reductions.disability_65_or_more + reductions.active_worker_disability_65_or_more_or_assistance
  return total
}

function solidarityContribution(monthlySalary: number) {
  return fiscalParams2025.social_security.solidarity_contribution_monthly.reduce(
    (total, bracket) => {
      const to = bracket.to_eur ?? monthlySalary
      const excess = Math.max(0, Math.min(monthlySalary, to) - bracket.from_eur + 0.01)
      return {
        employee: total.employee + excess * 12 * bracket.employee_percent / 100,
        employer: total.employer + excess * 12 * bracket.employer_percent / 100,
      }
    },
    { employee: 0, employer: 0 },
  )
}

function getContributionRatesForYear(taxYear: TaxYear): SocialContributionRates {
  if (taxYear === '2005') {
    const rates = fiscalParams2005.social_security.rates_percent

    return {
      worker: {
        commonContingencies: rates.common_contingencies.employee / 100,
        unemployment: {
          indefinite: rates.unemployment_indefinite.employee / 100,
          temporary: rates.unemployment_indefinite.employee / 100,
          internship: rates.unemployment_indefinite.employee / 100,
          training: 0,
        },
        professionalTraining: rates.vocational_training.employee / 100,
        mei: 0,
      },
      company: {
        commonContingencies: rates.common_contingencies.employer / 100,
        unemployment: {
          indefinite: rates.unemployment_indefinite.employer / 100,
          temporary: rates.unemployment_indefinite.employer / 100,
          internship: rates.unemployment_indefinite.employer / 100,
          training: 0,
        },
        fogasa: rates.fogasa.employer / 100,
        professionalTraining: rates.vocational_training.employer / 100,
        mei: 0,
        occupationalAccidents: 0,
      },
    }
  }

  const rates = fiscalParams2025.social_security.rates_percent

  return {
    worker: {
      commonContingencies: rates.common_contingencies.employee / 100,
      unemployment: {
        indefinite: rates.unemployment_indefinite.employee / 100,
        temporary: rates.unemployment_indefinite.employee / 100,
        internship: rates.unemployment_indefinite.employee / 100,
        training: 0,
      },
      professionalTraining: rates.vocational_training.employee / 100,
      mei: rates.mei.employee / 100,
    },
    company: {
      commonContingencies: rates.common_contingencies.employer / 100,
      unemployment: {
        indefinite: rates.unemployment_indefinite.employer / 100,
        temporary: rates.unemployment_indefinite.employer / 100,
        internship: rates.unemployment_indefinite.employer / 100,
        training: 0,
      },
      fogasa: rates.fogasa.employer / 100,
      professionalTraining: rates.vocational_training.employer / 100,
      mei: rates.mei.employer / 100,
      occupationalAccidents: 0,
    },
  }
}

export function FiscalWorkerDashboard() {
  const [taxYear] = useState<TaxYear>('2025')
  const [salary, setSalary] = useState(35000)
  const [salaryComplements, setSalaryComplements] = useState(0)
  const [region, setRegion] = useState('madrid')
  const [age] = useState(40)
  const [selectedChildren, setSelectedChildren] = useState(0)
  const [children, setChildren] = useState(0)
  const [childrenUnder3, setChildrenUnder3] = useState(0)
  const [selectedAscendants, setSelectedAscendants] = useState(0)
  const [ascendants, setAscendants] = useState(0)
  const [ascendantsOver75, setAscendantsOver75] = useState(0)
  const [disability, setDisability] = useState<DisabilityMode>('none')
  const [dependentDisabilityMinimum, setDependentDisabilityMinimum] = useState(0)
  const [taxpayerDisabilityAssistanceMinimum, setTaxpayerDisabilityAssistanceMinimum] = useState(0)
  const [mobility] = useState(false)
  const [manualAutonomicDeduction] = useState(0)
  const [otherTaxes] = useState(0)
  const [contributionGroupId, setContributionGroupId] = useState(7)
  const [contractType, setContractType] = useState<WorkerContractType>('indefinite')
  const [occupationalAccidentsCategoryId, setOccupationalAccidentsCategoryId] = useState(DEFAULT_AT_EP_2025_CATEGORY_ID)
  const [personalAdjustments, setPersonalAdjustments] = useState<PersonalReductionResult | null>(null)
  const [consumptionTaxes, setConsumptionTaxes] = useState<ConsumptionTaxesResult | null>(null)
  const [consumptionTaxesDraft, setConsumptionTaxesDraft] = useState<ConsumptionTaxesDraft | null>(null)
  const [wealthTaxes, setWealthTaxes] = useState<WealthTaxesResult | null>(null)
  const [wealthTaxesDraft, setWealthTaxesDraft] = useState<WealthTaxesDraft | null>(null)
  const [activeWorkerStepId, setActiveWorkerStepId] = useState(0)
  const hasAssignedConsumption = (consumptionTaxes?.assignedSpendAnnual ?? 0) > 0
  /** IBI + IVTM del paso 9: recurrentes, por eso entran en el resumen mensual. */
  const wealthRecurringTaxAnnual = wealthTaxes?.recurringTaxAnnual ?? 0

  const contributionGroups = useMemo(() => {
    const params = taxYear === '2005' ? fiscalParams2005 : fiscalParams2025
    return buildContributionGroups(params)
  }, [taxYear])

  const handleSalaryBaseValuesChange = useCallback((values: {
    salary: number
    payPeriod: 'annual' | 'monthly'
    payCount: '12' | '14'
    salaryComplements: number
  }) => {
    const baseSalaryAnnual = values.payPeriod === 'annual'
      ? values.salary
      : values.salary * Number(values.payCount)
    setSalary(baseSalaryAnnual)
    setSalaryComplements(values.salaryComplements)
  }, [])

  const handleUserBaseAnnualChange = useCallback((baseAnnual: number) => {
    setSalary(Math.max(0, baseAnnual - salaryComplements))
  }, [salaryComplements])

  const handlePersonalResultChange = useCallback((personalResult: PersonalReductionResult) => {
    setPersonalAdjustments(personalResult)
    setSelectedChildren(personalResult.children)
    setChildren(personalResult.eligibleChildren)
    setChildrenUnder3(personalResult.childrenUnder3)
    setSelectedAscendants(personalResult.ascendants)
    setAscendants(personalResult.eligibleAscendants)
    setAscendantsOver75(personalResult.ascendantsOver75)
    setDependentDisabilityMinimum(personalResult.dependentDisabilityMinimum)
    setTaxpayerDisabilityAssistanceMinimum(personalResult.taxpayerDisabilityAssistanceMinimum)
    setDisability(personalResult.disabilityPercent === 0 ? 'none' : personalResult.disabilityPercent === 33 ? '33_64' : '65_or_more')
  }, [])

  const handleIrpfResultChange = useCallback((irpfResult: { region: string }) => {
    if (taxYear !== '2005') setRegion(irpfResult.region)
  }, [taxYear])

  const handleConsumptionTaxesChange = useCallback((nextResult: ConsumptionTaxesResult) => {
    setConsumptionTaxes(nextResult.assignedSpendAnnual > 0 ? nextResult : null)
  }, [])

  const handleConsumptionDraftChange = useCallback((draft: ConsumptionTaxesDraft) => {
    setConsumptionTaxesDraft(draft)
  }, [])

  const handleWealthTaxesChange = useCallback((nextResult: WealthTaxesResult) => {
    setWealthTaxes(nextResult.recurringTaxAnnual > 0 ? nextResult : null)
  }, [])

  const handleWealthDraftChange = useCallback((draft: WealthTaxesDraft) => {
    setWealthTaxesDraft(draft)
  }, [])

  const result = useMemo(() => {
    const effectiveRegion = taxYear === '2005' ? 'madrid' : region
    const grossSalaryAnnual = salary + salaryComplements
    const monthlySalary = grossSalaryAnnual / 12
    const params = taxYear === '2005' ? fiscalParams2005 : fiscalParams2025
    const group = params.social_security.base_limits_monthly_eur.min_by_group.find((item) => item.group === contributionGroupId)
    const minBase = group?.min ?? 0
    const maxBase = group?.max ?? params.social_security.base_limits_monthly_eur.max_common_contingencies
    const contributionBase = Math.min(Math.max(monthlySalary, minBase), maxBase)
    const annualContributionBase = contributionBase * 12
    const extraBaseReductions = personalAdjustments?.reductionsTotal ?? 0
    const explicitDeductions = manualAutonomicDeduction + (personalAdjustments?.deductionsTotal ?? 0)

    if (taxYear === '2005') {
      const rates = fiscalParams2005.social_security.rates_percent
      const employeeRate = rates.common_contingencies.employee + rates.unemployment_indefinite.employee + rates.vocational_training.employee
      const employerRate = rates.common_contingencies.employer + rates.unemployment_indefinite.employer + rates.vocational_training.employer + rates.fogasa.employer
      const employeeSocialSecurity = annualContributionBase * employeeRate / 100
      const employerSocialSecurity = annualContributionBase * employerRate / 100
      const pensionsContribution = annualContributionBase * (rates.common_contingencies.employee + rates.common_contingencies.employer) / 100
      const netWorkIncomeBeforeReduction = Math.max(0, grossSalaryAnnual - employeeSocialSecurity)
      const reduction = workReduction2005(netWorkIncomeBeforeReduction, age, mobility)
      const personalFamilyReduction = familyBaseReduction2005(age, children, childrenUnder3, ascendants, disability)
      const taxableBase = Math.max(0, netWorkIncomeBeforeReduction - reduction - personalFamilyReduction - extraBaseReductions)
      const stateTax = applyScale(taxableBase, fiscalParams2005.irpf.state_general_scale)
      const regionalTax = applyScale(taxableBase, fiscalParams2005.irpf.madrid_or_complementary_general_scale.scale)
      const irpfBeforeDeductions = stateTax + regionalTax
      const irpf = Math.max(0, irpfBeforeDeductions - explicitDeductions)
      const netSalary = grossSalaryAnnual - employeeSocialSecurity - irpf
      const epfVatEstimate = estimateVatFromNetSalary(netSalary)
      const annualConsumption = hasAssignedConsumption ? consumptionTaxes!.totalBudgetAnnual : epfVatEstimate.annualConsumption
      const vatRate = hasAssignedConsumption ? consumptionTaxes!.effectiveRate : epfVatEstimate.vatRate
      const vat = hasAssignedConsumption ? consumptionTaxes!.vatAnnual : epfVatEstimate.vatAnnual
      const contextualOtherTaxes = otherTaxes
        + (consumptionTaxes?.specialTaxesAnnual ?? 0)
        + wealthRecurringTaxAnnual
      const totalContextTax = employeeSocialSecurity + irpf + vat + contextualOtherTaxes

      return {
        taxYear,
        effectiveRegion,
        grossSalaryAnnual,
        contributionGroupId: group?.group ?? contributionGroupId,
        contributionGroupLabel: group?.label ?? CONTRIBUTION_GROUP_LABELS[contributionGroupId] ?? `Grupo ${contributionGroupId}`,
        contributionBase,
        employeeSocialSecurity,
        employerSocialSecurity,
        pensionsContribution,
        taxableBase,
        stateTax,
        regionalTax,
        stateIntegralQuota: stateTax,
        regionalIntegralQuota: regionalTax,
        stateGrossQuota: stateTax,
        regionalGrossQuota: regionalTax,
        stateScale: fiscalParams2005.irpf.state_general_scale,
        regionalScale: fiscalParams2005.irpf.madrid_or_complementary_general_scale.scale,
        stateMinimum: 0,
        regionalMinimum: 0,
        // En 2005 el minimo personal reducia la base, no la cuota: no hay cuota
        // del minimo que restar ni reparto territorial de deducciones.
        stateMinimumQuota: 0,
        regionalMinimumQuota: 0,
        stateGeneralQuotaDeductions: 0,
        regionalGeneralQuotaDeductions: 0,
        irpfBeforeDeductions,
        irpf,
        workReductionBasis: netWorkIncomeBeforeReduction,
        workReductionApplied: reduction,
        netWorkIncome: netWorkIncomeBeforeReduction,
        netReducedWorkIncome: Math.max(0, netWorkIncomeBeforeReduction - reduction - personalFamilyReduction),
        article19OtherExpensesApplied: 0,
        pensionReductionApplied: extraBaseReductions,
        lowWorkIncomeDeductionApplied: explicitDeductions,
        baseReductionsApplied: extraBaseReductions,
        quotaDeductionsApplied: explicitDeductions,
        generalQuotaDeductionsApplied: explicitDeductions,
        refundableDeductionsGenerated: 0,
        finalDeclarationResult: irpf,
        calculationWarnings: [] as string[],
        netSalary,
        vat,
        vatRate,
        annualConsumption,
        totalContextTax,
        effectiveLaborRate: grossSalaryAnnual > 0 ? (employeeSocialSecurity + irpf) / grossSalaryAnnual * 100 : 0,
        effectiveContextRate: grossSalaryAnnual > 0 ? totalContextTax / grossSalaryAnnual * 100 : 0,
        socialSecurityNote: 'Sin MEI ni solidaridad',
        vatSourceLabel: hasAssignedConsumption ? 'Paso consumo' : `INE EPF 2024: ${epfVatEstimate.vatRate.toLocaleString('es-ES', { maximumFractionDigits: 1 })} % del neto`,
        taxSourceLabel: 'BOE 2005',
        otherTaxSourceLabel: 'Entrada usuario',
        regionalTaxLabel: 'Complementario',
        deductionNote: 'No hay reglas automaticas 2005; solo importe manual verificado.',
        pensionSubtitle: 'Cuota anual con contingencias comunes, desempleo, FP y FOGASA empresa; AT/EP queda fuera por actividad',
      }
    }

    const rates = fiscalParams2025.social_security.rates_percent
    const employeeRate = rates.common_contingencies.employee + rates.unemployment_indefinite.employee + rates.vocational_training.employee + rates.mei.employee
    const employerRate = rates.common_contingencies.employer + rates.unemployment_indefinite.employer + rates.vocational_training.employer + rates.mei.employer
    const solidarity = solidarityContribution(monthlySalary)
    const employeeSocialSecurity = annualContributionBase * employeeRate / 100 + solidarity.employee
    const employerSocialSecurity = annualContributionBase * employerRate / 100 + solidarity.employer
    const pensionsContribution = annualContributionBase * (rates.common_contingencies.employee + rates.common_contingencies.employer + rates.mei.employee + rates.mei.employer) / 100 + solidarity.employee + solidarity.employer
    const disabilityExpense =
      disability === '65_or_more' || (disability === '33_64' && personalAdjustments?.taxpayerAssistance === 'yes')
          ? fiscalParams2025.irpf.work_income_deductible_expenses_eur.active_worker_disability_65_or_more_or_assistance_increment
        : disability === '33_64'
          ? fiscalParams2025.irpf.work_income_deductible_expenses_eur.active_worker_disability_33_to_64_increment
          : 0
    const structuredMobility = personalAdjustments?.adjustments
    const mobilityIncrement = structuredMobility
      ? calculateGeographicMobilityIncrement2025(
        structuredMobility,
        grossSalaryAnnual,
        fiscalParams2025.irpf.work_income_deductible_expenses_eur.geographic_mobility_increment,
      )
      : 0
    const deductibleExpenses =
      fiscalParams2025.irpf.work_income_deductible_expenses_eur.general_other_expenses +
      mobilityIncrement +
      disabilityExpense
    const stateMinimum = personalAdjustments
      ? calculateFamilyMinimum2025({
        minimums: fiscalParams2025.irpf.personal_and_family_minimum_state_eur,
        age,
        disabilityPercent: personalAdjustments.disabilityPercent,
        taxpayerAssistance: personalAdjustments.taxpayerAssistance === 'yes',
        descendants: personalAdjustments.descendantProfiles.slice(0, personalAdjustments.children),
        ascendants: personalAdjustments.ascendantProfiles.slice(0, personalAdjustments.ascendants),
      }).total
      : familyMinimum(fiscalParams2025.irpf.personal_and_family_minimum_state_eur, age, children, childrenUnder3, ascendants, ascendantsOver75, disability, taxpayerDisabilityAssistanceMinimum, dependentDisabilityMinimum)
    const regionalMinimum = personalAdjustments
      ? calculateFamilyMinimum2025({
        minimums: getMinimums(effectiveRegion),
        age,
        disabilityPercent: personalAdjustments.disabilityPercent,
        taxpayerAssistance: personalAdjustments.taxpayerAssistance === 'yes',
        descendants: personalAdjustments.descendantProfiles.slice(0, personalAdjustments.children),
        ascendants: personalAdjustments.ascendantProfiles.slice(0, personalAdjustments.ascendants),
      }).total
      : familyMinimum(getMinimums(effectiveRegion), age, children, childrenUnder3, ascendants, ascendantsOver75, disability, taxpayerDisabilityAssistanceMinimum, dependentDisabilityMinimum)
    const regionalScale = autonomicCoverage.autonomic_general_scales[effectiveRegion]?.brackets ?? autonomicCoverage.autonomic_general_scales.madrid.brackets
    const inKindBenefits = personalAdjustments
      ? calculateInKindBenefits2025(personalAdjustments.adjustments)
      : null
    const taxableWorkIncome = Math.max(
      0,
      grossSalaryAnnual
        - (inKindBenefits?.exemptAmount ?? 0)
        + (inKindBenefits?.paymentOnAccountAdded ?? 0),
    )
    const coreIrpf = calculateIrpf2025Core({
      grossWorkIncome: taxableWorkIncome,
      article19ExpensesBeforeOtherExpenses: employeeSocialSecurity,
      article19OtherExpenses: deductibleExpenses,
      stateMinimum,
      regionalMinimum,
      stateScale: fiscalParams2025.irpf.state_general_scale,
      regionalScale,
      regionalQuotaDeductions: manualAutonomicDeduction,
      adjustments: personalAdjustments?.adjustments,
    })
    const { taxableBase, stateTax, regionalTax, irpf } = coreIrpf
    // Reparto de los gastos del art. 19 para explicar la ecuacion del paso 5:
    // bruto - Seguridad Social - gastos deducibles = rendimiento neto del trabajo.
    const socialSecurityWorkExpense = Math.min(employeeSocialSecurity, coreIrpf.article19ExpensesBeforeOtherExpenses)
    const otherDeductibleWorkExpenses =
      coreIrpf.article19ExpensesBeforeOtherExpenses - socialSecurityWorkExpense + coreIrpf.article19OtherExpensesApplied
    const irpfBeforeDeductions = coreIrpf.liquidQuotaBeforeWorkDeduction
    const netSalary = grossSalaryAnnual - employeeSocialSecurity - irpf
    const epfVatEstimate = estimateVatFromNetSalary(netSalary)
    const annualConsumption = hasAssignedConsumption ? consumptionTaxes!.totalBudgetAnnual : epfVatEstimate.annualConsumption
    const vatRate = hasAssignedConsumption ? consumptionTaxes!.effectiveRate : epfVatEstimate.vatRate
    const vat = hasAssignedConsumption ? consumptionTaxes!.vatAnnual : epfVatEstimate.vatAnnual
    const contextualOtherTaxes = otherTaxes
      + (consumptionTaxes?.specialTaxesAnnual ?? 0)
      + wealthRecurringTaxAnnual
    const totalContextTax = employeeSocialSecurity + irpf + vat + contextualOtherTaxes

    return {
      taxYear,
      effectiveRegion,
      grossSalaryAnnual,
      contributionGroupId: group?.group ?? contributionGroupId,
      contributionGroupLabel: group?.label ?? CONTRIBUTION_GROUP_LABELS[contributionGroupId] ?? `Grupo ${contributionGroupId}`,
      contributionBase,
      employeeSocialSecurity,
      employerSocialSecurity,
      pensionsContribution,
      taxableBase,
      stateTax,
      regionalTax,
      stateIntegralQuota: coreIrpf.stateIntegralQuota,
      regionalIntegralQuota: coreIrpf.regionalIntegralQuota,
      stateGrossQuota: coreIrpf.stateGrossQuota,
      regionalGrossQuota: coreIrpf.regionalGrossQuota,
      stateScale: fiscalParams2025.irpf.state_general_scale,
      regionalScale,
      stateMinimum,
      regionalMinimum,
      stateMinimumQuota: coreIrpf.stateMinimumQuota,
      regionalMinimumQuota: coreIrpf.regionalMinimumQuota,
      stateGeneralQuotaDeductions: coreIrpf.generalDeductions.stateApplied,
      regionalGeneralQuotaDeductions: coreIrpf.generalDeductions.regionalApplied,
      irpfBeforeDeductions,
      irpf,
      workReductionBasis: coreIrpf.workReductionBasis,
      workReductionApplied: coreIrpf.workReductionApplied,
      netWorkIncome: coreIrpf.netWorkIncome,
      netReducedWorkIncome: coreIrpf.netReducedWorkIncome,
      article19OtherExpensesApplied: coreIrpf.article19OtherExpensesApplied,
      taxableWorkIncome,
      socialSecurityWorkExpense,
      otherDeductibleWorkExpenses,
      generalOtherExpenses: fiscalParams2025.irpf.work_income_deductible_expenses_eur.general_other_expenses,
      pensionReductionApplied: coreIrpf.pensionReductionApplied,
      lowWorkIncomeDeductionApplied: coreIrpf.lowWorkIncomeDeductionApplied,
      baseReductionsApplied: coreIrpf.baseReductions.totalApplied,
      quotaDeductionsApplied: coreIrpf.quotaDeductionsApplied,
      generalQuotaDeductionsApplied: coreIrpf.generalDeductions.totalApplied,
      refundableDeductionsGenerated: coreIrpf.refundableDeductions.generatedTotal,
      finalDeclarationResult: coreIrpf.refundableDeductions.finalDeclarationResult,
      calculationWarnings: [...coreIrpf.warnings],
      netSalary,
      vat,
      vatRate,
      annualConsumption,
      totalContextTax,
      effectiveLaborRate: grossSalaryAnnual > 0 ? (employeeSocialSecurity + irpf) / grossSalaryAnnual * 100 : 0,
      effectiveContextRate: grossSalaryAnnual > 0 ? totalContextTax / grossSalaryAnnual * 100 : 0,
      socialSecurityNote: 'Incluye MEI',
      vatSourceLabel: hasAssignedConsumption ? 'Paso consumo' : `INE EPF 2024: ${epfVatEstimate.vatRate.toLocaleString('es-ES', { maximumFractionDigits: 1 })} % del neto`,
      taxSourceLabel: 'AEAT/BOE 2025',
      otherTaxSourceLabel: 'Entrada usuario / AEAT IART',
      regionalTaxLabel: 'Autonomico',
      deductionNote: 'El catalogo AEAT 2025 esta localizado por comunidad. Esta pantalla no aplica reglas automaticas si faltan campos del usuario; permite introducir solo importes ya verificados para no simular requisitos.',
      pensionSubtitle: 'Cuota anual con contingencias comunes, desempleo, FP, MEI y solidaridad si procede',
    }
  }, [age, ascendants, ascendantsOver75, children, childrenUnder3, consumptionTaxes, contributionGroupId, dependentDisabilityMinimum, disability, hasAssignedConsumption, manualAutonomicDeduction, mobility, otherTaxes, personalAdjustments, region, salary, salaryComplements, taxpayerDisabilityAssistanceMinimum, taxYear, wealthRecurringTaxAnnual])

  const baseContributionRates = useMemo(() => getContributionRatesForYear(taxYear), [taxYear])
  const contributionRates = useMemo<SocialContributionRates>(() => ({
    ...baseContributionRates,
    company: {
      ...baseContributionRates.company,
      occupationalAccidents: getOccupationalAccidentsRate(occupationalAccidentsCategoryId),
    },
  }), [baseContributionRates, occupationalAccidentsCategoryId])

  const socialContributions = useMemo(() => calculateSocialContributions({
    grossSalaryAnnual: result.grossSalaryAnnual,
    grossSalaryMonthly: result.grossSalaryAnnual / 12,
    contributionBaseAnnual: result.contributionBase * 12,
    contributionBaseMonthly: result.contributionBase,
    contractType,
    rates: contributionRates,
  }), [contractType, contributionRates, result.contributionBase, result.grossSalaryAnnual])

  const calculationSources = useMemo<CalculationSourceItem[]>(() => {
    const percent = (value: number) => `${(value * 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`
    const regionLabel = REGION_LABELS[result.effectiveRegion] ?? result.effectiveRegion
    const atEpCategory = getOccupationalAccidentsCategory(occupationalAccidentsCategoryId)
    const isLegacyYear = taxYear === '2005'

    // Las fuentes salen del paquete de parametros del ano activo, no de constantes:
    // cada JSON de `data/processed/fiscal` declara su norma, su URL y, si la hay, la
    // correccion de erratas que la acompana.
    // La cobertura por CCAA es un dataset de un ano concreto: solo puede aportar la URL de
    // la comunidad si ese ano es el que se esta calculando. Si no, se usa el manual del
    // propio paquete anual.
    const coverageMatchesYear = autonomicCoverage.scope.year === Number(taxYear)
    const sourceRefs = resolveFiscalSourceRefs(isLegacyYear ? fiscalParams2005Json : fiscalParams2025Json, {
      regionLabel,
      regionSourceUrl: coverageMatchesYear
        ? autonomicCoverage.autonomic_general_scales[result.effectiveRegion]?.source_url
        : undefined,
    })

    const socialSecurityItem: CalculationSourceItem = {
      id: `social-security-${taxYear}`,
      name: 'Bases y tipos de cotizacion del Regimen General',
      ...sourceRefs.socialSecurity,
      values: isLegacyYear
        ? [
            { name: 'Grupo seleccionado', value: `Grupo ${result.contributionGroupId} · ${result.contributionGroupLabel}` },
            { name: 'Base aplicada', value: `${formatEuro(result.contributionBase)}/mes` },
            { name: 'Cuota trabajador', value: formatEuro(socialContributions.workerContributionsAnnual) },
            { name: 'Aportacion empresa', value: formatEuro(socialContributions.companyContributionsAnnual) },
          ]
        : [
            { name: 'Grupo seleccionado', value: `Grupo ${result.contributionGroupId} · ${result.contributionGroupLabel}` },
            { name: 'Base aplicada', value: `${formatEuro(result.contributionBase)}/mes` },
            { name: 'Tipo trabajador', value: percent(socialContributions.workerContributionRate) },
            { name: 'Cuota trabajador', value: formatEuro(socialContributions.workerContributionsAnnual) },
            { name: 'Tipo empresa', value: percent(socialContributions.companyContributionRate) },
            { name: 'Aportacion empresa', value: formatEuro(socialContributions.companyContributionsAnnual) },
          ],
    }

    const atEpItem: CalculationSourceItem = {
      id: `at-ep-${taxYear}`,
      name: 'Tarifa de accidentes de trabajo y enfermedades profesionales',
      ...resolveAtEpSourceRef(atEpParamsJson.sources),
      values: [
        { name: 'Actividad u ocupacion', value: `${atEpCategory.code} · ${atEpCategory.label}` },
        { name: 'IT', value: `${atEpCategory.it_percent.toLocaleString('es-ES')} %` },
        { name: 'IMS', value: `${atEpCategory.ims_percent.toLocaleString('es-ES')} %` },
        { name: 'Total aplicado', value: `${(atEpCategory.it_percent + atEpCategory.ims_percent).toLocaleString('es-ES')} %` },
      ],
    }

    const irpfStateItem: CalculationSourceItem = {
      id: `irpf-state-${taxYear}`,
      name: isLegacyYear ? 'Escala estatal del IRPF' : 'Escala estatal, minimos y reducciones del IRPF',
      ...sourceRefs.irpfState,
      values: isLegacyYear
        ? [
            { name: 'Base liquidable', value: formatEuro(result.taxableBase) },
            { name: 'Cuota estatal', value: formatEuro(result.stateTax) },
          ]
        : [
            { name: 'Base liquidable', value: formatEuro(result.taxableBase) },
            { name: 'Minimo estatal', value: formatEuro(result.stateMinimum) },
            { name: 'Reducciones aplicadas', value: formatEuro(result.baseReductionsApplied) },
            { name: 'Cuota estatal', value: formatEuro(result.stateTax) },
          ],
    }

    const irpfRegionalItem: CalculationSourceItem = {
      id: `irpf-region-${result.effectiveRegion}-${taxYear}`,
      name: isLegacyYear ? 'Escala complementaria de Madrid' : `Escala autonomica del IRPF · ${regionLabel}`,
      ...sourceRefs.irpfRegional,
      values: isLegacyYear
        ? [{ name: 'Cuota complementaria', value: formatEuro(result.regionalTax) }]
        : [
            { name: 'Minimo autonomico', value: formatEuro(result.regionalMinimum) },
            { name: 'Cuota autonomica', value: formatEuro(result.regionalTax) },
            { name: 'Deducciones de cuota', value: formatEuro(result.quotaDeductionsApplied) },
            { name: 'IRPF final', value: formatEuro(result.irpf) },
          ],
    }

    // Con consumo declarado se aplican los tipos oficiales de IVA; sin el, la referencia
    // es el proxy de la EPF, que es otro dataset y por tanto otra fuente.
    const vatItem: CalculationSourceItem = hasAssignedConsumption
      ? {
          id: 'vat-declared-consumption',
          name: 'Tipos de IVA aplicados al consumo declarado',
          ...sourceRefs.vat,
          status: 'estimated',
          values: [
            { name: 'Gasto declarado', value: formatEuro(result.annualConsumption) },
            { name: 'Tipo efectivo calculado', value: `${result.vatRate.toLocaleString('es-ES', { maximumFractionDigits: 2 })} %` },
            { name: 'IVA estimado', value: formatEuro(result.vat) },
          ],
          note: 'Estimacion por categorias: algunas mezclan bienes exentos y varios tipos de IVA.',
        }
      : {
          id: 'vat-epf-proxy',
          name: 'Proxy de IVA medio por nivel de ingresos',
          ...describeSource(VAT_PROXY_SOURCE),
          status: 'estimated',
          values: [
            { name: 'Neto usado como aproximacion', value: formatEuro(result.annualConsumption) },
            { name: 'Tipo efectivo proxy', value: `${result.vatRate.toLocaleString('es-ES', { maximumFractionDigits: 2 })} %` },
            { name: 'IVA estimado', value: formatEuro(result.vat) },
          ],
          note: isLegacyYear
            ? 'Proxy contemporaneo para contexto: no representa el IVA historico observado en 2005.'
            : 'La EPF mide hogares, no salarios individuales; el valor es orientativo y no una liquidacion.',
        }

    return isLegacyYear
      ? [socialSecurityItem, irpfStateItem, irpfRegionalItem, vatItem]
      : [socialSecurityItem, atEpItem, irpfStateItem, irpfRegionalItem, vatItem]
  }, [hasAssignedConsumption, occupationalAccidentsCategoryId, result, socialContributions, taxYear])

  const payrollLiveData = useMemo(() => ({
    grossSalaryAnnual: result.grossSalaryAnnual,
    salaryAnnual: salary,
    salaryComplementsAnnual: salaryComplements,
    inKindSalaryAnnual: personalAdjustments
      ? calculateInKindBenefits2025(personalAdjustments.adjustments).declaredBenefitsTotal
      : 0,
    contributionBaseMonthly: result.contributionBase,
    socialContributions,
    irpfAnnual: result.irpf,
    netSalaryAnnual: result.netSalary,
    rates: contributionRates,
    contractType,
  }), [contractType, contributionRates, personalAdjustments, result.contributionBase, result.grossSalaryAnnual, result.irpf, result.netSalary, salary, salaryComplements, socialContributions])

  const activeWorkerStepCard = (() => {
    switch (activeWorkerStepId) {
      case 0:
        return (
          <WorkerFiscalSummaryCard
            grossSalaryAnnual={result.grossSalaryAnnual}
            employerContributionsAnnual={socialContributions.companyContributionsAnnual}
            workerContributionsAnnual={socialContributions.workerContributionsAnnual}
            irpfAnnual={result.irpf}
            vatAnnual={result.vat}
            onSalaryChange={setSalary}
            onExploreDetails={() => setActiveWorkerStepId(1)}
          />
        )
      case 1:
        return (
          <WorkerSalaryBaseCard
            initialSalary={salary}
            initialPayPeriod="annual"
            initialPayCount="12"
            initialSalaryComplements={salaryComplements}
            onValuesChange={handleSalaryBaseValuesChange}
          />
        )
      case 2:
        return (
          <WorkerContributionLimitsCard
            calculationYear={Number(taxYear)}
            groups={contributionGroups}
            userBaseAnnual={result.grossSalaryAnnual}
            initialGroupId={contributionGroupId}
            sourceLabel={result.taxSourceLabel}
            onUserBaseAnnualChange={handleUserBaseAnnualChange}
            onGroupChange={setContributionGroupId}
          />
        )
      case 3:
        return (
          <WorkerSocialContributionsCard
            year={Number(taxYear)}
            grossSalaryAnnual={result.grossSalaryAnnual}
            baseUsedMonthly={result.contributionBase}
            selectedContributionGroup={`Grupo ${result.contributionGroupId} - ${result.contributionGroupLabel}`}
            isAboveMaximumBase={result.grossSalaryAnnual / 12 > result.contributionBase}
            excessOverMaximumMonthly={Math.max(0, result.grossSalaryAnnual / 12 - result.contributionBase)}
            isBelowMinimumBase={result.grossSalaryAnnual / 12 < result.contributionBase}
            contractType={contractType}
            contributionRates={contributionRates}
            occupationalAccidentsCategoryId={occupationalAccidentsCategoryId}
            onContractTypeChange={setContractType}
            onOccupationalAccidentsCategoryChange={setOccupationalAccidentsCategoryId}
          />
        )
      case 4:
      case 5:
      case 7:
        return (
          <WorkerPersonalReductionsCard
            focus={
              activeWorkerStepId === 4
                ? 'in-kind'
                : activeWorkerStepId === 5
                  ? 'reductions'
                  : 'deductions-benefits'
            }
            stepNumber={activeWorkerStepId}
            totalSteps={12}
            initialChildren={selectedChildren}
            initialAscendants={selectedAscendants}
            initialDisabilityPercent={disability === 'none' ? 0 : disability === '33_64' ? 33 : 65}
            initialResult={personalAdjustments}
            initialBaseBeforeReductions={result.netReducedWorkIncome}
            initialNetWorkIncome={result.netWorkIncome}
            quotaBeforeDeductions={result.stateIntegralQuota + result.regionalIntegralQuota}
            stateIntegralQuota={result.stateIntegralQuota}
            regionalIntegralQuota={result.regionalIntegralQuota}
            stateGrossQuota={result.stateGrossQuota}
            regionalGrossQuota={result.regionalGrossQuota}
            stateMinimumQuotaAmount={result.stateMinimumQuota}
            regionalMinimumQuotaAmount={result.regionalMinimumQuota}
            appliedBaseReductions={result.baseReductionsApplied}
            statePersonalFamilyMinimum={result.stateMinimum}
            regionalPersonalFamilyMinimum={result.regionalMinimum}
            appliedQuotaDeductions={result.quotaDeductionsApplied}
            refundableDeductionsGenerated={result.refundableDeductionsGenerated}
            finalDeclarationResult={result.finalDeclarationResult}
            declaredGrossWorkIncome={result.grossSalaryAnnual}
            region={result.effectiveRegion}
            contributionGroup={result.contributionGroupId}
            taxableWorkIncome={result.taxableWorkIncome}
            socialSecurityWorkExpense={result.socialSecurityWorkExpense}
            otherDeductibleWorkExpenses={result.otherDeductibleWorkExpenses}
            generalOtherExpenses={result.generalOtherExpenses}
            lowWorkIncomeDeductionApplied={result.lowWorkIncomeDeductionApplied}
            engineWarnings={result.calculationWarnings}
            onResultChange={handlePersonalResultChange}
          />
        )
      case 6: {
        const regionOptions = (taxYear === '2005' ? ['madrid'] : autonomicCoverage.scope.included_territories).map(
          (item) => ({ value: item, label: REGION_LABELS[item] ?? item }),
        )
        return (
          <div className="fwd-irpf-step">
            <WorkerIrpfTranchesCard
              initialRegion={result.effectiveRegion}
              initialTaxableBase={result.taxableBase}
              stateTax={result.stateTax}
              regionalTax={result.regionalTax}
              totalTaxAfterDeductions={result.irpf}
              totalQuotaDeduction={result.lowWorkIncomeDeductionApplied}
              generalQuotaDeductions={result.generalQuotaDeductionsApplied}
              stateScale={result.stateScale}
              regionalScale={result.regionalScale}
              stateMinimum={result.stateMinimum}
              regionalMinimum={result.regionalMinimum}
              stateMinimumQuota={result.stateMinimumQuota}
              regionalMinimumQuota={result.regionalMinimumQuota}
              stateGeneralQuotaDeductions={result.stateGeneralQuotaDeductions}
              regionalGeneralQuotaDeductions={result.regionalGeneralQuotaDeductions}
              regionalTaxLabel={result.regionalTaxLabel}
              grossSalary={salary}
              onSalaryChange={setSalary}
              regions={regionOptions}
              onRegionChange={setRegion}
              onResultChange={handleIrpfResultChange}
            />
            {taxYear !== '2005' && (
              <WorkerIrpfRegionComparison
                regions={regionOptions}
                selectedRegion={result.effectiveRegion}
                currentSalary={result.grossSalaryAnnual}
              />
            )}
          </div>
        )
      }
      case 8:
        return (
          <WorkerConsumptionTaxesCard
            initialBudgetAnnual={consumptionTaxesDraft?.budgetAnnual ?? result.annualConsumption}
            initialDraft={consumptionTaxesDraft}
            onDraftChange={handleConsumptionDraftChange}
            onResultChange={handleConsumptionTaxesChange}
          />
        )
      case 9:
        return (
          <WorkerWealthTaxesCard
            initialDraft={wealthTaxesDraft}
            onDraftChange={handleWealthDraftChange}
            onResultChange={handleWealthTaxesChange}
          />
        )
      case 10:
        return (
          <WorkerFinalSummaryCard
            grossSalaryAnnual={result.grossSalaryAnnual}
            employerContributionsAnnual={socialContributions.companyContributionsAnnual}
            workerContributionsAnnual={socialContributions.workerContributionsAnnual}
            irpfAnnual={result.irpf}
            vatAnnual={result.vat}
            specialTaxesAnnual={consumptionTaxes?.specialTaxesAnnual ?? 0}
            propertyTaxAnnual={wealthTaxes?.propertyTaxAnnual ?? 0}
            vehicleTaxAnnual={wealthTaxes?.vehicleTaxAnnual ?? 0}
            propertyPurchaseTaxTotal={wealthTaxes?.propertyPurchaseTaxTotal ?? 0}
            vehiclePurchaseTaxTotal={wealthTaxes?.vehiclePurchaseTaxTotal ?? 0}
            onSalaryChange={setSalary}
            onGoToWealthStep={() => setActiveWorkerStepId(9)}
            onContinue={() => setActiveWorkerStepId(12)}
          />
        )
      case 11:
        return <WorkerKnowledgeCheckCard onGoToStep={setActiveWorkerStepId} nextStepId={12} />
      case 12:
        return <WorkerCalculationSourcesCard year={Number(taxYear)} items={calculationSources} />
      default:
        return <WorkerSalaryBaseCard initialSalary={salary} initialPayPeriod="annual" initialPayCount="12" />
    }
  })()

  return (
    <div className="fwd fwd--soft">
      <main className="fwd-main">
        <header className="fwd-header">
          <div>
            <h2>Calculadora fiscal del trabajador {taxYear}</h2>
            <p>{taxYear === '2005' ? 'Calculo legacy para Regimen General y caso base Comunidad de Madrid.' : 'Calculo anual para Regimen General con IRPF estatal y autonomico de comunidades de regimen comun.'}</p>
          </div>
          <div className="fwd-actions">
            <button type="button"><Bookmark size={16} /> Guardar</button>
            <button type="button"><Share2 size={16} /> Compartir</button>
            <button type="button" aria-label="Informacion"><Info size={18} /></button>
          </div>
        </header>

        {activeWorkerStepId === 0 ? (
          <>
            <WorkerPrivacyNotice />
            <WorkerStatsConsent />
          </>
        ) : null}

        {activeWorkerStepId !== 0 ? (
          <WorkerFiscalStepsCard
            activeStepId={activeWorkerStepId}
            onStepChange={setActiveWorkerStepId}
            payrollLiveData={payrollLiveData}
          />
        ) : null}

        <section className="fwd-worker-dashboard" aria-label="Pasos detallados del worker salary dashboard">
          <div className="fwd-worker-card">
            {activeWorkerStepCard}
          </div>
        </section>

      </main>
    </div>
  )
}

export default FiscalWorkerDashboard
