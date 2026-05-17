# Interaccion 2026-05-18 - Proyeccion de esperanza de vida INE

- fecha: 2026-05-18
- objetivo: descargar previsiones oficiales a futuro de esperanza de vida para Espana.
- archivos modificados:
  - `data/raw/ine/proyecciones-poblacion/tablas-mortalidad-proyectadas/2026-05-18_ine_proyecciones-poblacion_esperanza-vida-edad-sexo_2024-2073.json`
  - `data/processed/ine/2026-05-18_ine_proyeccion-esperanza-vida-nacimiento-espana_2024-2073.csv`
  - `data/sources.md`
  - `ai/current.md`
  - `ai/history/2026-05-18-0003-proyeccion-esperanza-vida-ine.md`
- resumen de cambios: descargada la tabla API 36775 del INE sobre tablas de mortalidad proyectadas 2024-2073; filtrada la edad 0 anos para obtener esperanza de vida al nacimiento por sexo.
- estado siguiente: al visualizar, separar claramente serie historica observada y proyeccion; no combinar como si fueran la misma naturaleza de dato.
