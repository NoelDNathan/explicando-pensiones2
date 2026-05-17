# Interaccion 2026-05-18 - Esperanza de vida INE

- fecha: 2026-05-18
- objetivo: descargar el dato de evolucion de la esperanza de vida de los espanoles cubriendo el mayor periodo oficial disponible.
- archivos modificados:
  - `data/raw/ine/indicadores-demograficos-basicos/2026-05-18_ine_idb_esperanza-vida-nacimiento_sexo_total-nacional_1975-2024.json`
  - `data/processed/ine/esperanza-vida-nacimiento-espana-1975-2024.csv`
  - `data/sources.md`
  - `ai/current.md`
  - `ai/history/2026-05-18-0002-esperanza-vida-ine.md`
- resumen de cambios: descargada la tabla API 1414 del INE sobre esperanza de vida al nacimiento por sexo para Total Nacional; conservado el JSON bruto y creado un CSV limpio separado.
- estado siguiente: usar la serie para construir visualizacion y decidir si mostrar ambos sexos o detalle por hombres y mujeres.
