/**
 * HealthExpenditureDashboard
 *
 * Composite dashboard that explains lifetime health expenditure by
 * category and age group, mirroring the institutional reference layout.
 *
 * Composition (top to bottom):
 *   - `InfoBanner` with the scope note (constant 2022 €, per-person).
 *   - Main grid: `StackedAgeBarChart` + `CumulativeLineChart` +
 *     `InterpretationList` + `CategoryRanking`, each wrapped in a
 *     `DashboardPanel` for consistent chrome and contextual `InfoButton`s.
 *   - KPI row of `MetricCard`s with summary indicators.
 *   - Footer source line.
 *
 * Demo data approximates a "Modelos propios a partir de datos del SNS"
 * scenario. Real series can be supplied via props once available.
 */

import type { ReactNode } from 'react'
import { DashboardPanel } from './DashboardPanel'
import { InfoBanner } from './InfoBanner'
import { StackedAgeBarChart } from './StackedAgeBarChart'
import type {
  AgeGroup,
  StackedAgeBarCategory,
} from './StackedAgeBarChart'
import { CumulativeLineChart } from './CumulativeLineChart'
import type {
  CumulativePoint,
  CumulativeLineChartMarker,
} from './CumulativeLineChart'
import { InterpretationList } from './InterpretationList'
import type { InterpretationItem } from './InterpretationList'
import { CategoryRanking } from './CategoryRanking'
import type { CategoryRankingItem } from './CategoryRanking'
import { MetricCard } from './MetricCard'
import type { MetricCardProps } from './MetricCard'
import './HealthExpenditureDashboard.css'

// ─── Public types ───────────────────────────────────────────────────────────

export type HealthExpenditureDashboardProps = {
  bannerText?: ReactNode
  ageGroups?: AgeGroup[]
  categories?: StackedAgeBarCategory[]
  cumulativePoints?: CumulativePoint[]
  cumulativeMarker?: CumulativeLineChartMarker
  interpretation?: InterpretationItem[]
  ranking?: CategoryRankingItem[]
  kpis?: MetricCardProps[]
  footnote?: ReactNode
  onRankingDetailClick?: () => void
  className?: string
}

// ─── Category icons ─────────────────────────────────────────────────────────

function IcoHospital() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 10v6M9 13h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IcoStethoscope() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 4v6a4 4 0 0 0 8 0V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="6" cy="4" r="1.2" fill="currentColor" />
      <circle cx="14" cy="4" r="1.2" fill="currentColor" />
      <path d="M10 14v3a3 3 0 0 0 6 0v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="16" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IcoPill() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3.5"
        y="9"
        width="17"
        height="6"
        rx="3"
        transform="rotate(-30 12 12)"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line x1="9" y1="7" x2="13" y2="17" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IcoEmergency() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h7l5-3v16l-5-3H4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M18 9l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IcoBrain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 5a3 3 0 0 0-3 3 2.5 2.5 0 0 0-2 2.4 2.5 2.5 0 0 0 1.2 2.1A2.5 2.5 0 0 0 5 15a3 3 0 0 0 4 2.8V5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M15 5a3 3 0 0 1 3 3 2.5 2.5 0 0 1 2 2.4 2.5 2.5 0 0 1-1.2 2.1A2.5 2.5 0 0 1 19 15a3 3 0 0 1-4 2.8V5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 5v13" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IcoHandHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 17l-5-4.5C5.5 11 5.5 9 7 7.5S11 7 12 9c1-2 3.5-2 5-0.5S18.5 11 17 12.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M5 17l7 4 7-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IcoBulb() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 17h6M10 21h4M12 3a6 6 0 0 0-4 10.5c1 1 1.5 1.8 1.5 3h5c0-1.2 0.5-2 1.5-3A6 6 0 0 0 12 3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function IcoTrophy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 4h10v3a5 5 0 0 1-10 0V4z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M5 5h2v2a2 2 0 0 1-2 0V5zM17 5h2v2a2 2 0 0 1-2 0V5z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 13v3M15 13v3M7 19h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

// ─── KPI icons ──────────────────────────────────────────────────────────────

function IcoWallet() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="5" y="9" width="22" height="15" rx="2.5" stroke="#36d9e0" strokeWidth="1.6" />
      <path d="M5 12h17a2 2 0 0 1 0 4H5" stroke="#36d9e0" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="22" cy="17" r="1.2" fill="#36d9e0" />
    </svg>
  )
}

function IcoPillBig() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect
        x="5.5"
        y="11"
        width="22"
        height="9"
        rx="4.5"
        transform="rotate(-30 16 16)"
        stroke="#b370ea"
        strokeWidth="1.6"
      />
      <line x1="11.5" y1="7.5" x2="17.5" y2="24" stroke="#b370ea" strokeWidth="1.6" />
    </svg>
  )
}

function IcoChartUp() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <polyline
        points="4,24 11,18 17,21 22,12 28,6"
        stroke="#f59e0b"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="6" r="2.2" fill="#f59e0b" />
    </svg>
  )
}

function IcoPerson() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="11" r="4" stroke="#36d9e0" strokeWidth="1.8" />
      <path d="M6 27c0-5 4.5-9 10-9s10 4 10 9" stroke="#36d9e0" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function IcoCalendar() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="5" y="7" width="22" height="20" rx="2.5" stroke="#f59e0b" strokeWidth="1.6" />
      <line x1="5" y1="13" x2="27" y2="13" stroke="#f59e0b" strokeWidth="1.6" />
      <line x1="11" y1="4" x2="11" y2="10" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="21" y1="4" x2="21" y2="10" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="10" y="17" width="4" height="4" rx="0.5" fill="#f59e0b" opacity="0.4" />
    </svg>
  )
}

// ─── Age group palette (matches the project pyramid colours) ────────────────

const DEFAULT_AGE_GROUPS: AgeGroup[] = [
  { id: 'g1',  label: '0-14',  color: '#3b8bd9' },
  { id: 'g2',  label: '15-24', color: '#5a8dee' },
  { id: 'g3',  label: '25-44', color: '#9a5cd8' },
  { id: 'g4',  label: '45-64', color: '#d35aa8' },
  { id: 'g5',  label: '65-74', color: '#e76a5a' },
  { id: 'g6',  label: '75-84', color: '#f59e0b' },
  { id: 'g7',  label: '85+',   color: '#f5cd3a' },
]

// ─── Demo data ──────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: StackedAgeBarCategory[] = [
  {
    id: 'hospital',
    label: 'Hospitalaria',
    icon: <IcoHospital />,
    segments: [5, 5, 18, 25, 15, 17, 15],
    total: '29.600 €',
    totalValue: 29600,
  },
  {
    id: 'primary',
    label: 'Atención primaria',
    icon: <IcoStethoscope />,
    segments: [12, 14, 28, 24, 10, 7, 5],
    total: '18.900 €',
    totalValue: 18900,
  },
  {
    id: 'pharmacy',
    label: 'Farmacia',
    icon: <IcoPill />,
    segments: [8, 10, 22, 27, 13, 12, 8],
    total: '15.400 €',
    totalValue: 15400,
  },
  {
    id: 'emergency',
    label: 'Urgencias',
    icon: <IcoEmergency />,
    segments: [10, 14, 26, 23, 10, 9, 8],
    total: '6.800 €',
    totalValue: 6800,
  },
  {
    id: 'mental',
    label: 'Salud mental',
    icon: <IcoBrain />,
    segments: [14, 16, 28, 23, 9, 6, 4],
    total: '4.200 €',
    totalValue: 4200,
  },
  {
    id: 'longterm',
    label: 'Cuidados larga duración',
    icon: <IcoHandHeart />,
    segments: [1, 1, 3, 10, 19, 24, 42],
    total: '17.700 €',
    totalValue: 17700,
  },
]

// Cumulative spending over a lifetime (illustrative S-curve, in €).
function buildCumulativeCurve(): CumulativePoint[] {
  const points: CumulativePoint[] = []
  const total = 92_600
  // Use a logistic shape centred around age 65, with a softer pre-65 slope
  // and an accelerating post-65 slope. This matches the reference visual.
  for (let age = 0; age <= 100; age += 2) {
    const a = (age - 65) / 12
    const logistic = 1 / (1 + Math.exp(-a))
    const value = Math.round(total * (0.06 * (age / 65) + 0.94 * logistic))
    points.push({ x: age, y: Math.min(value, total) })
  }
  return points
}

const DEFAULT_CUMULATIVE_POINTS = buildCumulativeCurve()

const DEFAULT_CUMULATIVE_MARKER: CumulativeLineChartMarker = {
  x: 87,
  y: 92_600,
  label: 'Total esperado 92.600 €',
}

const DEFAULT_INTERPRETATION: InterpretationItem[] = [
  {
    id: 'i1',
    lead: 'El gasto se acelera con la edad',
    body: 'más del 60% del consumo acumulado ocurre a partir de los 65 años, especialmente en hospitalización y cuidados de larga duración.',
  },
  {
    id: 'i2',
    lead: 'Hospitalaria y cuidados de larga duración',
    body: 'son las categorías que más contribuyen al gasto total.',
  },
  {
    id: 'i3',
    lead: 'La farmacia',
    body: 'tiene un peso relevante y sostenido desde edades adultas.',
  },
  {
    id: 'i4',
    lead: 'La atención primaria',
    body: 'concentra el gasto en edades con mayor actividad asistencial.',
  },
  {
    id: 'i5',
    lead: 'Las diferencias por categoría',
    body: 'reflejan necesidades asistenciales distintas a lo largo del ciclo vital.',
  },
]

const DEFAULT_RANKING: CategoryRankingItem[] = [
  { id: 'hospital',  label: 'Hospitalaria',            value: '29.600 €', share: 32.0, color: '#36d9e0', icon: <IcoHospital /> },
  { id: 'primary',   label: 'Atención primaria',       value: '18.900 €', share: 20.4, color: '#5b95f2', icon: <IcoStethoscope /> },
  { id: 'longterm',  label: 'Cuidados larga duración', value: '17.700 €', share: 19.1, color: '#b370ea', icon: <IcoHandHeart /> },
  { id: 'pharmacy',  label: 'Farmacia',                value: '15.400 €', share: 16.6, color: '#e86060', icon: <IcoPill /> },
  { id: 'emergency', label: 'Urgencias',               value: '6.800 €',  share: 7.4,  color: '#e76a5a', icon: <IcoEmergency /> },
  { id: 'mental',    label: 'Salud mental',            value: '4.200 €',  share: 4.5,  color: '#f5cd3a', icon: <IcoBrain /> },
]

const DEFAULT_KPIS: MetricCardProps[] = [
  {
    icon: <IcoWallet />,
    label: 'Gasto total esperado por individuo',
    value: '92.600 €',
    secondary: '100% del total',
    secondaryColor: '#36d9e0',
  },
  {
    icon: <IcoPillBig />,
    label: 'Peso de farmacia',
    value: '16,6%',
    secondary: '15.400 €',
    secondaryColor: '#b370ea',
    note: 'del gasto total',
  },
  {
    icon: <IcoChartUp />,
    label: 'Pico de gasto anual',
    value: '3.180 €',
    secondary: 'a los 87 años',
    secondaryColor: '#f59e0b',
  },
  {
    icon: <IcoPerson />,
    label: 'Edad de mayor consumo acumulado',
    value: '87 años',
    secondary: 'Inicio de la aceleración: 65 años',
    secondaryColor: '#36d9e0',
  },
  {
    icon: <IcoCalendar />,
    label: 'Años con mayor intensidad de gasto',
    value: '70-95 años',
    secondary: 'Concentran 52% del total',
    secondaryColor: '#f59e0b',
  },
]

// ─── Component ──────────────────────────────────────────────────────────────

export function HealthExpenditureDashboard({
  bannerText,
  ageGroups = DEFAULT_AGE_GROUPS,
  categories = DEFAULT_CATEGORIES,
  cumulativePoints = DEFAULT_CUMULATIVE_POINTS,
  cumulativeMarker = DEFAULT_CUMULATIVE_MARKER,
  interpretation = DEFAULT_INTERPRETATION,
  ranking = DEFAULT_RANKING,
  kpis = DEFAULT_KPIS,
  footnote,
  onRankingDetailClick,
  className,
}: HealthExpenditureDashboardProps) {
  const rootClass = ['hed', className].filter(Boolean).join(' ')

  const defaultBanner = (
    <>
      El gasto se expresa en euros constantes de 2022 por individuo y representa el{' '}
      <strong>consumo acumulado esperado a lo largo de toda la vida.</strong>
    </>
  )

  const defaultFootnote =
    'Los importes están expresados en euros constantes de 2022 y en términos per cápita. Incluyen gasto público en servicios sanitarios.'

  return (
    <div className={rootClass}>
      <InfoBanner>{bannerText ?? defaultBanner}</InfoBanner>

      <div className="hed__grid">
        <DashboardPanel
          className="hed__panel hed__panel--main"
          title="Gasto sanitario acumulado por individuo y categoría, por grupos de edad"
          subtitle="€ constantes de 2022"
          info={
            <p>
              Reparto del gasto sanitario público per cápita acumulado a lo largo
              de la vida, desglosado por categoría de servicio y grupo quinquenal
              de edad. Las cifras se expresan en euros constantes de 2022.
            </p>
          }
          infoLabel="Metodología del gasto sanitario acumulado"
        >
          <StackedAgeBarChart
            ageGroups={ageGroups}
            categories={categories}
            xAxisTicks={[0, 10000, 20000, 30000]}
          />
        </DashboardPanel>

        <DashboardPanel
          className="hed__panel hed__panel--curve"
          title="Consumo acumulado de un individuo a lo largo de la vida"
          subtitle="€ constantes de 2022"
          info={
            <p>
              Suma acumulada del gasto sanitario per cápita desde el nacimiento.
              El consumo se acelera notablemente a partir de los 65 años por la
              concentración del gasto hospitalario y de cuidados de larga duración.
            </p>
          }
          infoLabel="Metodología del gasto acumulado"
          footer={
            <p className="hed__curve-caption">
              El gráfico muestra el gasto acumulado total esperado por una persona
              desde el nacimiento hasta el final de su vida.
            </p>
          }
        >
          <CumulativeLineChart
            points={cumulativePoints}
            marker={cumulativeMarker}
            xTicks={[0, 20, 40, 60, 80, 100]}
            yTicks={[0, 20_000, 40_000, 60_000, 80_000, 100_000]}
            xDomain={[0, 100]}
            yDomain={[0, 120_000]}
            xLabel="Edad"
            showArea
            height={210}
            ariaLabel="Curva acumulada de gasto sanitario por edad"
          />
        </DashboardPanel>

        <DashboardPanel
          className="hed__panel hed__panel--interpretation"
          icon={<IcoBulb />}
          title="Interpretación"
          info={
            <p>
              Lectura cualitativa de los datos representados en el panel principal
              y en la curva acumulada. Se actualiza cuando cambian los datos.
            </p>
          }
          infoLabel="Cómo se interpreta este panel"
        >
          <InterpretationList items={interpretation} />
        </DashboardPanel>

        <DashboardPanel
          className="hed__panel hed__panel--ranking"
          icon={<IcoTrophy />}
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
            <button
              type="button"
              className="hed__ranking-cta"
              onClick={onRankingDetailClick}
            >
              Ver detalle por edad
              <span aria-hidden="true" className="hed__cta-arrow">
                →
              </span>
            </button>
          }
        >
          <CategoryRanking items={ranking} />
        </DashboardPanel>
      </div>

      <ul className="hed__kpis" aria-label="Indicadores clave">
        {kpis.map((kpi, i) => (
          <li key={i} className="hed__kpi-item">
            <MetricCard {...kpi} />
          </li>
        ))}
      </ul>

      <p className="hed__footnote">{footnote ?? defaultFootnote}</p>
    </div>
  )
}

export default HealthExpenditureDashboard
