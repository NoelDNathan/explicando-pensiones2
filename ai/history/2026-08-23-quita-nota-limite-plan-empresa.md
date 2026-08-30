# 2026-08-23 — Quitar nota de límite en plan de empresa

## Objetivo

Eliminar el párrafo informativo sobre el salario bruto del paso 1 como límite de la aportación al plan de pensiones de la empresa.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `ai/current.md`

## Resumen

- Eliminada la nota «Usamos tu salario bruto del paso 1… para calcular el límite de tu aportación al plan» en la pregunta de plan de pensiones de la empresa.
- El cálculo del límite sigue usando el salario del paso 1 en el motor.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

- Sin cambios pendientes en este punto.
