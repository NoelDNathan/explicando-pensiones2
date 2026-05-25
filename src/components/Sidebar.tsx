/**
 * Sidebar
 *
 * Fixed left navigation panel for institutional dashboards. Hosts a
 * brand row (icon + title), a vertical menu, an optional contextual
 * info card, a primary CTA button and a footer note.
 *
 * Purely presentational: callers wire onClick handlers per menu item
 * and own the active state. Menu items can show a green "online" dot
 * via `indicator` (e.g. for the active data view).
 */

import type { ReactNode } from 'react'
import { IconBadge } from './IconBadge'
import './Sidebar.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SidebarMenuItem = {
  id: string
  label: string
  icon: ReactNode
  /** Highlights the item as the currently selected route. */
  active?: boolean
  /** Renders a small status dot next to the label. */
  indicator?: boolean
  onClick?: () => void
  href?: string
}

export type SidebarBrand = {
  title: string
  subtitle?: string
  icon: ReactNode
}

export type SidebarInfoCard = {
  title: string
  body: ReactNode
}

export type SidebarProps = {
  brand: SidebarBrand
  menu: SidebarMenuItem[]
  infoCard?: SidebarInfoCard
  ctaLabel?: string
  onCtaClick?: () => void
  footerText?: ReactNode
  className?: string
  ariaLabel?: string
}

// ─── Sub-component: menu row ──────────────────────────────────────────────────

function MenuRow({ item }: { item: SidebarMenuItem }) {
  const rowClass = ['sb-menu__item', item.active ? 'sb-menu__item--active' : '']
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <span className="sb-menu__icon" aria-hidden="true">
        {item.icon}
      </span>
      <span className="sb-menu__label">{item.label}</span>
      {item.indicator && (
        <span className="sb-menu__indicator" aria-label="Disponible" />
      )}
    </>
  )

  if (item.href) {
    return (
      <li className="sb-menu__row">
        <a className={rowClass} href={item.href}>
          {content}
        </a>
      </li>
    )
  }

  return (
    <li className="sb-menu__row">
      <button
        type="button"
        className={rowClass}
        onClick={item.onClick}
        aria-current={item.active ? 'page' : undefined}
      >
        {content}
      </button>
    </li>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function Sidebar({
  brand,
  menu,
  infoCard,
  ctaLabel,
  onCtaClick,
  footerText,
  className,
  ariaLabel = 'Navegación principal',
}: SidebarProps) {
  const rootClass = ['sb', className].filter(Boolean).join(' ')

  return (
    <aside className={rootClass} aria-label={ariaLabel}>
      <div className="sb__brand">
        <IconBadge tone="teal" size="md">
          {brand.icon}
        </IconBadge>
        <div className="sb__brand-text">
          <p className="sb__brand-title">{brand.title}</p>
          {brand.subtitle && (
            <p className="sb__brand-subtitle">{brand.subtitle}</p>
          )}
        </div>
      </div>

      <nav className="sb__nav" aria-label="Secciones">
        <ul className="sb-menu">
          {menu.map((item) => (
            <MenuRow key={item.id} item={item} />
          ))}
        </ul>
      </nav>

      <div className="sb__footer">
        {infoCard && (
          <div className="sb-info-card">
            <p className="sb-info-card__title">{infoCard.title}</p>
            <p className="sb-info-card__body">{infoCard.body}</p>
          </div>
        )}

        {ctaLabel && (
          <button type="button" className="sb__cta" onClick={onCtaClick}>
            <span className="sb__cta-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {ctaLabel}
          </button>
        )}

        {footerText && <p className="sb__footnote">{footerText}</p>}
      </div>
    </aside>
  )
}

export default Sidebar
