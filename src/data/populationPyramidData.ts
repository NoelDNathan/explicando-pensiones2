import type { PyramidAgeGroup } from '../components/PopulationPyramid'

import observedPopulationCsv from '../../data/processed/ine/2026-05-18_ine_ecp_piramide-poblacion-espana-sexo-edad_1975-2025.csv?raw'
import projectedPopulationCsv from '../../data/processed/ine/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv?raw'

type PopulationRow = {
  year: number
  sex: 'male' | 'female'
  age: number
  population: number
  status: 'observed' | 'projected'
}

export type PopulationYearSummary = {
  year: number
  status: 'observed' | 'projected'
  totalPopulation: number
  workingAgePopulation: number
  olderPopulation: number
  maxFiveYearSexPopulationThousands: number
  data: PyramidAgeGroup[]
}

const AGE_GROUPS = [
  { label: '90+', start: 90, end: null },
  { label: '85-89', start: 85, end: 89 },
  { label: '80-84', start: 80, end: 84 },
  { label: '75-79', start: 75, end: 79 },
  { label: '70-74', start: 70, end: 74 },
  { label: '65-69', start: 65, end: 69 },
  { label: '60-64', start: 60, end: 64 },
  { label: '55-59', start: 55, end: 59 },
  { label: '50-54', start: 50, end: 54 },
  { label: '45-49', start: 45, end: 49 },
  { label: '40-44', start: 40, end: 44 },
  { label: '35-39', start: 35, end: 39 },
  { label: '30-34', start: 30, end: 34 },
  { label: '25-29', start: 25, end: 29 },
  { label: '20-24', start: 20, end: 24 },
  { label: '15-19', start: 15, end: 19 },
  { label: '10-14', start: 10, end: 14 },
  { label: '5-9', start: 5, end: 9 },
  { label: '0-4', start: 0, end: 4 },
] as const

const parseCsv = (csv: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index]
    const next = csv[index + 1]

    if (char === '"' && quoted && next === '"') {
      value += '"'
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === ',' && !quoted) {
      row.push(value)
      value = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(value)
      if (row.some((cell) => cell.length > 0)) rows.push(row)
      row = []
      value = ''
      continue
    }

    value += char
  }

  row.push(value)
  if (row.some((cell) => cell.length > 0)) rows.push(row)
  return rows
}

const parseAge = (value: string): number | null => {
  if (value === 'Todas las edades') return null
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : null
}

const getField = (
  row: string[],
  header: Map<string, number>,
  field: string,
): string => row[header.get(field) ?? -1] ?? ''

const normalizeRows = (
  csv: string,
  status: PopulationRow['status'],
  fields: {
    year: string
    sex: string
    age: string
    population: string
  },
): PopulationRow[] => {
  const [headerRow, ...dataRows] = parseCsv(csv)
  const header = new Map(headerRow?.map((field, index) => [field, index]) ?? [])

  return dataRows.flatMap((row) => {
    const age = parseAge(getField(row, header, fields.age))
    const sexLabel = getField(row, header, fields.sex)
    const population = Number(getField(row, header, fields.population))
    const year = Number(getField(row, header, fields.year))

    if (age === null || Number.isNaN(population) || Number.isNaN(year)) return []
    if (sexLabel !== 'Hombres' && sexLabel !== 'Mujeres') return []

    return [{
      year,
      sex: sexLabel === 'Hombres' ? 'male' : 'female',
      age,
      population,
      status,
    }]
  })
}

const observedRows = normalizeRows(observedPopulationCsv, 'observed', {
  year: 'anio',
  sex: 'sexo',
  age: 'edad',
  population: 'poblacion',
})

const projectedRows = normalizeRows(projectedPopulationCsv, 'projected', {
  year: 'anio',
  sex: 'sexo',
  age: 'edad',
  population: 'poblacion_residente_1_enero_personas',
})

const rowsByYear = [...observedRows, ...projectedRows]
  .filter((row) => row.status === 'observed' || row.year > 2025)
  .reduce((years, row) => {
    const yearRows = years.get(row.year) ?? []
    yearRows.push(row)
    years.set(row.year, yearRows)
    return years
  }, new Map<number, PopulationRow[]>())

const inAgeGroup = (
  age: number,
  group: (typeof AGE_GROUPS)[number],
): boolean => age >= group.start && (group.end === null || age <= group.end)

const roundToTens = (value: number): number => Math.ceil(value / 10) * 10

export const POPULATION_YEAR_SUMMARIES: PopulationYearSummary[] = [...rowsByYear.entries()]
  .sort(([a], [b]) => a - b)
  .map(([year, rows]) => {
    const status = rows.some((row) => row.status === 'projected') ? 'projected' : 'observed'
    const totalPopulation = rows.reduce((sum, row) => sum + row.population, 0)
    const workingAgePopulation = rows
      .filter((row) => row.age >= 20 && row.age <= 64)
      .reduce((sum, row) => sum + row.population, 0)
    const olderPopulation = rows
      .filter((row) => row.age >= 65)
      .reduce((sum, row) => sum + row.population, 0)

    let maxFiveYearSexPopulationThousands = 0

    const data = AGE_GROUPS.map((group) => {
      const male = rows
        .filter((row) => row.sex === 'male' && inAgeGroup(row.age, group))
        .reduce((sum, row) => sum + row.population, 0) / 1000
      const female = rows
        .filter((row) => row.sex === 'female' && inAgeGroup(row.age, group))
        .reduce((sum, row) => sum + row.population, 0) / 1000

      maxFiveYearSexPopulationThousands = Math.max(
        maxFiveYearSexPopulationThousands,
        male,
        female,
      )

      return {
        ageGroup: group.label,
        ageStart: group.start,
        ageEnd: group.end,
        male: { native: male, foreign: 0 },
        female: { native: female, foreign: 0 },
      }
    })

    return {
      year,
      status,
      totalPopulation,
      workingAgePopulation,
      olderPopulation,
      maxFiveYearSexPopulationThousands,
      data,
    }
  })

export const POPULATION_YEAR_RANGE = {
  min: POPULATION_YEAR_SUMMARIES[0]?.year ?? 1975,
  max: POPULATION_YEAR_SUMMARIES.at(-1)?.year ?? 2074,
}

export const POPULATION_SCALE_MAX = roundToTens(
  Math.max(...POPULATION_YEAR_SUMMARIES.map((year) => year.maxFiveYearSexPopulationThousands)),
)
