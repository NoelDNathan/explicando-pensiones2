import {
  Calculator,
  Info,
  Lightbulb,
  PenLine,
  Percent,
  Receipt,
  RotateCcw,
  WalletCards,
} from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TooltipProps } from 'recharts'
import { InfoButton } from '../ui/InfoButton'
import { useFiscalVariant } from '../fiscal-worker-dashboard/fiscalVariant'
import { clampNumber, formatEuro, formatNumber } from './workerTaxesFormat'
import { EscHundredCells } from './escenario/EscenarioParts'
import './WorkerTaxStepShell.css'
import './WorkerConsumptionTaxesCard.css'

type ConsumptionTaxTone = 'green' | 'blue' | 'cyan' | 'orange' | 'purple' | 'red' | 'neutral'

export type ConsumptionTaxCategory = {
  id: string
  label: string
  initialSharePercent: number
  vatRate: number
  specialRate?: number
  statutoryLabel: string
  tone: ConsumptionTaxTone
  note?: string
  help?: string
}

export type ConsumptionTaxLine = ConsumptionTaxCategory & {
  sharePercent: number
  spendAnnual: number
  vatAnnual: number
  specialAnnual: number
  taxAnnual: number
}

export type ConsumptionTaxesResult = {
  lines: ConsumptionTaxLine[]
  assignedSpendAnnual: number
  totalBudgetAnnual: number
  totalSharePercent: number
  vatAnnual: number
  specialTaxesAnnual: number
  /** IVA + impuestos especiales del gasto. El IBI y el IVTM viven en el paso siguiente. */
  totalTaxAnnual: number
  effectiveRate: number
}

export interface ConsumptionTaxesDraft {
  budgetAnnual: number
  sharePercents: Record<string, number>
}

type WorkerConsumptionTaxesCardProps = {
  categories?: ConsumptionTaxCategory[]
  initialBudgetAnnual?: number
  initialDraft?: ConsumptionTaxesDraft | null
  /** `once` muestra el dialogo de valores medios solo la primera vez. */
  introChoiceMode?: 'once' | 'off'
  onResultChange?: (result: ConsumptionTaxesResult) => void
  onDraftChange?: (draft: ConsumptionTaxesDraft) => void
}

export type ConsumptionTaxesIntroChoice = 'average' | 'manual'

const INTRO_STORAGE_KEY = 'explicando-pensiones.wctc-iva-intro-seen'

function readIntroChoice(): ConsumptionTaxesIntroChoice | null {
  try {
    const stored = window.localStorage.getItem(INTRO_STORAGE_KEY)
    if (stored === 'average' || stored === 'manual') return stored
    if (stored === '1') return 'manual'
    return null
  } catch {
    return null
  }
}

function markIvaIntroChoice(choice: ConsumptionTaxesIntroChoice) {
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, choice)
  } catch {
    // modo privado o cuota: el dialogo puede volver a salir
  }
}

type ConsumptionTaxesIntroDialogProps = {
  open: boolean
  onChoose: (choice: ConsumptionTaxesIntroChoice) => void
}

export function ConsumptionTaxesIntroDialog({
  open,
  onChoose,
}: ConsumptionTaxesIntroDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const firstChoiceRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    firstChoiceRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onChoose('manual')
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onChoose])

  if (!open) return null

  return (
    <div className="wctc-intro-layer" role="presentation">
      <div className="wctc-intro-backdrop" />
      <section
        className="wctc-intro-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="wctc-intro-header">
          <span className="wctc-intro-icon" aria-hidden="true">
            <Receipt size={26} strokeWidth={2.1} />
          </span>
          <div>
            <h2 id={titleId}>¿Cómo quieres rellenar el IVA?</h2>
            <p id={descriptionId}>
            Ahora vamos a calcular cuánto pagas de IVA. Puedes utilizar los valores por defecto, basados en el gasto medio de una persona en España, o introducir tus propios gastos manualmente para obtener una estimación más ajustada a ti.
            </p>
          </div>
        </header>

        <div className="wctc-intro-choices">
          <button
            ref={firstChoiceRef}
            type="button"
            className="wctc-intro-choice wctc-intro-choice--average"
            onClick={() => onChoose('average')}
          >
            <span>
              <strong>Usar valores medios</strong>
              <small>
                Rellena cada categoría con un porcentaje orientativo del gasto
                medio en España. Luego puedes ajustarlo.
              </small>
            </span>
          </button>

          <button
            type="button"
            className="wctc-intro-choice"
            onClick={() => onChoose('manual')}
          >
            <PenLine size={22} aria-hidden="true" />
            <span>
              <strong>Rellenarlos yo</strong>
              <small>
                Abre la app de tu banco. Según el banco, suele haber un resumen
                de gasto por categorías (alimentación, ocio, transporte…)
                para copiar importe y %.
              </small>
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}

const DEFAULT_BUDGET_ANNUAL = 28145.92

const DEFAULT_CATEGORIES: ConsumptionTaxCategory[] = [
  {
    id: 'saving',
    label: 'Ahorro / inversión',
    initialSharePercent: 0,
    vatRate: 0,
    statutoryLabel: '0% ahora',
    tone: 'green',
    help: 'No es consumo corriente ni deuda: aquí va el dinero que reservas en lugar de gastarlo ya. Depósitos, fondos, acciones, aportaciones a pensiones privadas... No paga IVA al guardarlo, pero lo que luego compres con ese dinero sí tributará en su categoría.',
  },
  {
    id: 'mortgage-debt',
    label: 'Hipoteca / deudas',
    initialSharePercent: 0,
    vatRate: 0,
    statutoryLabel: '0% en la cuota',
    tone: 'neutral',
    note: 'En el paso 9 puedes estimar el IVA o ITP pagado al comprar.',
    help: 'No lo sumamos aquí. Esta calculadora estima el IVA que pagas ahora, cada mes. La cuota de hipoteca o préstamo no lleva IVA: estás devolviendo dinero, no comprando otra vez. El IVA o el ITP ya se pagó al adquirir (IVA si era nuevo; ITP si era de segunda mano) y no se reparte entre las cuotas, porque fue un pago único de entonces. El alquiler de vivienda habitual tampoco lleva IVA. El impuesto recurrente de la vivienda en propiedad es el IBI, que estimamos en el paso 8.',
  },
  {
    id: 'basic-food',
    label: 'Alimentación básica',
    initialSharePercent: 0,
    vatRate: 4,
    statutoryLabel: '4%',
    tone: 'green',
    help: 'La frontera legal del IVA (4 % vs 10 %) no es obvia. Básica: pan, leche, huevos, fruta/verdura fresca, etc. General: resto de comida del supermercado no incluida en la básica.',
  },
  {
    id: 'general-food',
    label: 'Alimentación general',
    initialSharePercent: 0,
    vatRate: 10,
    statutoryLabel: '10%',
    tone: 'orange',
    help: 'La frontera legal del IVA (4 % vs 10 %) no es obvia. Básica: pan, leche, huevos, fruta/verdura fresca, etc. General: resto de comida del supermercado no incluida en la básica.',
  },
  {
    id: 'restaurants',
    label: 'Restaurantes / delivery',
    initialSharePercent: 0,
    vatRate: 10,
    statutoryLabel: '10%',
    tone: 'orange',
    help: 'Comidas fuera de casa y delivery. Puede solaparse con alimentación general si compras comida preparada para llevar; aquí va lo que consumes en restaurante o te lo traen a domicilio.',
  },
  {
    id: 'shopping',
    label: 'Compras generales',
    initialSharePercent: 0,
    vatRate: 21,
    statutoryLabel: '21%',
    tone: 'blue',
    help: 'Es el cajón de sastre del 21 %. Ropa, electrónica, muebles, higiene no farmacéutica, etc. Lo que no encaje en otra fila.',
  },
  {
    id: 'leisure',
    label: 'Ocio / suscripciones *',
    initialSharePercent: 0,
    vatRate: 21,
    statutoryLabel: '21%',
    tone: 'purple',
    note: 'Algunos servicios de ocio o cultura pueden tributar al 10%.',
    help: 'Streaming, gimnasio, cine, videojuegos... Por defecto 21 %; algunos servicios culturales/de ocio pueden ir al 10 %.',
  },
  { id: 'public-transport', label: 'Transporte público', initialSharePercent: 0, vatRate: 10, statutoryLabel: '10%', tone: 'green' },
  {
    id: 'fuel',
    label: 'Gasolina',
    initialSharePercent: 0,
    vatRate: 21,
    specialRate: 20,
    statutoryLabel: '21% + 20%',
    tone: 'orange',
    note: 'En el paso 9 puedes estimar el IVTM anual y el impuesto de la compra.',
    help: 'El tipo 21 % + 20 % mezcla IVA e impuesto especial sobre hidrocarburos. El segundo no es IVA: es un tributo distinto que se suma al precio en surtidor.',
  },
  {
    id: 'electricity',
    label: 'Electricidad',
    initialSharePercent: 0,
    vatRate: 21,
    specialRate: 5.11,
    statutoryLabel: '21% + 5,11%',
    tone: 'cyan',
    help: 'El 21 % + 5,11 % combina IVA e impuesto especial sobre la electricidad. Esta fila no incluye gas, agua u otros suministros si no los has repartido en otra categoría.',
  },
  {
    id: 'health',
    label: 'Salud / farmacia *',
    initialSharePercent: 0,
    vatRate: 0,
    statutoryLabel: '0%',
    tone: 'cyan',
    note: 'Según el caso, algunos productos o servicios pueden tributar a tipos superiores, incluso al 21%.',
    help: 'Medicamentos con receta y productos sanitarios básicos suelen ir al 0 % o tipos reducidos; otros productos de farmacia/parafarmacia (cosmética, óptica...) pueden ir al 21 %.',
  },
  {
    id: 'tobacco',
    label: 'Tabaco',
    initialSharePercent: 0,
    vatRate: 21,
    specialRate: 55,
    statutoryLabel: '21% + 55%',
    tone: 'red',
    help: 'Cigarrillos, tabaco de liar y productos derivados del tabaco. El 21 % + 55 % combina IVA e impuesto especial: el segundo no es IVA y pesa mucho en el precio final.',
  },
  {
    id: 'alcohol',
    label: 'Alcohol',
    initialSharePercent: 0,
    vatRate: 21,
    specialRate: 5,
    statutoryLabel: '21% + 5%',
    tone: 'orange',
    help: 'Bebidas alcohólicas: cerveza, vino, licores, etc. El 21 % + 5 % mezcla IVA e impuesto especial sobre el alcohol; el tipo especial varía según producto, aquí usamos una cifra orientativa.',
  },
]

/** Reparto orientativo (% del gasto) inspirado en patron medio espanol: vivienda ~34 %, alimentacion ~22 %, transporte ~9 %, etc. */
const AVERAGE_SPAIN_SHARE_PRESETS: Record<string, number> = {
  saving: 8,
  'mortgage-debt': 34,
  'basic-food': 7,
  'general-food': 10,
  restaurants: 5,
  shopping: 11,
  leisure: 7,
  'public-transport': 4,
  fuel: 5,
  electricity: 4,
  health: 3,
  tobacco: 0.5,
  alcohol: 1.5,
}

type SpendChartSlice = {
  id: string
  name: string
  sharePercent: number
  amountMonthly: number
  color: string
}

function getCategoryChartColor(categoryId: string) {
  return `var(--wctc-chart-${categoryId})`
}

type SpendDonutTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    payload?: SpendChartSlice
  }>
}

function SpendDonutTooltip({ active, payload }: SpendDonutTooltipProps) {
  const slice = payload?.[0]?.payload
  if (!active || !slice) return null

  return (
    <div className="wctc-spend-chart__tooltip" role="status">
      <strong>{slice.name}</strong>
      <span>{formatNumber(slice.sharePercent)} % del gasto</span>
      <span>{formatEuro(slice.amountMonthly)} / mes</span>
    </div>
  )
}

type ConsumptionSpendDonutProps = {
  lines: ConsumptionTaxLine[]
  monthlyTotal: number
}

function ConsumptionSpendDonut({ lines, monthlyTotal }: ConsumptionSpendDonutProps) {
  const variant = useFiscalVariant()
  const slices = useMemo<SpendChartSlice[]>(() => (
    lines
      .filter((line) => line.sharePercent > 0.005)
      .map((line) => ({
        id: line.id,
        name: line.label.replace(/\s*\*$/, '').trim(),
        sharePercent: line.sharePercent,
        amountMonthly: line.spendAnnual / 12,
        color: getCategoryChartColor(line.id),
      }))
  ), [lines])

  const chartSummary = slices.length > 0
    ? slices.map((slice) => `${slice.name}: ${formatNumber(slice.sharePercent)} %`).join('; ')
    : 'Sin gasto asignado'

  if (slices.length === 0) {
    return (
      <figure className="wctc-spend-chart wctc-spend-chart--empty" aria-label={chartSummary}>
        <figcaption className="wctc-spend-chart__title">Distribución del gasto</figcaption>
        <p>Asigna importe o porcentaje a las categorías para ver el reparto.</p>
      </figure>
    )
  }

  return (
    <figure className="wctc-spend-chart" aria-label={`Distribución del gasto. ${chartSummary}`}>
      <figcaption className="wctc-spend-chart__title">Distribución del gasto</figcaption>
      <div className="wctc-spend-chart__body">
        <div className="wctc-spend-chart__viz">
          {variant === 'escenario' ? (
            <EscHundredCells
              parts={lines
                .filter((line) => line.sharePercent > 0.005)
                .map((line) => ({
                  value: line.sharePercent,
                  tone: line.specialRate
                    ? 'state' as const
                    : line.vatRate >= 21
                      ? 'company' as const
                      : line.vatRate >= 10
                        ? 'worker' as const
                        : 'positive' as const,
                }))}
              label={`Distribución del gasto: ${slices.map((slice) => `${formatNumber(slice.sharePercent)} % en ${slice.name}`).join(', ')}`}
              caption={<span>Las casillas agrupan tu gasto por el tipo de IVA aplicable.</span>}
            />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="sharePercent"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="56%"
                outerRadius="84%"
                paddingAngle={slices.length > 1 ? 1.5 : 0}
                strokeWidth={2}
                stroke="transparent"
              >
                {slices.map((slice) => (
                  <Cell key={slice.id} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip content={<SpendDonutTooltip />} />
            </PieChart>
            </ResponsiveContainer>
          )}
          <div className="wctc-spend-chart__center" aria-hidden="true">
            <strong>{formatEuro(monthlyTotal)}</strong>
            <span>al mes</span>
          </div>
        </div>

        <ul className="wctc-spend-chart__legend">
          {slices.map((slice) => (
            <li key={slice.id}>
              <span
                className="wctc-spend-chart__swatch"
                style={{ background: slice.color, boxShadow: `0 0 10px color-mix(in srgb, ${slice.color} 45%, transparent)` }}
                aria-hidden="true"
              />
              <span className="wctc-spend-chart__legend-label">{slice.name}</span>
              <span className="wctc-spend-chart__legend-value">{formatNumber(slice.sharePercent)} %</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

function getAverageConsumptionTaxRate(
  lines: ConsumptionTaxLine[],
  assignedSpendAnnual: number,
  vatAnnual: number,
  specialTaxesAnnual: number,
) {
  if (assignedSpendAnnual > 0) {
    return ((vatAnnual + specialTaxesAnnual) / assignedSpendAnnual) * 100
  }

  const totalSharePercent = lines.reduce((total, line) => total + line.sharePercent, 0)
  if (totalSharePercent <= 0) return 0

  return lines.reduce(
    (total, line) => total + line.sharePercent * (line.vatRate + (line.specialRate ?? 0)),
    0,
  ) / totalSharePercent
}

export function WorkerConsumptionTaxesCard({
  categories = DEFAULT_CATEGORIES,
  initialBudgetAnnual = DEFAULT_BUDGET_ANNUAL,
  initialDraft = null,
  introChoiceMode = 'once',
  onResultChange,
  onDraftChange,
}: WorkerConsumptionTaxesCardProps) {
  const storedIntroChoice = introChoiceMode === 'once' ? readIntroChoice() : null
  const [budgetAnnual, setBudgetAnnual] = useState(
    initialDraft?.budgetAnnual ?? initialBudgetAnnual,
  )
  const [shares, setShares] = useState(() =>
    categories.map((category) => ({
      ...category,
      sharePercent: initialDraft?.sharePercents[category.id]
        ?? (storedIntroChoice === 'average'
          ? AVERAGE_SPAIN_SHARE_PRESETS[category.id] ?? 0
          : category.initialSharePercent),
    })),
  )
  const [introOpen, setIntroOpen] = useState(() => (
    introChoiceMode === 'once' && storedIntroChoice === null && initialDraft === null
  ))

  useEffect(() => {
    if (initialDraft) return
    setBudgetAnnual(initialBudgetAnnual)
  }, [initialBudgetAnnual, initialDraft])

  const result = useMemo<ConsumptionTaxesResult>(() => {
    const lines = shares.map((row) => {
      const spendAnnual = budgetAnnual * (row.sharePercent / 100)
      const vatAnnual = spendAnnual * (row.vatRate / 100)
      const specialAnnual = spendAnnual * ((row.specialRate ?? 0) / 100)

      return {
        ...row,
        spendAnnual,
        vatAnnual,
        specialAnnual,
        taxAnnual: vatAnnual + specialAnnual,
      }
    })
    const assignedSpendAnnual = lines.reduce((total, line) => total + line.spendAnnual, 0)
    const totalSharePercent = lines.reduce((total, line) => total + line.sharePercent, 0)
    const vatAnnual = lines.reduce((total, line) => total + line.vatAnnual, 0)
    const specialTaxesAnnual = lines.reduce((total, line) => total + line.specialAnnual, 0)
    const totalTaxAnnual = vatAnnual + specialTaxesAnnual

    return {
      lines,
      assignedSpendAnnual,
      totalBudgetAnnual: budgetAnnual,
      totalSharePercent,
      vatAnnual,
      specialTaxesAnnual,
      totalTaxAnnual,
      effectiveRate: assignedSpendAnnual > 0 ? (totalTaxAnnual / assignedSpendAnnual) * 100 : 0,
    }
  }, [budgetAnnual, shares])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  useEffect(() => {
    onDraftChange?.({
      budgetAnnual,
      sharePercents: Object.fromEntries(shares.map((row) => [row.id, row.sharePercent])),
    })
  }, [budgetAnnual, onDraftChange, shares])

  function updateShare(id: string, nextSharePercent: number) {
    setShares((current) =>
      current.map((row) => (
        row.id === id ? { ...row, sharePercent: clampNumber(nextSharePercent, 0, 100) } : row
      )),
    )
  }

  function updateAmount(id: string, nextMonthlyAmount: number) {
    const budgetMonthly = budgetAnnual / 12
    const sharePercent = budgetMonthly > 0
      ? (clampNumber(nextMonthlyAmount, 0, budgetMonthly) / budgetMonthly) * 100
      : 0
    updateShare(id, sharePercent)
  }

  function applyAverageSharePresets() {
    setShares((current) =>
      current.map((row) => ({
        ...row,
        sharePercent: AVERAGE_SPAIN_SHARE_PRESETS[row.id] ?? 0,
      })),
    )
  }

  function resetShares() {
    setShares(
      categories.map((category) => ({
        ...category,
        sharePercent: category.initialSharePercent,
      })),
    )
  }

  const handleIntroChoice = useCallback((choice: ConsumptionTaxesIntroChoice) => {
    if (choice === 'average') {
      setShares((current) =>
        current.map((row) => ({
          ...row,
          sharePercent: AVERAGE_SPAIN_SHARE_PRESETS[row.id] ?? 0,
        })),
      )
    }
    if (introChoiceMode === 'once') markIvaIntroChoice(choice)
    setIntroOpen(false)
  }, [introChoiceMode])

  const maxLineAmount = Math.max(...result.lines.map((line) => line.spendAnnual), 1)
  const toMonthly = (value: number) => value / 12
  const totalStatus = Math.abs(result.totalSharePercent - 100) <= 0.05 ? 'ok' : 'warn'
  const shareDifference = 100 - result.totalSharePercent
  const shareGapPercent = Math.abs(shareDifference)
  const amountGapMonthly = toMonthly(budgetAnnual * shareGapPercent / 100)
  const averageConsumptionTaxRate = getAverageConsumptionTaxRate(
    result.lines,
    result.assignedSpendAnnual,
    result.vatAnnual,
    result.specialTaxesAnnual,
  )
  const showAverageConsumptionTaxRate = result.assignedSpendAnnual > 0 || result.totalSharePercent > 0
  const formatShareOfSpend = (value: number) => result.assignedSpendAnnual > 0
    ? `${formatNumber((value / result.assignedSpendAnnual) * 100)}% del gasto`
    : 'Sin gasto asignado'

  return (
    <>
    <ConsumptionTaxesIntroDialog open={introOpen} onChoose={handleIntroChoice} />
    <section className="wctc" aria-labelledby="wctc-title">
      <header className="wctc-header">
        <div className="wctc-heading">
          <span className="wctc-step"><span aria-hidden="true" />Paso 8 de 12</span>
          <h2 id="wctc-title">8. IVA y consumo diario</h2>
          <p>Distribuye tu gasto y calcula cuánto pagas al mes en IVA e impuestos especiales.</p>
        </div>

        <div className="wctc-header-actions">
          <button type="button" className="wctc-action wctc-action--primary" onClick={applyAverageSharePresets}>
            <span>Valores medios (España)</span>
          </button>
          <button type="button" className="wctc-action" onClick={resetShares}>
            <RotateCcw size={18} aria-hidden="true" />
            <span>Restablecer</span>
          </button>
        </div>
      </header>

      <aside className="wctc-tip" role="note">
        <Lightbulb size={20} aria-hidden="true" />
        <p>
          <strong>Consejo.</strong> En la app de tu banco suele aparecer el gasto mensual y el
          porcentaje de cada categoría (alimentación, ocio, transporte...). Usa esas cifras
          para rellenar importe y % con tu patrón real, no con una media.
        </p>
      </aside>

      <div className="wctc-layout">
        <section className="wctc-left" aria-label="Distribución del gasto">
          <ConsumptionSpendDonut
            lines={result.lines}
            monthlyTotal={toMonthly(result.assignedSpendAnnual)}
          />
          <div className="wctc-spend-scroll">
            <div className="wctc-grid-head" aria-hidden="true">
              <span>Categoría de gasto</span>
              <span>Tipo impositivo / regla</span>
              <span>Importe al mes</span>
              <span>% del gasto</span>
              <span />
            </div>

            <div className="wctc-rows">
            {result.lines.map((line, index) => (
              <article
                key={line.id}
                className={`wctc-row wctc-row--${line.tone}${line.note ? ' wctc-row--noted' : ''}`}
              >
                <div className="wctc-category">
                  <span className="wctc-index">{index + 1}</span>
                  <span className="wctc-category-dot" aria-hidden="true" />
                  <span className="wctc-category-label">
                    <strong>{line.label}</strong>
                    {line.help && (
                      <InfoButton
                        label={`Qué incluye ${line.label.replace(/\s*\*$/, '')}`}
                        size="sm"
                        placement="end"
                        className="wctc-help"
                      >
                        <p>{line.help}</p>
                      </InfoButton>
                    )}
                  </span>
                </div>

                <p className="wctc-rule">{line.statutoryLabel}</p>

                <label className="wctc-input wctc-input--euro">
                  <span className="sr-only">Importe mensual en {line.label}</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={Number(toMonthly(line.spendAnnual).toFixed(2))}
                    onChange={(event) => updateAmount(line.id, Number(event.target.value))}
                  />
                  <b>€</b>
                </label>

                <label className="wctc-input wctc-input--percent">
                  <span className="sr-only">Porcentaje del gasto en {line.label}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={Number(line.sharePercent.toFixed(2))}
                    onChange={(event) => updateShare(line.id, Number(event.target.value))}
                  />
                  <b>%</b>
                </label>

                <div className="wctc-mini" aria-hidden="true">
                  <span style={{ width: `${Math.max(5, (line.spendAnnual / maxLineAmount) * 100)}%` }} />
                </div>

                {line.note && <p className="wctc-row-note">{line.note}</p>}
              </article>
            ))}

            <article className={`wctc-row wctc-row--total is-${totalStatus}`}>
              <div className="wctc-category">
                <span className="wctc-index" aria-hidden="true">Σ</span>
                <strong>TOTAL</strong>
              </div>
              <output className="wctc-rule wctc-rule--total" aria-label="Tipo impositivo medio del reparto">
                {showAverageConsumptionTaxRate
                  ? `${formatNumber(averageConsumptionTaxRate)} % medio`
                  : '—'}
              </output>
              <output className="wctc-total-cell">{formatEuro(toMonthly(result.assignedSpendAnnual))}</output>
              <output className="wctc-total-cell">{formatNumber(result.totalSharePercent)}%</output>
              <small className="wctc-total-hint">
                {totalStatus === 'ok' ? (
                  'Distribución completa'
                ) : (
                  <>
                    <span className="wctc-total-hint__percent">
                      {shareDifference > 0
                        ? `Falta ${formatNumber(shareGapPercent)} %`
                        : `Sobran ${formatNumber(shareGapPercent)} %`}
                    </span>
                    <span className="wctc-total-hint__amount">{formatEuro(amountGapMonthly)} / mes</span>
                  </>
                )}
              </small>
            </article>
          </div>
          </div>
        </section>

        <aside className="wctc-summary" aria-label="Resumen de impacto fiscal">
          <div className="wctc-summary-title">
            <Percent size={22} aria-hidden="true" />
            <h3>Resumen de impacto fiscal</h3>
          </div>

          <output className="wctc-summary-card wctc-summary-card--green">
            <WalletCards size={34} aria-hidden="true" />
            <span><b>Gasto asignado</b><small>Total al mes distribuido</small></span>
            <strong>{formatEuro(toMonthly(result.assignedSpendAnnual))}</strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--orange">
            <Receipt size={34} aria-hidden="true" />
            <span><b>IVA estimado</b><small>Aprox. al mes</small></span>
            <strong>{formatEuro(toMonthly(result.vatAnnual))}<small>{formatShareOfSpend(result.vatAnnual)}</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--blue">
            <Info size={34} aria-hidden="true" />
            <span><b>Impuestos especiales</b><small>Aprox. al mes</small></span>
            <strong>{formatEuro(toMonthly(result.specialTaxesAnnual))}<small>{formatShareOfSpend(result.specialTaxesAnnual)}</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--cyan wctc-summary-card--total">
            <Calculator size={34} aria-hidden="true" />
            <span><b>Impuestos al consumir</b><small>Suma al mes</small></span>
            <strong>{formatEuro(toMonthly(result.totalTaxAnnual))}<small>{formatShareOfSpend(result.totalTaxAnnual)}</small></strong>
          </output>

          <p className="wctc-summary-note">
            El IBI de tu vivienda y el IVTM de tu coche no dependen de cómo gastas: se estiman en
            el paso 9.
          </p>
        </aside>
      </div>
    </section>
    </>
  )
}

export default WorkerConsumptionTaxesCard
