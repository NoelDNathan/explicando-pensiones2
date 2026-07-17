# 2026-07-17 — Reorden pasos 7 y 8

## Objetivo

Mover el paso de salario neto despues del paso de IVA y antes de preguntas frecuentes.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `ai/current.md`

## Resumen de cambios

- Paso 7: IVA y otros impuestos.
- Paso 8: Salario neto.
- Paso 9: Preguntas frecuentes (sin cambio de id).
- Actualizados textos, ejemplos de nomina y numeracion visible.

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

- Revisar visualmente la navegacion entre pasos 6 → 7 → 8 → 9.
