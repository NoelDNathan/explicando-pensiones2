import type { CSSProperties } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./SalarySlider.css";

export type SalarySliderScale = "linear" | "log";

/** Punto de referencia dibujado sobre la barra (p.ej. SMI o salario medio). */
export type SalarySliderReference = {
  /** Importe en euros, en la misma unidad que el slider. */
  value: number;
  /** Etiqueta corta mostrada sobre la barra. */
  label: string;
  /** Texto del tooltip; por defecto "etiqueta: importe €". */
  title?: string;
};

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
  /** Puntos de referencia (SMI, salario medio...) marcados sobre la barra. */
  references?: SalarySliderReference[];
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

/** Ancho del pulgar del slider: la barra util empieza y acaba a la mitad de el. */
const THUMB_WIDTH = 22;

/** Separacion minima entre etiquetas de referencia. */
const REF_LABEL_GAP = 6;

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
  references,
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

  const valueToPercent = (v: number) =>
    isLog ? (valueToPos(v) / LOG_STEPS) * 100 : ((clamp(v, min, max) - min) / (max - min)) * 100;

  const fillPercent = isLog
    ? (valueToPos(safeValue) / LOG_STEPS) * 100
    : ((safeValue - min) / (max - min)) * 100;

  const visibleReferences = (references ?? [])
    .filter((reference) => reference.value >= min && reference.value <= max)
    .map((reference) => ({ ...reference, percent: valueToPercent(reference.value) }))
    .sort((a, b) => a.percent - b.percent);

  const refsRef = useRef<HTMLDivElement | null>(null);
  const refsLayoutKey = visibleReferences.map((r) => `${r.label}:${r.percent.toFixed(2)}`).join("|");

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

  /**
   * Coloca las etiquetas de referencia centradas sobre su punto, pero las separa
   * cuando dos textos se solapan (p.ej. SMI y salario medio en pantallas estrechas).
   */
  useLayoutEffect(() => {
    const container = refsRef.current;
    if (!container) return;

    const layout = () => {
      const labels = Array.from(
        container.querySelectorAll<HTMLElement>(".salary-slider__ref-label"),
      );
      const width = container.clientWidth;
      if (labels.length === 0 || width === 0) return;

      const trackWidth = Math.max(0, width - THUMB_WIDTH);
      const boxes = labels.map((element) => {
        element.style.left = "";
        element.style.transform = "";
        const percent = Number(element.dataset.percent ?? "0") / 100;
        const labelWidth = element.offsetWidth;
        return {
          element,
          width: labelWidth,
          left: THUMB_WIDTH / 2 + trackWidth * percent - labelWidth / 2,
        };
      });

      let minLeft = 0;
      for (const box of boxes) {
        box.left = Math.max(box.left, minLeft);
        minLeft = box.left + box.width + REF_LABEL_GAP;
      }

      let maxRight = width;
      for (let index = boxes.length - 1; index >= 0; index -= 1) {
        const box = boxes[index];
        box.left = Math.max(0, Math.min(box.left, maxRight - box.width));
        maxRight = box.left - REF_LABEL_GAP;
      }

      for (const box of boxes) {
        box.element.style.left = `${box.left}px`;
        box.element.style.transform = "none";
      }
    };

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(container);
    window.addEventListener("resize", layout);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", layout);
    };
  }, [refsLayoutKey]);

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
      {visibleReferences.length > 0 && (
        <div className="salary-slider__refs" ref={refsRef}>
          {visibleReferences.map((reference) => (
            <button
              key={reference.label}
              type="button"
              className="salary-slider__ref-label"
              data-percent={reference.percent}
              title={reference.title ?? `${reference.label}: ${formatNumber(reference.value)} €`}
              onClick={() => onChange(reference.value)}
            >
              {reference.label}
            </button>
          ))}
        </div>
      )}
      <div className="salary-slider__track">
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
        {visibleReferences.map((reference) => (
          <span
            key={reference.label}
            className="salary-slider__ref-dot"
            style={{ "--salary-slider-ref": `${reference.percent / 100}` } as CSSProperties}
            aria-hidden="true"
          />
        ))}
      </div>
      {markers && markers.length > 0 && (
        <div className="salary-slider__scale" aria-hidden="true">
          {markers.map((marker, index) => {
            const percent = valueToPercent(marker);
            const isFirst = index === 0;
            const isLast = index === markers.length - 1;
            return (
              <span
                key={marker}
                className="salary-slider__scale-marker"
                style={{
                  left: `${percent}%`,
                  transform: isFirst ? "none" : isLast ? "translateX(-100%)" : "translateX(-50%)",
                }}
              >
                {formatNumber(marker)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SalarySlider;
