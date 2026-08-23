# 2026-08-23 — Quitar ayuda en ingresos del hijo

## Objetivo

Eliminar el icono de ayuda (InfoButton) de la pregunta «¿Este hijo trabaja o tiene ingresos propios?» en el detalle de cada hijo del paso 4.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`
- `ai/history/2026-08-23-quitar-ayuda-ingresos-hijo.md`

## Resumen de cambios

- Se quitó la prop `help` de `DescendantIncomeAsks` para esa pregunta; desaparece el botón de información junto al enunciado.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

Commit/push solo si el usuario lo pide.
