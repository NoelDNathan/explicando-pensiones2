# 2026-07-18 — Modo suave para la calculadora fiscal

- Fecha: 2026-07-18.
- Objetivo: aplicar la paleta suave a todo el recorrido de `/calculadora-fiscal` y centralizar sus colores.
- Archivos modificados: `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`, `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`, `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.tsx`, `ai/current.md`.
- Resumen: el contenedor fiscal usa `fwd--soft`; el resumen inicial deja de depender de parametros de URL; los tokens `--fiscal-*` centralizan superficies, textos, lineas y acentos y se adaptan a las variables de las tarjetas.
- Estado siguiente: revisar visualmente escritorio y movil cuando el servidor local este disponible. La compilacion queda pendiente: `pnpm` requirio purgar dependencias sin TTY y TypeScript/Vite superaron el limite de 120 segundos al ejecutarse fuera del aislamiento.
