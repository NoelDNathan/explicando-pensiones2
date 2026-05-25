# 2026-05-25 - Etiquetas numericas en la piramide

## Objetivo

Mostrar en cada tramo de la piramide el total por sexo y, cuando hay desglose por nacimiento, los valores internos de nacidos en Espana y nacidos en el extranjero.

## Archivos modificados

- `src/components/PopulationPyramid.tsx`
- `ai/current.md`
- `ai/history/2026-05-25_population-pyramid-step-labels.md`

## Resumen de cambios

- Anadidos totales por sexo junto al extremo exterior de cada barra.
- Anadidas etiquetas internas para los segmentos nativo/extranjero cuando el ancho del segmento permite leerlas.
- Separada la columna de anotaciones de edad laboral para evitar que choque con los nuevos totales.

## Estado siguiente

- Revisar visualmente `/poblacion` en escritorio y movil cuando el navegador integrado permita abrir localhost.
