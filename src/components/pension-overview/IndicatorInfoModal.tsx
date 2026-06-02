import { useEffect, type ReactNode } from 'react'
import {
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react'
import './IndicatorInfoModal.css'

export type IndicatorInfoModalTab = {
  label: string
  active?: boolean
}

export type IndicatorInfoModalSection = {
  title: string
  icon?: ReactNode
  body?: ReactNode
  items?: ReactNode[]
  orderedItems?: ReactNode[]
}

export type IndicatorInfoModalStat = {
  label: string
  value: string
  icon?: ReactNode
}

export type IndicatorInfoModalDownload = {
  label: string
  icon?: ReactNode
}

export type IndicatorInfoModalContent = {
  title: string
  subtitle: string
  tabs?: IndicatorInfoModalTab[]
  sections: IndicatorInfoModalSection[]
  stats?: IndicatorInfoModalStat[]
  downloads?: IndicatorInfoModalDownload[]
  help?: {
    title: string
    body: ReactNode
    href?: string
    linkLabel?: string
    icon?: ReactNode
  }
  primaryActionLabel?: string
}

export type IndicatorInfoModalProps = {
  open: boolean
  onClose: () => void
  content: IndicatorInfoModalContent
}

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

function sectionIcon(section: IndicatorInfoModalSection) {
  if (section.icon) return section.icon

  const title = section.title.toLowerCase()
  if (title.includes('definiciones')) return <HelpCircle size={16} />
  if (title.includes('limitaciones') || title.includes('supuestos')) return <ShieldCheck size={16} />
  return <Info size={16} />
}

function DownloadButton({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <button type="button" className="iim-download-button">
      <span>{children}</span>
      {icon ?? <FileText size={17} />}
    </button>
  )
}

export function IndicatorInfoModal({ open, onClose, content }: IndicatorInfoModalProps) {
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
        aria-label={`Cerrar ${content.title}`}
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
            <h2 id="indicator-info-title">{content.title}</h2>
            <p id="indicator-info-subtitle">{content.subtitle}</p>
          </div>
          <button type="button" className="iim-close" aria-label="Cerrar" onClick={onClose}>
            <X size={26} strokeWidth={1.8} />
          </button>
        </header>

        {content.tabs && content.tabs.length > 0 && (
          <nav className="iim-tabs" aria-label={content.title}>
            {content.tabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                className={`iim-tab${tab.active ? ' iim-tab--active' : ''}`}
                aria-current={tab.active ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        <div className="iim-content">
          <div className="iim-main-column">
            {content.sections.map((section) => (
              <section className="iim-section" key={section.title}>
                <div className="iim-section__title">
                  {sectionIcon(section)}
                  <h3>{section.title}</h3>
                </div>

                {section.body && <div className="iim-section__body">{section.body}</div>}

                {section.items && section.items.length > 0 && (
                  <ul className="iim-list">
                    {section.items.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                )}

                {section.orderedItems && section.orderedItems.length > 0 && (
                  <ol className="iim-steps">
                    {section.orderedItems.map((item, index) => <li key={index}>{item}</li>)}
                  </ol>
                )}
              </section>
            ))}
          </div>

          <aside className="iim-side-column" aria-label="Ficha tecnica y descargas">
            {content.stats && content.stats.length > 0 && (
              <div className="iim-side-panel">
                {content.stats.map((stat) => (
                  <InfoCard
                    key={stat.label}
                    icon={stat.icon ?? <CalendarDays size={26} />}
                    label={stat.label}
                    value={stat.value}
                  />
                ))}
              </div>
            )}

            {content.downloads && content.downloads.length > 0 && (
              <div className="iim-side-panel">
                <h3 className="iim-side-title"><Download size={18} /> Descargas</h3>
                {content.downloads.map((download) => (
                  <DownloadButton key={download.label} icon={download.icon}>
                    {download.label}
                  </DownloadButton>
                ))}
              </div>
            )}

            {content.help && (
              <div className="iim-side-panel iim-help-panel">
                <h3 className="iim-side-title">
                  {content.help.icon ?? <HelpCircle size={18} />} {content.help.title}
                </h3>
                <div className="iim-help-panel__body">{content.help.body}</div>
                {content.help.href && content.help.linkLabel && (
                  <a href={content.help.href}>
                    <Mail size={16} />
                    {content.help.linkLabel}
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>

        <footer className="iim-footer">
          <button type="button" className="iim-primary-action">
            {content.primaryActionLabel ?? 'Ver fuente original'}
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
