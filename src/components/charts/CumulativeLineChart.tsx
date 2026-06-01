/**
 * CumulativeLineChart
 *
 * Single-series cumulative line chart with axes, ticks, optional gradient
 * fill under the curve and an optional marker callout (e.g. expected
 * lifetime total). Renders entirely as inline SVG with sensible defaults
 * so it can be used as a small chart inside a `DashboardPanel`.
 *
 * The curve is drawn via a smoothed Catmull-Rom-to-Bézier conversion so
 * the result stays readable for ~10-100 points without external libs.
 */

import { useId } from 'react'
import './CumulativeLineChart.css'

export type CumulativePoint = { x: number; y: number }

export type CumulativeLineChartMarker = {
  /** X position (axis units) where the marker dot sits. */
  x: number
  /** Y position (axis units) where the marker dot sits. */
  y: number
  /** Caption above the value (e.g. "Total esperado"). */
  caption?: string
  /** Bold value (e.g. "92.600 €"). Falls back to `label`. */
  value?: string
  /** Legacy single-line label used when caption/value are absent. */
  label?: string
}

export type CumulativeLineChartProps = {
  points: CumulativePoint[]
  xLabel?: string
  yLabel?: string
  xTicks?: number[]
  yTicks?: number[]
  /** Optional override for x-domain. Defaults to extents of `points`. */
  xDomain?: [number, number]
  /** Optional override for y-domain. Defaults to `[0, max(points.y)]`. */
  yDomain?: [number, number]
  formatXTick?: (value: number) => string
  formatYTick?: (value: number) => string
  marker?: CumulativeLineChartMarker
  /** Line stroke colour. Defaults to the working-age boundary teal. */
  strokeColor?: string
  /** Show a soft area fill under the curve. */
  showArea?: boolean
  className?: string
  height?: number
  ariaLabel?: string
}

const DEFAULT_STROKE = 'var(--color-working-age-boundary)'

const defaultXFormatter = (value: number): string =>
  value.toLocaleString('es-ES')

const defaultYFormatter = (value: number): string =>
  `${value.toLocaleString('es-ES')} €`

function extent(values: number[]): [number, number] {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const v of values) {
    if (v < min) min = v
    if (v > max) max = v
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1]
  if (min === max) return [min - 1, max + 1]
  return [min, max]
}

function buildSmoothPath(
  points: { x: number; y: number }[],
): string {
  if (points.length === 0) return ''
  if (points.length === 1) {
    const p = points[0]!
    return `M ${p.x} ${p.y}`
  }

  const segments: string[] = [`M ${points[0]!.x} ${points[0]!.y}`]

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p3 = points[i + 2] ?? p2

    const tension = 0.5
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension

    segments.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`)
  }

  return segments.join(' ')
}

export function CumulativeLineChart({
  points,
  xLabel,
  yLabel,
  xTicks,
  yTicks,
  xDomain,
  yDomain,
  formatXTick = defaultXFormatter,
  formatYTick = defaultYFormatter,
  marker,
  strokeColor = DEFAULT_STROKE,
  showArea = false,
  className,
  height = 220,
  ariaLabel,
}: CumulativeLineChartProps) {
  const gradientId = useId()

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)

  const [xMinAuto, xMaxAuto] = extent(xs)
  const [, yMaxAuto] = extent(ys)

  const xMin = xDomain?.[0] ?? xMinAuto
  const xMax = xDomain?.[1] ?? xMaxAuto
  const yMin = yDomain?.[0] ?? 0
  const yMax = yDomain?.[1] ?? yMaxAuto

  const safeXSpan = xMax - xMin || 1
  const safeYSpan = yMax - yMin || 1

  // SVG canvas + plot area
  const width = 480
  const margin = { top: 18, right: 28, bottom: 32, left: 56 }
  const plotW = width - margin.left - margin.right
  const plotH = height - margin.top - margin.bottom

  const toPx = (point: { x: number; y: number }) => ({
    x: margin.left + ((point.x - xMin) / safeXSpan) * plotW,
    y: margin.top + plotH - ((point.y - yMin) / safeYSpan) * plotH,
  })

  const pixelPoints = points.map(toPx)
  const linePath = buildSmoothPath(pixelPoints)
  const areaPath =
    pixelPoints.length > 0
      ? `${linePath} L ${pixelPoints[pixelPoints.length - 1]!.x} ${margin.top + plotH} L ${pixelPoints[0]!.x} ${margin.top + plotH} Z`
      : ''

  const markerPx = marker
    ? toPx({ x: marker.x, y: marker.y })
    : undefined

  const computedXTicks = xTicks ?? [xMin, xMax]
  const computedYTicks = yTicks ?? [yMin, yMax]

  const rootClass = ['clc', className].filter(Boolean).join(' ')

  return (
    <svg
      className={rootClass}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel ?? 'Gráfico de línea acumulada'}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.32} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Y grid + ticks */}
      {computedYTicks.map((t, i) => {
        const y = margin.top + plotH - ((t - yMin) / safeYSpan) * plotH
        return (
          <g key={`y-${i}`} className="clc__y-tick-group">
            <line
              x1={margin.left}
              x2={margin.left + plotW}
              y1={y}
              y2={y}
              className="clc__grid"
            />
            <text
              x={margin.left - 8}
              y={y}
              dy="0.32em"
              textAnchor="end"
              className="clc__tick-label"
            >
              {formatYTick(t)}
            </text>
          </g>
        )
      })}

      {/* X axis baseline */}
      <line
        x1={margin.left}
        y1={margin.top + plotH}
        x2={margin.left + plotW}
        y2={margin.top + plotH}
        className="clc__axis"
      />

      {/* X ticks */}
      {computedXTicks.map((t, i) => {
        const x = margin.left + ((t - xMin) / safeXSpan) * plotW
        return (
          <text
            key={`x-${i}`}
            x={x}
            y={margin.top + plotH + 18}
            textAnchor="middle"
            className="clc__tick-label"
          >
            {formatXTick(t)}
          </text>
        )
      })}

      {/* Area + line */}
      {showArea && areaPath && (
        <path d={areaPath} fill={`url(#${gradientId})`} />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Marker callout */}
      {marker && markerPx && (
        <g className="clc__marker">
          <line
            x1={markerPx.x}
            y1={markerPx.y}
            x2={markerPx.x}
            y2={margin.top + plotH}
            className="clc__marker-line"
          />
          <circle
            cx={markerPx.x}
            cy={markerPx.y}
            r={5.5}
            className="clc__marker-dot"
            stroke={strokeColor}
            fill="var(--color-surface-deep)"
            strokeWidth={2.4}
          />
          {(() => {
            const calloutW = 130
            const calloutH = marker.caption || marker.label ? 44 : 30
            const calloutX = Math.min(
              margin.left + plotW - calloutW,
              Math.max(margin.left, markerPx.x - calloutW / 2),
            )
            const calloutY = Math.max(margin.top + 4, markerPx.y - calloutH - 12)
            const captionText = marker.caption ?? marker.label
            const valueText = marker.value ?? (marker.caption ? '' : marker.label ?? '')
            return (
              <g transform={`translate(${calloutX}, ${calloutY})`}>
                <rect
                  width={calloutW}
                  height={calloutH}
                  rx={6}
                  ry={6}
                  className="clc__marker-callout"
                />
                {captionText && (
                  <text
                    x={calloutW / 2}
                    y={15}
                    textAnchor="middle"
                    className="clc__marker-caption"
                  >
                    {captionText}
                  </text>
                )}
                {valueText && (
                  <text
                    x={calloutW / 2}
                    y={captionText ? 33 : 19}
                    textAnchor="middle"
                    className="clc__marker-value"
                  >
                    {valueText}
                  </text>
                )}
              </g>
            )
          })()}
        </g>
      )}

      {/* Axis labels */}
      {xLabel && (
        <text
          x={margin.left + plotW}
          y={height - 4}
          textAnchor="end"
          className="clc__axis-label"
        >
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text
          x={margin.left}
          y={margin.top - 6}
          textAnchor="start"
          className="clc__axis-label"
        >
          {yLabel}
        </text>
      )}
    </svg>
  )
}

export default CumulativeLineChart
