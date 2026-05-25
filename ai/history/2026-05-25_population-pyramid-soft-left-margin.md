# 2026-05-25 - Margen suave en etiquetas masculinas

## Objetivo

Evitar la columna fija de totales masculinos y conservar un ajuste visual mas natural con un poco mas de espacio.

## Archivos modificados

- `src/components/PopulationPyramid.tsx`
- `ai/current.md`
- `ai/history/2026-05-25_population-pyramid-soft-left-margin.md`

## Resumen de cambios

- Eliminada la columna fija para el total masculino.
- El total vuelve a colocarse junto al extremo de la barra.
- Se reserva un pequeno margen adicional a la izquierda para reducir solapamientos.

## Estado siguiente

- Revisar visualmente `/poblacion` cuando el navegador integrado permita acceder a localhost.
