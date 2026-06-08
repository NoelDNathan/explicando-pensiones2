# 2026-06-03 - Ajuste donut composicion aproximada

- Fecha: 2026-06-03
- Objetivo: corregir la parte visual de la bolita y el circulo exterior del donut en el componente `Composicion aproximada`.
- Archivos modificados:
  - `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
  - `ai/current.md`
  - `ai/history/2026-06-03-ajuste-donut-composicion.md`
- Resumen de cambios: la bolita del callout pasa a ser un punto fijo de 10px, con glow controlado, en lugar de depender de `inset: 44%`. El circulo exterior se transforma en un arco parcial enmascarado para que se vea mas cercano a la referencia y menos cargado.
- Verificacion: `.\node_modules\.bin\tsc.cmd --noEmit` correcto. `node node_modules\vite\bin\vite.js build` correcto; mantiene aviso de chunk grande y aviso de tiempos de plugins.
- Estado siguiente: pendiente revision visual en navegador cuando haya Browser tool callable o Playwright/Puppeteer disponible.
