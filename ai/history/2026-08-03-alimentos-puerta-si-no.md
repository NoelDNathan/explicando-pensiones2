# 2026-08-03 — Pensión de alimentos con puerta Sí/No

## Objetivo

Evitar el input `0 EUR / año` siempre visible: preguntar primero si paga pensión de alimentos.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`
- `ai/history/2026-08-03-alimentos-puerta-si-no.md`

## Resumen de cambios

- Nuevo `ChildSupportAsks`: Sí/No primero; importe solo si Sí; formalización solo si hay importe.
- Al responder No se pone `childSupportAnnual` a 0 y se limpia la formalización.

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

Commit/push solo si el usuario lo pide.
