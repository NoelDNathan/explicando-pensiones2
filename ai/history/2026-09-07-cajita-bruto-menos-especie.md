Fecha: 2026-09-07

Objetivo: mostrar una cajita con salario bruto menos salario en especie.

Archivos modificados:
- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.tsx`
- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.css`
- `src/components/fiscal-worker-dashboard/irpfRegionCalc.ts`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`

Resumen:
- El slider del simulador vuelve a ser el bruto de nomina.
- Encima hay tres cajas: salario bruto − especie = bruto que tributa.
- La misma resta aparece al inicio de la ecuacion del paso 5 y en la tira de la base.

Estado siguiente: recargar el paso 5 con especie y comprobar las tres cajas. Sin commit.
