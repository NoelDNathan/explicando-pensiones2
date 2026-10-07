/*
 * Bloque «Tu situación» de la v3: un filtro de lo que aplica en lugar de las
 * catorce preguntas del paso 5. Solo se abren los campos de lo marcado. Produce
 * el mismo PersonalReductionResult que el formulario completo, con el mismo
 * constructor, así que lo que se ajuste después en «Cómo se calcula» parte de aquí.
 */
import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import type { PersonalReductionResult } from '../../worker-salary-dashboard'
import { createDependentProfiles } from '../familyMinimum2025'
import type { DependentProfile, DisabilityPercent } from '../familyMinimum2025'
import { createEmptyIrpf2025Adjustments } from '../irpf2025Adjustments'
import { buildPersonalReductionResult } from '../personalReductionResult'
import { V3Amount, V3Counter } from './V3Parts'

type ChipId = 'hijos' | 'ascendientes' | 'discapacidad' | 'plan' | 'cuotas' | 'donativos' | 'otra'

const CHIPS: { id: ChipId; label: string }[] = [
  { id: 'hijos', label: 'Hijos' },
  { id: 'ascendientes', label: 'Padres o abuelos a cargo' },
  { id: 'discapacidad', label: 'Discapacidad reconocida' },
  { id: 'plan', label: 'Plan de pensiones' },
  { id: 'cuotas', label: 'Cuota sindical o colegio obligatorio' },
  { id: 'donativos', label: 'Donativos a ONG' },
  { id: 'otra', label: 'Otra cosa' },
]

type Share = '1' | '0.5'

function reshapeProfiles(
  existing: DependentProfile[],
  count: number,
  type: 'descendant' | 'ascendant',
  specialCount: number,
  share: Share,
): DependentProfile[] {
  const special = type === 'descendant' ? 'under3' : '75_plus'
  const regular = type === 'descendant' ? '3_to_24' : '65_74'
  return Array.from({ length: count }, (_, index) => {
    const base = existing[index] ?? createDependentProfiles(1, type)[0]
    const ageBand = index < specialCount ? special : base.ageBand === special ? regular : base.ageBand
    return { ...base, ageBand, entitlementShare: type === 'descendant' ? share : base.entitlementShare }
  })
}

export function V3Situacion({ initial, context, onChange, onLearn }: {
  initial: PersonalReductionResult | null
  context: { baseBeforeReductions: number; netWorkIncome: number; declaredGrossWorkIncome: number }
  onChange: (result: PersonalReductionResult) => void
  /** Abre el modo «Aprender» en el paso indicado (4, 5 o 7). */
  onLearn: (stepId: number) => void
}) {
  const adjustments0 = initial?.adjustments
  const [selected, setSelected] = useState<Set<ChipId>>(() => {
    const set = new Set<ChipId>()
    if ((initial?.children ?? 0) > 0) set.add('hijos')
    if ((initial?.ascendants ?? 0) > 0) set.add('ascendientes')
    if ((initial?.disabilityPercent ?? 0) > 0) set.add('discapacidad')
    if ((adjustments0?.personalPensionContribution ?? 0) > 0) set.add('plan')
    if ((adjustments0?.unionDues ?? 0) + (adjustments0?.professionalDues ?? 0) > 0) set.add('cuotas')
    if ((adjustments0?.donationAmount ?? 0) > 0) set.add('donativos')
    return set
  })
  const [children, setChildren] = useState(() => Math.max(1, initial?.children ?? 1))
  const [childrenUnder3, setChildrenUnder3] = useState(() =>
    (initial?.descendantProfiles ?? []).slice(0, initial?.children ?? 0).filter((p) => p.ageBand === 'under3').length,
  )
  const [share, setShare] = useState<Share>(() => initial?.descendantProfiles?.[0]?.entitlementShare ?? '0.5')
  const [ascendants, setAscendants] = useState(() => Math.max(1, initial?.ascendants ?? 1))
  const [ascendantsOver75, setAscendantsOver75] = useState(() =>
    (initial?.ascendantProfiles ?? []).slice(0, initial?.ascendants ?? 0).filter((p) => p.ageBand === '75_plus').length,
  )
  const [disability, setDisability] = useState<33 | 65>(() => (initial?.disabilityPercent === 65 ? 65 : 33))
  const [pension, setPension] = useState(adjustments0?.personalPensionContribution ?? 0)
  const [unionDues, setUnionDues] = useState(adjustments0?.unionDues ?? 0)
  const [professionalDues, setProfessionalDues] = useState(adjustments0?.professionalDues ?? 0)
  const [donations, setDonations] = useState(adjustments0?.donationAmount ?? 0)
  const [touched, setTouched] = useState(false)

  const has = (id: ChipId) => selected.has(id)
  const toggle = (id: ChipId) => {
    setTouched(true)
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const clearAll = () => {
    setTouched(true)
    setSelected(new Set())
  }
  const touch = <T,>(setter: (value: T) => void) => (value: T) => {
    setTouched(true)
    setter(value)
  }

  const result = useMemo(() => {
    const childCount = has('hijos') ? children : 0
    const ascendantCount = has('ascendientes') ? ascendants : 0
    const disabilityPercent: DisabilityPercent = has('discapacidad') ? disability : 0
    const base = initial?.adjustments ?? createEmptyIrpf2025Adjustments({ maritalStatus: initial?.maritalStatus ?? 'single' })
    const professional = has('cuotas') ? professionalDues : 0
    return buildPersonalReductionResult({
      children: childCount,
      ascendants: ascendantCount,
      disabilityPercent,
      taxpayerAssistance: initial?.taxpayerAssistance ?? 'no',
      maritalStatus: initial?.maritalStatus ?? 'single',
      descendantProfiles: reshapeProfiles(initial?.descendantProfiles ?? [], childCount, 'descendant', Math.min(childrenUnder3, childCount), share),
      ascendantProfiles: reshapeProfiles(initial?.ascendantProfiles ?? [], ascendantCount, 'ascendant', Math.min(ascendantsOver75, ascendantCount), '1'),
      adjustments: {
        ...base,
        personalPensionContribution: has('plan') ? pension : 0,
        unionDues: has('cuotas') ? unionDues : 0,
        professionalDues: professional,
        professionalMembershipMandatory: professional > 0,
        donationAmount: has('donativos') ? donations : 0,
        donationLaw49Eligible: has('donativos') && donations > 0,
      },
      baseBeforeReductions: context.baseBeforeReductions,
      netWorkIncome: context.netWorkIncome,
      declaredGrossWorkIncome: context.declaredGrossWorkIncome,
    })
    // `has` lee `selected`, que ya está en las dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, children, childrenUnder3, share, ascendants, ascendantsOver75, disability, pension, unionDues, professionalDues, donations, initial, context.baseBeforeReductions, context.netWorkIncome, context.declaredGrossWorkIncome])

  /*
   * Solo se envía lo que la persona ha tocado: hasta entonces la situación sigue
   * siendo un supuesto y el cálculo no cambia. `initial` llega del padre y cambia
   * con cada envío: por eso no está en las dependencias, o se enviaría en bucle.
   */
  useEffect(() => {
    if (touched) onChange(result)
    // Solo cuando cambian las respuestas, no cuando el padre devuelve el resultado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched, selected, children, childrenUnder3, share, ascendants, ascendantsOver75, disability, pension, unionDues, professionalDues, donations])

  return (
    <div className="v3-situacion d-stack">
      <fieldset className="v3-filter">
        <legend className="v3-filter__legend">Marca lo que quieras, o ninguno</legend>
        <div className="v3-filter__chips">
          {CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className="v3-toggle"
              aria-pressed={has(chip.id)}
              onClick={() => toggle(chip.id)}
            >
              {has(chip.id) ? <Check size={18} aria-hidden="true" /> : null}
              {chip.label}
            </button>
          ))}
          <button type="button" className="v3-toggle v3-toggle--none" aria-pressed={touched && selected.size === 0} onClick={clearAll}>
            Ninguna de estas
          </button>
        </div>
        <p className="d-note">
          Lo usamos solo para el cálculo y no sale de tu navegador. Si no estás seguro de algo,
          déjalo sin marcar: lo marcaremos como supuesto.
        </p>
      </fieldset>

      {has('hijos') ? (
        <section className="v3-detail d-unfold" aria-label="Hijos">
          <h3 className="v3-detail__title">Hijos</h3>
          <V3Counter label="¿Cuántos?" help="Menores de 25 que viven contigo y ganan menos de 8.000 € al año." value={children} min={1} max={6} onChange={touch(setChildren)} />
          <V3Counter label="De ellos, menores de 3 años" value={Math.min(childrenUnder3, children)} max={children} onChange={touch(setChildrenUnder3)} />
          <div className="v3-field">
            <div className="v3-field__text">
              <span className="v3-field__label">¿Lo declaras solo tú?</span>
              <span className="v3-field__help">Si el otro progenitor también declara, la parte por hijos se reparte a medias.</span>
            </div>
            <div className="d-segs" role="group" aria-label="Reparto por hijos">
              <button type="button" aria-pressed={share === '0.5'} onClick={() => touch(setShare)('0.5')}>A medias</button>
              <button type="button" aria-pressed={share === '1'} onClick={() => touch(setShare)('1')}>Solo yo</button>
            </div>
          </div>
        </section>
      ) : null}

      {has('ascendientes') ? (
        <section className="v3-detail d-unfold" aria-label="Padres o abuelos a cargo">
          <h3 className="v3-detail__title">Padres o abuelos a cargo</h3>
          <V3Counter label="¿Cuántos?" help="Mayores de 65 que viven contigo y ganan menos de 8.000 € al año." value={ascendants} min={1} max={4} onChange={touch(setAscendants)} />
          <V3Counter label="De ellos, mayores de 75" value={Math.min(ascendantsOver75, ascendants)} max={ascendants} onChange={touch(setAscendantsOver75)} />
        </section>
      ) : null}

      {has('discapacidad') ? (
        <section className="v3-detail d-unfold" aria-label="Discapacidad reconocida">
          <h3 className="v3-detail__title">Discapacidad reconocida</h3>
          <div className="v3-field">
            <div className="v3-field__text">
              <span className="v3-field__label">Grado</span>
              <span className="v3-field__help">El que figura en tu certificado.</span>
            </div>
            <div className="d-segs" role="group" aria-label="Grado de discapacidad">
              <button type="button" aria-pressed={disability === 33} onClick={() => touch(setDisability)(33)}>Del 33 al 64 %</button>
              <button type="button" aria-pressed={disability === 65} onClick={() => touch(setDisability)(65)}>65 % o más</button>
            </div>
          </div>
        </section>
      ) : null}

      {has('plan') ? (
        <section className="v3-detail d-unfold" aria-label="Plan de pensiones">
          <h3 className="v3-detail__title">Plan de pensiones</h3>
          <V3Amount label="Lo que aportas tú al año" help="Solo tus aportaciones, no las de tu empresa." value={pension} onChange={touch(setPension)} />
        </section>
      ) : null}

      {has('cuotas') ? (
        <section className="v3-detail d-unfold" aria-label="Cuotas">
          <h3 className="v3-detail__title">Cuota sindical o colegio obligatorio</h3>
          <V3Amount label="Cuota sindical" value={unionDues} onChange={touch(setUnionDues)} />
          <V3Amount label="Colegio profesional" help="Solo si tu profesión exige colegiarse para trabajar." value={professionalDues} onChange={touch(setProfessionalDues)} />
        </section>
      ) : null}

      {has('donativos') ? (
        <section className="v3-detail d-unfold" aria-label="Donativos">
          <h3 className="v3-detail__title">Donativos a ONG</h3>
          <V3Amount label="Lo que donaste en 2025" help="A entidades que te dan certificado de la donación." value={donations} onChange={touch(setDonations)} />
        </section>
      ) : null}

      {has('otra') ? (
        <section className="v3-detail d-unfold" aria-label="Otra situación">
          <h3 className="v3-detail__title">Otra cosa</h3>
          <p className="d-small">
            Tickets de comida, transporte, seguro médico o guardería pagados por la empresa;
            alquiler o compra de vivienda antiguos; mutualidad; declaración conjunta; maternidad,
            familia numerosa o guardería. Se ajustan en el detalle de cada paso; lo que pongas
            allí también cuenta aquí.
          </p>
          <div className="d-row">
            <button type="button" className="d-outline" onClick={() => onLearn(4)}>Lo que paga la empresa sin dinero</button>
            <button type="button" className="d-outline" onClick={() => onLearn(5)}>Reducciones y familia</button>
            <button type="button" className="d-outline" onClick={() => onLearn(7)}>Deducciones</button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
