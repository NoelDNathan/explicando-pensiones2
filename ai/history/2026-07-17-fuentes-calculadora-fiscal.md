# Interaccion 2026-07-17

- Fecha: 2026-07-17.
- Objetivo: anadir al final de la calculadora una pantalla unica con todas las fuentes y valores usados en el calculo.
- Archivos modificados: `src/App.tsx`, `FiscalWorkerDashboard.tsx`, `WorkerFiscalStepsCard.tsx`, `worker-salary-dashboard/index.ts`, nuevos `WorkerCalculationSourcesCard.tsx` y `WorkerCalculationSourcesCard.css`, `ai/current.md` y este historial.
- Resumen: creado el paso 10 de fuentes, sin segunda pantalla explicativa. Los bloques muestran nombre, organismo, documento, URL oficial y valores dinamicos para cotizaciones, AT/EP, IRPF e IVA; el proxy de IVA se etiqueta como estimacion. Anadido el componente a `/componentes` y una variante de fuentes para el calculo 2005.
- Verificacion: `tsc --noEmit` correcto; `vite build` correcto con el aviso conocido de chunk grande; revision visual integrada correcta a 1440 px y 390 px, sin overflow horizontal. `pnpm` no estaba disponible en PATH y se ejecutaron los binarios locales equivalentes.
- Estado siguiente: pantalla lista; queda ampliar el inventario si se incorporan nuevas reglas o datasets al motor.
