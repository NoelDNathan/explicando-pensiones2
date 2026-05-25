/**
 * ReformSimulator
 *
 * Mobile-format dashboard card for a pension reform simulator.
 * Displays a list of active reform measures, each with a colour-coded
 * icon, title, value and effective date. Tabs switch between the active
 * measures list and an "add measure" panel.
 *
 * Purely presentational: callbacks for the CTA and per-measure menu
 * actions are forwarded via props. Data, badge count and tab state are
 * also receivable as props, with sensible demo defaults.
 */

import './ReformSimulator.css'
import { InfoButton } from './InfoButton'

// ─── Types ────────────────────────────────────────────────────────────────────

type MeasureIconVariant = 'person' | 'percent' | 'group' | 'briefcase'

export type ReformMeasure = {
  id: string
  iconVariant: MeasureIconVariant
  title: string
  value?: string
  date: string
}

export type ReformSimulatorTab = 'active' | 'add'

export type ReformSimulatorProps = {
  measures?: ReformMeasure[]
  activeMeasureCount?: number
  activeTab?: ReformSimulatorTab
  onTabChange?: (tab: ReformSimulatorTab) => void
  onCtaClick?: () => void
  onMeasureMenu?: (id: string) => void
  className?: string
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEFAULT_MEASURES: ReformMeasure[] = [
  {
    id: 'ret-age',
    iconVariant: 'person',
    title: 'Edad legal de jubilación',
    value: '68 años',
    date: 'Desde 2040',
  },
  {
    id: 'worker-ss',
    iconVariant: 'percent',
    title: 'Cotizaciones trabajador',
    value: '+2 p.p.',
    date: 'Desde 2035',
  },
  {
    id: 'employer-ss',
    iconVariant: 'percent',
    title: 'Cotizaciones empresa',
    value: '+1 p.p.',
    date: 'Desde 2035',
  },
  {
    id: 'immigration',
    iconVariant: 'group',
    title: 'Inmigración neta anual',
    value: '+100.000 personas',
    date: 'Desde 2030',
  },
  {
    id: 'extra-pay',
    iconVariant: 'briefcase',
    title: 'Eliminar paga extra',
    date: 'A partir de 2045',
  },
]

// ─── Icon palette ─────────────────────────────────────────────────────────────

type IconTheme = { bg: string; color: string }

const ICON_THEMES: Record<MeasureIconVariant, IconTheme> = {
  person:    { bg: '#2d1f58', color: '#a78bfa' },
  percent:   { bg: '#1a3564', color: '#60a5fa' },
  group:     { bg: '#0f3d2e', color: '#34d399' },
  briefcase: { bg: '#3d2d0c', color: '#fbbf24' },
}

// ─── Icon shapes ─────────────────────────────────────────────────────────────

function IconPerson({ color }: { color: string }) {
  return (
    <>
      <circle cx="12" cy="8" r="3.5" fill={color} />
      <path
        d="M5 21c0-3.866 3.134-7 7-7s7 3.134 7 7"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </>
  )
}

function IconPercent({ color }: { color: string }) {
  return (
    <>
      <circle cx="8.5" cy="8.5" r="2.5" fill={color} />
      <circle cx="15.5" cy="15.5" r="2.5" fill={color} />
      <line
        x1="6"
        y1="18"
        x2="18"
        y2="6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  )
}

function IconGroup({ color }: { color: string }) {
  return (
    <>
      <circle cx="9" cy="8" r="3" fill={color} opacity={0.75} />
      <circle cx="16" cy="8" r="3" fill={color} />
      <path
        d="M2 21c0-3.314 3.134-6 7-6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
      <path
        d="M9 21c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </>
  )
}

function IconBriefcase({ color }: { color: string }) {
  return (
    <>
      <rect
        x="3.5"
        y="9"
        width="17"
        height="11"
        rx="2"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M8 9V7a4 4 0 0 1 8 0v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <line
        x1="3.5"
        y1="14.5"
        x2="20.5"
        y2="14.5"
        stroke={color}
        strokeWidth="1"
        opacity={0.5}
      />
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MeasureIconCircle({ variant }: { variant: MeasureIconVariant }) {
  const theme = ICON_THEMES[variant]
  return (
    <div
      className="rs-measure-icon"
      style={{ background: theme.bg }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        {variant === 'person'    && <IconPerson    color={theme.color} />}
        {variant === 'percent'   && <IconPercent   color={theme.color} />}
        {variant === 'group'     && <IconGroup     color={theme.color} />}
        {variant === 'briefcase' && <IconBriefcase color={theme.color} />}
      </svg>
    </div>
  )
}

function ThreeDotsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <circle cx="12" cy="5"  r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  )
}

function MeasureRow({
  measure,
  onMenu,
}: {
  measure: ReformMeasure
  onMenu?: (id: string) => void
}) {
  return (
    <li className="rs-measure-row">
      <MeasureIconCircle variant={measure.iconVariant} />

      <div className="rs-measure-text">
        <span className="rs-measure-title">{measure.title}</span>
        {measure.value && (
          <span className="rs-measure-value">{measure.value}</span>
        )}
      </div>

      <span className="rs-measure-date">{measure.date}</span>

      <button
        type="button"
        className="rs-measure-menu-btn"
        aria-label={`Opciones para ${measure.title}`}
        onClick={() => onMenu?.(measure.id)}
      >
        <ThreeDotsIcon />
      </button>
    </li>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ReformSimulator({
  measures = DEFAULT_MEASURES,
  activeMeasureCount = 5,
  activeTab = 'active',
  onTabChange,
  onCtaClick,
  onMeasureMenu,
  className,
}: ReformSimulatorProps) {
  return (
    <div className={`rs-card${className ? ` ${className}` : ''}`} role="region" aria-label="Simulador de reformas">
      {/* ── Header ── */}
      <div className="rs-header">
        <div className="rs-header-copy">
          <p className="rs-title">Simulador de reformas</p>
          <p className="rs-subtitle">Añade medidas y descubre su impacto futuro</p>
        </div>
        <button
          type="button"
          className="rs-info-btn"
          aria-label="Información sobre el simulador"
        >
          <InfoButton label="Información sobre el simulador" />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="rs-tabs" role="tablist" aria-label="Secciones del simulador">
        <button
          type="button"
          role="tab"
          className={`rs-tab${activeTab === 'active' ? ' rs-tab--active' : ''}`}
          aria-selected={activeTab === 'active'}
          onClick={() => onTabChange?.('active')}
        >
          Medidas activas
          <span className="rs-tab-badge" aria-label={`${activeMeasureCount} medidas activas`}>
            {activeMeasureCount}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          className={`rs-tab${activeTab === 'add' ? ' rs-tab--active' : ''}`}
          aria-selected={activeTab === 'add'}
          onClick={() => onTabChange?.('add')}
        >
          Añadir medida
        </button>
      </div>

      {/* ── Measures list ── */}
      <ul className="rs-measures-list" aria-label="Lista de medidas activas">
        {measures.map(m => (
          <MeasureRow key={m.id} measure={m} onMenu={onMeasureMenu} />
        ))}
      </ul>

      {/* ── CTA ── */}
      <div className="rs-cta-wrapper">
        <button type="button" className="rs-cta-btn" onClick={onCtaClick}>
          Ver impacto en el futuro
        </button>
      </div>
    </div>
  )
}

export default ReformSimulator
