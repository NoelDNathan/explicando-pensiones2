/*
 * Arma el resultado de la situacion personal (hijos, ascendientes, discapacidad,
 * reducciones y deducciones) que consume el motor del IRPF. Lo comparten el
 * formulario completo de los pasos 4, 5 y 7 y el bloque «Tu situación» de la v3,
 * para que las dos vias produzcan exactamente el mismo objeto.
 */
import type { MaritalStatus, PersonalReductionResult } from '../worker-salary-dashboard/WorkerPersonalReductionsCard'
import { qualifiesDependent } from './familyMinimum2025'
import type { DependentProfile, DisabilityPercent } from './familyMinimum2025'
import { calculateBaseReductions2025 } from './irpf2025Adjustments'
import type { Irpf2025AdjustmentInput } from './irpf2025Adjustments'

export function withoutChildSupport(profile: DependentProfile): DependentProfile {
  if (profile.childSupportAnnual === 0 && !profile.childSupportFormalized) return profile
  return { ...profile, childSupportAnnual: 0, childSupportFormalized: false }
}

export function buildPersonalReductionResult(args: {
  children: number
  ascendants: number
  disabilityPercent: DisabilityPercent
  taxpayerAssistance: string
  maritalStatus: MaritalStatus
  descendantProfiles: DependentProfile[]
  ascendantProfiles: DependentProfile[]
  adjustments: Irpf2025AdjustmentInput
  baseBeforeReductions: number
  netWorkIncome: number
  declaredGrossWorkIncome: number
}): PersonalReductionResult {
  const {
    children,
    ascendants,
    disabilityPercent,
    taxpayerAssistance,
    maritalStatus,
    descendantProfiles,
    ascendantProfiles,
    adjustments,
    declaredGrossWorkIncome,
  } = args
  const selectedDescendants = descendantProfiles.slice(0, children)
  const selectedAscendants = ascendantProfiles.slice(0, ascendants)
  const eligibleDescendants = selectedDescendants.filter((profile) =>
    qualifiesDependent(profile, 'descendant'),
  )
  const eligibleAscendants = selectedAscendants.filter((profile) =>
    qualifiesDependent(profile, 'ascendant'),
  )
  const effectiveAdjustments: Irpf2025AdjustmentInput = {
    ...adjustments,
    childSupportPaid: 0,
    childSupportFormalized: false,
    childSupportMinimumExcluded: false,
  }
  const dependentDisabilityMinimum = [...eligibleDescendants, ...eligibleAscendants].reduce(
    (sum, profile) => {
      const base =
        profile.disabilityPercent === '65'
          ? 9_000
          : profile.disabilityPercent === '33'
            ? 3_000
            : 0
      const assistance =
        base > 0 && (profile.assistance === 'yes' || profile.disabilityPercent === '65')
          ? 3_000
          : 0
      return sum + (base + assistance) * Number(profile.entitlementShare)
    },
    0,
  )
  const taxpayerDisabilityAssistanceMinimum =
    disabilityPercent > 0 && (taxpayerAssistance === 'yes' || disabilityPercent === 65)
      ? 3_000
      : 0
  const baseBeforeReductions = Math.max(0, args.baseBeforeReductions)
  const netWorkIncomeForReductions = Math.max(0, args.netWorkIncome || baseBeforeReductions)
  const reductionsTotal = calculateBaseReductions2025(
    effectiveAdjustments,
    netWorkIncomeForReductions,
    baseBeforeReductions,
    0,
    0,
    declaredGrossWorkIncome,
  ).totalApplied
  const deductionsTotal =
    effectiveAdjustments.donationAmount +
    effectiveAdjustments.rentPaid +
    effectiveAdjustments.homeInvestmentPaid +
    effectiveAdjustments.newCompanyInvestment

  return {
    children,
    eligibleChildren: eligibleDescendants.length,
    childrenUnder3: eligibleDescendants.filter((profile) => profile.ageBand === 'under3').length,
    disabilityPercent,
    taxpayerAssistance,
    taxpayerDisabilityAssistanceMinimum,
    maritalStatus,
    ascendants,
    eligibleAscendants: eligibleAscendants.length,
    ascendantsOver75: eligibleAscendants.filter((profile) => profile.ageBand === '75_plus').length,
    dependentDisabilityMinimum,
    descendantProfiles: descendantProfiles.map(withoutChildSupport),
    ascendantProfiles,
    adjustments: effectiveAdjustments,
    reductionsTotal,
    deductionsTotal,
    calculationWarnings: [],
    reductionLines: {
      pensionPlans: effectiveAdjustments.personalPensionContribution,
      companyPensionPlan:
        effectiveAdjustments.employerPensionContribution +
        effectiveAdjustments.workerEmploymentPensionContribution,
      mutualities: effectiveAdjustments.mutualityContribution,
      compensatoryPension: effectiveAdjustments.compensatoryPensionPaid,
      childSupport: 0,
      jointTaxation: effectiveAdjustments.jointTaxationType !== 'individual',
      protectedAssets: effectiveAdjustments.protectedAssetsContribution,
      unionAndProfessionalFees:
        effectiveAdjustments.unionDues + effectiveAdjustments.professionalDues,
    },
    deductionLines: {
      maternity: effectiveAdjustments.maternityEligible ? 'applies' : 'none',
      daycare: String(effectiveAdjustments.daycareTotalExpense),
      largeFamily: effectiveAdjustments.largeFamilyCategory,
      dependentDisability: effectiveAdjustments.disabilityEligiblePersonMonths > 0 ? 'yes' : 'no',
      donations: String(effectiveAdjustments.donationAmount),
      rent: String(effectiveAdjustments.rentPaid),
      oldHomePurchase: String(effectiveAdjustments.homeInvestmentPaid),
      newCompanyInvestment: String(effectiveAdjustments.newCompanyInvestment),
    },
  }
}
