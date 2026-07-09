# 2026-07-09 - Iconos de ayuda junto a etiqueta en WSBC

## Objetivo

Evitar que los iconos de informacion queden pegados al borde derecho de la columna en `WorkerSalaryBaseCard`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.css`

## Resumen

- `wsbc-label-row` pasa a `inline-flex` y la etiqueta deja de crecer (`flex: 0 1 auto`).
