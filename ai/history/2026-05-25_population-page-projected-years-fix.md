# 2026-05-25 - Correccion de anos proyectados en /poblacion

- fecha: 2026-05-25
- objetivo: comprobar por que no se veian claramente los anos proyectados 2026-2070 en `/poblacion`.
- archivos modificados:
  - `src/data/populationPyramidData.ts`
  - `src/App.tsx`
  - `src/App.css`
  - `ai/current.md`
- resumen de cambios:
  - Corregido el parser de cabeceras CSV para limpiar marcas BOM/encoding al inicio de la primera columna.
  - Evitado que campos numericos vacios se conviertan accidentalmente en `0`.
  - Anadidos accesos rapidos visibles a 2025, inicio de proyeccion, 2050 y 2070 en la pagina de poblacion.
  - Verificado que 2070 muestra badge `Proyectado`, selector `2070` y fuente de proyeccion.
- estado siguiente: mantener la mejora y valorar una solucion posterior para reducir el tamano del bundle al importar CSV grandes.
