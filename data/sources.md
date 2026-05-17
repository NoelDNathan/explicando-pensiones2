# Fuentes registradas

## INE - Esperanza de vida al nacimiento

- nombre de la fuente: Esperanza de Vida al Nacimiento según sexo. IDB
- institucion: Instituto Nacional de Estadistica (INE)
- URL: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/1414?tip=AM
- referencia catalogo: https://datos.gob.es/es/catalogo/ea0042823-esperanza-de-vida-al-nacimiento-segun-sexo-anual-nacional-indicadores-demograficos-basicos-identificador-api-14141
- fecha de descarga: 2026-05-18
- periodo cubierto: 1975-2024
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivo bruto: `data/raw/ine/indicadores-demograficos-basicos/2026-05-18_ine_idb_esperanza-vida-nacimiento_sexo_total-nacional_1975-2024.json`
- archivo procesado: `data/processed/ine/esperanza-vida-nacimiento-espana-1975-2024.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones generales del INE
- descripcion breve: esperanza de vida al nacimiento en anos para ambos sexos, hombres y mujeres.
- uso previsto en la web: explicar la evolucion de la longevidad en Espana y su relacion con el sistema de pensiones.

## INE - Proyeccion de esperanza de vida al nacimiento

- nombre de la fuente: Tablas de Mortalidad proyectadas 2024-2073: Esperanza de Vida por edad y sexo
- institucion: Instituto Nacional de Estadistica (INE)
- URL: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36775?tip=AM
- pagina de tabla: https://www.ine.es/jaxiT3/Tabla.htm?t=36775
- pagina de operacion: https://www.ine.es/dyngs/INEbase/operacion.htm?c=Estadistica_C&cid=1254736176953&idp=1254735572981&menu=ultiDatos
- fecha de descarga: 2026-05-18
- periodo cubierto: 2024-2073
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivo bruto: `data/raw/ine/proyecciones-poblacion/tablas-mortalidad-proyectadas/2026-05-18_ine_proyecciones-poblacion_esperanza-vida-edad-sexo_2024-2073.json`
- archivo procesado: `data/processed/ine/2026-05-18_ine_proyeccion-esperanza-vida-nacimiento-espana_2024-2073.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: esperanza de vida proyectada por edad y sexo; el CSV procesado conserva solo edad 0 anos para obtener esperanza de vida al nacimiento.
- uso previsto en la web: mostrar el escenario demografico futuro oficial del INE para hombres y mujeres, separado de la serie historica observada.
- nota metodologica: la tabla proyectada no publica la categoria "Ambos sexos"; no se ha calculado un total propio.

## Eurostat - Deuda publica de Espana

- nombre de la fuente: Government deficit/surplus, debt and associated data
- institucion: Eurostat
- URL datos, millones de euros: https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/gov_10dd_edpt1?geo=ES&sector=S13&na_item=GD&unit=MIO_EUR&lang=en
- URL datos, porcentaje del PIB: https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/gov_10dd_edpt1?geo=ES&sector=S13&na_item=GD&unit=PC_GDP&lang=en
- DOI dataset: https://doi.org/10.2908/GOV_10DD_EDPT1
- fecha de descarga: 2026-05-18
- fecha de actualizacion indicada por Eurostat: 2026-04-22
- periodo cubierto: 1995-2025
- ambito geografico: Espana
- formato descargado: JSON
- archivos brutos:
  - `data/raw/eurostat/deuda-publica/2026-05-18_eurostat_gov_10dd_edpt1_es_s13_gd_mio_eur.json`
  - `data/raw/eurostat/deuda-publica/2026-05-18_eurostat_gov_10dd_edpt1_es_s13_gd_pc_gdp.json`
- archivo procesado: `data/processed/eurostat/deuda-publica-espana-1995-2025.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones generales de Eurostat
- descripcion breve: deuda bruta consolidada de las Administraciones Publicas, sector S13, indicador GD, en millones de euros y como porcentaje del PIB.
- uso previsto en la web: contextualizar la posicion fiscal agregada de Espana al explicar el sistema publico de pensiones.

## INE - IPC, tasa de variacion del indice general nacional

- nombre de la fuente: Tasa de variacion del indice general nacional. Series desde enero de 1961. IPC
- institucion: Instituto Nacional de Estadistica (INE)
- URL: https://www.ine.es/jaxiT3/files/t/csv_bdsc/76134.csv
- identificador INE: tabla 76134
- referencia catalogo: https://datos.gob.es/es/catalogo/ea0010587-tasa-de-variacion-del-indice-general-nacional-series-desde-enero-de-1961-ipc-identificador-api-76134
- fecha de descarga: 2026-05-18
- periodo cubierto en bruto: 1961M01-2026M04
- periodo util para inflacion interanual: 1962M01-2026M04
- ambito geografico: Espana
- formato descargado: CSV separado por punto y coma
- archivo bruto: `data/raw/ine/2026-05-18_ine_ipc-tasa-variacion-indice-general-nacional.csv`
- archivo procesado: `data/processed/ine/2026-05-18_ine_ipc_inflacion-interanual-mensual_1962-2026.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: variacion mensual, variacion anual y variacion en lo que va de ano del IPC general nacional.
- uso previsto en la web: mostrar la evolucion historica de la inflacion en Espana mediante la variacion interanual mensual del IPC general.

## INE - IPC, indice general nacional

- nombre de la fuente: Indice general nacional. Series desde enero de 1961. IPC
- institucion: Instituto Nacional de Estadistica (INE)
- URL: https://www.ine.es/jaxiT3/files/t/csv_bdsc/24077.csv
- identificador INE: tabla 24077
- referencia catalogo: https://datos.gob.es/es/catalogo/ea0010587-indice-general-nacional-series-desde-enero-de-1961-ipc-identificador-api-24077
- fecha de descarga: 2026-05-18
- periodo cubierto: 1961M01-2026M04
- ambito geografico: Espana
- formato descargado: CSV separado por punto y coma
- archivo bruto: `data/raw/ine/2026-05-18_ine_ipc-indice-general-nacional.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: indice general nacional del IPC.
- uso previsto en la web: conservar la serie base del IPC para comprobaciones o calculos derivados.

## Seguridad Social - Nomina mensual de pensiones contributivas

- nombre de la fuente: Libro "Evolucion mensual de pensiones". Abril 2026
- institucion: Seguridad Social
- URL: https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas/EST23/e558ff85-1ef3-4c85-b609-8ffb8567c923
- fecha de descarga: 2026-05-18
- periodo cubierto: 2022-2026 en las hojas de evolucion mensual; dato de nomina detallado a 1 de abril de 2026
- ambito geografico: Espana, sistema de Seguridad Social
- formato descargado: XLSX
- archivo bruto: `data/raw/seguridad-social/pensiones/2026-05-18_seguridad-social_libro-evolucion-mensual-pensiones_2026-04.xlsx`
- pagina de descarga guardada: `data/raw/seguridad-social/pensiones/2026-05-18_seguridad-social_pagina-libro-evolucion-mensual-pensiones.html`
- licencia o condiciones de uso: reutilizacion segun condiciones generales del portal de la Seguridad Social
- descripcion breve: libro oficial con pensiones contributivas en vigor, importe de la nomina mensual, pension media y desgloses por clase, regimen, sexo, territorio y otros criterios.
- uso previsto en la web: mostrar el dato mensual mas reciente de gasto/nomina de pensiones contributivas y sus desgloses.

## Seguridad Social - Presupuesto aprobado, gastos por rubricas economicas

- nombre de la fuente: Cuadro 10. Evolucion de los gastos por rubricas economicas
- institucion: Seguridad Social
- URL: https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas/EST66/EST68
- fecha de descarga: 2026-05-18
- periodo cubierto: 1995-2025P
- ambito geografico: Espana, sistema de Seguridad Social
- formato descargado: XLSX
- archivos brutos:
  - `data/raw/seguridad-social/presupuesto-aprobado/gastos/2026-05-18_seguridad-social_c10-1_gastos-rubricas_1995-2002.xlsx`
  - `data/raw/seguridad-social/presupuesto-aprobado/gastos/2026-05-18_seguridad-social_c10-2_gastos-rubricas_2003-2010.xlsx`
  - `data/raw/seguridad-social/presupuesto-aprobado/gastos/2026-05-18_seguridad-social_c10-3_gastos-rubricas_2011-2018.xlsx`
  - `data/raw/seguridad-social/presupuesto-aprobado/gastos/2026-05-18_seguridad-social_c10-4_gastos-rubricas_2019-2025P.xlsx`
- pagina de descarga guardada: `data/raw/seguridad-social/presupuesto-aprobado/gastos/2026-05-18_seguridad-social_pagina-gastos-presupuesto-aprobado.html`
- licencia o condiciones de uso: reutilizacion segun condiciones generales del portal de la Seguridad Social
- descripcion breve: serie oficial de gasto presupuestario por rubricas economicas, organizada en cuatro ficheros que cubren desde 1995 hasta el presupuesto prorrogado 2025P.
- uso previsto en la web: construir una serie larga de gasto en pensiones/prestaciones economicas de la Seguridad Social, manteniendo separados los datos brutos de cualquier tratamiento posterior.
