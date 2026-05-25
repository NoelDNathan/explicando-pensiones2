/**
 * KpiCard
 *
 * Thin wrapper around `MetricCard` sized for the health dashboard KPI row.
 * Maps tone tokens to coloured icon badges.
 */

import type { ReactNode } from 'react'
import { MetricCard } from './MetricCard'
import { IconBadge } from './IconBadge'
import type { KpiDef } from '../data/healthExpenditureData'

const TONE_COLORS: Record<KpiDef['tone'], string> = {
  teal: '#22d3ee',
  purple: '#a78bfa',
  amber: '#f59e0b',
  blue: '#60a5fa',
  rose: '#f472b6',
}

export type KpiCardProps = {
  kpi: KpiDef
  icon: ReactNode
  className?: string
}

export function KpiCard({ kpi, icon, className }: KpiCardProps) {
  return (
    <MetricCard
      className={className}
      size="lg"
      label={kpi.label}
      value={kpi.value}
      secondary={kpi.secondary}
      secondaryColor={TONE_COLORS[kpi.tone]}
      icon={
        <IconBadge tone={kpi.tone} size="md">
          {icon}
        </IconBadge>
      }
    />
  )
}

export default KpiCard
