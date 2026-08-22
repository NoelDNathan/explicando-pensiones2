# 2026-08-04 — Complementos y especie como desplegable

## Objetivo

Sustituir los inputs libres de complementos y salario en especie por desplegables con cantidades prefijadas.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`
- `ai/history/2026-08-04-complementos-desplegable.md`

## Resumen

- Un `<select>` por concepto con porcentajes fijos: 0, 2, 5, 8, 10, 12, 15, 20, 25 %.
- Cada opción muestra `% · EUR` según el salario fijo actual; al mover el salario se actualizan los euros.
- El porcentaje sigue siendo la fuente de verdad.

## Verificacion

- `pnpm run build` correcto.
