import {
  Bookmark,
  ChevronRight,
  Info,
  Landmark,
  LockKeyhole,
  PiggyBank,
  Receipt,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react'
import { DashboardPanel } from '../DashboardPanel'
import { InfoButton } from '../InfoButton'
import {
  CHANGE_ITEMS,
  FISCAL_KPIS,
  FISCAL_MENU,
  SUMMARY_ITEMS,
  TABLE_ROWS,
  USER_DATA,
} from './data'
import { Donut } from './Donut'
import { FiscalLineChart } from './FiscalLineChart'
import { MenuIcon } from './MenuIcon'
import './FiscalWorkerDashboard.css'

function FiscalSidebar() {
  return (
    <aside className="fwd-sidebar">
      <div className="fwd-brand">
        <div className="fwd-logo" aria-hidden="true"><span /><span /></div>
        <div>
          <h1>Calculadora Fiscal del Trabajador</h1>
          <p>Tus números, tu futuro.</p>
        </div>
      </div>

      <nav className="fwd-nav" aria-label="Secciones">
        {FISCAL_MENU.map((item, index) => (
          <button key={item} className={index === 0 ? 'is-active' : ''} type="button">
            <MenuIcon id={item.toLowerCase()} />
            {item}
          </button>
        ))}
      </nav>

      <div className="fwd-tools">
        <p>Herramientas</p>
        <button type="button"><Receipt size={15} /> Tabla de tramos IRPF</button>
        <button type="button"><Landmark size={15} /> Bases y tipos 2025-2030</button>
        <button type="button"><Info size={15} /> Guía rápida</button>
      </div>

      <div className="fwd-promo">
        <Sparkles size={18} />
        <strong>¿Eres más experto?</strong>
        <p>Guarda escenarios, compáralos y entiende cada euro.</p>
        <button type="button">Crear cuenta gratis</button>
      </div>

      <div className="fwd-sidebar-footer">
        <span>Aviso legal</span><span>Privacidad</span><span>Términos</span>
        <small>© 2026 Calculadora Fiscal del Trabajador</small>
        <button type="button"><LockKeyhole size={16} /> Modo oscuro</button>
      </div>
    </aside>
  )
}

function FiscalHeader() {
  return (
    <header className="fwd-header">
      <div>
        <h2>Compara tu salario neto, impuestos y pensiones entre dos años</h2>
        <p>Estimaciones orientativas en base a la normativa vigente en 2025 y proyecciones para 2030.</p>
      </div>
      <div className="fwd-actions">
        <button type="button"><Bookmark size={16} /> Guardar escenario</button>
        <button type="button"><Share2 size={16} /> Compartir</button>
        <button type="button" aria-label="Información"><Info size={18} /></button>
      </div>
    </header>
  )
}

function ComparisonControls() {
  return (
    <section className="fwd-controls" aria-label="Controles de comparación">
      <label>Año A<select defaultValue="2025"><option>2025</option></select></label>
      <label>Año B<select defaultValue="2030"><option>2030</option></select></label>
      <div className="fwd-slider">
        <div><span>Salario bruto anual <em>(mismo en ambos años)</em></span><b>35.000 €</b></div>
        <input type="range" min="20000" max="100000" defaultValue="35000" aria-label="Salario bruto anual" />
        <div className="fwd-scale"><span>20.000 €</span><span>30.000 €</span><span>40.000 €</span><span>50.000 €</span><span>70.000 €</span><span>100.000 €</span></div>
      </div>
      <label className="fwd-switch">
        Ajustar por inflación
        <InfoButton label="Información sobre inflación" size="sm">
          <p>Control visual para comparar importes reales o nominales.</p>
        </InfoButton>
        <input type="checkbox" />
        <span />
      </label>
    </section>
  )
}

function KpiRow() {
  return (
    <section className="fwd-kpis" aria-label="KPIs comparativos">
      {FISCAL_KPIS.map((kpi) => (
        <article className={`fwd-kpi fwd-tone-${kpi.tone}`} key={kpi.title}>
          <div>{kpi.icon}<strong>{kpi.title}</strong></div>
          <dl><div><dt>2025</dt><dd>{kpi.a}</dd></div><div><dt>2030</dt><dd>{kpi.b}</dd></div></dl>
          <p>{kpi.delta}</p>
        </article>
      ))}
    </section>
  )
}

function SummaryPanel() {
  return (
    <DashboardPanel className="fwd-panel" title="Resumen del cambio" density="compact">
      <ul className="fwd-summary">
        {SUMMARY_ITEMS.map((item) => (
          <li className={`fwd-tone-${item.tone}`} key={item.title}>
            <span>{item.icon}</span>
            <div><strong>{item.title}</strong><small>2025 {item.a} · 2030 {item.b}</small></div>
            <b>{item.delta}</b>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  )
}

function GrossVsNetPanel() {
  return (
    <DashboardPanel className="fwd-panel" title="Bruto vs Neto" headerAside={<span className="fwd-mini-legend"><i /> Neto <i /> Carga fiscal total</span>} density="compact">
      <div className="fwd-stack-bars">
        <div><strong>2025</strong><span><i style={{ width: '68%' }}>27.100 € (77,4%)</i><em style={{ width: '32%' }}>13.777 € (39,4%)</em></span><b>35.000 €</b></div>
        <div><strong>2030</strong><span><i style={{ width: '65%' }}>26.480 € (75,6%)</i><em style={{ width: '35%' }}>14.660 € (41,9%)</em></span><b>35.000 €</b></div>
        <p><span>0 €</span><span>10.000 €</span><span>20.000 €</span><span>30.000 €</span><span>40.000 €</span></p>
      </div>
    </DashboardPanel>
  )
}

function PensionPanel() {
  return (
    <DashboardPanel className="fwd-panel fwd-pension" title="¿Cómo cambia tu aportación a pensiones?" subtitle="Comparación de la aportación anual" density="compact">
      <div className="fwd-pension-flow">
        <span className="fwd-round-icon"><Users size={31} /></span>
        <div><small>2025</small><strong>2.187 €</strong></div>
        <ChevronRight size={28} />
        <div className="is-delta"><small>Diferencia</small><strong>+223 €<br />(+10,2%)</strong></div>
        <ChevronRight size={28} />
        <div><small>2030</small><strong>2.410 €</strong></div>
        <span className="fwd-round-icon is-blue"><PiggyBank size={31} /></span>
      </div>
      <p>Esta aportación financia tu futura pensión a través del sistema público.</p>
      <a href="#metodologia">Saber más sobre las pensiones →</a>
    </DashboardPanel>
  )
}

function UserDataPanel() {
  return (
    <DashboardPanel className="fwd-panel" title="Tus datos" density="compact">
      <ul className="fwd-data-list">
        {USER_DATA.map(([label, value]) => (
          <li key={label}><span>{label}</span><b>{value}</b><ChevronRight size={14} /></li>
        ))}
        <li className="fwd-data-toggle"><span>Estoy en 14 pagas</span><b className="is-on" /></li>
      </ul>
    </DashboardPanel>
  )
}

function YearChangesPanel() {
  return (
    <DashboardPanel className="fwd-panel" title="¿Qué cambia entre años?" subtitle="Diferencia en la carga fiscal anual" density="compact">
      <div className="fwd-change-bars">
        {CHANGE_ITEMS.map(([label, value, width, tone]) => (
          <div className={`fwd-tone-${tone}`} key={label}>
            <span>{label}</span><i><em style={{ width: `${width}%` }} /></i><b>{value}</b>
          </div>
        ))}
      </div>
      <div className="fwd-total-delta"><span>Total diferencia carga fiscal</span><strong>+883 € (+6,4%)</strong></div>
    </DashboardPanel>
  )
}

function DistributionPanel() {
  return (
    <DashboardPanel className="fwd-panel" title="Distribución del salario bruto" subtitle="Composición de la distribución del salario bruto (35.000 €)" density="compact">
      <div className="fwd-donuts">
        <Donut year="2025" net="27.100 € (77,4%)" irpf="5.840 € (16,7%)" ss="2.450 € (7,0%)" iva="2.320 € (6,6%)" other="980 € (2,8%)" />
        <Donut year="2030" net="26.480 € (75,6%)" irpf="6.050 € (17,3%)" ss="2.690 € (7,7%)" iva="2.480 € (7,1%)" other="1.030 € (2,9%)" />
      </div>
      <p className="fwd-note">Las cantidades pueden variar según deducciones y circunstancias personales.</p>
    </DashboardPanel>
  )
}

function DetailTablePanel() {
  return (
    <DashboardPanel className="fwd-panel" title="Detalle comparativo" density="compact">
      <div className="fwd-table-wrap">
        <table className="fwd-table">
          <thead><tr><th>Concepto</th><th>2025</th><th>2030</th><th>Δ</th><th>Δ (%)</th></tr></thead>
          <tbody>
            {TABLE_ROWS.map((row) => (
              <tr key={row[0]}>
                <th>{row[0]}</th>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td className={row[3].startsWith('-') ? 'is-negative' : 'is-positive'}>{row[3]}</td>
                <td className={row[4].startsWith('-') ? 'is-negative' : 'is-positive'}>{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  )
}

export function FiscalWorkerDashboard() {
  return (
    <div className="fwd">
      <FiscalSidebar />
      <main className="fwd-main">
        <FiscalHeader />
        <ComparisonControls />
        <KpiRow />

        <section className="fwd-content">
          <div className="fwd-column">
            <SummaryPanel />
            <GrossVsNetPanel />
          </div>

          <div className="fwd-column fwd-column--center">
            <DashboardPanel className="fwd-panel fwd-panel--hero" title="Evolución comparada 2025 vs 2030" density="compact">
              <FiscalLineChart />
            </DashboardPanel>
            <PensionPanel />
          </div>

          <div className="fwd-column">
            <UserDataPanel />
            <YearChangesPanel />
          </div>
        </section>

        <section className="fwd-bottom">
          <DistributionPanel />
          <DetailTablePanel />
        </section>
      </main>
    </div>
  )
}

export default FiscalWorkerDashboard
