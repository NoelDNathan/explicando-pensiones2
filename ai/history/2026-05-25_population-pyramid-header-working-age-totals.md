# 2026-05-25 - Totales superiores en piramide

## Objetivo

Mostrar en la esquina superior derecha de la piramide el total de personas en edad de trabajar y fuera de la edad de trabajar.

## Archivos modificados

- `src/components/PopulationPyramid.tsx`
- `ai/current.md`
- `ai/history/2026-05-25_population-pyramid-header-working-age-totals.md`

## Resumen de cambios

- Anadido un bloque compacto de metricas dentro del SVG, alineado con titulo y subtitulo.
- Las cifras se calculan desde los datos de la piramide para el ano visible.
- Los totales suman hombres, mujeres, nacidos en Espana y nacidos en el extranjero.

## Estado siguiente

- Revisar visualmente `/poblacion` cuando el navegador integrado permita acceder a localhost.
