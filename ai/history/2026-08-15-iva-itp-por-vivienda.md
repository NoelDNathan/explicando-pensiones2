# 2026-08-15 — ITP/IVA distinto por vivienda

## Objetivo

Reflejar que la segunda vivienda o mas tributa distinto que la primera habitual, y que obra nueva varia por CCAA.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`

## Resumen de cambios

- Nuevo selector «Uso en la compra»: Primera habitual vs Segunda o mas.
- ITP con dos tablas orientativas (habitual vs adicional); al anadir vivienda, por defecto es adicional.
- Obra nueva: IVA 10 % (IGIC 6,5 % en Canarias) + AJD por CCAA.
- Etiqueta del impuesto muestra tipo aplicado y uso.

## Verificacion

- `pnpm run build` — correcto.

## Estado siguiente

Revisar con dos viviendas de segunda mano en Galicia o Castilla y Leon (habitual 8 % vs adicional 10 %).
