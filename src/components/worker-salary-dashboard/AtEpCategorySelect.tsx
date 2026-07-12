import { ChevronDown, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { OccupationalAccidentsCategory } from './WorkerSocialContributionsCard'
import './AtEpCategorySelect.css'

const percentFormatter = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  style: 'percent',
})

function formatPercent(value: number) {
  return percentFormatter.format(Number.isFinite(value) ? value : 0)
}

type AtEpCategorySelectProps = {
  categories: OccupationalAccidentsCategory[]
  value: string
  onChange: (categoryId: string) => void
  label?: string
  disabled?: boolean
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function matchesCategoryQuery(category: OccupationalAccidentsCategory, query: string) {
  if (!query) return true
  const haystack = normalizeSearchText(`${category.code} ${category.label} ${category.kind}`)
  return haystack.includes(query)
}

function AtEpRatePills({ category }: { category: OccupationalAccidentsCategory }) {
  const totalPercent = category.it_percent + category.ims_percent

  return (
    <span className="atep-select__rates" aria-hidden="true">
      <span className="atep-select__rate atep-select__rate--it">
        <span>IT</span>
        <strong>{formatPercent(category.it_percent / 100)}</strong>
      </span>
      <span className="atep-select__rate atep-select__rate--ims">
        <span>IMS</span>
        <strong>{formatPercent(category.ims_percent / 100)}</strong>
      </span>
      <span className="atep-select__rate atep-select__rate--total">
        <span>Total</span>
        <strong>{formatPercent(totalPercent / 100)}</strong>
      </span>
    </span>
  )
}

function AtEpCategoryPreview({ category }: { category: OccupationalAccidentsCategory }) {
  return (
    <span className="atep-select__preview">
      <span className="atep-select__identity">
        <span className="atep-select__code">{category.code}</span>
        <span className="atep-select__label">{category.label}</span>
      </span>
      <AtEpRatePills category={category} />
    </span>
  )
}

export function AtEpCategorySelect({
  categories,
  value,
  onChange,
  label = 'Actividad AT/EP',
  disabled = false,
}: AtEpCategorySelectProps) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === value) ?? categories[0],
    [categories, value],
  )

  const normalizedQuery = useMemo(() => normalizeSearchText(searchQuery), [searchQuery])

  const filteredCategories = useMemo(
    () => categories.filter((category) => matchesCategoryQuery(category, normalizedQuery)),
    [categories, normalizedQuery],
  )

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    searchRef.current?.focus()

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    setActiveIndex(0)
  }, [normalizedQuery, isOpen])

  const selectCategory = (categoryId: string) => {
    onChange(categoryId)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, Math.max(filteredCategories.length - 1, 0)))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
      return
    }

    if (event.key === 'Enter' && filteredCategories[activeIndex]) {
      event.preventDefault()
      selectCategory(filteredCategories[activeIndex].id)
    }
  }

  return (
    <div
      className={`atep-select${isOpen ? ' atep-select--open' : ''}${disabled ? ' atep-select--disabled' : ''}`}
      ref={rootRef}
    >
      <span className="atep-select__label" id={`${listboxId}-label`}>
        {label}
      </span>

      <button
        type="button"
        className="atep-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={`${listboxId}-label`}
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          setIsOpen((current) => !current)
          if (isOpen) setSearchQuery('')
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        {selectedCategory ? <AtEpCategoryPreview category={selectedCategory} /> : <span>Selecciona actividad</span>}
        <ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" className="atep-select__chevron" />
      </button>

      {isOpen && (
        <div className="atep-select__panel">
          <label className="atep-select__search">
            <Search size={16} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={searchQuery}
              placeholder="Buscar por codigo o actividad"
              aria-controls={listboxId}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </label>

          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={`${listboxId}-label`}
            className="atep-select__options"
          >
            {filteredCategories.length === 0 ? (
              <p className="atep-select__empty">No hay actividades que coincidan con tu busqueda.</p>
            ) : (
              filteredCategories.map((category, index) => {
                const isSelected = category.id === value
                const isActive = index === activeIndex

                return (
                  <button
                    key={category.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`atep-select__option${isSelected ? ' atep-select__option--selected' : ''}${isActive ? ' atep-select__option--active' : ''}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectCategory(category.id)}
                  >
                    <AtEpCategoryPreview category={category} />
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AtEpCategorySelect
