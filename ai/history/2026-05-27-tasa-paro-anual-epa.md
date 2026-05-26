# 2026-05-27 - Tasa de paro anual EPA

- fecha: 2026-05-27
- objetivo: extraer la cobertura anual completa 1977-2025 de tasa de paro EPA, calculada como media de cuatro trimestres cuando procede.
- archivos modificados:
  - `scripts/process-ine-epa-tasa-paro-anual-1977-2025.ps1`
  - `data/processed/ine/2026-05-27_ine_epa_tasa-paro-anual-espana_1977-2025.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se genero un CSV con filas 1977-2025. Se rellenaron 2006-2023 con valores anuales INE y 2024-2025 como media de las cuatro tasas trimestrales INE. Los anos 1977-2005 quedan como `pendiente`, porque el bruto historico INE disponible localmente contiene parados reestimados, no tasas ni activos.
- estado siguiente: localizar una tabla oficial historica de tasas o activos EPA para completar 1977-2005 antes de usar ese tramo en la web.
