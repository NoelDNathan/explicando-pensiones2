# 2026-08-17 — Plan y mutualidad en dos preguntas

## Objetivo

Separar la pregunta combinada de plan de pensiones y mutualidad profesional en dos preguntas independientes.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `ai/current.md`

## Resumen de cambios

- «¿Pagas tú un plan de pensiones?» con importe propio.
- «¿Pagas una mutualidad profesional?» con importe propio.
- Efecto fiscal mostrado por pregunta (marginal respecto al límite compartido).

## Verificación

- `pnpm run build` — correcto.

## Estado siguiente

Revisar en UI paso 4 que ambas preguntas funcionan de forma independiente.
