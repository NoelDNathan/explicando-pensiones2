# Interaccion: ampliacion fuentes edad de jubilacion

- fecha: 2026-05-27
- objetivo: buscar fuentes oficiales adicionales y leyes para mejorar la serie de edad efectiva y edad legal de jubilacion.
- archivos modificados:
  - `scripts/process-seguridad-social-edad-jubilacion-1975-2026.ps1`
  - `data/raw/seguridad-social/edad-jubilacion/2026-05-27_congreso-pge2017_seguridad-social_informe-economico-financiero-edad-altas-jubilacion_2006-2016.pdf`
  - `data/raw/seguridad-social/edad-jubilacion/2026-05-27_inclusion_nota-prensa-edad-real-jubilacion-2012-2013.pdf`
  - `data/processed/seguridad-social/2026-05-27_seguridad-social_edad-legal-efectiva-jubilacion-espana_1975-2026.csv`
  - `data/methodology/fuentes-edad-jubilacion.md`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se amplio la cobertura observada de edad efectiva desde 2022-2026 hasta 2006-2026, combinando fuentes oficiales comparables: PGE/Seguridad Social 2017 para 2006-2016, EVOMOD202501 para 2017-2021 y catalogo Seguridad Social para 2022-2026. Se documento que 1975-2005 sigue pendiente y que OCDE no debe usarse para rellenar la serie principal.
- estado siguiente: buscar anuarios, informes economico-financieros anteriores o tablas oficiales de altas por edad para reconstruir 1975-2005 sin cambiar definicion.
