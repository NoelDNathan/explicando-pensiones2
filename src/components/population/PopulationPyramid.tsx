/**
 * PopulationPyramid
 *
 * Presentational SVG wrapper for the population pyramid. The heavy details
 * live next to it: types, visual constants, geometry helpers, SVG parts and
 * the indicator-info metadata.
 */

import {
  DEFAULT_PYRAMID_DATA,
  PYRAMID_COLORS,
  PYRAMID_LAYOUT,
  PYRAMID_VIEWBOX,
} from './PopulationPyramid.config'
import {
  buildGeometry,
  computeWorkingBand,
} from './PopulationPyramid.geometry'
import {
  AgeAxisLabels,
  BottomAxes,
  Legend,
  PyramidBars,
  SideAgeStats,
  WorkingAgeBoundaryLines,
} from './PopulationPyramid.parts'
import type {
  AgeLabelMode,
  PopulationPyramidProps,
  PyramidAgeGroup,
} from './PopulationPyramid.types'

export type {
  AgeLabelMode,
  PopulationPyramidProps,
  PyramidAgeGroup,
} from './PopulationPyramid.types'
export { POPULATION_PYRAMID_INFO } from './PopulationPyramid.info'

export function PopulationPyramid({
  data = DEFAULT_PYRAMID_DATA,
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
    <div className={`relative w-full max-w-[620px] aspect-[620/493] ${className ?? ''}`.trim()}>
      <svg
        viewBox={`0 0 ${PYRAMID_VIEWBOX.width} ${PYRAMID_VIEWBOX.height}`}
        role="img"
        aria-label={`${title}. ${subtitle}`}
        className="block h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="pyramid-bg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={PYRAMID_COLORS.backgroundFrom} />
            <stop offset="100%" stopColor={PYRAMID_COLORS.backgroundTo} />
          </linearGradient>
        </defs>

        <rect
          x={0}
          y={0}
          width={PYRAMID_VIEWBOX.width}
          height={PYRAMID_VIEWBOX.height}
          rx={10}
          fill="url(#pyramid-bg)"
        />

        <text x={PYRAMID_LAYOUT.padding.left} y={PYRAMID_LAYOUT.titleY} fill={PYRAMID_COLORS.textTitle} fontSize={15} fontWeight={700}>
          {title}
        </text>
        <text x={PYRAMID_LAYOUT.padding.left} y={PYRAMID_LAYOUT.subtitleY} fill={PYRAMID_COLORS.textMuted} fontSize={11}>
          {subtitle}
        </text>

        <text x={PYRAMID_LAYOUT.centerX - 80} y={PYRAMID_LAYOUT.sectionLabelY} fill={PYRAMID_COLORS.textTitle} fontSize={12} fontWeight={700} textAnchor="middle">
          Hombres
        </text>
        <text x={PYRAMID_LAYOUT.centerX} y={PYRAMID_LAYOUT.sectionLabelY} fill={PYRAMID_COLORS.textMuted} fontSize={10} textAnchor="middle">
          Edad
        </text>
        <text x={PYRAMID_LAYOUT.centerX + 80} y={PYRAMID_LAYOUT.sectionLabelY} fill={PYRAMID_COLORS.textTitle} fontSize={12} fontWeight={700} textAnchor="middle">
          Mujeres
        </text>

        {workingBand && (
          <rect
            x={PYRAMID_LAYOUT.padding.left}
            y={workingBand.topY}
            width={PYRAMID_LAYOUT.rightLabelsX - PYRAMID_LAYOUT.padding.left - 8}
            height={workingBand.height}
            fill={PYRAMID_COLORS.workingAgeBand}
            opacity={0.22}
            rx={4}
          />
        )}

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
