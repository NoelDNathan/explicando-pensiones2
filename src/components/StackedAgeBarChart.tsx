/**
 * StackedAgeBarChart
 *
 * Horizontal 100%-stacked bar chart for category × age-group analyses.
 *
 * Layout (left to right):
 *   - Optional icon + category label.
 *   - Stacked bar split into one segment per age group, with inline
 *     percentage labels when each segment is wide enough.
 *   - Category total formatted on the right.
 * A coloured chip legend sits above the rows and a numeric x-axis sits
 * below them.
 *
 * The component is purely presentational: caller provides categories,
 * age groups, optional totals column header and axis tick formatter.
 * Bars are sized to fill their row regardless of the total per category;
 * the x-axis is therefore informational and refers to the totals scale.
 */

import type { ReactNode } from 'react'
import './StackedAgeBarChart.css'

export type AgeGroup = {
  id: string
  label: string
  color: string
}

export type StackedAgeBarCategory = {
  id: string
  label: string
  icon?: ReactNode
  /** One value per age group (matching `ageGroups` order, same length). */
  segments: number[]
  /** Pre-formatted total displayed on the right (e.g. "29.600 €"). */
  total: string
  /** Numeric total used to size the bar relative to the x-axis scale. */
  totalValue: number
}

export type StackedAgeBarChartProps = {
  ageGroups: AgeGroup[]
  categories: StackedAgeBarCategory[]
  /** Numeric ticks to render along the x-axis (informational). */
  xAxisTicks: number[]
  /** Format the x-axis tick value (e.g. `(v) => v.toLocaleString('es-ES')`). */
  formatXAxisTick?: (value: number) => string
  /** Header label for the totals column. Defaults to "Total por categoría". */
  totalHeader?: string
  /** Optional second-line subtitle under the totals header. */
  totalSubheader?: string
  /** Optional override for the percentage formatter inside segments. */
  formatSegmentLabel?: (percent: number) => string
  className?: string
}

const defaultXAxisFormatter = (value: number): string =>
  `${value.toLocaleString('es-ES')} €`

const defaultSegmentFormatter = (percent: number): string =>
  `${Math.round(percent)}%`

function clampNonNegative(value: number): number {
  return value > 0 ? value : 0
}

function getRowMax(categories: StackedAgeBarCategory[]): number {
  let max = 0
  for (const cat of categories) {
    if (cat.totalValue > max) max = cat.totalValue
  }
  return max > 0 ? max : 1
}

export function StackedAgeBarChart({
  ageGroups,
  categories,
  xAxisTicks,
  formatXAxisTick = defaultXAxisFormatter,
  totalHeader = 'Total por categoría',
  totalSubheader,
  formatSegmentLabel = defaultSegmentFormatter,
  className,
}: StackedAgeBarChartProps) {
  const rowMax = getRowMax(categories)
  const lastTick = xAxisTicks[xAxisTicks.length - 1] ?? rowMax
  const axisMax = Math.max(rowMax, lastTick)

  const rootClass = ['sab', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      {/* ── Legend ────────────────────────────────────────────────────── */}
      <div className="sab__legend" aria-label="Grupos de edad">
        <span aria-hidden="true" />
        <ul className="sab__legend-chips">
          {ageGroups.map((g) => (
            <li key={g.id} className="sab__legend-item">
              <span
                className="sab__legend-swatch"
                style={{ background: g.color }}
                aria-hidden="true"
              />
              <span className="sab__legend-label">{g.label}</span>
            </li>
          ))}
        </ul>
        <span className="sab__legend-total" aria-hidden="true">
          {totalHeader}
          {totalSubheader && <small>{totalSubheader}</small>}
        </span>
      </div>

      {/* ── Rows ──────────────────────────────────────────────────────── */}
      <ol className="sab__rows" aria-label="Categorías">
        {categories.map((cat) => {
          const segmentSum = cat.segments.reduce(
            (acc, v) => acc + clampNonNegative(v),
            0,
          )
          const safeSum = segmentSum > 0 ? segmentSum : 1
          const barWidthPct = Math.max(0, Math.min(100, (cat.totalValue / axisMax) * 100))

          return (
            <li key={cat.id} className="sab__row">
              <div className="sab__category">
                {cat.icon && (
                  <span className="sab__category-icon" aria-hidden="true">
                    {cat.icon}
                  </span>
                )}
                <span className="sab__category-label">{cat.label}</span>
              </div>

              <div className="sab__bar-track">
                <div
                  className="sab__bar"
                  style={{ width: `${barWidthPct}%` }}
                  role="img"
                  aria-label={`${cat.label}: ${cat.total} total`}
                >
                  {cat.segments.map((value, i) => {
                    const safeValue = clampNonNegative(value)
                    const pct = (safeValue / safeSum) * 100
                    const group = ageGroups[i]
                    if (!group || pct <= 0) return null

                    return (
                      <span
                        key={group.id}
                        className="sab__segment"
                        style={{
                          flexGrow: pct,
                          background: group.color,
                        }}
                        title={`${group.label}: ${formatSegmentLabel(pct)}`}
                      >
                        <span className="sab__segment-label">
                          {formatSegmentLabel(pct)}
                        </span>
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="sab__total">{cat.total}</div>
            </li>
          )
        })}
      </ol>

      {/* ── X axis ────────────────────────────────────────────────────── */}
      <div className="sab__axis" aria-hidden="true">
        <span />
        <div className="sab__axis-track">
          {xAxisTicks.map((tick, i) => {
            const left = (tick / axisMax) * 100
            const isFirst = i === 0
            const isLast = i === xAxisTicks.length - 1
            const tickClass = [
              'sab__axis-tick',
              isFirst ? 'sab__axis-tick--first' : '',
              isLast ? 'sab__axis-tick--last' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <span
                key={i}
                className={tickClass}
                style={{ left: `${left}%` }}
              >
                {formatXAxisTick(tick)}
              </span>
            )
          })}
        </div>
        <span />
      </div>
    </div>
  )
}

export default StackedAgeBarChart
