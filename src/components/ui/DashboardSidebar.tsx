import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import type { SidebarBrand, SidebarInfoCard, SidebarMenuItem } from './Sidebar'

export type DashboardSidebarItem = Omit<SidebarMenuItem, 'active' | 'indicator'> & {
  indicator?: boolean | 'active'
}

export type DashboardSidebarProps = {
  brand: SidebarBrand
  items: DashboardSidebarItem[]
  activeItemId: string | string[]
  infoCard?: SidebarInfoCard
  ctaLabel?: string
  onCtaClick?: () => void
  footerText?: ReactNode
  className?: string
  ariaLabel?: string
}

export function DashboardSidebar({
  brand,
  items,
  activeItemId,
  infoCard,
  ctaLabel,
  onCtaClick,
  footerText,
  className,
  ariaLabel,
}: DashboardSidebarProps) {
  const activeItemIds = Array.isArray(activeItemId) ? activeItemId : [activeItemId]
  const menu = items.map((item) => {
    const isActive = activeItemIds.includes(item.id)
    const indicator = item.indicator === 'active' ? isActive : item.indicator

    return {
      ...item,
      active: isActive,
      indicator,
    }
  })

  return (
    <Sidebar
      brand={brand}
      menu={menu}
      infoCard={infoCard}
      ctaLabel={ctaLabel}
      onCtaClick={onCtaClick}
      footerText={footerText}
      className={className}
      ariaLabel={ariaLabel}
    />
  )
}

export default DashboardSidebar
