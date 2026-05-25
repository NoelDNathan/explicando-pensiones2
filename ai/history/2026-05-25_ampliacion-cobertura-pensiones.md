# Interaccion: ampliacion de cobertura de pensiones

- Fecha: 2026-05-25
- Objetivo: intentar cubrir todos los anos solicitados para pensiones contributivas y no contributivas, avisando de problemas reales de fuente.
- Archivos modificados:
  - `scripts/process-pensiones-contributivas-no-contributivas-1975-2070.ps1`
  - `data/raw/mites/anuario-pensiones-contributivas/`
  - `data/raw/mites/bel-pnc/2026-05-25_mites_bel_pnc1_beneficiarios.pdf`
  - `data/raw/mites/bel-pensiones-contributivas/2026-05-25_mites_bel_pen1_pensiones-clase.pdf`
  - `data/processed/pensiones/2026-05-25_seguridad-social_pensiones-contributivas-observado-modelizado_1975-2070.csv`
  - `data/processed/pensiones/2026-05-25_imserso_pensiones-no-contributivas-observado-modelizado_1991-2070.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- Resumen de cambios: se incorporaron datos MITES observados para pensiones contributivas 2001-2005 y BEL MITES PNC 2016-2018. Se documento que contributivas 1975-2000 y PNC 1991-2015 siguen sin cubrir en tabla procesada.
- Estado siguiente: buscar una fuente descargable no 404 para contributivas 1975-2000 y automatizar extraccion de PDFs Imserso 1991-2015.
