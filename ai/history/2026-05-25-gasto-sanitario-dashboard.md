# 2026-05-25 — Dashboard gasto sanitario

## Objetivo

Ajustar el panel "El gasto sanitario a lo largo de la vida" al diseño de referencia: sidebar, header, grid 3 columnas, Recharts, Lucide, glassmorphism y KPIs.

## Archivos modificados

- `package.json`, `pnpm-lock.yaml` — dependencias `recharts`, `lucide-react`
- `src/data/healthExpenditureData.ts` — dataset tipado demo
- `src/components/StackedBarChart.tsx` + `.css` — barras apiladas Recharts
- `src/components/LifetimeAreaChart.tsx` + `.css` — curva acumulada Recharts
- `src/components/InterpretationCard.tsx`, `RankingCard.tsx` + `.css`, `KpiCard.tsx`
- `src/components/InterpretationList.tsx` + `.css` — variante `check`
- `src/components/HealthExpenditureDashboard.tsx` + `.css` — composición completa
- `src/App.tsx`, `src/App.css` — ruta `/gasto-sanitario` y preview en `/componentes`

## Resumen

Panel completo con sidebar, cabecera con selector de año, banda informativa, gráficos Recharts, interpretación con checks verdes, ranking, 5 KPIs y footer de fuente. Reutiliza `InfoButton`, `DashboardPanel`, `MetricCard`, `InfoBanner`, `FooterNote`, `Sidebar`, `DashboardHeader`, `ToolbarChip`.

## Estado siguiente

- Conectar datos oficiales procesados cuando exista serie trazable por categoría y edad
- Revisar alineación visual de totales en `StackedBarChart` en distintos viewports
- Valorar code-splitting de Recharts para reducir chunk
