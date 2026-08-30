# 2026-08-30 — Gráfico circular de distribución del gasto (paso 7)

## Objetivo

Añadir un gráfico circular con la distribución del gasto en el bloque izquierdo del paso 7.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen

- Donut con Recharts encima de la tabla de categorías: colores por tono, leyenda con %, total mensual en el centro y tooltip al pasar el ratón.
- Estado vacío si no hay gasto asignado. Responsive en móvil (gráfico arriba, leyenda debajo).

## Estado siguiente

Revisar visualmente en `/calculadora-fiscal` paso 7 con valores medios y con reparto manual.
