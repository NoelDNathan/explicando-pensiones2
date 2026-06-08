# 2026-06-03 - Componente composicion aproximada

- Fecha: 2026-06-03
- Objetivo: crear una card premium en modo oscuro para mostrar la composicion aproximada del salario bruto anual en la calculadora fiscal.
- Archivos modificados:
  - `src/components/fiscal-worker-dashboard/Donut.tsx`
  - `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
  - `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
  - `src/components/fiscal-worker-dashboard/FiscalPersonalDataCard.tsx`
  - `ai/current.md`
  - `ai/history/2026-06-03-componente-composicion-aproximada.md`
- Resumen de cambios: sustituido el donut compacto por una card horizontal dark/glassmorphism con donut grande, callout del salario neto, filas con puntos de color, microbarras, importes y badges. El componente usa los importes calculados por la pantalla fiscal. Se cambio `FileEuro` por `FileText` porque la version instalada de `lucide-react` no exporta `FileEuro` y bloqueaba el build.
- Verificacion: `.\node_modules\.bin\tsc.cmd --noEmit` correcto. `node node_modules\vite\bin\vite.js build` correcto; mantiene aviso de chunk grande y aviso de tiempos de plugins.
- Estado siguiente: pendiente revision visual en escritorio y movil cuando haya navegador integrado o Playwright/Puppeteer disponible. No se hizo commit/push porque el arbol de trabajo ya tenia cambios previos no atribuibles a esta interaccion y no era seguro aplicar `git add .`.
