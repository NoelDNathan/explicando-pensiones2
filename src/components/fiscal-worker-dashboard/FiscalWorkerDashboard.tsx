import { useMemo, useState } from 'react'
import {
  Bookmark,
  Calculator,
  FileText,
  HandCoins,
  Info,
  PiggyBank,
  Receipt,
  Share2,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react'
import fiscalParamsJson from '../../../data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json'
import autonomicCoverageJson from '../../../data/processed/fiscal/2026-06-01_aeat-irpf-2025-ccaa-regimen-comun-cobertura.json'
import vatProxyJson from '../../../data/processed/fiscal/2026-06-02_ine-epf-2024-iva-medio-proxy-2025.json'
import { DashboardSidebar } from '../ui/DashboardSidebar'
import type { DashboardSidebarItem } from '../ui/DashboardSidebar'
import { DashboardPanel } from '../ui/DashboardPanel'
import { InfoButton } from '../ui/InfoButton'
import { FISCAL_MENU } from './data'
import { Donut } from './Donut'
import { MenuIcon } from './MenuIcon'
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

type DisabilityMode = 'none' | '33_64' | '65_or_more'

const fiscalParams = fiscalParamsJson as FiscalParams
const autonomicCoverage = autonomicCoverageJson as AutonomicCoverage
const vatProxy = vatProxyJson as VatProxy

const FISCAL_SIDEBAR_ITEMS: DashboardSidebarItem[] = FISCAL_MENU.map((item) => ({
  id: item.toLowerCase(),
  label: item,
  icon: <MenuIcon id={item.toLowerCase()} />,
}))

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
    return fiscalParams.irpf.personal_and_family_minimum_state_eur
  }
  return { ...fiscalParams.irpf.personal_and_family_minimum_state_eur, ...override }
}

function familyMinimum(minimums: Minimums, age: number, children: number, childrenUnder3: number, ascendants: number, disability: DisabilityMode) {
  let total = minimums.taxpayer_general
  if (age >= 65) total += minimums.taxpayer_over_65_increment ?? 0
  if (age >= 75) total += minimums.taxpayer_over_75_additional_increment ?? 0
  const descendantAmounts = minimums.descendants ?? []
  for (let index = 0; index < children; index += 1) {
    total += descendantAmounts[Math.min(index, descendantAmounts.length - 1)] ?? 0
  }
  total += Math.min(childrenUnder3, children) * (minimums.descendant_under_3_increment ?? 0)
  total += ascendants * (minimums.ascendant_over_65_or_disabled ?? 0)
  if (disability === '33_64') total += minimums.disability_33_to_64 ?? 0
  if (disability === '65_or_more') total += minimums.disability_65_or_more ?? 0
  return total
}

function workReduction(netWorkIncome: number) {
  const reduction = fiscalParams.irpf.work_income_reduction_2025
  if (netWorkIncome >= reduction.applies_if_work_net_income_below_eur) return 0
  if (netWorkIncome <= 14852) return 7302
  if (netWorkIncome <= 17673.52) return 7302 - 1.75 * (netWorkIncome - 14852)
  return Math.max(0, 2364.34 - 1.14 * (netWorkIncome - 17673.52))
}

function solidarityContribution(monthlySalary: number) {
  return fiscalParams.social_security.solidarity_contribution_monthly.reduce(
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
        title: '2025 trazable',
        body: 'IRPF y cotizaciones salen de BOE/AEAT; IVA usa EPF 2024 como proxy.',
      }}
      ctaLabel="Ver metodologia"
      footerText="Aviso legal - Privacidad - Terminos"
    />
  )
}

export function FiscalWorkerDashboard() {
  const [salary, setSalary] = useState(35000)
  const [region, setRegion] = useState('madrid')
  const [age, setAge] = useState(40)
  const [children, setChildren] = useState(0)
  const [childrenUnder3, setChildrenUnder3] = useState(0)
  const [ascendants, setAscendants] = useState(0)
  const [disability, setDisability] = useState<DisabilityMode>('none')
  const [mobility, setMobility] = useState(false)
  const [monthlyConsumption, setMonthlyConsumption] = useState(1700)
  const [manualAutonomicDeduction, setManualAutonomicDeduction] = useState(0)
  const [otherTaxes, setOtherTaxes] = useState(0)

  const result = useMemo(() => {
    const group = fiscalParams.social_security.base_limits_monthly_eur.min_by_group.find((item) => item.group === 7)
    const monthlySalary = salary / 12
    const minBase = group?.min ?? 0
    const maxBase = fiscalParams.social_security.base_limits_monthly_eur.max_common_contingencies
    const contributionBase = Math.min(Math.max(monthlySalary, minBase), maxBase)
    const rates = fiscalParams.social_security.rates_percent
    const employeeRate = rates.common_contingencies.employee + rates.unemployment_indefinite.employee + rates.vocational_training.employee + rates.mei.employee
    const employerRate = rates.common_contingencies.employer + rates.unemployment_indefinite.employer + rates.vocational_training.employer + rates.mei.employer
    const solidarity = solidarityContribution(monthlySalary)
    const employeeSocialSecurity = contributionBase * 12 * employeeRate / 100 + solidarity.employee
    const employerSocialSecurity = contributionBase * 12 * employerRate / 100 + solidarity.employer
    const pensionsContribution = contributionBase * 12 * (rates.common_contingencies.employee + rates.common_contingencies.employer + rates.mei.employee + rates.mei.employer) / 100 + solidarity.employee + solidarity.employer

    const disabilityExpense =
      disability === '33_64'
        ? fiscalParams.irpf.work_income_deductible_expenses_eur.active_worker_disability_33_to_64_increment
        : disability === '65_or_more'
          ? fiscalParams.irpf.work_income_deductible_expenses_eur.active_worker_disability_65_or_more_or_assistance_increment
          : 0
    const deductibleExpenses =
      fiscalParams.irpf.work_income_deductible_expenses_eur.general_other_expenses +
      (mobility ? fiscalParams.irpf.work_income_deductible_expenses_eur.geographic_mobility_increment : 0) +
      disabilityExpense
    const netWorkIncomeBeforeReduction = Math.max(0, salary - employeeSocialSecurity - deductibleExpenses)
    const reduction = workReduction(netWorkIncomeBeforeReduction)
    const taxableBase = Math.max(0, netWorkIncomeBeforeReduction - reduction)
    const stateMinimum = familyMinimum(fiscalParams.irpf.personal_and_family_minimum_state_eur, age, children, childrenUnder3, ascendants, disability)
    const regionalMinimum = familyMinimum(getMinimums(region), age, children, childrenUnder3, ascendants, disability)
    const regionalScale = autonomicCoverage.autonomic_general_scales[region]?.brackets ?? autonomicCoverage.autonomic_general_scales.madrid.brackets
    const stateTax = Math.max(0, applyScale(taxableBase, fiscalParams.irpf.state_general_scale) - applyScale(Math.min(stateMinimum, taxableBase), fiscalParams.irpf.state_general_scale))
    const regionalTax = Math.max(0, applyScale(taxableBase, regionalScale) - applyScale(Math.min(regionalMinimum, taxableBase), regionalScale))
    const irpfBeforeDeductions = stateTax + regionalTax
    const irpf = Math.max(0, irpfBeforeDeductions - manualAutonomicDeduction)
    const netSalary = salary - employeeSocialSecurity - irpf
    const vatBracket = vatProxy.income_brackets.find((item) => item.income_label === 'Total') ?? vatProxy.income_brackets[0]
    const vatRate = vatBracket?.estimated_effective_vat_percent_on_spending ?? 9
    const annualConsumption = monthlyConsumption * 12
    const vat = annualConsumption * vatRate / 100
    const totalContextTax = employeeSocialSecurity + irpf + vat + otherTaxes

    return {
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
      effectiveLaborRate: (employeeSocialSecurity + irpf) / salary * 100,
      effectiveContextRate: totalContextTax / salary * 100,
    }
  }, [age, ascendants, children, childrenUnder3, disability, manualAutonomicDeduction, mobility, monthlyConsumption, otherTaxes, region, salary])

  return (
    <div className="fwd">
      <FiscalSidebar />
      <main className="fwd-main">
        <header className="fwd-header">
          <div>
            <h2>Calculadora fiscal del trabajador 2025</h2>
            <p>Calculo anual para Regimen General con IRPF estatal y autonomico de comunidades de regimen comun.</p>
          </div>
          <div className="fwd-actions">
            <button type="button"><Bookmark size={16} /> Guardar</button>
            <button type="button"><Share2 size={16} /> Compartir</button>
            <button type="button" aria-label="Informacion"><Info size={18} /></button>
          </div>
        </header>

        <section className="fwd-controls" aria-label="Controles de calculo">
          <label>Comunidad
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              {autonomicCoverage.scope.included_territories.map((item) => (
                <option value={item} key={item}>{REGION_LABELS[item] ?? item}</option>
              ))}
            </select>
          </label>
          <label>Edad
            <input value={age} min={16} max={90} type="number" onChange={(event) => setAge(Number(event.target.value))} />
          </label>
          <div className="fwd-slider">
            <div><span>Salario bruto anual</span><b>{formatEuro(salary)}</b></div>
            <input type="range" min="14000" max="120000" step="500" value={salary} aria-label="Salario bruto anual" onChange={(event) => setSalary(Number(event.target.value))} />
            <div className="fwd-scale"><span>14.000</span><span>35.000</span><span>60.000</span><span>90.000</span><span>120.000</span></div>
          </div>
          <label className="fwd-switch">
            Movilidad geografica
            <InfoButton label="Movilidad geografica" size="sm"><p>Aplica el incremento de gasto deducible si cumple los requisitos legales.</p></InfoButton>
            <input type="checkbox" checked={mobility} onChange={(event) => setMobility(event.target.checked)} />
            <span />
          </label>
        </section>

        <section className="fwd-kpis" aria-label="Indicadores 2025">
          <article className="fwd-kpi fwd-tone-green"><div><Wallet size={20} /><strong>Salario neto</strong></div><dl><div><dt>2025</dt><dd>{formatEuro(result.netSalary)}</dd></div><div><dt>Mensual</dt><dd>{formatEuro(result.netSalary / 12)}</dd></div></dl><p>{formatPercent(100 - result.effectiveLaborRate)} del bruto</p></article>
          <article className="fwd-kpi fwd-tone-purple"><div><Users size={20} /><strong>IRPF anual</strong></div><dl><div><dt>Estatal</dt><dd>{formatEuro(result.stateTax)}</dd></div><div><dt>Autonomico</dt><dd>{formatEuro(result.regionalTax)}</dd></div></dl><p>{formatEuro(result.irpf)}</p></article>
          <article className="fwd-kpi fwd-tone-cyan"><div><ShieldCheck size={20} /><strong>Cotizacion trabajador</strong></div><dl><div><dt>Base mensual</dt><dd>{formatEuro(result.contributionBase)}</dd></div><div><dt>Cuota anual</dt><dd>{formatEuro(result.employeeSocialSecurity)}</dd></div></dl><p>Incluye MEI</p></article>
          <article className="fwd-kpi fwd-tone-orange"><div><HandCoins size={20} /><strong>Aportacion SS total</strong></div><dl><div><dt>Empresa</dt><dd>{formatEuro(result.employerSocialSecurity)}</dd></div><div><dt>Pensiones</dt><dd>{formatEuro(result.pensionsContribution)}</dd></div></dl><p>Trabajador + empresa</p></article>
          <article className="fwd-kpi fwd-tone-yellow"><div><Receipt size={20} /><strong>IVA proxy</strong></div><dl><div><dt>Gasto anual</dt><dd>{formatEuro(result.annualConsumption)}</dd></div><div><dt>IVA</dt><dd>{formatEuro(result.vat)}</dd></div></dl><p>EPF 2024: {formatPercent(result.vatRate)}</p></article>
          <article className="fwd-kpi fwd-tone-violet"><div><FileText size={20} /><strong>Otros impuestos</strong></div><dl><div><dt>Declarado</dt><dd>{formatEuro(otherTaxes)}</dd></div><div><dt>Modulo</dt><dd>separado</dd></div></dl><p>No altera el neto laboral</p></article>
        </section>

        <section className="fwd-content">
          <div className="fwd-column">
            <DashboardPanel className="fwd-panel" title="Tus datos" density="compact">
              <ul className="fwd-data-list">
                <li><span>Hijos con derecho a minimo</span><input type="number" min={0} max={8} value={children} onChange={(event) => setChildren(Number(event.target.value))} /></li>
                <li><span>Hijos menores de 3 anos</span><input type="number" min={0} max={children} value={childrenUnder3} onChange={(event) => setChildrenUnder3(Number(event.target.value))} /></li>
                <li><span>Ascendientes a cargo</span><input type="number" min={0} max={4} value={ascendants} onChange={(event) => setAscendants(Number(event.target.value))} /></li>
                <li><span>Discapacidad trabajador</span><select value={disability} onChange={(event) => setDisability(event.target.value as DisabilityMode)}><option value="none">No</option><option value="33_64">33% a 64%</option><option value="65_or_more">65% o mas</option></select></li>
                <li><span>Deduccion autonomica verificada</span><input type="number" min={0} step={50} value={manualAutonomicDeduction} onChange={(event) => setManualAutonomicDeduction(Number(event.target.value))} /></li>
              </ul>
            </DashboardPanel>
            <DashboardPanel className="fwd-panel" title="Consumo e impuestos indirectos" density="compact">
              <ul className="fwd-data-list">
                <li><span>Gasto mensual con IVA</span><input type="number" min={0} step={50} value={monthlyConsumption} onChange={(event) => setMonthlyConsumption(Number(event.target.value))} /></li>
                <li><span>Otros impuestos declarados</span><input type="number" min={0} step={25} value={otherTaxes} onChange={(event) => setOtherTaxes(Number(event.target.value))} /></li>
                <li><span>Fuente IVA medio</span><b>INE EPF 2024</b></li>
              </ul>
            </DashboardPanel>
          </div>

          <div className="fwd-column fwd-column--center">
            <DashboardPanel className="fwd-panel fwd-panel--hero" title="Distribucion del salario bruto 2025" subtitle={`Comunidad: ${REGION_LABELS[region] ?? region}`} density="compact">
              <div className="fwd-stack-bars">
                <div><strong>Neto</strong><span><i style={{ width: `${Math.min(100, result.netSalary / salary * 100)}%` }}>{formatEuro(result.netSalary)}</i></span><b>{formatEuro(salary)}</b></div>
                <div><strong>IRPF</strong><span><em style={{ width: `${Math.min(100, result.irpf / salary * 100)}%` }}>{formatEuro(result.irpf)}</em></span><b>{formatPercent(result.irpf / salary * 100)}</b></div>
                <div><strong>SS</strong><span><em style={{ width: `${Math.min(100, result.employeeSocialSecurity / salary * 100)}%` }}>{formatEuro(result.employeeSocialSecurity)}</em></span><b>{formatPercent(result.employeeSocialSecurity / salary * 100)}</b></div>
              </div>
            </DashboardPanel>
            <DashboardPanel className="fwd-panel fwd-pension" title="Aportacion a Seguridad Social" subtitle="Cuota anual con contingencias comunes, desempleo, FP, MEI y solidaridad si procede" density="compact">
              <div className="fwd-pension-flow">
                <span className="fwd-round-icon"><Users size={31} /></span>
                <div><small>Trabajador</small><strong>{formatEuro(result.employeeSocialSecurity)}</strong></div>
                <span />
                <div className="is-delta"><small>Empresa</small><strong>{formatEuro(result.employerSocialSecurity)}</strong></div>
                <span />
                <div><small>Total</small><strong>{formatEuro(result.employeeSocialSecurity + result.employerSocialSecurity)}</strong></div>
                <span className="fwd-round-icon is-blue"><PiggyBank size={31} /></span>
              </div>
            </DashboardPanel>
          </div>

          <div className="fwd-column">
            <DashboardPanel className="fwd-panel" title="Deducciones autonomicas" density="compact">
              <div className="fwd-method-note">
                <Calculator size={18} />
                <p>El catalogo AEAT 2025 esta localizado por comunidad. Esta pantalla no aplica reglas automaticas si faltan campos del usuario; permite introducir solo importes ya verificados para no simular requisitos.</p>
              </div>
              <ul className="fwd-data-list">
                <li><span>Estado reglas automaticas</span><b>{autonomicCoverage.autonomic_deductions.coverage_status.calculation_ready ? 'Activas' : 'Pendientes'}</b></li>
                <li><span>Importe aplicado</span><b>{formatEuro(manualAutonomicDeduction)}</b></li>
              </ul>
            </DashboardPanel>
            <DashboardPanel className="fwd-panel" title="Resultado de contexto" density="compact">
              <ul className="fwd-summary">
                <li className="fwd-tone-cyan"><span><Calculator size={20} /></span><div><strong>Carga laboral</strong><small>IRPF + cotizacion trabajador</small></div><b>{formatEuro(result.irpf + result.employeeSocialSecurity)}</b></li>
                <li className="fwd-tone-yellow"><span><Receipt size={20} /></span><div><strong>IVA proxy</strong><small>No se resta del neto laboral</small></div><b>{formatEuro(result.vat)}</b></li>
                <li className="fwd-tone-violet"><span><FileText size={20} /></span><div><strong>Total contexto</strong><small>Laboral + consumo + otros</small></div><b>{formatEuro(result.totalContextTax)}</b></li>
              </ul>
            </DashboardPanel>
          </div>
        </section>

        <section className="fwd-bottom">
          <DashboardPanel className="fwd-panel" title="Composicion aproximada" subtitle="El donut separa neto laboral, IRPF, cotizacion del trabajador, IVA proxy y otros impuestos declarados." density="compact">
            <div className="fwd-donuts">
              <Donut
                year="2025"
                net={`${formatEuro(result.netSalary)} (${formatPercent(result.netSalary / salary * 100)})`}
                irpf={`${formatEuro(result.irpf)} (${formatPercent(result.irpf / salary * 100)})`}
                ss={`${formatEuro(result.employeeSocialSecurity)} (${formatPercent(result.employeeSocialSecurity / salary * 100)})`}
                iva={`${formatEuro(result.vat)} (${formatPercent(result.vat / salary * 100)})`}
                other={`${formatEuro(otherTaxes)} (${formatPercent(otherTaxes / salary * 100)})`}
              />
            </div>
            <p className="fwd-note">El IVA y otros impuestos son modulos de contexto: dependen del consumo o de datos declarados por el usuario.</p>
          </DashboardPanel>
          <DashboardPanel className="fwd-panel" title="Detalle anual" density="compact">
            <div className="fwd-table-wrap">
              <table className="fwd-table">
                <thead><tr><th>Concepto</th><th>Importe</th><th>Nota</th></tr></thead>
                <tbody>
                  <tr><th>Salario bruto</th><td>{formatEuro(salary)}</td><td>Entrada usuario</td></tr>
                  <tr><th>Cotizacion trabajador</th><td>{formatEuro(result.employeeSocialSecurity)}</td><td>BOE 2025</td></tr>
                  <tr><th>IRPF antes de deducciones</th><td>{formatEuro(result.irpfBeforeDeductions)}</td><td>AEAT 2025</td></tr>
                  <tr><th>Deduccion autonomica aplicada</th><td>{formatEuro(manualAutonomicDeduction)}</td><td>Manual verificada</td></tr>
                  <tr><th>Salario neto laboral</th><td>{formatEuro(result.netSalary)}</td><td>No incluye IVA</td></tr>
                  <tr><th>IVA proxy</th><td>{formatEuro(result.vat)}</td><td>INE EPF 2024</td></tr>
                  <tr><th>Otros impuestos</th><td>{formatEuro(otherTaxes)}</td><td>Entrada usuario / AEAT IART</td></tr>
                </tbody>
              </table>
            </div>
          </DashboardPanel>
        </section>
      </main>
    </div>
  )
}

export default FiscalWorkerDashboard
