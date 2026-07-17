# 2026-07-17 — IVA como porcentaje del neto

## Objetivo

Simplificar el calculo proxy de IVA: aplicarlo como porcentaje del salario neto anual.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/vatEpFProxy.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/App.tsx`
- `ai/current.md`

## Resumen de cambios

- Nueva funcion `estimateVatFromNetSalary(annualNetSalaryEur)`.
- Formula: `IVA = neto × tipo_efectivo_EPF / 100`.
- El tipo efectivo (~9-10 %) se toma del tramo EPF correspondiente al neto mensual.
- El gasto anual proxy pasa a ser el propio neto (base simplificada).
- Etiqueta de fuente: `INE EPF 2024: X % del neto`.

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

- Valorar si el texto del resumen debe explicitar el porcentaje aplicado.
