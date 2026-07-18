# Revision aplicada a la calculadora fiscal

- Fecha: 2026-07-18.
- Objetivo: aplicar las mejoras detectadas pantalla por pantalla en todo el recorrido de la calculadora fiscal.
- Archivos modificados: `FiscalSoftTheme.css`, `FiscalWorkerDashboard.tsx`, `WorkerConsumptionTaxesCard.tsx`, `WorkerFiscalStepsCard.tsx`, `WorkerFiscalSummaryCard.tsx`, `WorkerIrpfTranchesCard.tsx`, `WorkerPersonalReductionsCard.tsx`, `WorkerSocialContributionsCard.tsx`, `ai/current.md` y este historial.
- Resumen: se simplificaron las explicaciones de los pasos 1-7; se corrigieron numeracion, periodo, progreso, cierre de navegacion y formato monetario; se reparo el calculo de consumo sin gasto asignado y el estado del reparto; se mejoraron jerarquia y contraste de tarjetas, formularios IRPF, KPI, resumen y controles usando la paleta centralizada del tema claro.
- Verificacion: `tsc --noEmit` correcto; Vite build correcto. ESLint correcto en cinco archivos modificados; el lint conjunto mantiene ocho incidencias preexistentes en los dos componentes de cotizaciones/consumo. La comprobacion visual en escritorio y movil no pudo ejecutarse porque el navegador integrado agoto el tiempo de adjunto en tres intentos.
- Estado siguiente: realizar una pasada visual manual o con una nueva sesion del navegador integrado, especialmente en pasos 3-7 y en 390 px; valorar aparte la regularizacion de las incidencias heredadas de ESLint.
