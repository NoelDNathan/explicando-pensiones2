# 2026-05-25 - Metricas laterales por grupo de edad

## Objetivo

Sustituir las etiquetas laterales de edad laboral por metricas de ninos, poblacion en edad laboral y pensionistas.

## Archivos modificados

- `src/components/PopulationPyramid.tsx`
- `ai/current.md`
- `ai/history/2026-05-25_population-pyramid-side-age-stats.md`

## Resumen de cambios

- Eliminado el bloque superior derecho con dos totales.
- Sustituidas las frases laterales por tres metricas en formato etiqueta + cifra: pensionistas, 20-64 anos y ninos.
- Las cifras se calculan desde los datos visibles de la piramide y suman ambos sexos y categorias de nacimiento.

## Estado siguiente

- Revisar visualmente `/poblacion` cuando el navegador integrado permita acceder a localhost.
