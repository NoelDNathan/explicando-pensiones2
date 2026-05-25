import React from 'react'
import {
  Activity,
  Ambulance,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  Eye,
  HandHeart,
  HeartPulse,
  Layers,
  LayoutGrid,
  MoreHorizontal,
  Pill,
  Share2,
  Stethoscope,
  TrendingUp,
  User,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import { Sidebar } from './Sidebar'
import type { SidebarMenuItem } from './Sidebar'
import { DashboardHeader } from './DashboardHeader'
import { ToolbarChip } from './ToolbarChip'
import { DashboardPanel } from './DashboardPanel'
import { InfoBanner } from './InfoBanner'
import { StackedBarChart } from './StackedBarChart'
import { LifetimeAreaChart } from './LifetimeAreaChart'
import { InterpretationCard } from './InterpretationCard'
import { RankingCard } from './RankingCard'
import './RankingCard.css'
import { KpiCard } from './KpiCard'
import { FooterNote } from './FooterNote'
import {
  HEALTH_CATEGORIES,
  INTERPRETATION_POINTS,
  KPI_ITEMS,
  LIFETIME_TOTAL_FORMATTED,
  YEAR_OPTIONS,
  getRankingCategories,
} from '../data/healthExpenditureData'
import type { CategoryRankingItem } from './CategoryRanking'
import './HealthExpenditureDashboard.css'

export type HealthExpenditureDashboardProps = {
  year?: string
  onYearChange?: (year: string) => void
  onShareClick?: () => void
  onMoreClick?: () => void
  onDownloadReport?: () => void
  onRankingDetailClick?: () => void
  className?: string
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'total-health': <HeartPulse size={16} strokeWidth={1.8} />,
  hospital: <Building2 size={16} strokeWidth={1.8} />,
  primary: <Stethoscope size={16} strokeWidth={1.8} />,
  pharmacy: <Pill size={16} strokeWidth={1.8} />,
  emergency: <Ambulance size={16} strokeWidth={1.8} />,
  mental: <Brain size={16} strokeWidth={1.8} />,
  longterm: <HandHeart size={16} strokeWidth={1.8} />,
}

const RANKING_COLORS: Record<string, string> = {
  'total-health': '#22d3ee',
  hospital: '#22d3ee',
  primary: '#3b82f6',
  longterm: '#a855f7',
  pharmacy: '#d946ef',
  emergency: '#f43f5e',
  mental: '#eab308',
}

const KPI_ICONS: Record<string, React.ReactNode> = {
  total: <Wallet size={18} strokeWidth={1.8} />,
  older: <Users size={18} strokeWidth={1.8} />,
  pharmacy: <Pill size={18} strokeWidth={1.8} />,
  peak: <TrendingUp size={18} strokeWidth={1.8} />,
  age: <User size={18} strokeWidth={1.8} />,
  intensity: <Calendar size={18} strokeWidth={1.8} />,
}

const SIDEBAR_MENU: SidebarMenuItem[] = [
  { id: 'overview', label: 'Resumen', icon: <LayoutGrid size={17} strokeWidth={1.8} />, active: true },
  { id: 'profile', label: 'Perfil por edad', icon: <BarChart3 size={17} strokeWidth={1.8} /> },
  { id: 'individual', label: 'Vista individual', icon: <UserRound size={17} strokeWidth={1.8} />, indicator: true },
  { id: 'aggregate', label: 'Vista agregada', icon: <Users size={17} strokeWidth={1.8} /> },
  { id: 'scenarios', label: 'Escenarios', icon: <Layers size={17} strokeWidth={1.8} /> },
  { id: 'methodology', label: 'Metodologia', icon: <BookOpen size={17} strokeWidth={1.8} /> },
]

function buildRankingItems(): CategoryRankingItem[] {
  return getRankingCategories().map((cat) => ({
    id: cat.id,
    label: cat.label,
    value: cat.totalFormatted,
    share: cat.shareOfTotal,
    color: RANKING_COLORS[cat.id] ?? '#22d3ee',
    icon: CATEGORY_ICONS[cat.id],
  }))
}

export function HealthExpenditureDashboard({
  year: yearProp,
  onYearChange,
  onShareClick,
  onMoreClick,
  onDownloadReport,
  onRankingDetailClick,
  className,
}: HealthExpenditureDashboardProps) {
  const [internalYear, setInternalYear] = React.useState('2022')
  const year = yearProp ?? internalYear

  const handleYearChange = (value: string): void => {
    if (yearProp === undefined) setInternalYear(value)
    onYearChange?.(value)
  }

  const interpretationItems = INTERPRETATION_POINTS.map((point) => ({
    id: point.id,
    lead: point.lead,
    body: point.body,
  }))

  const rootClass = ['hed', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      <Sidebar
        brand={{
          title: 'Gasto Sanitario',
          subtitle: 'en Espana',
          icon: <HeartPulse size={18} strokeWidth={2} />,
        }}
        menu={SIDEBAR_MENU}
        infoCard={{
          title: 'Vista individual',
          body: 'Muestra el consumo sanitario acumulado de una persona a lo largo de toda su vida.',
        }}
        ctaLabel="Descargar informe"
        onCtaClick={onDownloadReport}
        footerText="Ultima actualizacion Mayo 2026"
      />

      <div className="hed__main">
        <DashboardHeader
          title="El gasto sanitario a lo largo de la vida"
          subtitle="Explora y comprende el gasto sanitario publico a lo largo del ciclo vital."
          controls={
            <>
              <ToolbarChip
                mode="select"
                icon={<Calendar size={15} strokeWidth={1.8} />}
                prefix="Ano"
                value={year}
                options={YEAR_OPTIONS.map((option) => ({ value: option, label: option }))}
                onChange={handleYearChange}
                ariaLabel="Seleccionar ano"
              />
              <ToolbarChip
                mode="button"
                icon={<Eye size={15} strokeWidth={1.8} />}
                label="Vista individual"
                indicator
                chevron
                ariaLabel="Vista activa"
              />
              <ToolbarChip
                mode="button"
                icon={<Share2 size={15} strokeWidth={1.8} />}
                label="Compartir"
                onClick={onShareClick}
              />
              <ToolbarChip
                mode="icon"
                icon={<MoreHorizontal size={16} strokeWidth={2} />}
                ariaLabel="Mas opciones"
                onClick={onMoreClick}
              />
            </>
          }
        />

        <InfoBanner>
          El gasto se expresa en euros de 2022 por individuo y representa el{' '}
          <strong>consumo acumulado esperado a lo largo de toda la vida.</strong>
        </InfoBanner>

        <div className="hed__grid">
          <DashboardPanel
            className="hed__panel hed__panel--main"
            title="Gasto sanitario acumulado esperado por individuo, por grupos de edad"
            subtitle="euros de 2022"
            info={
              <p>
                Reparto por bandas de edad del gasto sanitario publico esperado a lo largo
                de la vida. La fuente conectada no ofrece desglose completo por categoria.
              </p>
            }
            infoLabel="Metodologia del gasto sanitario acumulado"
          >
            <StackedBarChart categories={HEALTH_CATEGORIES} icons={CATEGORY_ICONS} />
          </DashboardPanel>

          <DashboardPanel
            className="hed__panel hed__panel--curve"
            title="Consumo acumulado de un individuo a lo largo de la vida"
            subtitle="euros de 2022"
            info={
              <p>
                Suma acumulada del gasto sanitario per capita desde el nacimiento, estimada
                con perfil AIReF 2022 y tabla de mortalidad INE 2022.
              </p>
            }
            infoLabel="Metodologia del gasto acumulado"
            footer={
              <p className="hed__curve-caption">
                El grafico muestra el gasto acumulado total esperado por una persona desde
                el nacimiento hasta el final de su vida, bajo una metrica de periodo.
              </p>
            }
          >
            <LifetimeAreaChart />
          </DashboardPanel>

          <InterpretationCard
            className="hed__panel hed__panel--interpretation"
            items={interpretationItems}
          />

          <RankingCard
            className="hed__panel hed__panel--ranking"
            items={buildRankingItems()}
            onDetailClick={onRankingDetailClick}
          />
        </div>

        <ul className="hed__kpis" aria-label="Indicadores clave">
          {KPI_ITEMS.map((kpi) => (
            <li key={kpi.id} className="hed__kpi-item">
              <KpiCard
                kpi={kpi}
                icon={KPI_ICONS[kpi.id] ?? <Activity size={18} />}
              />
            </li>
          ))}
        </ul>

        <FooterNote
          left={`Los importes estan expresados en euros de 2022 y en terminos per capita. Total esperado conectado: ${LIFETIME_TOTAL_FORMATTED}.`}
          right="Fuente: AIReF 2025 e INE Tablas de Mortalidad 2022; calculo propio de periodo."
        />
      </div>
    </div>
  )
}

export default HealthExpenditureDashboard
