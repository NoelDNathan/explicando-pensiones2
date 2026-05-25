/**
 * InterpretationCard
 *
 * Dashboard card wrapper around `InterpretationList` with a lightbulb
 * badge and contextual `InfoButton`. Matches the reference layout.
 */

import { Lightbulb } from 'lucide-react'
import { DashboardPanel } from './DashboardPanel'
import { InterpretationList } from './InterpretationList'
import type { InterpretationItem } from './InterpretationList'
import { IconBadge } from './IconBadge'

export type InterpretationCardProps = {
  items: InterpretationItem[]
  className?: string
}

export function InterpretationCard({ items, className }: InterpretationCardProps) {
  return (
    <DashboardPanel
      className={className}
      icon={
        <IconBadge tone="amber" size="sm">
          <Lightbulb size={14} strokeWidth={2} />
        </IconBadge>
      }
      title="Interpretación"
      info={
        <p>
          Lectura cualitativa de los datos representados en el panel principal
          y en la curva acumulada.
        </p>
      }
      infoLabel="Cómo se interpreta este panel"
    >
      <InterpretationList items={items} variant="check" />
    </DashboardPanel>
  )
}

export default InterpretationCard
