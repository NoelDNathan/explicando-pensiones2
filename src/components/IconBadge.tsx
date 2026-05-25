/**
 * IconBadge
 *
 * Small, coloured rounded square that hosts an icon. Used in KPI cards,
 * sidebar logos, ranking rows and anywhere we want to highlight a
 * category with a tinted backdrop and matching foreground colour.
 *
 * Tone tokens (`teal`, `purple`, `amber`, `rose`, `blue`, `lime`) supply
 * sensible defaults; consumers can override via `background` / `color`.
 */

import type { ReactNode } from 'react'
import './IconBadge.css'

export type IconBadgeSize = 'sm' | 'md' | 'lg'
export type IconBadgeTone =
  | 'teal'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'blue'
  | 'lime'
  | 'neutral'

export type IconBadgeShape = 'square' | 'circle'

export type IconBadgeProps = {
  children: ReactNode
  tone?: IconBadgeTone
  size?: IconBadgeSize
  shape?: IconBadgeShape
  /** Override the backdrop colour (any CSS color or token). */
  background?: string
  /** Override the icon colour. */
  color?: string
  className?: string
}

const TONE_VARS: Record<IconBadgeTone, { bg: string; fg: string }> = {
  teal:    { bg: 'rgba(34, 211, 238, 0.16)', fg: '#22d3ee' },
  purple:  { bg: 'rgba(167, 139, 250, 0.16)', fg: '#a78bfa' },
  amber:   { bg: 'rgba(245, 158, 11, 0.16)',  fg: '#f59e0b' },
  rose:    { bg: 'rgba(244, 114, 182, 0.16)', fg: '#f472b6' },
  blue:    { bg: 'rgba(96, 165, 250, 0.16)',  fg: '#60a5fa' },
  lime:    { bg: 'rgba(132, 204, 22, 0.16)',  fg: '#a3e635' },
  neutral: { bg: 'rgba(157, 182, 217, 0.12)', fg: '#cbd5e1' },
}

export function IconBadge({
  children,
  tone = 'teal',
  size = 'md',
  shape = 'square',
  background,
  color,
  className,
}: IconBadgeProps) {
  const tokens = TONE_VARS[tone]
  const style = {
    background: background ?? tokens.bg,
    color: color ?? tokens.fg,
  } as React.CSSProperties

  const rootClass = [
    'icon-badge',
    `icon-badge--${size}`,
    `icon-badge--${shape}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={rootClass} style={style} aria-hidden="true">
      {children}
    </span>
  )
}

export default IconBadge
