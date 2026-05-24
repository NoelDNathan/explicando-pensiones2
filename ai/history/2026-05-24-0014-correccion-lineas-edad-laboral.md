# Historial de interaccion

Fecha: 2026-05-24

## Objetivo

Corregir la posicion e intercambio de las lineas de edad minima/maxima
de trabajo y evitar solapamiento con las etiquetas del eje central.

## Archivos modificados

- `src/components/PopulationPyramid.tsx`
- `ai/current.md`
- `ai/history/2026-05-24-0014-correccion-lineas-edad-laboral.md`

## Resumen de cambios

- Renombrados los limites a `upperBoundaryY` (edad maxima, fila mas
  anciana en rango) y `lowerBoundaryY` (edad minima, fila mas joven).
- Corregidas las etiquetas: 64 arriba, 20 abajo.
- Las lineas se dibujan en dos tramos dejando hueco en el eje central
  para no tapar las etiquetas quinquenales.
- Las cifras 20 y 64 se muestran una sola vez al borde derecho del
  grafico; las etiquetas de edad del eje se renderizan encima.

## Estado siguiente

- Ninguno especifico para este ajuste visual.
