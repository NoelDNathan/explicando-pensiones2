# 2026-08-03 — Navegación fiscal fija abajo

- Objetivo: fijar Anterior/Siguiente, puntos de paso y barra de progreso al borde inferior de la pantalla.
- Archivos modificados: `WorkerFiscalStepsCard.tsx`, `WorkerFiscalStepsCard.css`, `FiscalWorkerDashboard.css`, `FiscalSoftTheme.css`, `ai/current.md`.
- Cambios: la chrome de navegación pasa a `.wfsc-chrome` con `position: fixed; bottom: 0`. El stage deja de reservar hueco inferior; el main añade padding inferior y la bandeja sticky de reducciones se eleva por encima de la barra.
- Verificación: `pnpm run build` correcto; en `/calculadora-fiscal` paso 1 la barra queda fija al borde inferior del viewport (escritorio y móvil 390 px), sin overflow horizontal.
- Estado siguiente: revisar si en paso 4 la bandeja de reducciones y la chrome conviven bien en pantallas muy bajas.
