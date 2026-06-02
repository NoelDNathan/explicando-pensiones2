export type Nationality = 'native' | 'foreign'

export type Sex = 'male' | 'female'

export type SexBreakdown = Record<Nationality, number>

export type PyramidAgeGroup = {
  ageGroup: string
  ageStart: number
  ageEnd: number | null
  male: SexBreakdown
  female: SexBreakdown
}

export type AgeLabelMode = 'all' | 'decade' | false

export type PopulationPyramidProps = {
  data?: PyramidAgeGroup[]
  workingAgeMin?: number
  workingAgeMax?: number
  scaleMax?: number
  /** Show age range labels on the central axis. Default: every row. */
  ageLabels?: AgeLabelMode
  legendVariant?: 'birthplace' | 'sex'
  className?: string
  title?: string
  subtitle?: string
}
