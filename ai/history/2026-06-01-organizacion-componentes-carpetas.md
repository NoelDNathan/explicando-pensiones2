# 2026-06-01 - Organizacion de componentes por carpetas

## Fecha

2026-06-01

## Objetivo

Ordenar los componentes frontend por carpetas para separar piezas reutilizables, graficos y pantallas de feature.

## Archivos modificados

- `src/App.tsx`
- `src/data/populationPyramidData.ts`
- `src/components/`
- `ai/current.md`
- `ai/history/2026-06-01-organizacion-componentes-carpetas.md`

## Resumen de cambios

- Movidos componentes base a `src/components/ui/`.
- Movidos graficos reutilizables a `src/components/charts/`.
- Movida la piramide a `src/components/population/`.
- Movidas pantallas o bloques compuestos a carpetas de feature: `pension-overview/`, `health-expenditure/` y `salary-nationality/`.
- Actualizadas las rutas de importacion afectadas.
- Verificado con `tsc --noEmit` y `vite build`.

## Estado siguiente

La estructura de componentes queda mas clara para seguir ampliando el sistema visual. Queda pendiente extraer `PlayButton` desde `App.tsx` a un modulo propio cuando se continue ampliando el laboratorio de componentes.
