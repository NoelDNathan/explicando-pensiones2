# 2026-07-09 - Nomina dinamica y sin sidebar

## Objetivo

Conectar la nomina de ejemplo de `WorkerFiscalStepsCard` con los valores reales de la calculadora y eliminar la barra lateral de `/calculadora-fiscal`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`

## Resumen de cambios

- La nomina usa `payrollLiveData` (base de cotizacion, cotizaciones trabajador/empresa, IRPF y liquido) calculada con `calculateSocialContributions`.
- `FiscalWorkerDashboard` pasa esos datos a `WorkerFiscalStepsCard` y elimina `FiscalSidebar`.
- El layout `.fwd` pasa a una sola columna sin la franja lateral de 260 px.

## Estado siguiente

- Revisar visualmente paso 3 y el ancho completo sin sidebar en escritorio y movil.
