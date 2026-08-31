import { useLayoutEffect, type RefObject } from "react";

type SpreadLabelsOptions = {
  /** Margen muerto en cada extremo (p.ej. medio pulgar de un slider). */
  edgeInset?: number;
  /** Separacion minima entre dos etiquetas. */
  gap?: number;
};

/**
 * Coloca las etiquetas hijas (con `data-percent`) centradas sobre su punto de la
 * barra y las separa cuando dos textos se solaparian. El contenedor debe ser
 * `position: relative` y las etiquetas `position: absolute`.
 */
export function useSpreadLabels(
  containerRef: RefObject<HTMLElement | null>,
  layoutKey: string,
  { edgeInset = 0, gap = 6 }: SpreadLabelsOptions = {},
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const layout = () => {
      const labels = Array.from(container.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement && child.dataset.percent != null,
      );
      const width = container.clientWidth;
      if (labels.length === 0 || width === 0) return;

      const usableWidth = Math.max(0, width - edgeInset * 2);
      const boxes = labels.map((element) => {
        element.style.left = "";
        const percent = Number(element.dataset.percent ?? "0") / 100;
        const labelWidth = element.offsetWidth;
        return {
          element,
          width: labelWidth,
          left: edgeInset + usableWidth * percent - labelWidth / 2,
        };
      });

      let minLeft = 0;
      for (const box of boxes) {
        box.left = Math.max(box.left, minLeft);
        minLeft = box.left + box.width + gap;
      }

      let maxRight = width;
      for (let index = boxes.length - 1; index >= 0; index -= 1) {
        const box = boxes[index];
        box.left = Math.max(0, Math.min(box.left, maxRight - box.width));
        maxRight = box.left - gap;
      }

      for (const box of boxes) {
        box.element.style.left = `${box.left}px`;
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
  }, [containerRef, edgeInset, gap, layoutKey]);
}
