# 2026-06-01 - Validacion FIPROS ingresos Seguridad Social 1990-2007

- Fecha: 2026-06-01.
- Objetivo: empezar validaciones para fuentes historicas de ingresos de Seguridad Social anteriores a 1995.
- Archivos modificados:
  - `scripts/process-seguridad-social-ingresos-fipros-candidato-1990-2007.ps1`
  - `data/raw/seguridad-social/ingresos-historicos-candidatos/2026-06-01_seguridad-social_fipros-recursos-sistema-ss_1990-2007.pdf`
  - `data/processed/seguridad-social/2026-06-01_seguridad-social_fipros_recursos-sistema-candidato_1990-2007.csv`
  - `data/processed/seguridad-social/2026-06-01_seguridad-social_fipros_validacion-solape-serie-moderna_1995-2007.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- Resumen de cambios: se descargo y transcribio la tabla 2.3 del PDF Seguridad Social/FIPROS con recursos del sistema 1990-2007 y se valido el solape 1995-2007 contra la serie moderna liquidada. Transferencias corrientes coinciden por redondeo; cotizaciones son muy cercanas; total y otros ingresos presentan discrepancias relevantes en algunos anos, sobre todo 2002.
- Estado siguiente: buscar la fuente primaria original indicada por el PDF y no usar el candidato como serie editorial final hasta resolver la discrepancia del total/otros ingresos.
