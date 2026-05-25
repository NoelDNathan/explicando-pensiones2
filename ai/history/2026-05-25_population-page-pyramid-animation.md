# Interaccion: pagina de evolucion poblacional

Fecha: 2026-05-25

## Objetivo

Crear una nueva pagina con una piramide poblacional animable para ver la evolucion de la poblacion espanola por anos.

## Archivos modificados

- `src/App.tsx`
- `src/App.css`
- `src/components/PopulationPyramid.tsx`
- `src/data/populationPyramidData.ts`
- `ai/current.md`

## Resumen de cambios

- Anadida la ruta `/poblacion` con una vista de piramide poblacional controlada por `YearSelector`.
- Conectados los CSV procesados del INE de poblacion observada 1975-2025 y proyeccion 2026-2074.
- Creado un adaptador que agrupa edades simples en tramos quinquenales y calcula indicadores de total, poblacion 20-64 y poblacion 65+.
- Ampliado `PopulationPyramid` con una variante de leyenda por sexo para evitar mostrar desgloses por nacimiento/nacionalidad cuando la fuente no los contiene.
- Anadidos estilos responsive para la nueva pagina.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con aviso de chunk grande por importar CSV brutos.
- `Invoke-WebRequest http://127.0.0.1:5174/poblacion`: HTTP 200.
- `node node_modules\eslint\bin\eslint.js src\App.tsx src\components\PopulationPyramid.tsx src\data\populationPyramidData.ts`: correcto.
- `node node_modules\eslint\bin\eslint.js .`: falla por dos errores previos en `src/components/TimeSeriesChart.tsx` (`subtitle` y `projStart` sin uso).

## Estado siguiente

- Revisar visualmente `/poblacion` en navegador si el entorno permite captura automatizada o manual.
- Valorar si conviene compactar los datos de piramide para reducir el tamano del bundle.
