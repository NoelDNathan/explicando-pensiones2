# Historial de interaccion

- fecha: 2026-05-25
- objetivo: localizar y procesar datos oficiales recientes para una vista de gasto sanitario por edad en Espana.
- archivos modificados:
  - `scripts/process-airef-health-age-profile-2022.ps1`
  - `data/raw/airef/sanidad-educacion-cuidados/`
  - `data/processed/airef/2026-05-25_airef_perfil-gasto-sanitario-edad-sexo-percapita_2022.csv`
  - `data/processed/airef/2026-05-25_airef_ine_gasto-sanitario-vital-esperado-edad-sexo_2022.csv`
  - `data/processed/airef/2026-05-25_airef_ine_gasto-sanitario-vital-esperado-bandas-dashboard_2022.csv`
  - `data/methodology/gasto-sanitario-edad-dashboard.md`
  - `data/methodology/transformations.md`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: descargados el Excel y PDF oficiales de AIReF 2025 sobre sanidad, educacion y cuidados; extraido el perfil de gasto sanitario per capita por edad y sexo para 2022; calculado un gasto sanitario vital esperado combinando ese perfil con la tabla de mortalidad INE 2022; documentada la ausencia de un cruce completo categoria sanitaria x edad x sexo para replicar barras apiladas por categoria.
- estado siguiente: localizar una fuente oficial/institucional adicional si se quiere desglosar el dashboard por categorias sanitarias; usar por ahora solo `Total sanidad` por edad/sexo y etiquetar el calculo vital como estimacion derivada de periodo.
