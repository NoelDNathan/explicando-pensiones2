# 2026-06-21 — WIRC diff vs media

## Objetivo

Mostrar en el ranking del comparador IRPF la diferencia de cada CCAA respecto a la media (no respecto a Madrid), con signo y color.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.css`
- `ai/current.md`

## Resumen de cambios

- Columna `wirc-rank-diff`: `row.amount - averageAmount` en el salario activo.
- Positivo: verde (`+X %` o `+X €`); negativo: rojo (`-X %` o `-X €`); en la media: `—`.
- Tooltip: "Diferencia respecto a la media de CCAA".

## Estado siguiente

- Validar visualmente en paso 5 con ambos modos (% y € al año).
