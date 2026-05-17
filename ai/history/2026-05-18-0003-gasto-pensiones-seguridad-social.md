# Interaccion 0003 - Gasto en pensiones Seguridad Social

- fecha: 2026-05-18
- objetivo: buscar y descargar datos oficiales sobre gasto de pensiones en Espana, priorizando el mayor periodo temporal disponible.
- archivos modificados:
  - `data/sources.md`
  - `ai/current.md`
  - `ai/history/2026-05-18-0003-gasto-pensiones-seguridad-social.md`
- archivos descargados:
  - `data/raw/seguridad-social/pensiones/2026-05-18_seguridad-social_libro-evolucion-mensual-pensiones_2026-04.xlsx`
  - `data/raw/seguridad-social/pensiones/2026-05-18_seguridad-social_pagina-libro-evolucion-mensual-pensiones.html`
  - `data/raw/seguridad-social/presupuesto-aprobado/gastos/2026-05-18_seguridad-social_pagina-gastos-presupuesto-aprobado.html`
  - `data/raw/seguridad-social/presupuesto-aprobado/gastos/2026-05-18_seguridad-social_c10-1_gastos-rubricas_1995-2002.xlsx`
  - `data/raw/seguridad-social/presupuesto-aprobado/gastos/2026-05-18_seguridad-social_c10-2_gastos-rubricas_2003-2010.xlsx`
  - `data/raw/seguridad-social/presupuesto-aprobado/gastos/2026-05-18_seguridad-social_c10-3_gastos-rubricas_2011-2018.xlsx`
  - `data/raw/seguridad-social/presupuesto-aprobado/gastos/2026-05-18_seguridad-social_c10-4_gastos-rubricas_2019-2025P.xlsx`
- resumen de cambios: se descargaron datos brutos oficiales de Seguridad Social para nomina mensual reciente de pensiones contributivas y para una serie presupuestaria larga de gastos por rubricas economicas desde 1995 hasta 2025P.
- estado siguiente: procesar los XLS del cuadro 10 para extraer una serie limpia de gasto en pensiones, documentando unidades, rubricas exactas y cualquier calculo propio.
