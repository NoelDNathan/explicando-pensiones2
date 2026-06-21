# 2026-06-21 — WCTC orden importe/porcentaje

## Objetivo

Simplificar la fila de gasto en el paso 7: quitar el indicador de sincronizacion y mostrar primero el importe en euros y despues el porcentaje.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`

## Resumen

- Eliminado el elemento `.wctc-sync` del markup y sus estilos.
- Reordenadas cabecera, inputs editables y fila TOTAL: importe anual (€) antes que % del gasto.
- Grid reducido de 6 a 5 columnas; el campo de importe mantiene `minmax(150px, 0.62fr)`.

## Verificacion

- Linter: sin errores nuevos en los archivos modificados.
- `pnpm run build`: falla por errores previos en otros componentes (fogasa, imports sin usar).

## Estado siguiente

- Revisar visualmente en `/calculadora-fiscal` paso 7 en escritorio y movil.
