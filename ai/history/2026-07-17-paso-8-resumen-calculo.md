# 2026-07-17 — Paso 8 como resumen del calculo

## Objetivo

Convertir el paso 8 en un resumen de todos los calculos del recorrido fiscal, no solo en una vista de salario neto.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `ai/current.md`

## Resumen de cambios

- Nueva variante `final` en `WorkerFiscalSummaryCard`: copy de cierre, soporte de otros impuestos y CTA a FAQ.
- Paso 8 renombrado a «Resumen del calculo» en el wizard.
- Contenido del paso 8: resumen de metricas + desglose `FiscalKpiRow`.
- Ajuste de estilos para evitar doble marco (card dentro de card).

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

- Revisar visualmente escritorio y movil el paso 8 integrado.
