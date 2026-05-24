# Interaccion 2026-05-24 - Tasa de natalidad INE

- fecha: 2026-05-24
- objetivo: descargar y documentar fuentes oficiales INE de tasa bruta de natalidad de Espana entre 1975 y 2070.
- archivos modificados:
  - `data/raw/ine/indicadores-demograficos-basicos/2026-05-24_ine_idb_tasa-bruta-natalidad-total-nacional_1975-2024.json`
  - `data/raw/ine/proyecciones-poblacion/natalidad/2026-05-24_ine_proyecciones-poblacion_tasa-bruta-natalidad-total-nacional_2024-2073.json`
  - `data/processed/ine/2026-05-24_ine_idb_tasa-bruta-natalidad-espana-observada_1975-2024.csv`
  - `data/processed/ine/2026-05-24_ine_proyeccion-tasa-bruta-natalidad-espana_2025-2070.csv`
  - `data/processed/ine/2026-05-24_ine_tasa-bruta-natalidad-espana-observada-proyectada_1975-2070.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
  - `ai/history/2026-05-24-0010-tasa-natalidad-ine.md`
- resumen de cambios: descargadas desde la API oficial del INE las tablas `DATOS_TABLA/1381` y `DATOS_TABLA/36653`; generado un CSV observado 1975-2024, un CSV proyectado 2025-2070 y un CSV combinado 1975-2070 con `estado_dato`. El 2024 proyectado queda solo en el JSON bruto y no se mezcla con el 2024 observado.
- estado siguiente: usar el CSV combinado para graficos solo si se representa visualmente la ruptura entre observado y proyectado; mantener metadata y checksums actualizados si se revisan las descargas.
