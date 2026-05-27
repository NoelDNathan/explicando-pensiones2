# Ingresos Seguridad Social 1995-hoy

- fecha: 2026-05-27
- objetivo: empezar la serie oficial de ingresos de la Seguridad Social desde 1995 hasta hoy.
- archivos modificados:
  - `scripts/process-seguridad-social-ingresos-1995-hoy.ps1`
  - `data/raw/seguridad-social/presupuesto-aprobado/ingresos/`
  - `data/processed/seguridad-social/2026-05-27_seguridad-social_ingresos-rubricas-presupuesto_1995-2025P.csv`
  - `data/processed/seguridad-social/2026-05-27_seguridad-social_ingresos-rubricas-columnas-fuente_1995-2025P.csv`
  - `data/processed/seguridad-social/2026-05-27_seguridad-social_ingresos-rubricas-por-afiliacion-media_2001-2025P.csv`
  - `data/sources.md`, `data/inventory.md`, `data/metadata.md`, `data/methodology/transformations.md`, `data/checksums.sha256`, `ai/current.md`
- resumen de cambios: se descargaron y procesaron los XLSX oficiales del Cuadro 4 de ingresos por rubricas economicas. El CSV principal conserva 1995-2024 como liquidacion observada y 2025P como presupuesto. Se genero tambien el indicador por afiliacion media desde 2001.
- estado siguiente: decidir que rubricas se mostraran en la web y si se incorpora IGAE como contraste contable para cotizaciones sociales del subsector Fondos de la Seguridad Social.
