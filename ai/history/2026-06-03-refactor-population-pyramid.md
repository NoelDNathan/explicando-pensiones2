# 2026-06-03 - Refactor de piramide poblacional

## Fecha

2026-06-03

## Objetivo

Reducir la responsabilidad de `PopulationPyramid.tsx`, separando tipos, configuracion, geometria, piezas SVG y ficha metodologica.

## Archivos modificados

- `src/components/population/PopulationPyramid.tsx`
- `src/components/population/PopulationPyramid.types.ts`
- `src/components/population/PopulationPyramid.config.ts`
- `src/components/population/PopulationPyramid.geometry.ts`
- `src/components/population/PopulationPyramid.parts.tsx`
- `src/components/population/PopulationPyramid.info.tsx`
- `ai/current.md`

## Resumen de cambios

- `PopulationPyramid.tsx` queda como componente orquestador y reexporta tipos e informacion del indicador.
- Movidos los tipos publicos a `PopulationPyramid.types.ts`.
- Movidos constantes visuales, datos demo y leyendas a `PopulationPyramid.config.ts`.
- Movida la logica de escala, banda laboral y formato a `PopulationPyramid.geometry.ts`.
- Movidas las subpiezas SVG a `PopulationPyramid.parts.tsx`.
- Movida `POPULATION_PYRAMID_INFO` a `PopulationPyramid.info.tsx`.
- Verificado con `tsc --noEmit` y `vite build`.

## Estado siguiente

El componente queda mas facil de revisar y ampliar. Sigue pendiente revision visual en navegador cuando haya herramienta de captura disponible.
