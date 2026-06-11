import { useCallback, useMemo, useState } from 'react'
import {
  Bookmark,
  Info,
  Share2,
} from 'lucide-react'
import fiscalParams2025Json from '../../../data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json'
import fiscalParams2005Json from '../../../data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2005.json'
import autonomicCoverageJson from '../../../data/processed/fiscal/2026-06-01_aeat-irpf-2025-ccaa-regimen-comun-cobertura.json'
import vatProxyJson from '../../../data/processed/fiscal/2026-06-02_ine-epf-2024-iva-medio-proxy-2025.json'
import { DashboardSidebar } from '../ui/DashboardSidebar'
import type { DashboardSidebarItem } from '../ui/DashboardSidebar'
import { FISCAL_MENU } from './data'
import { FiscalKpiRow } from './FiscalKpiRow'
import type { FiscalKpiItem } from './FiscalKpiRow'
import { MenuIcon } from './MenuIcon'
import {
  WorkerConsumptionTaxesCard,
  WorkerContributionLimitsCard,
  WorkerFiscalStepsCard,
  WorkerIrpfTranchesCard,
  WorkerPersonalReductionsCard,
  WorkerSalaryBaseCard,
  WorkerSocialContributionsCard,
} from '../worker-salary-dashboard'
import type {
  ConsumptionTaxesResult,
  PersonalReductionResult,
  SocialContributionRates,
  WorkerContractType,
} from '../worker-salary-dashboard'
import type { DisabilityMode } from './types'
import './FiscalWorkerDashboard.css'

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
  scope: { included_territories: string[] }
  autonomic_general_scales: Record<string, { source_url: string; brackets: ScaleBracket[] }>
  autonomic_personal_family_minimums: {
    override_by_territory: Record<string, Minimums | { uses_state_minimums_except: string }>
  }
  autonomic_deductions: {
    coverage_status: { calculation_ready: boolean }
    priority_families_for_project: string[]
  }
}

type VatProxy = {
  income_brackets: Array<{
    income_label: string
    mean_household_spending_eur: number
    estimated_vat_included_eur: number
    estimated_effective_vat_percent_on_spending: number
  }>
}

type TaxYear = '2025' | '2005'

const fiscalParams2025 = fiscalParams2025Json as FiscalParams
const fiscalParams2005 = fiscalParams2005Json as LegacyFiscalParams2005
const autonomicCoverage = autonomicCoverageJson as AutonomicCoverage
const vatProxy = vatProxyJson as VatProxy

const FISCAL_SIDEBAR_ITEMS: DashboardSidebarItem[] = FISCAL_MENU.map((item) => ({
  id: item.toLowerCase(),
  label: item,
  icon: <MenuIcon id={item.toLowerCase()} />,
}))

const WORKER_FAQ_ITEMS = [
  {
    question: 'Por que mi base real no coincide siempre con la base de cotizacion?',
    answer: 'Porque la Seguridad Social aplica limites por grupo de cotizacion. Si tu base real queda por debajo del minimo se usa el minimo, y si supera el maximo se usa el tope para las cuotas ordinarias.',
  },
  {
    question: 'Que diferencia hay entre salario bruto, coste de empresa y salario neto?',
    answer: 'El bruto es la remuneracion antes de descuentos. El coste de empresa suma al bruto las cotizaciones que paga la empresa. El neto es lo que recibes despues de restar cotizaciones del trabajador e IRPF.',
  },
  {
    question: 'La aportacion de la empresa se resta de mi nomina?',
    answer: 'No. La parte de empresa forma parte del coste laboral, pero no se descuenta de tu salario bruto. Lo que reduce tu nomina es la cuota del trabajador y la retencion de IRPF.',
  },
  {
    question: 'Subir de tramo de IRPF hace que todo mi salario tribute mas?',
    answer: 'No. El IRPF es progresivo: cada porcentaje se aplica solo a la parte de base que cae dentro de ese tramo. Por eso el tipo efectivo suele ser menor que el ultimo tipo marginal.',
  },
  {
    question: 'Por que el IVA y otros impuestos van separados del neto?',
    answer: 'Porque dependen de como gastas el dinero, no de la nomina. Dos personas con el mismo neto pueden pagar impuestos indirectos distintos si consumen de forma diferente.',
  },
  {
    question: 'Este resultado sustituye mi nomina o mi declaracion?',
    answer: 'No. Es una herramienta didactica para entender ordenes de magnitud y conceptos. Una nomina real puede incluir ajustes, atrasos, beneficios, situaciones personales o reglas no modeladas aqui.',
  },
]

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

function formatEuro(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

function formatPercent(value: number) {
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: 1 })} %`
}

function applyScale(base: number, scale: ScaleBracket[]) {
  if (base <= 0) return 0
  const bracket = scale.find((item) => base >= item.base_from_eur && (item.base_to_eur === null || base < item.base_to_eur))
  if (!bracket) return 0
  return bracket.base_quota_eur + (base - bracket.base_from_eur) * bracket.marginal_percent / 100
}

function getMinimums(region: string): Minimums {
  const override = autonomicCoverage.autonomic_personal_family_minimums.override_by_territory[region]
  if (!override || 'uses_state_minimums_except' in override) {
    return fiscalParams2025.irpf.personal_and_family_minimum_state_eur
  }
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
  dependentDisabilityMinimum: number,
) {
  let total = minimums.taxpayer_general
  if (age >= 65) total += minimums.taxpayer_over_65_increment ?? 0
  if (age >= 75) total += minimums.taxpayer_over_75_additional_increment ?? 0
  const descendantAmounts = minimums.descendants ?? []
  for (let index = 0; index < children; index += 1) {
    total += descendantAmounts[Math.min(index, descendantAmounts.length - 1)] ?? 0
  }
  total += Math.min(childrenUnder3, children) * (minimums.descendant_under_3_increment ?? 0)
  total += ascendants * (minimums.ascendant_over_65_or_disabled ?? 0)
  total += ascendantsOver75 * (minimums.ascendant_over_75_additional_increment ?? 0)
  if (disability === '33_64') total += minimums.disability_33_to_64 ?? 0
  if (disability === '65_or_more') total += minimums.disability_65_or_more ?? 0
  total += dependentDisabilityMinimum
  return total
}

function workReduction2025(netWorkIncome: number) {
  const reduction = fiscalParams2025.irpf.work_income_reduction_2025
  if (netWorkIncome >= reduction.applies_if_work_net_income_below_eur) return 0
  if (netWorkIncome <= 14852) return 7302
  if (netWorkIncome <= 17673.52) return 7302 - 1.75 * (netWorkIncome - 14852)
  return Math.max(0, 2364.34 - 1.14 * (netWorkIncome - 17673.52))
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

function FiscalLogo() {
  return (
    <span className="fwd-managed-logo" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

function FiscalSidebar() {
  return (
    <DashboardSidebar
      className="fwd-sidebar"
      brand={{ title: 'Calculadora Fiscal', subtitle: 'del Trabajador', icon: <FiscalLogo /> }}
      items={FISCAL_SIDEBAR_ITEMS}
      activeItemId={FISCAL_SIDEBAR_ITEMS[0].id}
      infoCard={{
        title: 'Datos trazables',
        body: '2025 usa BOE/AEAT e IVA proxy EPF; 2005 usa paquete legacy BOE para Madrid.',
      }}
      ctaLabel="Ver metodologia"
      footerText="Aviso legal - Privacidad - Terminos"
    />
  )
}

export function FiscalWorkerDashboard() {
  const [taxYear] = useState<TaxYear>('2025')
  const [salary, setSalary] = useState(35000)
  const [salaryComplements, setSalaryComplements] = useState(0)
  const [inKindSalary, setInKindSalary] = useState(0)
  const [region, setRegion] = useState('madrid')
  const [age] = useState(40)
  const [children, setChildren] = useState(0)
  const [childrenUnder3, setChildrenUnder3] = useState(0)
  const [ascendants, setAscendants] = useState(0)
  const [ascendantsOver75, setAscendantsOver75] = useState(0)
  const [disability, setDisability] = useState<DisabilityMode>('none')
  const [dependentDisabilityMinimum, setDependentDisabilityMinimum] = useState(0)
  const [mobility] = useState(false)
  const [monthlyConsumption] = useState(1700)
  const [manualAutonomicDeduction] = useState(0)
  const [otherTaxes] = useState(0)
  const [contributionGroupId, setContributionGroupId] = useState(7)
  const [contractType, setContractType] = useState<WorkerContractType>('indefinite')
  const [personalAdjustments, setPersonalAdjustments] = useState<PersonalReductionResult | null>(null)
  const [consumptionTaxes, setConsumptionTaxes] = useState<ConsumptionTaxesResult | null>(null)
  const [activeWorkerStepId, setActiveWorkerStepId] = useState(1)

  const handleSalaryBaseValuesChange = useCallback((values: {
    salary: number
    payPeriod: 'annual' | 'monthly'
    payCount: '12' | '14'
    salaryComplements: number
    inKindSalary: number
  }) => {
    const baseSalaryAnnual = values.payPeriod === 'annual'
      ? values.salary
      : values.salary * Number(values.payCount)
    setSalary(baseSalaryAnnual)
    setSalaryComplements(values.salaryComplements)
    setInKindSalary(values.inKindSalary)
  }, [])

  const handlePersonalResultChange = useCallback((personalResult: PersonalReductionResult) => {
    setPersonalAdjustments(personalResult)
    setChildren(personalResult.children)
    setChildrenUnder3(personalResult.childrenUnder3)
    setAscendants(personalResult.ascendants)
    setAscendantsOver75(personalResult.ascendantsOver75)
    setDependentDisabilityMinimum(personalResult.dependentDisabilityMinimum)
    setDisability(personalResult.disabilityPercent === 0 ? 'none' : personalResult.disabilityPercent === 33 ? '33_64' : '65_or_more')
  }, [])

  const handleIrpfResultChange = useCallback((irpfResult: { region: string }) => {
    if (taxYear !== '2005') setRegion(irpfResult.region)
  }, [taxYear])

  const result = useMemo(() => {
    const effectiveRegion = taxYear === '2005' ? 'madrid' : region
    const grossSalaryAnnual = salary + salaryComplements + inKindSalary
    const monthlySalary = grossSalaryAnnual / 12
    const params = taxYear === '2005' ? fiscalParams2005 : fiscalParams2025
    const group = params.social_security.base_limits_monthly_eur.min_by_group.find((item) => item.group === contributionGroupId)
    const minBase = group?.min ?? 0
    const maxBase = params.social_security.base_limits_monthly_eur.max_common_contingencies
    const contributionBase = Math.min(Math.max(monthlySalary, minBase), maxBase)
    const annualContributionBase = contributionBase * 12
    const annualConsumption = monthlyConsumption * 12
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
      const vatRate = fiscalParams2005.vat.rates_percent.general
      const vat = consumptionTaxes?.vatAnnual ?? annualConsumption * vatRate / (100 + vatRate)
      const contextualOtherTaxes = otherTaxes + (consumptionTaxes ? consumptionTaxes.specialTaxesAnnual + consumptionTaxes.propertyTaxAnnual : 0)
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
        irpfBeforeDeductions,
        irpf,
        netSalary,
        vat,
        vatRate,
        annualConsumption,
        totalContextTax,
        effectiveLaborRate: grossSalaryAnnual > 0 ? (employeeSocialSecurity + irpf) / grossSalaryAnnual * 100 : 0,
        effectiveContextRate: grossSalaryAnnual > 0 ? totalContextTax / grossSalaryAnnual * 100 : 0,
        socialSecurityNote: 'Sin MEI ni solidaridad',
        vatSourceLabel: 'IVA general legal 2005',
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
      disability === '33_64'
        ? fiscalParams2025.irpf.work_income_deductible_expenses_eur.active_worker_disability_33_to_64_increment
        : disability === '65_or_more'
          ? fiscalParams2025.irpf.work_income_deductible_expenses_eur.active_worker_disability_65_or_more_or_assistance_increment
          : 0
    const deductibleExpenses =
      fiscalParams2025.irpf.work_income_deductible_expenses_eur.general_other_expenses +
      (mobility ? fiscalParams2025.irpf.work_income_deductible_expenses_eur.geographic_mobility_increment : 0) +
      disabilityExpense
    const netWorkIncomeBeforeReduction = Math.max(0, grossSalaryAnnual - employeeSocialSecurity - deductibleExpenses)
    const reduction = workReduction2025(netWorkIncomeBeforeReduction)
    const taxableBase = Math.max(0, netWorkIncomeBeforeReduction - reduction - extraBaseReductions)
    const stateMinimum = familyMinimum(fiscalParams2025.irpf.personal_and_family_minimum_state_eur, age, children, childrenUnder3, ascendants, ascendantsOver75, disability, dependentDisabilityMinimum)
    const regionalMinimum = familyMinimum(getMinimums(effectiveRegion), age, children, childrenUnder3, ascendants, ascendantsOver75, disability, dependentDisabilityMinimum)
    const regionalScale = autonomicCoverage.autonomic_general_scales[effectiveRegion]?.brackets ?? autonomicCoverage.autonomic_general_scales.madrid.brackets
    const stateTax = Math.max(0, applyScale(taxableBase, fiscalParams2025.irpf.state_general_scale) - applyScale(Math.min(stateMinimum, taxableBase), fiscalParams2025.irpf.state_general_scale))
    const regionalTax = Math.max(0, applyScale(taxableBase, regionalScale) - applyScale(Math.min(regionalMinimum, taxableBase), regionalScale))
    const irpfBeforeDeductions = stateTax + regionalTax
    const irpf = Math.max(0, irpfBeforeDeductions - explicitDeductions)
    const netSalary = grossSalaryAnnual - employeeSocialSecurity - irpf
    const vatBracket = vatProxy.income_brackets.find((item) => item.income_label === 'Total') ?? vatProxy.income_brackets[0]
    const vatRate = vatBracket?.estimated_effective_vat_percent_on_spending ?? 9
    const vat = consumptionTaxes?.vatAnnual ?? annualConsumption * vatRate / 100
    const contextualOtherTaxes = otherTaxes + (consumptionTaxes ? consumptionTaxes.specialTaxesAnnual + consumptionTaxes.propertyTaxAnnual : 0)
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
      irpfBeforeDeductions,
      irpf,
      netSalary,
      vat,
      vatRate,
      annualConsumption,
      totalContextTax,
      effectiveLaborRate: grossSalaryAnnual > 0 ? (employeeSocialSecurity + irpf) / grossSalaryAnnual * 100 : 0,
      effectiveContextRate: grossSalaryAnnual > 0 ? totalContextTax / grossSalaryAnnual * 100 : 0,
      socialSecurityNote: 'Incluye MEI',
      vatSourceLabel: 'INE EPF 2024',
      taxSourceLabel: 'AEAT/BOE 2025',
      otherTaxSourceLabel: 'Entrada usuario / AEAT IART',
      regionalTaxLabel: 'Autonomico',
      deductionNote: 'El catalogo AEAT 2025 esta localizado por comunidad. Esta pantalla no aplica reglas automaticas si faltan campos del usuario; permite introducir solo importes ya verificados para no simular requisitos.',
      pensionSubtitle: 'Cuota anual con contingencias comunes, desempleo, FP, MEI y solidaridad si procede',
    }
  }, [age, ascendants, ascendantsOver75, children, childrenUnder3, consumptionTaxes, contributionGroupId, dependentDisabilityMinimum, disability, inKindSalary, manualAutonomicDeduction, mobility, monthlyConsumption, otherTaxes, personalAdjustments, region, salary, salaryComplements, taxYear])

  const fiscalKpiItems: FiscalKpiItem[] = [
    {
      tone: 'green',
      icon: 'wallet',
      title: 'Salario neto',
      left: { label: 'Anual', value: formatEuro(result.netSalary) },
      right: { label: 'Mensual', value: formatEuro(result.netSalary / 12) },
      badge: `${formatPercent(100 - result.effectiveLaborRate)} del bruto`,
    },
    {
      tone: 'purple',
      icon: 'users',
      title: 'IRPF anual',
      left: { label: 'Estatal', value: formatEuro(result.stateTax) },
      right: { label: result.regionalTaxLabel, value: formatEuro(result.regionalTax) },
      badge: formatEuro(result.irpf),
    },
    {
      tone: 'cyan',
      icon: 'shield',
      title: 'Cotizacion trabajador',
      left: { label: 'Base mensual', value: formatEuro(result.contributionBase) },
      right: { label: 'Cuota anual', value: formatEuro(result.employeeSocialSecurity) },
      badge: `Grupo ${result.contributionGroupId}: ${result.socialSecurityNote}`,
    },
    {
      tone: 'gold',
      icon: 'bank',
      title: 'Aportacion SS total',
      left: { label: 'Empresa', value: formatEuro(result.employerSocialSecurity) },
      right: { label: 'Pensiones', value: formatEuro(result.pensionsContribution) },
      badge: 'Trabajador + empresa',
    },
    {
      tone: 'orange',
      icon: 'receipt',
      title: taxYear === '2005' ? 'IVA legal' : 'IVA proxy',
      left: { label: 'Gasto anual', value: formatEuro(result.annualConsumption) },
      right: { label: 'IVA', value: formatEuro(result.vat) },
      badge: `${result.vatSourceLabel}: ${formatPercent(result.vatRate)}`,
    },
    {
      tone: 'violet',
      icon: 'document',
      title: 'Otros impuestos',
      left: {
        label: consumptionTaxes ? 'Especiales + IBI' : 'Declarado',
        value: formatEuro(consumptionTaxes ? consumptionTaxes.specialTaxesAnnual + consumptionTaxes.propertyTaxAnnual + otherTaxes : otherTaxes),
      },
      right: { label: 'Modulo', value: 'separado' },
      badge: 'No altera el neto laboral',
    },
  ]

  const activeWorkerStepCard = (() => {
    switch (activeWorkerStepId) {
      case 1:
        return (
          <WorkerSalaryBaseCard
            initialSalary={salary}
            initialPayPeriod="annual"
            initialPayCount="12"
            initialSalaryComplements={salaryComplements}
            initialInKindSalary={inKindSalary}
            onValuesChange={handleSalaryBaseValuesChange}
          />
        )
      case 2:
        return (
          <WorkerContributionLimitsCard
            calculationYear={Number(taxYear)}
            userBaseAnnual={result.grossSalaryAnnual}
            initialGroupId={contributionGroupId}
            sourceLabel={result.taxSourceLabel}
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
            contributionRates={getContributionRatesForYear(taxYear)}
            onContractTypeChange={setContractType}
          />
        )
      case 4:
        return (
          <WorkerPersonalReductionsCard
            initialChildren={children}
            initialAscendants={ascendants}
            initialDisabilityPercent={disability === 'none' ? 0 : disability === '33_64' ? 33 : 65}
            onResultChange={handlePersonalResultChange}
          />
        )
      case 5:
        return (
          <WorkerIrpfTranchesCard
            initialRegion={result.effectiveRegion}
            initialTaxableBase={result.taxableBase}
            regions={(taxYear === '2005' ? ['madrid'] : autonomicCoverage.scope.included_territories).map((item) => ({
              value: item,
              label: REGION_LABELS[item] ?? item,
            }))}
            onResultChange={handleIrpfResultChange}
          />
        )
      case 6:
        return (
          <section className="fwd-net-step" aria-labelledby="fwd-net-step-title">
            <header className="fwd-net-step__header">
              <div>
                <span>6.</span>
                <h2 id="fwd-net-step-title">Salario neto</h2>
              </div>
              <p>Aqui ves el dinero que llega a tu bolsillo por tu trabajo: bruto menos cotizaciones del trabajador e IRPF. IVA y otros impuestos van aparte porque dependen de como gastas.</p>
            </header>
            <FiscalKpiRow className="fwd-kpis fwd-kpis--net-step" items={fiscalKpiItems} />
          </section>
        )
      case 7:
        return (
          <WorkerConsumptionTaxesCard
            initialBudgetAnnual={result.annualConsumption}
            onResultChange={setConsumptionTaxes}
          />
        )
      case 8:
        return (
          <section className="fwd-faq-step" aria-labelledby="fwd-faq-step-title">
            <header className="fwd-faq-step__header">
              <div>
                <span>8.</span>
                <h2 id="fwd-faq-step-title">Preguntas frecuentes</h2>
              </div>
              <p>Respuestas cortas para comprobar que estas leyendo bien el salario bruto, las bases, las cuotas, el IRPF y los impuestos de consumo.</p>
            </header>

            <div className="fwd-faq-grid">
              {WORKER_FAQ_ITEMS.map((item) => (
                <article className="fwd-faq-item" key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        )
      default:
        return <WorkerSalaryBaseCard initialSalary={salary} initialPayPeriod="annual" initialPayCount="12" />
    }
  })()

  return (
    <div className="fwd">
      <FiscalSidebar />
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

        <WorkerFiscalStepsCard activeStepId={activeWorkerStepId} onStepChange={setActiveWorkerStepId} />

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
