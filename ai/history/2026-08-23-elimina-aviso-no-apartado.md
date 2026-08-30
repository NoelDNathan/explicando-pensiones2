# 2026-08-23 — Quitar aviso al responder No en el paso 4

## Objetivo

Eliminar el texto «Perfecto, no aplicaremos nada de este apartado. Puedes cambiar la respuesta cuando quieras.» de todas las preguntas Sí/No del paso 4.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`
- `ai/history/2026-08-23-elimina-aviso-no-apartado.md`

## Resumen

- Eliminado el párrafo de confirmación al pulsar No en `ReductionQuestion` y `FamilyQuestion`.
- Eliminados estilos asociados `.irpf-reduction-question__skip`.

## Verificación

- `pnpm run build` correcto.
- Comprobado en `/calculadora-fiscal` paso 4: el texto no está en el DOM ni al cambiar de Sí a No.

## Estado siguiente

- Commit/push solo si el usuario lo pide.
