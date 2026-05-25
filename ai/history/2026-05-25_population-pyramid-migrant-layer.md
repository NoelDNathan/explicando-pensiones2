# 2026-05-25 - Capa migrante en piramide de poblacion

- fecha: 2026-05-25
- objetivo: anadir desglose de nacidos en Espana y nacidos en el extranjero a la piramide para 2002-2025.
- archivos modificados:
  - `src/data/populationPyramidData.ts`
  - `src/components/PopulationPyramid.tsx`
  - `src/App.tsx`
  - `ai/current.md`
- resumen de cambios:
  - Incorporado el CSV INE 56937 como fuente observada de poblacion por sexo, grupo quinquenal de edad y lugar de nacimiento.
  - La piramide usa barras apiladas Espana/extranjero solo cuando el ano seleccionado tiene desglose 2002-2025.
  - Para 1975-2001 y 2026-2070 se mantiene la vista de sexo y edad sin desglose por nacimiento.
  - Actualizados subtitulo, leyenda y texto de fuente segun disponibilidad del desglose.
- estado siguiente: revisar visualmente la pagina cuando el navegador permita interactuar con localhost; valorar compactar CSVs porque el bundle crece al importar mas datos.
