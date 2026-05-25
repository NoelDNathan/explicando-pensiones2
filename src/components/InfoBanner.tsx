/**
 * InfoBanner
 *
 * Thin horizontal banner used at the top of a dashboard surface to
 * surface a single methodological note or scope reminder. Renders an
 * info glyph followed by the supplied text. Purely presentational.
 *
 * Variants `dark` / `light` map to the project palette. Uses the same
 * dark-surface tokens as the population pyramid and metric cards.
 */

import type { ReactNode } from 'react'
import './InfoBanner.css'

export type InfoBannerVariant = 'dark' | 'light'
export type InfoBannerTone = 'info' | 'neutral'

export type InfoBannerProps = {
  children: ReactNode
  variant?: InfoBannerVariant
  tone?: InfoBannerTone
  className?: string
}

function GlyphInfo() {
  return (
    <svg
      className="info-banner__glyph"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 7v4M8 5v.01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function InfoBanner({
  children,
  variant = 'dark',
  tone = 'info',
  className,
}: InfoBannerProps) {
  const rootClass = [
    'info-banner',
    `info-banner--${variant}`,
    `info-banner--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass} role="note">
      <span className="info-banner__icon" aria-hidden="true">
        <GlyphInfo />
      </span>
      <p className="info-banner__text">{children}</p>
    </div>
  )
}

export default InfoBanner
