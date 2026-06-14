# 2026-06-14 - Rediseno de pasos fiscales con nomina

## Objetivo

Adaptar `WorkerFiscalStepsCard` al texto explicativo largo y anadir una nomina de ejemplo como apoyo visual por paso.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`
- `ai/history/2026-06-14-redisena-worker-fiscal-steps-nomina.md`

## Resumen de cambios

- Se conserva intacto el texto principal de explicacion de cada paso.
- Se elimina la tira grande de pasos y se sustituye por puntos compactos de navegacion.
- La escena se reorganiza en explicacion a la izquierda y panel de nomina a la derecha.
- Se anade una nomina de ejemplo code-native con filas resaltadas segun el paso activo.
- El texto largo usa scroll interno para no deformar la composicion.
- En movil, la nomina pasa a filas compactas para evitar overflow.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- `http://127.0.0.1:5207/calculadora-fiscal`: HTTP 200.
- Browser integrado: paso 4 validado en escritorio por DOM, sin errores de consola; texto con scroll interno, nomina visible, filas de especie e IRPF resaltadas y sin overflow horizontal.
- Browser integrado movil 390x844: sin overflow horizontal; nomina en modo compacto.
- Pendiente: captura visual porque `Page.captureScreenshot` volvio a agotar tiempo en CDP.

## Estado siguiente

Revisar visualmente con captura cuando Browser permita `Page.captureScreenshot`. Si se quiere maxima fidelidad al PDF real, extraer/importar sus importes como datos de ejemplo separados y documentados.
