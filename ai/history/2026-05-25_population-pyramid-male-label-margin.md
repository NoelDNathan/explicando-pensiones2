# 2026-05-25 - Margen de etiquetas masculinas en piramide

## Objetivo

Evitar solapamientos entre el total masculino de cada tramo y las etiquetas internas del segmento de nacidos en el extranjero.

## Archivos modificados

- `src/components/PopulationPyramid.tsx`
- `ai/current.md`
- `ai/history/2026-05-25_population-pyramid-male-label-margin.md`

## Resumen de cambios

- Reservada una columna fija para los totales del lado masculino.
- Reducido el ancho maximo util de las barras masculinas para que no invadan esa columna.

## Estado siguiente

- Revisar visualmente `/poblacion` en navegador cuando el entorno permita acceder a localhost.
