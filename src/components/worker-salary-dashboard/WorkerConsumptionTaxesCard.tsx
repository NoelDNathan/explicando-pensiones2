import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Home,
  Info,
  Percent,
  Receipt,
  WalletCards,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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

const DEFAULT_CATEGORIES: ConsumptionTaxCategory[] = [
  {
    id: 'saving',
    label: 'Ahorro / inversion',
    initialSharePercent: 10,
    vatRate: 0,
    statutoryLabel: '0% ahora',
    tone: 'green',
    note: 'El ahorro o la inversion no paga IVA en el momento actual, pero los bienes y servicios adquiridos con ese dinero podrian tributar cuando se consuman mas adelante.',
  },
  { id: 'utilities', label: 'Suministros', initialSharePercent: 9, vatRate: 21, statutoryLabel: '21%', tone: 'blue' },
  { id: 'basic-food', label: 'Alimentacion basica', initialSharePercent: 12, vatRate: 4, statutoryLabel: '4%', tone: 'green' },
  { id: 'general-food', label: 'Alimentacion general', initialSharePercent: 11, vatRate: 10, statutoryLabel: '10%', tone: 'orange' },
  { id: 'non-essential-market', label: 'Supermercado no esencial', initialSharePercent: 6, vatRate: 21, statutoryLabel: '21%', tone: 'purple' },
  { id: 'restaurants', label: 'Restaurantes / delivery', initialSharePercent: 9, vatRate: 10, statutoryLabel: '10%', tone: 'orange' },
  {
    id: 'leisure',
    label: 'Ocio / suscripciones *',
    initialSharePercent: 7,
    vatRate: 21,
    statutoryLabel: '21%',
    tone: 'purple',
    note: 'Algunos servicios de ocio o cultura pueden tributar al 10%.',
  },
  { id: 'shopping', label: 'Compras generales', initialSharePercent: 8, vatRate: 21, statutoryLabel: '21%', tone: 'blue' },
  { id: 'public-transport', label: 'Transporte publico', initialSharePercent: 5, vatRate: 10, statutoryLabel: '10%', tone: 'green' },
  { id: 'fuel', label: 'Gasolina', initialSharePercent: 7.5, vatRate: 21, specialRate: 20, statutoryLabel: '21% + 20%', tone: 'orange' },
  { id: 'electricity', label: 'Electricidad', initialSharePercent: 4.5, vatRate: 21, specialRate: 5.11, statutoryLabel: '21% + 5,11%', tone: 'cyan' },
  {
    id: 'health',
    label: 'Salud / farmacia *',
    initialSharePercent: 3,
    vatRate: 0,
    statutoryLabel: '0%',
    tone: 'cyan',
    note: 'Segun el caso, algunos productos o servicios pueden tributar a tipos superiores, incluso al 21%.',
  },
  { id: 'education-insurance-banking', label: 'Educacion / seguros / banca', initialSharePercent: 3, vatRate: 0, statutoryLabel: 'Exento / 0%', tone: 'purple' },
  { id: 'tobacco', label: 'Tabaco', initialSharePercent: 1, vatRate: 21, specialRate: 55, statutoryLabel: '21% + 55%', tone: 'red' },
  { id: 'alcohol', label: 'Alcohol', initialSharePercent: 4, vatRate: 21, specialRate: 5, statutoryLabel: '21% + 5%', tone: 'orange' },
]

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
  initialCadastralValue = 46941.67,
  initialHasOwnedHome = true,
  onResultChange,
}: WorkerConsumptionTaxesCardProps) {
  const [budgetAnnual] = useState(initialBudgetAnnual)
  const [shares, setShares] = useState(() =>
    categories.map((category) => ({
      ...category,
      sharePercent: category.initialSharePercent,
    })),
  )
  const [hasOwnedHome, setHasOwnedHome] = useState(initialHasOwnedHome)
  const [cadastralValue, setCadastralValue] = useState(initialCadastralValue)

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

  const maxLineAmount = Math.max(...result.lines.map((line) => line.spendAnnual), 1)
  const totalStatus = Math.abs(result.totalSharePercent - 100) <= 0.05 ? 'ok' : 'warn'

  return (
    <section className="wctc" aria-labelledby="wctc-title">
      <header className="wctc-header">
        <div className="wctc-heading">
          <span className="wctc-step"><span aria-hidden="true" />Paso 7 de 8</span>
          <h2 id="wctc-title">7. IVA y otros impuestos</h2>
          <p>Distribuye tu gasto y calcula cuanto pagas en IVA e impuestos especiales.</p>
        </div>

        <div className="wctc-header-note">
          <Info size={18} aria-hidden="true" />
          <p>Edita el porcentaje o los euros. El otro valor se actualiza automaticamente.<br />La suma total debe ser 100% del gasto asignado.</p>
        </div>

        <nav className="wctc-nav" aria-label="Navegacion del simulador">
          <button type="button" aria-label="Paso anterior">
            <ArrowLeft size={31} strokeWidth={2.2} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Paso siguiente">
            <ArrowRight size={31} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </nav>
      </header>

      <div className="wctc-layout">
        <section className="wctc-left" aria-label="Distribucion del gasto">
          <div className="wctc-grid-head" aria-hidden="true">
            <span>Categoria de gasto</span>
            <span>Tipo impositivo / regla</span>
            <span>% del gasto</span>
            <span />
            <span>Importe anual (€)</span>
            <span />
          </div>

          <div className="wctc-rows">
            {result.lines.map((line, index) => (
              <article key={line.id} className={`wctc-row wctc-row--${line.tone}`}>
                <div className="wctc-category">
                  <span className="wctc-index">{index + 1}</span>
                  <span className="wctc-category-dot" aria-hidden="true" />
                  <strong>{line.label}</strong>
                </div>

                <p className="wctc-rule">{line.statutoryLabel}</p>

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

                <div className="wctc-sync" aria-hidden="true">↔</div>

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
              <output className="wctc-total-cell">{formatNumber(result.totalSharePercent)}%</output>
              <span />
              <output className="wctc-total-cell">{formatEuro(result.assignedSpendAnnual)}</output>
              <small>≈ 100%</small>
            </article>
          </div>

          <section className="wctc-home-strip" aria-labelledby="wctc-home-title">
            <div className="wctc-home-strip__title">
              <Home size={22} aria-hidden="true" />
              <h3 id="wctc-home-title">Si tienes vivienda en propiedad <span>(opcional)</span></h3>
            </div>

            <div className="wctc-ibi-row">
              <div>
                <strong>IBI</strong>
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
              </label>
              <output>{formatEuro(result.propertyTaxAnnual)}</output>
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
            <strong>{formatEuro(result.vatAnnual)}<small>{formatNumber((result.vatAnnual / result.assignedSpendAnnual) * 100)}% del gasto</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--blue">
            <Info size={34} aria-hidden="true" />
            <span><b>Impuestos especiales</b><small>Tabaco, alcohol, gasolina, electricidad...</small></span>
            <strong>{formatEuro(result.specialTaxesAnnual)}<small>{formatNumber((result.specialTaxesAnnual / result.assignedSpendAnnual) * 100)}% del gasto</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--purple">
            <Home size={34} aria-hidden="true" />
            <span><b>IBI estimado</b><small>Calculo simplificado orientativo</small></span>
            <strong>{formatEuro(result.propertyTaxAnnual)}<small>{formatNumber((result.propertyTaxAnnual / result.assignedSpendAnnual) * 100)}% del gasto</small></strong>
          </output>

          <output className="wctc-summary-card wctc-summary-card--cyan wctc-summary-card--total">
            <Calculator size={34} aria-hidden="true" />
            <span><b>Impacto total aprox.</b><small>Suma de todos los conceptos</small></span>
            <strong>{formatEuro(result.totalTaxAnnual)}<small>{formatNumber(result.effectiveRate)}% del gasto</small></strong>
          </output>

          <div className="wctc-warning">
            <Info size={20} aria-hidden="true" />
            <p>{categories[0]?.note}</p>
          </div>
        </aside>
      </div>

      <footer className="wctc-footnotes">
        <Info size={24} aria-hidden="true" />
        <p>* Ocio / suscripciones: algunos servicios pueden tributar al 10%.</p>
        <p>* Salud / farmacia: segun el caso, algunos productos o servicios pueden tributar a tipos superiores, incluso al 21%.</p>
        <p>* IBI: calculo muy simplificado con fines orientativos.</p>
      </footer>
    </section>
  )
}

export default WorkerConsumptionTaxesCard
