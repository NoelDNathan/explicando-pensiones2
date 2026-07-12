# 2026-07-12 — Reordenar y destacar resumen WSCC

## Objetivo

En `WorkerSocialContributionsCard`, poner «Coste total cotizaciones» encima de «Coste total empresa» y destacar el primero con texto rojo.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`
- `ai/current.md`

## Resumen de cambios

- Orden: cotizaciones totales → coste total empresa.
- Estilo `--total`: borde/fondo rojizos, etiqueta e importe en rojo, tipografia mayor.
- Estilo `--hero` ligeramente atenuado.

## Estado siguiente

- Revisar paso 3 en `/calculadora-fiscal`.
