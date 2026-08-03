# 2026-08-03 — Chrome de navegación más clara

- Objetivo: simplificar la barra inferior del recorrido fiscal para que se entienda mejor el paso actual y la acción siguiente.
- Archivos modificados: `WorkerFiscalStepsCard.tsx`, `WorkerFiscalStepsCard.css`, `FiscalWorkerDashboard.css`, `FiscalSoftTheme.css`, `ai/current.md`.
- Cambios: se elimina el badge “% completado”; se muestra “Paso X de 10 · título”; “Siguiente” pasa a botón primario “Continuar” con el nombre del siguiente paso; los puntos marcan hechos/activo/pendiente; la barra de progreso queda fina.
- Verificación: `pnpm run build` correcto; revisión en paso 1 escritorio y móvil 390 px, barra fija abajo, sin overflow horizontal.
- Estado siguiente: valorar si en pantallas estrechas conviene acortar aún más el título del siguiente paso.
