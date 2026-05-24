/**
 * MetricCard
 *
 * Single key-indicator card for institutional dark dashboards.
 * Displays an icon, a label, a primary value, and optional
 * secondary metric + annotation, all fully configurable via props.
 *
 * Designed for dark surfaces using the project's dark palette tokens.
 * The icon slot accepts any ReactNode, keeping the component library-agnostic.
 */

import React from 'react'
import './MetricCard.css'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface MetricCardProps {
  /** Indicator name (e.g. "Gasto en pensiones"). */
  label: string
  /** Primary formatted value (e.g. "190.607 M€" or "12,6%"). */
  value: string
  /** Icon element — accepts any SVG, img or icon component. */
  icon: React.ReactNode
  /** Secondary metric shown below the value (e.g. "12,6% del PIB"). */
  secondary?: string
  /** CSS color for the secondary text. */
  secondaryColor?: string
  /** Annotation line below the secondary (e.g. "Edad legal: 66,0"). */
  note?: string
  /** CSS color for the note text. */
  noteColor?: string
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MetricCard({
  label,
  value,
  icon,
  secondary,
  secondaryColor,
  note,
  noteColor,
  className,
}: MetricCardProps) {
  return (
    <div className={`metric-card${className ? ` ${className}` : ''}`}>
      <div className="metric-card__header">
        <span className="metric-card__icon" aria-hidden="true">
          {icon}
        </span>
        <p className="metric-card__label">{label}</p>
      </div>

      <p className="metric-card__value">{value}</p>

      {secondary && (
        <p
          className="metric-card__secondary"
          style={secondaryColor ? { color: secondaryColor } : undefined}
        >
          {secondary}
        </p>
      )}

      {note && (
        <p
          className="metric-card__note"
          style={noteColor ? { color: noteColor } : undefined}
        >
          {note}
        </p>
      )}
    </div>
  )
}
