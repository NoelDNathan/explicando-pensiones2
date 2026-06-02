import {
  BIRTHPLACE_LEGEND_ITEMS,
  PYRAMID_COLORS,
  PYRAMID_LAYOUT,
  PYRAMID_VIEWBOX,
  SEX_LEGEND_ITEMS,
  type LegendItem,
} from './PopulationPyramid.config'
import {
  formatPyramidMillions,
  formatPyramidValue,
  groupTotal,
  isWorkingAge,
  shouldShowAgeLabel,
  type Geometry,
  type WorkingBand,
} from './PopulationPyramid.geometry'
import type { AgeLabelMode, PopulationPyramidProps, PyramidAgeGroup } from './PopulationPyramid.types'

const pickBarColor = (
  sex: 'male' | 'female',
  nationality: 'native' | 'foreign',
  active: boolean,
): string => {
  const variant = active ? 'active' : 'rest'
  return PYRAMID_COLORS.bars[sex][nationality][variant]
}

export function WorkingAgeBoundaryLines({
  workingBand,
  workingAgeMin,
  workingAgeMax,
}: {
  workingBand: WorkingBand
  workingAgeMin: number
  workingAgeMax: number
}) {
  if (!workingBand) return null

  const lineX1 = PYRAMID_LAYOUT.padding.left
  const lineX2 = PYRAMID_LAYOUT.rightLabelsX - 6
  const labelX = PYRAMID_LAYOUT.rightLabelsX
  const stroke = PYRAMID_COLORS.workingAgeBoundary

  const renderBoundary = (y: number, age: number) => (
    <g key={`boundary-${age}`}>
      <line x1={lineX1} x2={lineX2} y1={y} y2={y} stroke={stroke} strokeWidth={1.5} strokeOpacity={0.9} />
      <text x={labelX} y={y} fill={stroke} fontSize={9} fontWeight={700} textAnchor="start" dominantBaseline="middle">
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

export function PyramidBars({
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
  const renderSegmentLabel = (key: string, x: number, y: number, width: number, value: number) => {
    if (!showBirthplaceLabels || value <= 0 || width < 26) return null

    return (
      <text
        key={key}
        x={x}
        y={y + PYRAMID_LAYOUT.barHeight / 2}
        fill={PYRAMID_COLORS.textTitle}
        fontSize={6.6}
        fontWeight={700}
        textAnchor="middle"
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
      {data.map((group, index) => {
        const active = isWorkingAge(group, workingAgeMin, workingAgeMax)
        const y = geometry.rowY(index)
        const labelY = y + PYRAMID_LAYOUT.barHeight / 2

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
            <rect x={maleForeignX} y={y} width={maleForeignWidth} height={PYRAMID_LAYOUT.barHeight} fill={pickBarColor('male', 'foreign', active)} />
            <rect x={maleNativeX} y={y} width={maleNativeWidth} height={PYRAMID_LAYOUT.barHeight} fill={pickBarColor('male', 'native', active)} />
            <rect x={femaleNativeX} y={y} width={femaleNativeWidth} height={PYRAMID_LAYOUT.barHeight} fill={pickBarColor('female', 'native', active)} />
            <rect x={femaleForeignX} y={y} width={femaleForeignWidth} height={PYRAMID_LAYOUT.barHeight} fill={pickBarColor('female', 'foreign', active)} />
            <text x={maleForeignX - 8} y={labelY} fill={active ? PYRAMID_COLORS.textTitle : PYRAMID_COLORS.textMuted} fontSize={7} fontWeight={active ? 700 : 500} textAnchor="end" dominantBaseline="middle" pointerEvents="none">
              {formatPyramidValue(maleTotal)}
            </text>
            <text x={Math.min(PYRAMID_VIEWBOX.width - 3, femaleForeignX + femaleForeignWidth + 4)} y={labelY} fill={active ? PYRAMID_COLORS.textTitle : PYRAMID_COLORS.textMuted} fontSize={7} fontWeight={active ? 700 : 500} textAnchor="start" dominantBaseline="middle" pointerEvents="none">
              {formatPyramidValue(femaleTotal)}
            </text>
            {renderSegmentLabel(`${group.ageGroup}-male-foreign-label`, maleForeignX + maleForeignWidth / 2, y, maleForeignWidth, group.male.foreign)}
            {renderSegmentLabel(`${group.ageGroup}-male-native-label`, maleNativeX + maleNativeWidth / 2, y, maleNativeWidth, group.male.native)}
            {renderSegmentLabel(`${group.ageGroup}-female-native-label`, femaleNativeX + femaleNativeWidth / 2, y, femaleNativeWidth, group.female.native)}
            {renderSegmentLabel(`${group.ageGroup}-female-foreign-label`, femaleForeignX + femaleForeignWidth / 2, y, femaleForeignWidth, group.female.foreign)}
          </g>
        )
      })}
    </g>
  )
}

export function AgeAxisLabels({
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
      {data.map((group, index) => {
        if (!shouldShowAgeLabel(group, mode)) return null

        const y = geometry.rowY(index) + PYRAMID_LAYOUT.barHeight / 2
        const active = isWorkingAge(group, workingAgeMin, workingAgeMax)

        return (
          <text key={group.ageGroup} x={PYRAMID_LAYOUT.centerX} y={y} fill={active ? PYRAMID_COLORS.textTitle : PYRAMID_COLORS.textMuted} fontSize={8.5} fontWeight={active ? 600 : 400} textAnchor="middle" dominantBaseline="middle">
            {group.ageGroup}
          </text>
        )
      })}
    </g>
  )
}

export function BottomAxes({ geometry, scaleMax }: { geometry: Geometry; scaleMax: number }) {
  const maleAxisStart = PYRAMID_LAYOUT.centerX - PYRAMID_LAYOUT.axisGap
  const maleAxisEnd = maleAxisStart - scaleMax * geometry.scale
  const femaleAxisStart = PYRAMID_LAYOUT.centerX + PYRAMID_LAYOUT.axisGap
  const femaleAxisEnd = femaleAxisStart + scaleMax * geometry.scale
  const half = scaleMax / 2
  const maleMid = maleAxisStart - half * geometry.scale
  const femaleMid = femaleAxisStart + half * geometry.scale

  return (
    <g>
      <line x1={maleAxisEnd} x2={maleAxisStart} y1={PYRAMID_LAYOUT.bottomAxisY} y2={PYRAMID_LAYOUT.bottomAxisY} stroke={PYRAMID_COLORS.axis} strokeWidth={1} />
      <line x1={femaleAxisStart} x2={femaleAxisEnd} y1={PYRAMID_LAYOUT.bottomAxisY} y2={PYRAMID_LAYOUT.bottomAxisY} stroke={PYRAMID_COLORS.axis} strokeWidth={1} />
      {[
        [maleAxisEnd, scaleMax, 'start'],
        [maleMid, half, 'middle'],
        [maleAxisStart, 0, 'end'],
        [femaleAxisStart, 0, 'start'],
        [femaleMid, half, 'middle'],
        [femaleAxisEnd, scaleMax, 'end'],
      ].map(([x, value, anchor]) => (
        <text key={`${x}-${value}`} x={Number(x)} y={PYRAMID_LAYOUT.tickLabelY} fill={PYRAMID_COLORS.textMuted} fontSize={9} textAnchor={anchor as 'start' | 'middle' | 'end'}>
          {value}
        </text>
      ))}
      <text x={(maleAxisEnd + maleAxisStart) / 2} y={PYRAMID_LAYOUT.axisCaptionY} fill={PYRAMID_COLORS.textFaint} fontSize={10} textAnchor="middle">
        Poblacion (miles)
      </text>
      <text x={(femaleAxisStart + femaleAxisEnd) / 2} y={PYRAMID_LAYOUT.axisCaptionY} fill={PYRAMID_COLORS.textFaint} fontSize={10} textAnchor="middle">
        Poblacion (miles)
      </text>
    </g>
  )
}

export function Legend({ variant }: { variant: NonNullable<PopulationPyramidProps['legendVariant']> }) {
  const items = variant === 'sex' ? SEX_LEGEND_ITEMS : BIRTHPLACE_LEGEND_ITEMS
  const startX = PYRAMID_LAYOUT.padding.left + 6
  const usableWidth = PYRAMID_VIEWBOX.width - PYRAMID_LAYOUT.padding.left - PYRAMID_LAYOUT.padding.right - 12
  const step = usableWidth / items.length

  return (
    <g>
      {items.map((item, index) => (
        <g key={item.label} transform={`translate(${startX + index * step}, ${PYRAMID_LAYOUT.legendY})`}>
          <rect width={11} height={11} rx={1.5} fill={item.color} />
          <text x={18} y={9.5} fill={PYRAMID_COLORS.textMuted} fontSize={10}>
            {item.label}
          </text>
        </g>
      ))}
    </g>
  )
}

export function SideAgeStats({
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

  const statX = PYRAMID_LAYOUT.rightLabelsX + 48
  const renderStat = (label: string, value: number, y: number, emphasis = false) => (
    <g key={label}>
      <text x={statX} y={y - 9} fill={emphasis ? PYRAMID_COLORS.textTitle : PYRAMID_COLORS.textMuted} fontSize={11} fontWeight={800} textAnchor="middle" letterSpacing={0.5}>
        {label}
      </text>
      <text x={statX} y={y + 13} fill={PYRAMID_COLORS.textTitle} fontSize={20} fontWeight={900} textAnchor="middle">
        {formatPyramidMillions(value)}
      </text>
    </g>
  )

  return (
    <g aria-hidden="true">
      {renderStat('PENSIONISTAS', pensionerTotal, (PYRAMID_LAYOUT.barsTopY + workingBand.topY) / 2)}
      {renderStat('20-64 ANOS', workingAgeTotal, workingBand.midY, true)}
      {renderStat('NINOS', childrenTotal, (workingBand.bottomY + geometry.barsBottomY) / 2)}
    </g>
  )
}
