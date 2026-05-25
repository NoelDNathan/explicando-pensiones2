# Interaccion: acotar proyeccion de poblacion a 2070

Fecha: 2026-05-25

## Objetivo

Ajustar la pagina de poblacion para que el grafico use datos proyectados de 2026 a 2070.

## Archivos modificados

- `src/data/populationPyramidData.ts`
- `src/App.tsx`
- `ai/current.md`

## Resumen de cambios

- Acotada la serie proyectada usada por `/poblacion` al rango 2026-2070.
- Actualizados los textos y marcas del selector de ano para terminar en 2070.
- Conservada la separacion entre datos observados hasta 2025 y proyecciones desde 2026.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con el aviso ya conocido de chunk grande por importar CSV.

## Estado siguiente

- La vista `/poblacion` queda preparada con observados 1975-2025 y proyectados 2026-2070.
