# 2026-10-07 — Quitar consentimiento de estadísticas del paso 10

## Objetivo
Eliminar el bloque «¿Nos dejas usar tus cifras para hacer estadísticas?» del resumen (paso 10) en la calculadora fiscal.

## Archivos modificados
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`

## Resumen
Se dejó de renderizar `WorkerStatsConsent` debajo de `WorkerFinalSummaryCard` en el paso 10. El componente sigue en el código y en `/componentes` por si se reutiliza; la clave `fwd-stats-consent` en localStorage no se toca.

## Estado siguiente
Decidir si se retira también la sección del laboratorio `/componentes` y el endpoint `fiscal-stats`, o si el consentimiento volverá en otro sitio.
