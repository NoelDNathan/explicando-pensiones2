# 2026-09-07 — Mínimo familiar debajo del cálculo por tramos

## Objetivo

Colocar el bloque `WorkerFamilyMinimumExplainer` más abajo que el «Cálculo por tramos» del paso 6.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFamilyMinimumExplainer.css`
- `ai/history/2026-09-07-paso6-minimo-familiar-debajo-tramos.md`

## Resumen de cambios

- El explicador del mínimo personal y familiar pasa a renderizarse después de `witc-lower`, no antes.
- En móvil queda debajo del cálculo por tramos (y de los resultados). En escritorio el grid de tres columnas no se rompe.
- El margen del bloque pasa de `margin-bottom` a `margin-top`.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
