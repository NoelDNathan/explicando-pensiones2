# 2026-07-17 — Revision responsive calculadora fiscal

## Objetivo

Revisar si `/calculadora-fiscal` esta bien adaptada a movil y escritorio tras el reorden de pasos 7/8 y el resumen final.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.css`
- `ai/current.md`

## Resumen de cambios

- Hallazgo: el paso 8 desbordaba en movil (~1194 px de scroll horizontal).
- Causa: `FiscalKpiRow` / `.fwd-kpis--net-step.fkr` imponian columnas con minimo fijo y `.fwd-net-step` no limitaba `min-width`.
- Fix: `min-width: 0` / `max-width: 100%` en contenedores del paso 8; KPI a `minmax(0, 1fr)` con override movil a 1 columna; summary con `min-width: 0`.

## Verificacion

- Movil 390 px: pasos 0, 7 y 8 sin overflow de pagina.
- Tablet 768 px: pasos 1, 7 y 8 sin overflow.
- Escritorio: sin overflow; metrics en 4 columnas y KPI en 3.
- Paso 7: scroll horizontal interno de la tabla de consumo (intencionado).
- `pnpm run build` correcto.

## Estado siguiente

- Commit/push pendiente de peticion explicita.
- Opcional: revisar visualmente en dispositivo real el scroll de la tabla IVA.
