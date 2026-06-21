# 2026-06-21 — WCTC iconos de ayuda por categoria

## Objetivo

Anadir iconos de ayuda contextual en las filas de gasto del paso 7 donde el usuario puede dudar que incluir.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`

## Resumen

- Campo opcional `help` en `ConsumptionTaxCategory`.
- `InfoButton` (size sm) junto al nombre en 9 categorias con textos sobre ambito, solapamientos y matices fiscales.
- Estilos `.wctc-category-label` y `.wctc-help` para alinear etiqueta + boton.

## Verificacion

- Linter: sin errores nuevos en los archivos modificados.

## Estado siguiente

- Revisar popovers en `/calculadora-fiscal` paso 7 (posicion en filas inferiores y movil).
