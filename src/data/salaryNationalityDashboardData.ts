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

export const SALARY_NATIONALITY_DATA: SalaryNationalityDatum[] = [
  {
    id: 'spanish',
    label: 'Española',
    shortLabel: 'Española',
    value: 2450,
    share: 17.2,
    accent: '#18e6ff',
    icon: Map,
  },
  {
    id: 'dual',
    label: 'Española y doble nacionalidad',
    shortLabel: 'Doble nacionalidad',
    value: 2280,
    share: 16.0,
    accent: '#b56bff',
    icon: Users,
  },
  {
    id: 'eu',
    label: 'UE sin España',
    shortLabel: 'UE sin España',
    value: 2160,
    share: 15.2,
    accent: '#3694ff',
    icon: Globe2,
  },
  {
    id: 'latin-america',
    label: 'América Latina',
    shortLabel: 'América Latina',
    value: 1980,
    share: 13.9,
    accent: '#57e389',
    icon: Globe2,
  },
  {
    id: 'rest-europe',
    label: 'Resto de Europa',
    shortLabel: 'Resto de Europa',
    value: 1900,
    share: 13.3,
    accent: '#8d6dff',
    icon: Globe2,
  },
  {
    id: 'asia',
    label: 'Asia',
    shortLabel: 'Asia',
    value: 1820,
    share: 12.8,
    accent: '#ffb238',
    icon: Globe2,
  },
  {
    id: 'africa',
    label: 'África',
    shortLabel: 'África',
    value: 1650,
    share: 11.6,
    accent: '#ff5f8f',
    icon: Globe2,
  },
]

export const SALARY_PANEL_TOTAL = SALARY_NATIONALITY_DATA.reduce(
  (sum, item) => sum + item.value,
  0,
)

export const SALARY_PANEL_AVERAGE = Math.round(
  SALARY_PANEL_TOTAL / SALARY_NATIONALITY_DATA.length,
)

export const SALARY_KPIS: SalaryKpiDatum[] = [
  {
    id: 'average',
    label: 'Salario medio del panel',
    value: '2.030 €',
    icon: Coins,
    tone: 'cyan',
  },
  {
    id: 'spain',
    label: 'España',
    value: '2.450 €',
    icon: Map,
    tone: 'cyan',
  },
  {
    id: 'max',
    label: 'Máximo salarial',
    value: '2.450 €',
    detail: 'Española',
    icon: Star,
    tone: 'violet',
  },
  {
    id: 'gap',
    label: 'Brecha salarial',
    value: '800 €',
    detail: 'diferencia entre máximo y mínimo',
    icon: TrendingUpDown,
    tone: 'pink',
  },
  {
    id: 'above',
    label: 'Grupos por encima de 2.000 €',
    value: '3',
    detail: 'Española, Española y doble nacionalidad, UE sin España',
    icon: Users,
    tone: 'blue',
  },
]

export const SALARY_INTERPRETATION_POINTS = [
  'La nacionalidad española presenta el salario medio más alto del panel.',
  'Los grupos de la UE se sitúan en posiciones intermedias-altas.',
  'América Latina y resto de Europa muestran niveles salariales intermedios.',
  'Asia y África presentan los valores más bajos de la muestra ilustrativa.',
  'La brecha salarial refleja diferencias de inserción y composición ocupacional.',
]

export const SALARY_FOOTER_NOTES = [
  'Datos ilustrativos para visualización de ejemplo.',
  'Importes expresados en euros brutos mensuales.',
  'Diseño conceptual para mostrar cómo se vería un panel comparativo.',
]

export const SALARY_HEADER_ICON = CircleDollarSign
export const SALARY_SOURCE_ICON = Landmark
