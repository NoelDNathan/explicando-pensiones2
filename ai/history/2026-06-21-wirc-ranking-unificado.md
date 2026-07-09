# 2026-06-21 — WIRC ranking unificado

## Objetivo

Eliminar la duplicacion confusa de dos listas/secciones en el comparador IRPF que repetian la funcion del selector de comunidad de la tarjeta de tramos.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.css`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`

## Resumen de cambios

- Ranking lateral: una sola lista ordenada por IRPF en el salario activo.
- Fila de `selectedRegion`: no clicable, etiqueta "tu IRPF (arriba)".
- Resto de filas y stats menos/mas IRPF: solo `setCompareRegion` (linea B del grafico).
- Quitado `onRegionChange` del comparador; la CCAA real solo se cambia en el `<select>` de `WorkerIrpfTranchesCard`.
- Eliminado CSS huerfano (`.wirc-ranking__section`, `.wirc-ranking__list--picker`).

## Estado siguiente

- Revisar en `/calculadora-fiscal` paso 5 que no aparezcan las secciones antiguas tras recargar.
- Confirmar con el usuario que la separacion A (IRPF real) vs B (comparar) queda clara.
