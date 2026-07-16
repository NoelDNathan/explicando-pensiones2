# 2026-07-16 — Resumen rapido de la calculadora fiscal

- Fecha: 2026-07-16.
- Objetivo: condensar los resultados principales antes del recorrido fiscal detallado.
- Archivos modificados: `src/App.tsx`, `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`, `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`, `WorkerFiscalStepsCard.css`, `WorkerFiscalSummaryCard.tsx`, `WorkerFiscalSummaryCard.css`, `index.ts` y `ai/current.md`.
- Resumen: nuevo paso inicial con salario editable, coste total para la empresa, impuestos y cotizaciones del trabajador y salario neto; vista en euros o porcentaje; enlace al recorrido completo; variante documentada en `/componentes`.
- Verificacion: `tsc --noEmit` y build de Vite correctos; comprobacion visual e interactiva en escritorio y movil correcta.
- Estado siguiente: revisar el texto editorial con usuarios y mantener los importes conectados al motor fiscal existente.
