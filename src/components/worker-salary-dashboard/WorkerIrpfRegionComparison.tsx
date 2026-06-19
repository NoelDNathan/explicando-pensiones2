import { useMemo, useState } from "react";
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
const STEPS = 60;

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
  return `${value.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} %`;
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
  maxSalary = 120000,
}: WorkerIrpfRegionComparisonProps) {
  const [mode, setMode] = useState<Mode>("percent");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverRegion, setHoverRegion] = useState<string | null>(null);

  const series = useMemo<RegionSeries[]>(() => {
    return regions.map((region, index) => {
      const points = Array.from({ length: STEPS + 1 }, (_, i) => {
        const salary = minSalary + ((maxSalary - minSalary) * i) / STEPS;
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

  const xOf = (salary: number) => ML + ((salary - minSalary) / (maxSalary - minSalary)) * PW;
  const yOf = (value: number) => MT + PH - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * PH;

  const currentIndex = Math.max(
    0,
    Math.min(STEPS, Math.round(((currentSalary - minSalary) / (maxSalary - minSalary)) * STEPS)),
  );
  const activeIndex = hoverIndex ?? currentIndex;
  const activeSalary = minSalary + ((maxSalary - minSalary) * activeIndex) / STEPS;

  const ranking = useMemo(() => {
    return series
      .map((s) => ({ value: s.value, label: s.label, color: s.color, amount: valueOf(s.points[activeIndex]) }))
      .sort((a, b) => a.amount - b.amount);
  }, [series, activeIndex, mode]);

  const cheapest = ranking[0]?.amount ?? 0;

  const yTicks = niceTicks(yDomain[0], yDomain[1], 5);
  const xTicks = niceTicks(minSalary, maxSalary, 6).filter((t) => t >= minSalary && t <= maxSalary);

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * VW;
    const plotX = svgX - ML;
    if (plotX < 0 || plotX > PW) {
      setHoverIndex(null);
      return;
    }
    setHoverIndex(Math.max(0, Math.min(STEPS, Math.round((plotX / PW) * STEPS))));
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

      <div className="wirc-body">
        <div className="wirc-chart-wrap">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="wirc-chart"
            role="img"
            aria-label="Grafico de IRPF por comunidad segun salario"
            onMouseMove={handleMove}
            onMouseLeave={() => {
              setHoverIndex(null);
              setHoverRegion(null);
            }}
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

            <line
              x1={xOf(activeSalary)}
              y1={MT}
              x2={xOf(activeSalary)}
              y2={MT + PH}
              className="wirc-cursor"
            />
            <text x={xOf(activeSalary)} y={MT - 9} textAnchor="middle" className="wirc-cursor-label">
              {formatEuro(activeSalary)}
            </text>

            {series.map((s) => {
              const isSelected = s.value === selectedRegion;
              const isHover = s.value === hoverRegion;
              const dim = (hoverRegion && !isHover && !isSelected) || (!hoverRegion && false);
              return (
                <path
                  key={s.value}
                  d={linePath(s)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={isSelected || isHover ? 3.4 : 1.4}
                  strokeOpacity={dim ? 0.18 : isSelected || isHover ? 1 : 0.55}
                  className="wirc-line"
                  onMouseEnter={() => setHoverRegion(s.value)}
                  onClick={() => onRegionChange?.(s.value)}
                />
              );
            })}

            {series.map((s) => {
              if (s.value !== selectedRegion && s.value !== hoverRegion) return null;
              const p = s.points[activeIndex];
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
            <span className="wirc-ranking__hint">de menos a mas IRPF</span>
          </div>
          <ol className="wirc-ranking__list">
            {ranking.map((row, position) => {
              const isSelected = row.value === selectedRegion;
              const diff = row.amount - cheapest;
              return (
                <li key={row.value}>
                  <button
                    type="button"
                    className={`wirc-rank-row${isSelected ? " is-selected" : ""}`}
                    onClick={() => onRegionChange?.(row.value)}
                    onMouseEnter={() => setHoverRegion(row.value)}
                    onMouseLeave={() => setHoverRegion(null)}
                    style={{ "--rank-color": row.color } as CSSProperties}
                  >
                    <span className="wirc-rank-pos">{position + 1}</span>
                    <span className="wirc-rank-dot" aria-hidden="true" />
                    <span className="wirc-rank-label">{row.label}</span>
                    <span className="wirc-rank-amount">{formatValue(row.amount)}</span>
                    <span className="wirc-rank-diff">
                      {position === 0 ? "—" : `+${mode === "percent" ? formatPercent(diff) : formatEuro(diff)}`}
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
