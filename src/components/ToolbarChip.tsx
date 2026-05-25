/**
 * ToolbarChip
 *
 * Compact pill-shaped control used in dashboard toolbars. Three modes:
 *   - `button`: leading icon + label + optional chevron, fires onClick.
 *   - `select`: native `<select>` styled to match the chip, with leading
 *     icon and a value-aware label.
 *   - `icon`: square icon-only variant for actions like "more".
 *
 * Provides a single consistent look across dashboard headers so we do
 * not duplicate styles for the year selector, view selector and action
 * buttons.
 */

import type { ChangeEvent, ReactNode } from 'react'
import './ToolbarChip.css'

export type ToolbarChipMode = 'button' | 'select' | 'icon'
export type ToolbarChipTone = 'default' | 'accent'

type CommonProps = {
  icon?: ReactNode
  tone?: ToolbarChipTone
  className?: string
  ariaLabel?: string
}

export type ToolbarChipButtonProps = CommonProps & {
  mode?: 'button'
  label: ReactNode
  /** Right-side indicator (e.g. green dot for "view active"). */
  indicator?: boolean
  /** Show a small chevron after the label. */
  chevron?: boolean
  onClick?: () => void
}

export type ToolbarChipSelectProps = CommonProps & {
  mode: 'select'
  value: string
  options: { value: string; label: string }[]
  onChange?: (value: string) => void
  /** Optional prefix shown before the value (e.g. "Año"). */
  prefix?: string
}

export type ToolbarChipIconProps = CommonProps & {
  mode: 'icon'
  onClick?: () => void
}

export type ToolbarChipProps =
  | ToolbarChipButtonProps
  | ToolbarChipSelectProps
  | ToolbarChipIconProps

function ChevronDownIcon() {
  return (
    <svg
      className="tch__chevron"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ToolbarChip(props: ToolbarChipProps) {
  const { icon, tone = 'default', className, ariaLabel } = props
  const rootClass = [
    'tch',
    `tch--${tone}`,
    `tch--${props.mode ?? 'button'}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (props.mode === 'select') {
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
      props.onChange?.(event.target.value)
    }
    const selectedLabel =
      props.options.find((opt) => opt.value === props.value)?.label ?? props.value
    return (
      <label className={rootClass} aria-label={ariaLabel}>
        {icon && (
          <span className="tch__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="tch__label">
          {props.prefix && <span className="tch__prefix">{props.prefix} </span>}
          {selectedLabel}
        </span>
        <ChevronDownIcon />
        <select
          className="tch__select"
          value={props.value}
          onChange={handleChange}
        >
          {props.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (props.mode === 'icon') {
    return (
      <button
        type="button"
        className={rootClass}
        aria-label={ariaLabel ?? 'Acción'}
        onClick={props.onClick}
      >
        {icon}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={rootClass}
      aria-label={ariaLabel}
      onClick={props.onClick}
    >
      {icon && (
        <span className="tch__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="tch__label">{props.label}</span>
      {props.indicator && <span className="tch__dot" aria-hidden="true" />}
      {props.chevron && <ChevronDownIcon />}
    </button>
  )
}

export default ToolbarChip
