# 2026-09-01 — Destacar nota clave joroba IRPF

## Objetivo

Hacer más visible la nota bajo el gráfico «La joroba del IRPF» que explica tipo medio vs marginal.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.tsx`
- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- Clase `wir-footnote--key` en la nota del panel de la joroba.
- Caja azul con borde lateral, texto más legible y énfasis en *medio* y *marginal*.
- Overrides en tema suave con `--fiscal-blue` / `--fiscal-blue-soft`.

## Estado siguiente

- Revisar en paso 4 con salario alto que la nota destaque sin competir con el gráfico.
