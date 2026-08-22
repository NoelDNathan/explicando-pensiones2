# 2026-08-16 — Confirmar cero en otras rentas

## Objetivo

Corregir que «No, continuar» en ingresos fuera de nómina bloqueaba las ventajas del trabajo.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `scripts/verify-irpf-2025-core.mjs`
- `ai/current.md`

## Resumen de cambios

- Nueva función `confirmNoOtherIncome`: `otherIncomeKnown: true` y importe 0.
- El «No» de la pregunta principal usa esa confirmación; el subflujo «no sé cuánto» sigue con `clearOtherIncomeFields`.
- Regresión: confirmar 0 € desbloquea reducción y deducción por rentas bajas.

## Verificación

- `pnpm run build` — correcto.
- `pnpm run verify:irpf2025` — 24 comprobaciones superadas.

## Estado siguiente

Revisar en UI: «No» a otras rentas debe aplicar ventajas si el salario cumple requisitos.
