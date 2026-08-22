# 2026-08-15 — IVA de hipoteca en la compra

## Objetivo

Explicar que hipoteca y deudas si tributaron, pero al comprar, no en cada cuota.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `ai/current.md`

## Resumen de cambios

- Etiqueta `Sin IVA` sustituida por `0% en la cuota`.
- Ayuda: el IVA o el ITP se pagó al adquirir; la mensualidad es devolucion de dinero y no vuelve a llevar IVA. El alquiler habitual tampoco.

## Verificacion

- `pnpm run build` — correcto.

## Estado siguiente

Revisar la ayuda de la fila Hipoteca / deudas en el paso 7.
