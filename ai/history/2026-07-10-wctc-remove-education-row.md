# 2026-07-10 — Eliminar fila educación/seguros/banca en WCTC

## Objetivo

Quitar la categoría «Educacion / seguros / banca» del reparto de gasto en `WorkerConsumptionTaxesCard`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `ai/current.md`

## Resumen de cambios

- Eliminada la entrada `education-insurance-banking` de `DEFAULT_CATEGORIES`.

## Verificación

- Sin referencias restantes a `education-insurance-banking` en el repositorio.

## Estado siguiente

- Revisar el paso 7 en `/calculadora-fiscal` y en `/componentes` para confirmar el listado de categorías.
