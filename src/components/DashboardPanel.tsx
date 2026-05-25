/**
 * DashboardPanel
 *
 * Reusable panel/card wrapper for dark dashboards. Provides a consistent
 * header with optional icon, title, subtitle and contextual `InfoButton`,
 * a body slot, and an optional footer slot (e.g. for CTA buttons).
 *
 * Designed to be composed by higher level dashboards (e.g. the health
 * expenditure dashboard) and to replace ad-hoc panel markup elsewhere.
 */

import type { ReactNode } from 'react'
import { InfoButton } from './InfoButton'
import './DashboardPanel.css'

export type DashboardPanelDensity = 'comfortable' | 'compact'
export type DashboardPanelTone = 'surface' | 'surface-2'

export type DashboardPanelProps = {
  title?: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  /** Tooltip text shown via the embedded InfoButton popover. */
  info?: ReactNode
  /** Accessible name for the info button trigger. */
  infoLabel?: string
  /** Right-aligned slot in the header (e.g. badge, total). */
  headerAside?: ReactNode
  children: ReactNode
  footer?: ReactNode
  density?: DashboardPanelDensity
  tone?: DashboardPanelTone
  className?: string
  ariaLabel?: string
}

export function DashboardPanel({
  title,
  subtitle,
  icon,
  info,
  infoLabel,
  headerAside,
  children,
  footer,
  density = 'comfortable',
  tone = 'surface',
  className,
  ariaLabel,
}: DashboardPanelProps) {
  const hasHeader = Boolean(title || subtitle || icon || info || headerAside)

  const rootClass = [
    'dp',
    `dp--${density}`,
    `dp--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={rootClass} aria-label={ariaLabel}>
      {hasHeader && (
        <header className="dp__header">
          {icon && (
            <span className="dp__icon" aria-hidden="true">
              {icon}
            </span>
          )}

          <div className="dp__heading">
            {title && <h3 className="dp__title">{title}</h3>}
            {subtitle && <p className="dp__subtitle">{subtitle}</p>}
          </div>

          {info && (
            <InfoButton
              label={infoLabel ?? (typeof title === 'string' ? `Información sobre ${title}` : 'Información')}
              size="sm"
              placement="bottom"
              className="dp__info"
            >
              {info}
            </InfoButton>
          )}

          {headerAside && <div className="dp__aside">{headerAside}</div>}
        </header>
      )}

      <div className="dp__body">{children}</div>

      {footer && <footer className="dp__footer">{footer}</footer>}
    </section>
  )
}

export default DashboardPanel
