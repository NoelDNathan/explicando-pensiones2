# 2026-09-01 — El paso 1 ya incluye la especie; el 4 solo reparte

## Objetivo

Quitar el salario en especie del paso 1: el bruto ya lo incluye si lo hay. El paso 4 solo indica a qué beneficio va cada parte, sin limitar la exención a un importe declarado antes.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/App.tsx`
- `ai/current.md`

## Resumen de cambios

- El paso 1 deja de pedir (y de sumar aparte) salario en especie; la base real es salario + complementos.
- `taxableWorkIncome` resta la exención calculada en el paso 4, sin `min` contra un importe del paso 1.
- Eliminados el aviso `.irpf-rule-alert` y el aside de descuadre.
- Copy del paso 4: el salario del paso 1 ya incluye estos beneficios; aquí se reparte.
- La nómina toma `inKindSalaryAnnual` del total detallado en el paso 4.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
