/**
 * TimeSeriesChart
 *
 * Reusable multi-series temporal line chart for institutional dashboards.
 * Supports dual vertical axes, smooth Catmull-Rom curves, projection zones,
 * milestone markers, interactive hover tooltips, and light/dark variants.
 *
 * The component is purely presentational: pass any Dataset-shaped object
 * and it scales, labels and renders automatically. Zero external dependencies.
 */

import React, { useState, useMemo } from 'react'
import './TimeSeriesChart.css'
import { InfoButton } from './InfoButton'

// ─── Public types ─────────────────────────────────────────────────────────────

export type AxisSide  = 'left' | 'right'
export type SeriesKind = 'historical' | 'projection' | 'mixed'
export type ChartVariant = 'light' | 'dark'

export interface ChartSeries {
  name: string
  values: number[]
  unit: string
  axis: AxisSide
  kind: SeriesKind
  /**
   * For kind='mixed': 0-based index of the first projection point.
   * Both historical and projection segments include this index so the
   * rendered curve is continuous at the cutoff.
   */
  projectionFrom?: number
}

export interface ChartMilestone {
  /** 0-based index into `categories` where the vertical marker is drawn. */
  index: number
  label: string
}

export interface TimeSeriesChartProps {
  title?: string
  subtitle?: string
  /** Optional accessible description for a contextual info icon beside the title. */
  infoLabel?: string
  categories: string[]
  series: ChartSeries[]
  milestones?: ChartMilestone[]
  footnote?: string
  variant?: ChartVariant
  className?: string
  style?: React.CSSProperties
}

// ─── Series color palettes ────────────────────────────────────────────────────

const DARK_SERIES_COLORS: readonly string[] = [
  '#36d9e0', // teal
  '#e86060', // coral red
  '#d4a017', // amber
  '#b370ea', // purple
  '#5b95f2', // blue
  '#6ce3bd', // mint
  '#8888a8', // muted steel
]

const LIGHT_SERIES_COLORS: readonly string[] = [
  '#0b6f82', // teal accent
  '#c05035', // terracotta
  '#4a7bc8', // slate blue
  '#1a7a50', // forest green
  '#7b5eab', // purple
  '#b5783c', // amber
  '#6b8a9a', // steel
]

// ─── SVG geometry (viewBox units) ─────────────────────────────────────────────

const VW = 1200
const VH = 540
const ML = 80    // left margin
const MR = 80    // right margin
const MT = 44    // top margin (axis unit label row)
const MB = 56    // bottom margin (x-axis labels)
const PW = VW - ML - MR   // 1040 — plot width
const PH = VH - MT - MB   // 440  — plot height

const FONT = 'Avenir Next, Segoe UI, system-ui, sans-serif'

// ─── Internal types ───────────────────────────────────────────────────────────

type Point = readonly [number, number]

// ─── Math utilities ───────────────────────────────────────────────────────────

function niceTicks(domMin: number, domMax: number, count = 5): number[] {
  const range = domMax - domMin
  if (range === 0) return [domMin]
  const rough = range / count
  const mag   = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm  = rough / mag
  const step  = mag * ([1, 2, 2.5, 5, 10].find((s) => s >= norm) ?? 10)
  const start = Math.floor(domMin / step) * step
  const out: number[] = []
  for (let v = start; v <= domMax + step * 0.01; v += step) {
    const r = Math.round(v * 10000) / 10000
    if (r >= domMin - step * 0.1) out.push(r)
  }
  return out
}

function paddedDomain(vals: number[], pad = 0.12): [number, number] {
  const lo = Math.min(...vals)
  const hi = Math.max(...vals)
  const p  = (hi - lo) * pad
  return [lo - p, hi + p]
}

function makeLinearScale(
  dMin: number, dMax: number, rMin: number, rMax: number,
): (v: number) => number {
  const span = dMax - dMin
  return span === 0
    ? () => (rMin + rMax) / 2
    : (v) => rMin + ((v - dMin) / span) * (rMax - rMin)
}

/**
 * Catmull-Rom → cubic Bezier SVG path.
 * Curves pass exactly through every data point; no value distortion.
 */
function catmullRom(pts: readonly Point[]): string {
  if (pts.length < 2) return ''
  if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = (p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)
    const cp1y = (p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)
    const cp2x = (p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)
    const cp2y = (p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
  }
  return d
}

function fmtTick(v: number): string {
  if (Math.abs(v) >= 1000) return v.toFixed(0)
  if (Number.isInteger(v) || Math.abs(v - Math.round(v)) < 0.005) return v.toFixed(0)
  return v.toFixed(1)
}

// ─── Hover tooltip ─────────────────────────────────────────────────────────────
// Separate component so TypeScript narrows `idx` to number.

interface HoverTooltipProps {
  idx: number
  categories: string[]
  series: ChartSeries[]
  seriesColors: readonly string[]
  xOf: (i: number) => number
  yOf: (s: ChartSeries, v: number) => number
}

function HoverTooltip({
  idx, categories, series, seriesColors, xOf, yOf,
}: HoverTooltipProps) {
  const hx  = xOf(idx)
  const cat = categories[idx]

  const rows = series
    .map((s, si) => ({
      name: s.name,
      value: s.values[idx] as number | undefined,
      unit: s.unit,
      color: seriesColors[si % seriesColors.length],
      isProjection: s.kind === 'mixed' && idx > (s.projectionFrom ?? Infinity),
    }))
    .filter((r): r is typeof r & { value: number } => r.value !== undefined)

  const heading = rows.some((r) => r.isProjection) ? `${cat} · proyección` : cat

  const TW   = 256
  const ROW_H = 24
  const TH   = 20 + rows.length * ROW_H + 8
  const TX   = hx + 20 > VW - MR - TW ? hx - TW - 20 : hx + 20
  const TY   = MT + 20

  return (
    <g>
      {/* Crosshair */}
      <line
        x1={hx} y1={MT} x2={hx} y2={MT + PH}
        stroke="var(--tsc-label)" strokeWidth={1} opacity={0.2}
      />

      {/* Dots at each series y-value */}
      {series.map((s, si) => {
        const v = s.values[idx]
        if (v == null) return null
        return (
          <circle
            key={si}
            cx={hx} cy={yOf(s, v)} r={4.5}
            fill="var(--tsc-surface)"
            stroke={seriesColors[si % seriesColors.length]}
            strokeWidth={2}
          />
        )
      })}

      {/* Tooltip card */}
      <rect
        x={TX} y={TY} width={TW} height={TH}
        rx={4}
        fill="var(--tsc-surface)"
        stroke="var(--tsc-border)"
        strokeWidth={1}
      />
      <text
        x={TX + 12} y={TY + 15}
        style={{ fontSize: 11, fontFamily: FONT, fontWeight: 600, fill: 'var(--tsc-title)' }}
      >
        {heading}
      </text>
      {rows.map((row, ri) => (
        <g key={ri}>
          <rect x={TX + 8} y={TY + 17 + ri * ROW_H} width={8} height={8} rx={1} fill={row.color} />
          <text
            x={TX + 22} y={TY + 25 + ri * ROW_H}
            style={{ fontSize: 11, fontFamily: FONT, fill: 'var(--tsc-label)' }}
          >
            {row.name}
          </text>
          <text
            x={TX + TW - 12} y={TY + 25 + ri * ROW_H}
            textAnchor="end"
            style={{ fontSize: 11, fontFamily: FONT, fontWeight: 600, fill: 'var(--tsc-title)' }}
          >
            {row.value.toFixed(2)} {row.unit}
          </text>
        </g>
      ))}
    </g>
  )
}

// ─── Info icon ─────────────────────────────────────────────────────────────────

function InfoIcon({ label }: { label: string }) {
  return (
    <span
      className="tsc__info-icon"
      aria-label={label}
      title={label}
      role="img"
    >
      <InfoButton label={label} />
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TimeSeriesChart({
  title,
  subtitle,
  infoLabel,
  categories,
  series,
  milestones = [],
  footnote,
  variant = 'dark',
  className,
  style,
}: TimeSeriesChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const N = categories.length

  const seriesColors = variant === 'dark' ? DARK_SERIES_COLORS : LIGHT_SERIES_COLORS

  // ── Derived geometry and scales ────────────────────────────────────────────
  const geo = useMemo(() => {
    const xOf = (i: number) => ML + (N > 1 ? (i / (N - 1)) * PW : PW / 2)

    const leftSeries  = series.filter((s) => s.axis === 'left')
    const rightSeries = series.filter((s) => s.axis === 'right')

    const [lMin, lMax] = leftSeries.length
      ? paddedDomain(leftSeries.flatMap((s) => s.values))
      : [0, 1]
    const [rMin, rMax] = rightSeries.length
      ? paddedDomain(rightSeries.flatMap((s) => s.values))
      : [0, 1]

    const yBottom = MT + PH
    const yTop    = MT

    const leftScale  = makeLinearScale(lMin, lMax, yBottom, yTop)
    const rightScale = rightSeries.length
      ? makeLinearScale(rMin, rMax, yBottom, yTop)
      : makeLinearScale(lMin, lMax, yBottom, yTop)

    const yOf = (s: ChartSeries, v: number) =>
      s.axis === 'left' ? leftScale(v) : rightScale(v)

    const leftTicks  = niceTicks(lMin, lMax, 6)
    const rightTicks = rightSeries.length ? niceTicks(rMin, rMax, 6) : []

    const xStep = Math.max(1, Math.ceil(N / 14))

    const projStart = series.reduce<number | null>((acc, s) => {
      if (s.kind === 'mixed' && s.projectionFrom != null) {
        return acc === null ? s.projectionFrom : Math.min(acc, s.projectionFrom)
      }
      return acc
    }, null)

    const paths = series.map((s) => {
      const splitAt =
        s.kind === 'mixed'        ? (s.projectionFrom ?? N)
        : s.kind === 'projection' ? 0
        : N

      const histPts: Point[] = s.values
        .slice(0, splitAt + 1)
        .map((v, i) => [xOf(i), yOf(s, v)] as const)

      const projPts: Point[] = s.values
        .slice(splitAt)
        .map((v, i) => [xOf(splitAt + i), yOf(s, v)] as const)

      return { histPts, projPts }
    })

    return {
      xOf, yOf, leftScale, rightScale,
      leftTicks, rightTicks,
      leftSeries, rightSeries,
      xStep, projStart, paths,
    }
  }, [series, N])

  const {
    xOf, yOf, leftScale, rightScale,
    leftTicks, rightTicks,
    leftSeries, rightSeries,
    xStep, projStart, paths,
  } = geo

  // ── Hover tracking ─────────────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect  = e.currentTarget.getBoundingClientRect()
    const svgX  = ((e.clientX - rect.left) / rect.width) * VW
    const plotX = svgX - ML
    if (plotX < 0 || plotX > PW) { setHoverIdx(null); return }
    setHoverIdx(Math.max(0, Math.min(N - 1, Math.round((plotX / PW) * (N - 1)))))
  }

  const hasRightAxis  = rightSeries.length > 0
  const hasProjection = series.some((s) => s.kind !== 'historical')

  const rootClass = [
    'tsc',
    `tsc--${variant}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <figure className={rootClass} style={style}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="tsc__header">
        {/* Row 1: title + info icon | projection badge */}
        <div className="tsc__title-row">
          <div className="tsc__title-group">
            {title && <h3 className="tsc__title">{title}</h3>}
            {infoLabel && <InfoIcon label={infoLabel} />}
          </div>
        </div>

        {/* Row 2: legend */}
        <nav className="tsc__legend" aria-label="Series del gráfico">
          {series.map((s, si) => (
            <div key={si} className="tsc__legend-item">
              <svg
                className="tsc__legend-swatch"
                width={12} height={12}
                aria-hidden="true"
              >
                <rect
                  width={12} height={12} rx={2}
                  fill={seriesColors[si % seriesColors.length]}
                />
              </svg>
              <span className="tsc__legend-name">{s.name}</span>
            </div>
          ))}

          {hasProjection && (
            <>
              <span className="tsc__legend-sep" aria-hidden="true" />
              <div className="tsc__legend-item">
                <svg className="tsc__legend-swatch" width={24} height={12} aria-hidden="true">
                  <line
                    x1={0} y1={6} x2={24} y2={6}
                    stroke="var(--tsc-label)"
                    strokeWidth={1.8} strokeDasharray="5,3" strokeLinecap="round"
                  />
                </svg>
                <span className="tsc__legend-name">Proyección</span>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* ── SVG chart ─────────────────────────────────────────────────────── */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="tsc__chart"
        role="img"
        aria-label={title ?? 'Gráfico temporal de series'}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Axis unit labels — horizontal, above the plot area */}
        {leftSeries[0] && (
          <text
            x={ML} y={MT - 10}
            textAnchor="start"
            style={{ fontSize: 11, fontFamily: FONT, fill: 'var(--tsc-label)' }}
          >
            {leftSeries[0].unit}
          </text>
        )}
        {rightSeries[0] && (
          <text
            x={ML + PW} y={MT - 10}
            textAnchor="end"
            style={{ fontSize: 11, fontFamily: FONT, fill: 'var(--tsc-label)' }}
          >
            {rightSeries[0].unit}
          </text>
        )}

        {/* Horizontal grid lines */}
        {leftTicks.map((t) => {
          const y = leftScale(t)
          if (y < MT - 1 || y > MT + PH + 1) return null
          return (
            <line
              key={`hg${t}`}
              x1={ML} y1={y} x2={ML + PW} y2={y}
              stroke="var(--tsc-border)" strokeWidth={0.5}
            />
          )
        })}

        {/* ── Left y-axis ─────────────────────────────────────────────────── */}
        <line
          x1={ML} y1={MT} x2={ML} y2={MT + PH}
          stroke="var(--tsc-border)" strokeWidth={1}
        />
        {leftTicks.map((t) => {
          const y = leftScale(t)
          if (y < MT - 6 || y > MT + PH + 6) return null
          return (
            <g key={`lt${t}`}>
              <line
                x1={ML - 4} y1={y} x2={ML} y2={y}
                stroke="var(--tsc-border)" strokeWidth={0.8}
              />
              <text
                x={ML - 9} y={y + 4.5}
                textAnchor="end"
                style={{ fontSize: 11, fontFamily: FONT, fill: 'var(--tsc-label)' }}
              >
                {fmtTick(t)}
              </text>
            </g>
          )
        })}

        {/* ── Right y-axis ─────────────────────────────────────────────────── */}
        {hasRightAxis && (
          <>
            <line
              x1={ML + PW} y1={MT} x2={ML + PW} y2={MT + PH}
              stroke="var(--tsc-border)" strokeWidth={1}
            />
            {rightTicks.map((t) => {
              const y = rightScale(t)
              if (y < MT - 6 || y > MT + PH + 6) return null
              return (
                <g key={`rt${t}`}>
                  <line
                    x1={ML + PW} y1={y} x2={ML + PW + 4} y2={y}
                    stroke="var(--tsc-border)" strokeWidth={0.8}
                  />
                  <text
                    x={ML + PW + 9} y={y + 4.5}
                    textAnchor="start"
                    style={{ fontSize: 11, fontFamily: FONT, fill: 'var(--tsc-label)' }}
                  >
                    {fmtTick(t)}
                  </text>
                </g>
              )
            })}
          </>
        )}

        {/* ── X axis ───────────────────────────────────────────────────────── */}
        <line
          x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH}
          stroke="var(--tsc-border)" strokeWidth={1}
        />
        {categories.map((cat, i) => {
          if (i % xStep !== 0 && i !== N - 1) return null
          const x = xOf(i)
          return (
            <g key={`xl${i}`}>
              <line
                x1={x} y1={MT + PH} x2={x} y2={MT + PH + 4}
                stroke="var(--tsc-border)" strokeWidth={0.8}
              />
              <text
                x={x} y={MT + PH + 18}
                textAnchor="middle"
                style={{ fontSize: 11, fontFamily: FONT, fill: 'var(--tsc-label)' }}
              >
                {cat}
              </text>
            </g>
          )
        })}

        {/* ── Milestone markers ────────────────────────────────────────────── */}
        {milestones.map((m, mi) => {
          const x = xOf(m.index)
          const isCutoff = series.some((s) => s.projectionFrom === m.index)
          return (
            <line
              key={`ms${mi}`}
              x1={x} y1={MT} x2={x} y2={MT + PH}
              stroke="var(--tsc-label)"
              strokeWidth={isCutoff ? 1.5 : 0.8}
              strokeDasharray={isCutoff ? '7,4' : '3,4'}
              opacity={isCutoff ? 0.55 : 0.3}
            />
          )
        })}

        {/* ── Series curves ─────────────────────────────────────────────────── */}
        {paths.map(({ histPts, projPts }, si) => {
          const color = seriesColors[si % seriesColors.length]
          return (
            <g key={`s${si}`}>
              {histPts.length >= 2 && (
                <path
                  d={catmullRom(histPts)}
                  fill="none" stroke={color}
                  strokeWidth={2.2}
                  strokeLinecap="round" strokeLinejoin="round"
                />
              )}
              {projPts.length >= 2 && (
                <path
                  d={catmullRom(projPts)}
                  fill="none" stroke={color}
                  strokeWidth={2.2} strokeDasharray="9,5"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              )}
            </g>
          )
        })}

        {/* ── Hover overlay ─────────────────────────────────────────────────── */}
        {hoverIdx !== null && (
          <HoverTooltip
            idx={hoverIdx}
            categories={categories}
            series={series}
            seriesColors={seriesColors}
            xOf={xOf}
            yOf={yOf}
          />
        )}
      </svg>

      {/* ── Footnote ──────────────────────────────────────────────────────── */}
      {footnote && (
        <figcaption className="tsc__footer">
          <p className="tsc__footnote">{footnote}</p>
        </figcaption>
      )}
    </figure>
  )
}
