# 2026-08-23 — Eliminar pensión de alimentos en el detalle del hijo

## Objetivo

Quitar del paso 4 la pregunta «¿Pagas una pensión de alimentos por este hijo?» y el subflujo de importe y sentencia.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`
- `ai/history/2026-08-23-elimina-pregunta-alimentos-hijo.md`

## Resumen de cambios

- Eliminado `ChildSupportAsks` del detalle de cada hijo.
- Los campos del motor (`childSupportPaid`, formalización y exclusión del mínimo) quedan en 0; no se aplica la especialidad ni se deja de sumar el mínimo por alimentos.
- Si había valores previos en el estado, se limpian al montar la tarjeta.

## Verificación

- `pnpm run build` correcto.
- Revisión visual en `/calculadora-fiscal` paso 4.

## Estado siguiente

Commit/push solo si el usuario lo pide.
