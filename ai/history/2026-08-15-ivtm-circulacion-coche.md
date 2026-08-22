# 2026-08-15 — IVTM (circulacion) en coche en propiedad

## Objetivo

Añadir en el paso 7 el impuesto de circulacion (IVTM) en el bloque de coche en propiedad, con el mismo patron que el IBI en vivienda.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`

## Resumen de cambios

- Nuevo bloque IVTM dentro de «Coche en propiedad»: potencia fiscal (CV), tipo estimado €/CV (defecto 9,5) y cuota anual/mensual.
- Varias filas de vehiculos, total IVTM y tarjeta en el resumen lateral.
- `ConsumptionTaxesResult` incluye `vehicleTaxAnnual`; entra en impacto total y en otros impuestos del paso 8.
- La pregunta de propiedad del coche y la nota de Gasolina mencionan IVTM ademas del impuesto de compra.

## Verificacion

- `pnpm run build` — correcto.

## Estado siguiente

Revisar en escritorio y movil el bloque de coche con IVTM + compra; validar tipo €/CV orientativo con fuente oficial si se usa editorialmente.
