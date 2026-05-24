# Historial de interaccion

Fecha: 2026-05-24

## Objetivo

Mostrar en la piramide poblacional el rango de edad de cada fila
sobre el eje central.

## Archivos modificados

- `src/components/PopulationPyramid.tsx`
- `ai/current.md`
- `ai/history/2026-05-24-0012-etiquetas-edad-piramide.md`

## Resumen de cambios

- Anadido el subcomponente `AgeAxisLabels`, que pinta en el eje
  central el texto `ageGroup` de cada fila (p. ej. `0-4`, `35-39`,
  `90+`), alineado verticalmente al centro de la barra.
- Anadida la prop `ageLabels` con valores `'all'` (por defecto),
  `'decade'` (solo filas cuyo `ageStart` es multiplo de 10) o `false`
  para ocultar etiquetas.
- Cada etiqueta incluye una marca horizontal en el eje; el texto usa
  tono mas claro en filas en edad de trabajar.
- Exportado el tipo `AgeLabelMode` para uso externo.

## Estado siguiente

- Valorar si conviene un fondo semitransparente tras las etiquetas
  cuando se conecten datos reales con barras mas anchas hacia el centro.
