# Plan de pensiones de empleo: salario del paso 1

Fecha: 2026-08-22

## Objetivo

Eliminar la pregunta redundante «Tu salario bruto en esa empresa» del plan de pensiones aportado por la empresa en el paso 4.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/irpf2025Adjustments.ts`
- `src/components/fiscal-worker-dashboard/irpf2025Calc.ts`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `scripts/verify-irpf-2025-core.mjs`

## Resumen de cambios

- El límite de la aportación del trabajador al plan de empleo usa el salario bruto del paso 1 (`declaredGrossWorkIncome`), igual que la movilidad geográfica.
- Se elimina el campo «Tu salario bruto en esa empresa» y la advertencia de «rendimiento del empleador pendiente».
- La pregunta muestra una nota cuando hay salario en el paso 1.
- Verificación: `pnpm run build` y `pnpm run verify:irpf2025` (24 comprobaciones) correctos.

## Estado siguiente

- Mantener `grossIncomeFromPensionEmployer` en el tipo por compatibilidad interna; ya no se usa en UI ni en el cálculo.
