import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import "./SalarySlider.css";

export type SalarySliderScale = "linear" | "log";

type SalarySliderProps = {
  /** Valor actual en euros. */
  value: number;
  /** Callback con el nuevo valor en euros (ya redondeado). */
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Paso para la escala lineal (ignorado en escala logaritmica). */
  step?: number;
  /** Marcas de referencia a mostrar bajo el slider. */
  markers?: number[];
  /** Texto auxiliar a la derecha del valor (p.ej. "brutos al año"). */
  unitLabel?: string;
  /**
   * "linear": cada paso vale lo mismo. "log": el dinero sube mas rapido cuanto
   * mas arriba esta el slider (mismo desplazamiento => mayor salto en euros).
   */
  scale?: SalarySliderScale;
  id?: string;
  ariaLabel?: string;
};

const LOG_STEPS = 1000;

const euroFormatter = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });

function formatNumber(value: number) {
  return euroFormatter.format(Number.isFinite(value) ? value : 0);
}

function parseNumber(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Redondea a un escalon "bonito" que crece con el importe. */
function roundNice(value: number) {
  if (value < 20000) return Math.round(value / 100) * 100;
  if (value < 50000) return Math.round(value / 500) * 500;
  if (value < 100000) return Math.round(value / 1000) * 1000;
  if (value < 200000) return Math.round(value / 2500) * 2500;
  return Math.round(value / 5000) * 5000;
}

export function SalarySlider({
  value,
  onChange,
  min = 14000,
  max = 120000,
  step = 500,
  markers,
  unitLabel,
  scale = "linear",
  id = "salary-slider",
  ariaLabel = "Salario en euros",
}: SalarySliderProps) {
  const isLog = scale === "log";
  const ratio = max / min;
  const safeValue = clamp(value, min, max);
  const [textValue, setTextValue] = useState(formatNumber(safeValue));

  const valueToPos = (v: number) =>
    Math.round((Math.log(clamp(v, min, max) / min) / Math.log(ratio)) * LOG_STEPS);
  const posToValue = (p: number) => clamp(roundNice(min * Math.pow(ratio, p / LOG_STEPS)), min, max);

  const fillPercent = isLog
    ? (valueToPos(safeValue) / LOG_STEPS) * 100
    : ((safeValue - min) / (max - min)) * 100;

  const handleChange = (raw: number) => {
    onChange(isLog ? posToValue(raw) : clamp(raw, min, max));
  };

  const commitTextValue = () => {
    const parsed = clamp(parseNumber(textValue), min, max);
    const normalized = isLog ? roundNice(parsed) : Math.round(parsed / step) * step;
    const nextValue = clamp(normalized, min, max);
    onChange(nextValue);
    setTextValue(formatNumber(nextValue));
  };

  useEffect(() => {
    setTextValue(formatNumber(safeValue));
  }, [safeValue]);

  return (
    <div className="salary-slider" style={{ "--salary-slider-value": `${fillPercent}%` } as CSSProperties}>
      <div className="salary-slider__top">
        <div className="salary-slider__value-shell">
          <input
            id={`${id}-text`}
            className="salary-slider__value-input"
            inputMode="decimal"
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
            onBlur={commitTextValue}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                setTextValue(formatNumber(safeValue));
                event.currentTarget.blur();
              }
            }}
            aria-label={`${ariaLabel} (editable)`}
          />
          <span aria-hidden="true">€</span>
        </div>
        {unitLabel && <span>{unitLabel}</span>}
      </div>
      <input
        id={id}
        type="range"
        min={isLog ? 0 : min}
        max={isLog ? LOG_STEPS : max}
        step={isLog ? 1 : step}
        value={isLog ? valueToPos(safeValue) : safeValue}
        onChange={(event) => handleChange(Number(event.target.value))}
        aria-label={ariaLabel}
      />
      {markers && markers.length > 0 && (
        <div className="salary-slider__scale" aria-hidden="true">
          {markers.map((marker) => (
            <span key={marker}>{formatNumber(marker)}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default SalarySlider;
