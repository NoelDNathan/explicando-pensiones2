# Pensionistas-personas 1975-2070

- fecha: 2026-05-25
- objetivo: preparar una serie anual de numero de pensionistas como personas, separando dato observado, huecos no estimados y modelo demografico futuro.
- archivos modificados:
  - `scripts/process-seguridad-social-pensionistas-1975-2070.ps1`
  - `data/processed/seguridad-social/2026-05-25_seguridad-social_pensionistas-personas-observado_2006-2026.csv`
  - `data/processed/seguridad-social/2026-05-25_modelo-demografico_pensionistas-personas_2027-2070.csv`
  - `data/processed/seguridad-social/2026-05-25_seguridad-social-pensionistas-personas-observado-modelizado_1975-2070.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se extrajo la serie oficial de personas pensionistas del libro mensual de Seguridad Social, usando diciembre para 2006-2025 y abril para 2026. Se dejaron 1975-2005 como `no_estimado` para no confundir personas con pensiones. Se modelo 2027-2070 con la poblacion INE de 67 anos o mas, calibrada al dato oficial de abril de 2026.
- estado siguiente: si se requiere historico 1975-2005 con personas observadas, hay que exportarlo manualmente desde eSTADISS y conservar el bruto con metadata.
