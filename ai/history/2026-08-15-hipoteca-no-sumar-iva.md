# 2026-08-15 — No sumar IVA de hipoteca

## Objetivo

Dejar claro que el IVA/ITP de la compra no se suma al IVA mensual de esta calculadora.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `ai/current.md`

## Resumen de cambios

- La ayuda de Hipoteca / deudas dice que no se suma: se estima el IVA de ahora; el de la compra fue un pago único; el IBI es el impuesto recurrente.

## Verificacion

- `pnpm run build` — correcto.

## Estado siguiente

Ninguno inmediato.
