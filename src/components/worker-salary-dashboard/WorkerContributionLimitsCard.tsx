import { ArrowDown, ChevronDown } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
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

function getGroupBaseValue(group: ContributionGroup, mode: ContributionViewMode, key: 'min' | 'max') {
  if (key === 'min') {
    return mode === 'monthly' ? group.minBaseMonthly : group.minBaseMonthly * 12
  }
  return mode === 'monthly' ? group.maxBaseMonthly : group.maxBaseMonthly * 12
}

function GroupBasePills({
  group,
  viewMode,
  compact = false,
}: {
  group: ContributionGroup
  viewMode: ContributionViewMode
  compact?: boolean
}) {
  const period = viewMode === 'monthly' ? '/ mes' : '/ año'

  return (
    <span className={`wclc-group-select__bases${compact ? ' wclc-group-select__bases--compact' : ''}`}>
      <span className="wclc-group-select__base wclc-group-select__base--min">
        <span>Mín.</span>
        <strong>{formatEuro(getGroupBaseValue(group, viewMode, 'min'))}</strong>
        {!compact ? <em>{period}</em> : null}
      </span>
      <span className="wclc-group-select__base wclc-group-select__base--max">
        <span>Máx.</span>
        <strong>{formatEuro(getGroupBaseValue(group, viewMode, 'max'))}</strong>
        {!compact ? <em>{period}</em> : null}
      </span>
    </span>
  )
}

function ContributionGroupSelect({
  groups,
  selectedGroupId,
  viewMode,
  onChange,
}: {
  groups: ContributionGroup[]
  selectedGroupId: number | undefined
  viewMode: ContributionViewMode
  onChange: (groupId: number) => void
}) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? groups[0],
    [groups, selectedGroupId],
  )

  useEffect(() => {
    if (!isOpen) return undefined

    const selectedIndex = Math.max(0, groups.findIndex((group) => group.id === selectedGroup?.id))
    setActiveIndex(selectedIndex)

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [groups, isOpen, selectedGroup?.id])

  const selectGroup = (groupId: number) => {
    onChange(groupId)
    setIsOpen(false)
  }

  const moveActive = (delta: number) => {
    setActiveIndex((current) => clamp(current + delta, 0, Math.max(groups.length - 1, 0)))
  }

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(1)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(-1)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(Math.max(groups.length - 1, 0))
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      const activeGroup = groups[activeIndex]
      if (!activeGroup) return
      event.preventDefault()
      selectGroup(activeGroup.id)
    }
  }

  return (
    <div
      className={`wclc-group-select${isOpen ? ' wclc-group-select--open' : ''}`}
      ref={rootRef}
    >
      <span className="wclc-group-select__label" id={`${listboxId}-label`}>
        Grupo de cotización
      </span>

      <button
        type="button"
        className="wclc-group-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={`${listboxId}-label`}
        aria-label={
          selectedGroup
            ? `Grupo ${selectedGroup.id}: ${selectedGroup.name}. Mínimo ${formatEuro(getGroupBaseValue(selectedGroup, viewMode, 'min'))}, máximo ${formatEuro(getGroupBaseValue(selectedGroup, viewMode, 'max'))}`
            : 'Selecciona tu grupo de cotización'
        }
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        {selectedGroup ? (
          <span className="wclc-group-select__preview wclc-group-select__preview--trigger">
            <span className="wclc-group-select__identity">
              <span className="wclc-group-select__badge">G{selectedGroup.id}</span>
              <span className="wclc-group-select__name">{selectedGroup.name}</span>
            </span>
            <GroupBasePills group={selectedGroup} viewMode={viewMode} compact />
          </span>
        ) : (
          <span>Selecciona tu grupo</span>
        )}
        <ChevronDown size={19} strokeWidth={2.4} aria-hidden="true" className="wclc-group-select__chevron" />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${listboxId}-label`}
          className="wclc-group-select__panel"
          onKeyDown={handleListKeyDown}
        >
          {groups.map((group, index) => {
            const isSelected = group.id === selectedGroup?.id
            const isActive = index === activeIndex

            return (
              <button
                key={group.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={[
                  'wclc-group-select__option',
                  isSelected ? 'wclc-group-select__option--selected' : '',
                  isActive ? 'wclc-group-select__option--active' : '',
                ].filter(Boolean).join(' ')}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectGroup(group.id)}
              >
                <span className="wclc-group-select__preview">
                  <span className="wclc-group-select__identity">
                    <span className="wclc-group-select__badge">Grupo {group.id}</span>
                    <span className="wclc-group-select__name">{group.name}</span>
                  </span>
                  <GroupBasePills group={group} viewMode={viewMode} />
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
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
        <ContributionGroupSelect
          groups={groups}
          selectedGroupId={selectedGroupId}
          viewMode={viewMode}
          onChange={(nextGroupId) => {
            setSelectedGroupId(nextGroupId)
            onGroupChange?.(nextGroupId)
            setSimulationMode('case')
          }}
        />

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
