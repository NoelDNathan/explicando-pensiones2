# 2026-09-01 — Espaciado leyenda joroba IRPF

## Objetivo

Separar visualmente el párrafo destacado de la joroba y la leyenda del gráfico, que quedaban muy pegados.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.css`
- `ai/current.md`

## Resumen de cambios

- `.wir-panel--hump .wir-hump-copy`: `margin-bottom` 28px.
- `.wir-panel--hump > .wir-legend`: `margin-top` 10px y `margin-bottom` 14px.

## Estado siguiente

- Revisar en móvil que el respiro sea suficiente sin romper el flujo del panel.
