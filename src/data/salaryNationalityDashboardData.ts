import type { LucideIcon } from 'lucide-react'
import {
  CircleDollarSign,
  Coins,
  Globe2,
  Landmark,
  Map,
  Star,
  TrendingUpDown,
  Users,
} from 'lucide-react'

export type SalaryNationalityDatum = {
  id: string
  label: string
  shortLabel: string
  annualValue: number
  value: number
  share: number
  accent: string
  icon: LucideIcon
}

export type SalaryKpiDatum = {
  id: string
  label: string
  value: string
  detail?: string
  icon: LucideIcon
  tone: 'cyan' | 'blue' | 'violet' | 'pink'
}

const monthly = (annualValue: number) => annualValue / 12
const roundEuro = (value: number) => Math.round(value)
const formatEuro = (value: number) => `${roundEuro(value).toLocaleString('es-ES')} €`

export const SALARY_NATIONALITY_DATA: SalaryNationalityDatum[] = [
  {
    id: 'spanish',
    label: 'Española',
    shortLabel: 'Española',
    annualValue: 28662.47,
    value: monthly(28662.47),
    share: 20.8,
    accent: '#18e6ff',
    icon: Map,
  },
  {
    id: 'rest-europe',
    label: 'Resto de Europa',
    shortLabel: 'Resto Europa',
    annualValue: 26572.36,
    value: monthly(26572.36),
    share: 19.3,
    accent: '#b56bff',
    icon: Globe2,
  },
  {
    id: 'eu',
    label: 'UE27 sin España',
    shortLabel: 'UE27 sin España',
    annualValue: 25950.79,
    value: monthly(25950.79),
    share: 18.9,
    accent: '#3694ff',
    icon: Globe2,
  },
  {
    id: 'africa',
    label: 'África',
    shortLabel: 'África',
    annualValue: 18951.06,
    value: monthly(18951.06),
    share: 13.8,
    accent: '#57e389',
    icon: Globe2,
  },
  {
    id: 'america',
    label: 'América',
    shortLabel: 'América',
    annualValue: 18725.59,
    value: monthly(18725.59),
    share: 13.6,
    accent: '#ffb238',
    icon: Globe2,
  },
  {
    id: 'other',
    label: 'Otros países',
    shortLabel: 'Otros países',
    annualValue: 18720.87,
    value: monthly(18720.87),
    share: 13.6,
    accent: '#ff5f8f',
    icon: Globe2,
  },
]

export const SALARY_TOTAL_NATIONAL_MONTHLY = monthly(28049.94)

export const SALARY_PANEL_TOTAL = SALARY_NATIONALITY_DATA.reduce(
  (sum, item) => sum + item.value,
  0,
)

export const SALARY_PANEL_AVERAGE = Math.round(
  SALARY_PANEL_TOTAL / SALARY_NATIONALITY_DATA.length,
)

export const SALARY_PANEL_MAX = SALARY_NATIONALITY_DATA[0]
export const SALARY_PANEL_MIN = SALARY_NATIONALITY_DATA.at(-1)!
export const SALARY_PANEL_GAP = SALARY_PANEL_MAX.value - SALARY_PANEL_MIN.value

export const SALARY_KPIS: SalaryKpiDatum[] = [
  {
    id: 'average',
    label: 'Salario medio del panel',
    value: formatEuro(SALARY_PANEL_AVERAGE),
    icon: Coins,
    tone: 'cyan',
  },
  {
    id: 'spain',
    label: 'Total nacional',
    value: formatEuro(SALARY_TOTAL_NATIONAL_MONTHLY),
    icon: Map,
    tone: 'cyan',
  },
  {
    id: 'max',
    label: 'Máximo salarial',
    value: formatEuro(SALARY_PANEL_MAX.value),
    detail: 'Española',
    icon: Star,
    tone: 'violet',
  },
  {
    id: 'gap',
    label: 'Brecha salarial',
    value: formatEuro(SALARY_PANEL_GAP),
    detail: 'diferencia entre Española y Otros países',
    icon: TrendingUpDown,
    tone: 'pink',
  },
  {
    id: 'above',
    label: 'Grupos por encima de 2.000 €',
    value: '3',
    detail: 'Española, Resto de Europa, UE27 sin España',
    icon: Users,
    tone: 'blue',
  },
]

export const SALARY_INTERPRETATION_POINTS = [
  'La nacionalidad española presenta el salario medio más alto entre los grupos publicados.',
  'Resto de Europa y UE27 sin España se sitúan por encima de 2.000 € mensuales.',
  'África, América y Otros países quedan en un bloque salarial inferior.',
  'La comparación usa nacionalidad jurídica, no lugar de nacimiento ni origen migratorio.',
  'La tabla agregada no permite separar países concretos dentro de cada área.',
]

export const SALARY_FOOTER_NOTES = [
  'Fuente: INE, Encuesta Anual de Estructura Salarial 2023, tabla 28190.',
  'Importes brutos mensuales calculados como salario anual / 12.',
  'La fuente no publica país individual en esta tabla: solo grandes áreas de nacionalidad.',
]

export const SALARY_HEADER_ICON = CircleDollarSign
export const SALARY_SOURCE_ICON = Landmark
