# 2026-08-03 — Tope de hijos y ascendientes a 10

## Objetivo

Permitir indicar hasta 10 hijos y hasta 10 ascendientes a cargo en el paso de reducciones.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`

## Resumen de cambios

- `childCountOptions` y `ascendantCountOptions` pasan de 1–4 / 1–3 a 1–10 (`MAX_DEPENDENT_COUNT = 10`).
- Los perfiles iniciales se crean o rellenan hasta 10 para que el editor no se quede corto al subir el contador.
- El mínimo del 4.º hijo (y siguientes) ya lo cubría el motor con `Math.min(index, length - 1)`.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

Si 10 chips se ven densos en móvil, valorar un selector compacto solo para conteos altos.
