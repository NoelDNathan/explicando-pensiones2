# 2026-08-03 — Bandeja de reducciones compacta

## Objetivo

Quitar el título y el párrafo de la bandeja fija del paso 4, compactarla y pegarla al chrome inferior para que dejen de verse como dos barras separadas.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`
- `ai/history/2026-08-03-bandeja-reducciones-compacta.md`

## Resumen de cambios

- Eliminados “Tu base, siempre a la vista” y el texto explicativo de la bandeja sticky.
- La bandeja pasa a ocupar solo la fila de métricas, a ancho completo y sin márgenes laterales.
- Se posiciona justo encima del chrome (`bottom: var(--wfsc-chrome-height)`), con altura de chrome ajustada a ~80 px en escritorio.
- Reducido el padding inferior reservado del paso 4.

## Verificacion

- `pnpm run build` correcto.
- Revisión en paso 4: sin título/párrafo; gap bandeja–chrome ≈ 1 px.

## Estado siguiente

Commit/push solo si el usuario lo pide.
