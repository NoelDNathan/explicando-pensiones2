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

const AVERAGE_COLOR = "#8f9bff";

type ChartLine = {
  id: string;
  label: string;
  color: string;
  points: { salary: number; irpf: number; rate: number }[];
  kind: "region" | "average";
  role: "selected" | "compare" | "average";
};

function pickDefaultCompareRegion(selectedRegion: string, regions: RegionOption[]) {
  if (selectedRegion !== "madrid" && regions.some((region) => region.value === "madrid")) {
    return "madrid";
  }
  return regions.find((region) => region.value !== selectedRegion)?.value ?? selectedRegion;
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
  const [compareRegion, setCompareRegion] = useState(() => pickDefaultCompareRegion(selectedRegion, regions));
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setCompareRegion((current) => {
      if (current !== selectedRegion) return current;
      return pickDefaultCompareRegion(selectedRegion, regions);
    });
  }, [regions, selectedRegion]);

  const selectRegion = (value: string) => {
    if (value === "__average__" || value === selectedRegion) return;
    if (value === compareRegion) {
      onRegionChange?.(compareRegion);
      setCompareRegion(selectedRegion);
      return;
    }
    setCompareRegion(selectedRegion);
    onRegionChange?.(value);
  };

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

  const xOf = (salary: number) => ML + salaryToLogPos(salary, minSalary, maxSalary) * PW;

  const salaryToIndex = (salary: number) =>
    Math.max(0, Math.min(STEPS, Math.round(salaryToLogPos(salary, minSalary, maxSalary) * STEPS)));

  const currentIndex = salaryToIndex(currentSalary);

  useEffect(() => {
    setPinnedIndex(null);
    setHoverIndex(null);
  }, [currentSalary]);

  const averageSeries = useMemo(() => {
    if (series.length === 0) return [];
    return Array.from({ length: STEPS + 1 }, (_, index) => {
      const salary = series[0]?.points[index]?.salary ?? logPosToSalary(index / STEPS, minSalary, maxSalary);
      let rateSum = 0;
      let irpfSum = 0;
      series.forEach((regionSeries) => {
        const point = regionSeries.points[index];
        if (!point) return;
        rateSum += point.rate;
        irpfSum += point.irpf;
      });
      return {
        salary,
        rate: rateSum / series.length,
        irpf: irpfSum / series.length,
      };
    });
  }, [series]);

  const chartLines = useMemo<ChartLine[]>(() => {
    const selected = series.find((regionSeries) => regionSeries.value === selectedRegion);
    const compare = series.find((regionSeries) => regionSeries.value === compareRegion);
    const lines: ChartLine[] = [];

    if (selected) {
      lines.push({
        id: selected.value,
        label: selected.label,
        color: selected.color,
        points: selected.points,
        kind: "region",
        role: "selected",
      });
    }
    if (compare && compare.value !== selected?.value) {
      lines.push({
        id: compare.value,
        label: compare.label,
        color: compare.color,
        points: compare.points,
        kind: "region",
        role: "compare",
      });
    }
    if (averageSeries.length > 0) {
      lines.push({
        id: "__average__",
        label: `Media (${regions.length} CCAA)`,
        color: AVERAGE_COLOR,
        points: averageSeries,
        kind: "average",
        role: "average",
      });
    }

    return lines;
  }, [averageSeries, compareRegion, regions.length, selectedRegion, series]);

  const yDomain = useMemo<[number, number]>(() => {
    let max = 0;
    chartLines.forEach((line) => line.points.forEach((point) => (max = Math.max(max, valueOf(point)))));
    return [0, max <= 0 ? 1 : max * 1.08];
  }, [chartLines, mode]);

  const yOf = (value: number) => MT + PH - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * PH;

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

  const linePath = (line: ChartLine) =>
    line.points.map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.salary).toFixed(1)},${yOf(valueOf(p)).toFixed(1)}`).join(" ");

  const strokeWidthFor = (role: ChartLine["role"]) => {
    if (role === "selected") return 4.8;
    if (role === "compare") return 3.8;
    return 3.2;
  };

  const comparisonRows = useMemo(() => {
    const selectedEntry = ranking.find((row) => row.value === selectedRegion);
    const compareEntry = ranking.find((row) => row.value === compareRegion);
    const averageAmount = mode === "percent" ? (summary?.average.rate ?? 0) : (summary?.average.irpf ?? 0);
    const rows: Array<{
      value: string;
      label: string;
      color: string;
      amount: number;
      role: "selected" | "compare" | "average";
    }> = [];

    if (selectedEntry) rows.push({ ...selectedEntry, role: "selected" });
    if (compareEntry && compareEntry.value !== selectedRegion) {
      rows.push({ ...compareEntry, role: "compare" });
    }
    rows.push({
      value: "__average__",
      label: `Media (${regions.length} CCAA)`,
      color: AVERAGE_COLOR,
      amount: averageAmount,
      role: "average",
    });

    return rows;
  }, [compareRegion, mode, ranking, regions.length, selectedRegion, summary?.average.irpf, summary?.average.rate]);

  const pickerRows = useMemo(
    () => ranking.filter((row) => row.value !== selectedRegion && row.value !== compareRegion),
    [compareRegion, ranking, selectedRegion],
  );

  const formatValue = (value: number) => (mode === "percent" ? formatPercent(value) : formatEuro(value));

  const renderRankRow = (
    row: { value: string; label: string; color: string; amount: number; role?: "selected" | "compare" | "average" },
    position?: number,
  ) => {
    const isSelected = row.role === "selected";
    const isCompare = row.role === "compare";
    const isAverage = row.role === "average";
    const diff = row.amount - madridAmount;
    const isMadrid = row.value === "madrid";

    return (
      <li key={row.value}>
        <button
          type="button"
          className={`wirc-rank-row${isSelected ? " is-selected" : ""}${isCompare ? " is-compare" : ""}${isAverage ? " is-average" : ""}`}
          onClick={() => selectRegion(row.value)}
          disabled={isAverage}
          style={{ "--rank-color": row.color } as CSSProperties}
        >
          <span className="wirc-rank-pos">{position ?? (isSelected ? "A" : isCompare ? "B" : "μ")}</span>
          <span className="wirc-rank-dot" aria-hidden="true" />
          <span className="wirc-rank-label">
            {row.label}
            {isSelected && <span className="wirc-rank-tag">seleccionada</span>}
            {isCompare && <span className="wirc-rank-tag">comparar</span>}
          </span>
          <span className="wirc-rank-amount">{formatValue(row.amount)}</span>
          <span className="wirc-rank-diff">
            {isAverage || isMadrid || diff <= 0
              ? "—"
              : `+${mode === "percent" ? formatPercent(diff) : formatEuro(diff)}`}
          </span>
        </button>
      </li>
    );
  };

  return (
    <section className="wirc" aria-labelledby="wirc-title">
      <header className="wirc-header">
        <div className="wirc-title-group">
          <h3 id="wirc-title">Comparador de IRPF por comunidad</h3>
          <p>
            Compara dos comunidades y la media de CCAA sobre el mismo salario. Perfil tipo: soltero, 40 anos, sin
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
            onClick={() => selectRegion(summary.lowest.value)}
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
            onClick={() => selectRegion(summary.highest.value)}
          />
        </div>
      )}

      <div className="wirc-body">
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
            <rect x={ML} y={MT} width={PW} height={PH} className="wirc-plot-bg" />

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

            {chartLines.map((line) => {
              const path = linePath(line);
              const width = strokeWidthFor(line.role);
              return (
                <g key={line.id} className={`wirc-line-group wirc-line-group--${line.role}`}>
                  <path
                    d={path}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={width}
                    strokeOpacity={line.kind === "average" ? 0.92 : 1}
                    strokeDasharray={line.kind === "average" ? "10 7" : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="wirc-line"
                    pointerEvents="none"
                  />
                  {line.kind === "region" && line.points[activeIndex] && (
                    <circle
                      cx={xOf(line.points[activeIndex].salary)}
                      cy={yOf(valueOf(line.points[activeIndex]))}
                      r={line.role === "selected" ? 5.5 : 4.8}
                      fill="#08111f"
                      stroke={line.color}
                      strokeWidth={2.8}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="wirc-ranking" aria-label={`Ranking de IRPF para ${formatEuro(activeSalary)}`}>
          <div className="wirc-ranking__head">
            <span>En {formatEuro(activeSalary)}</span>
            <span className="wirc-ranking__hint">2 CCAA + media · clic para seleccionar</span>
          </div>

          <p className="wirc-ranking__section">En el grafico</p>
          <ol className="wirc-ranking__list wirc-ranking__list--active">
            {comparisonRows.map((row) => renderRankRow(row))}
          </ol>

          <p className="wirc-ranking__section">Elegir otra comunidad</p>
          <ol className="wirc-ranking__list wirc-ranking__list--picker">
            {pickerRows.map((row, position) => renderRankRow(row, position + 1))}
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
