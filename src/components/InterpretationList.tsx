/**
 * InterpretationList
 *
 * Bulleted list of qualitative reading items for a chart panel.
 * Each row has a small coloured dot, an optional bold lead and a body.
 * Designed for the "Interpretación" panel on dark dashboards but
 * reusable for any chart-side commentary list.
 */

import type { ReactNode } from 'react'
import './InterpretationList.css'

export type InterpretationItem = {
  id: string
  /** Optional bold lead (e.g. "El gasto se acelera con la edad"). */
  lead?: string
  /** Rest of the sentence after the lead. May include inline markup. */
  body: ReactNode
}

export type InterpretationListProps = {
  items: InterpretationItem[]
  /** Override the dot colour (default: working-age boundary teal). */
  bulletColor?: string
  className?: string
}

export function InterpretationList({
  items,
  bulletColor,
  className,
}: InterpretationListProps) {
  const rootClass = ['ilist', className].filter(Boolean).join(' ')

  return (
    <ul
      className={rootClass}
      style={bulletColor ? ({ ['--ilist-bullet' as const]: bulletColor } as React.CSSProperties) : undefined}
    >
      {items.map((item) => (
        <li key={item.id} className="ilist__item">
          <span className="ilist__dot" aria-hidden="true" />
          <p className="ilist__text">
            {item.lead && <strong className="ilist__lead">{item.lead}</strong>}
            {item.lead && ': '}
            {item.body}
          </p>
        </li>
      ))}
    </ul>
  )
}

export default InterpretationList
