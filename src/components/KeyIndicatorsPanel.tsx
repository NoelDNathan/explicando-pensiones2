/**
 * KeyIndicatorsPanel
 *
 * Dashboard panel that composes a grid of MetricCard instances.
 * Shows a bold title, a responsive 2-column grid of indicators,
 * and an optional CTA button at the bottom.
 *
 * The panel is intentionally scoped to dark surfaces, using the
 * project's dark palette tokens. Pass `indicators` as an array of
 * MetricCardProps objects; the grid reflows at narrow viewports.
 */

import { MetricCard } from './MetricCard'
import type { MetricCardProps } from './MetricCard'
import './KeyIndicatorsPanel.css'

// ─── Re-export for consumer convenience ───────────────────────────────────────

export type { MetricCardProps as IndicatorItem }

// ─── Public types ─────────────────────────────────────────────────────────────

export interface KeyIndicatorsPanelProps {
  /** Panel title (e.g. "Indicadores clave (2025)"). */
  title: string
  /** Array of indicator card configurations. */
  indicators: MetricCardProps[]
  /** Label for the CTA button. Omit to hide the button. */
  ctaLabel?: string
  onCtaClick?: () => void
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KeyIndicatorsPanel({
  title,
  indicators,
  ctaLabel,
  onCtaClick,
  className,
}: KeyIndicatorsPanelProps) {
  return (
    <div className={`kip${className ? ` ${className}` : ''}`}>
      <h2 className="kip__title">{title}</h2>

      <ul className="kip__grid" aria-label="Indicadores">
        {indicators.map((ind, i) => (
          <li key={i} className="kip__grid-item">
            <MetricCard {...ind} />
          </li>
        ))}
      </ul>

      {ctaLabel && (
        <div className="kip__footer">
          <button
            type="button"
            className="kip__cta"
            onClick={onCtaClick}
          >
            {ctaLabel}
          </button>
        </div>
      )}
    </div>
  )
}
