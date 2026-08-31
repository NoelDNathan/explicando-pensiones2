# 2026-08-31 — Conservar valores del paso 7 al cambiar de paso

## Objetivo

Que los importes, porcentajes y el resto del formulario del paso 7 (IVA y otros impuestos) no se borren al ir a otro paso y volver.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`

## Resumen

El paso 7 se desmontaba al cambiar de pantalla y el estado local volvía a ceros o a los valores medios. El dashboard ahora guarda un borrador del formulario (`ConsumptionTaxesDraft`) y lo restaura al reentrar. Si hay borrador, el presupuesto no se pisa con la estimación EPF.

## Verificación

- `pnpm run build` correcto.
- En `/calculadora-fiscal`: 250 € en alimentación básica, paso 8 y vuelta al 7: se mantiene 250 € y 11,18 %.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
