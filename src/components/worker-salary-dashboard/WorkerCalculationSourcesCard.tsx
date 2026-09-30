import { ExternalLink, FileCheck2, Landmark } from 'lucide-react'
import './WorkerCalculationSourcesCard.css'
import type { CSSProperties } from 'react'
import { useFiscalVariant } from '../fiscal-worker-dashboard/fiscalVariant'
import './escenario/D.css'
import './escenario/EscenarioSources.css'

export type CalculationSourceItem = {
  id: string
  name: string
  officialSource: string
  sourceDetail: string
  url: string
  urlLabel: string
  /** Norma complementaria, como una correccion de erratas, cuando el dataset la declara. */
  supportingUrl?: string
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
    name: 'Bases y tipos de cotización',
    officialSource: 'Boletín Oficial del Estado (BOE)',
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
    officialSource: 'Agencia Estatal de Administración Tributaria (AEAT)',
    sourceDetail: 'Manual práctico Renta 2025',
    url: 'https://sede.agenciatributaria.gob.es/',
    urlLabel: 'sede.agenciatributaria.gob.es · Renta 2025',
    values: [
      { name: 'Base liquidable', value: '25.430,00 €' },
      { name: 'Cuota estatal', value: '2.580,00 €' },
    ],
  },
]

const SOURCE_TONES = ['worker', 'company', 'red', 'red', 'blue'] as const

export function WorkerCalculationSourcesCard({ year = 2025, items = DEMO_ITEMS }: WorkerCalculationSourcesCardProps) {
  const isEscenario = useFiscalVariant() === 'escenario'

  if (isEscenario) {
    return (
      <section className="d-page esc-src" aria-labelledby="wcsc-title">
        <div className="esc-src__head">
          <div className="d-stack">
            <span className="d-caps">Trazabilidad del cálculo</span>
            <h2 id="wcsc-title" className="d-h1" style={{ '--d-chars': 11 } as CSSProperties}>
              Fuentes y valores <span className="d-acc">utilizados</span>
            </h2>
          </div>
          <div className="esc-src__seal" aria-label={`${items.length} fuentes documentadas`}>
            <strong className="d-fig d-acc d-pop">{items.length}</strong>
            <span className="d-sub">fuentes</span>
          </div>
        </div>
        <p className="d-lead d-rise d-close">
          Este es el origen de cada parámetro aplicado al resultado de {year}. Los valores reflejan tus selecciones actuales; los enlaces llevan al documento oficial.
        </p>

        <div className="esc-src__list">
          {items.map((item, index) => (
            <article key={item.id} className={`esc-src__item esc-src__item--${SOURCE_TONES[index % SOURCE_TONES.length]}`}>
              <span className="esc-src__n" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="d-stack">
                <div className="esc-src__title">
                  <h3 className="d-h3 d-h3--big">{item.name}</h3>
                  <span className={`d-chip esc-src__status esc-src__status--${item.status ?? 'official'}`}>
                    {item.status === 'estimated' ? 'Estimación' : 'Oficial'}
                  </span>
                </div>
                <p className="d-note"><strong>{item.officialSource}</strong> · {item.sourceDetail}</p>
                <dl className="esc-src__values">
                  {item.values.map((entry) => (
                    <div key={`${item.id}-${entry.name}`}>
                      <dt className="d-lab">{entry.name}</dt>
                      <dd className={entry.value.length > 18 ? 'esc-src__long' : undefined}>{entry.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="d-row esc-src__links">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {item.urlLabel} <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="d-note">Sin enlace registrado para este parámetro.</p>
                  )}
                  {item.supportingUrl ? (
                    <a href={item.supportingUrl} target="_blank" rel="noreferrer">
                      Norma complementaria <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
                {item.note ? <p className="d-note">{item.note}</p> : null}
              </div>
            </article>
          ))}
        </div>

        <p className="d-txt d-close">
          La calculadora es didáctica. Los enlaces permiten comprobar los parámetros, pero el resultado no sustituye una nómina, una liquidación tributaria ni asesoramiento profesional.
        </p>
      </section>
    )
  }

  return (
    <section className="wcsc" aria-labelledby="wcsc-title">
      <header className="wcsc-header">
        <div className="wcsc-heading">
          <span className="wcsc-kicker"><FileCheck2 size={16} aria-hidden="true" /> Trazabilidad del cálculo</span>
          <h2 id="wcsc-title">Fuentes y valores utilizados</h2>
          <p>
            Este es el origen de cada parámetro aplicado al resultado de {year}. Los valores reflejan tus selecciones actuales; los enlaces llevan al documento oficial.
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
                  {item.status === 'estimated' ? 'Estimación' : 'Oficial'}
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
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <span>{item.urlLabel}</span>
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                ) : (
                  <p className="wcsc-source-nolink">Sin enlace registrado para este parámetro.</p>
                )}
                {item.supportingUrl ? (
                  <a href={item.supportingUrl} target="_blank" rel="noreferrer">
                    <span>Norma complementaria</span>
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                ) : null}
                {item.note ? <p>{item.note}</p> : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="wcsc-disclaimer">
        La calculadora es didáctica. Los enlaces permiten comprobar los parámetros, pero el resultado no sustituye una nómina, una liquidación tributaria ni asesoramiento profesional.
      </p>
    </section>
  )
}

export default WorkerCalculationSourcesCard
