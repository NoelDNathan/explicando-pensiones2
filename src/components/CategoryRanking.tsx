/**
 * CategoryRanking
 *
 * Compact ranking list with a small leading icon, a category label,
 * a horizontal mini progress bar coloured per category, and value +
 * share columns on the right. Designed to live inside `DashboardPanel`.
 *
 * Bars are sized relative to `maxShare` (default: largest share in
 * the list), keeping the visualisation honest without external scales.
 */

import type { ReactNode } from 'react'
import './CategoryRanking.css'

export type CategoryRankingItem = {
  id: string
  label: string
  /** Optional leading icon (use any ReactNode). */
  icon?: ReactNode
  /** Pre-formatted main value (e.g. "29.600 €"). */
  value: string
  /** Share in percent (0-100). Used both as bar size and right-column label. */
  share: number
  /** Bar fill colour. Defaults to the working-age boundary teal. */
  color?: string
}

export type CategoryRankingProps = {
  items: CategoryRankingItem[]
  /** Reference share for bar scaling. Defaults to the highest share. */
  maxShare?: number
  /** Format function for the share. Defaults to `XX,X%`. */
  formatShare?: (share: number) => string
  className?: string
}

const DEFAULT_BAR_COLOR = 'var(--color-working-age-boundary)'

const defaultFormatShare = (share: number): string =>
  `${share.toLocaleString('es-ES', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}%`

export function CategoryRanking({
  items,
  maxShare,
  formatShare = defaultFormatShare,
  className,
}: CategoryRankingProps) {
  const computedMax = maxShare ?? items.reduce((acc, it) => Math.max(acc, it.share), 0)
  const safeMax = computedMax > 0 ? computedMax : 1

  const rootClass = ['crank', className].filter(Boolean).join(' ')

  return (
    <ul className={rootClass}>
      {items.map((item) => {
        const fill = item.color ?? DEFAULT_BAR_COLOR
        const widthPct = Math.max(0, Math.min(100, (item.share / safeMax) * 100))

        return (
          <li key={item.id} className="crank__row">
            {item.icon && (
              <span
                className="crank__icon"
                aria-hidden="true"
                style={{ color: fill }}
              >
                {item.icon}
              </span>
            )}

            <span className="crank__label" title={item.label}>
              {item.label}
            </span>

            <span className="crank__bar" aria-hidden="true">
              <span
                className="crank__bar-fill"
                style={{ width: `${widthPct}%`, background: fill }}
              />
            </span>

            <span className="crank__value">{item.value}</span>
            <span className="crank__share">{formatShare(item.share)}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default CategoryRanking
