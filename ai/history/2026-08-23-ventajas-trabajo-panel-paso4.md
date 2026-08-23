# 2026-08-23 — Ventajas del trabajo visibles en paso 4

## Objetivo

Hacer visibles las ventajas fiscales ligadas a otras rentas: panel con desglose de reducción por trabajo, reordenar la pregunta en bloque «Ventajas del trabajo», ocultarla si el salario ya descarta el beneficio, mejorar copy y corregir etiqueta del paso 6.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/irpf2025Calc.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `ai/current.md`
- `ai/history/2026-08-23-ventajas-trabajo-panel-paso4.md`

## Resumen de cambios

- Nuevo `WorkIncomeBenefitsSection` con copy aclaratorio y ocultación condicional si el salario descarta ventajas.
- Panel sticky del paso 4 muestra: rendimiento neto → reducción por trabajo (con estados pendiente/no aplica) → base antes de reducciones → reducciones declaradas → base liquidable; opcional deducción rentas bajas (paso 6).
- Bloques numerados: 1 familia, 2 ventajas del trabajo, 3 gastos y aportaciones.
- Paso 6: etiqueta «Deducción por rentas del trabajo bajas».
- Constantes exportadas `workBenefitsCouldApply` y umbrales en `irpf2025Calc.ts`.

## Verificación

- `pnpm run build` correcto.
- `pnpm run verify:irpf2025` (24 comprobaciones) correcto.

## Estado siguiente

Commit/push solo si el usuario lo pide.
