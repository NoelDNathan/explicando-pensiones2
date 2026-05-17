# Interaccion 0003 - deuda publica Eurostat

- fecha: 2026-05-18
- objetivo: descargar una serie historica anual de deuda publica de Espana con fuente institucional.
- archivos modificados:
  - `data/raw/eurostat/deuda-publica/2026-05-18_eurostat_gov_10dd_edpt1_es_s13_gd_mio_eur.json`
  - `data/raw/eurostat/deuda-publica/2026-05-18_eurostat_gov_10dd_edpt1_es_s13_gd_pc_gdp.json`
  - `data/processed/eurostat/deuda-publica-espana-1995-2025.csv`
  - `data/sources.md`
  - `data/methodology/transformations.md`
  - `ai/current.md`
  - `ai/history/2026-05-18-0003-deuda-publica-eurostat.md`
- resumen de cambios: descargados desde Eurostat los datos anuales de deuda bruta consolidada de las Administraciones Publicas de Espana en millones de euros y porcentaje del PIB; unido todo en un CSV procesado y documentada la fuente.
- estado siguiente: usar esta serie como contexto fiscal agregado y revisar posibles revisiones futuras de Eurostat.
- nota git: no se ha hecho commit ni push porque la carpeta no es un repositorio Git.
