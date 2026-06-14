# 2026-06-14 - WorkerFiscalStepsCard formato PDF real

## Objetivo

Hacer que la nomina de ejemplo de `WorkerFiscalStepsCard` parezca sacada del PDF aportado, usando sus palabras, estructura y estilo tipografico.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- Sustituido el mock anterior por una nomina densa con fuente Courier, bordes negros y celdas tipo recibo.
- Incorporadas etiquetas y conceptos del PDF: `COD.`, `CONCEPTO`, `UNIDADES`, `PRECIO`, `DEVENGOS`, `DEDUCC.`, `TRABAJADOR/A`, `CENTRO DE TRABAJO`, `PERIODO LIQUIDACION`, `DIAS`, `REM.TOTALES`, `BASE IRPF`, `BASE CC.CC.`, `LIQUIDO TOTAL` y bloque de bases/aportacion empresa.
- Conservados los resaltados por paso, pero integrados sobre la apariencia del recibo.
- Ajustado el responsive para escritorio y movil sin overflow horizontal.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto en reintento; el intento anterior fallo por `EBUSY` en `dist/favicon.svg` tras un timeout previo.
- Browser integrado en `http://127.0.0.1:5209/calculadora-fiscal`: escritorio y movil 390x844 correctos, Courier detectado, palabras del PDF presentes, palabras anteriores ausentes, sin overflow horizontal y sin errores de consola.
- Captura visual pendiente: `Page.captureScreenshot` sigue agotando tiempo en CDP.

## Estado siguiente

La nomina de ejemplo queda mucho mas cercana al PDF aportado. Si se quiere maxima fidelidad pixel a pixel, el siguiente paso seria resolver la captura/render del PDF para comparar visualmente contra imagen.
