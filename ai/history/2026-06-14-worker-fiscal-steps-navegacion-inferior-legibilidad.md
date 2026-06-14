# 2026-06-14 - Navegacion inferior y nomina legible

## Objetivo

Mover `Anterior` y `Siguiente` abajo para liberar espacio horizontal en `WorkerFiscalStepsCard` y mejorar la legibilidad del texto de la nomina.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- Los botones laterales pasan a controles inferiores absolutos dentro del panel.
- El layout principal usa todo el ancho para explicacion y nomina.
- La nomina reduce su peso visual y elimina filas secundarias del bloque de bases.
- Se aumentan tamanos de letra en escritorio y se mantiene scroll horizontal interno en movil para no aplastar el recibo.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Browser integrado en `http://127.0.0.1:5210/calculadora-fiscal`: escritorio y movil 390x844 sin overflow de pagina, botones abajo, texto de nomina mas legible y sin errores de consola.

## Estado siguiente

La vista queda preparada para revision visual manual. Si se quiere mas fidelidad al PDF sin perder lectura, conviene mostrar solo el fragmento de nomina relevante por paso.
