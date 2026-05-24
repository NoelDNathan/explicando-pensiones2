# Historial de interaccion

Fecha: 2026-05-24

## Objetivo

Corregir la posicion de las lineas de limite de edad laboral y mover
los numeros 20 y 64 a la derecha de las lineas, fuera del area de barras.

## Archivos modificados

- `src/components/PopulationPyramid.tsx`
- `ai/current.md`
- `ai/history/2026-05-24-0015-fix-lineas-limite-edad.md`

## Resumen de cambios

- `lowerBoundaryY` corregido: ahora es el borde inferior del grupo
  mas joven en edad de trabajar (`rowY + barHeight`), no el superior.
- Las lineas son continuas de izquierda a derecha, sin hueco en el centro.
- Los numeros (20 y 64) se colocan a la derecha de las lineas, en la
  columna de anotaciones, con `textAnchor="start"`.

## Estado siguiente

- Sin pendientes especificos para este ajuste.
