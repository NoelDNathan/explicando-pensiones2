import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import atEpParams2025Json from '../../../data/processed/fiscal/2026-07-12_boe-tarifa-at-ep-2025-seleccion.json'
import meiEvolutionJson from '../../../data/processed/fiscal/2026-07-12_mei-evolucion-programada.json'
import { InfoButton } from '../ui/InfoButton'
import { AtEpCategorySelect } from './AtEpCategorySelect'
import './WorkerSocialContributionsCard.css'

export type WorkerContractType = 'indefinite' | 'temporary' | 'internship' | 'training'
export type SocialContributionViewMode = 'annual' | 'monthly'
export type SocialContributionDisplayMode = 'both' | 'percent' | 'amount'

export type OccupationalAccidentsCategory = {
  id: string
  kind: 'cnae' | 'occupation'
  code: string
  label: string
  it_percent: number
  ims_percent: number
  note?: string
}

export type WorkerContributionRates = {
  commonContingencies: number
  unemployment: Record<WorkerContractType, number>
  professionalTraining: number
  mei: number
}

export type CompanyContributionRates = {
  commonContingencies: number
  unemployment: Record<WorkerContractType, number>
  fogasa: number
  professionalTraining: number
  mei: number
  occupationalAccidents: number
}

export type SocialContributionRates = {
  worker: WorkerContributionRates
  company: CompanyContributionRates
}

export type SocialContributionResult = {
  grossSalaryAnnual: number
  grossSalaryMonthly: number
  contributionBaseAnnual: number
  contributionBaseMonthly: number
  workerContributionsAnnual: number
  workerContributionsMonthly: number
  companyContributionsAnnual: number
  companyContributionsMonthly: number
  salaryAfterWorkerContributionsAnnual: number
  salaryAfterWorkerContributionsMonthly: number
  totalCompanyCostAnnual: number
  totalCompanyCostMonthly: number
  totalContributionsAnnual: number
  totalContributionsMonthly: number
  workerContributionRate: number
  companyContributionRate: number
  breakdown: {
    worker: Record<WorkerContributionKey, number>
    company: Record<CompanyContributionKey, number>
  }
}

type WorkerContributionKey =
  | 'commonContingencies'
  | 'unemployment'
  | 'professionalTraining'
  | 'mei'

type CompanyContributionKey =
  | 'commonContingencies'
  | 'unemployment'
  | 'fogasa'
  | 'professionalTraining'
  | 'mei'
  | 'occupationalAccidents'

type ContributionLine<Key extends string> = {
  key: Key
  label: string
  rate: number
  amount: number
  help: string
  muted?: boolean
}

type WorkerSocialContributionsCardProps = {
  year?: number
  grossSalaryAnnual?: number
  grossSalaryMonthly?: number
  payPeriods?: 12 | 14
  contractType?: WorkerContractType
  baseUsedMonthly?: number
  baseUsedAnnual?: number
  selectedContributionGroup?: string
  isAboveMaximumBase?: boolean
  excessOverMaximumMonthly?: number
  isBelowMinimumBase?: boolean
  dataAvailable?: boolean
  contributionRates?: SocialContributionRates
  occupationalAccidentsCategoryId?: string
  onContractTypeChange?: (contractType: WorkerContractType) => void
  onOccupationalAccidentsCategoryChange?: (categoryId: string) => void
  onResultChange?: (result: SocialContributionResult | null) => void
}

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  style: 'percent',
})

export const DEMO_SOCIAL_CONTRIBUTION_RATES: SocialContributionRates = {
  worker: {
    commonContingencies: 0.047,
    unemployment: {
      indefinite: 0.0155,
      temporary: 0.016,
      internship: 0.0155,
      training: 0,
    },
    professionalTraining: 0.001,
    mei: 0.0015,
  },
  company: {
    commonContingencies: 0.236,
    unemployment: {
      indefinite: 0.055,
      temporary: 0.067,
      internship: 0.055,
      training: 0,
    },
    fogasa: 0.002,
    professionalTraining: 0.0075,
    mei: 0.006,
    occupationalAccidents: 0,
  },
}

const atEpParams2025 = atEpParams2025Json as {
  categories: OccupationalAccidentsCategory[]
}

export const AT_EP_2025_CATEGORIES = atEpParams2025.categories
export const DEFAULT_AT_EP_2025_CATEGORY_ID = 'cnae-62'

export function getOccupationalAccidentsCategory(categoryId: string) {
  return AT_EP_2025_CATEGORIES.find((category) => category.id === categoryId) ?? AT_EP_2025_CATEGORIES[0]
}

export function getOccupationalAccidentsRate(categoryId: string) {
  const category = getOccupationalAccidentsCategory(categoryId)
  return (category.it_percent + category.ims_percent) / 100
}

const contractLabels: Record<WorkerContractType, string> = {
  indefinite: 'Indefinido',
  temporary: 'Temporal',
  internship: 'Practicas',
  training: 'Formacion',
}

function formatEuro(value: number) {
  return `${currencyFormatter.format(Number.isFinite(value) ? value : 0)} €`
}

function formatSignedEuro(value: number) {
  const numeric = Number.isFinite(value) ? value : 0
  const formatted = formatEuro(Math.abs(numeric))
  if (numeric > 0) return `+${formatted}`
  if (numeric < 0) return `−${formatted}`
  return formatted
}

function formatPercent(value: number) {
  return percentFormatter.format(Number.isFinite(value) ? value : 0)
}

function sumValues(values: Record<string, number>) {
  return Object.values(values).reduce((total, value) => total + value, 0)
}

export function calculateSocialContributions(params: {
  grossSalaryAnnual: number
  grossSalaryMonthly: number
  contributionBaseAnnual: number
  contributionBaseMonthly: number
  contractType: WorkerContractType
  rates: SocialContributionRates
}): SocialContributionResult {
  const {
    grossSalaryAnnual,
    grossSalaryMonthly,
    contributionBaseAnnual,
    contributionBaseMonthly,
    contractType,
    rates,
  } = params

  const workerBreakdown: Record<WorkerContributionKey, number> = {
    commonContingencies: contributionBaseAnnual * rates.worker.commonContingencies,
    unemployment: contributionBaseAnnual * rates.worker.unemployment[contractType],
    professionalTraining: contributionBaseAnnual * rates.worker.professionalTraining,
    mei: contributionBaseAnnual * rates.worker.mei,
  }

  const companyBreakdown: Record<CompanyContributionKey, number> = {
    commonContingencies: contributionBaseAnnual * rates.company.commonContingencies,
    unemployment: contributionBaseAnnual * rates.company.unemployment[contractType],
    fogasa: contributionBaseAnnual * rates.company.fogasa,
    professionalTraining: contributionBaseAnnual * rates.company.professionalTraining,
    mei: contributionBaseAnnual * rates.company.mei,
    occupationalAccidents: contributionBaseAnnual * rates.company.occupationalAccidents,
  }

  const workerContributionsAnnual = sumValues(workerBreakdown)
  const companyContributionsAnnual = sumValues(companyBreakdown)
  const totalContributionsAnnual = workerContributionsAnnual + companyContributionsAnnual
  const salaryAfterWorkerContributionsAnnual = grossSalaryAnnual - workerContributionsAnnual
  const totalCompanyCostAnnual = grossSalaryAnnual + companyContributionsAnnual

  return {
    grossSalaryAnnual,
    grossSalaryMonthly,
    contributionBaseAnnual,
    contributionBaseMonthly,
    workerContributionsAnnual,
    workerContributionsMonthly: workerContributionsAnnual / 12,
    companyContributionsAnnual,
    companyContributionsMonthly: companyContributionsAnnual / 12,
    salaryAfterWorkerContributionsAnnual,
    salaryAfterWorkerContributionsMonthly: salaryAfterWorkerContributionsAnnual / 12,
    totalCompanyCostAnnual,
    totalCompanyCostMonthly: totalCompanyCostAnnual / 12,
    totalContributionsAnnual,
    totalContributionsMonthly: totalContributionsAnnual / 12,
    workerContributionRate: workerContributionsAnnual / contributionBaseAnnual,
    companyContributionRate: companyContributionsAnnual / contributionBaseAnnual,
    breakdown: {
      worker: workerBreakdown,
      company: companyBreakdown,
    },
  }
}

function getAmount(result: SocialContributionResult, mode: SocialContributionViewMode, key: keyof SocialContributionResult) {
  const value = result[key]
  return typeof value === 'number' ? (mode === 'monthly' ? value / 12 : value) : 0
}

type MeiScheduleEntry = {
  year?: number
  year_label?: string
  total_percent: number
  employer_percent: number
  employee_percent: number
  estado_dato: string
}

const meiEvolutionSchedule = (meiEvolutionJson as { schedule: MeiScheduleEntry[] }).schedule
const meiCurrentScheduleEntry = meiEvolutionSchedule.find((entry) => entry.year === 2025) ?? meiEvolutionSchedule[2]
const meiFinalScheduleEntry = meiEvolutionSchedule[meiEvolutionSchedule.length - 1]

function formatSchedulePercent(value: number) {
  return `${percentFormatter.format(value / 100).replace(/\s/g, '')}`
}

function MeiEvolutionNote({
  variant,
  contributionBaseAnnual,
  viewMode,
  currentWorkerRate,
  currentCompanyRate,
  expanded,
  onExpandedChange,
}: {
  variant: 'worker' | 'company'
  contributionBaseAnnual: number
  viewMode: SocialContributionViewMode
  currentWorkerRate: number
  currentCompanyRate: number
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}) {
  const base = viewMode === 'monthly' ? contributionBaseAnnual / 12 : contributionBaseAnnual
  const modeSuffix = viewMode === 'monthly' ? '/ mes' : '/ año'
  const currentWorkerAmount = base * currentWorkerRate
  const currentCompanyAmount = base * currentCompanyRate
  const finalWorkerAmount = base * (meiFinalScheduleEntry.employee_percent / 100)
  const finalCompanyAmount = base * (meiFinalScheduleEntry.employer_percent / 100)
  const noteId = `wscc-mei-note-${variant}`

  return (
    <div className={`wscc-mei-note wscc-mei-note--${variant}`}>
      <div className="wscc-mei-note__head">
        <span>
          MEI 2025: {formatSchedulePercent(meiCurrentScheduleEntry.total_percent)} total
        </span>
      </div>
      <p className="wscc-mei-note__summary">
        Cotización adicional para reforzar las pensiones públicas. Sube 0,1 puntos porcentuales al año hasta 2030.
      </p>
      <table className="wscc-mei-note__table">
        <caption className="wscc-mei-note__caption">Evolución programada del MEI</caption>
        <thead>
          <tr>
            <th scope="col">Año</th>
            <th scope="col">Total</th>
            <th scope="col">Empresa</th>
            <th scope="col">Trabajador</th>
          </tr>
        </thead>
        <tbody>
          {meiEvolutionSchedule.slice(2).map((entry) => (
            <tr key={entry.year ?? entry.year_label}>
              <th scope="row">{entry.year ?? entry.year_label}</th>
              <td>{formatSchedulePercent(entry.total_percent)}</td>
              <td>{formatSchedulePercent(entry.employer_percent)}</td>
              <td>{formatSchedulePercent(entry.employee_percent)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="wscc-mei-note__details" id={`${noteId}-details`} hidden={!expanded}>
        <p>
          El MEI (Mecanismo de Equidad Intergeneracional) refuerza el sistema público de pensiones. Lo pagan
          trabajador y empresa sobre la base de cotización.
        </p>
        <p>
          La cuota sube 0,1 puntos porcentuales al año hasta 2030. A partir de entonces el reparto queda al 50%:
          <strong> {formatSchedulePercent(meiFinalScheduleEntry.employee_percent)} trabajador</strong>
          {' + '}
          <strong>{formatSchedulePercent(meiFinalScheduleEntry.employer_percent)} empresa</strong>.
        </p>
        <p>
          Con tu base de {formatEuro(base)} {modeSuffix}, el MEI supone hoy
          {' '}
          <strong>{formatEuro(currentWorkerAmount)}</strong> descontados de tu salario y
          {' '}
          <strong>{formatEuro(currentCompanyAmount)}</strong> pagados por la empresa. En 2030-2050, con el mismo
          total del {formatSchedulePercent(meiFinalScheduleEntry.total_percent)}, serían
          {' '}
          <strong>{formatEuro(finalWorkerAmount)}</strong> para ti y
          {' '}
          <strong>{formatEuro(finalCompanyAmount)}</strong> para la empresa.
        </p>
        <em>Fuente: Real Decreto-ley 21/2021 y órdenes anuales de cotización. Años 2026-2050: calendario legal programado.</em>
      </div>

      <button
        type="button"
        className="wscc-mei-note__toggle"
        aria-expanded={expanded}
        aria-controls={`${noteId}-details`}
        onClick={() => onExpandedChange(!expanded)}
      >
        {expanded ? 'Ver menos' : 'Ver más detalle'}
        <ChevronDown size={14} aria-hidden="true" className={expanded ? 'is-open' : undefined} />
      </button>
    </div>
  )
}

function ContributionRows<Key extends string>({
  rows,
  totalAmount,
  totalRate,
  accent,
  displayMode,
  viewMode,
  afterRowKey,
  afterRowContent,
  afterRows,
}: {
  rows: ContributionLine<Key>[]
  totalAmount: number
  totalRate: number
  accent: 'worker' | 'company'
  displayMode: SocialContributionDisplayMode
  viewMode: SocialContributionViewMode
  afterRowKey?: Key
  afterRowContent?: ReactNode
  afterRows?: ReactNode
}) {
  const displayAmount = viewMode === 'monthly' ? totalAmount / 12 : totalAmount

  return (
    <div className="wscc-lines">
      {rows.map((row) => {
        const amount = viewMode === 'monthly' ? row.amount / 12 : row.amount
        return (
          <div key={row.key}>
            <div className={row.muted ? 'wscc-line wscc-line--muted' : 'wscc-line'}>
              <span className="wscc-line__label">
                <span className={row.muted ? 'wscc-line__text wscc-line__text--muted' : 'wscc-line__text'}>
                  {row.label}
                </span>
                <InfoButton
                  label={`Informacion sobre ${row.label}`}
                  size="sm"
                  placement="top"
                  className="wscc-help"
                >
                  <p>{row.help}</p>
                </InfoButton>
              </span>
              <span className="wscc-line__values">
                {displayMode !== 'amount' && <strong>{formatPercent(row.rate)}</strong>}
                {displayMode !== 'percent' && <em>{formatEuro(amount)}</em>}
              </span>
            </div>
            {afterRowKey === row.key && afterRowContent}
          </div>
        )
      })}

      {afterRows}

      <output className={`wscc-total wscc-total--${accent}`}>
        <span>Total {accent === 'worker' ? 'trabajador' : 'empresa'}</span>
        <strong>{formatPercent(totalRate)}</strong>
        <em>{formatEuro(displayAmount)}</em>
      </output>
    </div>
  )
}

export function WorkerSocialContributionsCard({
  grossSalaryAnnual = 37_500,
  grossSalaryMonthly = grossSalaryAnnual / 12,
  contractType = 'indefinite',
  baseUsedMonthly = grossSalaryAnnual / 12,
  baseUsedAnnual = baseUsedMonthly * 12,
  selectedContributionGroup = 'Grupo 1 - Ingenieros y Licenciados',
  isAboveMaximumBase = false,
  excessOverMaximumMonthly = 0,
  isBelowMinimumBase = false,
  dataAvailable = true,
  contributionRates = DEMO_SOCIAL_CONTRIBUTION_RATES,
  occupationalAccidentsCategoryId = DEFAULT_AT_EP_2025_CATEGORY_ID,
  onContractTypeChange,
  onOccupationalAccidentsCategoryChange,
  onResultChange,
}: WorkerSocialContributionsCardProps) {
  const [viewMode, setViewMode] = useState<SocialContributionViewMode>('annual')
  const displayMode: SocialContributionDisplayMode = 'both'
  const [meiNoteExpanded, setMeiNoteExpanded] = useState(false)
  const [selectedContractType, setSelectedContractType] = useState<WorkerContractType>(contractType)
  const [selectedAtEpCategoryId, setSelectedAtEpCategoryId] = useState(occupationalAccidentsCategoryId)

  useEffect(() => {
    setSelectedContractType(contractType)
  }, [contractType])

  useEffect(() => {
    setSelectedAtEpCategoryId(occupationalAccidentsCategoryId)
  }, [occupationalAccidentsCategoryId])

  const selectedAtEpCategory = useMemo(
    () => getOccupationalAccidentsCategory(selectedAtEpCategoryId),
    [selectedAtEpCategoryId],
  )
  const selectedAtEpRate = (selectedAtEpCategory.it_percent + selectedAtEpCategory.ims_percent) / 100
  const contributionRatesWithAtEp = useMemo<SocialContributionRates>(() => ({
    ...contributionRates,
    company: {
      ...contributionRates.company,
      occupationalAccidents: selectedAtEpRate,
    },
  }), [contributionRates, selectedAtEpRate])

  const result = useMemo(() => {
    if (!dataAvailable || baseUsedAnnual <= 0 || grossSalaryAnnual <= 0) return null
    return calculateSocialContributions({
      grossSalaryAnnual,
      grossSalaryMonthly,
      contributionBaseAnnual: baseUsedAnnual,
      contributionBaseMonthly: baseUsedMonthly,
      contractType: selectedContractType,
      rates: contributionRatesWithAtEp,
    })
  }, [
    baseUsedAnnual,
    baseUsedMonthly,
    contributionRatesWithAtEp,
    dataAvailable,
    grossSalaryAnnual,
    grossSalaryMonthly,
    selectedContractType,
  ])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  if (!result) {
    return (
      <section className="wscc wscc--empty" aria-labelledby="wscc-title">
        <header className="wscc-header">
          <div className="wscc-title-group">
            <span className="wscc-step" aria-hidden="true">3.</span>
            <h2 id="wscc-title">Cotizaciones sociales</h2>
          </div>
        </header>
        <div className="wscc-empty">
          Primero calcula tu base real y selecciona tu grupo de cotizacion.
        </div>
      </section>
    )
  }

  const workerRows: ContributionLine<WorkerContributionKey>[] = [
    {
      key: 'commonContingencies',
      label: 'Contingencias comunes',
      rate: contributionRatesWithAtEp.worker.commonContingencies,
      amount: result.breakdown.worker.commonContingencies,
      help: 'Cubren situaciones habituales como una baja por enfermedad común, un accidente no laboral, la maternidad, la paternidad o la jubilación. Esta cotización ayuda a financiar prestaciones que puedes necesitar a lo largo de tu vida laboral.',
    },
    {
      key: 'unemployment',
      label: 'Desempleo',
      rate: contributionRatesWithAtEp.worker.unemployment[selectedContractType],
      amount: result.breakdown.worker.unemployment,
      help: 'Sirve para financiar la prestación por paro. Gracias a esta cotización, si pierdes el trabajo y cumples los requisitos, puedes tener derecho a cobrar una ayuda mientras buscas otro empleo.',
    },
    {
      key: 'professionalTraining',
      label: 'Formacion profesional',
      rate: contributionRatesWithAtEp.worker.professionalTraining,
      amount: result.breakdown.worker.professionalTraining,
      help: 'Financia programas de formación para trabajadores. Te aporta la posibilidad de acceder a cursos y acciones formativas que ayudan a mejorar tus competencias profesionales.',
    },
    {
      key: 'mei',
      label: 'MEI',
      rate: contributionRatesWithAtEp.worker.mei,
      amount: result.breakdown.worker.mei,
      help: 'Es una cotización adicional destinada a reforzar el sistema público de pensiones. No te da una prestación concreta e inmediata, pero contribuye a sostener las pensiones futuras.',
    },
  ]

  const companyRows: ContributionLine<CompanyContributionKey>[] = [
    {
      key: 'commonContingencies',
      label: 'Contingencias comunes',
      rate: contributionRatesWithAtEp.company.commonContingencies,
      amount: result.breakdown.company.commonContingencies,
      help: 'Cubren situaciones habituales como una baja por enfermedad común, un accidente no laboral, la maternidad, la paternidad o la jubilación. Esta cotización ayuda a financiar prestaciones que puedes necesitar a lo largo de tu vida laboral.',
    },
    {
      key: 'unemployment',
      label: 'Desempleo',
      rate: contributionRatesWithAtEp.company.unemployment[selectedContractType],
      amount: result.breakdown.company.unemployment,
      help: 'Sirve para financiar la prestación por paro. Gracias a esta cotización, si pierdes el trabajo y cumples los requisitos, puedes tener derecho a cobrar una ayuda mientras buscas otro empleo.',
    },
    {
      key: 'fogasa',
      label: 'FOGASA',
      rate: contributionRatesWithAtEp.company.fogasa,
      amount: result.breakdown.company.fogasa,
      help: 'Protege al trabajador si la empresa no puede pagar salarios o indemnizaciones, por ejemplo por insolvencia o concurso. En esos casos, este fondo puede asumir parte de las cantidades pendientes.',
    },
    {
      key: 'professionalTraining',
      label: 'Formacion profesional',
      rate: contributionRatesWithAtEp.company.professionalTraining,
      amount: result.breakdown.company.professionalTraining,
      help: 'Financia programas de formación para trabajadores. Te aporta la posibilidad de acceder a cursos y acciones formativas que ayudan a mejorar tus competencias profesionales.',
    },
    {
      key: 'mei',
      label: 'MEI',
      rate: contributionRatesWithAtEp.company.mei,
      amount: result.breakdown.company.mei,
      help: 'Es una cotización adicional destinada a reforzar el sistema público de pensiones. No te da una prestación concreta e inmediata, pero contribuye a sostener las pensiones futuras.',
    },
    {
      key: 'occupationalAccidents',
      label: 'AT/EP',
      rate: contributionRatesWithAtEp.company.occupationalAccidents,
      amount: result.breakdown.company.occupationalAccidents,
      help: `Cubre accidentes de trabajo y enfermedades profesionales. En esta calculadora se aplica la categoria seleccionada: ${selectedAtEpCategory.code} - ${selectedAtEpCategory.label}.`,
    },
  ]

  const modeSuffix = viewMode === 'monthly' ? '/ mes' : '/ año'
  const meiBaseDisplay = viewMode === 'monthly' ? result.contributionBaseAnnual / 12 : result.contributionBaseAnnual
  const meiWorkerToday = meiBaseDisplay * contributionRatesWithAtEp.worker.mei
  const meiCompanyToday = meiBaseDisplay * contributionRatesWithAtEp.company.mei
  const meiWorker2030 = meiBaseDisplay * (meiFinalScheduleEntry.employee_percent / 100)
  const meiCompany2030 = meiBaseDisplay * (meiFinalScheduleEntry.employer_percent / 100)
  const meiWorkerExtra2030 = meiWorker2030 - meiWorkerToday
  const meiCompanyExtra2030 = meiCompany2030 - meiCompanyToday
  const meiTotalExtra2030 = meiWorkerExtra2030 + meiCompanyExtra2030
  const grossDisplay = getAmount(result, viewMode, 'grossSalaryAnnual')
  const baseDisplay = getAmount(result, viewMode, 'contributionBaseAnnual')
  const workerTotalDisplay = getAmount(result, viewMode, 'workerContributionsAnnual')
  const salaryAfterDisplay = getAmount(result, viewMode, 'salaryAfterWorkerContributionsAnnual')
  const companyTotalDisplay = getAmount(result, viewMode, 'companyContributionsAnnual')
  const companyCostDisplay = getAmount(result, viewMode, 'totalCompanyCostAnnual')
  const totalContributionsDisplay = getAmount(result, viewMode, 'totalContributionsAnnual')

  return (
    <section className="wscc" aria-labelledby="wscc-title">
      <header className="wscc-header">
        <div className="wscc-title-group">
          <span className="wscc-step" aria-hidden="true">3.</span>
          <h2 id="wscc-title">Cotizaciones sociales</h2>
        </div>
      </header>

      <div className="wscc-toolbar">
        <div className="wscc-toolbar-cell wscc-toolbar-cell--base">
          <div className="wscc-base-note">
            <span>Base usada para cotizar</span>
            <strong>{formatEuro(baseDisplay)} {modeSuffix}</strong>
            <em>{selectedContributionGroup}</em>
          </div>
        </div>

        <div className="wscc-toolbar-cell">
          <label className="wscc-select-field">
            <span>Contrato</span>
            <span className="wscc-select-shell">
              <select
                value={selectedContractType}
                onChange={(event) => {
                  const nextContractType = event.target.value as WorkerContractType
                  setSelectedContractType(nextContractType)
                  onContractTypeChange?.(nextContractType)
                }}
              >
                {Object.entries(contractLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" />
            </span>
          </label>
        </div>

        <div className="wscc-toolbar-cell">
          <AtEpCategorySelect
            categories={AT_EP_2025_CATEGORIES}
            value={selectedAtEpCategoryId}
            layout="compact"
            onChange={(categoryId) => {
              setSelectedAtEpCategoryId(categoryId)
              onOccupationalAccidentsCategoryChange?.(categoryId)
            }}
          />
        </div>

        <div className="wscc-toolbar-cell wscc-toolbar-cell--segments">
          <span className="wscc-toolbar-spacer" aria-hidden="true"></span>
          <div className="wscc-segments" role="group" aria-label="Vista de importes">
            <button type="button" className={viewMode === 'annual' ? 'is-active' : ''} onClick={() => setViewMode('annual')}>
              Anual
            </button>
            <button type="button" className={viewMode === 'monthly' ? 'is-active' : ''} onClick={() => setViewMode('monthly')}>
              Mensual
            </button>
          </div>
        </div>

      </div>

      {(isAboveMaximumBase || isBelowMinimumBase) && (
        <div className={`wscc-alert ${isAboveMaximumBase ? 'wscc-alert--maximum' : 'wscc-alert--minimum'}`}>
          {isAboveMaximumBase ? (
            <>
              <strong>Salario por encima de la base maxima.</strong>
              <span>Las cotizaciones ordinarias se calculan solo hasta {formatEuro(baseUsedAnnual)} al año.</span>
              <em>Exceso mensual: {formatEuro(excessOverMaximumMonthly)}</em>
            </>
          ) : (
            <>
              <strong>Base minima aplicada.</strong>
              <span>Las cotizaciones se calculan sobre la base minima de tu grupo, no sobre una base inferior.</span>
            </>
          )}
        </div>
      )}

      <div className="wscc-grid">
        <article className="wscc-panel wscc-panel--worker">
          <div className="wscc-panel__head">
            <div className="wscc-panel__intro">
              <h3>Trabajador</h3>
              <p>Se descuenta de tu salario bruto.</p>
            </div>
            {!meiNoteExpanded && meiTotalExtra2030 !== 0 && (
              <div className="wscc-panel__mei-extra" aria-label="MEI adicional total en 2030 frente a hoy">
                <div className="wscc-panel__mei-extra-row">
                  <span>MEI en 2030 extra</span>
                  <strong>{formatSignedEuro(meiTotalExtra2030)}</strong>
                </div>
                <div className="wscc-panel__mei-extra-row wscc-panel__mei-extra-row--split">
                  <em className="wscc-panel__mei-extra-label">trabajador + empresa</em>
                  <span className="wscc-panel__mei-extra-split">
                    {formatSignedEuro(meiWorkerExtra2030)} {formatSignedEuro(meiCompanyExtra2030)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <ContributionRows
            rows={workerRows}
            totalAmount={result.workerContributionsAnnual}
            totalRate={result.workerContributionRate}
            accent="worker"
            displayMode={displayMode}
            viewMode={viewMode}
            afterRowKey="mei"
            afterRowContent={
              <MeiEvolutionNote
                variant="worker"
                contributionBaseAnnual={result.contributionBaseAnnual}
                viewMode={viewMode}
                currentWorkerRate={contributionRatesWithAtEp.worker.mei}
                currentCompanyRate={contributionRatesWithAtEp.company.mei}
                expanded={meiNoteExpanded}
                onExpandedChange={setMeiNoteExpanded}
              />
            }
          />
        </article>

        <article className="wscc-panel wscc-panel--company">
          <h3>Empresa</h3>
          <p>La empresa lo paga ademas de tu salario bruto.</p>
          <ContributionRows
            rows={companyRows}
            totalAmount={result.companyContributionsAnnual}
            totalRate={result.companyContributionRate}
            accent="company"
            displayMode={displayMode}
            viewMode={viewMode}
            afterRows={
              <div className="wscc-atep-note">
                <span>AT/EP 2025: {formatPercent(selectedAtEpRate)}</span>
                <p>
                  AT/EP es como un seguro que paga la empresa para proteger al trabajador frente a accidentes o
                  enfermedades causadas por el trabajo.
                </p>
                <p>
                  El porcentaje no es igual para todos los trabajadores. Depende principalmente de la actividad
                  profesional y del nivel de riesgo. Por eso, una persona que trabaja en una oficina puede tener un
                  porcentaje diferente a alguien que trabaja en construcción.
                </p>
                <p>En este caso, el {formatPercent(selectedAtEpRate)} se divide en:</p>
                <p>
                  <strong>IT ({formatPercent(selectedAtEpCategory.it_percent / 100)}):</strong> cubre las bajas
                  temporales por accidentes de trabajo o enfermedades profesionales.
                </p>
                <p>
                  <strong>IMS ({formatPercent(selectedAtEpCategory.ims_percent / 100)}):</strong> cubre situaciones más
                  graves, como incapacidad permanente, fallecimiento o supervivencia.
                </p>
                <p>
                  Este porcentaje lo paga la empresa, no se descuenta del salario del trabajador. Se calcula sobre la
                  base de contingencias profesionales.
                </p>
                {selectedAtEpCategory.note && <em>{selectedAtEpCategory.note}</em>}
              </div>
            }
          />
        </article>

        <aside className="wscc-summary" aria-label="Resumen de cotizaciones sociales">
          <h3 className="wscc-summary__title">Resumen</h3>
          <div className="wscc-summary__item">
            <span>Salario bruto trabajador</span>
            <strong className="wscc-summary__gross">{formatEuro(grossDisplay)}</strong>
          </div>
          <div className="wscc-summary__item">
            <span>Cotizaciones trabajador</span>
            <strong className="wscc-summary__worker">{formatEuro(workerTotalDisplay)}</strong>
          </div>
          <div className="wscc-summary__item">
            <span>Bruto despues de cotizaciones</span>
            <strong className="wscc-summary__after-contributions">{formatEuro(salaryAfterDisplay)}</strong>
          </div>
          <div className="wscc-summary__divider" aria-hidden="true"></div>
          <div className="wscc-summary__item">
            <span>Coste adicional empresa</span>
            <strong className="wscc-summary__company">{formatEuro(companyTotalDisplay)}</strong>
          </div>
          <div className="wscc-summary__divider" aria-hidden="true"></div>
          <div className="wscc-summary__item wscc-summary__item--total">
            <span>Coste total cotizaciones</span>
            <strong>{formatEuro(totalContributionsDisplay)}</strong>
            <em>Trabajador + empresa</em>
          </div>
          <div className="wscc-summary__item wscc-summary__item--hero">
            <span>Coste total empresa</span>
            <strong>{formatEuro(companyCostDisplay)}</strong>
          </div>
        </aside>
      </div>

    </section>
  )
}

export default WorkerSocialContributionsCard
