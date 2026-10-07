# 2026-10-07 — Quitar nómina y comparador IRPF por CCAA

## Objetivo

Eliminar de la calculadora la nómina simplificada lateral y el comparador de IRPF por comunidad autónoma.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `ai/current.md`

## Resumen

- Paso 6: deja de renderizarse `WorkerIrpfRegionComparison` debajo de `WorkerIrpfTranchesCard`.
- Pasos 1–6 (v1 y v2): se quita el panel de nómina; se elimina el código de `PayrollExamplePanel`, `EscenarioPayroll` y datos estáticos asociados. El texto dinámico del paso 3 en cotizaciones no cambia.

## Estado siguiente

- Valorar si se elimina por completo `WorkerIrpfRegionComparison` y estilos `.esc-nom` / `.wfsc-payroll` si no se reutilizan.
- Sin commit (no solicitado).
