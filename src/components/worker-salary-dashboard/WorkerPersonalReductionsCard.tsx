import { FileText, Percent, TrendingDown } from "lucide-react";
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
import { createEmptyIrpf2025Adjustments, calculateBaseReductions2025 } from "../fiscal-worker-dashboard/irpf2025Adjustments";
import type { Irpf2025AdjustmentInput } from "../fiscal-worker-dashboard/irpf2025Adjustments";
import { Irpf2025StructuredAdjustmentsForm, MaritalReductionsGroup, WorkIncomeBenefitsSection } from "./Irpf2025StructuredAdjustmentsForm";
import {
  WORK_BENEFITS_OTHER_INCOME_LIMIT_EUR,
  workBenefitsCouldApply,
} from "../fiscal-worker-dashboard/irpf2025Calc";
import { InfoButton } from "../ui/InfoButton";
import "./Irpf2025StructuredAdjustmentsForm.css";
import "./WorkerPersonalReductionsCard.css";

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
  focus?: "reductions" | "deductions-benefits";
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
  appliedBaseReductions?: number;
  statePersonalFamilyMinimum?: number;
  regionalPersonalFamilyMinimum?: number;
  appliedQuotaDeductions?: number;
  refundableDeductionsGenerated?: number;
  finalDeclarationResult?: number;
  declaredInKindSalary?: number;
  declaredGrossWorkIncome?: number;
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

  return (
    <em className={`irpf-question-effect irpf-question-effect--${kind}`} aria-label={label}>
      {sign}
      {formatted} EUR
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
  stepNumber = 4,
  totalSteps = 9,
  initialChildren = 1,
  initialDisabilityPercent = 0,
  initialMaritalStatus = "married",
  initialAscendants = 0,
  initialResult = null,
  initialBaseBeforeReductions = 0,
  initialNetWorkIncome = 0,
  quotaBeforeDeductions = 0,
  appliedBaseReductions = 0,
  statePersonalFamilyMinimum = 0,
  regionalPersonalFamilyMinimum = 0,
  appliedQuotaDeductions = 0,
  refundableDeductionsGenerated = 0,
  finalDeclarationResult = 0,
  declaredInKindSalary = 0,
  declaredGrossWorkIncome = 0,
  taxableWorkIncome = 0,
  socialSecurityWorkExpense = 0,
  otherDeductibleWorkExpenses = 0,
  generalOtherExpenses = 2000,
  lowWorkIncomeDeductionApplied = 0,
  engineWarnings = [],
  onResultChange,
}: WorkerPersonalReductionsCardProps) {
  const showReductionsSection = focus === "reductions";
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
  const stickyBarRef = useStickyBarHeight(showReductionsSection && showChainSteps);
  // Ecuacion de apertura: bruto - Seguridad Social - gastos deducibles = rendimiento neto.
  const showNetIncomeEquation = taxableWorkIncome > 0;
  const equationNetWorkIncome = Math.max(
    0,
    taxableWorkIncome - socialSecurityWorkExpense - otherDeductibleWorkExpenses,
  );
  const extraDeductibleExpenses = Math.max(0, otherDeductibleWorkExpenses - generalOtherExpenses);
  const deductibleExpensesCapped = otherDeductibleWorkExpenses < generalOtherExpenses;

  return (
    <section className={`wprc wprc--${focus}`} aria-labelledby="wprc-title">
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
                : "Deducciones y salario en especie"}
            </h2>
            <p>
              {showReductionsSection
                ? "No necesitas saber de impuestos: responde solo a lo que se parezca a tu situación. Si algo no te aplica, elige No o déjalo cerrado."
                : "Separa deducciones de cuota, reembolsables, pagos a cuenta y beneficios exentos."}
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
                <div className="wprc-net-income__term">
                  <dt>Salario bruto anual</dt>
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
            <p className="wprc-net-income__note">
              Puedes tener más gastos deducibles de los {formatEuroRounded(generalOtherExpenses)} de serie.
              Responde las preguntas de aquí abajo y la cifra se actualiza.
            </p>
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
            declaredInKindSalary={declaredInKindSalary}
            declaredGrossWorkIncome={declaredGrossWorkIncome}
            netWorkIncome={explainedNetWorkIncome}
            previewBaseAvailable={explainedBaseInitial}
            onChange={setAdjustments}
          />
          <p className="wprc-chain-note">
            Con el rendimiento neto ya calculado, ahora vienen las reducciones y el mínimo personal y
            familiar.
          </p>
          <div className="wprc-concepts">
            <section className="wprc-concept" aria-labelledby="wprc-concept-reductions">
              <h3 id="wprc-concept-reductions">¿Qué son las reducciones?</h3>
              <p>
                Una reducción es una cantidad que puedes restar de tu base imponible si cumples
                determinados requisitos. Por ejemplo, con una base imponible de 30.000 € y una reducción
                de 2.000 €:
              </p>
              <p className="wprc-concept__formula">30.000 € − 2.000 € = 28.000 € de base liquidable</p>
              <p>
                Los tramos del IRPF se aplican entonces sobre 28.000 € en lugar de sobre 30.000 €, así que
                pagas menos. Las que puedes aplicar dependen de tu situación personal y económica.
              </p>
            </section>
            <section className="wprc-concept" aria-labelledby="wprc-concept-minimum">
              <h3 id="wprc-concept-minimum">¿Qué es el mínimo personal y familiar?</h3>
              <p>
                Es la cantidad que el Estado considera que necesitas para cubrir tus necesidades básicas y
                las de tu familia. Esa parte no paga IRPF: se tiene en cuenta al calcular el impuesto,
                pero la parte de cuota que le correspondería se deja sin pagar.
              </p>
              <p>
                El resto de tu renta sí tributa según los tramos. El mínimo puede ser mayor según tu edad,
                tu discapacidad o tu situación familiar.
              </p>
            </section>
          </div>
          <section className="wprc-question-intro" aria-labelledby="wprc-family-questions">
            <span aria-hidden="true">2</span>
            <div>
              <h3 id="wprc-family-questions">Empezamos por ti y tu familia</h3>
              <p>
                Estas respuestas sirven para calcular el mínimo personal y familiar. No reducen la
                base directamente, pero sí pueden bajar el IRPF final.
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
          <section className="wprc-question-intro" aria-labelledby="wprc-work-benefits">
            <span aria-hidden="true">3</span>
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
          {showChainSteps ? (
            <section
              ref={stickyBarRef}
              className="wprc-explained wprc-explained--sticky"
              aria-label="Cómo cambian la base y el IRPF"
            >
              <div className="wprc-chain">
                <dl className="wprc-chain__flow">
                  <div className="wprc-chain__step">
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
                  <div
                    className={`wprc-chain__step is-result${taxableBaseFlash ? " is-changed" : ""}`}
                    data-op="equals"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <dt>Base liquidable</dt>
                    <dd>{formatEuro(explainedTaxableBase)}</dd>
                  </div>
                </dl>
                <dl className="wprc-chain__aside">
                  {lowWorkIncomeDeductionApplied > 0 ? (
                    <div className="wprc-chain__step is-hint">
                      <dt>Deducción por rentas bajas</dt>
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
          ) : null}
          <section className="wprc-question-intro" aria-labelledby="wprc-declared-reductions">
            <span aria-hidden="true">4</span>
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
            declaredInKindSalary={declaredInKindSalary}
            declaredGrossWorkIncome={declaredGrossWorkIncome}
            netWorkIncome={explainedNetWorkIncome}
            previewBaseAvailable={explainedBaseInitial}
            onChange={setAdjustments}
          />
        </>
      ) : (
        <Irpf2025StructuredAdjustmentsForm
          focus={focus}
          value={adjustments}
          declaredInKindSalary={declaredInKindSalary}
          declaredGrossWorkIncome={declaredGrossWorkIncome}
          netWorkIncome={explainedNetWorkIncome}
          previewBaseAvailable={explainedBaseInitial}
          onChange={setAdjustments}
        />
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

      {!showReductionsSection ? (
        <section className="wprc-explained">
          <div>
            <h3>Resultado explicado</h3>
            <p>Las deducciones ordinarias y reembolsables se muestran por separado.</p>
          </div>
          <dl>
            <>
              <div>
                <dt>
                  Cuota antes de deducciones
                  {appliedFamilyMinimum > 0 ? (
                    <small>
                      tu mínimo personal y familiar ({formatEuro(appliedFamilyMinimum)}) ya ha
                      reducido esta cuota; cómo lo hace, en el paso 6
                    </small>
                  ) : null}
                </dt>
                <dd>{formatEuro(explainedQuotaBefore)}</dd>
              </div>
              <div className="is-minus">
                <dt>Deducciones ordinarias</dt>
                <dd>- {formatEuro(appliedQuotaDeductions)}</dd>
              </div>
              <div>
                <dt>Deducciones reembolsables generadas</dt>
                <dd>- {formatEuro(refundableDeductionsGenerated)}</dd>
              </div>
              <div className="is-result">
                <dt>Resultado estimado declaracion</dt>
                <dd>{formatEuro(finalDeclarationResult)}</dd>
              </div>
            </>
          </dl>
        </section>
      ) : null}

      {!showReductionsSection ? (
        <footer className="wprc-summary">
          <span className="wprc-summary-icon" aria-hidden="true">
            <FileText />
          </span>
          <div className="wprc-summary-copy">
            <p>Calculo 2025 con datos declarados.</p>
            <span>
              Los requisitos no confirmados quedan como no estimados y no reducen el IRPF.
            </span>
          </div>
          <output
            className={`wprc-total ${showReductionsSection ? "wprc-total--reductions" : "wprc-total--deductions"}`}
          >
            {showReductionsSection ? <TrendingDown /> : <Percent />}
            <span>{showReductionsSection ? "Reducciones aplicadas" : "Deducciones aplicadas"}</span>
            <strong>
              {formatEuro(showReductionsSection ? displayedBaseReductions : appliedQuotaDeductions)}
            </strong>
          </output>
        </footer>
      ) : null}
    </section>
  );
}

export default WorkerPersonalReductionsCard;
