/**
 * RankingCard
 *
 * Dashboard card wrapper around `CategoryRanking` with a trophy badge,
 * contextual help and a CTA to drill down by age group.
 */

import { ArrowRight, Trophy } from 'lucide-react'
import { DashboardPanel } from './DashboardPanel'
import { CategoryRanking } from './CategoryRanking'
import type { CategoryRankingItem } from './CategoryRanking'
import { IconBadge } from './IconBadge'

export type RankingCardProps = {
  items: CategoryRankingItem[]
  onDetailClick?: () => void
  className?: string
}

export function RankingCard({ items, onDetailClick, className }: RankingCardProps) {
  return (
    <DashboardPanel
      className={className}
      icon={
        <IconBadge tone="amber" size="sm">
          <Trophy size={14} strokeWidth={2} />
        </IconBadge>
      }
      title="Ranking de categorías por gasto total"
      subtitle="€ por persona (acumulado de por vida)"
      info={
        <p>
          Ordenación de categorías por importe total acumulado por persona.
          El porcentaje indica el peso relativo sobre el gasto total esperado.
        </p>
      }
      infoLabel="Cómo se construye el ranking"
      footer={
        <button type="button" className="rc__cta" onClick={onDetailClick}>
          Ver detalle por edad
          <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
        </button>
      }
    >
      <CategoryRanking items={items} />
    </DashboardPanel>
  )
}

export default RankingCard
