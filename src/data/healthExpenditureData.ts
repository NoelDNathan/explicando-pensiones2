import type { ReactNode } from 'react'
import lifetimeBandsCsv from '../../data/processed/airef/2026-05-25_airef_ine_gasto-sanitario-vital-esperado-bandas-dashboard_2022.csv?raw'
import lifetimeByAgeCsv from '../../data/processed/airef/2026-05-25_airef_ine_gasto-sanitario-vital-esperado-edad-sexo_2022.csv?raw'

export type AgeGroupDef = {
  id: string
  key: string
  label: string
  color: string
}

export type HealthCategoryDef = {
  id: string
  label: string
  totalValue: number
  totalFormatted: string
  segments: number[]
  shareOfTotal: number
}

export type LifetimePoint = {
  age: number
  cumulative: number
}

export type InterpretationPoint = {
  id: string
  lead: string
  body: string
}

export type KpiDef = {
  id: string
  label: string
  value: string
  secondary: string
  tone: 'teal' | 'purple' | 'amber' | 'blue' | 'rose'
}

type DashboardBandCsvRow = {
  anio: string
  sexo: string
  banda_dashboard: string
  edad_inicio: string
  edad_fin: string
  gasto_per_capita_ponderado_euros_2022: string
  anos_persona_esperados: string
  gasto_vital_esperado_banda_euros_2022: string
  porcentaje_sobre_gasto_vital_esperado: string
}

type LifetimeAgeCsvRow = {
  sexo: string
  grupo_edad: string
  edad_inicio: string
  edad_fin: string
  gasto_per_capita_euros_2022: string
  gasto_vital_esperado_tramo_euros_2022: string
  porcentaje_sobre_gasto_vital_esperado: string
}

function splitCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }

  values.push(current)
  return values
}

function parseCsv<T extends Record<string, string>>(csv: string): T[] {
  const lines = csv.trim().split(/\r?\n/)
  const headers = splitCsvLine(lines[0] ?? '').map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line)
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index] ?? ''
      return row
    }, {}) as T
  })
}

function formatEuro(value: number): string {
  return `${Math.round(value).toLocaleString('es-ES')} €`
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('es-ES', { maximumFractionDigits: 1 })}%`
}

const selectedSex = 'Ambos sexos'

const selectedBands = parseCsv<DashboardBandCsvRow>(lifetimeBandsCsv)
  .filter((row) => row.sexo === selectedSex)
  .sort((a, b) => Number(a.edad_inicio) - Number(b.edad_inicio))

const selectedAgeRows = parseCsv<LifetimeAgeCsvRow>(lifetimeByAgeCsv)
  .filter((row) => row.sexo === selectedSex)
  .sort((a, b) => Number(a.edad_inicio) - Number(b.edad_inicio))

const ageGroupColors = ['#3b82f6', '#22d3ee', '#a855f7', '#d946ef', '#f43f5e', '#f97316', '#eab308']

export const AGE_GROUPS: AgeGroupDef[] = selectedBands.map((row, index) => ({
  id: `g${index + 1}`,
  key: `g${index + 1}`,
  label: row.banda_dashboard,
  color: ageGroupColors[index] ?? '#22d3ee',
}))

const lifetimeTotal = selectedBands.reduce(
  (sum, row) => sum + Number(row.gasto_vital_esperado_banda_euros_2022),
  0,
)

const olderShare = selectedBands
  .filter((row) => Number(row.edad_inicio) >= 65)
  .reduce((sum, row) => sum + Number(row.porcentaje_sobre_gasto_vital_esperado), 0)

const highIntensityShare = selectedBands
  .filter((row) => Number(row.edad_inicio) >= 65)
  .reduce((sum, row) => sum + Number(row.porcentaje_sobre_gasto_vital_esperado), 0)

const peakAnnualRow = selectedAgeRows.reduce<LifetimeAgeCsvRow | undefined>((best, row) => {
  if (!best) return row
  return Number(row.gasto_per_capita_euros_2022) > Number(best.gasto_per_capita_euros_2022)
    ? row
    : best
}, undefined)

const biggestBand = selectedBands.reduce<DashboardBandCsvRow | undefined>((best, row) => {
  if (!best) return row
  return Number(row.gasto_vital_esperado_banda_euros_2022) >
    Number(best.gasto_vital_esperado_banda_euros_2022)
    ? row
    : best
}, undefined)

export const HEALTH_CATEGORIES: HealthCategoryDef[] = [
  {
    id: 'total-health',
    label: 'Total sanidad',
    totalValue: Math.round(lifetimeTotal),
    totalFormatted: formatEuro(lifetimeTotal),
    segments: selectedBands.map((row) => Number(row.porcentaje_sobre_gasto_vital_esperado)),
    shareOfTotal: 100,
  },
]

export const LIFETIME_TOTAL = Math.round(lifetimeTotal)
export const LIFETIME_TOTAL_FORMATTED = formatEuro(LIFETIME_TOTAL)

export function buildLifetimeCurve(total = LIFETIME_TOTAL): LifetimePoint[] {
  const points: LifetimePoint[] = [{ age: 0, cumulative: 0 }]
  let cumulative = 0

  for (const row of selectedAgeRows) {
    const start = Number(row.edad_inicio)
    const end = Number(row.edad_fin)
    const bandTotal = Number(row.gasto_vital_esperado_tramo_euros_2022)
    const span = Math.max(1, end - start + 1)

    for (let age = start; age <= end; age += 1) {
      const progress = (age - start + 1) / span
      points.push({
        age,
        cumulative: Math.round(Math.min(cumulative + bandTotal * progress, total)),
      })
    }

    cumulative += bandTotal
  }

  return points
}

export const LIFETIME_POINTS = buildLifetimeCurve()

export const INTERPRETATION_POINTS: InterpretationPoint[] = [
  {
    id: 'i1',
    lead: 'El perfil anual aumenta con la edad',
    body: `el gasto per capita mas alto del perfil AIReF 2022 aparece en ${peakAnnualRow?.grupo_edad ?? 'edades avanzadas'}.`,
  },
  {
    id: 'i2',
    lead: 'El gasto vital esperado desde los 65',
    body: `representa el ${formatPercent(olderShare)} del total calculado con mortalidad INE 2022.`,
  },
  {
    id: 'i3',
    lead: 'La banda con mayor acumulado',
    body: `es ${biggestBand?.banda_dashboard ?? '45-64'}, con ${formatEuro(Number(biggestBand?.gasto_vital_esperado_banda_euros_2022 ?? 0))}.`,
  },
  {
    id: 'i4',
    lead: 'El dato conectado es total sanidad',
    body: 'no se desagrega por hospitalaria, primaria o farmacia porque AIReF no publica ese cruce completo por edad y sexo en el Excel revisado.',
  },
  {
    id: 'i5',
    lead: 'La metrica es de periodo',
    body: 'combina perfil de gasto 2022 con tabla de mortalidad 2022; no es una cohorte real ni una proyeccion futura.',
  },
]

export const KPI_ITEMS: KpiDef[] = [
  {
    id: 'total',
    label: 'Gasto total esperado por individuo',
    value: LIFETIME_TOTAL_FORMATTED,
    secondary: '100% del total',
    tone: 'teal',
  },
  {
    id: 'older',
    label: 'Peso desde los 65 anos',
    value: formatPercent(olderShare),
    secondary: 'del gasto vital esperado',
    tone: 'purple',
  },
  {
    id: 'peak',
    label: 'Pico de gasto anual',
    value: formatEuro(Number(peakAnnualRow?.gasto_per_capita_euros_2022 ?? 0)),
    secondary: peakAnnualRow ? `grupo ${peakAnnualRow.grupo_edad}` : 'perfil AIReF 2022',
    tone: 'amber',
  },
  {
    id: 'age',
    label: 'Banda de mayor gasto acumulado',
    value: biggestBand?.banda_dashboard ?? '45-64',
    secondary: biggestBand
      ? `${formatEuro(Number(biggestBand.gasto_vital_esperado_banda_euros_2022))} acumulados`
      : 'calculo derivado',
    tone: 'blue',
  },
  {
    id: 'intensity',
    label: 'Concentracion 65+',
    value: formatPercent(highIntensityShare),
    secondary: 'suma de bandas 65-74, 75-84 y 85+',
    tone: 'rose',
  },
]

export const YEAR_OPTIONS = ['2022'] as const

export type StackedBarRow = Record<string, string | number | number[]> & {
  id: string
  label: string
  total: number
  totalFormatted: string
  segments: number[]
}

export function toStackedBarRows(categories = HEALTH_CATEGORIES): StackedBarRow[] {
  return categories.map((cat) => {
    const row: StackedBarRow = {
      id: cat.id,
      label: cat.label,
      total: cat.totalValue,
      totalFormatted: cat.totalFormatted,
      segments: cat.segments,
    }

    AGE_GROUPS.forEach((group, index) => {
      row[group.key] = Math.round(cat.totalValue * ((cat.segments[index] ?? 0) / 100))
    })

    return row
  })
}

export function getRankingCategories(categories = HEALTH_CATEGORIES) {
  return [...categories].sort((a, b) => b.totalValue - a.totalValue)
}

export type CategoryIconMap = Record<string, ReactNode>
