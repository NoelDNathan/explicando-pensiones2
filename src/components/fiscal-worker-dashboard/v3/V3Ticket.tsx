/*
 * Cierre de la v3: «Tu ticket fiscal». Todo lo que aparece aquí existe porque la
 * persona contestó: el cambio frente a la aproximación, su apuesta cerrada, tres
 * descubrimientos y un pequeño laboratorio que no toca su caso.
 */
import { useMemo, useState } from 'react'
import { Download, FileDown, Share2 } from 'lucide-react'
import { EscHundredCells } from '../../worker-salary-dashboard/escenario/EscenarioParts'
import type { FiscalResultInputs } from '../fiscalResult'
import { V3AssumptionChips, V3Discovery } from './V3Parts'
import type { V3Assumption } from './V3Parts'
import { euro, per100, signedPer100, taxFreedomDay } from './v3Flow'
import type { V3Attribution, V3Ticket as V3TicketData } from './v3Flow'

type Period = 'month' | 'year'

export function V3Ticket({
  ticket,
  baseline,
  steps,
  guess,
  pending,
  regionOptions,
  region,
  salaryInput,
  evaluate,
  onLearn,
  actions,
  notice,
  fallbackText,
}: {
  ticket: V3TicketData
  baseline: V3TicketData
  steps: V3Attribution[]
  guess: number | null
  /** Supuestos que siguen sin confirmar. */
  pending: V3Assumption[]
  regionOptions: { value: string; label: string }[]
  region: string
  /** Salario de las entradas del cálculo (sin complementos), para el «¿y si…?». */
  salaryInput: number
  /** Calcula el ticket con algunas entradas cambiadas, sin tocar el caso guardado. */
  evaluate: (overrides: Partial<FiscalResultInputs>) => V3TicketData
  onLearn: (stepId: number) => void
  actions: { downloadImage: () => void; share: () => void; downloadCopy: () => void }
  notice: string | null
  fallbackText: string | null
}) {
  const [period, setPeriod] = useState<Period>('month')
  const [labRegion, setLabRegion] = useState(() => regionOptions.find((option) => option.value !== region)?.value ?? region)
  const divisor = period === 'month' ? 12 : 1
  const money = (value: number) => euro(value / divisor)
  const suffix = period === 'month' ? 'al mes' : 'al año'

  const moved = steps.filter((step) => Math.abs(step.delta) >= 0.05)
  const total = ticket.takeHomePer100 - baseline.takeHomePer100
  const freedom = taxFreedomDay(ticket)
  const raised = useMemo(() => evaluate({ salary: salaryInput + 1000 }), [evaluate, salaryInput])
  const otherRegion = useMemo(() => evaluate({ region: labRegion }), [evaluate, labRegion])

  const lines: { id: string; label: string; value: number; sign: '' | '−' | '='; step?: number; tone?: string }[] = [
    { id: 'cost', label: 'Lo que cuesta tu puesto', value: ticket.laborCost, sign: '' },
    { id: 'employer', label: 'Cotizaciones de tu empresa', value: ticket.employer, sign: '−', step: 3, tone: 'company' },
    { id: 'gross', label: 'Tu salario bruto', value: ticket.gross, sign: '=' },
    { id: 'worker', label: 'Tus cotizaciones', value: ticket.worker, sign: '−', step: 3, tone: 'worker' },
    { id: 'irpf', label: 'IRPF', value: ticket.irpf, sign: '−', step: 6, tone: 'worker' },
    { id: 'net', label: 'Lo que cobras en nómina', value: ticket.netPayroll, sign: '=' },
    { id: 'vat', label: 'IVA de lo que compras', value: ticket.vat, sign: '−', step: 8, tone: 'blue' },
    ...(ticket.special > 0 ? [{ id: 'special', label: 'Impuestos especiales', value: ticket.special, sign: '−' as const, step: 8, tone: 'blue' }] : []),
    ...(ticket.wealth > 0 ? [{ id: 'wealth', label: 'IBI e impuesto de circulación', value: ticket.wealth, sign: '−' as const, step: 9, tone: 'yellow' }] : []),
  ]

  return (
    <section className="d-page v3-ticket" aria-labelledby="v3-ticket-title">
      <div className="d-stack">
        <p className="d-caps">Tu ticket fiscal</p>
        <h1 id="v3-ticket-title" className="v3-ticket__h1" tabIndex={-1}>
          De cada 100 € que cuesta tu puesto, <span className="d-acc">{per100(ticket.takeHomePer100)} son para ti</span>
        </h1>
      </div>

      <div className="v3-ticket__closures d-close">
        {guess !== null ? (
          <section className="v3-closure" aria-labelledby="v3-closure-guess">
            <h2 id="v3-closure-guess" className="v3-closure__title">Tu apuesta</h2>
            <dl className="v3-closure__duel">
              <div><dt>Dijiste</dt><dd className="d-worker">{guess} €</dd></div>
              <div><dt>Con tu caso completo</dt><dd className="d-acc">{ticket.taxesPer100} €</dd></div>
            </dl>
            <p className="d-small">
              de cada 100 € acaban en Hacienda y la Seguridad Social
              {Math.abs(guess - ticket.taxesPer100) <= 3
                ? '. Tu intuición estaba muy cerca.'
                : guess < ticket.taxesPer100
                  ? `: ${ticket.taxesPer100 - guess} € más de lo que pensabas.`
                  : `: ${guess - ticket.taxesPer100} € menos de lo que pensabas.`}
            </p>
          </section>
        ) : null}

        <section className="v3-closure" aria-labelledby="v3-closure-changes">
          <h2 id="v3-closure-changes" className="v3-closure__title">Qué cambió gracias a ti</h2>
          <dl className="v3-closure__duel">
            <div><dt>La aproximación decía</dt><dd className="d-muted">{per100(baseline.takeHomePer100)}</dd></div>
            <div><dt>Tu caso</dt><dd className="d-acc">{per100(ticket.takeHomePer100)}</dd></div>
          </dl>
          {moved.length > 0 ? (
            <ul className="v3-closure__moves">
              {moved.map((step) => (
                <li key={step.id}>
                  <span>{step.label}</span>
                  <strong className={step.delta > 0 ? 'd-acc' : 'd-company'}>{signedPer100(step.delta)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="d-small">Tu caso coincide con la aproximación: tus respuestas lo confirman.</p>
          )}
          {moved.length > 0 && Math.abs(total) >= 0.05 ? (
            <p className="d-note">En euros de cada 100 que te quedan, frente a la aproximación del principio.</p>
          ) : null}
        </section>
      </div>

      {pending.length > 0 ? (
        <V3AssumptionChips title="Aún es un supuesto" items={pending} />
      ) : null}

      <section className="v3-receipt" aria-labelledby="v3-receipt-title">
        <div className="v3-receipt__head">
          <h2 id="v3-receipt-title" className="v3-receipt__title">A dónde va el dinero</h2>
          <div className="d-segs" role="group" aria-label="Ver las cifras al mes o al año">
            <button type="button" aria-pressed={period === 'month'} onClick={() => setPeriod('month')}>Al mes</button>
            <button type="button" aria-pressed={period === 'year'} onClick={() => setPeriod('year')}>Al año</button>
          </div>
        </div>
        <div className="v3-receipt__body">
          <EscHundredCells
            label={`De cada 100 € que cuesta tu puesto: ${per100(ticket.takeHomePer100)} para ti; ${per100((ticket.employer / ticket.laborCost) * 100)} de cotizaciones de tu empresa; ${per100(((ticket.worker + ticket.irpf) / ticket.laborCost) * 100)} de tus cotizaciones e IRPF; ${per100(((ticket.vat + ticket.special + ticket.wealth) / ticket.laborCost) * 100)} al gastar y por lo que tienes.`}
            parts={[
              { value: ticket.takeHome, tone: 'positive' },
              { value: ticket.worker + ticket.irpf, tone: 'worker' },
              { value: ticket.employer, tone: 'company' },
              { value: ticket.vat + ticket.special, tone: 'state' },
              { value: ticket.wealth, tone: 'yellow' },
            ]}
          />
          <dl className="v3-receipt__lines">
            {lines.map((line) => (
              <div key={line.id} className={`v3-receipt__line${line.sign === '=' ? ' is-sub' : ''}`}>
                <dt>
                  <span>{line.label}</span>
                  {line.step ? (
                    <button type="button" className="v3-link" onClick={() => onLearn(line.step!)}>Cómo se calcula</button>
                  ) : null}
                </dt>
                <dd className={line.tone ? `v3-tone--${line.tone}` : undefined}>
                  {line.sign === '−' ? '− ' : ''}{money(line.value)}
                </dd>
              </div>
            ))}
            <div className="v3-receipt__line is-total">
              <dt><span>Te queda</span></dt>
              <dd className="d-acc">{money(ticket.takeHome)}</dd>
            </div>
          </dl>
        </div>
        <p className="d-note">
          Cifras {suffix}. Estimación con la normativa de 2025 (BOE y AEAT) y, para el IVA, la Encuesta
          de Presupuestos Familiares del INE o el gasto que hayas indicado.{' '}
          <button type="button" className="v3-link" onClick={() => onLearn(12)}>Ver fuentes del cálculo</button>
        </p>
      </section>

      <section className="d-stack" aria-labelledby="v3-discoveries-title">
        <h2 id="v3-discoveries-title" className="v3-section-title">Tres cosas de tu caso</h2>
        <div className="v3-discoveries">
          <V3Discovery kicker="Lo que no ves en tu nómina" figure={<span className="d-company">{euro(ticket.employer / 12)}</span>} tone="company">
            <p>al mes paga tu empresa en cotizaciones por ti, además de tu salario bruto.</p>
          </V3Discovery>
          <V3Discovery kicker="Tu día de liberación fiscal" figure={<span className="d-yellow">{freedom.label}</span>} tone="yellow">
            <p>
              Si todo lo que va a impuestos y cotizaciones se pagara primero, trabajarías hasta ese día
              ({freedom.days} de 365) para cubrirlo.
            </p>
          </V3Discovery>
          <V3Discovery kicker="Lo que pagas al comprar" figure={<span className="d-blue">{euro((ticket.vat + ticket.special) / 12)}</span>} tone="blue">
            <p>al mes se van en IVA{ticket.special > 0 ? ' e impuestos especiales' : ''}, ya incluidos en los precios.</p>
          </V3Discovery>
        </div>
      </section>

      <section className="d-stack" aria-labelledby="v3-lab-title">
        <h2 id="v3-lab-title" className="v3-section-title">¿Y si…?</h2>
        <p className="d-small">Pruebas con el mismo cálculo. Tu caso no cambia.</p>
        <div className="v3-lab">
          <article className="v3-lab__card">
            <h3 className="v3-lab__q">¿Y si ganaras 1.000 € más al año?</h3>
            <dl className="v3-lab__rows">
              <div><dt>A tu empresa le costaría</dt><dd className="d-company">+{euro(raised.laborCost - ticket.laborCost)}</dd></div>
              <div><dt>Tu nómina subiría</dt><dd className="d-worker">+{euro(raised.netPayroll - ticket.netPayroll)}</dd></div>
              <div><dt>Después de IVA, para ti</dt><dd className="d-acc">+{euro(raised.takeHome - ticket.takeHome)}</dd></div>
            </dl>
          </article>
          <article className="v3-lab__card">
            <h3 className="v3-lab__q">
              <label htmlFor="v3-lab-region">¿Y si vivieras en…?</label>
            </h3>
            <select id="v3-lab-region" className="d-select" value={labRegion} onChange={(event) => setLabRegion(event.target.value)}>
              {regionOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <dl className="v3-lab__rows">
              <div><dt>IRPF al año</dt><dd className="d-worker">{euro(otherRegion.irpf)} <small>({signedEuro(otherRegion.irpf - ticket.irpf)})</small></dd></div>
              <div><dt>De cada 100 €, para ti</dt><dd className="d-acc">{per100(otherRegion.takeHomePer100)}</dd></div>
            </dl>
          </article>
        </div>
      </section>

      <section className="d-stack" aria-labelledby="v3-keep-title">
        <h2 id="v3-keep-title" className="v3-section-title">Llévatelo</h2>
        <div className="d-row v3-keep">
          <button type="button" className="d-cta" onClick={actions.downloadImage}>
            <Download size={20} aria-hidden="true" /> Descargar imagen
          </button>
          <button type="button" className="d-ghost" onClick={actions.share}>
            <Share2 size={18} aria-hidden="true" /> Compartir mi porcentaje
          </button>
          <button type="button" className="d-ghost" onClick={actions.downloadCopy}>
            <FileDown size={18} aria-hidden="true" /> Guardar una copia
          </button>
        </div>
        <p className="d-note">
          La imagen y el texto para compartir solo llevan los euros de cada 100 que te quedan: ni tu
          sueldo ni tu comunidad. Tu cálculo ya se guarda solo en este navegador.
        </p>
        {notice ? <p className="v3-notice" role="status">{notice}</p> : null}
        {fallbackText ? (
          <label className="v3-field">
            <span className="v3-field__label">Texto para copiar</span>
            <input className="d-input" type="text" readOnly value={fallbackText} onFocus={(event) => event.target.select()} />
          </label>
        ) : null}
      </section>

      <section className="d-stack" aria-labelledby="v3-more-title">
        <h2 id="v3-more-title" className="v3-section-title">Si quieres más</h2>
        <div className="d-row">
          <button type="button" className="d-outline" onClick={() => onLearn(1)}>Entender cada línea, paso a paso</button>
          <button type="button" className="d-outline" onClick={() => onLearn(10)}>Qué recauda el Estado con cada parte</button>
        </div>
      </section>
    </section>
  )
}

function signedEuro(value: number) {
  if (Math.abs(value) < 0.5) return 'igual que ahora'
  return `${value > 0 ? '+' : '−'}${euro(Math.abs(value))}`
}

