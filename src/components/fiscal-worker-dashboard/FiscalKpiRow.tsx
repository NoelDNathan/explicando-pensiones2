import {
  Banknote,
  FileText,
  Landmark,
  Receipt,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react'
import './FiscalKpiRow.css'

export type FiscalKpiTone = 'green' | 'purple' | 'cyan' | 'gold' | 'orange' | 'violet'

export type FiscalKpiIcon = 'wallet' | 'users' | 'shield' | 'bank' | 'receipt' | 'document'

export type FiscalKpiMetric = {
  label: string
  value: string
}

export type FiscalKpiItem = {
  tone: FiscalKpiTone
  icon: FiscalKpiIcon
  title: string
  left: FiscalKpiMetric
  right: FiscalKpiMetric
  badge: string
}

export const FISCAL_KPI_ROW_DEMO_ITEMS: FiscalKpiItem[] = [
  {
    tone: 'green',
    icon: 'wallet',
    title: 'Salario neto',
    left: { label: 'Anual', value: '26.832 €' },
    right: { label: 'Mensual', value: '2.236 €' },
    badge: '76,7 % del bruto',
  },
  {
    tone: 'purple',
    icon: 'users',
    title: 'IRPF anual',
    left: { label: 'Estatal', value: '3.165 €' },
    right: { label: 'Autonómico', value: '2.734 €' },
    badge: '5.900 €',
  },
  {
    tone: 'cyan',
    icon: 'shield',
    title: 'Cotización trabajador',
    left: { label: 'Base mensual', value: '2.917 €' },
    right: { label: 'Cuota anual', value: '2.268 €' },
    badge: 'Incluye MEI',
  },
  {
    tone: 'gold',
    icon: 'bank',
    title: 'Aportación SS total',
    left: { label: 'Empresa', value: '10.630 €' },
    right: { label: 'Pensiones', value: '10.185 €' },
    badge: 'Trabajador + empresa',
  },
  {
    tone: 'orange',
    icon: 'receipt',
    title: 'IVA proxy',
    left: { label: 'Gasto anual', value: '20.400 €' },
    right: { label: 'IVA', value: '1.967 €' },
    badge: 'INE EPF 2024: 9,6 %',
  },
  {
    tone: 'violet',
    icon: 'document',
    title: 'Otros impuestos',
    left: { label: 'Declarado', value: '0 €' },
    right: { label: 'Módulo', value: 'separado' },
    badge: 'No altera el neto laboral',
  },
]

const ICONS: Record<FiscalKpiIcon, typeof WalletCards> = {
  wallet: WalletCards,
  users: Users,
  shield: ShieldCheck,
  bank: Landmark,
  receipt: Receipt,
  document: FileText,
}

export type FiscalKpiRowProps = {
  items?: FiscalKpiItem[]
  className?: string
}

export function FiscalKpiRow({ items = FISCAL_KPI_ROW_DEMO_ITEMS, className }: FiscalKpiRowProps) {
  const rootClass = ['fkr', className].filter(Boolean).join(' ')

  return (
    <section className={rootClass} aria-label="Resumen anual de impuestos y salario">
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? Banknote

        return (
          <article className={`fkr-card fkr-card--${item.tone}`} key={`${item.title}-${item.tone}`}>
            <div className="fkr-card__header">
              <span className="fkr-card__icon" aria-hidden="true">
                <Icon size={22} strokeWidth={1.9} />
              </span>
              <h3>{item.title}</h3>
            </div>

            <dl className="fkr-card__metrics">
              <div>
                <dt>{item.left.label}</dt>
                <dd>{item.left.value}</dd>
              </div>
              <div>
                <dt>{item.right.label}</dt>
                <dd>{item.right.value}</dd>
              </div>
            </dl>

            <p className="fkr-card__badge">{item.badge}</p>
          </article>
        )
      })}
    </section>
  )
}

export default FiscalKpiRow
