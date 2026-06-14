# 2026-06-10 - Corrige solapamiento en limites de cotizacion

## Objetivo

Evitar que las etiquetas de base minima, base real y base maxima se solapen en `WorkerContributionLimitsCard`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.css`
- `ai/current.md`
- `ai/history/2026-06-10-corrige-solapamiento-limites-cotizacion.md`

## Resumen de cambios

- Sustituido el posicionamiento absoluto de las leyendas superiores de la escala por una rejilla de tres columnas.
- Permitido que los importes se ajusten con `text-wrap: balance` para conservar legibilidad en contenedores estrechos.
- Conservados los marcadores y posiciones reales de la escala sin cambiar formulas ni datos.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Revision visual/DOM en `http://127.0.0.1:5196/calculadora-fiscal`: paso 2 sin solapamiento de etiquetas en escritorio 1280x720 ni movil 390x844, y sin overflow horizontal.

## Estado siguiente

Mantener pendiente la revision general de `/calculadora-fiscal` cuando se acumulen mas cambios visuales, pero el solapamiento indicado queda corregido.
