/**
 * PopulationPyramid
 *
 * SVG-based, responsive population pyramid for Spain. Bars are split by sex
 * (male on the left, female on the right) and segmented by nationality
 * (native first, foreign-born second). Working-age groups are highlighted
 * with a semi-transparent band and a slightly more saturated color variant,
 * while non-working-age groups use a slightly muted variant of the same
 * base hue.
 *
 * The component is purely presentational: data, working-age range,
 * scale max and age label density are received as props with sensible
 * defaults. Age ranges are drawn on the central axis (one label per row
 * by default). It is intended to live inside any container; the SVG
 * keeps its aspect ratio thanks to the explicit viewBox.
 */

type Nationality = 'native' | 'foreign'

type Sex = 'male' | 'female'

type SexBreakdown = Record<Nationality, number>

export type PyramidAgeGroup = {
  ageGroup: string
  ageStart: number
  ageEnd: number | null
  male: SexBreakdown
  female: SexBreakdown
}

export type AgeLabelMode = 'all' | 'decade' | false

export type PopulationPyramidProps = {
  data?: PyramidAgeGroup[]
  workingAgeMin?: number
  workingAgeMax?: number
  scaleMax?: number
  /** Show age range labels on the central axis. Default: every row. */
  ageLabels?: AgeLabelMode
  legendVariant?: 'birthplace' | 'sex'
  className?: string
  title?: string
  subtitle?: string
}

const VIEWBOX = { width: 620, height: 493 }

const LAYOUT = {
  padding: { top: 16, right: 18, bottom: 14, left: 18 },
  titleY: 32,
  subtitleY: 50,
  sectionLabelY: 80,
  centerX: 240,
  axisGap: 30,
  barsTopY: 92,
  barHeight: 12,
  barRowGap: 3,
  bottomAxisY: 380,
  tickLabelY: 394,
  axisCaptionY: 410,
  rightLabelsX: 505,
  legendY: 448,
} as const

const COLORS = {
  backgroundFrom: 'var(--color-surface-deep)',
  backgroundTo: 'var(--color-surface-deep-2)',
  textTitle: 'var(--color-text-inverted)',
  textMuted: 'var(--color-text-inverted-muted)',
  textFaint: 'var(--color-text-inverted-faint)',
  axis: 'var(--color-axis-on-dark)',
  workingAgeBand: 'var(--color-working-age-band)',
  workingAgeBoundary: 'var(--color-working-age-boundary)',
  bars: {
    male: {
      native: {
        active: 'var(--color-pyramid-male-native-active)',
        rest: 'var(--color-pyramid-male-native-rest)',
      },
      foreign: {
        active: 'var(--color-pyramid-male-foreign-active)',
        rest: 'var(--color-pyramid-male-foreign-rest)',
      },
    },
    female: {
      native: {
        active: 'var(--color-pyramid-female-native-active)',
        rest: 'var(--color-pyramid-female-native-rest)',
      },
      foreign: {
        active: 'var(--color-pyramid-female-foreign-active)',
        rest: 'var(--color-pyramid-female-foreign-rest)',
      },
    },
  },
} as const

const DEFAULT_DATA: PyramidAgeGroup[] = [
  { ageGroup: '90+',   ageStart: 90, ageEnd: null, male: { native: 25,  foreign: 1 },   female: { native: 55,  foreign: 1 } },
  { ageGroup: '85-89', ageStart: 85, ageEnd: 89,   male: { native: 60,  foreign: 3 },   female: { native: 105, foreign: 3 } },
  { ageGroup: '80-84', ageStart: 80, ageEnd: 84,   male: { native: 110, foreign: 5 },   female: { native: 155, foreign: 5 } },
  { ageGroup: '75-79', ageStart: 75, ageEnd: 79,   male: { native: 155, foreign: 8 },   female: { native: 195, foreign: 8 } },
  { ageGroup: '70-74', ageStart: 70, ageEnd: 74,   male: { native: 215, foreign: 12 },  female: { native: 250, foreign: 12 } },
  { ageGroup: '65-69', ageStart: 65, ageEnd: 69,   male: { native: 240, foreign: 18 },  female: { native: 270, foreign: 18 } },
  { ageGroup: '60-64', ageStart: 60, ageEnd: 64,   male: { native: 290, foreign: 30 },  female: { native: 310, foreign: 30 } },
  { ageGroup: '55-59', ageStart: 55, ageEnd: 59,   male: { native: 320, foreign: 40 },  female: { native: 330, foreign: 40 } },
  { ageGroup: '50-54', ageStart: 50, ageEnd: 54,   male: { native: 345, foreign: 60 },  female: { native: 350, foreign: 60 } },
  { ageGroup: '45-49', ageStart: 45, ageEnd: 49,   male: { native: 365, foreign: 80 },  female: { native: 360, foreign: 80 } },
  { ageGroup: '40-44', ageStart: 40, ageEnd: 44,   male: { native: 360, foreign: 110 }, female: { native: 350, foreign: 105 } },
  { ageGroup: '35-39', ageStart: 35, ageEnd: 39,   male: { native: 335, foreign: 140 }, female: { native: 325, foreign: 130 } },
  { ageGroup: '30-34', ageStart: 30, ageEnd: 34,   male: { native: 275, foreign: 140 }, female: { native: 270, foreign: 130 } },
  { ageGroup: '25-29', ageStart: 25, ageEnd: 29,   male: { native: 250, foreign: 110 }, female: { native: 245, foreign: 105 } },
  { ageGroup: '20-24', ageStart: 20, ageEnd: 24,   male: { native: 265, foreign: 80 },  female: { native: 255, foreign: 75 } },
  { ageGroup: '15-19', ageStart: 15, ageEnd: 19,   male: { native: 275, foreign: 55 },  female: { native: 260, foreign: 55 } },
  { ageGroup: '10-14', ageStart: 10, ageEnd: 14,   male: { native: 285, foreign: 45 },  female: { native: 270, foreign: 45 } },
  { ageGroup: '5-9',   ageStart: 5,  ageEnd: 9,    male: { native: 260, foreign: 30 },  female: { native: 245, foreign: 30 } },
  { ageGroup: '0-4',   ageStart: 0,  ageEnd: 4,    male: { native: 235, foreign: 18 },  female: { native: 220, foreign: 18 } },
]

const isWorkingAge = (group: PyramidAgeGroup, min: number, max: number): boolean => {
  const startInside = group.ageStart >= min && group.ageStart <= max
  const endInside = group.ageEnd === null ? false : group.ageEnd >= min && group.ageEnd <= max
  return startInside || endInside
}

const shouldShowAgeLabel = (group: PyramidAgeGroup, mode: AgeLabelMode): boolean => {
  if (mode === false) return false
  if (mode === 'all') return true
  return group.ageStart % 10 === 0
}

const pickBarColor = (
  sex: Sex,
  nationality: Nationality,
  active: boolean,
): string => {
  const variant = active ? 'active' : 'rest'
  return COLORS.bars[sex][nationality][variant]
}

const formatPyramidValue = (value: number): string =>
  value.toLocaleString('es-ES', {
    maximumFractionDigits: 0,
  })

const formatPyramidMillions = (thousands: number): string =>
  `${(thousands / 1000).toLocaleString('es-ES', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })} M`

const groupTotal = (group: PyramidAgeGroup): number =>
  group.male.native
  + group.male.foreign
  + group.female.native
  + group.female.foreign

type Geometry = {
  rowY: (index: number) => number
  maleBarBaseX: number
  femaleBarBaseX: number
  scale: number
  barsBottomY: number
}

const buildGeometry = (rowCount: number, scaleMax: number): Geometry => {
  const maleBarBaseX = LAYOUT.centerX - LAYOUT.axisGap
  const femaleBarBaseX = LAYOUT.centerX + LAYOUT.axisGap
  const maleMaxLength = maleBarBaseX - LAYOUT.padding.left - 24
  const femaleMaxLength = LAYOUT.rightLabelsX - femaleBarBaseX - 6
  const maxBarLength = Math.min(maleMaxLength, femaleMaxLength)
  const scale = maxBarLength / scaleMax
  const rowStride = LAYOUT.barHeight + LAYOUT.barRowGap
  const rowY = (index: number) => LAYOUT.barsTopY + index * rowStride
  const barsBottomY = LAYOUT.barsTopY + rowCount * rowStride - LAYOUT.barRowGap

  return { rowY, maleBarBaseX, femaleBarBaseX, scale, barsBottomY }
}

type WorkingBand = {
  topY: number
  bottomY: number
  height: number
  midY: number
  /** Upper edge of the working-age band (max working age; smaller Y, higher on chart). */
  upperBoundaryY: number
  /** Lower edge of the working-age band (min working age; larger Y, lower on chart). */
  lowerBoundaryY: number
  hasAny: boolean
} | null

const computeWorkingBand = (
  data: PyramidAgeGroup[],
  geometry: Geometry,
  workingAgeMin: number,
  workingAgeMax: number,
): WorkingBand => {
  const indices = data.flatMap((g, i) =>
    isWorkingAge(g, workingAgeMin, workingAgeMax) ? [i] : [],
  )
  if (indices.length === 0) return null

  // Data runs oldest→youngest (90+ at top). First in-range index = max age row; last = min age row.
  const oldestWorkingIndex = indices[0]
  const youngestWorkingIndex = indices[indices.length - 1]
  const padding = 2
  // Upper boundary: top edge of oldest working-age row (divides it from the row above).
  const upperBoundaryY = geometry.rowY(oldestWorkingIndex)
  // Lower boundary: bottom edge of youngest working-age row (divides it from the row below).
  const lowerBoundaryY = geometry.rowY(youngestWorkingIndex) + LAYOUT.barHeight
  const topY = upperBoundaryY - padding
  const bottomY = lowerBoundaryY + padding
  return {
    topY,
    bottomY,
    height: bottomY - topY,
    midY: (topY + bottomY) / 2,
    upperBoundaryY,
    lowerBoundaryY,
    hasAny: true,
  }
}

function WorkingAgeBoundaryLines({
  workingBand,
  workingAgeMin,
  workingAgeMax,
}: {
  workingBand: WorkingBand
  workingAgeMin: number
  workingAgeMax: number
}) {
  if (!workingBand) return null

  const lineX1 = LAYOUT.padding.left
  // Line ends just before the annotation column so the number sits clearly outside.
  const lineX2 = LAYOUT.rightLabelsX - 6
  const labelX = LAYOUT.rightLabelsX
  const stroke = COLORS.workingAgeBoundary

  const renderBoundary = (y: number, age: number) => (
    <g key={`boundary-${age}`}>
      <line
        x1={lineX1}
        x2={lineX2}
        y1={y}
        y2={y}
        stroke={stroke}
        strokeWidth={1.5}
        strokeOpacity={0.9}
      />
      <text
        x={labelX}
        y={y}
        fill={stroke}
        fontSize={9}
        fontWeight={700}
        textAnchor="start"
        dominantBaseline="middle"
      >
        {age}
      </text>
    </g>
  )

  return (
    <g aria-hidden="true">
      {renderBoundary(workingBand.upperBoundaryY, workingAgeMax)}
      {renderBoundary(workingBand.lowerBoundaryY, workingAgeMin)}
    </g>
  )
}

type LegendItem = {
  label: string
  color: string
}

const BIRTHPLACE_LEGEND_ITEMS: LegendItem[] = [
  { label: 'H nac. Espana',      color: COLORS.bars.male.native.active },
  { label: 'H nac. extranjero',  color: COLORS.bars.male.foreign.active },
  { label: 'M nac. Espana',      color: COLORS.bars.female.native.active },
  { label: 'M nac. extranjero',  color: COLORS.bars.female.foreign.active },
]

const SEX_LEGEND_ITEMS: LegendItem[] = [
  { label: 'Hombres', color: COLORS.bars.male.native.active },
  { label: 'Mujeres', color: COLORS.bars.female.native.active },
]

function PyramidBars({
  data,
  geometry,
  workingAgeMin,
  workingAgeMax,
  showBirthplaceLabels,
}: {
  data: PyramidAgeGroup[]
  geometry: Geometry
  workingAgeMin: number
  workingAgeMax: number
  showBirthplaceLabels: boolean
}) {
  const renderSegmentLabel = (
    key: string,
    x: number,
    y: number,
    width: number,
    value: number,
    anchor: 'start' | 'middle' | 'end' = 'middle',
  ) => {
    if (!showBirthplaceLabels || value <= 0 || width < 26) return null

    return (
      <text
        key={key}
        x={x}
        y={y + LAYOUT.barHeight / 2}
        fill={COLORS.textTitle}
        fontSize={6.6}
        fontWeight={700}
        textAnchor={anchor}
        dominantBaseline="middle"
        opacity={0.92}
        pointerEvents="none"
      >
        {formatPyramidValue(value)}
      </text>
    )
  }

  return (
    <g>
      {data.map((group, i) => {
        const active = isWorkingAge(group, workingAgeMin, workingAgeMax)
        const y = geometry.rowY(i)
        const labelY = y + LAYOUT.barHeight / 2

        const maleNativeWidth = group.male.native * geometry.scale
        const maleForeignWidth = group.male.foreign * geometry.scale
        const femaleNativeWidth = group.female.native * geometry.scale
        const femaleForeignWidth = group.female.foreign * geometry.scale
        const maleTotal = group.male.native + group.male.foreign
        const femaleTotal = group.female.native + group.female.foreign

        const maleNativeX = geometry.maleBarBaseX - maleNativeWidth
        const maleForeignX = maleNativeX - maleForeignWidth
        const femaleNativeX = geometry.femaleBarBaseX
        const femaleForeignX = femaleNativeX + femaleNativeWidth

        return (
          <g key={group.ageGroup}>
            <rect
              x={maleForeignX}
              y={y}
              width={maleForeignWidth}
              height={LAYOUT.barHeight}
              fill={pickBarColor('male', 'foreign', active)}
            />
            <rect
              x={maleNativeX}
              y={y}
              width={maleNativeWidth}
              height={LAYOUT.barHeight}
              fill={pickBarColor('male', 'native', active)}
            />
            <rect
              x={femaleNativeX}
              y={y}
              width={femaleNativeWidth}
              height={LAYOUT.barHeight}
              fill={pickBarColor('female', 'native', active)}
            />
            <rect
              x={femaleForeignX}
              y={y}
              width={femaleForeignWidth}
              height={LAYOUT.barHeight}
              fill={pickBarColor('female', 'foreign', active)}
            />
            <text
              x={maleForeignX - 8}
              y={labelY}
              fill={active ? COLORS.textTitle : COLORS.textMuted}
              fontSize={7}
              fontWeight={active ? 700 : 500}
              textAnchor="end"
              dominantBaseline="middle"
              pointerEvents="none"
            >
              {formatPyramidValue(maleTotal)}
            </text>
            <text
              x={Math.min(VIEWBOX.width - 3, femaleForeignX + femaleForeignWidth + 4)}
              y={labelY}
              fill={active ? COLORS.textTitle : COLORS.textMuted}
              fontSize={7}
              fontWeight={active ? 700 : 500}
              textAnchor="start"
              dominantBaseline="middle"
              pointerEvents="none"
            >
              {formatPyramidValue(femaleTotal)}
            </text>
            {renderSegmentLabel(
              `${group.ageGroup}-male-foreign-label`,
              maleForeignX + maleForeignWidth / 2,
              y,
              maleForeignWidth,
              group.male.foreign,
            )}
            {renderSegmentLabel(
              `${group.ageGroup}-male-native-label`,
              maleNativeX + maleNativeWidth / 2,
              y,
              maleNativeWidth,
              group.male.native,
            )}
            {renderSegmentLabel(
              `${group.ageGroup}-female-native-label`,
              femaleNativeX + femaleNativeWidth / 2,
              y,
              femaleNativeWidth,
              group.female.native,
            )}
            {renderSegmentLabel(
              `${group.ageGroup}-female-foreign-label`,
              femaleForeignX + femaleForeignWidth / 2,
              y,
              femaleForeignWidth,
              group.female.foreign,
            )}
          </g>
        )
      })}
    </g>
  )
}

function AgeAxisLabels({
  data,
  geometry,
  mode,
  workingAgeMin,
  workingAgeMax,
}: {
  data: PyramidAgeGroup[]
  geometry: Geometry
  mode: AgeLabelMode
  workingAgeMin: number
  workingAgeMax: number
}) {
  if (mode === false) return null

  return (
    <g aria-hidden="true">
      {data.map((group, i) => {
        if (!shouldShowAgeLabel(group, mode)) return null

        const y = geometry.rowY(i) + LAYOUT.barHeight / 2
        const active = isWorkingAge(group, workingAgeMin, workingAgeMax)

        return (
          <text
            key={group.ageGroup}
            x={LAYOUT.centerX}
            y={y}
            fill={active ? COLORS.textTitle : COLORS.textMuted}
            fontSize={8.5}
            fontWeight={active ? 600 : 400}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {group.ageGroup}
          </text>
        )
      })}
    </g>
  )
}

function BottomAxes({
  geometry,
  scaleMax,
}: {
  geometry: Geometry
  scaleMax: number
}) {
  const maleAxisStart = LAYOUT.centerX - LAYOUT.axisGap
  const maleAxisEnd = maleAxisStart - scaleMax * geometry.scale
  const femaleAxisStart = LAYOUT.centerX + LAYOUT.axisGap
  const femaleAxisEnd = femaleAxisStart + scaleMax * geometry.scale

  const half = scaleMax / 2
  const maleMid = maleAxisStart - half * geometry.scale
  const femaleMid = femaleAxisStart + half * geometry.scale

  return (
    <g>
      <line
        x1={maleAxisEnd}
        x2={maleAxisStart}
        y1={LAYOUT.bottomAxisY}
        y2={LAYOUT.bottomAxisY}
        stroke={COLORS.axis}
        strokeWidth={1}
      />
      <line
        x1={femaleAxisStart}
        x2={femaleAxisEnd}
        y1={LAYOUT.bottomAxisY}
        y2={LAYOUT.bottomAxisY}
        stroke={COLORS.axis}
        strokeWidth={1}
      />

      <text
        x={maleAxisEnd}
        y={LAYOUT.tickLabelY}
        fill={COLORS.textMuted}
        fontSize={9}
        textAnchor="start"
      >
        {scaleMax}
      </text>
      <text
        x={maleMid}
        y={LAYOUT.tickLabelY}
        fill={COLORS.textMuted}
        fontSize={9}
        textAnchor="middle"
      >
        {half}
      </text>
      <text
        x={maleAxisStart}
        y={LAYOUT.tickLabelY}
        fill={COLORS.textMuted}
        fontSize={9}
        textAnchor="end"
      >
        0
      </text>

      <text
        x={femaleAxisStart}
        y={LAYOUT.tickLabelY}
        fill={COLORS.textMuted}
        fontSize={9}
        textAnchor="start"
      >
        0
      </text>
      <text
        x={femaleMid}
        y={LAYOUT.tickLabelY}
        fill={COLORS.textMuted}
        fontSize={9}
        textAnchor="middle"
      >
        {half}
      </text>
      <text
        x={femaleAxisEnd}
        y={LAYOUT.tickLabelY}
        fill={COLORS.textMuted}
        fontSize={9}
        textAnchor="end"
      >
        {scaleMax}
      </text>

      <text
        x={(maleAxisEnd + maleAxisStart) / 2}
        y={LAYOUT.axisCaptionY}
        fill={COLORS.textFaint}
        fontSize={10}
        textAnchor="middle"
      >
        Poblacion (miles)
      </text>
      <text
        x={(femaleAxisStart + femaleAxisEnd) / 2}
        y={LAYOUT.axisCaptionY}
        fill={COLORS.textFaint}
        fontSize={10}
        textAnchor="middle"
      >
        Poblacion (miles)
      </text>
    </g>
  )
}

function Legend({ variant }: { variant: NonNullable<PopulationPyramidProps['legendVariant']> }) {
  const items = variant === 'sex' ? SEX_LEGEND_ITEMS : BIRTHPLACE_LEGEND_ITEMS
  const startX = LAYOUT.padding.left + 6
  const usableWidth = VIEWBOX.width - LAYOUT.padding.left - LAYOUT.padding.right - 12
  const step = usableWidth / items.length

  return (
    <g>
      {items.map((item, index) => {
        const itemX = startX + index * step
        return (
          <g key={item.label} transform={`translate(${itemX}, ${LAYOUT.legendY})`}>
            <rect width={11} height={11} rx={1.5} fill={item.color} />
            <text
              x={18}
              y={9.5}
              fill={COLORS.textMuted}
              fontSize={10}
            >
              {item.label}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function SideAgeStats({
  data,
  workingAgeMin,
  workingAgeMax,
  geometry,
  workingBand,
}: {
  data: PyramidAgeGroup[]
  workingAgeMin: number
  workingAgeMax: number
  geometry: Geometry
  workingBand: WorkingBand
}) {
  if (!workingBand) return null

  const childrenTotal = data
    .filter((group) => group.ageEnd !== null && group.ageEnd < workingAgeMin)
    .reduce((sum, group) => sum + groupTotal(group), 0)
  const workingAgeTotal = data
    .filter((group) => isWorkingAge(group, workingAgeMin, workingAgeMax))
    .reduce((sum, group) => sum + groupTotal(group), 0)
  const pensionerTotal = data
    .filter((group) => group.ageStart > workingAgeMax)
    .reduce((sum, group) => sum + groupTotal(group), 0)

  const statX = LAYOUT.rightLabelsX + 48

  const renderStat = (
    label: string,
    value: number,
    y: number,
    emphasis = false,
  ) => (
    <g key={label}>
      <text
        x={statX}
        y={y - 9}
        fill={emphasis ? COLORS.textTitle : COLORS.textMuted}
        fontSize={11}
        fontWeight={800}
        textAnchor="middle"
        letterSpacing={0.5}
      >
        {label}
      </text>
      <text
        x={statX}
        y={y + 13}
        fill={COLORS.textTitle}
        fontSize={20}
        fontWeight={900}
        textAnchor="middle"
      >
        {formatPyramidMillions(value)}
      </text>
    </g>
  )

  return (
    <g aria-hidden="true">
      {renderStat('PENSIONISTAS', pensionerTotal, (LAYOUT.barsTopY + workingBand.topY) / 2)}
      {renderStat('20-64 AÑOS', workingAgeTotal, workingBand.midY, true)}
      {renderStat('NIÑOS', childrenTotal, (workingBand.bottomY + geometry.barsBottomY) / 2)}
    </g>
  )
}

export function PopulationPyramid({
  data = DEFAULT_DATA,
  workingAgeMin = 20,
  workingAgeMax = 64,
  scaleMax = 500,
  ageLabels = 'all',
  legendVariant = 'birthplace',
  className,
  title = 'Piramide poblacional de Espana',
  subtitle = 'Poblacion por edad, sexo y nacionalidad',
}: PopulationPyramidProps) {
  const geometry = buildGeometry(data.length, scaleMax)
  const workingBand = computeWorkingBand(data, geometry, workingAgeMin, workingAgeMax)

  return (
    <div
      className={`relative w-full max-w-[620px] aspect-[620/493] ${className ?? ''}`.trim()}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role="img"
        aria-label={`${title}. ${subtitle}`}
        className="block h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="pyramid-bg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={COLORS.backgroundFrom} />
            <stop offset="100%" stopColor={COLORS.backgroundTo} />
          </linearGradient>
        </defs>

        <rect
          x={0}
          y={0}
          width={VIEWBOX.width}
          height={VIEWBOX.height}
          rx={10}
          fill="url(#pyramid-bg)"
        />

        <text
          x={LAYOUT.padding.left}
          y={LAYOUT.titleY}
          fill={COLORS.textTitle}
          fontSize={15}
          fontWeight={700}
        >
          {title}
        </text>
        <text
          x={LAYOUT.padding.left}
          y={LAYOUT.subtitleY}
          fill={COLORS.textMuted}
          fontSize={11}
        >
          {subtitle}
        </text>

        <text
          x={LAYOUT.centerX - 80}
          y={LAYOUT.sectionLabelY}
          fill={COLORS.textTitle}
          fontSize={12}
          fontWeight={700}
          textAnchor="middle"
        >
          Hombres
        </text>
        <text
          x={LAYOUT.centerX}
          y={LAYOUT.sectionLabelY}
          fill={COLORS.textMuted}
          fontSize={10}
          textAnchor="middle"
        >
          Edad
        </text>
        <text
          x={LAYOUT.centerX + 80}
          y={LAYOUT.sectionLabelY}
          fill={COLORS.textTitle}
          fontSize={12}
          fontWeight={700}
          textAnchor="middle"
        >
          Mujeres
        </text>

        {workingBand && (
          <rect
            x={LAYOUT.padding.left}
            y={workingBand.topY}
            width={LAYOUT.rightLabelsX - LAYOUT.padding.left - 8}
            height={workingBand.height}
            fill={COLORS.workingAgeBand}
            opacity={0.22}
            rx={4}
          />
        )}

        <line
          x1={LAYOUT.centerX}
          x2={LAYOUT.centerX}
          y1={LAYOUT.barsTopY - 4}
          y2={geometry.barsBottomY + 4}
          stroke={COLORS.axis}
          strokeWidth={1}
        />

        <PyramidBars
          data={data}
          geometry={geometry}
          workingAgeMin={workingAgeMin}
          workingAgeMax={workingAgeMax}
          showBirthplaceLabels={legendVariant === 'birthplace'}
        />

        <WorkingAgeBoundaryLines
          workingBand={workingBand}
          workingAgeMin={workingAgeMin}
          workingAgeMax={workingAgeMax}
        />

        <AgeAxisLabels
          data={data}
          geometry={geometry}
          mode={ageLabels}
          workingAgeMin={workingAgeMin}
          workingAgeMax={workingAgeMax}
        />

        <SideAgeStats
          data={data}
          geometry={geometry}
          workingAgeMin={workingAgeMin}
          workingAgeMax={workingAgeMax}
          workingBand={workingBand}
        />

        <BottomAxes geometry={geometry} scaleMax={scaleMax} />
        <Legend variant={legendVariant} />
      </svg>
    </div>
  )
}

export default PopulationPyramid
