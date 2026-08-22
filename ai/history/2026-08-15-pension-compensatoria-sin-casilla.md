# 2026-08-15 — Pensión compensatoria sin casilla duplicada

## Objetivo

Quitar la casilla «Hay sentencia o convenio regulador formalizado» de la pregunta de pensión compensatoria, porque el requisito ya figura en la descripción de la pregunta.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `ai/current.md`

## Resumen de cambios

- Eliminado el `CheckField` redundante en la pregunta «¿Pagas una pensión a tu expareja?».
- Al indicar un importe mayor que cero, `compensatoryPensionFormalized` se marca automáticamente para mantener el cálculo fiscal.

## Verificación

- `pnpm run build` — correcto.

## Estado siguiente

Revisar en UI que la pregunta de pensión compensatoria solo pide el importe y que el efecto fiscal se calcula al introducir cantidad.
