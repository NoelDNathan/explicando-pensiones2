/**
 * StackedBarChart
 *
 * Horizontal stacked bar chart (Recharts) for category × age-group
 * lifetime health spending. Each row shows segment percentages inside
 * the bar and a formatted total on the right.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReactNode } from 'react'
import {
  AGE_GROUPS,
  toStackedBarRows,
  type HealthCategoryDef,
  type StackedBarRow,
} from '../data/healthExpenditureData'
import './StackedBarChart.css'

export type StackedBarChartProps = {
  categories?: HealthCategoryDef[]
  /** Map category id → icon node shown beside the label. */
  icons?: Record<string, ReactNode>
  valueFormatter?: (value: number) => string
  totalUnitLabel?: string
  xMax?: number
  className?: string
}

type SegmentLabelProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  value?: number
  index?: number
  dataKey?: string
}

type TooltipPayloadItem = {
  dataKey?: string
  value?: number
  payload?: StackedBarRow
}

type SegmentTooltipProps = {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  valueFormatter: (value: number) => string
}

function formatEuro(value: number): string {
  return `${value.toLocaleString('es-ES')} €`
}

function buildTicks(max: number): number[] {
  const step = Math.max(10_000, Math.ceil(max / 3 / 10_000) * 10_000)
  return [0, step, step * 2, step * 3]
}

function makeSegmentLabel(rows: StackedBarRow[]) {
  return function SegmentLabel({
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    value,
    index,
    dataKey,
  }: SegmentLabelProps) {
    if (!value || value <= 0 || width < 26 || index === undefined || !dataKey) return null

    const row = rows[index]
    if (!row) return null

    const groupIndex = AGE_GROUPS.findIndex((g) => g.key === dataKey)
    if (groupIndex < 0) return null

    const pct = row.segments[groupIndex]
    if (!pct || pct < 4) return null

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
      >
        {`${Math.round(pct)}%`}
      </text>
    )
  }
}

function CategoryTick({
  x = 0,
  y = 0,
  payload,
  icons,
  rows,
}: {
  x?: number
  y?: number
  payload?: { value: string }
  icons?: Record<string, ReactNode>
  rows: StackedBarRow[]
}) {
  const row = rows.find((r) => r.label === payload?.value)
  const icon = row ? icons?.[row.id] : null

  return (
    <g transform={`translate(${x},${y})`}>
      {icon && (
        <foreignObject x={-168} y={-10} width={18} height={18}>
          <span className="sbc__tick-icon">{icon}</span>
        </foreignObject>
      )}
      <text
        x={-145}
        y={0}
        dy={4}
        textAnchor="start"
        fill="#9db6d9"
        fontSize={12}
        fontWeight={500}
      >
        {payload?.value}
      </text>
    </g>
  )
}

function SegmentTooltip({ active, payload, label, valueFormatter }: SegmentTooltipProps) {
  const item = payload?.[0]
  if (!active || !item?.dataKey || !item.payload || typeof item.value !== 'number') return null

  const groupIndex = AGE_GROUPS.findIndex((group) => group.key === item.dataKey)
  const group = AGE_GROUPS[groupIndex]
  const percent = item.payload.segments[groupIndex] ?? 0

  return (
    <div className="sbc__tooltip">
      <div className="sbc__tooltip-topline">
        <span
          className="sbc__tooltip-swatch"
          style={{ background: group?.color ?? '#22d3ee' }}
          aria-hidden="true"
        />
        <span>{group?.label ?? 'Grupo de edad'}</span>
      </div>
      <strong>{valueFormatter(item.value)}</strong>
      <small>
        {label}
        {percent ? ` · ${percent.toLocaleString('es-ES', { maximumFractionDigits: 1 })}%` : ''}
      </small>
    </div>
  )
}

export function StackedBarChart({
  categories,
  icons,
  valueFormatter = formatEuro,
  totalUnitLabel = '€ por persona',
  xMax,
  className,
}: StackedBarChartProps) {
  const rows = toStackedBarRows(categories)
  const SegmentLabel = makeSegmentLabel(rows)
  const rootClass = ['sbc', className].filter(Boolean).join(' ')
  const maxTotal = Math.max(...rows.map((row) => row.total), 0)
  const axisMax = xMax ?? Math.ceil(maxTotal / 10_000) * 10_000
  const ticks = buildTicks(axisMax)

  return (
    <div className={rootClass}>
      <ul className="sbc__legend" aria-label="Grupos de edad">
        {AGE_GROUPS.map((g) => (
          <li key={g.id} className="sbc__legend-item">
            <span className="sbc__swatch" style={{ background: g.color }} aria-hidden="true" />
            <span>{g.label}</span>
          </li>
        ))}
        <li className="sbc__legend-total" aria-hidden="true">
          <small>{totalUnitLabel}</small>
          <span>Total por categoría</span>
          <small>(€ por persona)</small>
        </li>
      </ul>

      <div className="sbc__chart-wrap">
        <ResponsiveContainer width="100%" height={rows.length * 46 + 28}>
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
            barCategoryGap={12}
          >
            <CartesianGrid
              horizontal={false}
              stroke="rgba(77, 102, 136, 0.22)"
              strokeDasharray="2 4"
            />
            <XAxis
              type="number"
              domain={[0, ticks[ticks.length - 1] ?? axisMax]}
              ticks={ticks}
              tickFormatter={valueFormatter}
              tick={{ fill: '#6f829f', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(77, 102, 136, 0.45)' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={170}
              tick={(props) => (
                <CategoryTick {...props} icons={icons} rows={rows} />
              )}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<SegmentTooltip valueFormatter={valueFormatter} />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
              allowEscapeViewBox={{ x: true, y: true }}
              offset={12}
            />
            {AGE_GROUPS.map((group) => (
              <Bar
                key={group.key}
                dataKey={group.key}
                stackId="age"
                fill={group.color}
                radius={0}
                isAnimationActive={false}
              >
                <LabelList content={<SegmentLabel />} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>

        <ul className="sbc__totals" aria-label="Totales por categoría">
          {rows.map((row) => (
            <li key={row.id} className="sbc__total-row">
              {row.totalFormatted}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default StackedBarChart
