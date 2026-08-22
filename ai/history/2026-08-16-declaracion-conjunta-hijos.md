# 2026-08-16 — Declaración conjunta y pregunta de hijos

## Objetivo

Aclarar en UI que los hijos de la primera pregunta pueden formar la unidad familiar de la declaración conjunta.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/familyMinimum2025.ts`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`

## Resumen de cambios

- Nueva función `countsForJointUnit`: hijo convive + (menor o 25+ con discapacidad).
- `MaritalReductionsGroup` recibe `childrenCount` y `jointUnitChildrenCount`.
- La guía muestra texto dinámico según respuestas previas y distingue mínimo por hijos vs unidad para declarar conjunta.

## Verificación

- `pnpm run build` — correcto.

## Estado siguiente

Revisar con 0 hijos, con hijos que conviven y con hijos que no conviven.
