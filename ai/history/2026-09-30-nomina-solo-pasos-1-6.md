# 2026-09-30 — Nómina solo en pasos de nómina

## Objetivo
Quitar la nómina simplificada del paso 8 (IVA y consumo diario), donde no aporta contexto.

## Archivos modificados
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `ai/current.md`

## Resumen
`showPayrollHelp` pasa de excluir solo el paso 0 y 7 a limitarse a los pasos 1–6 (salario, bases, cotizaciones, especie, base IRPF, retención). Afecta a la v2 (`EscenarioPayroll`) y a la v1 (`PayrollExamplePanel`).

## Siguiente
Nada pendiente de esta petición.
