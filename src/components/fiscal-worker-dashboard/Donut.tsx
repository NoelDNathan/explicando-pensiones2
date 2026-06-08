import { Info } from 'lucide-react'
import type { CSSProperties } from 'react'

type DonutSegment = {
  id: 'net' | 'irpf' | 'ss' | 'iva' | 'other'
  label: string
  amount: number
  percent: number
}

type DonutProps = {
  gross: number
  segments: DonutSegment[]
}

const SEGMENT_META: Record<DonutSegment['id'], { className: string; color: string }> = {
  net: { className: 'is-green', color: '#5ee576' },
  irpf: { className: 'is-purple', color: '#9b6cff' },
  ss: { className: 'is-cyan', color: '#36c9ff' },
  iva: { className: 'is-orange', color: '#ff9638' },
  other: { className: 'is-gray', color: '#b6c2d2' },
}

function formatEuro(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

function formatPercent(value: number) {
  return `${value.toLocaleString('es-ES', {
    maximumFractionDigits: value === 0 ? 0 : 1,
    minimumFractionDigits: value === 0 ? 0 : 1,
  })} %`
}

function donutGradient(segments: DonutSegment[]) {
  const drawable = segments.filter((segment) => segment.amount > 0)
  const total = drawable.reduce((sum, segment) => sum + segment.amount, 0)
  if (total <= 0) return '#b6c2d2 0turn 1turn'

  let cursor = 0
  return drawable.map((segment) => {
    const start = cursor
    const size = segment.amount / total
    cursor += size
    return `${SEGMENT_META[segment.id].color} ${start.toFixed(4)}turn ${cursor.toFixed(4)}turn`
  }).join(', ')
}

export function Donut({ gross, segments }: DonutProps) {
  const netSegment = segments.find((segment) => segment.id === 'net') ?? segments[0]

  return (
    <article className="fwd-composition-card" aria-labelledby="fwd-composition-title">
      <div className="fwd-composition-head">
        <h3 id="fwd-composition-title">Composición aproximada</h3>
        <p>Distribución del salario bruto anual</p>
      </div>

      <div className="fwd-composition-body">
        <div className="fwd-donut-stage">
          <div
            className="fwd-donut"
            style={{ '--donut-segments': donutGradient(segments) } as CSSProperties}
            aria-label={`Salario bruto anual ${formatEuro(gross)}`}
          >
            <span>{formatEuro(gross)}<small>Bruto</small></span>
          </div>
          <div className="fwd-donut-callout" aria-label={`${formatPercent(netSegment.percent)} del bruto`}>
            <strong>{formatPercent(netSegment.percent)}</strong>
            <span>del bruto</span>
          </div>
        </div>

        <ul className="fwd-composition-list" aria-label="Categorías de composición fiscal">
          {segments.map((segment) => {
            const meta = SEGMENT_META[segment.id]
            return (
              <li
                className={segment.id === 'net' ? 'is-featured' : undefined}
                key={segment.id}
                style={{ '--row-color': meta.color } as CSSProperties}
              >
                <i className={meta.className} aria-hidden="true" />
                <div className="fwd-composition-row-main">
                  <span>{segment.label}</span>
                  <em><b style={{ width: `${Math.min(100, segment.percent)}%` }} /></em>
                </div>
                <strong>{formatEuro(segment.amount)}</strong>
                <small>{formatPercent(segment.percent)}</small>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="fwd-composition-info">
        <span aria-hidden="true"><Info size={20} /></span>
        <p>El IVA y otros impuestos son módulos de contexto: dependen del consumo o de datos declarados por el usuario.</p>
      </div>
    </article>
  )
}
