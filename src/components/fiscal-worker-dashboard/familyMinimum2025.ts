export type DisabilityPercent = 0 | 33 | 65

export type DependentProfile = {
  livesWith: 'yes' | 'no'
  ownIncome: 'no_more_than_8000' | 'over_8000'
  filesReturn: 'no_or_up_to_1800' | 'over_1800'
  disabilityPercent: '0' | '33' | '65'
  assistance: 'yes' | 'no'
  ageBand: string
  entitlementShare: '1' | '0.5'
  childSupportAnnual: number
  childSupportFormalized: boolean
}

export type Minimums2025 = {
  taxpayer_general?: number
  taxpayer_over_65_increment?: number
  taxpayer_over_75_additional_increment?: number
  descendants?: number[]
  descendant_under_3_increment?: number
  ascendant_over_65_or_disabled?: number
  ascendant_over_75_additional_increment?: number
  disability_33_to_64?: number
  disability_65_or_more?: number
  disability_assistance_or_reduced_mobility_increment?: number
  descendant_disability_33_to_64?: number
  descendant_disability_65_or_more?: number
  disability_assistance_or_reduced_mobility_increment_general?: number
}

export function createDependentProfiles(count: number, type: 'descendant' | 'ascendant'): DependentProfile[] {
  return Array.from({ length: count }, () => ({
    livesWith: 'yes',
    ownIncome: 'no_more_than_8000',
    filesReturn: 'no_or_up_to_1800',
    disabilityPercent: '0',
    assistance: 'no',
    ageBand: type === 'descendant' ? '3_to_24' : '65_74',
    entitlementShare: '1',
    childSupportAnnual: 0,
    childSupportFormalized: false,
  }))
}

export function qualifiesDependent(profile: DependentProfile, type: 'descendant' | 'ascendant') {
  const baseEligible = profile.livesWith === 'yes'
    && profile.ownIncome === 'no_more_than_8000'
    && profile.filesReturn === 'no_or_up_to_1800'
  if (!baseEligible) return false
  if (type === 'descendant' && profile.ageBand === '25_plus_disabled') return profile.disabilityPercent !== '0'
  if (type === 'ascendant' && profile.ageBand === 'under65_disabled') return profile.disabilityPercent !== '0'
  return true
}

export function countsForJointUnit(profile: DependentProfile) {
  if (profile.livesWith !== 'yes') return false
  if (profile.ageBand === 'under3' || profile.ageBand === '3_to_24') return true
  if (profile.ageBand === '25_plus_disabled' && profile.disabilityPercent !== '0') return true
  return false
}

function disabilityMinimum(
  minimums: Minimums2025,
  profile: DependentProfile,
  type: 'descendant' | 'ascendant',
) {
  const disability33 = type === 'descendant'
    ? minimums.descendant_disability_33_to_64 ?? minimums.disability_33_to_64 ?? 0
    : minimums.disability_33_to_64 ?? 0
  const disability65 = type === 'descendant'
    ? minimums.descendant_disability_65_or_more ?? minimums.disability_65_or_more ?? 0
    : minimums.disability_65_or_more ?? 0
  const base = profile.disabilityPercent === '65'
    ? disability65
    : profile.disabilityPercent === '33'
      ? disability33
      : 0
  const assistanceAmount = minimums.disability_assistance_or_reduced_mobility_increment
    ?? minimums.disability_assistance_or_reduced_mobility_increment_general
    ?? 0
  const assistance = base > 0 && (profile.assistance === 'yes' || profile.disabilityPercent === '65')
    ? assistanceAmount
    : 0
  return (base + assistance) * Number(profile.entitlementShare)
}

export function calculateFamilyMinimum2025(args: {
  minimums: Minimums2025
  age: number
  disabilityPercent: DisabilityPercent
  taxpayerAssistance: boolean
  descendants: DependentProfile[]
  ascendants: DependentProfile[]
}) {
  const { minimums, age, disabilityPercent, taxpayerAssistance } = args
  let total = minimums.taxpayer_general ?? 0
  if (age >= 65) total += minimums.taxpayer_over_65_increment ?? 0
  if (age >= 75) total += minimums.taxpayer_over_75_additional_increment ?? 0
  if (disabilityPercent === 33) total += minimums.disability_33_to_64 ?? 0
  if (disabilityPercent === 65) total += minimums.disability_65_or_more ?? 0
  if (disabilityPercent > 0 && (taxpayerAssistance || disabilityPercent === 65)) {
    total += minimums.disability_assistance_or_reduced_mobility_increment
      ?? minimums.disability_assistance_or_reduced_mobility_increment_general
      ?? 0
  }

  const eligibleDescendants = args.descendants.filter((profile) => (
    qualifiesDependent(profile, 'descendant')
    && !(profile.childSupportAnnual > 0 && profile.childSupportFormalized)
  ))
  eligibleDescendants.forEach((profile, index) => {
    const share = Number(profile.entitlementShare)
    const descendantAmounts = minimums.descendants ?? []
    total += (descendantAmounts[Math.min(index, descendantAmounts.length - 1)] ?? 0) * share
    if (profile.ageBand === 'under3') total += (minimums.descendant_under_3_increment ?? 0) * share
    total += disabilityMinimum(minimums, profile, 'descendant')
  })

  const eligibleAscendants = args.ascendants.filter((profile) => qualifiesDependent(profile, 'ascendant'))
  eligibleAscendants.forEach((profile) => {
    const share = Number(profile.entitlementShare)
    total += (minimums.ascendant_over_65_or_disabled ?? 0) * share
    if (profile.ageBand === '75_plus') total += (minimums.ascendant_over_75_additional_increment ?? 0) * share
    total += disabilityMinimum(minimums, profile, 'ascendant')
  })

  return {
    total,
    eligibleDescendants,
    eligibleAscendants,
    childSupportPaid: args.descendants.reduce(
      (sum, profile) => sum + (profile.childSupportFormalized ? Math.max(0, profile.childSupportAnnual) : 0),
      0,
    ),
  }
}
