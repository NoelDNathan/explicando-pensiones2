# 2026-08-23 — Quitar nota de tope en movilidad geográfica

## Objetivo

Eliminar el párrafo informativo sobre el salario bruto del paso 1 como tope del incremento por movilidad geográfica.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `ai/current.md`

## Resumen

- Eliminada la nota «Usamos tu salario bruto del paso 1… como tope máximo del incremento» en `GeographicMobilityQuestions`.
- Retirada la prop `declaredGrossWorkIncome` de ese subcomponente (ya no se usaba en la UI).
- El cálculo del incremento sigue usando el salario del paso 1 en el motor.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

- Sin cambios pendientes en este punto.
