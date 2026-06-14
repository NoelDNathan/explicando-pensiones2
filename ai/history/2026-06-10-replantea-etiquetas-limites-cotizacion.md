# 2026-06-10 - Replantea etiquetas de limites de cotizacion

## Objetivo

Corregir la solucion anterior de solapamiento en `WorkerContributionLimitsCard`, manteniendo las etiquetas asociadas a su posicion real en la escala.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.css`
- `ai/current.md`
- `ai/history/2026-06-10-replantea-etiquetas-limites-cotizacion.md`

## Resumen de cambios

- Sustituida la solucion de rejilla fija por etiquetas absolutas ancladas al porcentaje de cada marcador.
- Anadida deteccion de cercania entre `Tu base` y los limites para desplazar verticalmente la etiqueta del usuario cuando pueda solaparse.
- En movil, `Tu base` se muestra siempre en una segunda linea visual para conservar legibilidad sin perder el anclaje horizontal.
- No se cambiaron datos ni formulas.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Revision visual/DOM en `http://127.0.0.1:5198/calculadora-fiscal`: etiquetas ancladas y sin solapamiento en escritorio 1280x720 y movil 390x844.

## Estado siguiente

La solucion anterior de rejilla queda reemplazada por una disposicion anclada con desvio vertical. Sigue pendiente no mezclar cambios previos no atribuibles a esta interaccion en un commit automatico.
