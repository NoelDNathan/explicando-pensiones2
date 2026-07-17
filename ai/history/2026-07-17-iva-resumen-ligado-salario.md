# 2026-07-17 — IVA del resumen ligado al salario

## Objetivo

Hacer que el IVA del resumen rapido varie cuando cambia el salario, en lugar de quedarse fijo.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/vatEpFProxy.ts` (nuevo)
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.tsx`
- `src/App.tsx`
- `ai/current.md`

## Resumen de cambios

- Nuevo helper `estimateVatFromEpFProxy`: mapea neto mensual a tramos de ingreso de la EPF 2024 (INE) y devuelve gasto anual e IVA estimado del hogar.
- `FiscalWorkerDashboard` elimina consumo mensual fijo (1.700 €) para el proxy; calcula IVA a partir del neto laboral anual / 12.
- Si el usuario completa el paso de impuestos de consumo, se mantiene `consumptionTaxes.vatAnnual`.
- `WorkerFiscalSummaryCard` suma totales a partir de importes redondeados para que cuadre desglose y total.
- Showcase en `/componentes` recalcula IVA con el mismo helper.

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

- Revisar visualmente saltos de tramo EPF al cruzar umbrales de neto mensual.
- Documentar en metodologia el uso del neto individual como proxy del tramo de hogar EPF.
