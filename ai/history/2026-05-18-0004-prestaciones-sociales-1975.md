# Interaccion 0004 - Prestaciones sociales desde 1975

- fecha: 2026-05-18
- objetivo: descargar y preparar datos desde 1975 relacionados con gasto de pensiones.
- archivos modificados:
  - `data/sources.md`
  - `data/methodology/transformations.md`
  - `ai/current.md`
  - `ai/history/2026-05-18-0004-prestaciones-sociales-1975.md`
- archivos descargados:
  - `data/raw/seguridad-social/serie-verde/2026-05-18_seguridad-social_serie-verde-2012.html`
  - `data/raw/seguridad-social/serie-verde/2026-05-18_seguridad-social_serie-verde-2012_tomo-i-agregado-sistema.pdf`
  - `data/raw/igae-bdmacro/2026-05-18_sepg_bdmacro_pagina.html`
  - `data/raw/igae-bdmacro/2026-05-18_sepg-igae_bdmacro_1954-2025.xlsx`
  - `data/raw/igae-bdmacro/2026-05-18_sepg-igae_bdmacro_nota-explicativa_abril-2026.pdf`
- archivos procesados:
  - `data/processed/igae/2026-05-18_igae-bdmacro_prestaciones-sociales-seguridad-social_1975-2025.csv`
- resumen de cambios: se descargo BDMACRO y se extrajo una serie 1975-2025 de prestaciones sociales del subsector Seguridad Social, con PIB y porcentaje del PIB. Se documenta que la serie incluye pensiones, desempleo y otras prestaciones sociales, por lo que no debe etiquetarse como gasto puro en pensiones.
- estado siguiente: buscar una fuente tabular institucional que separe pensiones de otras prestaciones sociales antes de 1995, o documentar claramente que la serie larga disponible es una aproximacion amplia de gasto social.
