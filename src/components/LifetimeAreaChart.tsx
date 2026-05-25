/**
 * LifetimeAreaChart
 *
 * Cumulative lifetime health spending curve rendered with Recharts.
 * Shows a glowing area fill, age axis (0–100) and euro axis (0–120k),
 * plus a floating annotation for the expected lifetime total.
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import {
  LIFETIME_POINTS,
  LIFETIME_TOTAL,
  LIFETIME_TOTAL_FORMATTED,
  type LifetimePoint,
} from '../data/healthExpenditureData'
import './LifetimeAreaChart.css'

export type LifetimeAreaChartProps = {
  points?: LifetimePoint[]
  total?: number
  totalFormatted?: string
  markerAge?: number
  className?: string
}

function formatEuro(value: number): string {
  return `${value.toLocaleString('es-ES')} €`
}

function buildTicks(max: number): number[] {
  const step = Math.max(20_000, Math.ceil(max / 5 / 10_000) * 10_000)
  return [0, step, step * 2, step * 3, step * 4, step * 5]
}

export function LifetimeAreaChart({
  points = LIFETIME_POINTS,
  total = LIFETIME_TOTAL,
  totalFormatted = LIFETIME_TOTAL_FORMATTED,
  markerAge = 87,
  className,
}: LifetimeAreaChartProps) {
  const rootClass = ['lac', className].filter(Boolean).join(' ')
  const markerPoint = points.find((p) => p.age >= markerAge) ?? points[points.length - 1]
  const yMax = Math.ceil(total / 10_000) * 10_000
  const ticks = buildTicks(yMax)

  return (
    <div className={rootClass}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={points}
          margin={{ top: 36, right: 12, left: 4, bottom: 8 }}
        >
          <defs>
            <linearGradient id="lacFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <filter id="lacGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            stroke="rgba(77, 102, 136, 0.18)"
            strokeDasharray="2 4"
            vertical={false}
          />

          <XAxis
            dataKey="age"
            ticks={[0, 20, 40, 60, 80, 100]}
            tick={{ fill: '#6f829f', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(77, 102, 136, 0.45)' }}
            tickLine={false}
            label={{
              value: 'Edad',
              position: 'insideBottomRight',
              offset: -4,
              fill: '#9db6d9',
              fontSize: 11,
              fontWeight: 600,
            }}
          />

          <YAxis
            domain={[0, ticks[ticks.length - 1] ?? yMax]}
            ticks={ticks}
            tickFormatter={formatEuro}
            tick={{ fill: '#6f829f', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={58}
          />

          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#22d3ee"
            strokeWidth={2.2}
            fill="url(#lacFill)"
            dot={false}
            activeDot={{ r: 4, fill: '#22d3ee', stroke: '#0e1b2e', strokeWidth: 2 }}
            isAnimationActive={false}
            style={{ filter: 'url(#lacGlow)' }}
          />

          {markerPoint && (
            <ReferenceDot
              x={markerPoint.age}
              y={markerPoint.cumulative}
              r={5}
              fill="#0e1b2e"
              stroke="#22d3ee"
              strokeWidth={2}
              ifOverflow="visible"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {markerPoint && (
        <div
          className="lac__callout"
          style={{
            left: `${Math.min(88, Math.max(8, (markerPoint.age / 100) * 100))}%`,
          }}
        >
          <span className="lac__callout-label">Total esperado</span>
          <strong className="lac__callout-value">{totalFormatted}</strong>
        </div>
      )}
    </div>
  )
}

export default LifetimeAreaChart
