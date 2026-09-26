import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  createDependentProfiles,
  countsForJointUnit,
  qualifiesDependent,
} from "../fiscal-worker-dashboard/familyMinimum2025";
import type {
  DependentProfile,
  DisabilityPercent,
} from "../fiscal-worker-dashboard/familyMinimum2025";
import {
  createEmptyIrpf2025Adjustments,
  calculateBaseReductions2025,
  calculateGeneralDeductions2025,
  calculateInKindBenefits2025,
  calculateRefundableDeductions2025,
} from "../fiscal-worker-dashboard/irpf2025Adjustments";
import type { Irpf2025AdjustmentInput } from "../fiscal-worker-dashboard/irpf2025Adjustments";
import { Irpf2025StructuredAdjustmentsForm, MaritalReductionsGroup, WorkIncomeBenefitsSection } from "./Irpf2025StructuredAdjustmentsForm";
import { WorkIncomeReductionExplainer } from "../fiscal-worker-dashboard/WorkIncomeReductionExplainer";
import {
  LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR,
  LOW_WORK_INCOME_DEDUCTION_MAX_EUR,
  LOW_WORK_INCOME_DEDUCTION_WITHDRAWAL_RATE,
  LOW_WORK_INCOME_GROSS_LIMIT_EUR,
  WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR,
  lowWorkIncomeDeductionTheoretical2025,
  workBenefitsCouldApply,
} from "../fiscal-worker-dashboard/irpf2025Calc";
import { InfoButton } from "../ui/InfoButton";
import { useFiscalVariant } from '../fiscal-worker-dashboard/fiscalVariant'
import { EscQuestion } from './escenario/EscenarioCommon'
import { getRegionDeductionLink } from "./regionDeductionLinks";
import "./Irpf2025StructuredAdjustmentsForm.css";
import "./WorkerPersonalReductionsCard.css";
import './escenario/EscenarioPersonalReductions.css'

export type MaritalStatus = "single" | "married" | "divorced" | "widowed";
export type SelectOption = { value: string; label: string };
export type { DependentProfile, DisabilityPercent };

type ReductionKey =
  | "pensionPlans"
  | "companyPensionPlan"
  | "mutualities"
  | "compensatoryPension"
  | "childSupport"
  | "jointTaxation"
  | "protectedAssets"
  | "unionAndProfessionalFees";

type DeductionKey =
  | "maternity"
  | "daycare"
  | "largeFamily"
  | "dependentDisability"
  | "donations"
  | "rent"
  | "oldHomePurchase"
  | "newCompanyInvestment";

export type PersonalReductionResult = {
  children: number;
  eligibleChildren: number;
  childrenUnder3: number;
  disabilityPercent: DisabilityPercent;
  taxpayerAssistance: string;
  taxpayerDisabilityAssistanceMinimum: number;
  maritalStatus: MaritalStatus;
  ascendants: number;
  eligibleAscendants: number;
  ascendantsOver75: number;
  dependentDisabilityMinimum: number;
  descendantProfiles: DependentProfile[];
  ascendantProfiles: DependentProfile[];
  adjustments: Irpf2025AdjustmentInput;
  reductionsTotal: number;
  deductionsTotal: number;
  calculationWarnings: Array<{
    section: "reductions" | "deductions";
    message: string;
  }>;
  reductionLines: Record<ReductionKey, number | boolean>;
  deductionLines: Record<DeductionKey, string>;
};

type WorkerPersonalReductionsCardProps = {
  focus?: "reductions" | "deductions-benefits" | "in-kind";
  stepNumber?: number;
  totalSteps?: number;
  initialChildren?: number;
  initialDisabilityPercent?: DisabilityPercent;
  initialMaritalStatus?: MaritalStatus;
  initialAscendants?: number;
  initialResult?: PersonalReductionResult | null;
  initialBaseBeforeReductions?: number;
  initialNetWorkIncome?: number;
  quotaBeforeDeductions?: number;
  stateIntegralQuota?: number;
  regionalIntegralQuota?: number;
  stateGrossQuota?: number;
  regionalGrossQuota?: number;
  stateMinimumQuotaAmount?: number;
  regionalMinimumQuotaAmount?: number;
  appliedBaseReductions?: number;
  statePersonalFamilyMinimum?: number;
  regionalPersonalFamilyMinimum?: number;
  appliedQuotaDeductions?: number;
  refundableDeductionsGenerated?: number;
  finalDeclarationResult?: number;
  declaredGrossWorkIncome?: number;
  /** Comunidad y grupo de cotizacion reales: el explicador los necesita. */
  region?: string;
  contributionGroup?: number;
  taxableWorkIncome?: number;
  socialSecurityWorkExpense?: number;
  otherDeductibleWorkExpenses?: number;
  generalOtherExpenses?: number;
  lowWorkIncomeDeductionApplied?: number;
  engineWarnings?: string[];
  onResultChange?: (result: PersonalReductionResult) => void;
};

type FieldOption = {
  value: string;
  label: string;
};

const maritalOptions: FieldOption[] = [
  { value: "single", label: "Soltero/a" },
  { value: "married", label: "Casado/a" },
  { value: "divorced", label: "Divorciado/a" },
  { value: "widowed", label: "Viudo/a" },
];

const disabilityLevelOptions: FieldOption[] = [
  { value: "33", label: "33%" },
  { value: "65", label: "65%" },
];

const MAX_DEPENDENT_COUNT = 10;
const childCountOptions = Array.from({ length: MAX_DEPENDENT_COUNT }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}));
const ascendantCountOptions = Array.from({ length: MAX_DEPENDENT_COUNT }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}));
const yesNoOptions: FieldOption[] = [
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" },
];
const descendantAgeOptions: FieldOption[] = [
  { value: "under3", label: "Menor de 3" },
  { value: "3_to_24", label: "De 3 a 24" },
  { value: "25_plus_disabled", label: "25 o más" },
];
const ascendantAgeOptions: FieldOption[] = [
  { value: "under65_disabled", label: "Menos de 65" },
  { value: "65_74", label: "De 65 a 74" },
  { value: "75_plus", label: "75 o más" },
];
const incomeOptions: FieldOption[] = [
  { value: "no_more_than_8000", label: "Hasta 8.000 €" },
  { value: "over_8000", label: "Más de 8.000 €" },
];
const returnOptions: FieldOption[] = [
  { value: "no_or_up_to_1800", label: "No, o hasta 1.800 €" },
  { value: "over_1800", label: "Sí, con más de 1.800 €" },
];
const shareOptions: FieldOption[] = [
  { value: "1", label: "Solo a mí (100 %)" },
  { value: "0.5", label: "A medias (50 %)" },
];
const disabilityPersonOptions: FieldOption[] = [
  { value: "0", label: "No" },
  { value: "33", label: "Sí, 33 %" },
  { value: "65", label: "Sí, 65 %" },
];
const descendantMinimums = [2_400, 2_700, 4_000, 4_500];
const qualifyingIncomePatch = {
  ownIncome: "no_more_than_8000" as const,
  filesReturn: "no_or_up_to_1800" as const,
};

function asksDescendantMinimumShare(
  jointTaxationType: Irpf2025AdjustmentInput["jointTaxationType"],
) {
  return jointTaxationType !== "married";
}

type QuestionEffectKind = "minimum" | "reduction";

function QuestionEffect({
  amount,
  kind = "minimum",
}: {
  amount?: number;
  kind?: QuestionEffectKind;
}) {
  if (!amount) return null;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("es-ES", { maximumFractionDigits: 2 });
  const sign = kind === "reduction" || amount < 0 ? "−" : "+";
  const label =
    kind === "reduction"
      ? `Reduce la base en ${formatted} EUR`
      : amount > 0
        ? `Suma ${formatted} EUR al mínimo personal y familiar`
        : `Resta ${formatted} EUR del mínimo personal y familiar`;
  const visible =
    kind === "reduction"
      ? `−${formatted} € reducción`
      : `${sign}${formatted} € mínimo`;

  return (
    <em className={`irpf-question-effect irpf-question-effect--${kind}`} aria-label={label}>
      {visible}
    </em>
  );
}

function QuestionExclusionStatus() {
  return (
    <em
      className="wprc-person__status wprc-person-ask__status"
      aria-label="Esta respuesta hace que no sume al mínimo familiar"
    >
      Hace que no sume
    </em>
  );
}

function needsDisabilityToQualify(
  type: "descendant" | "ascendant",
  profile: DependentProfile,
) {
  return (
    (type === "descendant" && profile.ageBand === "25_plus_disabled") ||
    (type === "ascendant" && profile.ageBand === "under65_disabled")
  );
}

function fieldExcludesMinimum(
  field: "age" | "livesWith" | "ownIncome" | "filesReturn" | "disability" | "childSupport",
  profile: DependentProfile,
  type: "descendant" | "ascendant",
) {
  switch (field) {
    case "age":
      return needsDisabilityToQualify(type, profile) && profile.disabilityPercent === "0";
    case "livesWith":
      return profile.livesWith === "no";
    case "ownIncome":
      return profile.ownIncome === "over_8000";
    case "filesReturn":
      return profile.filesReturn === "over_1800";
    case "disability":
      return needsDisabilityToQualify(type, profile) && profile.disabilityPercent === "0";
    case "childSupport":
      return isMinimumExcludedByChildSupport(profile);
    default:
      return false;
  }
}

function dependentShare(profile: DependentProfile) {
  return Number(profile.entitlementShare);
}

function dependentDisabilityBase(profile: DependentProfile) {
  if (profile.disabilityPercent === "65") return 9_000;
  if (profile.disabilityPercent === "33") return 3_000;
  return 0;
}

function dependentAssistanceAmount(profile: DependentProfile) {
  return dependentDisabilityBase(profile) > 0 &&
    (profile.assistance === "yes" || profile.disabilityPercent === "65")
    ? 3_000
    : 0;
}

function isMinimumExcludedByChildSupport(profile: DependentProfile) {
  return profile.childSupportAnnual > 0 && profile.childSupportFormalized;
}

function withoutChildSupport(profile: DependentProfile): DependentProfile {
  if (profile.childSupportAnnual === 0 && !profile.childSupportFormalized) return profile;
  return { ...profile, childSupportAnnual: 0, childSupportFormalized: false };
}

function dependentAgeIncrement(
  type: "descendant" | "ascendant",
  profile: DependentProfile,
) {
  if (type === "descendant" && profile.ageBand === "under3") return 2_800;
  if (type === "ascendant" && profile.ageBand === "75_plus") return 1_400;
  return 0;
}

function dependentCoreMinimum(
  type: "descendant" | "ascendant",
  profile: DependentProfile,
  eligibleIndex: number,
) {
  if (type === "descendant") {
    return descendantMinimums[Math.min(eligibleIndex, 3)] * dependentShare(profile);
  }
  return 1_150 * dependentShare(profile);
}

function dependentContribution(
  type: "descendant" | "ascendant",
  profile: DependentProfile,
  eligibleIndex: number,
) {
  if (!qualifiesDependent(profile, type)) return 0;
  if (type === "descendant" && isMinimumExcludedByChildSupport(profile)) return 0;
  const share = dependentShare(profile);
  return (
    dependentCoreMinimum(type, profile, eligibleIndex) +
    dependentAgeIncrement(type, profile) * share +
    (dependentDisabilityBase(profile) + dependentAssistanceAmount(profile)) * share
  );
}

function OptionChips({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FieldOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="irpf-reduction-question__options" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          aria-pressed={option.value === value}
          className={option.value === value ? "is-selected" : ""}
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function FamilyQuestion({
  question,
  description,
  children,
  initiallyRelevant = false,
  effectAmount,
  onYes,
  onNo,
}: {
  question: string;
  description: string;
  children?: ReactNode;
  initiallyRelevant?: boolean;
  effectAmount?: number;
  onYes?: () => void;
  onNo: () => void;
}) {
  const variant = useFiscalVariant()
  const [answer, setAnswer] = useState<"unanswered" | "yes" | "no">(() =>
    initiallyRelevant ? "yes" : "no",
  );
  const chooseYes = () => {
    onYes?.();
    setAnswer("yes");
  };
  const chooseNo = () => {
    onNo();
    setAnswer("no");
  };

  if (variant === 'escenario') {
    return (
      <EscQuestion
        question={question}
        help={description}
        value={answer === 'yes'}
        onChange={(next) => next ? chooseYes() : chooseNo()}
      >
        {children}
      </EscQuestion>
    )
  }

  return (
    <section className={`irpf-reduction-question is-${answer}`} aria-label={question}>
      <div className="irpf-reduction-question__prompt">
        <span aria-hidden="true">?</span>
        <div>
          <div className="irpf-reduction-question__title-row">
            <h3>{question}</h3>
            <QuestionEffect amount={effectAmount} kind="minimum" />
          </div>
          <p>{description}</p>
        </div>
      </div>
      <div className="irpf-reduction-question__choices" role="group" aria-label={`Respuesta: ${question}`}>
        <button
          className={answer === "yes" ? "is-selected" : ""}
          type="button"
          aria-pressed={answer === "yes"}
          onClick={chooseYes}
        >
          Sí
        </button>
        <button
          className={answer === "no" ? "is-selected" : ""}
          type="button"
          aria-pressed={answer === "no"}
          onClick={chooseNo}
        >
          No
        </button>
      </div>
      {answer === "yes" && children ? (
        <div className="irpf-reduction-question__body">{children}</div>
      ) : null}
    </section>
  );
}

function PersonAsk({
  question,
  help,
  effectAmount,
  showsExclusion = false,
  children,
}: {
  question: string;
  help?: string;
  effectAmount?: number;
  showsExclusion?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="wprc-person-ask">
      <div className="wprc-person-ask__prompt">
        <p>{question}</p>
        {showsExclusion || effectAmount ? (
          <div className="wprc-person-ask__meta">
            {showsExclusion ? <QuestionExclusionStatus /> : null}
            <QuestionEffect amount={effectAmount} kind="minimum" />
          </div>
        ) : null}
        {help ? (
          <InfoButton label={`Ayuda: ${question}`} size="sm" placement="end" className="wprc-help">
            <p>{help}</p>
          </InfoButton>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function DescendantIncomeAsks({
  label,
  profile,
  onChange,
}: {
  label: string;
  profile: DependentProfile;
  onChange: (patch: Partial<DependentProfile>) => void;
}) {
  const [works, setWorks] = useState<"yes" | "no">(() => {
    if (profile.ownIncome === "over_8000" || profile.filesReturn === "over_1800") return "yes";
    return "no";
  });

  return (
    <>
      <PersonAsk question="¿Este hijo trabaja o tiene ingresos propios?">
        <OptionChips
          label={`${label}: trabaja o tiene ingresos`}
          value={works}
          options={yesNoOptions}
          onChange={(next) => {
            if (next === "yes") {
              setWorks("yes");
              return;
            }
            setWorks("no");
            onChange(qualifyingIncomePatch);
          }}
        />
      </PersonAsk>
      {works === "yes" ? (
        <>
          <PersonAsk
            question="¿Gana más de 8.000 € al año?"
            help="Cuenta solo ingresos que sí tributan. No incluyas becas, prestaciones u otras rentas exentas."
            showsExclusion={fieldExcludesMinimum("ownIncome", profile, "descendant")}
          >
            <OptionChips
              label={`${label}: ingresos propios`}
              value={profile.ownIncome}
              options={incomeOptions}
              onChange={(next) =>
                onChange({ ownIncome: next as DependentProfile["ownIncome"] })
              }
            />
          </PersonAsk>
          <PersonAsk
            question="¿Presenta su propia declaración de la renta?"
            showsExclusion={fieldExcludesMinimum("filesReturn", profile, "descendant")}
          >
            <OptionChips
              label={`${label}: declaración`}
              value={profile.filesReturn}
              options={returnOptions}
              onChange={(next) =>
                onChange({ filesReturn: next as DependentProfile["filesReturn"] })
              }
            />
          </PersonAsk>
        </>
      ) : null}
    </>
  );
}

function DependentEditor({
  type,
  profiles,
  count,
  onChange,
  jointTaxationType,
}: {
  type: "descendant" | "ascendant";
  profiles: DependentProfile[];
  count: number;
  onChange: (index: number, patch: Partial<DependentProfile>) => void;
  jointTaxationType?: Irpf2025AdjustmentInput["jointTaxationType"];
}) {
  const activeProfiles = profiles.slice(0, count);
  if (activeProfiles.length === 0) return null;

  const ageOptions = type === "descendant" ? descendantAgeOptions : ascendantAgeOptions;
  const personWord = type === "descendant" ? "hijo" : "ascendiente";
  let eligibleCursor = 0;

  return (
    <div className={`wprc-person-flow wprc-person-flow--${type}`}>
      {activeProfiles.map((profile, index) => {
        const label =
          type === "descendant" ? `Hijo ${index + 1}` : `Ascendiente ${index + 1}`;
        const qualifies = qualifiesDependent(profile, type);
        const excludedBySupport =
          type === "descendant" && isMinimumExcludedByChildSupport(profile);
        const countsForMinimum = qualifies && !excludedBySupport;
        const eligibleIndex = countsForMinimum ? eligibleCursor : 0;
        if (countsForMinimum) eligibleCursor += 1;

        const share = dependentShare(profile);
        const contribution = dependentContribution(type, profile, eligibleIndex);
        const ageEffect =
          countsForMinimum ? dependentAgeIncrement(type, profile) * share : 0;
        // Con el 65 % el incremento por ayuda/movilidad es automático (+3.000).
        const disabilityEffect = countsForMinimum
          ? (dependentDisabilityBase(profile) +
              (profile.disabilityPercent === "65" ? 3_000 : 0)) *
            share
          : 0;
        const assistanceEffect =
          countsForMinimum &&
          profile.disabilityPercent === "33" &&
          profile.assistance === "yes"
            ? 3_000 * share
            : 0;
        const asksAssistance = profile.disabilityPercent === "33";
        const isUnder3 = type === "descendant" && profile.ageBand === "under3";
        const requiresDisability = needsDisabilityToQualify(type, profile);
        const asksMinimumShare =
          type === "descendant"
            ? asksDescendantMinimumShare(jointTaxationType ?? "individual")
            : true;

        return (
          <section
            className={`wprc-person ${countsForMinimum ? "is-eligible" : "is-excluded"}`}
            key={`${type}-${index}`}
            aria-label={label}
          >
            <header className="wprc-person__head">
              <span aria-hidden="true">{index + 1}</span>
              <div>
                <h4>
                  {count === 1
                    ? `Cuéntanos un poco más de tu ${personWord}`
                    : `Hablemos de tu ${personWord} ${index + 1}`}
                </h4>
                <p>
                  {countsForMinimum
                    ? "Con estas respuestas, esta persona sí puede sumar al mínimo familiar."
                    : "Con las respuestas actuales, esta persona no suma al mínimo familiar."}
                </p>
              </div>
              {contribution > 0 ? (
                <QuestionEffect amount={contribution} kind="minimum" />
              ) : (
                <em className="wprc-person__status">No suma</em>
              )}
            </header>

            <div className="wprc-person__asks">
              <PersonAsk
                question="¿Qué edad tiene?"
                effectAmount={ageEffect}
                showsExclusion={fieldExcludesMinimum("age", profile, type)}
              >
                <OptionChips
                  label={`${label}: edad`}
                  value={profile.ageBand}
                  options={ageOptions}
                  onChange={(next) => {
                    const patch: Partial<DependentProfile> = { ageBand: next };
                    if (type === "descendant" && next === "under3") {
                      Object.assign(patch, qualifyingIncomePatch);
                    }
                    onChange(index, patch);
                  }}
                />
              </PersonAsk>

              <PersonAsk
                question={
                  type === "ascendant"
                    ? "¿Ha vivido contigo al menos medio año?"
                    : "¿Vive contigo o depende económicamente de ti?"
                }
                showsExclusion={fieldExcludesMinimum("livesWith", profile, type)}
              >
                <OptionChips
                  label={`${label}: convivencia`}
                  value={profile.livesWith}
                  options={yesNoOptions}
                  onChange={(next) =>
                    onChange(index, { livesWith: next as DependentProfile["livesWith"] })
                  }
                />
              </PersonAsk>

              {type === "descendant" ? (
                isUnder3 ? null : (
                  <DescendantIncomeAsks
                    label={label}
                    profile={profile}
                    onChange={(patch) => onChange(index, patch)}
                  />
                )
              ) : (
                <>
                  <PersonAsk
                    question="¿Gana más de 8.000 € al año?"
                    help="Cuenta solo ingresos que sí tributan. No incluyas becas, prestaciones u otras rentas exentas."
                    showsExclusion={fieldExcludesMinimum("ownIncome", profile, type)}
                  >
                    <OptionChips
                      label={`${label}: ingresos propios`}
                      value={profile.ownIncome}
                      options={incomeOptions}
                      onChange={(next) =>
                        onChange(index, { ownIncome: next as DependentProfile["ownIncome"] })
                      }
                    />
                  </PersonAsk>
                  <PersonAsk
                    question="¿Presenta su propia declaración de la renta?"
                    showsExclusion={fieldExcludesMinimum("filesReturn", profile, type)}
                  >
                    <OptionChips
                      label={`${label}: declaración`}
                      value={profile.filesReturn}
                      options={returnOptions}
                      onChange={(next) =>
                        onChange(index, {
                          filesReturn: next as DependentProfile["filesReturn"],
                        })
                      }
                    />
                  </PersonAsk>
                </>
              )}

              <PersonAsk
                question="¿Tiene una discapacidad reconocida?"
                effectAmount={disabilityEffect}
                showsExclusion={fieldExcludesMinimum("disability", profile, type)}
              >
                <OptionChips
                  label={`${label}: discapacidad`}
                  value={profile.disabilityPercent}
                  options={disabilityPersonOptions}
                  onChange={(next) =>
                    onChange(index, {
                      disabilityPercent: next as DependentProfile["disabilityPercent"],
                      ...(next === "0" || next === "65"
                        ? { assistance: "no" as const }
                        : {}),
                    })
                  }
                />
                {requiresDisability && profile.disabilityPercent === "0" ? (
                  <p className="wprc-person-note">
                    En esta franja de edad solo puede sumar al mínimo si tiene una discapacidad
                    reconocida.
                  </p>
                ) : null}
                {profile.disabilityPercent === "65" ? (
                  <p className="wprc-person-note">
                    Con el 65 % ya se incluye automáticamente el incremento por ayuda o
                    movilidad reducida (+3.000 EUR).
                  </p>
                ) : null}
              </PersonAsk>

              {asksAssistance ? (
                <PersonAsk
                  question="¿Necesita ayuda de otra persona o tiene movilidad reducida?"
                  help="Solo con discapacidad del 33 % este incremento depende de tu respuesta. Si marcas Sí, suma 3.000 EUR al mínimo."
                  effectAmount={assistanceEffect}
                >
                  <OptionChips
                    label={`${label}: asistencia`}
                    value={profile.assistance}
                    options={yesNoOptions}
                    onChange={(next) =>
                      onChange(index, { assistance: next as DependentProfile["assistance"] })
                    }
                  />
                </PersonAsk>
              ) : null}

              {asksMinimumShare ? (
                <PersonAsk
                  question={
                    type === "descendant"
                      ? "¿Este mínimo te corresponde solo a ti o lo repartís con el otro progenitor?"
                      : "¿Este mínimo te corresponde solo a ti o lo compartes con otras personas?"
                  }
                  help={
                    type === "descendant"
                      ? "Elige 100 % si solo tú lo aplicas en tu declaración. Elige 50 % si presentáis la renta por separado y ambos progenitores os repartís el mínimo a medias."
                      : "Elige 100 % si solo tú lo aplicas. Elige 50 % si lo repartís a medias, por ejemplo con hermanos."
                  }
                  effectAmount={
                    countsForMinimum && profile.entitlementShare === "0.5"
                      ? -contribution
                      : undefined
                  }
                >
                  <OptionChips
                    label={`${label}: porcentaje del mínimo`}
                    value={profile.entitlementShare}
                    options={shareOptions}
                    onChange={(next) =>
                      onChange(index, {
                        entitlementShare: next as DependentProfile["entitlementShare"],
                      })
                    }
                  />
                </PersonAsk>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/**
 * La deduccion por rentas del trabajo bajas es la unica ventaja del paso 5 que
 * resta de la cuota y no de la base, asi que se explica aparte: importe segun
 * el bruto, tope de cuota y los dos motivos por los que se pierde.
 */
function LowWorkIncomeDeductionPanel({
  grossWorkIncome,
  quotaAvailable,
  otherIncomeKnown,
  otherIncome,
}: {
  grossWorkIncome: number;
  quotaAvailable: number;
  otherIncomeKnown: boolean;
  otherIncome: number;
}) {
  const gross = Math.max(0, grossWorkIncome);
  const theoretical = lowWorkIncomeDeductionTheoretical2025(gross);
  const limit = Math.max(0, quotaAvailable);
  const applied = Math.min(theoretical, limit);
  const overThreshold = otherIncomeKnown && otherIncome > WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR;
  const inWithdrawal = gross > LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR;
  const withdrawalRate = LOW_WORK_INCOME_DEDUCTION_WITHDRAWAL_RATE.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
  });
  const status = theoretical <= 0
    ? "out-of-range"
    : overThreshold
      ? "blocked"
      : !otherIncomeKnown
        ? "pending"
        : limit <= 0
          ? "no-quota"
          : "applied";

  const pill =
    status === "applied"
      ? "Se resta de la cuota"
      : status === "pending"
        ? "Pendiente"
        : "No aplica";

  return (
    <section
      className="wprc-net-income wprc-net-income--deduction"
      aria-labelledby="wprc-low-income-deduction-title"
    >
      <header className="wprc-net-income__head wprc-net-income__head--no-num">
        <div>
          <h3 id="wprc-low-income-deduction-title">Deducción por rentas del trabajo bajas</h3>
          <p>
            Si cobras poco del trabajo, Hacienda te descuenta hasta{" "}
            <strong>{formatEuroRounded(LOW_WORK_INCOME_DEDUCTION_MAX_EUR)}</strong> de lo que sale a
            pagar. Es la excepción de este paso: todo lo demás que hay aquí resta de la{" "}
            <em>base</em>, y esta resta directamente de la <em>cuota</em>.
          </p>
        </div>
        <span
          className={`wprc-net-income__pill${status === "applied" ? "" : " wprc-net-income__pill--muted"}`}
        >
          {pill}
        </span>
      </header>

      {status === "out-of-range" ? (
        <p className="wprc-net-income__note">
          Con {formatEuroRounded(gross)} de bruto no te corresponde: se agota a partir de{" "}
          {formatEuroRounded(LOW_WORK_INCOME_GROSS_LIMIT_EUR)}, así que no aparecerá en el paso 6. La
          contamos aquí porque su retirada, justo por debajo de ese límite, es la otra mitad de la
          joroba del IRPF que explica el panel de abajo.
        </p>
      ) : status === "blocked" ? (
        <p className="wprc-net-income__note">
          Has declarado {formatEuro(otherIncome)} de otras rentas, por encima de los{" "}
          {formatEuroRounded(WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR)}: la pierdes entera, igual que la
          reducción por rendimientos del trabajo. Con tu bruto te habrían correspondido{" "}
          <strong>{formatEuro(theoretical)}</strong> menos de IRPF.
        </p>
      ) : status === "pending" ? (
        <p className="wprc-net-income__note">
          Con {formatEuroRounded(gross)} de bruto te corresponderían{" "}
          <strong>{formatEuro(theoretical)}</strong>, pero hasta que confirmes arriba si tienes otras
          rentas no la aplicamos: por encima de{" "}
          {formatEuroRounded(WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR)} desaparece entera.
        </p>
      ) : (
        <dl className="wprc-net-income__equation">
          <div className="wprc-net-income__term">
            <dt>
              Salario bruto anual
              <small>
                {inWithdrawal
                  ? `en la franja de retirada: de ${formatEuroRounded(LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR)} a ${formatEuroRounded(LOW_WORK_INCOME_GROSS_LIMIT_EUR)}`
                  : `por debajo de ${formatEuroRounded(LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR)}: deducción entera`}
              </small>
            </dt>
            <dd>{formatEuro(gross)}</dd>
          </div>
          <div className="wprc-net-income__term">
            <dt>
              Deducción que te corresponde
              <small>
                {inWithdrawal
                  ? `${formatEuroRounded(LOW_WORK_INCOME_DEDUCTION_MAX_EUR)} menos ${withdrawalRate} € por cada euro que pasas de ${formatEuroRounded(LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR)}`
                  : "el importe máximo, sin recortes"}
              </small>
            </dt>
            <dd>{formatEuro(theoretical)}</dd>
          </div>
          <div className="wprc-net-income__term">
            <dt>
              Tope: la cuota que te queda
              <small>
                {limit <= 0
                  ? "tu cuota ya está en cero: no hay nada de lo que restar"
                  : "no puede dejar el IRPF en negativo ni te la devuelven"}
              </small>
            </dt>
            <dd>{formatEuro(limit)}</dd>
          </div>
          <div className="wprc-net-income__term is-result" data-op="equals">
            <dt>Menos de IRPF en el paso 6</dt>
            <dd>{formatEuro(applied)}</dd>
          </div>
        </dl>
      )}

      {status === "applied" || status === "no-quota" ? (
        <p className="wprc-net-income__note">
          {applied > 0 ? (
            <>
              Son <strong>{formatEuro(applied)}</strong> menos a pagar, euro por euro. La misma
              cantidad como reducción solo te habría ahorrado tu tipo marginal, unos céntimos por
              euro. La verás con este mismo nombre en el paso 6, «IRPF por tramos».
            </>
          ) : (
            <>
              Te corresponden {formatEuro(theoretical)}, pero tu cuota ya está en cero, así que no
              hay nada que descontar: no es una deducción reembolsable y el resto no se devuelve.
            </>
          )}
        </p>
      ) : null}

      <details className="wprc-net-income__more">
        <summary>¿Cuándo se pierde?</summary>
        <ul>
          <li>
            Hasta {formatEuroRounded(LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR)} de bruto son los{" "}
            {formatEuroRounded(LOW_WORK_INCOME_DEDUCTION_MAX_EUR)} completos. A partir de ahí se
            retira {withdrawalRate} € por cada euro de más, y a{" "}
            {formatEuroRounded(LOW_WORK_INCOME_GROSS_LIMIT_EUR)} desaparece.
            {theoretical > 0 ? (
              inWithdrawal ? (
                <>
                  {" "}
                  Tú ya has perdido{" "}
                  <strong>{formatEuro(LOW_WORK_INCOME_DEDUCTION_MAX_EUR - theoretical)}</strong> por
                  ese motivo.
                </>
              ) : (
                <>
                  {" "}
                  Te quedan{" "}
                  <strong>
                    {formatEuroRounded(LOW_WORK_INCOME_DEDUCTION_FULL_GROSS_EUR - gross)}
                  </strong>{" "}
                  de margen antes de empezar a perderla.
                </>
              )
            ) : null}
          </li>
          <li>
            Si tus rentas no exentas distintas del trabajo pasan de{" "}
            {formatEuroRounded(WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR)}, no se recorta: se pierde{" "}
            <strong>entera</strong>, igual que la reducción por rendimientos del trabajo.
          </li>
          <li>
            Solo puede bajar la cuota hasta cero. Si no te sale a pagar, el resto no se devuelve:
            esta deducción no es reembolsable.
          </li>
        </ul>
      </details>
    </section>
  );
}

function formatEuro(value: number) {
  return `${value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  })} €`;
}

function formatEuroRounded(value: number) {
  return `${value.toLocaleString("es-ES", {
    maximumFractionDigits: 0,
    useGrouping: true,
  })} €`;
}

const CHANGE_FLASH_MS = 620;

/** Marca un valor durante un instante cuando cambia, para que se vea que la barra reacciona. */
function useChangeFlash(value: number) {
  const [flashing, setFlashing] = useState(false);
  const previousValue = useRef(value);

  useEffect(() => {
    if (previousValue.current === value) return;
    previousValue.current = value;
    setFlashing(true);
    const timeout = window.setTimeout(() => setFlashing(false), CHANGE_FLASH_MS);
    return () => window.clearTimeout(timeout);
  }, [value]);

  return flashing;
}

/**
 * Tirador para plegar la barra fija. Sobresale por encima de ella, asi que sigue
 * a mano cuando la barra esta escondida y no roba alto cuando esta abierta.
 */
function ChainBarToggle({
  open,
  label,
  onToggle,
}: {
  open: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="wprc-explained__toggle"
      onClick={onToggle}
      aria-expanded={open}
    >
      {open ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronUp size={14} aria-hidden="true" />}
      <span>{open ? "Ocultar" : label}</span>
    </button>
  );
}

/**
 * Publica la altura real de la barra fija en --wprc-sticky-height para que la tarjeta
 * reserve justo ese hueco en lugar de un valor fijo que se queda corto.
 */
function useStickyBarHeight(enabled: boolean) {
  const barRef = useRef<HTMLElement | null>(null);

  const publishHeight = () => {
    const bar = barRef.current;
    const host = bar?.closest(".wprc") as HTMLElement | null;
    if (!bar || !host) return;
    host.style.setProperty("--wprc-sticky-height", `${Math.ceil(bar.getBoundingClientRect().height)}px`);
  };

  // Tras cada render: el contenido de la barra cambia con las respuestas.
  useLayoutEffect(publishHeight);

  // Y ante reflows que no vienen de React (viewport, carga de fuentes).
  useEffect(() => {
    const bar = barRef.current;
    const host = bar?.closest(".wprc") as HTMLElement | null;
    if (!enabled || !bar || !host || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(publishHeight);
    observer.observe(bar);

    return () => {
      observer.disconnect();
      host.style.removeProperty("--wprc-sticky-height");
    };
  }, [enabled]);

  return barRef;
}

export function WorkerPersonalReductionsCard({
  focus = "reductions",
  stepNumber = 5,
  totalSteps = 12,
  initialChildren = 1,
  initialDisabilityPercent = 0,
  initialMaritalStatus = "married",
  initialAscendants = 0,
  initialResult = null,
  initialBaseBeforeReductions = 0,
  initialNetWorkIncome = 0,
  quotaBeforeDeductions = 0,
  stateIntegralQuota = 0,
  regionalIntegralQuota = 0,
  stateGrossQuota = 0,
  regionalGrossQuota = 0,
  stateMinimumQuotaAmount = 0,
  regionalMinimumQuotaAmount = 0,
  appliedBaseReductions = 0,
  statePersonalFamilyMinimum = 0,
  regionalPersonalFamilyMinimum = 0,
  appliedQuotaDeductions = 0,
  refundableDeductionsGenerated = 0,
  finalDeclarationResult = 0,
  declaredGrossWorkIncome = 0,
  region,
  contributionGroup,
  taxableWorkIncome = 0,
  socialSecurityWorkExpense = 0,
  otherDeductibleWorkExpenses = 0,
  generalOtherExpenses = 2000,
  lowWorkIncomeDeductionApplied = 0,
  engineWarnings = [],
  onResultChange,
}: WorkerPersonalReductionsCardProps) {
  const variant = useFiscalVariant()
  const showReductionsSection = focus === "reductions";
  const showInKindSection = focus === "in-kind";
  const showDeductionsSection = focus === "deductions-benefits";
  const [children, setChildren] = useState(() =>
    String(initialResult?.children ?? initialChildren),
  );
  const [ascendants, setAscendants] = useState(() =>
    String(initialResult?.ascendants ?? initialAscendants),
  );
  const [disabilityPercent, setDisabilityPercent] = useState(() =>
    String(initialResult?.disabilityPercent ?? initialDisabilityPercent),
  );
  const [taxpayerAssistance, setTaxpayerAssistance] = useState(
    () => initialResult?.taxpayerAssistance ?? "no",
  );
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(
    () => initialResult?.maritalStatus ?? initialMaritalStatus,
  );
  const [descendantProfiles, setDescendantProfiles] = useState(() => {
    const existing = (initialResult?.descendantProfiles ?? []).map(withoutChildSupport);
    if (existing.length >= MAX_DEPENDENT_COUNT) return existing;
    return [
      ...existing,
      ...createDependentProfiles(MAX_DEPENDENT_COUNT - existing.length, "descendant"),
    ];
  });
  const [ascendantProfiles, setAscendantProfiles] = useState(() => {
    const existing = initialResult?.ascendantProfiles ?? [];
    if (existing.length >= MAX_DEPENDENT_COUNT) return existing;
    return [
      ...existing,
      ...createDependentProfiles(MAX_DEPENDENT_COUNT - existing.length, "ascendant"),
    ];
  });
  const [adjustments, setAdjustments] = useState<Irpf2025AdjustmentInput>(() => {
    const maritalStatusForDefaults = initialResult?.maritalStatus ?? initialMaritalStatus;
    const empty = createEmptyIrpf2025Adjustments({ maritalStatus: maritalStatusForDefaults });
    if (!initialResult?.adjustments) return empty;
    return {
      ...initialResult.adjustments,
      childSupportPaid: 0,
      childSupportFormalized: false,
      childSupportMinimumExcluded: false,
    };
  });

  useEffect(() => {
    setDescendantProfiles((profiles) => {
      if (!profiles.some((profile) => profile.childSupportAnnual > 0 || profile.childSupportFormalized)) {
        return profiles;
      }
      return profiles.map(withoutChildSupport);
    });
  }, []);

  useEffect(() => {
    setAdjustments((current) => {
      let next = current;

      if (maritalStatus !== 'married') {
        if (
          current.spousePensionContribution > 0
          || current.spouseNetWorkAndBusinessIncome > 0
          || current.spousePensionEligible
          || current.spousePensionProductType !== 'none'
        ) {
          next = {
            ...next,
            spousePensionContribution: 0,
            spouseNetWorkAndBusinessIncome: 0,
            spousePensionEligible: false,
            spousePensionProductType: 'none',
          };
        }
      }

      if (maritalStatus !== 'divorced') {
        if (current.compensatoryPensionPaid > 0 || current.compensatoryPensionFormalized) {
          next = {
            ...next,
            compensatoryPensionPaid: 0,
            compensatoryPensionFormalized: false,
          };
        }
      }

      if (maritalStatus === 'married' && current.jointTaxationType !== 'individual' && current.jointTaxationType !== 'married') {
        next = { ...next, jointTaxationType: 'married' };
      }

      if (maritalStatus !== 'married' && current.jointTaxationType === 'married') {
        next = { ...next, jointTaxationType: 'individual' };
      }

      return next;
    });
  }, [maritalStatus]);

  useEffect(() => {
    if (adjustments.jointTaxationType !== "married") return;
    setDescendantProfiles((profiles) => {
      if (!profiles.some((profile) => profile.entitlementShare !== "1")) return profiles;
      return profiles.map((profile) => ({ ...profile, entitlementShare: "1" }));
    });
  }, [adjustments.jointTaxationType]);

  const updateDependent = (
    type: "descendant" | "ascendant",
    index: number,
    patch: Partial<DependentProfile>,
  ) => {
    const setter = type === "descendant" ? setDescendantProfiles : setAscendantProfiles;
    setter((profiles) =>
      profiles.map((profile, profileIndex) =>
        profileIndex === index ? { ...profile, ...patch } : profile,
      ),
    );
  };

  const result = useMemo<PersonalReductionResult>(() => {
    const selectedDescendants = descendantProfiles.slice(0, Number(children));
    const selectedAscendants = ascendantProfiles.slice(0, Number(ascendants));
    const eligibleDescendants = selectedDescendants.filter((profile) =>
      qualifiesDependent(profile, "descendant"),
    );
    const eligibleAscendants = selectedAscendants.filter((profile) =>
      qualifiesDependent(profile, "ascendant"),
    );
    const effectiveAdjustments: Irpf2025AdjustmentInput = {
      ...adjustments,
      childSupportPaid: 0,
      childSupportFormalized: false,
      childSupportMinimumExcluded: false,
    };
    const dependentDisabilityMinimum = [...eligibleDescendants, ...eligibleAscendants].reduce(
      (sum, profile) => {
        const base =
          profile.disabilityPercent === "65"
            ? 9_000
            : profile.disabilityPercent === "33"
              ? 3_000
              : 0;
        const assistance =
          base > 0 && (profile.assistance === "yes" || profile.disabilityPercent === "65")
            ? 3_000
            : 0;
        return sum + (base + assistance) * Number(profile.entitlementShare);
      },
      0,
    );
    const taxpayerDisabilityAssistanceMinimum =
      Number(disabilityPercent) > 0 && (taxpayerAssistance === "yes" || disabilityPercent === "65")
        ? 3_000
        : 0;
    const baseBeforeReductions = Math.max(0, initialBaseBeforeReductions);
    const netWorkIncomeForReductions = Math.max(0, initialNetWorkIncome || baseBeforeReductions);
    const reductionsTotal = calculateBaseReductions2025(
      effectiveAdjustments,
      netWorkIncomeForReductions,
      baseBeforeReductions,
      0,
      0,
      declaredGrossWorkIncome,
    ).totalApplied;
    const deductionsTotal =
      effectiveAdjustments.donationAmount +
      effectiveAdjustments.rentPaid +
      effectiveAdjustments.homeInvestmentPaid +
      effectiveAdjustments.newCompanyInvestment;

    return {
      children: Number(children),
      eligibleChildren: eligibleDescendants.length,
      childrenUnder3: eligibleDescendants.filter((profile) => profile.ageBand === "under3").length,
      disabilityPercent: Number(disabilityPercent) as DisabilityPercent,
      taxpayerAssistance,
      taxpayerDisabilityAssistanceMinimum,
      maritalStatus,
      ascendants: Number(ascendants),
      eligibleAscendants: eligibleAscendants.length,
      ascendantsOver75: eligibleAscendants.filter((profile) => profile.ageBand === "75_plus")
        .length,
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
        jointTaxation: effectiveAdjustments.jointTaxationType !== "individual",
        protectedAssets: effectiveAdjustments.protectedAssetsContribution,
        unionAndProfessionalFees:
          effectiveAdjustments.unionDues + effectiveAdjustments.professionalDues,
      },
      deductionLines: {
        maternity: effectiveAdjustments.maternityEligible ? "applies" : "none",
        daycare: String(effectiveAdjustments.daycareTotalExpense),
        largeFamily: effectiveAdjustments.largeFamilyCategory,
        dependentDisability: effectiveAdjustments.disabilityEligiblePersonMonths > 0 ? "yes" : "no",
        donations: String(effectiveAdjustments.donationAmount),
        rent: String(effectiveAdjustments.rentPaid),
        oldHomePurchase: String(effectiveAdjustments.homeInvestmentPaid),
        newCompanyInvestment: String(effectiveAdjustments.newCompanyInvestment),
      },
    };
  }, [
    adjustments,
    ascendantProfiles,
    ascendants,
    children,
    declaredGrossWorkIncome,
    descendantProfiles,
    disabilityPercent,
    initialBaseBeforeReductions,
    initialNetWorkIncome,
    maritalStatus,
    taxpayerAssistance,
  ]);

  useEffect(() => onResultChange?.(result), [onResultChange, result]);

  const selectedDescendants = result.descendantProfiles.slice(0, result.children);
  const minimumDescendants = selectedDescendants.filter(
    (profile) =>
      qualifiesDependent(profile, "descendant") &&
      !(profile.childSupportAnnual > 0 && profile.childSupportFormalized),
  );
  const jointUnitChildrenCount = selectedDescendants.filter(countsForJointUnit).length;

  const descendantMinimum = minimumDescendants.reduce(
    (sum, profile, index) =>
      sum +
      descendantMinimums[Math.min(index, 3)] * Number(profile.entitlementShare) +
      (profile.ageBand === "under3" ? 2_800 * Number(profile.entitlementShare) : 0),
    0,
  );
  const ascendantMinimum = result.ascendantProfiles
    .slice(0, result.ascendants)
    .filter((profile) => qualifiesDependent(profile, "ascendant"))
    .reduce(
      (sum, profile) =>
        sum +
        (1_150 + (profile.ageBand === "75_plus" ? 1_400 : 0)) * Number(profile.entitlementShare),
      0,
    );
  const familyMinimumPreview =
    descendantMinimum +
    ascendantMinimum +
    result.dependentDisabilityMinimum +
    (result.disabilityPercent === 65 ? 9_000 : result.disabilityPercent === 33 ? 3_000 : 0) +
    result.taxpayerDisabilityAssistanceMinimum;
  const explainedBaseInitial = Math.max(0, initialBaseBeforeReductions);
  const explainedNetWorkIncome = Math.max(0, initialNetWorkIncome || explainedBaseInitial);
  const workReductionApplied = Math.max(0, explainedNetWorkIncome - explainedBaseInitial);
  const workBenefitsRelevant = workBenefitsCouldApply(explainedNetWorkIncome, declaredGrossWorkIncome);
  const workReductionBlocked = workBenefitsRelevant && !adjustments.otherIncomeKnown;
  const workReductionOverThreshold = workBenefitsRelevant
    && adjustments.otherIncomeKnown
    && adjustments.otherNonExemptNonWorkIncome > WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR;
  const appliedBaseReductionsLive = useMemo(
    () =>
      calculateBaseReductions2025(
        result.adjustments,
        explainedNetWorkIncome,
        explainedBaseInitial,
        0,
        0,
        declaredGrossWorkIncome,
      ).totalApplied,
    [declaredGrossWorkIncome, explainedBaseInitial, explainedNetWorkIncome, result.adjustments],
  );
  const displayedBaseReductions = showReductionsSection
    ? appliedBaseReductionsLive
    : appliedBaseReductions;
  const explainedQuotaBefore = Math.max(0, quotaBeforeDeductions);
  const appliedFamilyMinimum = Math.max(0, statePersonalFamilyMinimum || familyMinimumPreview);
  const appliedRegionalFamilyMinimum = Math.max(0, regionalPersonalFamilyMinimum);
  const grossQuota = Math.max(0, stateGrossQuota + regionalGrossQuota);
  const familyMinimumQuota = Math.max(0, stateMinimumQuotaAmount + regionalMinimumQuotaAmount);
  const regionDeductionLink = useMemo(() => getRegionDeductionLink(region), [region]);

  const workReductionStatus = workReductionBlocked
    ? "pending"
    : workReductionOverThreshold
      ? "over-threshold"
      : !workBenefitsRelevant
        ? "not-relevant"
        : workReductionApplied > 0
          ? "applied"
          : "none";
  // Los eslabones que no aportan nada (misma cifra repetida) no entran en la cadena.
  const showWorkReductionStep =
    workReductionStatus === "applied"
    || workReductionStatus === "pending"
    || workReductionStatus === "over-threshold";
  const showBaseReductionStep = displayedBaseReductions > 0;
  const showChainSteps = showWorkReductionStep || showBaseReductionStep;
  const explainedTaxableBase = Math.max(0, explainedBaseInitial - displayedBaseReductions);
  const taxableBaseFlash = useChangeFlash(explainedTaxableBase);
  const baseReductionsFlash = useChangeFlash(displayedBaseReductions);
  const expensesFlash = useChangeFlash(otherDeductibleWorkExpenses);
  const netWorkIncomeFlash = useChangeFlash(explainedNetWorkIncome);
  const liveGeneralDeductions = useMemo(
    () =>
      calculateGeneralDeductions2025(
        adjustments,
        explainedBaseInitial,
        explainedTaxableBase,
        stateIntegralQuota,
        regionalIntegralQuota,
      ),
    [
      adjustments,
      explainedBaseInitial,
      explainedTaxableBase,
      regionalIntegralQuota,
      stateIntegralQuota,
    ],
  );
  // Tope de la deduccion por rentas del trabajo bajas: la cuota integra que
  // sigue viva despues de las deducciones generales, como en el motor.
  const lowWorkIncomeQuotaAvailable = Math.max(
    0,
    explainedQuotaBefore - liveGeneralDeductions.totalApplied,
  );
  const ordinaryQuotaDeductions = showReductionsSection
    ? appliedQuotaDeductions
    : liveGeneralDeductions.totalApplied + lowWorkIncomeDeductionApplied;
  const quotaAfterOrdinary = Math.max(0, explainedQuotaBefore - ordinaryQuotaDeductions);
  const liveRefundable = useMemo(
    () => calculateRefundableDeductions2025(adjustments, quotaAfterOrdinary, socialSecurityWorkExpense),
    [adjustments, quotaAfterOrdinary, socialSecurityWorkExpense],
  );
  const liveRefundableNet = showReductionsSection
    ? refundableDeductionsGenerated
    : liveRefundable.netRefundable;
  const liveDeclarationResult = showReductionsSection
    ? finalDeclarationResult
    : liveRefundable.finalDeclarationResult;
  const ordinaryDeductionsFlash = useChangeFlash(ordinaryQuotaDeductions);
  const refundableFlash = useChangeFlash(liveRefundableNet);
  const declarationFlash = useChangeFlash(liveDeclarationResult);
  const stickyBarRef = useStickyBarHeight(true);
  // La barra fija tapa parte de la pagina; el usuario puede plegarla a un tirador.
  const [chainBarOpen, setChainBarOpen] = useState(true);
  // Ecuacion de apertura: bruto - Seguridad Social - gastos deducibles = rendimiento neto.
  const showNetIncomeEquation = taxableWorkIncome > 0;
  const equationNetWorkIncome = Math.max(
    0,
    taxableWorkIncome - socialSecurityWorkExpense - otherDeductibleWorkExpenses,
  );
  const extraDeductibleExpenses = Math.max(0, otherDeductibleWorkExpenses - generalOtherExpenses);
  const deductibleExpensesCapped = otherDeductibleWorkExpenses < generalOtherExpenses;
  // Paso 4: la exencion de la especie no resta despues, baja el bruto del que
  // arrancan los pasos siguientes. Se calcula en vivo para que la cadena
  // responda mientras el usuario rellena los importes.
  const inKindLive = useMemo(() => calculateInKindBenefits2025(adjustments), [adjustments]);
  const inKindExemptApplied = inKindLive.exemptAmount;
  const inKindTaxableGross = Math.max(
    0,
    declaredGrossWorkIncome - inKindExemptApplied + inKindLive.paymentOnAccountAdded,
  );

  return (
    <section className={`wprc wprc--${focus}${variant === 'escenario' ? ' wprc--escenario' : ''}`} aria-labelledby="wprc-title">
      <div className="wprc-hero">
        <header className="wprc-header">
          <div className="wprc-step-orb" aria-hidden="true">
            {stepNumber}
          </div>
          <div className="wprc-title">
            <span>
              Paso {stepNumber} de {totalSteps}
            </span>
            <h2 id="wprc-title">
              {showReductionsSection
                ? "Responde unas preguntas y ajustamos tu IRPF"
                : showInKindSection
                  ? "¿Tu empresa te paga algo que no es dinero?"
                  : "Responde y restamos de tu cuota"}
            </h2>
            <p>
              {showReductionsSection
                ? "No necesitas saber de impuestos: responde solo a lo que se parezca a tu situación. Si algo no te aplica, elige No o déjalo cerrado."
                : showInKindSection
                  ? "Una sola pregunta. Si no tienes ticket restaurante, transporte, seguro médico ni guardería de empresa, responde No y continúa."
                  : "No hace falta el BOE: responde solo a lo que se parezca a tu situación. Mira los importes en tu nómina o certificado de retenciones. Si algo no te aplica, elige No."}
            </p>
          </div>
        </header>
 
      </div>

      {showReductionsSection ? (
        <>
          <section className="wprc-net-income" aria-labelledby="wprc-net-income-title">
            <header className="wprc-net-income__head">
              <span className="wprc-net-income__num" aria-hidden="true">1</span>
              <div>
                <h3 id="wprc-net-income-title">Gastos deducibles</h3>
                <p>
                  Hacienda no calcula el IRPF sobre tu salario bruto. Primero resta lo que te cuesta
                  ganarlo: tu parte de la Seguridad Social y unos{" "}
                  <strong>gastos deducibles de {formatEuroRounded(generalOtherExpenses)}</strong> que se
                  aplican de forma automática a todos los trabajadores por cuenta ajena. No hay que
                  pedirlos ni justificarlos con facturas: representan lo que cuesta ir a trabajar
                  (transporte, ropa, comer fuera). Un autónomo no tiene esta cantidad fija: él deduce sus
                  gastos reales (local, material, suministros) uno a uno y con factura.
                </p>
              </div>
              <span className="wprc-net-income__pill">Ya aplicado</span>
            </header>
            {showNetIncomeEquation ? (
              <dl className="wprc-net-income__equation">
                {inKindExemptApplied > 0.5 ? (
                  <>
                    <div className="wprc-net-income__term">
                      <dt>
                        Salario bruto anual
                        <small>el del paso 1, especie incluida</small>
                      </dt>
                      <dd>{formatEuro(declaredGrossWorkIncome)}</dd>
                    </div>
                    <div className="wprc-net-income__term" data-op="minus">
                      <dt>
                        Salario en especie
                        <small>parte exenta del paso 4</small>
                      </dt>
                      <dd>{formatEuro(inKindExemptApplied)}</dd>
                    </div>
                    {inKindLive.paymentOnAccountAdded > 0 ? (
                      <div className="wprc-net-income__term" data-op="plus">
                        <dt>
                          Ingreso a cuenta no repercutido
                          <small>lo asume la empresa y suma</small>
                        </dt>
                        <dd>{formatEuro(inKindLive.paymentOnAccountAdded)}</dd>
                      </div>
                    ) : null}
                  </>
                ) : null}
                <div
                  className="wprc-net-income__term"
                  data-op={inKindExemptApplied > 0.5 ? "equals" : undefined}
                >
                  <dt>
                    {inKindExemptApplied > 0.5 ? "Bruto que tributa en IRPF" : "Salario bruto anual"}
                  </dt>
                  <dd>{formatEuro(taxableWorkIncome)}</dd>
                </div>
                <div className="wprc-net-income__term" data-op="minus">
                  <dt>Seguridad Social (tu parte, paso 3)</dt>
                  <dd>{formatEuro(socialSecurityWorkExpense)}</dd>
                </div>
                <div className="wprc-net-income__term" data-op="minus">
                  <dt>
                    Gastos deducibles
                    {extraDeductibleExpenses > 0 ? (
                      <small>
                        {formatEuroRounded(generalOtherExpenses)} para todo el mundo +{" "}
                        {formatEuroRounded(extraDeductibleExpenses)} de tus gastos y tu situación
                      </small>
                    ) : deductibleExpensesCapped ? (
                      <small>limitados: no pueden superar lo que has ganado</small>
                    ) : (
                      <small>iguales para todo el mundo, sin justificar nada</small>
                    )}
                  </dt>
                  <dd>{formatEuro(otherDeductibleWorkExpenses)}</dd>
                </div>
                <div className="wprc-net-income__term is-result" data-op="equals">
                  <dt>Rendimiento neto del trabajo</dt>
                  <dd>{formatEuro(equationNetWorkIncome)}</dd>
                </div>
              </dl>
            ) : null}
            <details className="wprc-net-income__more">
              <summary>¿Pueden ser más de {formatEuroRounded(generalOtherExpenses)}?</summary>
              <ul>
                <li>
                  Los {formatEuroRounded(generalOtherExpenses)} suben <strong>+2.000 €</strong> si estabas
                  en paro, aceptaste un empleo en otro municipio y te mudaste.
                </li>
                <li>
                  Y suben <strong>+3.500 €</strong> con discapacidad del 33 % siendo trabajador en activo,
                  o <strong>+7.750 €</strong> con el 65 % o si necesitas ayuda de otra persona.
                </li>
                <li>
                  Aparte, también son gastos deducibles la cuota de sindicato, el colegio profesional
                  obligatorio (máx. 500 €) y la defensa jurídica frente a tu empresa (máx. 300 €). No
                  engordan los {formatEuroRounded(generalOtherExpenses)}: se suman por su cuenta.
                </li>
                <li>
                  Nunca pueden restar más de lo que has ganado: si cobras muy poco, el rendimiento neto
                  se queda en cero, no en negativo.
                </li>
              </ul>
            </details>
          </section>
          <Irpf2025StructuredAdjustmentsForm
            focus={focus}
            reductionsGroup="work-expenses"
            value={adjustments}
            declaredGrossWorkIncome={declaredGrossWorkIncome}
            netWorkIncome={explainedNetWorkIncome}
            previewBaseAvailable={explainedBaseInitial}
            onChange={setAdjustments}
          />
          <section className="wprc-question-intro" aria-labelledby="wprc-work-benefits">
            <span aria-hidden="true">2</span>
            <div>
              <h3 id="wprc-work-benefits">Ventajas del trabajo</h3>
              <p>
                Algunas reducciones solo aplican si no tienes otras rentas elevadas. Tu respuesta afecta a la
                reducción por rendimientos del trabajo que verás en el panel.
              </p>
            </div>
          </section>
          <WorkIncomeBenefitsSection
            value={adjustments}
            onChange={setAdjustments}
            netWorkIncome={explainedNetWorkIncome}
            grossWorkIncome={declaredGrossWorkIncome}
          />
          {workBenefitsRelevant ? (
            <LowWorkIncomeDeductionPanel
              grossWorkIncome={declaredGrossWorkIncome}
              quotaAvailable={lowWorkIncomeQuotaAvailable}
              otherIncomeKnown={adjustments.otherIncomeKnown}
              otherIncome={adjustments.otherNonExemptNonWorkIncome}
            />
          ) : null}
          {/*
            * Se muestra siempre: cuando el sueldo deja la reduccion fuera de
            * rango el propio panel lo dice en cabecera, y sigue explicando como
            * afecta a las rentas mas bajas.
            */}
          <WorkIncomeReductionExplainer
            variant="embedded"
            initialGrossSalaryAnnual={declaredGrossWorkIncome}
            inKindExemptAnnual={Math.max(0, inKindExemptApplied - inKindLive.paymentOnAccountAdded)}
            region={region}
            contributionGroup={contributionGroup}
            stateMinimum={statePersonalFamilyMinimum || undefined}
            regionalMinimum={regionalPersonalFamilyMinimum || undefined}
            otherNonExemptNonWorkIncome={adjustments.otherNonExemptNonWorkIncome}
            otherIncomeKnown={adjustments.otherIncomeKnown}
          />
          <section
            ref={stickyBarRef}
            className={`wprc-explained wprc-explained--sticky${chainBarOpen ? "" : " is-collapsed"}`}
            aria-label="Cómo cambian la base y el IRPF"
          >
            <ChainBarToggle
              open={chainBarOpen}
              label="Ver la base y el IRPF"
              onToggle={() => setChainBarOpen((value) => !value)}
            />
            <div className="wprc-chain">
              <dl className="wprc-chain__flow">
                {/*
                  * La cadena arranca en el bruto, no en el rendimiento neto: los
                  * gastos deducibles ya iban dentro del neto y el usuario no veia
                  * moverse nada al responder las preguntas del apartado 1.
                  */}
                {showNetIncomeEquation ? (
                  <>
                    <div className="wprc-chain__step is-context">
                      <dt>Salario bruto anual</dt>
                      <dd>{formatEuro(declaredGrossWorkIncome)}</dd>
                    </div>
                    {inKindExemptApplied > 0.5 ? (
                      <div className="wprc-chain__step is-minus is-applied is-context" data-op="minus">
                        <dt>Salario en especie</dt>
                        <dd>
                          {formatEuro(inKindExemptApplied)}
                          <small>exenta, paso 4</small>
                        </dd>
                      </div>
                    ) : null}
                    {inKindExemptApplied > 0.5 ? (
                      <div className="wprc-chain__step is-subresult is-context" data-op="equals">
                        <dt>Bruto que tributa</dt>
                        <dd>{formatEuro(taxableWorkIncome)}</dd>
                      </div>
                    ) : null}
                    <div className="wprc-chain__step is-minus is-applied is-context" data-op="minus">
                      <dt>Seguridad Social</dt>
                      <dd>
                        {formatEuro(socialSecurityWorkExpense)}
                        <small>tu parte, paso 3</small>
                      </dd>
                    </div>
                    <div
                      className={`wprc-chain__step is-minus is-applied is-context${expensesFlash ? " is-changed" : ""}`}
                      data-op="minus"
                    >
                      <dt>Gastos deducibles</dt>
                      <dd>
                        {formatEuro(otherDeductibleWorkExpenses)}
                        {extraDeductibleExpenses > 0 ? (
                          <small>
                            {formatEuroRounded(generalOtherExpenses)} fijos +{" "}
                            {formatEuroRounded(extraDeductibleExpenses)} tuyos
                          </small>
                        ) : (
                          <small>iguales para todo el mundo</small>
                        )}
                      </dd>
                    </div>
                  </>
                ) : null}
                <div
                  className={`wprc-chain__step${showNetIncomeEquation ? " is-subresult" : ""}${netWorkIncomeFlash ? " is-changed" : ""}`}
                  data-op={showNetIncomeEquation ? "equals" : undefined}
                >
                  <dt>Rendimiento neto del trabajo</dt>
                  <dd>{formatEuro(explainedNetWorkIncome)}</dd>
                </div>
                {showWorkReductionStep ? (
                  <div
                    className={`wprc-chain__step is-minus${workReductionStatus === "applied" ? " is-applied" : ""}`}
                    data-op="minus"
                  >
                    <dt>Reducción por rendimientos del trabajo</dt>
                    <dd>
                      {workReductionStatus === "applied" ? (
                        `− ${formatEuro(workReductionApplied)}`
                      ) : workReductionStatus === "pending" ? (
                        <span className="wprc-explained__status wprc-explained__status--pending">
                          Pendiente
                          <small>confirma otras rentas</small>
                        </span>
                      ) : (
                        <span className="wprc-explained__status wprc-explained__status--muted">
                          No aplica
                          <small>
                            otras rentas &gt; {formatEuroRounded(WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR)}
                          </small>
                        </span>
                      )}
                    </dd>
                  </div>
                ) : null}
                {showBaseReductionStep ? (
                  <div
                    className={`wprc-chain__step is-minus is-applied${baseReductionsFlash ? " is-changed" : ""}`}
                    data-op="minus"
                  >
                    <dt>Reducciones de base</dt>
                    <dd>{formatEuro(displayedBaseReductions)}</dd>
                  </div>
                ) : null}
                {!showChainSteps ? (
                  <div className="wprc-chain__step is-empty" data-op="minus">
                    <dt>Reducciones de base</dt>
                    <dd>
                      {formatEuro(0)}
                      {/*
                        * Las cuotas de sindicato o colegio son gastos deducibles:
                        * ya han restado en el rendimiento neto de arriba, no aqui.
                        * Sin esta nota parece que la respuesta no se ha sumado.
                        */}
                      <small>
                        {extraDeductibleExpenses > 0
                          ? `tus ${formatEuroRounded(extraDeductibleExpenses)} de gastos ya restan en el rendimiento neto`
                          : "no tienes ninguna"}
                      </small>
                    </dd>
                  </div>
                ) : null}
                <div
                  className={`wprc-chain__step is-result${taxableBaseFlash ? " is-changed" : ""}`}
                  data-op="equals"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <dt>Base liquidable</dt>
                  <dd>
                    {formatEuro(explainedTaxableBase)}
                    {!showChainSteps ? (
                      <small>sin reducciones: es tu rendimiento neto del trabajo</small>
                    ) : null}
                  </dd>
                </div>
              </dl>
              <dl className="wprc-chain__aside">
                {lowWorkIncomeDeductionApplied > 0 ? (
                  <div className="wprc-chain__step is-hint">
                    <dt>Deducción por rentas del trabajo bajas</dt>
                    <dd>
                      − {formatEuro(lowWorkIncomeDeductionApplied)}
                      <small>en la cuota (paso 6)</small>
                    </dd>
                  </div>
                ) : null}
                <div className="wprc-chain__step is-minimum">
                  <dt>Mínimo personal y familiar</dt>
                  <dd>
                    {formatEuro(appliedFamilyMinimum)}
                    <small>
                      {appliedRegionalFamilyMinimum > 0
                        ? `${formatEuro(appliedRegionalFamilyMinimum)} en la escala autonómica`
                        : "no resta base · se aplica en la cuota"}
                    </small>
                  </dd>
                </div>
              </dl>
            </div>
          </section>
          <section className="wprc-question-intro" aria-labelledby="wprc-declared-reductions">
            <span aria-hidden="true">3</span>
            <div>
              <h3 id="wprc-declared-reductions">Aportaciones que reducen tu base</h3>
              <p>
                Estas restan después, ya sobre la base imponible: planes de pensiones, mutualidad y
                patrimonio protegido.
              </p>
            </div>
          </section>
          <Irpf2025StructuredAdjustmentsForm
            focus={focus}
            reductionsGroup="base-reductions"
            value={adjustments}
            declaredGrossWorkIncome={declaredGrossWorkIncome}
            netWorkIncome={explainedNetWorkIncome}
            previewBaseAvailable={explainedBaseInitial}
            onChange={setAdjustments}
          />
          <section className="wprc-question-intro" aria-labelledby="wprc-family-questions">
            <span aria-hidden="true">4</span>
            <div>
              <h3 id="wprc-family-questions">Cómo tu situación familiar afecta a tu IRPF</h3>
              <p>
                Estas respuestas sirven para calcular algunas reducciones de base y el mínimo personal y familiar. El mínimo personal y familiar no reduce la
                base directamente, pero sí pueden bajar el IRPF final (en el paso 6 se aplicará).
              </p>
            </div>
          </section>
          <div className="irpf-reduction-question-list wprc-family-questions">
            <section
              className="irpf-reduction-question is-yes"
              aria-label="¿Cuál es tu estado civil?"
            >
              <div className="irpf-reduction-question__prompt">
                <span aria-hidden="true">?</span>
                <div>
                  <div className="irpf-reduction-question__title-row">
                    <h3>¿Cuál es tu estado civil?</h3>
                  </div>
                  <p>Las siguientes preguntas dependen de esta respuesta.</p>
                </div>
              </div>
              <div className="irpf-reduction-question__body">
                <OptionChips
                  label="Estado civil"
                  value={maritalStatus}
                  options={maritalOptions}
                  onChange={(next) => setMaritalStatus(next as MaritalStatus)}
                />
              </div>
            </section>
            <MaritalReductionsGroup
              maritalStatus={maritalStatus}
              childrenCount={Number(children)}
              jointUnitChildrenCount={jointUnitChildrenCount}
              value={adjustments}
              onChange={setAdjustments}
              previewBaseAvailable={explainedBaseInitial}
            />
            <FamilyQuestion
              question="¿Tienes hijos?"
              description="Cuenta los que viven contigo o dependen económicamente de ti. Luego te pediremos un detalle sencillo de cada uno."
              initiallyRelevant={Number(children) > 0}
              effectAmount={
                descendantMinimum +
                selectedDescendants.reduce((sum, profile) => {
                  if (!qualifiesDependent(profile, "descendant")) return sum;
                  if (isMinimumExcludedByChildSupport(profile)) return sum;
                  return (
                    sum +
                    (dependentDisabilityBase(profile) + dependentAssistanceAmount(profile)) *
                      dependentShare(profile)
                  );
                }, 0)
              }
              onYes={() => {
                if (Number(children) <= 0) setChildren("1");
              }}
              onNo={() => setChildren("0")}
            >
              <p>¿Cuántos hijos quieres incluir?</p>
              <OptionChips
                label="Número de hijos"
                value={children === "0" ? "1" : children}
                options={childCountOptions}
                onChange={setChildren}
              />
              <DependentEditor
                type="descendant"
                profiles={descendantProfiles}
                count={Number(children)}
                jointTaxationType={adjustments.jointTaxationType}
                onChange={(index, patch) => updateDependent("descendant", index, patch)}
              />
            </FamilyQuestion>
            <FamilyQuestion
              question="¿Tienes padres o abuelos a cargo?"
              description="Solo si conviven contigo o dependen económicamente de ti y cumplen los requisitos."
              initiallyRelevant={Number(ascendants) > 0}
              effectAmount={
                ascendantMinimum +
                result.ascendantProfiles
                  .slice(0, result.ascendants)
                  .reduce((sum, profile) => {
                    if (!qualifiesDependent(profile, "ascendant")) return sum;
                    return (
                      sum +
                      (dependentDisabilityBase(profile) + dependentAssistanceAmount(profile)) *
                        dependentShare(profile)
                    );
                  }, 0)
              }
              onYes={() => {
                if (Number(ascendants) <= 0) setAscendants("1");
              }}
              onNo={() => setAscendants("0")}
            >
              <p>¿Cuántos ascendientes quieres incluir?</p>
              <OptionChips
                label="Número de ascendientes"
                value={ascendants === "0" ? "1" : ascendants}
                options={ascendantCountOptions}
                onChange={setAscendants}
              />
              <DependentEditor
                type="ascendant"
                profiles={ascendantProfiles}
                count={Number(ascendants)}
                onChange={(index, patch) => updateDependent("ascendant", index, patch)}
              />
            </FamilyQuestion>
            <FamilyQuestion
              question="¿Tienes discapacidad reconocida?"
              description="Indica el grado reconocido. Esto puede aumentar el mínimo personal."
              initiallyRelevant={Number(disabilityPercent) > 0}
              effectAmount={
                result.disabilityPercent === 65
                  ? 12_000
                  : result.disabilityPercent === 33
                    ? 3_000
                    : 0
              }
              onYes={() => {
                if (Number(disabilityPercent) <= 0) setDisabilityPercent("33");
              }}
              onNo={() => {
                setDisabilityPercent("0");
                setTaxpayerAssistance("no");
              }}
            >
              <p>¿Qué grado tienes reconocido?</p>
              <OptionChips
                label="Grado de discapacidad"
                value={disabilityPercent === "0" ? "33" : disabilityPercent}
                options={disabilityLevelOptions}
                onChange={(next) => {
                  setDisabilityPercent(next);
                  if (next === "65") setTaxpayerAssistance("no");
                }}
              />
              {disabilityPercent === "65" ? (
                <p className="wprc-person-note">
                  Con el 65 % ya se incluye automáticamente el incremento por ayuda o movilidad
                  reducida (+3.000 EUR).
                </p>
              ) : null}
            </FamilyQuestion>
            {disabilityPercent === "33" ? (
              <FamilyQuestion
                question="¿Necesitas ayuda de otra persona o tienes movilidad reducida?"
                description="Con discapacidad del 33 %, si necesitas ayuda de otra persona o tienes movilidad reducida sumas 3.000 EUR al mínimo. Si marcas No, no se aplica."
                initiallyRelevant={taxpayerAssistance === "yes"}
                effectAmount={result.taxpayerDisabilityAssistanceMinimum}
                onYes={() => setTaxpayerAssistance("yes")}
                onNo={() => setTaxpayerAssistance("no")}
              />
            ) : null}
          </div>
        </>
      ) : showInKindSection ? (
        <>
          <section className="wprc-net-income" aria-labelledby="wprc-in-kind-equation-title">
            <header className="wprc-net-income__head wprc-net-income__head--no-num">
              <div>
                <h3 id="wprc-in-kind-equation-title">Cotiza entero, tributa solo en parte</h3>
                <p>
                  Dentro del bruto que declaraste en el paso 1 va lo que la empresa te paga sin darte
                  dinero. Para la Seguridad Social ese importe cuenta entero: ya cotizaste por él en el
                  paso 3. Para el IRPF, una parte puede quedar <strong>exenta</strong> y no llega a
                  contarse como ingreso.
                </p>
              </div>
              <span className="wprc-net-income__pill">Antes de la base</span>
            </header>
            {declaredGrossWorkIncome > 0 ? (
              <dl className="wprc-net-income__equation">
                <div className="wprc-net-income__term">
                  <dt>
                    Salario bruto anual
                    <small>lo que declaraste en el paso 1, especie incluida si la tienes</small>
                  </dt>
                  <dd>{formatEuro(declaredGrossWorkIncome)}</dd>
                </div>
                <div className="wprc-net-income__term" data-op="minus">
                  <dt>
                    Especie exenta
                    <small>
                      {inKindLive.declaredBenefitsTotal > 0
                        ? `de los ${formatEuro(inKindLive.declaredBenefitsTotal)} que reparte este paso`
                        : "reparte abajo a qué beneficio va cada parte"}
                    </small>
                  </dt>
                  <dd>{formatEuro(inKindExemptApplied)}</dd>
                </div>
                {inKindLive.paymentOnAccountAdded > 0 ? (
                  <div className="wprc-net-income__term" data-op="plus">
                    <dt>
                      Ingreso a cuenta no repercutido
                      <small>lo asume la empresa y no te lo cobra, así que suma</small>
                    </dt>
                    <dd>{formatEuro(inKindLive.paymentOnAccountAdded)}</dd>
                  </div>
                ) : null}
                <div className="wprc-net-income__term is-result" data-op="equals">
                  <dt>Bruto que tributa en IRPF</dt>
                  <dd>{formatEuro(inKindTaxableGross)}</dd>
                </div>
              </dl>
            ) : null}
            <p className="wprc-net-income__note">
              Esta última cifra es la que abre el paso 5: de ella se restan tu Seguridad Social y los
              gastos deducibles para llegar al rendimiento neto del trabajo.
            </p>
            <details className="wprc-net-income__more">
              <summary>¿Hasta dónde llega la exención?</summary>
              <ul>
                <li>
                  <strong>Ticket restaurante:</strong> 11 € por día efectivamente trabajado. Lo que pase
                  de ahí tributa como salario normal.
                </li>
                <li>
                  <strong>Abono de transporte:</strong> 136,36 € al mes, con un tope de 1.500 € al año.
                </li>
                <li>
                  <strong>Seguro médico:</strong> 500 € por persona asegurada (tú, tu cónyuge y tus
                  hijos), o 1.500 € por cada persona con discapacidad.
                </li>
                <li>
                  <strong>Guardería de empresa:</strong> sin tope, si cumple los requisitos del artículo
                  42.3.b de la ley del IRPF.
                </li>
                <li>
                  Lo que supere estos límites no desaparece: tributa como una parte más de tu salario.
                </li>
              </ul>
            </details>
          </section>

          <section
            className="wprc-question-intro wprc-question-intro--no-num"
            aria-labelledby="wprc-in-kind"
          >
            <div>
              <h3 id="wprc-in-kind">Retribuciones en especie</h3>
              <p>
                El salario del paso 1 ya incluye estos beneficios si los tienes. Aquí solo reparte cuánto
                va a ticket restaurante, transporte, seguro médico o guardería, al mes o al año como lo
                tengas en la nómina. Lo que no tengas, déjalo en 0 €.
              </p>
            </div>
          </section>
          <Irpf2025StructuredAdjustmentsForm
            focus={focus}
            deductionsGroup="in-kind"
            value={adjustments}
            declaredGrossWorkIncome={declaredGrossWorkIncome}
            netWorkIncome={explainedNetWorkIncome}
            previewBaseAvailable={explainedTaxableBase}
            previewTaxableIncome={explainedBaseInitial}
            stateIntegralQuota={stateIntegralQuota}
            regionalIntegralQuota={regionalIntegralQuota}
            socialSecurityContributions={socialSecurityWorkExpense}
            onChange={setAdjustments}
          />

        </>
      ) : (
        <>
          <section className="wprc-net-income" aria-labelledby="wprc-quota-equation-title">
            <header className="wprc-net-income__head wprc-net-income__head--no-num">
              <div>
                <h3 id="wprc-quota-equation-title">De la cuota íntegra a lo que resta pagar</h3>
                <p>
                  En el paso 5 calculamos la base liquidable y en el paso 6 esa base recorrió los tramos y
                  dio una <strong>cuota íntegra</strong>. El mínimo personal y familiar ya bajó esa cuota:
                  aquí partimos de lo que queda. Lo que respondas abajo resta euro a euro.
                </p>
              </div>
              <span className="wprc-net-income__pill">Ya aplicado</span>
            </header>
            {grossQuota > 0 || explainedQuotaBefore > 0 ? (
              <dl className="wprc-net-income__equation">
                <div className="wprc-net-income__term">
                  <dt>Cuota íntegra</dt>
                  <dd>{formatEuro(grossQuota || explainedQuotaBefore + familyMinimumQuota)}</dd>
                </div>
                <div className="wprc-net-income__term" data-op="minus">
                  <dt>
                    Mínimo personal y familiar
                    <small>deja sin pagar la cuota de esa parte de renta; el detalle está en el paso 6</small>
                  </dt>
                  <dd>{formatEuro(familyMinimumQuota)}</dd>
                </div>
                <div className="wprc-net-income__term is-result" data-op="equals">
                  <dt>Cuota antes de deducciones</dt>
                  <dd>{formatEuro(explainedQuotaBefore)}</dd>
                </div>
              </dl>
            ) : null}
            <p className="wprc-net-income__note">
              Las deducciones ordinarias y las reembolsables se restan de esta cifra. Lo que queda es el IRPF
              que te corresponde por el año entero.
            </p>
            <details className="wprc-net-income__more">
              <summary>¿Puede salir a devolver?</summary>
              <ul>
                <li>
                  Esta cifra es el IRPF del año completo, no lo que te queda por pagar: ya lo has ido
                  adelantando mes a mes con la retención de la nómina.
                </li>
                <li>
                  Las deducciones reembolsables (maternidad, guardería, familia numerosa, discapacidad a
                  cargo) se abonan aunque la cuota sea 0 €.
                </li>
                <li>
                  1 € de deducción te ahorra 1 €. No es como una reducción de base, que solo ahorra tu tipo
                  marginal.
                </li>
              </ul>
            </details>
          </section>

          <section
            ref={stickyBarRef}
            className={`wprc-explained wprc-explained--sticky${chainBarOpen ? "" : " is-collapsed"}`}
            aria-label="Cómo cambian la cuota y el resultado"
          >
            <ChainBarToggle
              open={chainBarOpen}
              label="Ver la cuota y el resultado"
              onToggle={() => setChainBarOpen((value) => !value)}
            />
            <div className="wprc-chain">
              <dl className="wprc-chain__flow">
                <div className="wprc-chain__step">
                  <dt>Cuota antes de deducciones</dt>
                  <dd>{formatEuro(explainedQuotaBefore)}</dd>
                </div>
                <div
                  className={`wprc-chain__step is-minus${ordinaryQuotaDeductions > 0 ? " is-applied" : ""}${ordinaryDeductionsFlash ? " is-changed" : ""}`}
                  data-op="minus"
                >
                  <dt>Deducciones ordinarias</dt>
                  <dd>− {formatEuro(ordinaryQuotaDeductions)}</dd>
                </div>
                <div
                  className={`wprc-chain__step is-minus${liveRefundableNet > 0 ? " is-applied" : ""}${refundableFlash ? " is-changed" : ""}`}
                  data-op="minus"
                >
                  <dt>Deducciones reembolsables</dt>
                  <dd>− {formatEuro(liveRefundableNet)}</dd>
                </div>
                <div
                  className={`wprc-chain__step is-result${declarationFlash ? " is-changed" : ""}`}
                  data-op="equals"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <dt>{liveDeclarationResult < 0 ? "A devolver" : "IRPF del año"}</dt>
                  <dd>{formatEuro(Math.abs(liveDeclarationResult))}</dd>
                </div>
              </dl>
              {lowWorkIncomeDeductionApplied > 0 ? (
                <dl className="wprc-chain__aside">
                  <div className="wprc-chain__step is-hint">
                    <dt>Deducción por rentas del trabajo bajas</dt>
                    <dd>
                      − {formatEuro(lowWorkIncomeDeductionApplied)}
                      <small>incluida en las ordinarias</small>
                    </dd>
                  </div>
                </dl>
              ) : null}
            </div>
          </section>

          <section className="wprc-question-intro" aria-labelledby="wprc-quota-deductions">
            <span aria-hidden="true">1</span>
            <div>
              <h3 id="wprc-quota-deductions">Deducciones de cuota</h3>
              <p>
                Donativos, alquiler o vivienda transitorios e inversión en empresa nueva. Cada euro que
                entre aquí resta un euro de la cuota, si hay cuota de la que restar.
              </p>
            </div>
          </section>
          <Irpf2025StructuredAdjustmentsForm
            focus={focus}
            deductionsGroup="quota"
            value={adjustments}
            declaredGrossWorkIncome={declaredGrossWorkIncome}
            netWorkIncome={explainedNetWorkIncome}
            previewBaseAvailable={explainedTaxableBase}
            previewTaxableIncome={explainedBaseInitial}
            stateIntegralQuota={stateIntegralQuota}
            regionalIntegralQuota={regionalIntegralQuota}
            socialSecurityContributions={socialSecurityWorkExpense}
            onChange={setAdjustments}
          />

          <section className="wprc-question-intro" aria-labelledby="wprc-refundable">
            <span aria-hidden="true">2</span>
            <div>
              <h3 id="wprc-refundable">Reembolsables</h3>
              <p>
                Maternidad, guardería, familia numerosa y discapacidad a cargo. Te las pagan aunque la cuota
                sea 0 €.
              </p>
            </div>
          </section>
          <Irpf2025StructuredAdjustmentsForm
            focus={focus}
            deductionsGroup="refundable"
            value={adjustments}
            declaredGrossWorkIncome={declaredGrossWorkIncome}
            netWorkIncome={explainedNetWorkIncome}
            previewBaseAvailable={explainedTaxableBase}
            previewTaxableIncome={explainedBaseInitial}
            stateIntegralQuota={stateIntegralQuota}
            regionalIntegralQuota={regionalIntegralQuota}
            socialSecurityContributions={socialSecurityWorkExpense}
            onChange={setAdjustments}
          />

        </>
      )}

      {engineWarnings.length > 0 ? (
        <aside className="wprc-calculation-warnings" aria-label="Ajustes no estimados">
          <strong>Datos pendientes: estos importes no se aplican</strong>
          <ul>
            {engineWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      {showDeductionsSection ? (
        <aside className="wprc-calculation-warnings" aria-label="Deducciones autonómicas no incluidas">
          <strong>Deducciones autonómicas propias: no están en este cálculo</strong>
          <ul>
            <li>
              Aquí entran las deducciones estatales y el tramo autonómico transitorio de vivienda (7,5 % o
              9 % catalán si lo verificas).
            </li>
            <li>
              Casi todas las comunidades tienen además deducciones propias (nacimiento, alquiler, discapacidad,
              etc.). Este motor no las calcula: no van a aparecer aunque existan en tu comunidad.
            </li>
            <li>
              Consulta las tuyas:{" "}
              <a
                className="wprc-warning-link"
                href={regionDeductionLink.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                deducciones autonómicas de {regionDeductionLink.label}
              </a>
              .
            </li>
          </ul>
        </aside>
      ) : null}

    </section>
  );
}

export default WorkerPersonalReductionsCard;
