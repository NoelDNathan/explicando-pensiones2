# 2026-07-12 - Bases de cotizacion 2025

## Objetivo

Asegurar que los pasos de la calculadora fiscal del trabajador usan los limites minimo y maximo de bases de cotizacion del ano de referencia 2025.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/irpfRegionCalc.ts`
- `src/components/fiscal-worker-dashboard/SocialSecurityBasesExplainer.tsx`
- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `ai/current.md`

## Resumen

- El paso 2 recibe ahora los grupos de cotizacion desde el JSON fiscal 2025 procesado.
- El calculo central y la comparativa regional usan el maximo del grupo seleccionado, con el maximo comun solo como fallback.
- Se sustituyeron textos y valores demo 2026 por valores 2025 para evitar inconsistencias visibles.
- Se limpiaron imports/variables no usados que bloqueaban el build.

## Verificacion

- Lints de archivos editados sin errores.
- `pnpm run build` correcto; quedan avisos conocidos de chunk grande y tiempos de plugins.

## Estado siguiente

La base de cotizacion mostrada en los pasos 2 y 3 debe coincidir para salarios por encima del tope 2025: 4.909,50 EUR/mes.
