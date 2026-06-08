import {
  Accessibility,
  Baby,
  ChevronDown,
  Euro,
  FileText,
  Info,
  User,
  UserRound,
  UsersRound,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { DisabilityMode } from './types'
import './FiscalPersonalDataCard.css'

type FiscalPersonalDataCardProps = {
  childrenCount: number
  childrenUnder3: number
  ascendants: number
  disability: DisabilityMode
  autonomicDeduction: number
  onChildrenCountChange: (value: number) => void
  onChildrenUnder3Change: (value: number) => void
  onAscendantsChange: (value: number) => void
  onDisabilityChange: (value: DisabilityMode) => void
  onAutonomicDeductionChange: (value: number) => void
}

type StepperRowProps = {
  icon: ReactNode
  label: string
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function StepperRow({ icon, label, value, min = 0, max, onChange }: StepperRowProps) {
  const decrease = () => onChange(clamp(value - 1, min, max))
  const increase = () => onChange(clamp(value + 1, min, max))

  return (
    <li className="fpdc-row">
      <span className="fpdc-row__icon" aria-hidden="true">{icon}</span>
      <span className="fpdc-row__label">{label}</span>
      <div className="fpdc-stepper" role="group" aria-label={label}>
        <button type="button" onClick={decrease} disabled={value <= min} aria-label={`Reducir ${label}`}>
          -
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={increase} disabled={value >= max} aria-label={`Aumentar ${label}`}>
          +
        </button>
      </div>
    </li>
  )
}

export function FiscalPersonalDataCard({
  childrenCount,
  childrenUnder3,
  ascendants,
  disability,
  autonomicDeduction,
  onChildrenCountChange,
  onChildrenUnder3Change,
  onAscendantsChange,
  onDisabilityChange,
  onAutonomicDeductionChange,
}: FiscalPersonalDataCardProps) {
  const handleChildrenCount = (value: number) => {
    const nextValue = clamp(value, 0, 8)
    onChildrenCountChange(nextValue)
    if (childrenUnder3 > nextValue) onChildrenUnder3Change(nextValue)
  }

  return (
    <section className="fpdc" aria-labelledby="fpdc-title">
      <header className="fpdc-header">
        <span className="fpdc-header__icon" aria-hidden="true">
          <UserRound size={35} strokeWidth={1.9} />
        </span>
        <h2 id="fpdc-title">Tus datos</h2>
      </header>

      <ul className="fpdc-list">
        <StepperRow
          icon={<User size={23} strokeWidth={1.9} />}
          label="Hijos con derecho a minimo"
          value={childrenCount}
          max={8}
          onChange={handleChildrenCount}
        />
        <StepperRow
          icon={<Baby size={24} strokeWidth={1.9} />}
          label="Hijos menores de 3 anos"
          value={childrenUnder3}
          max={8}
          onChange={(value) => {
            const nextValue = clamp(value, 0, 8)
            onChildrenUnder3Change(nextValue)
            if (nextValue > childrenCount) onChildrenCountChange(nextValue)
          }}
        />
        <StepperRow
          icon={<UsersRound size={25} strokeWidth={1.9} />}
          label="Ascendientes a cargo"
          value={ascendants}
          max={4}
          onChange={(value) => onAscendantsChange(clamp(value, 0, 4))}
        />

        <li className="fpdc-row">
          <span className="fpdc-row__icon" aria-hidden="true"><Accessibility size={25} strokeWidth={1.9} /></span>
          <label className="fpdc-row__label" htmlFor="fpdc-disability">Discapacidad trabajador</label>
          <div className="fpdc-select-shell">
            <select
              id="fpdc-disability"
              value={disability}
              onChange={(event) => onDisabilityChange(event.target.value as DisabilityMode)}
            >
              <option value="none">No</option>
              <option value="33_64">33% a 64%</option>
              <option value="65_or_more">65% o mas</option>
            </select>
            <ChevronDown size={18} strokeWidth={2.3} aria-hidden="true" />
          </div>
        </li>

        <li className="fpdc-row">
          <span className="fpdc-row__icon" aria-hidden="true"><FileText size={24} strokeWidth={1.9} /></span>
          <label className="fpdc-row__label" htmlFor="fpdc-autonomic-deduction">Deduccion autonomica verificada</label>
          <div className="fpdc-euro-shell">
            <Euro size={21} strokeWidth={2.2} aria-hidden="true" />
            <input
              id="fpdc-autonomic-deduction"
              type="number"
              min={0}
              step={50}
              value={autonomicDeduction}
              onChange={(event) => onAutonomicDeductionChange(Math.max(0, Number(event.target.value)))}
              aria-label="Deduccion autonomica verificada en euros"
            />
          </div>
        </li>
      </ul>

      <p className="fpdc-note">
        <span aria-hidden="true"><Info size={16} strokeWidth={2.1} /></span>
        Estos datos se usan para calcular tus deducciones fiscales.
      </p>
    </section>
  )
}
