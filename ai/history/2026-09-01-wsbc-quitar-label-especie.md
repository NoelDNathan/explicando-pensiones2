# 2026-09-01 — Quitar etiqueta «Salario en especie anual» del paso 1

## Objetivo

Eliminar la etiqueta visible «Salario en especie anual» del formulario de base real.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `ai/current.md`

## Resumen de cambios

- Eliminada la fila `.wsbc-label-row` con la etiqueta y el `InfoButton` de salario en especie.
- Eliminada la constante `IN_KIND_SALARY_HELP`, ya sin uso.
- Los inputs de euros y porcentaje se mantienen; conservan `aria-label` para accesibilidad.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
