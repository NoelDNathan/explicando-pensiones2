import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './WorkerIrpfTranchesCard.css'

export type WorkerIrpfBracketTone = 'green' | 'purple' | 'blue' | 'orange' | 'yellow' | 'red'

export type WorkerIrpfBracket = {
  from: number
  to: number | null
  rate: number
  tone: WorkerIrpfBracketTone
}

export type WorkerIrpfTrancheLine = WorkerIrpfBracket & {
  taxableAmount: number
  quota: number
}

export type WorkerIrpfTranchesResult = {
  region: string
  taxableBase: number
  quota: number
  effectiveRate: number
  lines: WorkerIrpfTrancheLine[]
}

type RegionOption = {
  value: string
  label: string
}

type WorkerIrpfTranchesCardProps = {
  initialRegion?: string
  initialTaxableBase?: number
  brackets?: WorkerIrpfBracket[]
  regions?: RegionOption[]
  onResultChange?: (result: WorkerIrpfTranchesResult) => void
}

const DEFAULT_REGIONS: RegionOption[] = [
  { value: 'madrid', label: 'Madrid' },
  { value: 'andalucia', label: 'Andalucia' },
  { value: 'cataluna', label: 'Cataluna' },
  { value: 'valencia', label: 'C. Valenciana' },
]

const DEFAULT_BRACKETS: WorkerIrpfBracket[] = [
  { from: 0, to: 12450, rate: 0.19, tone: 'green' },
  { from: 12450, to: 20200, rate: 0.24, tone: 'purple' },
  { from: 20200, to: 35200, rate: 0.3, tone: 'blue' },
  { from: 35200, to: 60000, rate: 0.37, tone: 'orange' },
  { from: 60000, to: 300000, rate: 0.45, tone: 'yellow' },
  { from: 300000, to: null, rate: 0.47, tone: 'red' },
]

function formatEuro(value: number, decimals = 0) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function formatPercent(value: number, decimals = 0) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function formatRange(bracket: WorkerIrpfBracket) {
  const from = bracket.from === 0 ? '0' : bracket.from.toLocaleString('es-ES')
  if (bracket.to === null) {
    return `> ${bracket.from.toLocaleString('es-ES')} \u20ac`
  }

  return `${from} - ${bracket.to.toLocaleString('es-ES')} \u20ac`
}

export function WorkerIrpfTranchesCard({
  initialRegion = 'madrid',
  initialTaxableBase = 30243,
  brackets = DEFAULT_BRACKETS,
  regions = DEFAULT_REGIONS,
  onResultChange,
}: WorkerIrpfTranchesCardProps) {
  const [region, setRegion] = useState(initialRegion)

  const result = useMemo<WorkerIrpfTranchesResult>(() => {
    const lines = brackets.map((bracket) => {
      const upper = bracket.to ?? Number.POSITIVE_INFINITY
      const taxableAmount = Math.max(0, Math.min(initialTaxableBase, upper) - bracket.from)

      return {
        ...bracket,
        taxableAmount,
        quota: taxableAmount * bracket.rate,
      }
    })
    const quota = lines.reduce((total, line) => total + line.quota, 0)

    return {
      region,
      taxableBase: initialTaxableBase,
      quota,
      effectiveRate: initialTaxableBase > 0 ? (quota / initialTaxableBase) * 100 : 0,
      lines,
    }
  }, [brackets, initialTaxableBase, region])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  const activeLines = result.lines.filter((line) => line.taxableAmount > 0)
  const visibleLines = activeLines.slice(0, 4)

  return (
    <section className="witc" aria-labelledby="witc-title">
      <header className="witc-header">
        <div className="witc-title">
          <span aria-hidden="true">5.</span>
          <h2 id="witc-title">IRPF por tramos</h2>
        </div>

        <label className="witc-region">
          <span>Comunidad autonoma</span>
          <span className="witc-select">
            <select
              aria-label="Comunidad autonoma"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              {regions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" />
          </span>
        </label>
      </header>

      <p className="witc-intro">Solo se tributa por la parte de renta que cae en cada tramo.</p>

      <div className="witc-brackets" aria-label="Tramos de IRPF">
        {result.lines.map((line) => (
          <article
            key={`${line.from}-${line.to ?? 'more'}`}
            className={`witc-bracket witc-bracket--${line.tone}${line.taxableAmount > 0 ? ' is-active' : ''}`}
          >
            {line.taxableAmount > 0 && line.to && result.taxableBase < line.to ? (
              <span className="witc-bracket__marker" aria-hidden="true" />
            ) : null}
            <strong>{Math.round(line.rate * 100)}%</strong>
            <span>{formatRange(line)}</span>
          </article>
        ))}
      </div>

      <div className="witc-lower">
        <aside className="witc-base-card" aria-label="Base liquidable">
          <span className="witc-base-card__hint" aria-hidden="true" />
          <p>Base liquidable</p>
          <strong>{formatEuro(result.taxableBase, 2)}</strong>
        </aside>

        <section className="witc-calc" aria-labelledby="witc-calc-title">
          <h3 id="witc-calc-title">Calculo acumulado</h3>
          <ul>
            {visibleLines.map((line, index) => (
              <li key={`${line.from}-${line.to ?? 'more'}-calc`} className={`witc-calc-row witc-calc-row--${line.tone}`}>
                <span aria-hidden="true" />
                <p>
                  Tramo {index + 1} ({formatRange(line)})
                </p>
                <b>{formatEuro(line.taxableAmount, 2)} x {Math.round(line.rate * 100)}%</b>
                <strong>= {formatEuro(line.quota, 2)}</strong>
              </li>
            ))}
          </ul>
        </section>

        <aside className="witc-results" aria-label="Resultado estimado">
          <output className="witc-result witc-result--quota">
            <span>Cuota integra estimada</span>
            <strong>{formatEuro(result.quota, 2)}</strong>
          </output>
          <output className="witc-result witc-result--rate">
            <span>Tipo efectivo aprox.</span>
            <strong>{formatPercent(result.effectiveRate, 1)}%</strong>
          </output>
        </aside>
      </div>
    </section>
  )
}

export default WorkerIrpfTranchesCard
