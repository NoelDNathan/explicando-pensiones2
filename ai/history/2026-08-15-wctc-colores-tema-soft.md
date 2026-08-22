# 2026-08-15 — Colores bloque vivienda al tema soft

## Objetivo

Unificar colores del bloque IBI/compra de vivienda con el resto de la calculadora (tema claro).

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`

## Resumen de cambios

- Bloque vivienda y compra usan variables `--wctc-*` en lugar de verdes/azules oscuros fijos.
- Overrides en `FiscalSoftTheme` para titulos, filas, inputs, botones y totales del bloque de compra.

## Verificacion

- `pnpm run build` — correcto.

## Estado siguiente

Revisar paso 7 en escritorio y movil con tema soft.
