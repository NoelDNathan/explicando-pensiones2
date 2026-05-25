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
  COLLECTIVE_HEALTH_CATEGORIES,
  COLLECTIVE_KPI_ITEMS,
  HEALTH_CATEGORIES,
  INTERPRETATION_POINTS,
  KPI_ITEMS,
  LIFETIME_TOTAL_FORMATTED,
  YEAR_OPTIONS,
  formatSystemEuro,
  getRankingCategories,
} from '../data/healthExpenditureData'
import type { HealthCategoryDef, HealthViewMode } from '../data/healthExpenditureData'
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
  hospitalaria_especializada: <Building2 size={16} strokeWidth={1.8} />,
  atencion_primaria: <Stethoscope size={16} strokeWidth={1.8} />,
  farmacia: <Pill size={16} strokeWidth={1.8} />,
  protesis_traslados: <Ambulance size={16} strokeWidth={1.8} />,
  salud_publica_colectivos_capital: <Layers size={16} strokeWidth={1.8} />,
  hospital: <Building2 size={16} strokeWidth={1.8} />,
  primary: <Stethoscope size={16} strokeWidth={1.8} />,
  pharmacy: <Pill size={16} strokeWidth={1.8} />,
  emergency: <Ambulance size={16} strokeWidth={1.8} />,
  mental: <Brain size={16} strokeWidth={1.8} />,
  longterm: <HandHeart size={16} strokeWidth={1.8} />,
}

const RANKING_COLORS: Record<string, string> = {
  'total-health': '#22d3ee',
  hospitalaria_especializada: '#22d3ee',
  atencion_primaria: '#3b82f6',
  farmacia: '#d946ef',
  protesis_traslados: '#f97316',
  salud_publica_colectivos_capital: '#a855f7',
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
  category: <Building2 size={18} strokeWidth={1.8} />,
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

function buildRankingItems(categories: HealthCategoryDef[]): CategoryRankingItem[] {
  return getRankingCategories(categories).map((cat) => ({
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
  const [viewMode, setViewMode] = React.useState<HealthViewMode>('individual')
  const year = yearProp ?? internalYear
  const isCollective = viewMode === 'collective'
  const activeCategories = isCollective ? COLLECTIVE_HEALTH_CATEGORIES : HEALTH_CATEGORIES
  const activeKpis = isCollective ? COLLECTIVE_KPI_ITEMS : KPI_ITEMS
  const valueFormatter = isCollective ? formatSystemEuro : undefined
  const totalUnitLabel = isCollective ? '€ anuales del sistema' : '€ por persona'

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
  const sidebarMenu = SIDEBAR_MENU.map((item) => {
    if (item.id === 'individual') {
      return {
        ...item,
        active: !isCollective,
        indicator: !isCollective,
        onClick: () => setViewMode('individual'),
      }
    }
    if (item.id === 'aggregate') {
      return {
        ...item,
        active: isCollective,
        indicator: isCollective,
        onClick: () => setViewMode('collective'),
      }
    }
    return item
  })

  return (
    <div className={rootClass}>
      <Sidebar
        brand={{
          title: 'Gasto Sanitario',
          subtitle: 'en Espana',
          icon: <HeartPulse size={18} strokeWidth={2} />,
        }}
        menu={sidebarMenu}
        infoCard={{
          title: isCollective ? 'Vista colectiva' : 'Vista individual',
          body: isCollective
            ? 'Muestra el gasto anual estimado del sistema por edad y categoria.'
            : 'Muestra el consumo sanitario acumulado de una persona a lo largo de toda su vida.',
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
                icon={isCollective ? <Users size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                label={isCollective ? 'Vista colectiva' : 'Vista individual'}
                indicator
                chevron
                ariaLabel="Vista activa"
                onClick={() => setViewMode(isCollective ? 'individual' : 'collective')}
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
          {isCollective ? (
            <>
              El gasto colectivo multiplica el gasto anual per capita estimado por la{' '}
              <strong>poblacion media de 2022 en cada rango de edad.</strong>{' '}
              El desglose por categoria es una estimacion documentada.
            </>
          ) : (
            <>
              El gasto se expresa en euros de 2022 por individuo y representa el{' '}
              <strong>consumo acumulado esperado a lo largo de toda la vida.</strong>{' '}
              El desglose por categoria es una estimacion documentada.
            </>
          )}
        </InfoBanner>

        <div className="hed__grid">
          <DashboardPanel
            className="hed__panel hed__panel--main"
            title={
              isCollective
                ? 'Gasto sanitario anual estimado del sistema por edad y categoria'
                : 'Gasto sanitario acumulado esperado por individuo y categoria'
            }
            subtitle={isCollective ? 'euros de 2022, total del sistema' : 'euros de 2022'}
            info={
              <p>
                {isCollective
                  ? 'Reparto estimado del gasto anual del sistema: gasto per capita por edad y categoria multiplicado por la poblacion media trimestral INE 2022.'
                  : 'Reparto estimado por categoria y bandas de edad. Combina perfil total por edad de AIReF 2022, mortalidad INE 2022, pesos funcionales EGSP 2022 y perfiles relativos ministeriales publicados en 2005.'}
              </p>
            }
            infoLabel="Metodologia del gasto sanitario acumulado"
          >
            <StackedBarChart
              categories={activeCategories}
              icons={CATEGORY_ICONS}
              valueFormatter={valueFormatter}
              totalUnitLabel={totalUnitLabel}
            />
          </DashboardPanel>

          <DashboardPanel
            className="hed__panel hed__panel--curve"
            title={
              isCollective
                ? 'Referencia individual usada para el calculo'
                : 'Consumo acumulado de un individuo a lo largo de la vida'
            }
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
                {isCollective
                  ? 'La vista colectiva usa el gasto anual per capita por edad; esta curva queda como referencia individual de periodo.'
                  : 'El grafico muestra el gasto acumulado total esperado por una persona desde el nacimiento hasta el final de su vida, bajo una metrica de periodo.'}
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
            items={buildRankingItems(activeCategories)}
            onDetailClick={onRankingDetailClick}
          />
        </div>

        <ul className="hed__kpis" aria-label="Indicadores clave">
          {activeKpis.map((kpi) => (
            <li key={kpi.id} className="hed__kpi-item">
              <KpiCard
                kpi={kpi}
                icon={KPI_ICONS[kpi.id] ?? <Activity size={18} />}
              />
            </li>
          ))}
        </ul>

        <FooterNote
          left={
            isCollective
              ? 'Los importes colectivos son euros anuales de 2022: gasto per capita estimado por poblacion media del grupo de edad.'
              : `Los importes estan expresados en euros de 2022 y en terminos per capita. Total esperado conectado: ${LIFETIME_TOTAL_FORMATTED}.`
          }
          right="Fuente: AIReF 2025, INE 2022 y Ministerio de Sanidad EGSP/IGTGS; categorias estimadas."
        />
      </div>
    </div>
  )
}

export default HealthExpenditureDashboard
