# 2026-07-09 - SalarySlider en WorkerContributionLimitsCard

## Objetivo

Permitir ajustar el salario bruto anual desde el paso 2 (`Limites de cotizacion`) sin volver al paso 1.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/App.tsx`

## Resumen de cambios

- Se anade `SalarySlider` con escala logaritmica y etiqueta `Salario bruto anual`, visible cuando llegan `userBaseAnnual` y `onUserBaseAnnualChange`.
- El dashboard conecta el slider con `result.grossSalaryAnnual` y ajusta el salario base restando complementos y salario en especie.
- `/componentes` usa un showcase con estado local para mostrar el control interactivo.

## Verificacion

- Sin errores de linter en los archivos tocados.
- `pnpm run build` pendiente; el arbol ya tenia errores TS preexistentes en otros modulos.

## Estado siguiente

- Revisar visualmente el paso 2 en `/calculadora-fiscal` en escritorio y movil.
