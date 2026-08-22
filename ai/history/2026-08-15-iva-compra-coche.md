# 2026-08-15 — IVA/ITP en compra de coche

## Objetivo

Añadir en el paso 7 un bloque opcional para estimar el impuesto en la compra de un coche, con el mismo patrón que el de vivienda.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `ai/current.md`

## Resumen de cambios

- Nuevo bloque «Si has comprado un coche (opcional)» debajo del de vivienda.
- Campos: precio, CCAA, tipo de compra (nuevo, concesionario o particular) y tramo CO2 para matriculación en nuevo.
- Cálculo orientativo: IVA 21 % / IGIC 7 % en nuevo y concesionario; ITP por CCAA en particular; matriculación 0–14,75 % según CO2 en nuevo.
- Varias filas, total informativo (pago único; no entra en el impacto mensual).
- Nota en la fila Gasolina apuntando al bloque.

## Verificación

- `pnpm run build` — correcto.

## Estado siguiente

Revisar en escritorio y móvil el bloque de coches con varias filas y validar tipos orientativos con fuente oficial si se usa editorialmente.
