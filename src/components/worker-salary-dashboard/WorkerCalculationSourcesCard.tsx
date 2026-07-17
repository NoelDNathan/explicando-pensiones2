import { ExternalLink, FileCheck2, Landmark } from 'lucide-react'
import './WorkerCalculationSourcesCard.css'

export type CalculationSourceItem = {
  id: string
  name: string
  officialSource: string
  sourceDetail: string
  url: string
  urlLabel: string
  values: Array<{ name: string; value: string }>
  status?: 'official' | 'estimated'
  note?: string
}

type WorkerCalculationSourcesCardProps = {
  year?: number
  items?: CalculationSourceItem[]
}

const DEMO_ITEMS: CalculationSourceItem[] = [
  {
    id: 'demo-social-security',
    name: 'Bases y tipos de cotizacion',
    officialSource: 'Boletin Oficial del Estado (BOE)',
    sourceDetail: 'Orden PJC/178/2025, de 25 de febrero',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2025-3780',
    urlLabel: 'boe.es · Orden PJC/178/2025',
    values: [
      { name: 'Base aplicada', value: '2.916,67 €/mes' },
      { name: 'Tipo trabajador', value: '6,48 %' },
    ],
  },
  {
    id: 'demo-irpf',
    name: 'Escala estatal del IRPF',
    officialSource: 'Agencia Estatal de Administracion Tributaria (AEAT)',
    sourceDetail: 'Manual practico Renta 2025',
    url: 'https://sede.agenciatributaria.gob.es/',
    urlLabel: 'sede.agenciatributaria.gob.es · Renta 2025',
    values: [
      { name: 'Base liquidable', value: '25.430,00 €' },
      { name: 'Cuota estatal', value: '2.580,00 €' },
    ],
  },
]

export function WorkerCalculationSourcesCard({ year = 2025, items = DEMO_ITEMS }: WorkerCalculationSourcesCardProps) {
  return (
    <section className="wcsc" aria-labelledby="wcsc-title">
      <header className="wcsc-header">
        <div className="wcsc-heading">
          <span className="wcsc-kicker"><FileCheck2 size={16} aria-hidden="true" /> Trazabilidad del calculo</span>
          <h2 id="wcsc-title">Fuentes y valores utilizados</h2>
          <p>
            Este es el origen de cada parametro aplicado al resultado de {year}. Los valores reflejan tus selecciones actuales; los enlaces llevan al documento oficial.
          </p>
        </div>
        <div className="wcsc-seal" aria-label={`${items.length} fuentes documentadas`}>
          <Landmark size={24} aria-hidden="true" />
          <strong>{items.length}</strong>
          <span>fuentes</span>
        </div>
      </header>

      <div className="wcsc-list">
        {items.map((item, index) => (
          <article className="wcsc-source" key={item.id}>
            <div className="wcsc-source-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
            <div className="wcsc-source-copy">
              <div className="wcsc-source-title">
                <div>
                  <h3>{item.name}</h3>
                  <p><strong>{item.officialSource}</strong> · {item.sourceDetail}</p>
                </div>
                <span className={`wcsc-status wcsc-status--${item.status ?? 'official'}`}>
                  {item.status === 'estimated' ? 'Estimacion' : 'Oficial'}
                </span>
              </div>

              <dl className="wcsc-values">
                {item.values.map((entry) => (
                  <div key={`${item.id}-${entry.name}`}>
                    <dt>{entry.name}</dt>
                    <dd>{entry.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="wcsc-source-footer">
                <a href={item.url} target="_blank" rel="noreferrer">
                  <span>{item.urlLabel}</span>
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
                {item.note ? <p>{item.note}</p> : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="wcsc-disclaimer">
        La calculadora es didactica. Los enlaces permiten comprobar los parametros, pero el resultado no sustituye una nomina, una liquidacion tributaria ni asesoramiento profesional.
      </p>
    </section>
  )
}

export default WorkerCalculationSourcesCard
