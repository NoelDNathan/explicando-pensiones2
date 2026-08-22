# 2026-08-12 — Badge «No suma» en preguntas de exclusión

## Objetivo

Indicar en cada pregunta del detalle familiar cuál hace que el hijo o ascendiente no sume al mínimo, con una pastilla como la del encabezado del bloque.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`
- `ai/history/2026-08-12-preguntas-no-suma-badge.md`

## Resumen

- Nuevo `QuestionExclusionStatus` y helper `fieldExcludesMinimum` por campo causal.
- `PersonAsk` admite `showsExclusion` y agrupa efecto EUR y badge en `.wprc-person-ask__meta` alineado a la derecha.
- El badge dice `Hace que no sume` (no `No suma`) y aparece en todos los factores a la vez: edad+discapacidad, convivencia, ingresos, declaración y pensión de alimentos formalizada.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

- Revisión visual en paso 4 con hijo excluido por convivencia «No» y por pensión formalizada.
