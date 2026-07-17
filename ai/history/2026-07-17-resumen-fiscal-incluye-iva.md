# 2026-07-17 — Resumen fiscal incluye IVA

## Objetivo

Incorporar el IVA estimado en las metricas del resumen rapido de la calculadora fiscal del trabajador.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/App.tsx`
- `ai/current.md`

## Resumen de cambios

- Nueva prop `vatAnnual` en `WorkerFiscalSummaryCard`.
- Los pagos del trabajador suman cotizaciones + IRPF + IVA; el salario neto y el total de impuestos/cotizaciones se recalculan en consecuencia.
- Textos actualizados para reflejar el desglose con IVA.
- `FiscalWorkerDashboard` pasa `result.vat` (proxy EPF 2024 hasta completar el paso de consumo).
- Showcase en `/componentes` usa IVA fijo de referencia (1.836 €).

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

- Revisar visualmente en escritorio y movil que los textos del desglose no desborden en tarjetas estrechas.
- Valorar si el titulo del resumen debe mencionar explicitamente que el neto es "despues de consumo estimado".
