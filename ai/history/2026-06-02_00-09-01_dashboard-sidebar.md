Fecha: 2026-06-02

Objetivo: crear un componente para gestionar la barra lateral y usarlo en varias paginas.

Archivos modificados:
- `src/components/ui/DashboardSidebar.tsx`
- `src/components/pension-overview/PensionOverviewPage.tsx`
- `src/components/health-expenditure/HealthExpenditureDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `ai/current.md`

Resumen de cambios:
- Anadida una capa `DashboardSidebar` que deriva estado activo e indicador activo sobre `Sidebar`.
- Usada en `/resumen`, `/gasto-sanitario` y `/calculadora-fiscal`.
- Sustituida la sidebar local de la calculadora fiscal por la compartida, con ajustes de ancho, logo y estado activo.
- Verificado con TypeScript, build de Vite y HTTP 200 en las tres rutas.

Estado siguiente:
- Revisar visualmente las tres rutas en escritorio y movil cuando haya navegador o Playwright disponible.
