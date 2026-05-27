# 2026-05-27 - Tasa de paro EPA trimestral y anual

- fecha: 2026-05-27
- objetivo: completar la serie usable de tasa de paro EPA desde 1976T3 y recalcular la vista anual 1977-2025.
- archivos modificados:
  - `scripts/process-ine-epa-tasa-paro-1976-2026.ps1`
  - `scripts/process-ine-epa-tasa-paro-anual-1977-2025.ps1`
  - `data/raw/ine/epa/tasa-paro/`
  - `data/processed/ine/2026-05-27_ine_epa_tasa-paro-trimestral-espana_1976T3-2026T1.csv`
  - `data/processed/ine/2026-05-27_ine_epa_tasa-paro-anual-espana_1977-2025.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se localizaron y descargaron las tablas oficiales INE EPA 01011 para 1976-1995 y 1996-2004, y la serie CONSUL `EPA423474` para el tramo actual desde 2005. Se genero el CSV trimestral 1976T3-2026T1 y se recalculo el anual 1977-2025 como media simple de cuatro trimestres.
- estado siguiente: usar el trimestral como base principal en la web y explicar la columna `fuente_segmento` cuando se muestre una serie larga.
