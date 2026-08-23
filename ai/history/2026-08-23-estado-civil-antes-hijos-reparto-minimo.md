# 2026-08-23 — Estado civil antes de hijos y reparto del mínimo

## Objetivo

Reordenar el paso 4: estado civil antes de hijos; preguntar el reparto del mínimo por hijo solo con declaración individual (no conjunta con cónyuge).

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`
- `ai/history/2026-08-23-estado-civil-antes-hijos-reparto-minimo.md`

## Resumen de cambios

- «¿Cuál es tu estado civil?» pasa al inicio del bloque familiar, antes de «¿Tienes hijos?».
- La pregunta de reparto del mínimo por hijo solo aparece si `jointTaxationType !== 'married'` (declaración no conjunta con cónyuge).
- Con declaración conjunta se fuerza `entitlementShare: '1'` en todos los perfiles de hijos.
- Texto de ayuda del reparto aclara el caso de renta por separado.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

Commit/push solo si el usuario lo pide.
