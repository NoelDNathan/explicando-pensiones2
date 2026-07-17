import { ArrowDown, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { SalarySlider } from '../ui/SalarySlider'
import './WorkerContributionLimitsCard.css'

const SALARY_RANGE = { min: 14000, max: 500000, markers: [14000, 50000, 120000, 250000, 500000] }

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
  onUserBaseAnnualChange?: (baseAnnual: number) => void
  onGroupChange?: (groupId: number) => void
  onResultChange?: (result: ContributionLimitResult | null) => void
}

export const DEMO_CONTRIBUTION_GROUPS: ContributionGroup[] = [
  {
    id: 1,
    name: 'Ingenieros y Licenciados',
    minBaseMonthly: 1929,
    maxBaseMonthly: 4909.5,
  },
  {
    id: 2,
    name: 'Ingenieros Tecnicos, Peritos y Ayudantes Titulados',
    minBaseMonthly: 1599.6,
    maxBaseMonthly: 4909.5,
  },
  {
    id: 3,
    name: 'Jefes Administrativos y de Taller',
    minBaseMonthly: 1391.7,
    maxBaseMonthly: 4909.5,
  },
  {
    id: 4,
    name: 'Ayudantes no Titulados',
    minBaseMonthly: 1381.2,
    maxBaseMonthly: 4909.5,
  },
  {
    id: 5,
    name: 'Oficiales Administrativos',
    minBaseMonthly: 1381.2,
    maxBaseMonthly: 4909.5,
  },
  {
    id: 6,
    name: 'Subalternos',
    minBaseMonthly: 1381.2,
    maxBaseMonthly: 4909.5,
  },
  {
    id: 7,
    name: 'Auxiliares Administrativos',
    minBaseMonthly: 1381.2,
    maxBaseMonthly: 4909.5,
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
        'Tu base real esta por debajo de la base minima de tu grupo. Para cotizar se usara la base minima. Es decir, pagarás más de lo que debería pagar tu base, pero generarás mayor derecho a pensiones',
      accent: 'minimum',
    }
  }

  if (status === 'above_maximum') {
    return {
      title: 'Por encima del maximo',
      description:
        'Tu base real supera la base maxima. Para calcular cuanto pagas en las cotizaciones ordinarias, se usara la base maxima, todo lo que exceda no supone un pago mayor de impuestos, no cotiza ni genera más prestaciones.',
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

function getSummaryConnectorLabel(status: ContributionStatus) {
  if (status === 'below_minimum') return 'Se eleva a la base minima'
  if (status === 'above_maximum') return 'Se limita a la base maxima'
  return 'Cotizas por tu base real'
}

function getDisplayValue(result: ContributionLimitResult, mode: ContributionViewMode, key: 'min' | 'user' | 'max' | 'used') {
  const suffix = mode === 'monthly' ? '/ mes' : '/ año'
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
  calculationYear: _calculationYear = 2026,
  groups = DEMO_CONTRIBUTION_GROUPS,
  initialGroupId = groups[0]?.id,
  userBaseAnnual = 37_500,
  initialViewMode = 'monthly',
  dataAvailable = true,
  sourceLabel: _sourceLabel = 'Fuente: BOE/AEAT 2025, Regimen General con bases mensuales.',
  onUserBaseAnnualChange,
  onGroupChange,
  onResultChange,
}: WorkerContributionLimitsCardProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(initialGroupId)
  const [viewMode, setViewMode] = useState<ContributionViewMode>(initialViewMode)
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('case')
  const [infoOpen] = useState(false)
  const [localBaseAnnual, setLocalBaseAnnual] = useState(userBaseAnnual ?? SALARY_RANGE.min)

  useEffect(() => {
    setSelectedGroupId(initialGroupId)
  }, [initialGroupId])

  useEffect(() => {
    if (userBaseAnnual != null) setLocalBaseAnnual(userBaseAnnual)
  }, [userBaseAnnual])

  const showSalaryControl = userBaseAnnual != null && onUserBaseAnnualChange !== undefined

  const handleSalaryChange = (next: number) => {
    setLocalBaseAnnual(next)
    onUserBaseAnnualChange?.(next)
  }

  const activeUserBaseAnnual = showSalaryControl ? localBaseAnnual : userBaseAnnual

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId),
    [groups, selectedGroupId],
  )

  const simulatedAnnualBase = useMemo(() => {
    if (!selectedGroup || activeUserBaseAnnual == null) return null
    if (simulationMode === 'minimum') return selectedGroup.minBaseMonthly * 12
    if (simulationMode === 'maximum') return selectedGroup.maxBaseMonthly * 12
    return activeUserBaseAnnual
  }, [activeUserBaseAnnual, selectedGroup, simulationMode])

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
  const isUserCloseToMinimum = Math.abs(userPosition - minPosition) < 18
  const isUserCloseToMaximum = Math.abs(userPosition - maxPosition) < 18
  const scaleTopClassName = [
    'wclc-scale-top',
    isUserCloseToMinimum ? 'wclc-scale-top--crowded-min' : '',
    isUserCloseToMaximum ? 'wclc-scale-top--crowded-max' : '',
  ].filter(Boolean).join(' ')

  const hasBase = activeUserBaseAnnual != null && Number.isFinite(activeUserBaseAnnual)
  const isEmpty = !hasBase || !selectedGroup || !dataAvailable

  return (
    <section className="wclc" aria-labelledby="wclc-title">
      <header className="wclc-header">
        <div className="wclc-title-group">
          <span className="wclc-step" aria-hidden="true">2.</span>
          <h2 id="wclc-title">Limites de cotizacion</h2>
        </div>
    
      </header>

      {infoOpen && (
        <div className="wclc-popover" role="status">
          El grupo de cotizacion marca un minimo y un maximo. Ejemplo sencillo:
          si tu base queda por debajo de {selectedGroup ? formatEuro(selectedGroup.minBaseMonthly) : 'la base minima'},
          se usa ese minimo. Si supera {selectedGroup ? formatEuro(selectedGroup.maxBaseMonthly) : 'la base maxima'},
          se usa ese maximo para las cotizaciones ordinarias.
        </div>
      )}

      {showSalaryControl && (
        <div className="wclc-salary">
          <label className="wclc-salary__label" htmlFor="wclc-salary-range">
            Salario bruto anual
          </label>
          <div className="wclc-salary-row">
            <SalarySlider
              id="wclc-salary-range"
              value={localBaseAnnual}
              onChange={handleSalaryChange}
              min={SALARY_RANGE.min}
              max={SALARY_RANGE.max}
              markers={SALARY_RANGE.markers}
              scale="log"
              unitLabel="brutos al año"
              ariaLabel="Salario bruto anual en euros"
            />
          </div>
        </div>
      )}

      <div className="wclc-controls">
        <label className="wclc-field">
          <span>Grupo de cotizacion</span>
          <span className="wclc-select-shell">
            <select
              value={selectedGroupId ?? ''}
              onChange={(event) => {
                const nextGroupId = Number(event.target.value)
                setSelectedGroupId(nextGroupId)
                onGroupChange?.(nextGroupId)
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
            <div className={scaleTopClassName}>
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

          <div className={`wclc-insight-grid wclc-insight-grid--${statusCopy.accent}`}>
            <article className={`wclc-status wclc-status--${statusCopy.accent}`}>
              <h3>{statusCopy.title}</h3>
              <p>{statusCopy.description}</p>
            </article>

            <article className={`wclc-distance wclc-distance--${statusCopy.accent}`}>
              {result.status === 'below_minimum' && (
                <>
                  <span className="wclc-distance__label">Te faltan para el minimo</span>
                  <strong className="wclc-distance__value">{formatEuro(Math.abs(result.distanceToMinimum))}</strong>
                  <span className="wclc-distance__unit">al mes</span>
                </>
              )}
              {result.status === 'within_range' && (
                <>
                  <span className="wclc-distance__label">Margen dentro del rango</span>
                  <span className="wclc-distance__pair">
                    <span>
                      <strong>{formatEuro(result.distanceToMinimum)}</strong> sobre el minimo
                    </span>
                    <span>
                      <strong>{formatEuro(result.distanceToMaximum)}</strong> bajo el maximo
                    </span>
                  </span>
                </>
              )}
              {result.status === 'above_maximum' && (
                <>
                  <span className="wclc-distance__label">Exceso sobre el maximo</span>
                  <strong className="wclc-distance__value">{formatEuro(result.excessOverMaximum)}</strong>
                  <span className="wclc-distance__unit">al mes</span>
                </>
              )}
            </article>
          </div>

          <div className={`wclc-summary wclc-summary--${statusCopy.accent}`}>
            <div className="wclc-real-base">
              <span className="wclc-row-label">Tu base real</span>
              <span className="wclc-row-values">
                <strong>{formatEuro(result.userBaseMonthly)} / mes</strong>
                <em>{formatEuro(result.userBaseAnnual)} / año</em>
              </span>
            </div>

            <div className="wclc-summary-connector" aria-hidden="true">
              <span>
                <ArrowDown size={14} strokeWidth={2.6} />
                {getSummaryConnectorLabel(result.status)}
              </span>
            </div>

            <output className="wclc-result" aria-live="polite">
              <span className="wclc-row-label">Base usada para cotizar</span>
              <span className="wclc-row-values">
                <strong>{formatEuro(result.baseUsedMonthly)} / mes</strong>
                <em>{formatEuro(result.baseUsedAnnual)} / año</em>
              </span>
            </output>
          </div>

          </>
      ) : null}
    </section>
  )
}

export default WorkerContributionLimitsCard
