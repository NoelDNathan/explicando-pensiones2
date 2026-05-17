# Interaccion 0005 - Previsiones futuras de pensiones AIReF

- fecha: 2026-05-18
- objetivo: descargar previsiones a futuro sobre pensiones desde una fuente institucional.
- archivos modificados:
  - `data/sources.md`
  - `data/methodology/transformations.md`
  - `ai/current.md`
  - `ai/history/2026-05-18-0005-previsiones-pensiones-airef.md`
- archivos descargados:
  - `data/raw/airef/pensiones-previsiones/2026-05-18_airef_pagina-informe-regla-gasto-pensiones.html`
  - `data/raw/airef/pensiones-previsiones/2026-05-18_airef_graficos-cuadros-informe-regla-gasto-pensiones.xlsx`
  - `data/raw/airef/pensiones-previsiones/2026-05-18_airef_informe-regla-gasto-pensiones.pdf`
  - `data/raw/airef/pensiones-previsiones/2026-05-18_airef_resumen-ejecutivo-informe-regla-gasto-pensiones.pdf`
- archivos procesados:
  - `data/processed/airef/2026-05-18_airef_prevision-gasto-pensiones-pct-pib_2022-2070.csv`
  - `data/processed/airef/2026-05-18_airef_prevision-pensionistas-millones_2022-2070.csv`
  - `data/processed/airef/2026-05-18_airef_prevision-financiacion-sistema-pensiones-pct-pib_2020-2070.csv`
- resumen de cambios: se descargo el informe de AIReF sobre la regla de gasto de pensiones y se extrajeron del Excel oficial tres series largas de prevision: gasto en pensiones como porcentaje del PIB, numero de pensionistas y financiacion del sistema publico de pensiones.
- estado siguiente: decidir como se representaran las previsiones en la web, manteniendolas separadas de los datos observados y diferenciando escenarios.
