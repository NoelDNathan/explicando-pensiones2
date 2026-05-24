# Historial de interaccion

Fecha: 2026-05-24

## Objetivo

Marcar con lineas mas visibles los limites de edad minima y maxima
de trabajo en la piramide poblacional.

## Archivos modificados

- `src/index.css` (token `--color-working-age-boundary`)
- `src/components/PopulationPyramid.tsx`
- `ai/current.md`
- `ai/history/2026-05-24-0013-lineas-limite-edad-trabajar.md`

## Resumen de cambios

- Anadido el subcomponente `WorkingAgeBoundaryLines`: dos lineas
  horizontales (2 px, color menta) en el borde superior e inferior
  de la franja en edad de trabajar, alineadas con la primera y ultima
  fila incluida segun `workingAgeMin` y `workingAgeMax`.
- Etiquetas `20 anos` y `64 anos` (valores de las props) a la izquierda
  del grafico, junto a cada linea.
- Nuevo token de color `--color-working-age-boundary` en el tema Tailwind.

## Estado siguiente

- Si cambian los tramos quinquenales de los datos, los limites siguen
  alineados al borde del grupo que contiene la edad minima/maxima.
