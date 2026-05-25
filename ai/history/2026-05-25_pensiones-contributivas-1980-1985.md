# Pensiones contributivas 1980-1985

- Fecha: 2026-05-25
- Objetivo: continuar la busqueda alternativa para cubrir el hueco historico de pensiones contributivas anterior a 2000.
- Archivos modificados:
  - `scripts/process-pensiones-contributivas-no-contributivas-1975-2070.ps1`
  - `data/processed/pensiones/2026-05-25_seguridad-social_pensiones-contributivas-observado-modelizado_1975-2070.csv`
  - `data/raw/inebase-historia/pensiones-contributivas/2026-05-25_inebase_132980_pensiones-1980-importe.pdf`
  - `data/raw/mites/principales-series-pensiones-contributivas/`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- Resumen de cambios: se incorporo 1980 desde INEbase Historia como suma controlada de regimenes con total impreso, y 1981-1985 desde MITES Principales Series con total de clase y regimen en diciembre. El CSV maestro queda con 1980-2026 observado, 2027-2070 modelizado y 1975-1979 sin estimar.
- Estado siguiente: validar con cautela los PDFs INEbase candidatos para 1976-1979; no usar esos anos editorialmente hasta tener extraccion verificable. Recordar que 1980-1985 son cortes de diciembre y no medias anuales.
