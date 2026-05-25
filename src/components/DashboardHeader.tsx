/**
 * DashboardHeader
 *
 * Top bar for dashboard pages. Renders an optional eyebrow line, a big
 * title, a muted subtitle and a flexible `controls` slot for filter
 * chips and action buttons. Layout collapses to a stacked column on
 * narrow viewports.
 */

import type { ReactNode } from 'react'
import './DashboardHeader.css'

export type DashboardHeaderProps = {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  controls?: ReactNode
  className?: string
}

export function DashboardHeader({
  eyebrow,
  title,
  subtitle,
  controls,
  className,
}: DashboardHeaderProps) {
  const rootClass = ['dh', className].filter(Boolean).join(' ')

  return (
    <header className={rootClass}>
      <div className="dh__copy">
        {eyebrow && <p className="dh__eyebrow">{eyebrow}</p>}
        <h1 className="dh__title">{title}</h1>
        {subtitle && <p className="dh__subtitle">{subtitle}</p>}
      </div>

      {controls && <div className="dh__controls">{controls}</div>}
    </header>
  )
}

export default DashboardHeader
