import {
  Calculator,
  Home,
  Info,
  Percent,
  Receipt,
  RotateCcw,
  Sparkles,
  WalletCards,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { InfoButton } from '../ui/InfoButton'
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
  propertyTaxAnnual: number
  totalTaxAnnual: number
  effectiveRate: number
}

type WorkerConsumptionTaxesCardProps = {
  categories?: ConsumptionTaxCategory[]
  initialBudgetAnnual?: number
  initialCadastralValue?: number
  initialHasOwnedHome?: boolean
  onResultChange?: (result: ConsumptionTaxesResult) => void
}

const DEFAULT_BUDGET_ANNUAL = 28145.92

const IBI_HELP =
  'El IBI (Impuesto sobre Bienes Inmuebles) lo cobra tu ayuntamiento por la vivienda en propiedad. Este bloque es opcional y no forma parte del reparto del 100 % de gasto. La calculadora estima una cuota anual aproximada como valor catastral x 0,6 %; el tipo real lo fija cada municipio y puede variar bastante. Activa el interruptor para incluirlo en el impacto fiscal total; no es IVA ni impuesto especial de consumo.'

const DEFAULT_CATEGORIES: ConsumptionTaxCategory[] = [
  {
    id: 'saving',
    label: 'Ahorro / inversion',
    initialSharePercent: 0,
    vatRate: 0,
    statutoryLabel: '0% ahora',
    tone: 'green',
    help: 'No es consumo corriente ni deuda: aqui va el dinero que reservas en lugar de gastarlo ya. Depositos, fondos, acciones, aportaciones a pensiones privadas... No paga IVA al guardarlo, pero lo que luego compres con ese dinero si tributara en su categoria.',
  },
  {
    id: 'mortgage-debt',
    label: 'Hipoteca / deudas',
    initialSharePercent: 0,
    vatRate: 0,
    statutoryLabel: 'Sin IVA',
    tone: 'neutral',
    help: 'Cuota de hipoteca, prestamos personales, tarjetas u otras deudas que amortizas cada mes. Tambien puedes incluir aqui el alquiler de vivienda habitual. No llevan IVA en este reparto: son pagos financieros o de vivienda, no compra de bienes o servicios con IVA.',
  },
  {
    id: 'basic-food',
    label: 'Alimentacion basica',
    initialSharePercent: 0,
    vatRate: 4,
    statutoryLabel: '4%',
    tone: 'green',
    help: 'La frontera legal del IVA (4 % vs 10 %) no es obvia. Basica: pan, leche, huevos, fruta/verdura fresca, etc. General: resto de comida del supermercado no incluida en la basica.',
  },
  {
    id: 'general-food',
    label: 'Alimentacion general',
    initialSharePercent: 0,
    vatRate: 10,
    statutoryLabel: '10%',
    tone: 'orange',
    help: 'La frontera legal del IVA (4 % vs 10 %) no es obvia. Basica: pan, leche, huevos, fruta/verdura fresca, etc. General: resto de comida del supermercado no incluida en la basica.',
  },
  {
    id: 'restaurants',
    label: 'Restaurantes / delivery',
    initialSharePercent: 0,
    vatRate: 10,
    statutoryLabel: '10%',
    tone: 'orange',
    help: 'Comidas fuera de casa y delivery. Puede solaparse con alimentacion general si compras comida preparada para llevar; aqui va lo que consumes en restaurante o te lo traen a domicilio.',
  },
  {
    id: 'shopping',
    label: 'Compras generales',
    initialSharePercent: 0,
    vatRate: 21,
    statutoryLabel: '21%',
    tone: 'blue',
    help: 'Es el cajon de sastre del 21 %. Ropa, electronica, muebles, higiene no farmaceutica, etc. Lo que no encaje en otra fila.',
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
  { id: 'public-transport', label: 'Transporte publico', initialSharePercent: 0, vatRate: 10, statutoryLabel: '10%', tone: 'green' },
  {
    id: 'fuel',
    label: 'Gasolina',
    initialSharePercent: 0,
    vatRate: 21,
    specialRate: 20,
    statutoryLabel: '21% + 20%',
    tone: 'orange',
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
    help: 'El 21 % + 5,11 % combina IVA e impuesto especial sobre la electricidad. Esta fila no incluye gas, agua u otros suministros si no los has repartido en otra categoria.',
  },
  {
    id: 'health',
    label: 'Salud / farmacia *',
    initialSharePercent: 0,
    vatRate: 0,
    statutoryLabel: '0%',
    tone: 'cyan',
    note: 'Segun el caso, algunos productos o servicios pueden tributar a tipos superiores, incluso al 21%.',
    help: 'Medicamentos con receta y productos sanitarios basicos suelen ir al 0 % o tipos reducidos; otros productos de farmacia/parafarmacia (cosmetica, optica...) pueden ir al 21 %.',
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
    help: 'Bebidas alcoholicas: cerveza, vino, licores, etc. El 21 % + 5 % mezcla IVA e impuesto especial sobre el alcohol; el tipo especial varia segun producto, aqui usamos una cifra orientativa.',
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

function formatEuro(value: number, decimals = 2) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function formatNumber(value: number, decimals = 2) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

function clampNumber(value: number, min = 0, max = Number.POSITIVE_INFINITY) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function WorkerConsumptionTaxesCard({
  categories = DEFAULT_CATEGORIES,
  initialBudgetAnnual = DEFAULT_BUDGET_ANNUAL,
  initialCadastralValue = 0,
  initialHasOwnedHome = true,
  onResultChange,
}: WorkerConsumptionTaxesCardProps) {
  const [budgetAnnual, setBudgetAnnual] = useState(initialBudgetAnnual)
  const [shares, setShares] = useState(() =>
    categories.map((category) => ({
      ...category,
      sharePercent: category.initialSharePercent,
    })),
  )
  const [hasOwnedHome, setHasOwnedHome] = useState(initialHasOwnedHome)
  const [cadastralValue, setCadastralValue] = useState(initialCadastralValue)

  useEffect(() => {
    setBudgetAnnual(initialBudgetAnnual)
  }, [initialBudgetAnnual])

  const propertyTaxAnnual = hasOwnedHome ? cadastralValue * 0.006 : 0

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
    const totalTaxAnnual = vatAnnual + specialTaxesAnnual + propertyTaxAnnual

    return {
      lines,
      assignedSpendAnnual,
      totalBudgetAnnual: budgetAnnual,
      totalSharePercent,
      vatAnnual,
      specialTaxesAnnual,
      propertyTaxAnnual,
      totalTaxAnnual,
      effectiveRate: assignedSpendAnnual > 0 ? (totalTaxAnnual / assignedSpendAnnual) * 100 : 0,
    }
  }, [budgetAnnual, propertyTaxAnnual, shares])

  useEffect(() => {
    onResultChange?.(result)
  }, [onResultChange, result])

  function updateShare(id: string, nextSharePercent: number) {
    setShares((current) =>
      current.map((row) => (
        row.id === id ? { ...row, sharePercent: clampNumber(nextSharePercent, 0, 100) } : row
      )),
    )
  }

  function updateAmount(id: string, nextAmount: number) {
    const sharePercent = budgetAnnual > 0 ? (clampNumber(nextAmount, 0, budgetAnnual) / budgetAnnual) * 100 : 0
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

  const maxLineAmount = Math.max(...result.lines.map((line) => line.spendAnnual), 1)
  const totalStatus = Math.abs(result.totalSharePercent - 100) <= 0.05 ? 'ok' : 'warn'
  const shareDifference = 100 - result.totalSharePercent
  const totalHint = totalStatus === 'ok'
    ? 'Distribución completa'
    : shareDifference > 0
      ? `Falta ${formatNumber(shareDifference)}%`
      : `Sobran ${formatNumber(Math.abs(shareDifference))}%`
  const formatShareOfSpend = (value: number) => result.assignedSpendAnnual > 0
    ? `${formatNumber((value / result.assignedSpendAnnual) * 100)}% del gasto`
    : 'Sin gasto asignado'

  return (
    <section className="wctc" aria-labelledby="wctc-title">
      <header className="wctc-header">
        <div className="wctc-heading">
          <span className="wctc-step"><span aria-hidden="true" />Paso 7 de 10</span>
          <h2 id="wctc-title">7. IVA y otros impuestos</h2>
          <p>Distribuye tu gasto y calcula cuanto pagas en IVA e impuestos especiales.</p>
        </div>

        <div className="wctc-header-actions">
          <button type="button" className="wctc-action wctc-action--primary" onClick={applyAverageSharePresets}>
            <Sparkles size={18} aria-hidden="true" />
            <span>Valores medios (España)</span>
          </button>
          <button type="button" className="wctc-action" onClick={resetShares}>
            <RotateCcw size={18} aria-hidden="true" />
            <span>Restablecer</span>
          </button>
        </div>
      </header>

      <div className="wctc-layout">
        <section className="wctc-left" aria-label="Distribucion del gasto">
          <div className="wctc-grid-head" aria-hidden="true">
            <span>Categoria de gasto</span>
            <span>Tipo impositivo / regla</span>
            <span>Importe anual (€)</span>
            <span>% del gasto</span>
            <span />
          </div>

          <div className="wctc-rows">
            {result.lines.map((line, index) => (
              <article key={line.id} className={`wctc-row wctc-row--${line.tone}`}>
                <div className="wctc-category">
                  <span className="wctc-index">{index + 1}</span>
                  <span className="wctc-category-dot" aria-hidden="true" />
                  <span className="wctc-category-label">
                    <strong>{line.label}</strong>
                    {line.help && (
                      <InfoButton
                        label={`Que incluye ${line.label.replace(/\s*\*$/, '')}`}
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
                  <span className="sr-only">Importe anual en {line.label}</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={Number(line.spendAnnual.toFixed(2))}
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

                <div className="wctc-mini">
                  <span style={{ width: `${Math.max(5, (line.spendAnnual / maxLineAmount) * 100)}%` }} />
                </div>
              </article>
            ))}

            <article className={`wctc-row wctc-row--total is-${totalStatus}`}>
              <div className="wctc-category">
                <span className="wctc-index" aria-hidden="true">Σ</span>
                <strong>TOTAL</strong>
              </div>
              <p className="wctc-rule">—</p>
              <output className="wctc-total-cell">{formatEuro(result.assignedSpendAnnual)}</output>
              <output className="wctc-total-cell">{formatNumber(result.totalSharePercent)}%</output>
              <small>{totalHint}</small>
            </article>
          </div>

          <section className="wctc-home-strip" aria-labelledby="wctc-home-title">
            <div className="wctc-home-strip__title">
              <Home size={22} aria-hidden="true" />
              <h3 id="wctc-home-title">Si tienes vivienda en propiedad <span>(opcional)</span></h3>
            </div>

            <div className="wctc-ibi-row">
              <div className="wctc-ibi-head">
                <strong>IBI</strong>
                <InfoButton label="Que es el IBI estimado" size="sm" placement="end" className="wctc-help">
                  <p>{IBI_HELP}</p>
                </InfoButton>
                <small>* Simplificacion orientativa</small>
              </div>
              <label>
                <span>valor catastral del inmueble x 0,6 *</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  disabled={!hasOwnedHome}
                  value={Number(cadastralValue.toFixed(2))}
                  onChange={(event) => setCadastralValue(clampNumber(Number(event.target.value), 0, 10000000))}
                />
              </label>
              <label className="wctc-switch">
                <input
                  type="checkbox"
                  checked={hasOwnedHome}
                  onChange={(event) => setHasOwnedHome(event.target.checked)}
                  aria-label="Incluir IBI estimado"
                />
                <span aria-hidden="true" />
                <em>{hasOwnedHome ? 'Incluido' : 'No incluido'}</em>
              </label>
              <output className="wctc-ibi-amounts" aria-label="Cuota IBI estimada">
                <span className="wctc-ibi-amount">
                  <small>Anual</small>
                  <strong>{formatEuro(result.propertyTaxAnnual)}</strong>
                </span>
                <span className="wctc-ibi-amount">
                  <small>Mensual</small>
                  <strong>{formatEuro(result.propertyTaxAnnual / 12)}</strong>
                </span>
              </output>
            </div>
          </section>
        </section>

        <aside className="wctc-summary" aria-label="Resumen de impacto fiscal">
          <div className="wctc-summary-title">
            <Percent size={22} aria-hidden="true" />
            <h3>Resumen de impacto fiscal</h3>
          </div>

          <output className="wctc-summary-card wctc-summary-card--green">
            <WalletCards size={34} aria-hidden="true" />
            <span><b>Gasto asignado</b><small>Total anual distribuido</small></span>
            <strong>{formatEuro(result.assignedSpendAnnual)}</strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--orange">
            <Receipt size={34} aria-hidden="true" />
            <span><b>IVA estimado</b><small>IVA soportado aproximado</small></span>
            <strong>{formatEuro(result.vatAnnual)}<small>{formatShareOfSpend(result.vatAnnual)}</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--blue">
            <Info size={34} aria-hidden="true" />
            <span><b>Impuestos especiales</b><small>Tabaco, alcohol, gasolina, electricidad...</small></span>
            <strong>{formatEuro(result.specialTaxesAnnual)}<small>{formatShareOfSpend(result.specialTaxesAnnual)}</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--purple">
            <Home size={34} aria-hidden="true" />
            <span><b>IBI estimado</b><small>Calculo simplificado orientativo</small></span>
            <strong>{formatEuro(result.propertyTaxAnnual)}<small>{formatShareOfSpend(result.propertyTaxAnnual)}</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--cyan wctc-summary-card--total">
            <Calculator size={34} aria-hidden="true" />
            <span><b>Impacto total aprox.</b><small>Suma de todos los conceptos</small></span>
            <strong>{formatEuro(result.totalTaxAnnual)}<small>{formatShareOfSpend(result.totalTaxAnnual)}</small></strong>
          </output>
        </aside>
      </div>
    </section>
  )
}

export default WorkerConsumptionTaxesCard
