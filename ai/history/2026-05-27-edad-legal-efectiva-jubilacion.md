# Interaccion: edad legal y efectiva de jubilacion

- fecha: 2026-05-27
- objetivo: obtener datos de edad legal y edad efectiva de jubilacion en Espana desde 1975 hasta la actualidad, con trazabilidad.
- archivos modificados:
  - `scripts/process-seguridad-social-edad-jubilacion-1975-2026.ps1`
  - `data/raw/seguridad-social/pensiones/2026-05-27_seguridad-social_catalogo-evolucion-altas-jubilacion-edad_2022-2026.csv`
  - `data/processed/seguridad-social/2026-05-27_seguridad-social_edad-legal-efectiva-jubilacion-espana_1975-2026.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se genero un CSV de cobertura 1975-2026 con edad legal ordinaria general completa, edad ordinaria de 65 anos con carrera larga desde 2013, cotizacion exigida para esa via y edad efectiva observada de altas iniciales publicada por Seguridad Social para 2022-2025 y 2026 parcial. Los anos 1975-2021 quedan como `pendiente` para edad efectiva.
- estado siguiente: si se necesita cubrir edad efectiva antes de 2022, localizar una fuente institucional anual comparable o reconstruir con microdatos; no mezclar con edad de salida del mercado laboral.
