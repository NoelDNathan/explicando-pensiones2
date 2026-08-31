# 2026-08-31 — Vivienda unificada IBI + compra

## Objetivo

Unificar IBI e impuesto de compra en una ficha por vivienda, con periodos claros y vacíos sin 0,00 €.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `src/App.tsx`

## Resumen

- Una sola lista de viviendas: IBI de este año y pago único al comprar.
- Resultados en — hasta que hay importe; totales solo con dato.
- ITP habitual solo si cambia el tipo; IVA incluido opcional en obra nueva; País Vasco y Navarra no estimados.
- Layout apilado en móvil, sin fila de 920 px.

## Estado siguiente

Revisar visualmente `/componentes` componente 20 si hace falta un preview aislado más corto.
