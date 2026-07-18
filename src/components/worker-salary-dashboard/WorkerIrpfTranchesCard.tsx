import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SalarySlider } from "../ui/SalarySlider";
import "./WorkerIrpfTranchesCard.css";

export type WorkerIrpfBracketTone = "green" | "purple" | "blue" | "orange" | "yellow" | "red";

export type WorkerIrpfBracket = {
  from: number;
  to: number | null;
  rate: number;
  tone: WorkerIrpfBracketTone;
};

export type WorkerIrpfTrancheLine = WorkerIrpfBracket & {
  taxableAmount: number;
  quota: number;
};

/** Tramo de una escala oficial (estatal o autonomica) tal como llega del motor. */
export type WorkerIrpfScaleBracket = {
  base_from_eur: number;
  base_to_eur: number | null;
  base_quota_eur: number;
  marginal_percent: number;
};

type ScaleLine = {
  from: number;
  to: number | null;
  rate: number;
  tone: WorkerIrpfBracketTone;
  taxableAmount: number;
  quota: number;
};

export type WorkerIrpfTranchesResult = {
  region: string;
  taxableBase: number;
  quota: number;
  effectiveRate: number;
  lines: WorkerIrpfTrancheLine[];
};

type RegionOption = {
  value: string;
  label: string;
};

type WorkerIrpfTranchesCardProps = {
  initialRegion?: string;
  initialTaxableBase?: number;
  brackets?: WorkerIrpfBracket[];
  regions?: RegionOption[];
  /**
   * Cuota estatal autoritativa calculada por el motor (escala estatal con el
   * minimo personal y familiar ya descontado). Si se proporciona junto a
   * `regionalTax`, la tarjeta muestra estas cifras en lugar de recalcular el
   * IRPF con los tramos genericos, evitando incoherencias con el KPI.
   */
  stateTax?: number;
  /** Cuota autonomica/complementaria autoritativa calculada por el motor. */
  regionalTax?: number;
  /** Cuota final tras deducciones que no se reparten entre Estado y comunidad. */
  totalTaxAfterDeductions?: number;
  /** Deducciones aplicadas sobre la cuota total, como la nueva deduccion de trabajo 2025. */
  totalQuotaDeduction?: number;
  /** Deducciones generales aplicadas y repartidas entre cuota estatal y autonomica. */
  generalQuotaDeductions?: number;
  /** Escala estatal completa (tramos oficiales). Habilita la vista de doble escala. */
  stateScale?: WorkerIrpfScaleBracket[];
  /** Escala autonomica/complementaria completa (tramos oficiales de la comunidad). */
  regionalScale?: WorkerIrpfScaleBracket[];
  /** Minimo personal y familiar estatal aplicado a la escala. */
  stateMinimum?: number;
  /** Minimo personal y familiar autonomico aplicado a la escala. */
  regionalMinimum?: number;
  /** Etiqueta del tramo territorial ("Autonomico" o "Complementario"). */
  regionalTaxLabel?: string;
  /** Salario bruto anual actual. Si se pasa junto a `onSalaryChange`, se muestra un control para ajustarlo. */
  grossSalary?: number;
  /** Callback al cambiar el salario bruto anual desde esta tarjeta. */
  onSalaryChange?: (annualGross: number) => void;
  /** Cuando el motor es autoritativo, notifica cambios de comunidad al contenedor. */
  onRegionChange?: (region: string) => void;
  onResultChange?: (result: WorkerIrpfTranchesResult) => void;
};

const SALARY_RANGE = { min: 14000, max: 500000, markers: [14000, 50000, 120000, 250000, 500000] };

const DEFAULT_REGIONS: RegionOption[] = [
  { value: "madrid", label: "Madrid" },
  { value: "andalucia", label: "Andalucia" },
  { value: "cataluna", label: "Cataluna" },
  { value: "valencia", label: "C. Valenciana" },
];

const DEFAULT_BRACKETS: WorkerIrpfBracket[] = [
  { from: 0, to: 12450, rate: 0.19, tone: "green" },
  { from: 12450, to: 20200, rate: 0.24, tone: "purple" },
  { from: 20200, to: 35200, rate: 0.3, tone: "blue" },
  { from: 35200, to: 60000, rate: 0.37, tone: "orange" },
  { from: 60000, to: 300000, rate: 0.45, tone: "yellow" },
  { from: 300000, to: null, rate: 0.47, tone: "red" },
];

const TONES: WorkerIrpfBracketTone[] = ["green", "purple", "blue", "orange", "yellow", "red"];

function formatEuro(value: number, decimals = 0) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatPercent(value: number, decimals = 0) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Formatea un tipo marginal (fraccion) como "9,5" o "12" sin ceros sobrantes. */
function formatRate(fraction: number) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(fraction * 100);
}

function formatRange(bracket: { from: number; to: number | null }) {
  const from = bracket.from === 0 ? "0" : bracket.from.toLocaleString("es-ES");
  if (bracket.to === null) {
    return `> ${bracket.from.toLocaleString("es-ES")} \u20ac`;
  }

  return `${from} - ${bracket.to.toLocaleString("es-ES")} \u20ac`;
}

/** Convierte una escala oficial en lineas con el importe gravado por tramo. */
function computeScaleLines(scale: WorkerIrpfScaleBracket[], base: number): ScaleLine[] {
  return scale.map((bracket, index) => {
    const upper = bracket.base_to_eur ?? Number.POSITIVE_INFINITY;
    const taxableAmount = Math.max(0, Math.min(base, upper) - bracket.base_from_eur);
    const rate = bracket.marginal_percent / 100;

    return {
      from: bracket.base_from_eur,
      to: bracket.base_to_eur,
      rate,
      tone: TONES[index % TONES.length],
      taxableAmount,
      quota: taxableAmount * rate,
    };
  });
}

export function WorkerIrpfTranchesCard({
  initialRegion = "madrid",
  initialTaxableBase = 30243,
  brackets = DEFAULT_BRACKETS,
  regions = DEFAULT_REGIONS,
  stateTax,
  regionalTax,
  totalTaxAfterDeductions,
  totalQuotaDeduction = 0,
  generalQuotaDeductions = 0,
  stateScale,
  regionalScale,
  stateMinimum,
  regionalMinimum,
  regionalTaxLabel = "Autonomico",
  grossSalary,
  onSalaryChange,
  onRegionChange,
  onResultChange,
}: WorkerIrpfTranchesCardProps) {
  const [uncontrolledRegion, setUncontrolledRegion] = useState(initialRegion);
  const [uncontrolledSalary, setUncontrolledSalary] = useState(grossSalary ?? 0);
  const salary = grossSalary ?? uncontrolledSalary;

  const showSalaryControl = grossSalary !== undefined && onSalaryChange !== undefined;

  const handleSalaryChange = (next: number) => {
    if (grossSalary === undefined) setUncontrolledSalary(next);
    onSalaryChange?.(next);
  };

  // Cuando el motor pasa las cuotas reales (estatal + autonomica con el minimo
  // personal y familiar ya aplicado), la tarjeta muestra esas cifras. En caso
  // contrario (uso autonomo del componente) recalcula con los tramos genericos.
  const isAuthoritative = stateTax !== undefined && regionalTax !== undefined;
  const activeRegion = isAuthoritative ? initialRegion : uncontrolledRegion;

  const handleRegionChange = (nextRegion: string) => {
    if (isAuthoritative) {
      onRegionChange?.(nextRegion);
      return;
    }
    setUncontrolledRegion(nextRegion);
  };

  const regionLabel = useMemo(
    () => regions.find((r) => r.value === activeRegion)?.label ?? regionalTaxLabel,
    [activeRegion, regions, regionalTaxLabel],
  );

  const result = useMemo<WorkerIrpfTranchesResult>(() => {
    const lines = brackets.map((bracket) => {
      const upper = bracket.to ?? Number.POSITIVE_INFINITY;
      const taxableAmount = Math.max(0, Math.min(initialTaxableBase, upper) - bracket.from);

      return {
        ...bracket,
        taxableAmount,
        quota: taxableAmount * bracket.rate,
      };
    });
    const computedQuota = lines.reduce((total, line) => total + line.quota, 0);
    const quota = isAuthoritative
      ? Math.max(0, totalTaxAfterDeductions ?? ((stateTax ?? 0) + (regionalTax ?? 0)))
      : computedQuota;
    const effectiveRateBase = grossSalary ?? initialTaxableBase;

    return {
      region: activeRegion,
      taxableBase: initialTaxableBase,
      quota,
      effectiveRate: effectiveRateBase > 0 ? (quota / effectiveRateBase) * 100 : 0,
      lines,
    };
  }, [activeRegion, brackets, grossSalary, initialTaxableBase, isAuthoritative, regionalTax, stateTax, totalTaxAfterDeductions]);

  useEffect(() => {
    if (isAuthoritative) return;
    onResultChange?.(result);
  }, [isAuthoritative, onResultChange, result]);

  const stateLines = useMemo(
    () => (stateScale && stateScale.length > 0 ? computeScaleLines(stateScale, result.taxableBase) : []),
    [stateScale, result.taxableBase],
  );
  const regionalLines = useMemo(
    () =>
      regionalScale && regionalScale.length > 0
        ? computeScaleLines(regionalScale, result.taxableBase)
        : [],
    [regionalScale, result.taxableBase],
  );

  // Vista de doble escala: solo cuando hay cuotas autoritativas y escalas reales.
  const hasScales = isAuthoritative && stateLines.length > 0 && regionalLines.length > 0;

  const stateGross = useMemo(() => stateLines.reduce((t, l) => t + l.quota, 0), [stateLines]);
  const regionalGross = useMemo(() => regionalLines.reduce((t, l) => t + l.quota, 0), [regionalLines]);
  const stateReduction = Math.max(0, stateGross - (stateTax ?? 0));
  const regionalReduction = Math.max(0, regionalGross - (regionalTax ?? 0));
  const splitQuota = Math.max(0, (stateTax ?? 0) + (regionalTax ?? 0));

  const activeLines = result.lines.filter((line) => line.taxableAmount > 0);
  const visibleLines = activeLines.slice(0, 4);
  const currentStateRate = stateLines.filter((line) => line.taxableAmount > 0).at(-1)?.rate ?? 0;
  const currentRegionalRate = regionalLines.filter((line) => line.taxableAmount > 0).at(-1)?.rate ?? 0;
  const currentCombinedMarginalRate = hasScales
    ? currentStateRate + currentRegionalRate
    : activeLines.at(-1)?.rate ?? 0;

  const renderBracketBox = (line: ScaleLine, keyPrefix: string) => {
    const isActive = line.taxableAmount > 0;
    return (
      <article
        key={`${keyPrefix}-${line.from}-${line.to ?? "more"}`}
        className={`witc-bracket witc-bracket--${line.tone}${isActive ? " is-active" : " is-inactive"}`}
        aria-label={`${formatRange(line)}, ${formatRate(line.rate)}%, ${isActive ? "alcanzado" : "no alcanzado"}`}
      >
        <strong>{formatRate(line.rate)}%</strong>
        <span>{formatRange(line)}</span>
      </article>
    );
  };

  const renderTramoColumn = (
    title: string,
    titleTone: "state" | "region",
    lines: ScaleLine[],
    gross: number,
    reduction: number,
    tax: number,
    totalLabel: string,
    minimumBase: number | undefined,
  ) => {
    const active = lines.filter((line) => line.taxableAmount > 0);
    return (
      <div className="witc-calc-col">
        <h4 className={`witc-calc-col__title witc-calc-col__title--${titleTone}`}>{title}</h4>
        <ul className="witc-tramos">
          {active.map((line) => (
            <li key={`${title}-${line.from}-${line.to ?? "more"}`} className={`witc-tramo witc-tramo--${line.tone}`}>
              <span className="witc-tramo__dot" aria-hidden="true" />
              <div className="witc-tramo__main">
                <p className="witc-tramo__range">{formatRange(line)}</p>
                <p className="witc-tramo__calc">
                  {formatEuro(line.taxableAmount, 0)} x {formatRate(line.rate)}%
                </p>
              </div>
              <strong className="witc-tramo__amount">{formatEuro(line.quota, 2)}</strong>
            </li>
          ))}
          <li className="witc-tramo witc-tramo--summary">
            <span className="witc-tramo__dot witc-tramo__dot--ghost" aria-hidden="true" />
            <div className="witc-tramo__main">
              <p className="witc-tramo__range">Cuota integra (escala)</p>
            </div>
            <strong className="witc-tramo__amount">{formatEuro(gross, 2)}</strong>
          </li>
          {reduction > 0 && (
            <li className="witc-tramo witc-tramo--minus">
              <span className="witc-tramo__dot witc-tramo__dot--ghost" aria-hidden="true" />
              <div className="witc-tramo__main">
                <p className="witc-tramo__range">Minimo personal y familiar</p>
                {minimumBase !== undefined && minimumBase > 0 && (
                  <p className="witc-tramo__calc">base exenta {formatEuro(minimumBase, 0)}</p>
                )}
              </div>
              <strong className="witc-tramo__amount">{"\u2212"} {formatEuro(reduction, 2)}</strong>
            </li>
          )}
          <li className={`witc-tramo witc-tramo--total witc-tramo--total-${titleTone}`}>
            <span className="witc-tramo__dot witc-tramo__dot--ghost" aria-hidden="true" />
            <div className="witc-tramo__main">
              <p className="witc-tramo__range">{totalLabel}</p>
            </div>
            <strong className="witc-tramo__amount">{formatEuro(tax, 2)}</strong>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <section className="witc" aria-labelledby="witc-title">
      <header className="witc-header">
        <div className="witc-title">
          <span aria-hidden="true">6.</span>
          <h2 id="witc-title">IRPF por tramos</h2>
        </div>

        <div className="witc-header-side">
          <label className="witc-region">
            <span>Comunidad autónoma</span>
            <span className="witc-select">
              <select
                aria-label="Comunidad autónoma"
                value={activeRegion}
                onChange={(event) => handleRegionChange(event.target.value)}
              >
                {regions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" />
            </span>
          </label>
        </div>
      </header>

      <p className="witc-intro">
        Tu IRPF se calcula con dos escalas distintas: la estatal y la de tu comunidad. Solo se tributa
        por la parte de renta que cae en cada tramo.
      </p>

      {currentCombinedMarginalRate > 0 && !showSalaryControl && (
        <output className="witc-max-rate" aria-live="polite">
          <span>IRPF marginal máximo actual</span>
          <strong>{formatRate(currentCombinedMarginalRate)}%</strong>
          {hasScales && (
            <b>
              {formatRate(currentStateRate)}% estatal + {formatRate(currentRegionalRate)}% {regionLabel}
            </b>
          )}
        </output>
      )}

      {showSalaryControl && (
        <div className="witc-salary">
          <label className="witc-salary__label" htmlFor="witc-salary-range">
            Salario bruto anual
          </label>
          <div className="witc-salary-row">
            <SalarySlider
              id="witc-salary-range"
              value={salary}
              onChange={handleSalaryChange}
              min={SALARY_RANGE.min}
              max={SALARY_RANGE.max}
              markers={SALARY_RANGE.markers}
              scale="log"
              unitLabel="brutos al año"
              ariaLabel="Salario bruto anual en euros"
            />
            {currentCombinedMarginalRate > 0 && (
              <output className="witc-max-rate witc-max-rate--inline" aria-live="polite">
                <span>IRPF marginal máximo actual</span>
                <strong>{formatRate(currentCombinedMarginalRate)}%</strong>
                {hasScales && (
                  <b>
                    {formatRate(currentStateRate)}% estatal + {formatRate(currentRegionalRate)}% {regionLabel}
                  </b>
                )}
              </output>
            )}
          </div>
        </div>
      )}

      {hasScales ? (
        <div className="witc-scales">
          <div className="witc-scale-group">
            <span className="witc-scale-tag witc-scale-tag--state">Escala estatal</span>
            <div className="witc-brackets" aria-label="Tramos de la escala estatal">
              {stateLines.map((line) => renderBracketBox(line, "state"))}
            </div>
          </div>
          <div className="witc-scale-group">
            <span className="witc-scale-tag witc-scale-tag--region">
              Escala autonómica {"\u00b7"} {regionLabel}
            </span>
            <div className="witc-brackets" aria-label={`Tramos de la escala autonómica de ${regionLabel}`}>
              {regionalLines.map((line) => renderBracketBox(line, "region"))}
            </div>
          </div>
        </div>
      ) : (
        <div className="witc-brackets" aria-label="Tramos de IRPF">
          {result.lines.map((line) => {
            const isActive = line.taxableAmount > 0;

            return (
              <article
                key={`${line.from}-${line.to ?? "more"}`}
                className={`witc-bracket witc-bracket--${line.tone}${isActive ? " is-active" : " is-inactive"}`}
                aria-label={`${formatRange(line)}, ${Math.round(line.rate * 100)}%, ${isActive ? "alcanzado" : "no alcanzado"}`}
              >
                <strong>{Math.round(line.rate * 100)}%</strong>
                <span>{formatRange(line)}</span>
              </article>
            );
          })}
        </div>
      )}

      <div className="witc-lower">
        <aside className="witc-base-card" aria-label="Base liquidable">
          <span className="witc-base-card__hint" aria-hidden="true" />
          <p>Base liquidable</p>
          <strong>{formatEuro(result.taxableBase, 2)}</strong>
        </aside>

        <section className="witc-calc" aria-labelledby="witc-calc-title">
          <h3 id="witc-calc-title">Cálculo por tramos</h3>
          {hasScales ? (
            <>
              <div className="witc-calc-cols">
                {renderTramoColumn(
                  "Estatal",
                  "state",
                  stateLines,
                  stateGross,
                  stateReduction,
                  stateTax ?? 0,
                  generalQuotaDeductions > 0 ? "Cuota estatal tras deducciones" : "Cuota estatal",
                  stateMinimum,
                )}
                {renderTramoColumn(
                  `${regionLabel}`,
                  "region",
                  regionalLines,
                  regionalGross,
                  regionalReduction,
                  regionalTax ?? 0,
                  generalQuotaDeductions > 0 ? `Cuota ${regionLabel} tras deducciones` : `Cuota ${regionLabel}`,
                  regionalMinimum,
                )}
              </div>
              {generalQuotaDeductions > 0 ? (
                <div className="witc-total-deduction">
                  <span>Deducciones generales de cuota aplicadas</span>
                  <strong>- {formatEuro(generalQuotaDeductions, 2)}</strong>
                </div>
              ) : null}
              {totalQuotaDeduction > 0 ? (
                <div className="witc-total-deduction">
                  <span>Deduccion estatal por rendimientos del trabajo 2025</span>
                  <strong>- {formatEuro(totalQuotaDeduction, 2)}</strong>
                </div>
              ) : null}
              {splitQuota > 0 && (
                <div className="witc-split-bar" aria-hidden="true">
                  <div className="witc-split-bar__label witc-split-bar__label--state">
                    Estado&nbsp;{formatPercent(((stateTax ?? 0) / splitQuota) * 100, 0)}%
                  </div>
                  <div
                    className="witc-split-bar__track"
                    title={`Estado ${formatEuro(stateTax ?? 0, 0)} · ${regionLabel} ${formatEuro(regionalTax ?? 0, 0)}`}
                  >
                    <div className="witc-split-bar__fill witc-split-bar__fill--state" style={{ flex: stateTax ?? 0 }} />
                    <div
                      className="witc-split-bar__fill witc-split-bar__fill--region"
                      style={{ flex: regionalTax ?? 0 }}
                    />
                  </div>
                  <div className="witc-split-bar__label witc-split-bar__label--region">
                    {regionLabel}&nbsp;{formatPercent(((regionalTax ?? 0) / splitQuota) * 100, 0)}%
                  </div>
                </div>
              )}
            </>
          ) : isAuthoritative ? (
            <ul>
              <li className="witc-calc-row witc-calc-row--blue">
                <span aria-hidden="true" />
                <p>Cuota estatal</p>
                <b>escala estatal - minimo</b>
                <strong>= {formatEuro(stateTax ?? 0, 2)}</strong>
              </li>
              <li className="witc-calc-row witc-calc-row--orange">
                <span aria-hidden="true" />
                <p>Cuota {regionLabel}</p>
                <b>escala {regionalTaxLabel.toLowerCase()} - minimo</b>
                <strong>= {formatEuro(regionalTax ?? 0, 2)}</strong>
              </li>
              <li className="witc-calc-row witc-calc-row--green">
                <span aria-hidden="true" />
                <p>Cuota integra</p>
                <b>estatal + {regionLabel}</b>
                <strong>= {formatEuro(result.quota, 2)}</strong>
              </li>
            </ul>
          ) : (
            <ul>
              {visibleLines.map((line, index) => (
                <li
                  key={`${line.from}-${line.to ?? "more"}-calc`}
                  className={`witc-calc-row witc-calc-row--${line.tone}`}
                >
                  <span aria-hidden="true" />
                  <p>
                    Tramo {index + 1} ({formatRange(line)})
                  </p>
                  <b>
                    {formatEuro(line.taxableAmount, 2)} x {Math.round(line.rate * 100)}%
                  </b>
                  <strong>= {formatEuro(line.quota, 2)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="witc-results" aria-label="Resultado estimado">
          {isAuthoritative ? (
            <>
              <output className="witc-result witc-result--state">
                <span>Cuota estatal</span>
                <strong>{formatEuro(stateTax ?? 0, 2)}</strong>
              </output>
              <output className="witc-result witc-result--region">
                <span>Cuota {regionLabel}</span>
                <strong>{formatEuro(regionalTax ?? 0, 2)}</strong>
              </output>
              {totalQuotaDeduction > 0 ? (
                <output className="witc-result witc-result--deduction">
                  <span>Deduccion trabajo 2025</span>
                  <strong>- {formatEuro(totalQuotaDeduction, 2)}</strong>
                </output>
              ) : null}
              {generalQuotaDeductions > 0 ? (
                <output className="witc-result witc-result--deduction">
                  <span>Deducciones generales</span>
                  <strong>- {formatEuro(generalQuotaDeductions, 2)}</strong>
                </output>
              ) : null}
              <output className="witc-result witc-result--quota">
                <span>Total IRPF</span>
                <strong>{formatEuro(result.quota, 2)}</strong>
              </output>
            </>
          ) : (
            <output className="witc-result witc-result--quota">
              <span>Cuota integra estimada</span>
              <strong>{formatEuro(result.quota, 2)}</strong>
            </output>
          )}
          <output className="witc-result witc-result--rate">
            <span>Tipo efectivo sobre bruto</span>
            <strong>{formatPercent(result.effectiveRate, 1)}%</strong>
          </output>
        </aside>
      </div>
    </section>
  );
}

export default WorkerIrpfTranchesCard;
