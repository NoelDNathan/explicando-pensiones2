# 2026-08-31 — Aviso de que el mínimo personal y familiar se ve en el paso 6

## Objetivo

Que el bloque «¿Qué es el mínimo personal y familiar?» del paso 4 diga que su efecto no se ve ahí, sino más adelante, en el paso 6.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen

El concepto del mínimo cierra ahora con un párrafo destacado (`.wfsc-concept__later`, filete verde a la izquierda): el mínimo no resta de la base liquidable, aquí solo se calcula su importe, y se ve restando en el paso 6 («IRPF por tramos»), cuando ya hay una cuota de la que descontarlo.

## Verificación

- `pnpm run build` y `tsc -b` correctos.
- Comprobado en `/calculadora-fiscal` paso 4: el aviso aparece con los colores del tema suave y no hay overflow horizontal en 1280 px ni en 375 px.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
