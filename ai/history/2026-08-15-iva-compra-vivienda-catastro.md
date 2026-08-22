# 2026-08-15 — IVA/ITP en compra y valor catastral editable

## Objetivo

Permitir editar valor catastral y tipo IBI, enlazar al Catastro, avisar en hipoteca que abajo se calcula el impuesto de compra, y añadir calculadora de IVA/ITP para varias viviendas.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `ai/current.md`

## Resumen de cambios

- IBI: campos separados para valor catastral (€) y tipo IBI estimado (%), enlace a sedecatastro.gob.es.
- Hipoteca / deudas: nota visible «Mas abajo puedes estimar el IVA o ITP pagado al comprar».
- Nuevo bloque «Impuesto en la compra»: precio, CCAA, tipo obra nueva (IVA 10 %) o segunda mano (ITP orientativo por CCAA), varias filas y total.
- El impuesto de compra es informativo (pago unico); no entra en el impacto mensual del resumen.

## Verificacion

- `pnpm run build` — correcto.

## Estado siguiente

Revisar en escritorio y movil el bloque de compra con varias viviendas y el enlace al Catastro.
