/**
 * Explicador de la reduccion por obtencion de rendimientos del trabajo
 * (articulo 20 LIRPF, importes 2025) y de la "joroba" del IRPF que provoca.
 *
 * Todas las cifras salen del mismo motor que la calculadora fiscal
 * (`calculateIrpf2025Core`) para el perfil base de la comparativa por CCAA:
 * trabajador por cuenta ajena, Madrid, grupo 7, soltero, 40 anos, sin hijos.
 */
import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Calculator,
  ChevronsDownUp,
  CircleSlash,
  Info,
  Layers,
  Percent,
  RotateCcw,
  TrendingDown,
  TriangleAlert,
} from 'lucide-react'
import { SalarySlider } from '../ui/SalarySlider'
import { applyIrpfScale } from './irpf2025Calc'
import { createEmptyIrpf2025Adjustments } from './irpf2025Adjustments'
import { computeBaseProfileIrpf2025Detail } from './irpfRegionCalc'
import type { BaseProfileOptions } from './irpfRegionCalc'
import './WorkIncomeReductionExplainer.css'

const MIN_GROSS = 8_000
const MAX_GROSS = 30_000
const CURVE_STEP = 50
const MARGINAL_DELTA = 25

const TIER_1_TOP = 14_852
const TIER_2_TOP = 17_673.52
const REDUCTION_LIMIT = 19_747.5
const MAX_REDUCTION = 7_302
const TIER_2_SLOPE = 1.75
const TIER_3_SLOPE = 1.14
const TIER_3_START_AMOUNT = 2_364.34
const OTHER_INCOME_LIMIT = 6_500

/** Agrupa siempre los miles: en un texto fiscal "7.302 €" se lee mejor que "7302 €". */
const euro = (value: number, decimals = 0) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    useGrouping: 'always',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)

const percent = (value: number, decimals = 1) =>
  `${new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)} %`

/** Cuota integra estatal + autonomica de una base, restando la cuota del minimo. */
function integralQuota(base: number, detail: ReturnType<typeof computeBaseProfileIrpf2025Detail>) {
  const { stateScale, regionalScale, stateMinimum, regionalMinimum } = detail.context
  const state = Math.max(0, applyIrpfScale(base, stateScale) - applyIrpfScale(stateMinimum, stateScale))
  const regional = Math.max(
    0,
    applyIrpfScale(base, regionalScale) - applyIrpfScale(regionalMinimum, regionalScale),
  )
  return state + regional
}

/**
 * IRPF del mismo salario si el articulo 20 no existiera. Sirve para medir el
 * ahorro real y, con el mismo numero, el coste de pasarse del umbral de 6.500.
 */
function irpfWithoutWorkReduction(detail: ReturnType<typeof computeBaseProfileIrpf2025Detail>) {
  const base = detail.core.taxableBase + detail.core.workReductionApplied
  const quota = integralQuota(base, detail)
  // En este perfil solo hay rendimientos del trabajo: el limite de la deduccion
  // de 340 es la propia cuota integra.
  const lowIncomeDeduction = Math.min(detail.core.lowWorkIncomeDeductionTheoretical, quota)
  return Math.max(0, quota - lowIncomeDeduction)
}

type CurvePoint = {
  gross: number
  basis: number
  theoretical: number
  applied: number
  /** Tipo marginal del IRPF sobre el bruto, en puntos porcentuales. */
  marginalIrpf: number
  /** Tipo marginal del IRPF mas cotizaciones del trabajador. */
  marginalTotal: number
  /** Tipo medio: IRPF sobre el bruto. */
  averageIrpf: number
}

function buildCurve(profile: BaseProfileOptions): CurvePoint[] {
  const points: CurvePoint[] = []
  for (let gross = MIN_GROSS; gross <= MAX_GROSS; gross += CURVE_STEP) {
    const here = computeBaseProfileIrpf2025Detail(gross, profile)
    const low = computeBaseProfileIrpf2025Detail(gross - MARGINAL_DELTA, profile)
    const high = computeBaseProfileIrpf2025Detail(gross + MARGINAL_DELTA, profile)
    const span = MARGINAL_DELTA * 2
    const marginalIrpf = ((high.core.irpf - low.core.irpf) / span) * 100
    const marginalSocialSecurity =
      ((high.employeeSocialSecurity - low.employeeSocialSecurity) / span) * 100

    points.push({
      gross,
      basis: here.core.workReductionBasis,
      theoretical: here.core.workReductionTheoretical,
      applied: here.core.workReductionApplied,
      marginalIrpf,
      marginalTotal: marginalIrpf + marginalSocialSecurity,
      averageIrpf: gross > 0 ? (here.core.irpf / gross) * 100 : 0,
    })
  }
  return points
}

const DEFAULT_SIMULATED_GROSS = 18_000

const clampGross = (value: number) => Math.min(MAX_GROSS, Math.max(MIN_GROSS, Math.round(value)))

/** Primer bruto de la curva en el que la base del articulo 20 supera un umbral. */
function grossWhereBasisReaches(curve: CurvePoint[], basisThreshold: number) {
  return curve.find((point) => point.basis >= basisThreshold)?.gross ?? MAX_GROSS
}

// ─── Grafico ─────────────────────────────────────────────────────────────────

const CHART_WIDTH = 760
const CHART_HEIGHT = 300
const PAD_LEFT = 62
const PAD_RIGHT = 18
const PAD_TOP = 18
const PAD_BOTTOM = 40

type ChartScale = {
  x: (value: number) => number
  y: (value: number) => number
}

function makeScale(xMin: number, xMax: number, yMax: number): ChartScale {
  return {
    x: (value) =>
      PAD_LEFT + ((value - xMin) / (xMax - xMin)) * (CHART_WIDTH - PAD_LEFT - PAD_RIGHT),
    y: (value) => CHART_HEIGHT - PAD_BOTTOM - (value / yMax) * (CHART_HEIGHT - PAD_TOP - PAD_BOTTOM),
  }
}

function linePath(points: CurvePoint[], scale: ChartScale, pick: (point: CurvePoint) => number) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${scale.x(point.gross).toFixed(1)},${scale.y(pick(point)).toFixed(1)}`)
    .join(' ')
}

function areaPath(points: CurvePoint[], scale: ChartScale, pick: (point: CurvePoint) => number) {
  if (points.length === 0) return ''
  const baseline = CHART_HEIGHT - PAD_BOTTOM
  const first = scale.x(points[0].gross).toFixed(1)
  const last = scale.x(points[points.length - 1].gross).toFixed(1)
  return `${linePath(points, scale, pick)} L${last},${baseline} L${first},${baseline} Z`
}

function ChartFrame({
  scale,
  xMin,
  xMax,
  yMax,
  yTicks,
  formatY,
  children,
  label,
}: {
  scale: ChartScale
  xMin: number
  xMax: number
  yMax: number
  yTicks: number[]
  formatY: (value: number) => string
  children: React.ReactNode
  label: string
}) {
  const xTicks: number[] = []
  for (let value = Math.ceil(xMin / 2_000) * 2_000; value <= xMax; value += 2_000) {
    xTicks.push(value)
  }

  return (
    <svg
      className="wir-chart"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            className="wir-chart__grid"
            x1={PAD_LEFT}
            x2={CHART_WIDTH - PAD_RIGHT}
            y1={scale.y(tick)}
            y2={scale.y(tick)}
          />
          <text className="wir-chart__axis-label" x={PAD_LEFT - 10} y={scale.y(tick) + 4} textAnchor="end">
            {formatY(tick)}
          </text>
        </g>
      ))}
      {xTicks.map((tick) => (
        <text
          key={tick}
          className="wir-chart__axis-label"
          x={scale.x(tick)}
          y={CHART_HEIGHT - PAD_BOTTOM + 20}
          textAnchor="middle"
        >
          {`${Math.round(tick / 1_000)}k`}
        </text>
      ))}
      <text
        className="wir-chart__axis-title"
        x={(PAD_LEFT + CHART_WIDTH - PAD_RIGHT) / 2}
        y={CHART_HEIGHT - 4}
        textAnchor="middle"
      >
        Salario bruto anual (€)
      </text>
      {children}
      <line
        className="wir-chart__axis"
        x1={PAD_LEFT}
        x2={CHART_WIDTH - PAD_RIGHT}
        y1={scale.y(0)}
        y2={scale.y(0)}
      />
      <line
        className="wir-chart__axis"
        x1={PAD_LEFT}
        x2={PAD_LEFT}
        y1={PAD_TOP}
        y2={scale.y(0)}
      />
      {/* yMax se usa para que el marco reciba el dominio completo */}
      <title>{`${label} (eje Y hasta ${formatY(yMax)})`}</title>
    </svg>
  )
}

function CurrentMarker({
  scale,
  gross,
  caption,
  yTop = PAD_TOP,
}: {
  scale: ChartScale
  gross: number
  caption: string
  yTop?: number
}) {
  const x = scale.x(gross)
  const flip = x > CHART_WIDTH - 150
  return (
    <g className="wir-chart__marker">
      <line x1={x} x2={x} y1={yTop} y2={CHART_HEIGHT - PAD_BOTTOM} />
      <text x={flip ? x - 8 : x + 8} y={yTop + 12} textAnchor={flip ? 'end' : 'start'}>
        {caption}
      </text>
    </g>
  )
}

/** `plotted` marca las filas que ademas tienen linea en el grafico. */
type HoverRow = { label: string; value: number; tone: 'red' | 'blue' | 'plain'; plotted?: boolean }

/**
 * Capa transparente sobre el area de dibujo que convierte la posicion del raton
 * en un salario y engancha el punto mas cercano de la curva. Mide sobre el rect
 * real del elemento, asi que funciona con cualquier escalado del viewBox.
 */
function ChartHoverLayer({
  points,
  scale,
  xMin,
  xMax,
  hovered,
  onHover,
  rows,
}: {
  points: CurvePoint[]
  scale: ChartScale
  xMin: number
  xMax: number
  hovered: CurvePoint | null
  onHover: (point: CurvePoint | null) => void
  rows: (point: CurvePoint) => HoverRow[]
}) {
  const plotTop = PAD_TOP
  const plotBottom = CHART_HEIGHT - PAD_BOTTOM

  const track = (event: React.PointerEvent<SVGRectElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || points.length === 0) {
      onHover(null)
      return
    }
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    const target = xMin + ratio * (xMax - xMin)
    onHover(
      points.reduce(
        (best, point) =>
          Math.abs(point.gross - target) < Math.abs(best.gross - target) ? point : best,
        points[0],
      ),
    )
  }

  const readings = hovered ? rows(hovered) : []
  const x = hovered ? scale.x(hovered.gross) : 0
  const boxWidth = 196
  const boxHeight = 26 + readings.length * 18
  const flip = x + 14 + boxWidth > CHART_WIDTH - PAD_RIGHT
  const boxX = flip ? x - 14 - boxWidth : x + 14

  return (
    <g>
      {hovered ? (
        <g className="wir-chart__hover" aria-hidden="true">
          <line className="wir-chart__hover-line" x1={x} x2={x} y1={plotTop} y2={plotBottom} />
          {readings.map((row) =>
            row.plotted ? (
              <circle
                key={row.label}
                className={`wir-chart__hover-dot wir-chart__hover-dot--${row.tone}`}
                cx={x}
                cy={scale.y(Math.max(0, row.value))}
                r={4}
              />
            ) : null,
          )}
          <rect
            className="wir-chart__hover-box"
            x={boxX}
            y={plotTop + 6}
            width={boxWidth}
            height={boxHeight}
            rx={8}
          />
          <text className="wir-chart__hover-title" x={boxX + 12} y={plotTop + 24}>
            {euro(hovered.gross)} de bruto
          </text>
          {readings.map((row, index) => (
            <g key={row.label}>
              <text
                className="wir-chart__hover-label"
                x={boxX + 12}
                y={plotTop + 44 + index * 18}
              >
                {row.label}
              </text>
              <text
                className={`wir-chart__hover-value wir-chart__hover-value--${row.tone}`}
                x={boxX + boxWidth - 12}
                y={plotTop + 44 + index * 18}
                textAnchor="end"
              >
                {percent(row.value)}
              </text>
            </g>
          ))}
        </g>
      ) : null}
      <rect
        className="wir-chart__hover-surface"
        x={PAD_LEFT}
        y={plotTop}
        width={CHART_WIDTH - PAD_LEFT - PAD_RIGHT}
        height={plotBottom - plotTop}
        onPointerMove={track}
        onPointerDown={track}
        onPointerLeave={() => onHover(null)}
      />
    </g>
  )
}

// ─── Componente ──────────────────────────────────────────────────────────────

export type WorkIncomeReductionExplainerProps = {
  /** 'page' ocupa la pantalla; 'embedded' se integra dentro de otra tarjeta. */
  variant?: 'page' | 'embedded'
  /** Salario real del usuario: el simulador arranca ahi. */
  initialGrossSalaryAnnual?: number
  region?: string
  contributionGroup?: number
  stateMinimum?: number
  regionalMinimum?: number
  /** Respuesta del usuario sobre otras rentas: decide si la reduccion aplica. */
  otherNonExemptNonWorkIncome?: number
  otherIncomeKnown?: boolean
}

export function WorkIncomeReductionExplainer({
  variant = 'page',
  initialGrossSalaryAnnual,
  region,
  contributionGroup,
  stateMinimum,
  regionalMinimum,
  otherNonExemptNonWorkIncome = 0,
  otherIncomeKnown = true,
}: WorkIncomeReductionExplainerProps = {}) {
  const embedded = variant === 'embedded'
  // "Tu caso" se calcula siempre con el salario real, aunque quede fuera del
  // rango del simulador; el slider solo controla el escenario que se explora.
  const realGross = Math.max(0, initialGrossSalaryAnnual ?? 18_000)
  const realGrossInSliderRange = realGross >= MIN_GROSS && realGross <= MAX_GROSS
  const anchorGross = realGrossInSliderRange ? clampGross(realGross) : DEFAULT_SIMULATED_GROSS
  const [gross, setGross] = useState(anchorGross)
  const [hoveredMarginal, setHoveredMarginal] = useState<CurvePoint | null>(null)

  const profile = useMemo<BaseProfileOptions>(() => {
    const adjustments = createEmptyIrpf2025Adjustments()
    adjustments.otherIncomeKnown = otherIncomeKnown
    adjustments.otherNonExemptNonWorkIncome = Math.max(0, otherNonExemptNonWorkIncome)
    return { region, contributionGroup, stateMinimum, regionalMinimum, adjustments }
  }, [contributionGroup, otherIncomeKnown, otherNonExemptNonWorkIncome, region, regionalMinimum, stateMinimum])

  const curve = useMemo(() => buildCurve(profile), [profile])
  const detail = useMemo(() => computeBaseProfileIrpf2025Detail(gross, profile), [gross, profile])
  const core = detail.core

  const irpfWithout = useMemo(() => irpfWithoutWorkReduction(detail), [detail])
  const savings = Math.max(0, irpfWithout - core.irpf)

  // Cuanto cuesta realmente haber cruzado el umbral de otras rentas: mismo
  // salario y mismo perfil, pero sin rentas ajenas al trabajo.
  const thresholdCost = useMemo(() => {
    const clean = createEmptyIrpf2025Adjustments()
    const detailClean = computeBaseProfileIrpf2025Detail(gross, { ...profile, adjustments: clean })
    return Math.max(0, core.irpf - detailClean.core.irpf)
  }, [core.irpf, gross, profile])

  // Caso real del usuario, independiente de donde este el slider.
  const realCore = useMemo(
    () => computeBaseProfileIrpf2025Detail(realGross, profile).core,
    [profile, realGross],
  )
  const reductionWithoutOtherIncome = useMemo(
    () =>
      computeBaseProfileIrpf2025Detail(realGross, {
        ...profile,
        adjustments: createEmptyIrpf2025Adjustments(),
      }).core.workReductionApplied,
    [profile, realGross],
  )
  const realBasis = realCore.workReductionBasis
  const realBlocked = realCore.workReductionTheoretical <= 0 && realBasis < REDUCTION_LIMIT
  const realOutOfRange = realBasis >= REDUCTION_LIMIT

  const marginalHere = useMemo(() => {
    const low = computeBaseProfileIrpf2025Detail(gross - MARGINAL_DELTA, profile)
    const high = computeBaseProfileIrpf2025Detail(gross + MARGINAL_DELTA, profile)
    const span = MARGINAL_DELTA * 2
    const irpf = ((high.core.irpf - low.core.irpf) / span) * 100
    const socialSecurity =
      ((high.employeeSocialSecurity - low.employeeSocialSecurity) / span) * 100
    return { irpf, total: irpf + socialSecurity }
  }, [gross, profile])

  const movedFromRealSalary =
    realGrossInSliderRange && initialGrossSalaryAnnual !== undefined && Math.abs(gross - anchorGross) > 1

  const basis = core.workReductionBasis
  // El motor pone la reduccion teorica a cero cuando el umbral de otras rentas
  // la bloquea: en ese caso ningun tramo aplica, aunque el RNT este en rango.
  const reductionBlocked = core.workReductionTheoretical <= 0 && basis < REDUCTION_LIMIT
  const activeTier = reductionBlocked
    ? 0
    : basis >= REDUCTION_LIMIT
      ? 4
      : basis <= TIER_1_TOP
        ? 1
        : basis <= TIER_2_TOP
          ? 2
          : 3

  const humpStart = grossWhereBasisReaches(curve, TIER_1_TOP)
  const humpEnd = grossWhereBasisReaches(curve, REDUCTION_LIMIT)
  const capCrossover =
    curve.filter((point) => point.applied < point.theoretical - 0.5).at(-1)?.gross ?? MIN_GROSS
  const peak = curve.reduce((best, point) => (point.marginalIrpf > best.marginalIrpf ? point : best), curve[0])
  const scaleTopRate = 45

  const reductionScale = useMemo(() => makeScale(MIN_GROSS, MAX_GROSS, 8_000), [])
  const marginalScale = useMemo(() => makeScale(MIN_GROSS, MAX_GROSS, 80), [])
  const visibleCurve = useMemo(
    () => curve.filter((point) => point.gross >= MIN_GROSS && point.gross <= MAX_GROSS),
    [curve],
  )

  const tiers = [
    {
      id: 1,
      title: 'Tramo 1 · plena',
      range: `RNT ≤ ${euro(TIER_1_TOP)}`,
      formula: `${euro(MAX_REDUCTION)} fijos`,
      applied: null,
      tone: 'green' as const,
    },
    {
      id: 2,
      title: 'Tramo 2 · retirada rápida',
      range: `${euro(TIER_1_TOP)} < RNT ≤ ${euro(TIER_2_TOP, 2)}`,
      formula: `${euro(MAX_REDUCTION)} − 1,75 × (RNT − ${euro(TIER_1_TOP)})`,
      applied: `${euro(MAX_REDUCTION)} − 1,75 × ${euro(Math.max(0, basis - TIER_1_TOP))} = ${euro(core.workReductionTheoretical)}` as string | null,
      tone: 'yellow' as const,
    },
    {
      id: 3,
      title: 'Tramo 3 · retirada suave',
      range: `${euro(TIER_2_TOP, 2)} < RNT < ${euro(REDUCTION_LIMIT, 2)}`,
      formula: `${euro(TIER_3_START_AMOUNT, 2)} − 1,14 × (RNT − ${euro(TIER_2_TOP, 2)})`,
      applied: `${euro(TIER_3_START_AMOUNT, 2)} − 1,14 × ${euro(Math.max(0, basis - TIER_2_TOP))} = ${euro(core.workReductionTheoretical)}`,
      tone: 'orange' as const,
    },
    {
      id: 4,
      title: 'Fuera de rango',
      range: `RNT ≥ ${euro(REDUCTION_LIMIT, 2)}`,
      formula: 'Sin reducción',
      applied: null,
      tone: 'muted' as const,
    },
  ]

  const rulerPosition = Math.min(100, (Math.min(basis, REDUCTION_LIMIT) / REDUCTION_LIMIT) * 100)
  const capApplies = core.workReductionApplied < core.workReductionTheoretical - 0.5
  const hasReduction = core.workReductionApplied > 0.5

  return (
    <section className={`wir${embedded ? ' wir--embedded' : ''}`} aria-labelledby="wir-title">
      <div className="wir-shell">
        <header className="wir-header">
          <div>
            <span className="wir-eyebrow">IRPF 2025 · artículo 20 LIRPF</span>
            {embedded ? (
              <h2 id="wir-title">Cómo funciona tu reducción por rendimientos del trabajo</h2>
            ) : (
              <h1 id="wir-title">La reducción por rendimientos del trabajo, y la joroba que crea</h1>
            )}
            <p>
              Es la mayor rebaja del IRPF para sueldos bajos: hasta {euro(MAX_REDUCTION)} que se
              restan del rendimiento del trabajo. Pero se retira tan deprisa que, mientras
              desaparece, cada euro extra de sueldo tributa por encima del tipo máximo de la escala.
            </p>
          </div>
          {/* Empotrado el perfil es el del propio usuario, asi que no hay nada que aclarar. */}
          {embedded ? null : (
            <div className="wir-profile">
              <Info size={16} aria-hidden="true" />
              <p>
                Perfil del simulador: soltero, 40 años, sin hijos, Madrid, grupo de cotización 7 y
                solo rendimientos del trabajo.
              </p>
            </div>
          )}
        </header>

        {realBlocked ? (
          <aside className="wir-callout wir-callout--blocked">
            <TriangleAlert size={20} aria-hidden="true" />
            <div>
              <h3>En tu caso no se aplica: te la bloquean las otras rentas</h3>
              <p>
                {otherIncomeKnown ? (
                  <>
                    Has declarado {euro(otherNonExemptNonWorkIncome)} de otras rentas, por encima
                    del umbral de {euro(OTHER_INCOME_LIMIT)}, así que la reducción cae a cero
                    entera: no se reduce poco a poco, desaparece. Con {euro(realGross)} de bruto te
                    habrían correspondido {euro(reductionWithoutOtherIncome)}.
                  </>
                ) : (
                  <>
                    Hasta que confirmes si tienes otras rentas, la reducción queda en suspenso y los
                    importes asumen que superas el umbral de {euro(OTHER_INCOME_LIMIT)}. Responde a
                    la pregunta de arriba para ver tu caso real.
                  </>
                )}
              </p>
            </div>
          </aside>
        ) : realOutOfRange ? (
          <aside className={`wir-callout${embedded ? ' wir-callout--out-of-range' : ''}`}>
            <CircleSlash size={20} aria-hidden="true" />
            <div>
              <h3>En tu caso no aplica, pero merece la pena entenderla</h3>
              {embedded ? (
                <>
                  <p>
                    Con {euro(realGross)} de bruto tu RNT es de {euro(realBasis)} y supera el límite de{' '}
                    {euro(REDUCTION_LIMIT, 2)}: esta reducción no te resta nada. No hace falta indicar si
                    tienes otros ingresos; con este salario no cambiaría nada.
                  </p>
                  <p>
                    Aun así conviene saber cómo funciona: explica por qué los sueldos bajos apenas pagan
                    IRPF y, sobre todo, por qué entre {euro(humpStart)} y {euro(humpEnd)} de bruto cada euro
                    extra tributa más que en el tramo más alto de la escala.{' '}
                    <strong>Todo lo que hay debajo es un simulador</strong>
                    {realGrossInSliderRange
                      ? ' para explorarlo.'
                      : `, que arranca en ${euro(DEFAULT_SIMULATED_GROSS)} porque tu sueldo se sale de la franja donde ocurre algo.`}
                  </p>
                </>
              ) : (
                <p>
                  Con {euro(realGross)} de bruto tu RNT es de {euro(realBasis)} y supera el límite de{' '}
                  {euro(REDUCTION_LIMIT, 2)}: esta reducción no te resta nada. Aun así explica por qué
                  los sueldos bajos apenas pagan IRPF y, sobre todo, por qué entre {euro(humpStart)} y{' '}
                  {euro(humpEnd)} de bruto cada euro extra tributa más que en el tramo más alto de la
                  escala. <strong>Todo lo que hay debajo es un simulador</strong>
                  {realGrossInSliderRange
                    ? '.'
                    : `, que arranca en ${euro(DEFAULT_SIMULATED_GROSS)} porque tu sueldo se sale de la franja donde ocurre algo.`}
                </p>
              )}
            </div>
          </aside>
        ) : null}

        {/* ── Simulador ── */}
        <section className="wir-panel wir-sim" aria-labelledby="wir-sim-title">
          <div className="wir-panel__title">
            <Calculator size={20} aria-hidden="true" />
            <h3 id="wir-sim-title">{embedded ? 'Prueba con otro salario' : 'Juega con el salario'}</h3>
            {movedFromRealSalary ? (
              <button type="button" className="wir-reset" onClick={() => setGross(anchorGross)}>
                <RotateCcw size={14} aria-hidden="true" />
                Volver a tu salario ({euro(anchorGross)})
              </button>
            ) : null}
          </div>

          <SalarySlider
            value={gross}
            onChange={setGross}
            min={MIN_GROSS}
            max={MAX_GROSS}
            step={100}
            markers={[10_000, 14_000, 18_000, 24_000, MAX_GROSS]}
            unitLabel="brutos al año"
            id="wir-salary"
            ariaLabel="Salario bruto anual para el simulador de la reducción"
          />

          <div className="wir-kpis">
            <article className="wir-kpi wir-kpi--blue">
              <span>RNT (base del artículo 20)</span>
              <strong>{euro(basis)}</strong>
              <small>Bruto − cotizaciones, sin restar los {euro(2_000)}</small>
            </article>
            <article className={`wir-kpi wir-kpi--${hasReduction ? 'green' : 'muted'}`}>
              <span>Reducción aplicada</span>
              <strong>{euro(core.workReductionApplied)}</strong>
              <small>
                {reductionBlocked
                  ? 'Bloqueada por otras rentas'
                  : activeTier === 4
                    ? 'Fuera de rango'
                    : `Tramo ${activeTier}`}
              </small>
            </article>
            <article className="wir-kpi wir-kpi--purple">
              <span>Te ahorra en IRPF</span>
              <strong>{euro(savings)}</strong>
              <small>{euro(irpfWithout)} sin reducción vs {euro(core.irpf)} con ella</small>
            </article>
            <article className={`wir-kpi wir-kpi--${marginalHere.total >= 50 ? 'red' : 'orange'}`}>
              <span>De 100 € más de sueldo te quedan</span>
              <strong>{euro(Math.max(0, 100 - marginalHere.total))}</strong>
              <small>Tipo marginal {percent(marginalHere.total)} (IRPF + cotizaciones)</small>
            </article>
          </div>
        </section>

        {/* ── Cadena de calculo ── */}
        <section className="wir-panel" aria-labelledby="wir-chain-title">
          <div className="wir-panel__title">
            <Layers size={20} aria-hidden="true" />
            <h3 id="wir-chain-title">De dónde sale el número</h3>
          </div>

          <ol className="wir-chain">
            <li>
              <span>Salario bruto</span>
              <strong>{euro(gross)}</strong>
            </li>
            <li className="is-minus">
              <span>− Cotizaciones y gastos del art. 19.2 a)–e)</span>
              <strong>−{euro(detail.employeeSocialSecurity)}</strong>
            </li>
            <li className="is-key">
              <span>= RNT que elige el tramo</span>
              <strong>{euro(basis)}</strong>
            </li>
            <li className="is-minus">
              <span>− «Otros gastos» del art. 19.2 f)</span>
              <strong>−{euro(core.article19OtherExpensesApplied)}</strong>
            </li>
            <li>
              <span>= Rendimiento neto del trabajo</span>
              <strong>{euro(core.netWorkIncome)}</strong>
            </li>
            <li className="is-minus">
              <span>− Reducción del artículo 20</span>
              <strong>−{euro(core.workReductionApplied)}</strong>
            </li>
            <li className="is-total">
              <span>= Rendimiento neto reducido</span>
              <strong>{euro(core.netReducedWorkIncome)}</strong>
            </li>
          </ol>

          {capApplies ? (
            <aside className="wir-note wir-note--info">
              <Info size={18} aria-hidden="true" />
              <p>
                Con este sueldo la reducción teórica sería {euro(core.workReductionTheoretical)},
                pero la ley prohíbe que el saldo quede negativo: se aplica solo{' '}
                {euro(core.workReductionApplied)}, justo hasta dejar el rendimiento en cero.
              </p>
            </aside>
          ) : null}
        </section>

        {/* ── Tramos ── */}
        <section className="wir-panel" aria-labelledby="wir-tiers-title">
          <div className="wir-panel__title">
            <ChevronsDownUp size={20} aria-hidden="true" />
            <h3 id="wir-tiers-title">Los tres tramos de la fórmula</h3>
          </div>

          <div className="wir-ruler" aria-hidden="true">
            <span className="wir-ruler__seg wir-ruler__seg--green" style={{ flexGrow: TIER_1_TOP }} />
            <span
              className="wir-ruler__seg wir-ruler__seg--yellow"
              style={{ flexGrow: TIER_2_TOP - TIER_1_TOP }}
            />
            <span
              className="wir-ruler__seg wir-ruler__seg--orange"
              style={{ flexGrow: REDUCTION_LIMIT - TIER_2_TOP }}
            />
            <span className="wir-ruler__handle" style={{ left: `${rulerPosition}%` }} />
          </div>
          <div className="wir-ruler__labels" aria-hidden="true">
            <span style={{ left: '0%' }}>0 €</span>
            <span style={{ left: `${(TIER_1_TOP / REDUCTION_LIMIT) * 100}%` }}>{euro(TIER_1_TOP)}</span>
            <span style={{ left: `${(TIER_2_TOP / REDUCTION_LIMIT) * 100}%` }}>{euro(TIER_2_TOP, 2)}</span>
            <span style={{ left: '100%' }}>{euro(REDUCTION_LIMIT, 2)}</span>
          </div>

          {reductionBlocked ? (
            <p className="wir-tiers-blocked">
              Con tus respuestas actuales ninguno de estos tramos se aplica: el umbral de otras
              rentas deja la reducción en cero sea cual sea tu RNT.
            </p>
          ) : null}

          <div className="wir-tiers">
            {tiers.map((tier) => {
              const isActive = tier.id === activeTier
              return (
                <article
                  key={tier.id}
                  className={`wir-tier wir-tier--${isActive ? tier.tone : 'off'}${isActive ? ' is-active' : ''}`}
                >
                  <header>
                    <h4>{tier.title}</h4>
                    {isActive ? <span className="wir-tier__badge">Tu tramo</span> : null}
                  </header>
                  <p className="wir-tier__range">{tier.range}</p>
                  <p className="wir-tier__formula">{tier.formula}</p>
                  {isActive && tier.applied ? <p className="wir-tier__applied">{tier.applied}</p> : null}
                </article>
              )
            })}
          </div>

          <p className="wir-footnote">
            Los tres tramos encajan sin saltos: en {euro(TIER_1_TOP)} valen {euro(MAX_REDUCTION)},
            en {euro(TIER_2_TOP, 2)} valen {euro(TIER_3_START_AMOUNT, 2)} y en{' '}
            {euro(REDUCTION_LIMIT, 2)} valen exactamente cero. La pendiente sí cambia: primero se
            retira {TIER_2_SLOPE} € por cada euro y luego {TIER_3_SLOPE} €.
          </p>
        </section>

        {/* ── Grafico 1: la reduccion ── */}
        <section className="wir-panel" aria-labelledby="wir-curve-title">
          <div className="wir-panel__title">
            <TrendingDown size={20} aria-hidden="true" />
            <h3 id="wir-curve-title">Cómo se apaga la reducción al subir el sueldo</h3>
          </div>

          <ul className="wir-legend">
            <li><i className="wir-dot wir-dot--green" />Reducción aplicada</li>
            <li><i className="wir-dot wir-dot--dashed" />Reducción teórica (antes del tope de saldo)</li>
          </ul>

          <ChartFrame
            scale={reductionScale}
            xMin={MIN_GROSS}
            xMax={MAX_GROSS}
            yMax={8_000}
            yTicks={[0, 2_000, 4_000, 6_000, 8_000]}
            formatY={(value) => `${value / 1_000}k€`}
            label="Reducción por rendimientos del trabajo según el salario bruto anual"
          >
            <rect
              className="wir-chart__band wir-chart__band--warn"
              x={reductionScale.x(humpStart)}
              width={Math.max(0, reductionScale.x(humpEnd) - reductionScale.x(humpStart))}
              y={PAD_TOP}
              height={CHART_HEIGHT - PAD_TOP - PAD_BOTTOM}
            />
            <path
              className="wir-chart__area wir-chart__area--green"
              d={areaPath(visibleCurve, reductionScale, (point) => point.applied)}
            />
            <path
              className="wir-chart__line wir-chart__line--dashed"
              d={linePath(visibleCurve, reductionScale, (point) => point.theoretical)}
            />
            <path
              className="wir-chart__line wir-chart__line--green"
              d={linePath(visibleCurve, reductionScale, (point) => point.applied)}
            />
            <circle
              className="wir-chart__point"
              cx={reductionScale.x(Math.min(Math.max(gross, MIN_GROSS), MAX_GROSS))}
              cy={reductionScale.y(core.workReductionApplied)}
              r={5}
            />
            <CurrentMarker
              scale={reductionScale}
              gross={Math.min(Math.max(gross, MIN_GROSS), MAX_GROSS)}
              caption={`${euro(gross)} → ${euro(core.workReductionApplied)}`}
            />
          </ChartFrame>

          <p className="wir-footnote">
            La banda sombreada es la zona de retirada: entre {euro(humpStart)} y {euro(humpEnd)} de
            bruto, la reducción cae desde {euro(MAX_REDUCTION)} hasta cero. A la izquierda, por
            debajo de {euro(capCrossover)}, la línea verde se despega de la discontinua: la
            reducción teórica sigue siendo {euro(MAX_REDUCTION)} pero solo se aplica hasta dejar el
            rendimiento en cero. La deducción de 340 € de 2025 no aparece aquí porque se resta de
            la cuota, no de la base.
          </p>
        </section>

        {/* ── Grafico 2: la joroba ── */}
        <section className="wir-panel wir-panel--hump" aria-labelledby="wir-hump-title">
          <div className="wir-panel__title">
            <Percent size={20} aria-hidden="true" />
            <h3 id="wir-hump-title">La joroba del IRPF</h3>
          </div>

          <div className="wir-hump-copy">
            <p>
              Cuando ganas un euro más, no solo tributa ese euro: además <strong>pierdes parte de
              la reducción</strong>. En el tramo 2 pierdes 1,75 € de reducción por cada euro de RNT,
              así que la base imponible sube unos 2,75 € por cada euro de RNT ganado. El tipo
              marginal se multiplica.
            </p>
            <p>
              Y hasta {euro(18_276)} de bruto se suma un segundo efecto: la deducción de 340 € de
              2025 también se retira, a razón de 0,20 € por euro. Los dos desmontajes coinciden y
              producen el pico.
            </p>
            <p className="wir-hump-punch">
              Resultado: un sueldo de {euro(peak.gross)} soporta un tipo marginal de{' '}
              <strong>{percent(peak.marginalIrpf)}</strong> solo de IRPF — más que el{' '}
              {percent(scaleTopRate, 0)} que paga el tramo más alto de la escala. Y en cuanto la
              reducción se agota, el marginal se <em>desploma</em>.
            </p>
          </div>

          <ul className="wir-legend">
            <li><i className="wir-dot wir-dot--red" />Tipo marginal (IRPF + cotizaciones)</li>
            <li><i className="wir-dot wir-dot--blue" />Tipo medio (IRPF ÷ bruto)</li>
          </ul>
          <p className="wir-chart-hint">Pasa el ratón por el gráfico para ver el tipo de cada sueldo.</p>

          <ChartFrame
            scale={marginalScale}
            xMin={MIN_GROSS}
            xMax={MAX_GROSS}
            yMax={80}
            yTicks={[0, 20, 40, 60, 80]}
            formatY={(value) => `${value} %`}
            label="Tipo marginal y tipo medio según el salario bruto anual"
          >
            <rect
              className="wir-chart__band wir-chart__band--warn"
              x={marginalScale.x(humpStart)}
              width={Math.max(0, marginalScale.x(humpEnd) - marginalScale.x(humpStart))}
              y={PAD_TOP}
              height={CHART_HEIGHT - PAD_TOP - PAD_BOTTOM}
            />
            <line
              className="wir-chart__reference"
              x1={PAD_LEFT}
              x2={CHART_WIDTH - PAD_RIGHT}
              y1={marginalScale.y(scaleTopRate)}
              y2={marginalScale.y(scaleTopRate)}
            />
            <text
              className="wir-chart__reference-label"
              x={CHART_WIDTH - PAD_RIGHT - 4}
              y={marginalScale.y(scaleTopRate) - 6}
              textAnchor="end"
            >
              45 % · tipo máximo de la escala estatal + autonómica
            </text>
            <path
              className="wir-chart__area wir-chart__area--red"
              d={areaPath(visibleCurve, marginalScale, (point) => point.marginalTotal)}
            />
            <path
              className="wir-chart__line wir-chart__line--red"
              d={linePath(visibleCurve, marginalScale, (point) => point.marginalTotal)}
            />
            <path
              className="wir-chart__line wir-chart__line--blue"
              d={linePath(visibleCurve, marginalScale, (point) => point.averageIrpf)}
            />
            <circle
              className="wir-chart__point"
              cx={marginalScale.x(Math.min(Math.max(gross, MIN_GROSS), MAX_GROSS))}
              cy={marginalScale.y(Math.min(80, marginalHere.total))}
              r={5}
            />
            {/* La guia del raton sustituye a la del slider mientras se explora. */}
            {hoveredMarginal ? null : (
              <CurrentMarker
                scale={marginalScale}
                gross={Math.min(Math.max(gross, MIN_GROSS), MAX_GROSS)}
                caption={percent(marginalHere.total)}
              />
            )}
            <ChartHoverLayer
              points={visibleCurve}
              scale={marginalScale}
              xMin={MIN_GROSS}
              xMax={MAX_GROSS}
              hovered={hoveredMarginal}
              onHover={setHoveredMarginal}
              rows={(point) => [
                {
                  label: 'Marginal (IRPF + SS)',
                  value: point.marginalTotal,
                  tone: 'red',
                  plotted: true,
                },
                { label: 'Marginal solo IRPF', value: point.marginalIrpf, tone: 'plain' },
                { label: 'Tipo medio', value: point.averageIrpf, tone: 'blue', plotted: true },
              ]}
            />
          </ChartFrame>

          <p className="wir-footnote">
            Fíjate en la línea azul: el tipo <em>medio</em> nunca deja de ser bajo. La joroba es un
            fenómeno del tipo <em>marginal</em>, es decir, de lo que te cuesta el siguiente euro —
            no de lo que pagas sobre el total. Por eso subir de sueldo siempre compensa en neto,
            aunque en esta franja compense mucho menos de lo que parece.
          </p>
        </section>

        {/* ── Avisos ── */}
        <section className="wir-panel" aria-labelledby="wir-traps-title">
          <div className="wir-panel__title">
            <AlertTriangle size={20} aria-hidden="true" />
            <h3 id="wir-traps-title">Tres detalles que cambian el resultado</h3>
          </div>

          <div className="wir-traps">
            <article className="wir-trap wir-trap--red">
              <h4>El escalón de los 6.500 €</h4>
              <p>
                Si tus rentas no exentas distintas del trabajo superan {euro(OTHER_INCOME_LIMIT)},
                la reducción no cae poco a poco: <strong>desaparece entera</strong>.{' '}
                {hasReduction ? (
                  <>
                    Con tu sueldo actual, pasar de {euro(OTHER_INCOME_LIMIT)} a{' '}
                    {euro(OTHER_INCOME_LIMIT + 1)} de otras rentas te costaría{' '}
                    <strong>{euro(savings)}</strong> más de IRPF. Es un auténtico error de salto:
                    ganar 1 € puede dejarte con menos dinero.
                  </>
                ) : reductionBlocked ? (
                  <>
                    Es justo lo que te está pasando: por superar el umbral has perdido la reducción
                    entera, y eso te cuesta <strong>{euro(thresholdCost)}</strong> más de IRPF que
                    si esas rentas no existieran.
                  </>
                ) : (
                  <>
                    Con tu sueldo actual ya no queda reducción por el nivel de RNT, así que el
                    umbral no cambia nada. Para quien está en el tramo 1 sí es un error de salto de
                    libro: se pierden los {euro(MAX_REDUCTION)} de golpe por ganar 1 € de más.
                  </>
                )}
              </p>
            </article>
            <article className="wir-trap wir-trap--yellow">
              <h4>Cuotas sindicales y colegiales adelantan el tramo</h4>
              <p>
                Las cuotas a sindicatos y colegios obligatorios (máximo {euro(500)}) y la defensa
                jurídica (máximo {euro(300)}) se restan <em>antes</em> de elegir tramo, así que
                bajan el RNT y pueden aumentar la reducción. Los {euro(2_000)} de «otros gastos»,
                la movilidad geográfica y el incremento por discapacidad, no.
              </p>
            </article>
            <article className="wir-trap wir-trap--blue">
              <h4>La reducción no es una devolución</h4>
              <p>
                {hasReduction ? (
                  <>
                    Resta {euro(core.workReductionApplied)} de la <em>base</em>, no de la cuota. Lo
                    que te ahorra de verdad son <strong>{euro(savings)}</strong>: la reducción
                    multiplicada por el tipo marginal que te habría tocado.
                  </>
                ) : (
                  <>
                    Se resta de la <em>base</em>, no de la cuota. Por eso el ahorro real nunca es la
                    reducción entera, sino la reducción multiplicada por el tipo marginal que te
                    habría tocado.
                  </>
                )}{' '}
                La deducción de 340 € de 2025, en cambio, sí se resta directamente de la cuota.
              </p>
            </article>
          </div>
        </section>
      </div>
    </section>
  )
}
