import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calculator,
  CheckCircle2,
  CircleHelp,
  Coins,
  Database,
  FileText,
  Info,
  KeyRound,
  Percent,
  Rocket,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'
import './SocialSecurityBasesExplainer.css'

type ScenarioTone = 'green' | 'blue' | 'purple' | 'orange' | 'yellow'

const formatEuro = (value: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)

function ExplainerIcon({
  icon,
  tone = 'blue',
}: {
  icon: ReactNode
  tone?: ScenarioTone
}) {
  return (
    <span className={`ssbe-icon ssbe-icon--${tone}`} aria-hidden="true">
      {icon}
    </span>
  )
}

function StepNumber({ value, tone }: { value: number; tone: ScenarioTone }) {
  return <span className={`ssbe-step-number ssbe-step-number--${tone}`}>{value}</span>
}

function FieldShell({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <label className="ssbe-field">
      <span>{label}</span>
      <span className="ssbe-control">
        {icon}
        {children}
      </span>
    </label>
  )
}

function QuickExample({
  tone,
  label,
  before,
  after,
  text,
}: {
  tone: ScenarioTone
  label: string
  before: ReactNode
  after: ReactNode
  text: string
}) {
  return (
    <article className={`ssbe-example ssbe-example--${tone}`}>
      <span>{label}</span>
      <div>
        <small>Antes</small>
        <strong>{before}</strong>
        <ArrowRight size={20} aria-hidden="true" />
        <small>Despues</small>
        <strong>{after}</strong>
      </div>
      <p>{text}</p>
    </article>
  )
}

function ExplanationBlock({
  tone,
  number,
  title,
  icon,
  items,
}: {
  tone: ScenarioTone
  number: number
  title: string
  icon: ReactNode
  items: string[]
}) {
  return (
    <article className={`ssbe-explanation-block ssbe-explanation-block--${tone}`}>
      <div>
        <ExplainerIcon icon={icon} tone={tone} />
        <h3><span>{number}</span>{title}</h3>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

export function SocialSecurityBasesExplainer() {
  const baseReal = 1700
  const minBase = 1929
  const maxBase = 4909.5
  const finalBase = minBase
  const employeeContribution = 125
  const employerContribution = 589.7
  const totalContribution = employeeContribution + employerContribution

  const baseRealPosition = `${baseReal / 6000 * 100}%`
  const minBasePosition = `${minBase / 6000 * 100}%`
  const maxBasePosition = `${maxBase / 6000 * 100}%`

  return (
    <section className="ssbe" aria-labelledby="ssbe-title">
      <div className="ssbe-shell">
        <header className="ssbe-header">
          <div className="ssbe-title-group">
            <ExplainerIcon icon={<FileText size={26} />} tone="blue" />
            <div>
              <h1 id="ssbe-title">Bases minimas y maximas de cotizacion</h1>
              <p>Edita tus datos y veras que base se usa para cotizar.</p>
            </div>
            <span className="ssbe-badge">Regimen General 2025</span>
          </div>
          <nav className="ssbe-tabs" aria-label="Secciones">
            <button type="button" className="is-active"><Info size={18} />Explicacion</button>
            <button type="button"><Users size={18} />Ejemplos</button>
            <button type="button"><CircleHelp size={18} />Preguntas frecuentes</button>
          </nav>
        </header>

        <div className="ssbe-grid">
          <aside className="ssbe-card ssbe-inputs" aria-labelledby="ssbe-inputs-title">
            <div className="ssbe-card-title">
              <ExplainerIcon icon={<User size={22} />} tone="blue" />
              <h2 id="ssbe-inputs-title">Tus datos</h2>
            </div>

            <FieldShell label="Ano" icon={<Database size={17} aria-hidden="true" />}>
              <select value="2025" aria-label="Ano" onChange={() => undefined}>
                <option>2025</option>
              </select>
            </FieldShell>

            <FieldShell label="Grupo profesional" icon={<Users size={17} aria-hidden="true" />}>
              <select value="Grupo 1" aria-label="Grupo profesional" onChange={() => undefined}>
                <option>Grupo 1</option>
              </select>
            </FieldShell>

            <FieldShell label="Salario mensual" icon={<span aria-hidden="true">€</span>}>
              <input value="1.700 €" aria-label="Salario mensual" onChange={() => undefined} />
            </FieldShell>

            <div className="ssbe-segmented-field">
              <span>Numero de pagas</span>
              <div className="ssbe-segmented" role="group" aria-label="Numero de pagas">
                <button type="button">12</button>
                <button type="button" className="is-selected">14</button>
              </div>
            </div>

            <label className="ssbe-toggle-row">
              <span>Prorratear extras</span>
              <input type="checkbox" checked onChange={() => undefined} />
              <i aria-hidden="true" />
            </label>

            <p className="ssbe-help">
              <Info size={16} aria-hidden="true" />
              Al activar, prorrateas la paga extra cada mes, si cotizas por una parte de ella cada mes.
            </p>

            <div className="ssbe-scenario-chips" aria-label="Escenarios">
              <button type="button" className="is-active"><CheckCircle2 size={14} />Caso minimo</button>
              <button type="button">Caso normal</button>
              <button type="button">Caso maximo</button>
            </div>
          </aside>

          <section className="ssbe-card ssbe-calculation" aria-labelledby="ssbe-calc-title">
            <div className="ssbe-card-title">
              <ExplainerIcon icon={<Calculator size={22} />} tone="blue" />
              <h2 id="ssbe-calc-title">Como se calcula</h2>
            </div>

            <div className="ssbe-steps" aria-label="Flujo de calculo">
              <article className="ssbe-step ssbe-step--green">
                <h3><StepNumber value={1} tone="green" />Calcula tu base real</h3>
                <p>Salario mensual + prorrata de extras</p>
                <strong>Base real: {formatEuro(baseReal)}</strong>
              </article>
              <ArrowRight className="ssbe-step-arrow" size={28} aria-hidden="true" />
              <article className="ssbe-step ssbe-step--purple">
                <h3><StepNumber value={2} tone="purple" />Comparala con los limites</h3>
                <div className="ssbe-limit-chips">
                  <span>Base minima grupo 1: {formatEuro(minBase)}</span>
                  <span>Base maxima: {formatEuro(maxBase)}</span>
                </div>
              </article>
              <ArrowRight className="ssbe-step-arrow" size={28} aria-hidden="true" />
              <article className="ssbe-step ssbe-step--blue">
                <h3><StepNumber value={3} tone="blue" />Obten la base final</h3>
                <strong>Base de cotizacion: {formatEuro(finalBase)}</strong>
              </article>
            </div>

            <div className="ssbe-range" aria-label="Comparacion de bases entre cero y seis mil euros">
              <div className="ssbe-range-track" />
              <span className="ssbe-marker ssbe-marker--real" style={{ left: baseRealPosition }}>
                <b>Tu base real</b>
                <strong>{formatEuro(baseReal)}</strong>
              </span>
              <span className="ssbe-marker ssbe-marker--min" style={{ left: minBasePosition }}>
                <b>Minimo grupo 1</b>
                <strong>{formatEuro(minBase)}</strong>
                <em>Base que se usa: {formatEuro(finalBase)}</em>
              </span>
              <span className="ssbe-marker ssbe-marker--max" style={{ left: maxBasePosition }}>
                <b>Maximo</b>
                <strong>{formatEuro(maxBase)}</strong>
              </span>
              <div className="ssbe-range-scale">
                <span>0 €</span>
                <span>6.000 €</span>
              </div>
            </div>

            <div className="ssbe-mini-flow" aria-label="Efecto posterior de la base usada">
              <span><Database size={30} />Base usada</span>
              <ArrowRight size={24} aria-hidden="true" />
              <span><ShieldCheck size={30} />Cotizacion SS</span>
              <ArrowRight size={24} aria-hidden="true" />
              <span><Wallet size={30} />Neto</span>
              <ArrowRight size={24} aria-hidden="true" />
              <span><Percent size={30} />IRPF</span>
            </div>
          </section>

          <aside className="ssbe-results" aria-label="Resultado en tiempo real">
            <section className="ssbe-card ssbe-result-card">
              <div className="ssbe-card-title">
                <ExplainerIcon icon={<Activity size={22} />} tone="blue" />
                <h2>Resultado en tiempo real</h2>
              </div>
              <div className="ssbe-result-top">
                <dl>
                  <div><dt>Base real mensual</dt><dd>{formatEuro(baseReal)}</dd></div>
                  <div><dt>Base minima grupo 1</dt><dd>{formatEuro(minBase)}</dd></div>
                  <div><dt>Base maxima</dt><dd>{formatEuro(maxBase)}</dd></div>
                </dl>
                <div className="ssbe-final-base">
                  <span>Base de cotizacion final</span>
                  <strong>{formatEuro(finalBase)}</strong>
                  <em><CheckCircle2 size={17} />Se aplica el minimo</em>
                </div>
              </div>
              <div className="ssbe-rule">
                <span><ArrowUpRight size={18} />Si sube la base: sube la SS</span>
                <span><ArrowDown size={18} />Si baja la base: baja la SS</span>
              </div>
            </section>

            <section className="ssbe-card ssbe-social-card">
              <div className="ssbe-card-title">
                <ExplainerIcon icon={<ShieldCheck size={22} />} tone="blue" />
                <h2>Cotizacion social mensual</h2>
              </div>
              <div className="ssbe-contribution-cards">
                <article className="ssbe-contribution ssbe-contribution--worker">
                  <User size={34} aria-hidden="true" />
                  <span>Trabajador</span>
                  <strong>{formatEuro(employeeContribution)}</strong>
                  <small>al mes</small>
                  <b>17,5%</b>
                </article>
                <article className="ssbe-contribution ssbe-contribution--company">
                  <Building2 size={34} aria-hidden="true" />
                  <span>Empresa</span>
                  <strong>{formatEuro(employerContribution)}</strong>
                  <small>al mes</small>
                  <b>82,5%</b>
                </article>
              </div>
              <p className="ssbe-total">Total cotizacion social: {formatEuro(totalContribution)} al mes</p>
              <p className="ssbe-note">
                <Info size={18} aria-hidden="true" />
                Aproximacion mensual para contrato indefinido en Regimen General 2025. AT/EP no incluidas; depende de la actividad de la empresa.
              </p>
            </section>
          </aside>

          <section className="ssbe-card ssbe-examples" aria-labelledby="ssbe-examples-title">
            <div className="ssbe-card-title">
              <ExplainerIcon icon={<Rocket size={22} />} tone="blue" />
              <h2 id="ssbe-examples-title">Ejemplos rapidos</h2>
            </div>
            <div className="ssbe-example-row">
              <QuickExample tone="orange" label="Base maxima" before="6.000 €" after="4.909,50 €" text="Se aplica el maximo" />
              <QuickExample tone="purple" label="Base minima grupo 1" before="1.700 €" after="1.929,00 €" text="Se aplica el minimo" />
              <QuickExample tone="blue" label="Sin cambios" before={<>1.500 €<small>en grupo 4</small></>} after="1.500 €" text="Sin cambios" />
            </div>
            <div className="ssbe-dots" aria-hidden="true"><span className="is-active" /><span /><span /></div>
          </section>
        </div>

        <section className="ssbe-card ssbe-explanation" aria-labelledby="ssbe-explanation-title">
          <div className="ssbe-explanation-header">
            <ExplainerIcon icon={<Info size={24} />} tone="blue" />
            <h2 id="ssbe-explanation-title">Como afecta a tus impuestos y a tu nomina</h2>
            <span>Resumen practico</span>
          </div>
          <div className="ssbe-explanation-grid">
            <ExplanationBlock
              tone="green"
              number={1}
              title="Si actua la base minima"
              icon={<Coins size={28} />}
              items={[
                'La base usada para cotizar sube al minimo del grupo.',
                'Pagas mas Seguridad Social que con tu base real.',
                'Tu neto mensual suele bajar un poco.',
                'El IRPF puede bajar ligeramente, porque el rendimiento neto baja algo.',
              ]}
            />
            <ExplanationBlock
              tone="blue"
              number={2}
              title="Si estas dentro del rango"
              icon={<Activity size={28} />}
              items={[
                'Se usa tu base real.',
                'No hay ajuste por minimos ni maximos.',
                'La cotizacion y el IRPF siguen el comportamiento normal de tu salario.',
              ]}
            />
            <ExplanationBlock
              tone="orange"
              number={3}
              title="Si actua la base maxima"
              icon={<Coins size={28} />}
              items={[
                'La base usada para cotizar se limita al tope maximo.',
                'La cotizacion social deja de subir al mismo ritmo.',
                'Tu neto puede ser algo mayor que sin tope.',
                'El IRPF no se topa: sigue calculandose sobre tu salario y reducciones.',
              ]}
            />
            <article className="ssbe-key">
              <KeyRound size={38} aria-hidden="true" />
              <h3>La idea clave</h3>
              <p><CheckCircle2 size={18} />Base minima y maxima afectan sobre todo a la cotizacion social.</p>
              <p><CheckCircle2 size={18} />El IRPF se ve afectado de forma indirecta, no por el limite en si.</p>
            </article>
          </div>
        </section>
      </div>
    </section>
  )
}
