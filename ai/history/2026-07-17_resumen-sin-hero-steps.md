# 2026-07-17 — Resumen sin hero de pasos

## Objetivo

Mostrar solo `WorkerFiscalSummaryCard` en el paso inicial de la calculadora fiscal, sin la cabecera duplicada de `WorkerFiscalStepsCard`.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`

## Resumen de cambios

- `WorkerFiscalStepsCard` se renderiza solo cuando `activeWorkerStepId !== 0`.
- En el paso resumen (0) el usuario ve únicamente la tarjeta de resumen con slider, métricas y CTA al recorrido detallado.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

- Revisar visualmente en `/calculadora-fiscal` que el resumen inicial no muestra la cabecera de pasos y que el CTA «Ver cómo funciona, paso a paso» abre el paso 1 con navegación restaurada.
