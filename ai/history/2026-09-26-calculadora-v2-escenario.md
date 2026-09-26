# 2026-09-26 · Calculadora fiscal v2 «Escenario»

**Objetivo:** aplicar el estilo del diseño D a toda la calculadora como v2, sin quitar la v1.

**Archivos modificados:**
- `src/App.tsx`: ruta `/calculadora-fiscal/v2`.
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`: prop `variant`, fuentes y CSS nuevo.
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`: tokens de escenario (colores, tipografía, escala, movimiento) y bloque `.fwd.fwd--escenario` que reasigna la paleta.
- `src/components/fiscal-worker-dashboard/FiscalEscenario.css` (nuevo): capa no cromática de la v2.
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`: `key` en el título para que se anime al cambiar de paso.
- `package.json`, `pnpm-lock.yaml`: `@fontsource-variable/anybody`, `@fontsource/instrument-sans`.

**Resumen:** misma lógica, pasos y textos; la v2 cambia solo la piel. Comprobado en pantalla a
1280 y 390 px en los 13 pasos: sin scroll horizontal, títulos sin partir palabras y contraste
≥ 4,5:1 en los textos (auditoría por script). `tsc`, `verify:styles` y `verify:scenario` en verde.

**Siguiente:** piezas propias de D (casillas, barras, escalera MEI, aguja, ecuación) paso a paso en la v2.
