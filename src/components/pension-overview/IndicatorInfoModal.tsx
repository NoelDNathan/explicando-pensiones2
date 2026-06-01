import { useEffect, type ReactNode } from 'react'
import {
  CalendarDays,
  Clock3,
  Database,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  Globe2,
  HelpCircle,
  Info,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react'
import './IndicatorInfoModal.css'

type IndicatorInfoModalProps = {
  open: boolean
  onClose: () => void
}

const tabs = ['Resumen', 'Fuentes', 'Metodologia', 'Notas', 'Descargas']

const definitions = [
  ['Edad de trabajar', 'poblacion entre 16 y la edad legal de jubilacion.'],
  ['Tasa de reemplazo', 'pension inicial media / ultimo salario medio.'],
  ['Relacion cotizantes / pensionistas', 'numero de cotizantes por cada pensionista.'],
]

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <article className="iim-stat-card">
      <span className="iim-stat-card__icon" aria-hidden="true">{icon}</span>
      <span className="iim-stat-card__label">{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function DownloadButton({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <button type="button" className="iim-download-button">
      <span>{children}</span>
      {icon}
    </button>
  )
}

export function IndicatorInfoModal({ open, onClose }: IndicatorInfoModalProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="iim-layer" role="presentation">
      <button
        type="button"
        className="iim-backdrop"
        aria-label="Cerrar informacion del indicador"
        onClick={onClose}
      />

      <section
        className="iim-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="indicator-info-title"
        aria-describedby="indicator-info-subtitle"
      >
        <header className="iim-header">
          <span className="iim-header__icon" aria-hidden="true">
            <Info size={28} strokeWidth={2.1} />
          </span>
          <div className="iim-header__copy">
            <h2 id="indicator-info-title">Informacion del indicador</h2>
            <p id="indicator-info-subtitle">Piramide poblacional de Espana</p>
          </div>
          <button type="button" className="iim-close" aria-label="Cerrar" onClick={onClose}>
            <X size={26} strokeWidth={1.8} />
          </button>
        </header>

        <nav className="iim-tabs" aria-label="Informacion del indicador">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`iim-tab${tab === 'Fuentes' ? ' iim-tab--active' : ''}`}
              aria-current={tab === 'Fuentes' ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="iim-content">
          <div className="iim-main-column">
            <section className="iim-section">
              <div className="iim-section__title">
                <Info size={16} />
                <h3>Fuente de informacion</h3>
              </div>
              <ul className="iim-list">
                <li><strong>INE</strong> - Cifras de poblacion a 1 de enero de 2025</li>
                <li>Proyecciones de poblacion 2022-2070</li>
                <li>Seguridad Social, AIReF, Banco de Espana, IGAE</li>
              </ul>
            </section>

            <section className="iim-section">
              <div className="iim-section__title">
                <Database size={16} />
                <h3>Metodologia</h3>
              </div>
              <p>
                Este indicador combina datos demograficos oficiales y proyecciones
                economicas para ofrecer una vision integrada de la estructura
                poblacional de Espana. Los datos se armonizan para permitir
                simulaciones y comparaciones en el tiempo.
              </p>
              <ol className="iim-steps">
                <li><strong>Recopilacion:</strong> obtencion de datos oficiales de fuentes publicas.</li>
                <li><strong>Limpieza:</strong> validacion y depuracion de series temporales y clasificaciones.</li>
                <li><strong>Normalizacion:</strong> unificacion de criterios y definiciones entre fuentes.</li>
                <li><strong>Proyeccion:</strong> aplicacion de modelos demograficos y economicos para 2022-2070.</li>
                <li><strong>Validacion:</strong> contraste con series historicas y revision de coherencia.</li>
              </ol>
            </section>

            <section className="iim-section">
              <div className="iim-section__title">
                <HelpCircle size={16} />
                <h3>Definiciones clave</h3>
              </div>
              <ul className="iim-list">
                {definitions.map(([term, detail]) => (
                  <li key={term}><strong>{term}:</strong> {detail}</li>
                ))}
              </ul>
            </section>

            <section className="iim-section">
              <div className="iim-section__title">
                <ShieldCheck size={16} />
                <h3>Limitaciones y supuestos</h3>
              </div>
              <p>
                Las proyecciones dependen de supuestos sobre fecundidad,
                mortalidad, migraciones, empleo, productividad y politicas
                publicas. Los resultados son aproximaciones sujetas a incertidumbre.
              </p>
            </section>
          </div>

          <aside className="iim-side-column" aria-label="Ficha tecnica y descargas">
            <div className="iim-side-panel">
              <InfoCard icon={<CalendarDays size={26} />} label="Ultima actualizacion" value="Enero 2025" />
              <InfoCard icon={<Globe2 size={26} />} label="Cobertura" value="Espana" />
              <InfoCard icon={<Clock3 size={26} />} label="Frecuencia" value="Anual" />
              <InfoCard icon={<ShieldCheck size={26} />} label="Nivel de confianza" value="Datos oficiales" />
            </div>

            <div className="iim-side-panel">
              <h3 className="iim-side-title"><Download size={18} /> Descargas</h3>
              <DownloadButton icon={<FileText size={17} />}>CSV</DownloadButton>
              <DownloadButton icon={<FileDown size={17} />}>PDF</DownloadButton>
              <DownloadButton icon={<ExternalLink size={18} />}>Ver fuente original</DownloadButton>
            </div>

            <div className="iim-side-panel iim-help-panel">
              <h3 className="iim-side-title"><HelpCircle size={18} /> Mas informacion</h3>
              <p>¿Dudas o sugerencias? Escribenos y te ayudaremos.</p>
              <a href="mailto:info@pensionesenespana.es">
                <Mail size={16} />
                info@pensionesenespana.es
              </a>
            </div>
          </aside>
        </div>

        <footer className="iim-footer">
          <button type="button" className="iim-primary-action">
            Ver fuente original
            <ExternalLink size={19} />
          </button>
          <button type="button" className="iim-secondary-action" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  )
}

export default IndicatorInfoModal
