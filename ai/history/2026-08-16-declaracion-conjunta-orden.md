# 2026-08-16 — Orden declaración conjunta

## Objetivo

Mover la pregunta «¿Vas a hacer la declaración conjunta?» una posición hacia abajo en el bloque familiar del paso 4.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `ai/current.md`

## Resumen de cambios

- En `MaritalReductionsGroup`, la declaración conjunta pasa a mostrarse después de la previsión del cónyuge (casado/a) o la pensión compensatoria (divorciado/a).
- Para otros estados civiles solo aparece la declaración conjunta; sin cambio de orden.

## Verificación

- `pnpm run build` — correcto.

## Estado siguiente

Confirmar en UI que el flujo tras elegir estado civil muestra primero la pregunta de pareja/expareja y luego la de declaración conjunta.
