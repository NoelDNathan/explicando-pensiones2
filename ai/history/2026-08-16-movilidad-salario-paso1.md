# 2026-08-16 — Movilidad geográfica: salario del paso 1

## Objetivo

Quitar la pregunta redundante de salario bruto en movilidad geográfica y dejar claro que el incremento máximo es 2.000 €.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/irpf2025Adjustments.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`

## Resumen de cambios

- Nueva función `calculateGeographicMobilityIncrement2025`: usa el salario bruto del paso 1 como tope del incremento.
- Eliminado el campo «¿Cuál fue el salario bruto anual de ese empleo?»; solo queda gastos específicos.
- Texto actualizado: límite del incremento 2.000 €; nota con el salario del paso 1.
- `declaredGrossWorkIncome` pasa del dashboard al formulario del paso 4.

## Verificación

- `pnpm run build` — correcto.
- `pnpm run verify:irpf2025` — 24 comprobaciones correctas.

## Estado siguiente

- Sin pendientes de esta interacción.
