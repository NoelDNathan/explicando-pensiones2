import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { computeRegionalIrpf2025 } from "../fiscal-worker-dashboard/irpfRegionCalc";
import "./WorkerIrpfRegionComparison.css";

type RegionOption = { value: string; label: string };

type WorkerIrpfRegionComparisonProps = {
  regions: RegionOption[];
  selectedRegion: string;
  /** Salario bruto anual marcado (linea vertical) y base del ranking por defecto. */
  currentSalary: number;
  onRegionChange?: (region: string) => void;
  minSalary?: number;
  maxSalary?: number;
};

type Mode = "percent" | "euro";

type RegionSeries = {
  value: string;
  label: string;
  color: string;
  points: { salary: number; irpf: number; rate: number }[];
};

const VW = 1000;
const VH = 440;
const ML = 64;
const MR = 22;
const MT = 24;
const MB = 44;
const PW = VW - ML - MR;
const PH = VH - MT - MB;
const STEPS = 80;
const LOG_SALARY_MARKERS = [14000, 50000, 120000, 250000, 500000];

function salaryToLogPos(salary: number, minSalary: number, maxSalary: number) {
  const clamped = Math.min(maxSalary, Math.max(minSalary, salary));
  return Math.log(clamped / minSalary) / Math.log(maxSalary / minSalary);
}

function logPosToSalary(pos: number, minSalary: number, maxSalary: number) {
  return minSalary * Math.pow(maxSalary / minSalary, pos);
}

function colorFor(index: number, total: number) {
  const hue = Math.round((index / Math.max(1, total)) * 330);
  return `hsl(${hue}, 70%, 60%)`;
}

function niceTicks(min: number, max: number, count = 5): number[] {
  const range = max - min;
  if (range <= 0) return [min];
  const rough = range / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const step = mag * ([1, 2, 2.5, 5, 10].find((s) => s >= norm) ?? 10);
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + step * 0.001; v += step) {
    out.push(Math.round(v * 100) / 100);
  }
  return out;
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatPercent(value: number, decimals = 1) {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} %`;
}

function formatPercentPoints(value: number, decimals = 1) {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe > 0 ? "+" : "";
  return `${sign}${safe.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} pp`;
}

type RegionSnapshot = {
  value: string;
  label: string;
  color: string;
  irpf: number;
  rate: number;
};

type SummaryStatProps = {
  title: string;
  tag?: string;
  color: string;
  rate: number;
  irpf: number;
  madridRate: number;
  madridIrpf: number;
  onClick?: () => void;
};

function SummaryStat({ title, tag, color, rate, irpf, madridRate, madridIrpf, onClick }: SummaryStatProps) {
  const diffRate = rate - madridRate;
  const diffIrpf = irpf - madridIrpf;
  const showDelta = diffRate > 0.005 || diffIrpf > 0;

  const content = (
    <>
      <div className="wirc-stat__head">
        <span className="wirc-stat__dot" style={{ background: color }} aria-hidden="true" />
        <span className="wirc-stat__label">{title}</span>
        {tag && <span className="wirc-stat__tag">{tag}</span>}
      </div>
      <p className="wirc-stat__values">
        <strong>{formatPercent(rate)}</strong>
        <span className="wirc-stat__sep" aria-hidden="true">
          ·
        </span>
        <strong>{formatEuro(irpf)}</strong>
        {showDelta && (
          <>
            <span className="wirc-stat__sep" aria-hidden="true">
              ·
            </span>
            <span className="wirc-stat__delta">{formatPercentPoints(diffRate)}</span>
            <span className="wirc-stat__sep" aria-hidden="true">
              ·
            </span>
            <span className="wirc-stat__delta">+{formatEuro(diffIrpf)}</span>
          </>
        )}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className="wirc-stat wirc-stat--clickable" onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className="wirc-stat">{content}</div>;
}

function formatSalaryShort(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${Math.round(value)}`;
}

export function WorkerIrpfRegionComparison({
  regions,
  selectedRegion,
  currentSalary,
  onRegionChange,
  minSalary = 14000,
  maxSalary = 500000,
}: WorkerIrpfRegionComparisonProps) {
  const [mode, setMode] = useState<Mode>("percent");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const series = useMemo<RegionSeries[]>(() => {
    return regions.map((region, index) => {
      const points = Array.from({ length: STEPS + 1 }, (_, i) => {
        const salary = logPosToSalary(i / STEPS, minSalary, maxSalary);
        const result = computeRegionalIrpf2025(salary, region.value);
        return { salary, irpf: result.irpf, rate: result.effectiveRate };
      });
      return { value: region.value, label: region.label, color: colorFor(index, regions.length), points };
    });
  }, [regions, minSalary, maxSalary]);

  const valueOf = (point: { irpf: number; rate: number }) => (mode === "percent" ? point.rate : point.irpf);

  const yDomain = useMemo<[number, number]>(() => {
    let max = 0;
    series.forEach((s) => s.points.forEach((p) => (max = Math.max(max, valueOf(p)))));
    return [0, max <= 0 ? 1 : max * 1.08];
  }, [series, mode]);

  const xOf = (salary: number) => ML + salaryToLogPos(salary, minSalary, maxSalary) * PW;
  const yOf = (value: number) => MT + PH - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * PH;

  const salaryToIndex = (salary: number) =>
    Math.max(0, Math.min(STEPS, Math.round(salaryToLogPos(salary, minSalary, maxSalary) * STEPS)));

  const currentIndex = salaryToIndex(currentSalary);

  useEffect(() => {
    setPinnedIndex(null);
    setHoverIndex(null);
  }, [currentSalary]);

  /** El punto fijado tiene prioridad; el hover solo previsualiza si no hay fijacion. */
  const activeIndex = pinnedIndex ?? hoverIndex ?? currentIndex;
  const previewIndex =
    pinnedIndex !== null && hoverIndex !== null && hoverIndex !== pinnedIndex ? hoverIndex : null;
  const isPinned = pinnedIndex !== null;
  const activeSalary = series[0]?.points[activeIndex]?.salary ?? currentSalary;
  const previewSalary =
    previewIndex !== null ? (series[0]?.points[previewIndex]?.salary ?? null) : null;

  const ranking = useMemo(() => {
    return series
      .map((s) => {
        const point = s.points[activeIndex];
        if (!point) return null;
        return { value: s.value, label: s.label, color: s.color, amount: valueOf(point) };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => b.amount - a.amount);
  }, [series, activeIndex, mode]);

  const madridAmount = useMemo(() => {
    const madrid = series.find((s) => s.value === "madrid");
    const point = madrid?.points[activeIndex];
    return point ? valueOf(point) : 0;
  }, [series, activeIndex, mode]);

  const snapshot = useMemo<RegionSnapshot[]>(() => {
    return series.map((s) => {
      const point = s.points[activeIndex];
      if (!point) return null;
      return { value: s.value, label: s.label, color: s.color, irpf: point.irpf, rate: point.rate };
    }).filter((row): row is RegionSnapshot => row !== null);
  }, [series, activeIndex]);

  const summary = useMemo(() => {
    if (snapshot.length === 0) return null;

    const madrid = snapshot.find((row) => row.value === "madrid");
    const madridRate = madrid?.rate ?? 0;
    const madridIrpf = madrid?.irpf ?? 0;

    const lowest = snapshot.reduce((best, row) => (row.irpf < best.irpf ? row : best), snapshot[0]);
    const highest = snapshot.reduce((best, row) => (row.irpf > best.irpf ? row : best), snapshot[0]);
    const average = {
      rate: snapshot.reduce((sum, row) => sum + row.rate, 0) / snapshot.length,
      irpf: snapshot.reduce((sum, row) => sum + row.irpf, 0) / snapshot.length,
    };

    return { madridRate, madridIrpf, lowest, highest, average, count: snapshot.length };
  }, [snapshot]);

  const yTicks = niceTicks(yDomain[0], yDomain[1], 5);
  const xTicks = LOG_SALARY_MARKERS.filter((t) => t >= minSalary && t <= maxSalary);

  const indexFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * VW;
    const plotX = svgX - ML;
    if (plotX < 0 || plotX > PW) return null;
    return Math.max(0, Math.min(STEPS, Math.round((plotX / PW) * STEPS)));
  };

  const handlePlotMove = (event: React.MouseEvent<HTMLDivElement>) => {
    setHoverIndex(indexFromClientX(event.clientX));
  };

  const handlePlotLeave = () => {
    setHoverIndex(null);
  };

  const handlePlotClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const index = indexFromClientX(event.clientX);
    if (index !== null) setPinnedIndex(index);
  };

  const linePath = (s: RegionSeries) =>
    s.points.map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.salary).toFixed(1)},${yOf(valueOf(p)).toFixed(1)}`).join(" ");

  const formatValue = (value: number) => (mode === "percent" ? formatPercent(value) : formatEuro(value));

  return (
    <section className="wirc" aria-labelledby="wirc-title">
      <header className="wirc-header">
        <div className="wirc-title-group">
          <h3 id="wirc-title">Comparador de IRPF por comunidad</h3>
          <p>
            Cuanto IRPF paga el mismo salario en cada comunidad autonoma. Perfil tipo: soltero, 40 anos, sin
            hijos ni discapacidad, escala 2025.
          </p>
        </div>

        <div className="wirc-toggle" role="group" aria-label="Unidad del eje vertical">
          <button
            type="button"
            className={mode === "percent" ? "is-active" : ""}
            onClick={() => setMode("percent")}
            aria-pressed={mode === "percent"}
          >
            % del salario
          </button>
          <button
            type="button"
            className={mode === "euro" ? "is-active" : ""}
            onClick={() => setMode("euro")}
            aria-pressed={mode === "euro"}
          >
            € al año
          </button>
        </div>
      </header>

      {summary && (
        <div className="wirc-stats" aria-label={`Resumen de IRPF en ${formatEuro(activeSalary)}`}>
          <SummaryStat
            title={summary.lowest.label}
            tag={summary.lowest.value === "madrid" ? "referencia" : "menos IRPF"}
            color={summary.lowest.color}
            rate={summary.lowest.rate}
            irpf={summary.lowest.irpf}
            madridRate={summary.madridRate}
            madridIrpf={summary.madridIrpf}
            onClick={() => onRegionChange?.(summary.lowest.value)}
          />
          <SummaryStat
            title={`Media (${summary.count} CCAA)`}
            color="#8f9bff"
            rate={summary.average.rate}
            irpf={summary.average.irpf}
            madridRate={summary.madridRate}
            madridIrpf={summary.madridIrpf}
          />
          <SummaryStat
            title={summary.highest.label}
            tag="mas IRPF"
            color={summary.highest.color}
            rate={summary.highest.rate}
            irpf={summary.highest.irpf}
            madridRate={summary.madridRate}
            madridIrpf={summary.madridIrpf}
            onClick={() => onRegionChange?.(summary.highest.value)}
          />
        </div>
      )}

      <div
        className="wirc-body"
        onMouseLeave={() => setHoverRegion(null)}
      >
        <div
          className="wirc-chart-wrap"
          onMouseMove={handlePlotMove}
          onMouseLeave={handlePlotLeave}
          onClick={handlePlotClick}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VW} ${VH}`}
            className="wirc-chart"
            role="img"
            aria-label="Grafico de IRPF por comunidad segun salario"
          >
            <text x={ML} y={MT - 9} className="wirc-axis-unit">
              {mode === "percent" ? "% del salario" : "€ al año"}
            </text>

            {yTicks.map((t) => {
              const y = yOf(t);
              return (
                <g key={`y${t}`}>
                  <line x1={ML} y1={y} x2={ML + PW} y2={y} className="wirc-grid" />
                  <text x={ML - 9} y={y + 4} textAnchor="end" className="wirc-axis-label">
                    {mode === "percent" ? `${t.toLocaleString("es-ES", { maximumFractionDigits: 0 })}` : formatSalaryShort(t)}
                  </text>
                </g>
              );
            })}

            {xTicks.map((t) => {
              const x = xOf(t);
              return (
                <g key={`x${t}`}>
                  <line x1={x} y1={MT + PH} x2={x} y2={MT + PH + 4} className="wirc-grid" />
                  <text x={x} y={MT + PH + 18} textAnchor="middle" className="wirc-axis-label">
                    {formatSalaryShort(t)} €
                  </text>
                </g>
              );
            })}

            {previewSalary !== null && (
              <>
                <line
                  x1={xOf(previewSalary)}
                  y1={MT}
                  x2={xOf(previewSalary)}
                  y2={MT + PH}
                  className="wirc-cursor wirc-cursor--preview"
                />
                <text
                  x={xOf(previewSalary)}
                  y={MT - 9}
                  textAnchor="middle"
                  className="wirc-cursor-label wirc-cursor-label--preview"
                >
                  {formatEuro(previewSalary)}
                </text>
              </>
            )}

            <line
              x1={xOf(activeSalary)}
              y1={MT}
              x2={xOf(activeSalary)}
              y2={MT + PH}
              className={`wirc-cursor${isPinned ? " is-pinned" : ""}`}
            />
            <text
              x={xOf(activeSalary)}
              y={MT - 9}
              textAnchor="middle"
              className={`wirc-cursor-label${isPinned ? " is-pinned" : ""}`}
            >
              {formatEuro(activeSalary)}
            </text>

            {series.map((s) => {
              const isSelected = s.value === selectedRegion;
              const isHover = s.value === hoverRegion;
              const dim = Boolean(hoverRegion && !isHover && !isSelected);
              const path = linePath(s);
              return (
                <g key={s.value} className="wirc-line-group">
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={16}
                    className="wirc-line-hit"
                    onMouseEnter={() => setHoverRegion(s.value)}
                    onClick={(event) => {
                      event.stopPropagation();
                      const index = indexFromClientX(event.clientX);
                      if (index !== null) setPinnedIndex(index);
                      onRegionChange?.(s.value);
                    }}
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={isSelected || isHover ? 3.4 : 1.4}
                    strokeOpacity={dim ? 0.18 : isSelected || isHover ? 1 : 0.55}
                    className="wirc-line"
                    pointerEvents="none"
                  />
                </g>
              );
            })}

            {series.map((s) => {
              if (s.value !== selectedRegion && s.value !== hoverRegion) return null;
              const p = s.points[activeIndex];
              if (!p) return null;
              return (
                <circle
                  key={`dot-${s.value}`}
                  cx={xOf(p.salary)}
                  cy={yOf(valueOf(p))}
                  r={4.5}
                  fill="#08111f"
                  stroke={s.color}
                  strokeWidth={2.4}
                />
              );
            })}
          </svg>
        </div>

        <aside className="wirc-ranking" aria-label={`Ranking de IRPF para ${formatEuro(activeSalary)}`}>
          <div className="wirc-ranking__head">
            <span>En {formatEuro(activeSalary)}</span>
            <span className="wirc-ranking__hint">de mas a menos IRPF · vs Madrid</span>
          </div>
          <ol className="wirc-ranking__list">
            {ranking.map((row, position) => {
              const isSelected = row.value === selectedRegion;
              const diff = row.amount - madridAmount;
              const isMadrid = row.value === "madrid";
              return (
                <li key={row.value}>
                  <button
                    type="button"
                    className={`wirc-rank-row${isSelected ? " is-selected" : ""}`}
                    onClick={() => onRegionChange?.(row.value)}
                    onMouseEnter={() => setHoverRegion(row.value)}
                    style={{ "--rank-color": row.color } as CSSProperties}
                  >
                    <span className="wirc-rank-pos">{position + 1}</span>
                    <span className="wirc-rank-dot" aria-hidden="true" />
                    <span className="wirc-rank-label">{row.label}</span>
                    <span className="wirc-rank-amount">{formatValue(row.amount)}</span>
                    <span className="wirc-rank-diff">
                      {isMadrid || diff <= 0
                        ? "—"
                        : `+${mode === "percent" ? formatPercent(diff) : formatEuro(diff)}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>

      <p className="wirc-note">
        Estimacion didactica basada en la escala estatal y autonomica 2025 (AEAT/BOE) y el minimo personal del
        perfil tipo. No incluye deducciones autonomicas ni circunstancias personales; tu calculo real esta arriba.
      </p>
    </section>
  );
}

export default WorkerIrpfRegionComparison;
