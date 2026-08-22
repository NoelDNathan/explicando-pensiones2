# 2026-08-15 — IVA mensual y tip del banco

## Objetivo

En el paso 7, recomendar usar el desglose de % de gasto del banco y mostrar lo que se paga de IVA e impuestos en mensual.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen

- Tip bajo la cabecera: mirar el porcentaje de cada categoria en la app del banco.
- Resumen de IVA, impuestos especiales, IBI e impacto total en euros al mes.
- El gasto asignado y el modelo interno siguen anuales para no romper el resto del recorrido.

## Verificacion

- `pnpm run build` — correcto.

## Estado siguiente

Revisar el paso 7 en `/calculadora-fiscal` en escritorio y movil.
