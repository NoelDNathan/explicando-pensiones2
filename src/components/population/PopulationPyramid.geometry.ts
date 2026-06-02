import { PYRAMID_LAYOUT } from './PopulationPyramid.config'
import type { AgeLabelMode, PyramidAgeGroup } from './PopulationPyramid.types'

export type Geometry = {
  rowY: (index: number) => number
  maleBarBaseX: number
  femaleBarBaseX: number
  scale: number
  barsBottomY: number
}

export type WorkingBand = {
  topY: number
  bottomY: number
  height: number
  midY: number
  upperBoundaryY: number
  lowerBoundaryY: number
  hasAny: boolean
} | null

export const isWorkingAge = (group: PyramidAgeGroup, min: number, max: number): boolean => {
  const startInside = group.ageStart >= min && group.ageStart <= max
  const endInside = group.ageEnd === null ? false : group.ageEnd >= min && group.ageEnd <= max
  return startInside || endInside
}

export const shouldShowAgeLabel = (group: PyramidAgeGroup, mode: AgeLabelMode): boolean => {
  if (mode === false) return false
  if (mode === 'all') return true
  return group.ageStart % 10 === 0
}

export const formatPyramidValue = (value: number): string =>
  value.toLocaleString('es-ES', { maximumFractionDigits: 0 })

export const formatPyramidMillions = (thousands: number): string =>
  `${(thousands / 1000).toLocaleString('es-ES', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })} M`

export const groupTotal = (group: PyramidAgeGroup): number =>
  group.male.native + group.male.foreign + group.female.native + group.female.foreign

export const buildGeometry = (rowCount: number, scaleMax: number): Geometry => {
  const maleBarBaseX = PYRAMID_LAYOUT.centerX - PYRAMID_LAYOUT.axisGap
  const femaleBarBaseX = PYRAMID_LAYOUT.centerX + PYRAMID_LAYOUT.axisGap
  const maleMaxLength = maleBarBaseX - PYRAMID_LAYOUT.padding.left - 24
  const femaleMaxLength = PYRAMID_LAYOUT.rightLabelsX - femaleBarBaseX - 6
  const maxBarLength = Math.min(maleMaxLength, femaleMaxLength)
  const scale = maxBarLength / scaleMax
  const rowStride = PYRAMID_LAYOUT.barHeight + PYRAMID_LAYOUT.barRowGap
  const rowY = (index: number) => PYRAMID_LAYOUT.barsTopY + index * rowStride
  const barsBottomY = PYRAMID_LAYOUT.barsTopY + rowCount * rowStride - PYRAMID_LAYOUT.barRowGap

  return { rowY, maleBarBaseX, femaleBarBaseX, scale, barsBottomY }
}

export const computeWorkingBand = (
  data: PyramidAgeGroup[],
  geometry: Geometry,
  workingAgeMin: number,
  workingAgeMax: number,
): WorkingBand => {
  const indices = data.flatMap((group, index) =>
    isWorkingAge(group, workingAgeMin, workingAgeMax) ? [index] : [],
  )
  if (indices.length === 0) return null

  const oldestWorkingIndex = indices[0]
  const youngestWorkingIndex = indices[indices.length - 1]
  const padding = 2
  const upperBoundaryY = geometry.rowY(oldestWorkingIndex)
  const lowerBoundaryY = geometry.rowY(youngestWorkingIndex) + PYRAMID_LAYOUT.barHeight
  const topY = upperBoundaryY - padding
  const bottomY = lowerBoundaryY + padding

  return {
    topY,
    bottomY,
    height: bottomY - topY,
    midY: (topY + bottomY) / 2,
    upperBoundaryY,
    lowerBoundaryY,
    hasAny: true,
  }
}
