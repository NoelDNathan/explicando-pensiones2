/**
 * InfoButton
 *
 * Compact circular control for contextual help on chart panels. Uses the same
 * dark-surface tokens as PopulationPyramid (`on-dark` variant) or the light
 * editorial palette (`on-light`). Opens a small popover on click; closes on
 * Escape, outside click, or a second click on the trigger.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import './InfoButton.css'

export type InfoButtonVariant = 'on-dark' | 'on-light'
export type InfoButtonSize = 'sm' | 'md'
export type InfoButtonPlacement = 'bottom' | 'top' | 'start' | 'end'

export type InfoButtonProps = {
  /** Accessible name for the trigger, e.g. "Information about this chart". */
  label: string
  children: ReactNode
  variant?: InfoButtonVariant
  size?: InfoButtonSize
  placement?: InfoButtonPlacement
  className?: string
  disabled?: boolean
}

const VARIANT_CLASS: Record<InfoButtonVariant, string> = {
  'on-dark': 'info-button--on-dark',
  'on-light': 'info-button--on-light',
}

const SIZE_CLASS: Record<InfoButtonSize, string> = {
  sm: 'info-button--sm',
  md: '',
}

const PLACEMENT_CLASS: Record<InfoButtonPlacement, string> = {
  bottom: 'info-button--placement-bottom',
  top: 'info-button--placement-top',
  start: 'info-button--placement-start',
  end: 'info-button--placement-end',
}

function InfoIcon() {
  return (
    <svg
      className="info-button__icon"
      viewBox="0 0 14 14"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M7 6.25v3.5M7 4.5v.01"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function InfoButton({
  label,
  children,
  variant = 'on-dark',
  size = 'md',
  placement = 'bottom',
  className,
  disabled = false,
}: InfoButtonProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  const panelId = useId()

  const close = useCallback(() => setOpen(false), [])

  const toggle = useCallback(() => {
    if (disabled) return
    setOpen((prev) => !prev)
  }, [disabled])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (!root || root.contains(event.target as Node)) return
      close()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, close])

  const rootClassName = [
    'info-button',
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    PLACEMENT_CLASS[placement],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={rootClassName} ref={rootRef}>
      <button
        type="button"
        className="info-button__trigger"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        onClick={toggle}
      >
        <InfoIcon />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={label}
          className="info-button__panel"
        >
          {children}
        </div>
      )}
    </span>
  )
}

export default InfoButton
