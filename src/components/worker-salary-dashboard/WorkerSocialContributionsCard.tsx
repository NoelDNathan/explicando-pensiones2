import { ChevronDown, Info } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './WorkerSocialContributionsCard.css'

export type WorkerContractType = 'indefinite' | 'temporary' | 'internship' | 'training'
export type SocialContributionViewMode = 'annual' | 'monthly'
export type SocialContributionDisplayMode = 'both' | 'percent' | 'amount'

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
  onContractTypeChange?: (contractType: WorkerContractType) => void
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
    mei: 0.0012,
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
    professionalTraining: 0.006,
    mei: 0.006,
    occupationalAccidents: 0,
  },
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

function formatPercent(value: number) {
  return percentFormatter.format(Number.isFinite(value) ? value : 0)
}

function sumValues(values: Record<string, number>) {
  return Object.values(values).reduce((total, value) => total + value, 0)
}

function calculateSocialContributions(params: {
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

function ContributionRows<Key extends string>({
  rows,
  totalAmount,
  totalRate,
  accent,
  displayMode,
  viewMode,
}: {
  rows: ContributionLine<Key>[]
  totalAmount: number
  totalRate: number
  accent: 'worker' | 'company'
  displayMode: SocialContributionDisplayMode
  viewMode: SocialContributionViewMode
}) {
  const displayAmount = viewMode === 'monthly' ? totalAmount / 12 : totalAmount

  return (
    <div className="wscc-lines">
      {rows.map((row) => {
        const amount = viewMode === 'monthly' ? row.amount / 12 : row.amount
        return (
          <div className={row.muted ? 'wscc-line wscc-line--muted' : 'wscc-line'} key={row.key}>
            <span className="wscc-line__label">
              {row.label}
              <span className="wscc-tooltip" tabIndex={0} aria-label={row.help}>
                <Info size={13} aria-hidden="true" />
                <span role="tooltip">{row.help}</span>
              </span>
            </span>
            <span className="wscc-line__values">
              {displayMode !== 'amount' && <strong>{formatPercent(row.rate)}</strong>}
              {displayMode !== 'percent' && <em>{formatEuro(amount)}</em>}
            </span>
          </div>
        )
      })}

      <output className={`wscc-total wscc-total--${accent}`}>
        <span>Total {accent === 'worker' ? 'trabajador' : 'empresa'}</span>
        <strong>{formatPercent(totalRate)}</strong>
        <em>{formatEuro(displayAmount)}</em>
      </output>
    </div>
  )
}

export function WorkerSocialContributionsCard({
  year = 2026,
  grossSalaryAnnual = 37_500,
  grossSalaryMonthly = grossSalaryAnnual / 12,
  payPeriods = 12,
  contractType = 'indefinite',
  baseUsedMonthly = grossSalaryAnnual / 12,
  baseUsedAnnual = baseUsedMonthly * 12,
  selectedContributionGroup = 'Grupo 1 - Ingenieros y Licenciados',
  isAboveMaximumBase = false,
  excessOverMaximumMonthly = 0,
  isBelowMinimumBase = false,
  dataAvailable = true,
  contributionRates = DEMO_SOCIAL_CONTRIBUTION_RATES,
  onContractTypeChange,
  onResultChange,
}: WorkerSocialContributionsCardProps) {
  const [viewMode, setViewMode] = useState<SocialContributionViewMode>('annual')
  const [displayMode, setDisplayMode] = useState<SocialContributionDisplayMode>('both')
  const [selectedContractType, setSelectedContractType] = useState<WorkerContractType>(contractType)
  const [infoOpen, setInfoOpen] = useState(false)

  useEffect(() => {
    setSelectedContractType(contractType)
  }, [contractType])

  const result = useMemo(() => {
    if (!dataAvailable || baseUsedAnnual <= 0 || grossSalaryAnnual <= 0) return null
    return calculateSocialContributions({
      grossSalaryAnnual,
      grossSalaryMonthly,
      contributionBaseAnnual: baseUsedAnnual,
      contributionBaseMonthly: baseUsedMonthly,
      contractType: selectedContractType,
      rates: contributionRates,
    })
  }, [
    baseUsedAnnual,
    baseUsedMonthly,
    contributionRates,
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
      rate: contributionRates.worker.commonContingencies,
      amount: result.breakdown.worker.commonContingencies,
      help: 'Financian prestaciones como jubilacion, incapacidad temporal y otras prestaciones comunes.',
    },
    {
      key: 'unemployment',
      label: 'Desempleo',
      rate: contributionRates.worker.unemployment[selectedContractType],
      amount: result.breakdown.worker.unemployment,
      help: 'Financia la proteccion por desempleo.',
    },
    {
      key: 'professionalTraining',
      label: 'Formacion profesional',
      rate: contributionRates.worker.professionalTraining,
      amount: result.breakdown.worker.professionalTraining,
      help: 'Financia acciones de formacion profesional para personas trabajadoras.',
    },
    {
      key: 'mei',
      label: 'MEI',
      rate: contributionRates.worker.mei,
      amount: result.breakdown.worker.mei,
      help: 'Cotizacion adicional destinada a reforzar el sistema de pensiones.',
    },
  ]

  const companyRows: ContributionLine<CompanyContributionKey>[] = [
    {
      key: 'commonContingencies',
      label: 'Contingencias comunes',
      rate: contributionRates.company.commonContingencies,
      amount: result.breakdown.company.commonContingencies,
      help: 'Parte empresarial para prestaciones comunes de la Seguridad Social.',
    },
    {
      key: 'unemployment',
      label: 'Desempleo',
      rate: contributionRates.company.unemployment[selectedContractType],
      amount: result.breakdown.company.unemployment,
      help: 'Aportacion empresarial para financiar la proteccion por desempleo.',
    },
    {
      key: 'fogasa',
      label: 'FOGASA',
      rate: contributionRates.company.fogasa,
      amount: result.breakdown.company.fogasa,
      help: 'Fondo que cubre determinados salarios e indemnizaciones cuando la empresa no puede pagarlos.',
    },
    {
      key: 'professionalTraining',
      label: 'Formacion profesional',
      rate: contributionRates.company.professionalTraining,
      amount: result.breakdown.company.professionalTraining,
      help: 'Aportacion empresarial a la formacion profesional.',
    },
    {
      key: 'mei',
      label: 'MEI',
      rate: contributionRates.company.mei,
      amount: result.breakdown.company.mei,
      help: 'Cotizacion adicional destinada a reforzar el sistema de pensiones.',
    },
    {
      key: 'occupationalAccidents',
      label: 'AT/EP',
      rate: contributionRates.company.occupationalAccidents,
      amount: result.breakdown.company.occupationalAccidents,
      help: 'Accidentes de trabajo y enfermedades profesionales. En este MVP queda como no incluido.',
      muted: contributionRates.company.occupationalAccidents === 0,
    },
  ]

  const modeSuffix = viewMode === 'monthly' ? '/ mes' : '/ ano'
  const grossDisplay = getAmount(result, viewMode, 'grossSalaryAnnual')
  const baseDisplay = getAmount(result, viewMode, 'contributionBaseAnnual')
  const workerTotalDisplay = getAmount(result, viewMode, 'workerContributionsAnnual')
  const salaryAfterDisplay = getAmount(result, viewMode, 'salaryAfterWorkerContributionsAnnual')
  const companyTotalDisplay = getAmount(result, viewMode, 'companyContributionsAnnual')
  const companyCostDisplay = getAmount(result, viewMode, 'totalCompanyCostAnnual')

  return (
    <section className="wscc" aria-labelledby="wscc-title">
      <header className="wscc-header">
        <div className="wscc-title-group">
          <span className="wscc-step" aria-hidden="true">3.</span>
          <h2 id="wscc-title">Cotizaciones sociales</h2>
        </div>
        <button
          className="wscc-info"
          type="button"
          aria-label="Mas informacion sobre cotizaciones sociales"
          aria-expanded={infoOpen}
          onClick={() => setInfoOpen((open) => !open)}
        >
          <Info size={20} strokeWidth={2.3} aria-hidden="true" />
        </button>
      </header>

      {infoOpen && (
        <div className="wscc-popover" role="status">
          Las cotizaciones se calculan sobre la base usada del paso anterior.
          La parte del trabajador se descuenta de la nomina. La parte de
          empresa se suma al coste laboral, pero no reduce tu salario neto.
        </div>
      )}

      <div className="wscc-toolbar">
        <div className="wscc-base-note">
          <span>Base usada para cotizar</span>
          <strong>{formatEuro(baseDisplay)} {modeSuffix}</strong>
          <em>{selectedContributionGroup}</em>
        </div>

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

        <div className="wscc-segments" role="group" aria-label="Vista de importes">
          <button type="button" className={viewMode === 'annual' ? 'is-active' : ''} onClick={() => setViewMode('annual')}>
            Anual
          </button>
          <button type="button" className={viewMode === 'monthly' ? 'is-active' : ''} onClick={() => setViewMode('monthly')}>
            Mensual
          </button>
        </div>

        <div className="wscc-segments" role="group" aria-label="Formato de lineas">
          <button type="button" className={displayMode === 'both' ? 'is-active' : ''} onClick={() => setDisplayMode('both')}>
            % + €
          </button>
          <button type="button" className={displayMode === 'percent' ? 'is-active' : ''} onClick={() => setDisplayMode('percent')}>
            %
          </button>
          <button type="button" className={displayMode === 'amount' ? 'is-active' : ''} onClick={() => setDisplayMode('amount')}>
            €
          </button>
        </div>
      </div>

      {(isAboveMaximumBase || isBelowMinimumBase) && (
        <div className={`wscc-alert ${isAboveMaximumBase ? 'wscc-alert--maximum' : 'wscc-alert--minimum'}`}>
          {isAboveMaximumBase ? (
            <>
              <strong>Salario por encima de la base maxima.</strong>
              <span>Las cotizaciones ordinarias se calculan solo hasta {formatEuro(baseUsedAnnual)} al ano.</span>
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
          <h3>Trabajador</h3>
          <p>Se descuenta de tu salario bruto.</p>
          <ContributionRows
            rows={workerRows}
            totalAmount={result.workerContributionsAnnual}
            totalRate={result.workerContributionRate}
            accent="worker"
            displayMode={displayMode}
            viewMode={viewMode}
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
          />
        </article>

        <aside className="wscc-summary" aria-label="Resumen de cotizaciones sociales">
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
            <strong>{formatEuro(salaryAfterDisplay)}</strong>
          </div>
          <div className="wscc-summary__divider" aria-hidden="true"></div>
          <div className="wscc-summary__item">
            <span>Coste adicional empresa</span>
            <strong className="wscc-summary__company">{formatEuro(companyTotalDisplay)}</strong>
          </div>
          <div className="wscc-summary__item wscc-summary__item--hero">
            <span>Coste total empresa</span>
            <strong>{formatEuro(companyCostDisplay)}</strong>
          </div>
        </aside>
      </div>

      <footer className="wscc-formulas">
        <p>
          Trabajador: base usada x {formatPercent(result.workerContributionRate)} =
          {' '}{formatEuro(result.workerContributionsAnnual)}; despues se resta del bruto.
        </p>
        <p>
          Empresa: base usada x {formatPercent(result.companyContributionRate)} =
          {' '}{formatEuro(result.companyContributionsAnnual)}; despues se suma al coste de contratar.
        </p>
      </footer>
    </section>
  )
}

export default WorkerSocialContributionsCard
