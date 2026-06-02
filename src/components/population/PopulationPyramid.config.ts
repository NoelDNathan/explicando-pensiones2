import type { PyramidAgeGroup } from './PopulationPyramid.types'

export type LegendItem = {
  label: string
  color: string
}

export const PYRAMID_VIEWBOX = { width: 620, height: 493 }

export const PYRAMID_LAYOUT = {
  padding: { top: 16, right: 18, bottom: 14, left: 18 },
  titleY: 32,
  subtitleY: 50,
  sectionLabelY: 80,
  centerX: 240,
  axisGap: 30,
  barsTopY: 92,
  barHeight: 12,
  barRowGap: 3,
  bottomAxisY: 380,
  tickLabelY: 394,
  axisCaptionY: 410,
  rightLabelsX: 505,
  legendY: 448,
} as const

export const PYRAMID_COLORS = {
  backgroundFrom: 'var(--color-surface-deep)',
  backgroundTo: 'var(--color-surface-deep-2)',
  textTitle: 'var(--color-text-inverted)',
  textMuted: 'var(--color-text-inverted-muted)',
  textFaint: 'var(--color-text-inverted-faint)',
  axis: 'var(--color-axis-on-dark)',
  workingAgeBand: 'var(--color-working-age-band)',
  workingAgeBoundary: 'var(--color-working-age-boundary)',
  bars: {
    male: {
      native: {
        active: 'var(--color-pyramid-male-native-active)',
        rest: 'var(--color-pyramid-male-native-rest)',
      },
      foreign: {
        active: 'var(--color-pyramid-male-foreign-active)',
        rest: 'var(--color-pyramid-male-foreign-rest)',
      },
    },
    female: {
      native: {
        active: 'var(--color-pyramid-female-native-active)',
        rest: 'var(--color-pyramid-female-native-rest)',
      },
      foreign: {
        active: 'var(--color-pyramid-female-foreign-active)',
        rest: 'var(--color-pyramid-female-foreign-rest)',
      },
    },
  },
} as const

export const DEFAULT_PYRAMID_DATA: PyramidAgeGroup[] = [
  { ageGroup: '90+', ageStart: 90, ageEnd: null, male: { native: 25, foreign: 1 }, female: { native: 55, foreign: 1 } },
  { ageGroup: '85-89', ageStart: 85, ageEnd: 89, male: { native: 60, foreign: 3 }, female: { native: 105, foreign: 3 } },
  { ageGroup: '80-84', ageStart: 80, ageEnd: 84, male: { native: 110, foreign: 5 }, female: { native: 155, foreign: 5 } },
  { ageGroup: '75-79', ageStart: 75, ageEnd: 79, male: { native: 155, foreign: 8 }, female: { native: 195, foreign: 8 } },
  { ageGroup: '70-74', ageStart: 70, ageEnd: 74, male: { native: 215, foreign: 12 }, female: { native: 250, foreign: 12 } },
  { ageGroup: '65-69', ageStart: 65, ageEnd: 69, male: { native: 240, foreign: 18 }, female: { native: 270, foreign: 18 } },
  { ageGroup: '60-64', ageStart: 60, ageEnd: 64, male: { native: 290, foreign: 30 }, female: { native: 310, foreign: 30 } },
  { ageGroup: '55-59', ageStart: 55, ageEnd: 59, male: { native: 320, foreign: 40 }, female: { native: 330, foreign: 40 } },
  { ageGroup: '50-54', ageStart: 50, ageEnd: 54, male: { native: 345, foreign: 60 }, female: { native: 350, foreign: 60 } },
  { ageGroup: '45-49', ageStart: 45, ageEnd: 49, male: { native: 365, foreign: 80 }, female: { native: 360, foreign: 80 } },
  { ageGroup: '40-44', ageStart: 40, ageEnd: 44, male: { native: 360, foreign: 110 }, female: { native: 350, foreign: 105 } },
  { ageGroup: '35-39', ageStart: 35, ageEnd: 39, male: { native: 335, foreign: 140 }, female: { native: 325, foreign: 130 } },
  { ageGroup: '30-34', ageStart: 30, ageEnd: 34, male: { native: 275, foreign: 140 }, female: { native: 270, foreign: 130 } },
  { ageGroup: '25-29', ageStart: 25, ageEnd: 29, male: { native: 250, foreign: 110 }, female: { native: 245, foreign: 105 } },
  { ageGroup: '20-24', ageStart: 20, ageEnd: 24, male: { native: 265, foreign: 80 }, female: { native: 255, foreign: 75 } },
  { ageGroup: '15-19', ageStart: 15, ageEnd: 19, male: { native: 275, foreign: 55 }, female: { native: 260, foreign: 55 } },
  { ageGroup: '10-14', ageStart: 10, ageEnd: 14, male: { native: 285, foreign: 45 }, female: { native: 270, foreign: 45 } },
  { ageGroup: '5-9', ageStart: 5, ageEnd: 9, male: { native: 260, foreign: 30 }, female: { native: 245, foreign: 30 } },
  { ageGroup: '0-4', ageStart: 0, ageEnd: 4, male: { native: 235, foreign: 18 }, female: { native: 220, foreign: 18 } },
]

export const BIRTHPLACE_LEGEND_ITEMS: LegendItem[] = [
  { label: 'H nac. Espana', color: PYRAMID_COLORS.bars.male.native.active },
  { label: 'H nac. extranjero', color: PYRAMID_COLORS.bars.male.foreign.active },
  { label: 'M nac. Espana', color: PYRAMID_COLORS.bars.female.native.active },
  { label: 'M nac. extranjero', color: PYRAMID_COLORS.bars.female.foreign.active },
]

export const SEX_LEGEND_ITEMS: LegendItem[] = [
  { label: 'Hombres', color: PYRAMID_COLORS.bars.male.native.active },
  { label: 'Mujeres', color: PYRAMID_COLORS.bars.female.native.active },
]
