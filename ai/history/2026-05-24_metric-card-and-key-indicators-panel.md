# 2026-05-24 — MetricCard + KeyIndicatorsPanel components

## Objetivo
Create two reusable dark-dashboard components matching the institutional indicator panel shown in the user's image:
- A standalone `MetricCard` for any key metric.
- A `KeyIndicatorsPanel` that grids the cards with a title and CTA button.

## Archivos creados
- `src/components/MetricCard.tsx`
- `src/components/MetricCard.css`
- `src/components/KeyIndicatorsPanel.tsx`
- `src/components/KeyIndicatorsPanel.css`

## Archivos modificados
- `src/App.tsx` — imports, `Ico` SVG helper, 10-item `INDICATORS_2025` demo data, Componente 05 section
- `src/App.css` — added `.component-preview--panel` modifier

## Resumen
`MetricCard` accepts `icon: ReactNode`, `label`, `value`, optional `secondary`/`secondaryColor` and
`note`/`noteColor`. Fully composable via props; no domain knowledge inside the component.

`KeyIndicatorsPanel` composes `MetricCard` in a 2-column grid with a configurable title and optional
rounded ghost CTA button. Reflows to 1 column below 480 px.

Demo data in `App.tsx` reproduces the 10 indicators from the image (ingresos, gasto, déficit, deuda,
ratio presupuesto, cotizantes/pensionistas, hucha, edad efectiva, esperanza de vida, tasa de reemplazo)
using inline SVG icons themed per indicator.

`tsc --noEmit` passes with zero errors; ESLint returns zero warnings.

## Estado siguiente
- Components available for narrative page integration.
- Next: wire real 2025 data from processed INE/Seguridad Social datasets.
