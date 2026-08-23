# 2026-08-23 — Preguntas de pareja junto al estado civil

## Objetivo

Mover previsión del cónyuge, pensión compensatoria y declaración conjunta justo debajo de «¿Cuál es tu estado civil?», antes de hijos y resto del bloque familiar.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `ai/current.md`
- `ai/history/2026-08-23-preguntas-estado-civil-junto-estado-civil.md`

## Resumen de cambios

- `MaritalReductionsGroup` pasa de después de discapacidad a inmediatamente después del estado civil.
- Textos de declaración conjunta y guía actualizados: los hijos se indican «a continuación», no «en la primera pregunta».

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

Commit/push solo si el usuario lo pide.
