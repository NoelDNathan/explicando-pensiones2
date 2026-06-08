import { ChevronDown, Info } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import './WorkerContributionLimitsCard.css'

export type ContributionViewMode = 'monthly' | 'annual'

export type ContributionStatus =
  | 'below_minimum'
  | 'within_range'
  | 'above_maximum'

export type ContributionGroup = {
  id: number
  name: string
  minBaseMonthly: number
  maxBaseMonthly: number
}

export type ContributionLimitResult = {
  selectedGroupId: number
  selectedGroupName: string
  userBaseMonthly: number
  userBaseAnnual: number
  minBaseMonthly: number
  minBaseAnnual: number
  maxBaseMonthly: number
  maxBaseAnnual: number
  baseUsedMonthly: number
  baseUsedAnnual: number
  status: ContributionStatus
  distanceToMinimum: number
  distanceToMaximum: number
  excessOverMaximum: number
}

type SimulationMode = 'case' | 'minimum' | 'maximum'

type WorkerContributionLimitsCardProps = {
  calculationYear?: number
  groups?: ContributionGroup[]
  initialGroupId?: number
  userBaseAnnual?: number | null
  initialViewMode?: ContributionViewMode
  dataAvailable?: boolean
  sourceLabel?: string
  onResultChange?: (result: ContributionLimitResult | null) => void
}

export const DEMO_CONTRIBUTION_GROUPS: ContributionGroup[] = [
  {
    id: 1,
    name: 'Ingenieros y Licenciados',
    minBaseMonthly: 1989.3,
    maxBaseMonthly: 5101.2,
  },
  {
    id: 2,
    name: 'Ingenieros Tecnicos, Peritos y Ayudantes Titulados',
    minBaseMonthly: 1649.7,
    maxBaseMonthly: 5101.2,
  },
  {
    id: 3,
    name: 'Jefes Administrativos y de Taller',
    minBaseMonthly: 1435.2,
    maxBaseMonthly: 5101.2,
  },
  {
    id: 4,
    name: 'Ayudantes no Titulados',
    minBaseMonthly: 1424.4,
    maxBaseMonthly: 5101.2,
  },
  {
    id: 5,
    name: 'Oficiales Administrativos',
    minBaseMonthly: 1424.4,
    maxBaseMonthly: 5101.2,
  },
  {
    id: 6,
    name: 'Subalternos',
    minBaseMonthly: 1424.4,
    maxBaseMonthly: 5101.2,
  },
  {
    id: 7,
    name: 'Auxiliares Administrativos',
    minBaseMonthly: 1424.4,
    maxBaseMonthly: 5101.2,
  },
]

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatEuro(value: number) {
  return `${currencyFormatter.format(Number.isFinite(value) ? value : 0)} €`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getMarkerPosition(value: number, visualMin: number, visualMax: number) {
  return clamp(((value - visualMin) / (visualMax - visualMin)) * 100, 0, 100)
}

function calculateContributionLimit(
  userBaseAnnual: number,
  group: ContributionGroup,
): ContributionLimitResult {
  const userBaseMonthly = userBaseAnnual / 12
  const status: ContributionStatus = userBaseMonthly < group.minBaseMonthly
    ? 'below_minimum'
    : userBaseMonthly > group.maxBaseMonthly
      ? 'above_maximum'
      : 'within_range'
  const baseUsedMonthly = status === 'below_minimum'
    ? group.minBaseMonthly
    : status === 'above_maximum'
      ? group.maxBaseMonthly
      : userBaseMonthly

  return {
    selectedGroupId: group.id,
    selectedGroupName: group.name,
    userBaseMonthly,
    userBaseAnnual,
    minBaseMonthly: group.minBaseMonthly,
    minBaseAnnual: group.minBaseMonthly * 12,
    maxBaseMonthly: group.maxBaseMonthly,
    maxBaseAnnual: group.maxBaseMonthly * 12,
    baseUsedMonthly,
    baseUsedAnnual: baseUsedMonthly * 12,
    status,
    distanceToMinimum: userBaseMonthly - group.minBaseMonthly,
    distanceToMaximum: group.maxBaseMonthly - userBaseMonthly,
    excessOverMaximum: Math.max(0, userBaseMonthly - group.maxBaseMonthly),
  }
}

function getStatusCopy(status: ContributionStatus) {
  if (status === 'below_minimum') {
    return {
      title: 'Debajo del minimo',
      description:
        'Tu base real esta por debajo de la base minima de tu grupo. Para cotizar se usara la base minima.',
      accent: 'minimum',
    }
  }

  if (status === 'above_maximum') {
    return {
      title: 'Por encima del maximo',
      description:
        'Tu base real supera la base maxima. Para las cotizaciones ordinarias se usara la base maxima.',
      accent: 'maximum',
    }
  }

  return {
    title: 'Dentro del rango',
    description:
      'Tu base real esta entre la base minima y la maxima. Cotizas por tu base real.',
    accent: 'range',
  }
}

function getDisplayValue(result: ContributionLimitResult, mode: ContributionViewMode, key: 'min' | 'user' | 'max' | 'used') {
  const suffix = mode === 'monthly' ? '/ mes' : '/ ano'
  const value = key === 'min'
    ? mode === 'monthly' ? result.minBaseMonthly : result.minBaseAnnual
    : key === 'max'
      ? mode === 'monthly' ? result.maxBaseMonthly : result.maxBaseAnnual
      : key === 'used'
        ? mode === 'monthly' ? result.baseUsedMonthly : result.baseUsedAnnual
        : mode === 'monthly' ? result.userBaseMonthly : result.userBaseAnnual

  return `${formatEuro(value)} ${suffix}`
}

export function WorkerContributionLimitsCard({
  calculationYear = 2026,
  groups = DEMO_CONTRIBUTION_GROUPS,
  initialGroupId = groups[0]?.id,
  userBaseAnnual = 37_500,
  initialViewMode = 'monthly',
  dataAvailable = true,
  sourceLabel = 'Fuente: BOE, Orden PJC/297/2026, articulo 3. Grupos 1-7 con bases mensuales.',
  onResultChange,
}: WorkerContributionLimitsCardProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(initialGroupId)
  const [viewMode, setViewMode] = useState<ContributionViewMode>(initialViewMode)
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('case')
  const [infoOpen, setInfoOpen] = useState(false)

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId),
    [groups, selectedGroupId],
  )

  const simulatedAnnualBase = useMemo(() => {
    if (!selectedGroup || userBaseAnnual == null) return null
    if (simulationMode === 'minimum') return selectedGroup.minBaseMonthly * 12
    if (simulationMode === 'maximum') return selectedGroup.maxBaseMonthly * 12
    return userBaseAnnual
  }, [selectedGroup, simulationMode, userBaseAnnual])

  const result = useMemo(() => {
    if (!dataAvailable || !selectedGroup || simulatedAnnualBase == null) return null
    return calculateContributionLimit(simulatedAnnualBase, selectedGroup)
  }, [dataAvailable, selectedGroup, simulatedAnnualBase])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  const statusCopy = result ? getStatusCopy(result.status) : null
  const visualMin = selectedGroup ? selectedGroup.minBaseMonthly * 0.75 : 0
  const visualMax = selectedGroup ? selectedGroup.maxBaseMonthly * 1.25 : 1
  const minPosition = selectedGroup ? getMarkerPosition(selectedGroup.minBaseMonthly, visualMin, visualMax) : 20
  const maxPosition = selectedGroup ? getMarkerPosition(selectedGroup.maxBaseMonthly, visualMin, visualMax) : 78
  const userPosition = result ? getMarkerPosition(result.userBaseMonthly, visualMin, visualMax) : 50

  const hasBase = userBaseAnnual != null && Number.isFinite(userBaseAnnual)
  const isEmpty = !hasBase || !selectedGroup || !dataAvailable

  return (
    <section className="wclc" aria-labelledby="wclc-title">
      <header className="wclc-header">
        <div className="wclc-title-group">
          <span className="wclc-step" aria-hidden="true">2.</span>
          <h2 id="wclc-title">Limites de cotizacion</h2>
        </div>
        <button
          className="wclc-info"
          type="button"
          aria-label="Mas informacion sobre limites de cotizacion"
          aria-expanded={infoOpen}
          onClick={() => setInfoOpen((open) => !open)}
        >
          <Info size={20} strokeWidth={2.3} aria-hidden="true" />
        </button>
      </header>

      {infoOpen && (
        <div className="wclc-popover" role="status">
          La base de cotizacion es la cantidad sobre la que se calculan las
          cotizaciones a la Seguridad Social. Si tu base real esta por debajo
          del minimo se usa la minima; si supera el maximo, se usa la maxima
          para las cotizaciones ordinarias.
        </div>
      )}

      <div className="wclc-controls">
        <label className="wclc-field">
          <span>Grupo de cotizacion</span>
          <span className="wclc-select-shell">
            <select
              value={selectedGroupId ?? ''}
              onChange={(event) => {
                setSelectedGroupId(Number(event.target.value))
                setSimulationMode('case')
              }}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  Grupo {group.id} - {group.name}
                </option>
              ))}
            </select>
            <ChevronDown size={19} strokeWidth={2.4} aria-hidden="true" />
          </span>
        </label>

        <div className="wclc-mode" role="group" aria-label="Unidad de visualizacion">
          <button
            type="button"
            className={viewMode === 'monthly' ? 'is-active' : ''}
            onClick={() => setViewMode('monthly')}
          >
            Mensual
          </button>
          <button
            type="button"
            className={viewMode === 'annual' ? 'is-active' : ''}
            onClick={() => setViewMode('annual')}
          >
            Anual
          </button>
        </div>
      </div>

      <p className="wclc-year">Ano de calculo: {calculationYear}</p>

      {isEmpty ? (
        <div className="wclc-empty">
          {!hasBase
            ? 'Primero calcula tu base real en el paso 1.'
            : !selectedGroup
              ? 'Selecciona tu grupo de cotizacion para ver los limites aplicables.'
              : 'No hay datos disponibles para este ano.'}
        </div>
      ) : result && statusCopy ? (
        <>
          <div className="wclc-scale" aria-label="Comparacion de base minima, base real y base maxima">
            <div className="wclc-scale-top">
              <div className="wclc-marker-label wclc-marker-label--min" style={{ left: `${minPosition}%` }}>
                <span>Base minima</span>
                <strong>{getDisplayValue(result, viewMode, 'min')}</strong>
              </div>
              <div className="wclc-marker-label wclc-marker-label--user" style={{ left: `${userPosition}%` }}>
                <span>Tu base</span>
                <strong>{getDisplayValue(result, viewMode, 'user')}</strong>
              </div>
              <div className="wclc-marker-label wclc-marker-label--max" style={{ left: `${maxPosition}%` }}>
                <span>Base maxima</span>
                <strong>{getDisplayValue(result, viewMode, 'max')}</strong>
              </div>
            </div>

            <div
              className={`wclc-track wclc-track--${statusCopy.accent}`}
              style={{
                '--min-pos': `${minPosition}%`,
                '--max-pos': `${maxPosition}%`,
                '--user-pos': `${userPosition}%`,
              } as CSSProperties}
            >
              <span className="wclc-track-fill" aria-hidden="true"></span>
              <span className="wclc-tick wclc-tick--min" aria-hidden="true"></span>
              <span className="wclc-tick wclc-tick--user" aria-hidden="true"></span>
              <span className="wclc-tick wclc-tick--max" aria-hidden="true"></span>
            </div>

            <div className="wclc-scale-bottom">
              <span>Debajo del minimo</span>
              <span>Dentro del rango</span>
              <span>Por encima del maximo</span>
            </div>
          </div>

          <div className="wclc-insight-grid">
            <article className={`wclc-status wclc-status--${statusCopy.accent}`}>
              <h3>{statusCopy.title}</h3>
              <p>{statusCopy.description}</p>
            </article>

            <article className="wclc-distance">
              {result.status === 'below_minimum' && (
                <p>
                  Te faltan <strong>{formatEuro(Math.abs(result.distanceToMinimum))}</strong> al mes para llegar a la base minima.
                </p>
              )}
              {result.status === 'within_range' && (
                <>
                  <p>Estas <strong>{formatEuro(result.distanceToMinimum)}</strong> por encima del minimo.</p>
                  <p>Estas <strong>{formatEuro(result.distanceToMaximum)}</strong> por debajo del maximo.</p>
                </>
              )}
              {result.status === 'above_maximum' && (
                <p>
                  Exceso sobre la base maxima: <strong>{formatEuro(result.excessOverMaximum)}</strong> al mes.
                </p>
              )}
            </article>
          </div>

          <output className="wclc-result" aria-live="polite">
            <span>Base usada para cotizar</span>
            <strong>{formatEuro(result.baseUsedMonthly)} / mes</strong>
            <em>{formatEuro(result.baseUsedAnnual)} / ano</em>
          </output>

          <div className="wclc-real-base">
            <span>Tu base real</span>
            <strong>{formatEuro(result.userBaseMonthly)} / mes</strong>
            <em>{formatEuro(result.userBaseAnnual)} / ano</em>
          </div>

          {result.status === 'above_maximum' && (
            <p className="wclc-note">
              La parte que supera la base maxima no aumenta las cotizaciones
              ordinarias, aunque puede estar sujeta a mecanismos adicionales si
              aplica en el ano seleccionado.
            </p>
          )}

          <div className="wclc-simulations" role="group" aria-label="Simulaciones de base">
            <button
              type="button"
              className={simulationMode === 'case' ? 'is-active' : ''}
              onClick={() => setSimulationMode('case')}
            >
              Tu caso
            </button>
            <button
              type="button"
              className={simulationMode === 'minimum' ? 'is-active' : ''}
              onClick={() => setSimulationMode('minimum')}
            >
              En el minimo
            </button>
            <button
              type="button"
              className={simulationMode === 'maximum' ? 'is-active' : ''}
              onClick={() => setSimulationMode('maximum')}
            >
              En el maximo
            </button>
          </div>

          <p className="wclc-source">{sourceLabel}</p>
        </>
      ) : null}
    </section>
  )
}

export default WorkerContributionLimitsCard
