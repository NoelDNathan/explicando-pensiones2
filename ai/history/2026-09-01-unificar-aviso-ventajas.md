# 2026-09-01 — Unificar aviso ventajas del trabajo

## Objetivo

Eliminar la duplicación entre la nota de `WorkIncomeBenefitsSection` y el callout de `WorkIncomeReductionExplainer` cuando el salario descarta las ventajas del trabajo.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.tsx`
- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.css`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- `WorkIncomeBenefitsSection` devuelve `null` si el salario descarta las ventajas (sin nota separada).
- Callout embebido `wir-callout--out-of-range` fusiona: cifras del usuario, no hace falta otros ingresos, por qué entender la reducción y simulador debajo.
- Estilos naranja movidos al callout del explainer; eliminados `.wprc-work-benefits-note`.

## Estado siguiente

- Revisar en `/calculadora-fiscal` paso 4 con 35.000 € que solo aparece un aviso antes del simulador.
