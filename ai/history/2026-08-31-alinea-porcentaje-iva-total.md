# 2026-08-31 — Alinear % IVA fila TOTAL con tarjeta resumen

## Objetivo
Que el porcentaje de la fila TOTAL coincida con «8,27% del gasto» de la tarjeta «IVA estimado».

## Archivos modificados
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `ai/current.md`

## Resumen
- La fila TOTAL mostraba «9,82 % medio» porque calculaba (IVA + impuestos especiales) / gasto asignado.
- La tarjeta naranja muestra solo IVA / gasto asignado.
- Se unificó el cálculo con `formatPercentOfAssignedSpend(result.vatAnnual, …)` en ambos sitios.
- Sin gasto asignado pero con reparto, fallback a media ponderada de tipos de IVA.

## Verificación
- `pnpm exec tsc -b` correcto.

## Estado siguiente
- Revisar en `/calculadora-fiscal` paso 7 que ambos valores coinciden visualmente.
