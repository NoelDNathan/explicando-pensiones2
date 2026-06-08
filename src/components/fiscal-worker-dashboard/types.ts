import type { ReactNode } from 'react'

export type FiscalTone = 'green' | 'purple' | 'cyan' | 'orange' | 'yellow' | 'violet'
export type DisabilityMode = 'none' | '33_64' | '65_or_more'

export type FiscalKpi = {
  title: string
  a: string
  b: string
  delta: string
  tone: FiscalTone
  icon: ReactNode
}

export type FiscalSummaryItem = {
  title: string
  a: string
  b: string
  delta: string
  tone: FiscalTone
  icon: ReactNode
}

export type FiscalChangeItem = readonly [
  label: string,
  value: string,
  width: number,
  tone: FiscalTone,
]

export type FiscalTableRow = readonly [
  concept: string,
  yearA: string,
  yearB: string,
  delta: string,
  deltaPercent: string,
]
