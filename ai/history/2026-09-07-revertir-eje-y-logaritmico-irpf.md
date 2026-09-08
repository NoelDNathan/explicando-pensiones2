# 2026-09-07 · Revertir eje Y logarítmico del comparador IRPF

## Objetivo

Deshacer la escala logarítmica vertical del comparador de IRPF por comunidad.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.tsx`
- `ai/current.md`

## Resumen de cambios

El eje Y vuelve a ser lineal (0 hasta el máximo de las series). El eje X sigue en logaritmo de salario, como antes de ese cambio.

## Estado siguiente

Sin cambio de alcance.
