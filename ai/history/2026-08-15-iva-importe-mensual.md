# 2026-08-15 — Importe de gasto mensual en IVA

## Objetivo

Que la persona introduzca el gasto de cada categoria en euros al mes, no al año.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `ai/current.md`

## Resumen de cambios

- La columna pasa a `Importe mensual (€)` y el input convierte mes × 12 al calcular el %.
- El total de la tabla y el gasto asignado del resumen tambien se muestran al mes.

## Verificacion

- `pnpm run build` — correcto.

## Estado siguiente

Revisar el paso 7 al escribir un importe mensual y ver que el % se actualiza.
