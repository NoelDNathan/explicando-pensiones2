/**
 * FooterNote
 *
 * Slim two-column footer used at the bottom of dashboards. Left column
 * holds a methodological disclaimer; right column holds a source line.
 * Both slots accept ReactNode so consumers can format text freely.
 */

import type { ReactNode } from 'react'
import './FooterNote.css'

export type FooterNoteProps = {
  left?: ReactNode
  right?: ReactNode
  /** Show a small info glyph at the left of the disclaimer. */
  withIcon?: boolean
  className?: string
}

function GlyphInfo() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 7v4M8 5v.01"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FooterNote({
  left,
  right,
  withIcon = true,
  className,
}: FooterNoteProps) {
  const rootClass = ['fn', className].filter(Boolean).join(' ')

  return (
    <footer className={rootClass}>
      <div className="fn__left">
        {withIcon && (
          <span className="fn__glyph" aria-hidden="true">
            <GlyphInfo />
          </span>
        )}
        {left && <p className="fn__text">{left}</p>}
      </div>

      {right && <p className="fn__source">{right}</p>}
    </footer>
  )
}

export default FooterNote
