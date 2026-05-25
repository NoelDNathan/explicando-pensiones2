# Fuentes registradas

## Seguridad Social - Pensionistas-personas y modelo demografico

- nombre de la fuente observada: Libro "Evolucion mensual de las pensiones", hoja `Pnes y ptas`
- institucion: Seguridad Social / Ministerio de Inclusion, Seguridad Social y Migraciones
- URL pagina estadisticas: https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas/EST23
- URL pagina pensionistas: https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas/EST23/26bce586-014b-4c4e-9484-009cee21e271
- URL eSTADISS: https://sede.seg-social.gob.es/wps/portal/sede/sede/Ciudadanos/Pensiones/201944
- fecha de descarga del bruto local: 2026-05-18
- fecha de transformacion: 2026-05-25
- periodo observado procesado: 2006-2026; diciembre para 2006-2025 y abril para 2026
- periodo modelizado: 2027-2070
- periodo de cobertura del CSV combinado: 1975-2070, con 1975-2005 marcado como `no_estimado`
- ambito geografico: Espana
- formato descargado: XLSX
- archivo bruto: `data/raw/seguridad-social/pensiones/2026-05-18_seguridad-social_libro-evolucion-mensual-pensiones_2026-04.xlsx`
- archivos procesados:
  - `data/processed/seguridad-social/2026-05-25_seguridad-social_pensionistas-personas-observado_2006-2026.csv`
  - `data/processed/seguridad-social/2026-05-25_modelo-demografico_pensionistas-personas_2027-2070.csv`
  - `data/processed/seguridad-social/2026-05-25_seguridad-social-pensionistas-personas-observado-modelizado_1975-2070.csv`
- fuente auxiliar para el modelo: INE Proyecciones de poblacion, tabla 36643, archivo `data/processed/ine/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones del portal de la Seguridad Social y del INE
- descripcion breve: serie de personas pensionistas, no numero de pensiones, observada desde el libro mensual; extension 2027-2070 como proxy demografica calibrada al ultimo dato oficial disponible.
- uso previsto en la web: explicar la diferencia entre pensionistas-personas y pensiones, y permitir una vista demografica de largo plazo con `estado_dato` visible.
- nota metodologica: no se rellenan 1975-2005 con numero de pensiones porque una persona puede cobrar varias pensiones; eSTADISS requiere consulta/exportacion parametrizada y captcha, por lo que queda pendiente incorporar una descarga manual si publica personas para ese tramo.

## IGAE/SEPG - BDMACRO, principales series fiscales de AAPP

- nombre de la fuente: Base de datos anuales de la economia espanola BDMACRO, cuadro 23-A Cuentas de las AAPP agregadas
- institucion: Secretaria de Estado de Presupuestos y Gastos / IGAE
- URL pagina: https://www.sepg.pap.hacienda.gob.es/sitios/sepg/es-ES/Presupuestos/DocumentacionEstadisticas/Documentacion/paginas/bdmacro.aspx
- URL archivo XLSX: https://www.sepg.pap.hacienda.gob.es/sitios/sepg/es-ES/Presupuestos/DocumentacionEstadisticas/Documentacion/Documents/BASES%20DE%20DATOS/ANUALES%20DE%20LA%20ECONOMIA%20ESPA%C3%91OLA%20BDMACRO/BDMACRO_Abril_2026.xlsx
- fecha de descarga: 2026-05-18
- fecha de transformacion: 2026-05-25
- periodo procesado: 1975-2024
- ambito geografico: Espana, sector Administraciones Publicas
- formato descargado: XLSX
- archivo bruto: `data/raw/igae/bdmacro/2026-05-18_igae-sepg_bdmacro_abril-2026.xlsx`
- archivo procesado: `data/processed/igae/2026-05-25_igae-bdmacro_aapp-principales-series-fiscales-espana_1975-2024.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones del portal de la Administracion Presupuestaria
- descripcion breve: serie historica anual de PIB, gasto publico total, intereses y otras rentas de la propiedad, saldo publico, deuda publica PDE y prestaciones sociales agregadas de las AAPP.
- uso previsto en la web: base historica para los indicadores fiscales generales solicitados, con la cautela de que `intereses_deuda` usa la columna BDMACRO `Intereses + Otras rentas de la propiedad`.
- nota metodologica: BDMACRO indica que las series actuales 1995-2025 se enlazan hacia atras con series publicadas para 1954-1994; la hoja usada contiene valores completos hasta 2024 para estas variables.

## IGAE - Gasto publico en salud COFOG

- nombre de la fuente: Administraciones publicas. Clasificacion funcional: serie desde 1995, division 07 Salud
- institucion: Intervencion General de la Administracion del Estado (IGAE)
- URL pagina: https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Contabilidad/ContabilidadNacional/Publicaciones/Paginas/iacogofseries.aspx
- URL archivo XLSX: https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Contabilidad/ContabilidadNacional/Publicaciones/Documents/AAPP_A/COFOG_A_AAPP.xlsx
- fecha de descarga: 2026-05-18
- fecha de transformacion: 2026-05-25
- periodo procesado: 1995-2024
- ambito geografico: Espana, sector Administraciones Publicas (S.13)
- formato descargado: XLSX
- archivo bruto: `data/raw/igae/cofog/2026-05-18_igae_cofog-aapp-serie-1995-2024.xlsx`
- archivo procesado: `data/processed/igae/2026-05-25_igae-cofog_gasto-salud-aapp-espana_1995-2024.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones generales del portal de la Administracion Presupuestaria
- descripcion breve: gasto publico funcional COFOG `07 Salud` de las Administraciones Publicas.
- uso previsto en la web: serie observada de gasto publico en sanidad desde 1995, separada de las proyecciones del Ageing Report.
- nota metodologica: COFOG `07 Salud` no equivale necesariamente al gasto sanitario total ni a la definicion OCDE de gasto sanitario publico/obligatorio.

## Comision Europea - Ageing Report 2024, anexos estadisticos

- nombre de la fuente: 2024 Ageing Report - Statistical annexes all country fiches
- institucion: Comision Europea, Directorate-General for Economic and Financial Affairs; Economic Policy Committee
- URL pagina: https://economy-finance.ec.europa.eu/publications/2024-ageing-report-economic-and-budgetary-projections-eu-member-states-2022-2070_en
- fecha de publicacion indicada: 2024-04-18
- fecha de descarga: 2026-05-25
- periodo cubierto: 2022-2070
- ambito geografico procesado: Espana
- formato descargado: XLSX
- archivo bruto: `data/raw/comision-europea/ageing-report-2024/2026-05-25_ec_2024-ageing-report_statistical-annex-country-fiches.xlsx`
- archivo procesado: `data/processed/comision-europea/2026-05-25_ec-ageing-report_espana-pensiones-sanidad-coste-envejecimiento_2022-2070.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones y aviso legal de la Comision Europea
- descripcion breve: anexos estadisticos por pais con proyecciones 2022-2070; para Espana se extraen pensiones publicas brutas, gasto sanitario publico y coste total del envejecimiento, todos como porcentaje del PIB.
- uso previsto en la web: completar escenarios de largo plazo para sanidad y servir de contraste institucional para pensiones.
- nota metodologica: son proyecciones bajo metodologia comun europea; no deben mezclarse con datos observados.

## BOE - Edad minima legal para trabajar en Espana

- nombre de la fuente: edad minima legal general de admision al trabajo por periodo normativo
- institucion: Boletin Oficial del Estado (BOE)
- URL Ley de Relaciones Laborales 1976: https://www.boe.es/buscar/doc.php?id=BOE-A-1976-8373
- URL Estatuto de los Trabajadores 1980: https://www.boe.es/diario_boe/txt.php?id=BOE-A-1980-5683
- URL Estatuto de los Trabajadores consolidado 2015: https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430
- URL referencia sectorial historica, Ordenanza General de Trabajo en el Campo 1975: https://www.boe.es/buscar/doc.php?id=BOE-A-1975-14347
- URL referencia historica, Decreto 1119/1960: https://www.boe.es/buscar/doc.php?id=BOE-A-1960-8648
- fecha de consulta: 2026-05-24
- periodo cubierto: hasta 1976, 1976-1980 y 1980-actualidad (2026)
- ambito geografico: Espana
- formato generado: JSON codificado manualmente desde normativa oficial
- archivo procesado: `data/processed/boe/2026-05-24_boe_edad-minima-legal-trabajar-espana_antes-1976-2026.json`
- licencia o condiciones de uso: reutilizacion segun condiciones generales del BOE
- descripcion breve: tabla normativa de referencia sobre la edad minima legal general para trabajar en Espana por grandes periodos.
- uso previsto en la web: contextualizar graficos de poblacion en edad de trabajar, explicando que la edad legal minima cambia historicamente y que desde 1976 se fija en 16 anos.
- nota metodologica: el tramo anterior a 1976 resume una situacion normativa historica heterogenea; usar con cautela si se requiere detalle juridico por sector o regimen.

## IGAE/SEPG - BDMACRO, salario medio macro

- nombre de la fuente: Base de datos anuales de la economia espanola BDMACRO, cuadro 29 Salario Medio por ramas de actividad
- institucion: Secretaria de Estado de Presupuestos y Gastos / IGAE
- URL pagina: https://www.sepg.pap.hacienda.gob.es/sitios/sepg/es-ES/Presupuestos/DocumentacionEstadisticas/Documentacion/paginas/bdmacro.aspx
- URL archivo XLSX: https://www.sepg.pap.hacienda.gob.es/sitios/sepg/es-ES/Presupuestos/DocumentacionEstadisticas/Documentacion/Documents/BASES%20DE%20DATOS/ANUALES%20DE%20LA%20ECONOMIA%20ESPA%C3%91OLA%20BDMACRO/BDMACRO_Abril_2026.xlsx
- fecha de descarga: 2026-05-18
- fecha de transformacion: 2026-05-25
- periodo cubierto en la fuente: 1954-2024 para la columna de salario medio total con valores utiles en BDMACRO abril 2026
- periodo procesado: 1970-2070; valores observados 1970-2024 y filas 2025-2070 marcadas como `no_estimado`
- ambito geografico: Espana
- formato descargado: XLSX
- archivo bruto: `data/raw/igae/bdmacro/2026-05-18_igae-sepg_bdmacro_abril-2026.xlsx`
- archivo procesado: `data/processed/igae/2026-05-25_igae-bdmacro_salario-medio-espana_1970-2070.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones del portal de la Administracion Presupuestaria
- descripcion breve: salario medio macro calculado por BDMACRO como remuneracion de asalariados dividida entre asalariados.
- uso previsto en la web: contexto de largo plazo para comparar magnitudes de pensiones y salarios, siempre explicando que es una definicion macro y no una encuesta salarial.
- nota metodologica: no se ha localizado una proyeccion oficial de salario medio hasta 2070 en las fuentes permitidas; por eso 2025-2070 queda sin valor numerico y no se interpola.

## IGAE - Gasto publico por funciones COFOG

- nombre de la fuente: Administraciones publicas. Clasificacion funcional: serie desde 1995
- institucion: Intervencion General de la Administracion del Estado (IGAE)
- URL pagina: https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Contabilidad/ContabilidadNacional/Publicaciones/Paginas/iacogofseries.aspx
- URL archivo XLSX: https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Contabilidad/ContabilidadNacional/Publicaciones/Documents/AAPP_A/COFOG_A_AAPP.xlsx
- fecha de descarga: 2026-05-18
- fecha de actualizacion indicada por la pagina: 2025-11-28
- periodo cubierto: 1995-2024
- ambito geografico: Espana, sector Administraciones Publicas (S.13)
- formato descargado: XLSX
- archivo bruto: `data/raw/igae/cofog/2026-05-18_igae_cofog-aapp-serie-1995-2024.xlsx`
- archivos procesados:
  - `data/processed/igae/2026-05-18_igae_cofog-proteccion-social-detalle-aapp_1995-2024.csv`
  - `data/processed/igae/2026-05-18_igae_cofog-aproximacion-pensiones-vejez-supervivientes-aapp_1995-2024.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones generales del portal de la Administracion Presupuestaria
- descripcion breve: gasto del sector Administraciones Publicas clasificado por finalidad del gasto segun COFOG y por naturaleza economica, de acuerdo con SEC 2010.
- uso previsto en la web: construir una visualizacion tipo treemap de evolucion del gasto publico por grandes funciones oficiales.
- nota metodologica: a primer nivel COFOG hay diez divisiones; "pensiones" no aparece como division propia, sino dentro de `10 Proteccion social`. Para aislar pensiones habria que usar el detalle COFOG de segundo nivel, especialmente vejez/supervivencia cuando proceda, o fuentes presupuestarias de Seguridad Social documentadas aparte.

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

## INE - Esperanza de vida restante a edades de jubilacion

- nombre de la fuente: Tablas de mortalidad por ano, sexo, edad y funciones; Tablas de mortalidad proyectadas 2024-2073
- institucion: Instituto Nacional de Estadistica (INE)
- URLs observadas:
  - 1975-1990: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/27150?tip=AM
  - 1991-2024: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/27153?tip=AM
- URL proyectada: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36775?tip=AM
- paginas de tabla:
  - https://www.ine.es/jaxiT3/Tabla.htm?t=27150
  - https://www.ine.es/jaxiT3/Tabla.htm?t=27153
  - https://www.ine.es/jaxiT3/Tabla.htm?t=36775
- fecha de descarga observada: 2026-05-25
- fecha de descarga proyectada: 2026-05-18
- periodo procesado combinado: 1975-2070
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivos brutos:
  - `data/raw/ine/tablas-mortalidad/2026-05-25_ine_tm_tablas-mortalidad-nacional-1975-1990.json`
  - `data/raw/ine/tablas-mortalidad/2026-05-25_ine_tm_tablas-mortalidad-nacional-1991-2024.json`
  - `data/raw/ine/proyecciones-poblacion/tablas-mortalidad-proyectadas/2026-05-18_ine_proyecciones-poblacion_esperanza-vida-edad-sexo_2024-2073.json`
- archivos procesados:
  - `data/processed/ine/2026-05-25_ine_tm_esperanza-vida-restante-65-66-67-sexo-espana-observada_1975-2024.csv`
  - `data/processed/ine/2026-05-25_ine_proyeccion-esperanza-vida-restante-65-66-67-sexo-espana_2025-2070.csv`
  - `data/processed/ine/2026-05-25_ine_esperanza-vida-restante-65-66-67-sexo-espana-observada-proyectada_1975-2070.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: esperanza de vida restante, en anos, para hombres y mujeres que alcanzan 65, 66 o 67 anos.
- uso previsto en la web: contextualizar cuantos anos de vida media quedan despues de edades habituales de jubilacion.
- nota metodologica: no se calcula `Ambos sexos` para el tramo proyectado porque la tabla 36775 no lo publica; la serie combinada usa 2024 observado y empieza la proyeccion en 2025.

## INE - Tasa bruta de natalidad observada

- nombre de la fuente: Tasa Bruta de Natalidad. Indicadores Demograficos Basicos
- institucion: Instituto Nacional de Estadistica (INE)
- URL: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/1381?tip=AM
- pagina de tabla: https://www.ine.es/jaxiT3/Tabla.htm?t=1381
- fecha de descarga: 2026-05-24
- periodo cubierto: 1975-2024
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivo bruto: `data/raw/ine/indicadores-demograficos-basicos/2026-05-24_ine_idb_tasa-bruta-natalidad-total-nacional_1975-2024.json`
- archivo procesado: `data/processed/ine/2026-05-24_ine_idb_tasa-bruta-natalidad-espana-observada_1975-2024.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: tasa bruta de natalidad anual de Espana, medida como nacidos por mil habitantes.
- uso previsto en la web: explicar la evolucion historica observada de la natalidad en Espana.
- nota metodologica: serie observada; no mezclar como equivalente con la proyeccion de la tabla 36653.

## INE - Tasa bruta de natalidad proyectada

- nombre de la fuente: Tasa Bruta de Natalidad. Proyeccion a largo plazo
- institucion: Instituto Nacional de Estadistica (INE)
- URL: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36653?tip=AM
- pagina de tabla: https://www.ine.es/jaxiT3/Tabla.htm?t=36653
- fecha de descarga: 2026-05-24
- periodo cubierto en la fuente descargada: 2024-2073
- periodo procesado principal: 2025-2070
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivo bruto: `data/raw/ine/proyecciones-poblacion/natalidad/2026-05-24_ine_proyecciones-poblacion_tasa-bruta-natalidad-total-nacional_2024-2073.json`
- archivos procesados:
  - `data/processed/ine/2026-05-24_ine_proyeccion-tasa-bruta-natalidad-espana_2025-2070.csv`
  - `data/processed/ine/2026-05-24_ine_tasa-bruta-natalidad-espana-observada-proyectada_1975-2070.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: tasa bruta de natalidad anual proyectada de Espana, medida como nacidos por mil habitantes.
- uso previsto en la web: enlazar la serie historica observada con el escenario demografico futuro oficial del INE.
- nota metodologica: el JSON bruto incluye 2024 proyectado. El CSV proyectado principal empieza en 2025 y el CSV combinado usa 2024 solo como observado, para no mezclar 2024 observado y 2024 proyectado como equivalentes.

## INE - Indicadores de fecundidad y mortalidad observados y proyectados

- nombre de la fuente: indicadores demograficos anuales de fecundidad y mortalidad para Espana
- institucion: Instituto Nacional de Estadistica (INE)
- URLs observadas IDB:
  - indicador coyuntural de fecundidad: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/1407?tip=AM
  - edad media a la maternidad por orden de nacimiento: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/48879?tip=AM
  - tasa bruta de mortalidad: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/1411?tip=AM
- URLs proyectadas, Proyecciones de Poblacion 2024-2074:
  - indicador coyuntural de fecundidad: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36655?tip=AM
  - edad media a la maternidad: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36656?tip=AM
  - tasa bruta de mortalidad: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36657?tip=AM
- paginas de tabla:
  - https://www.ine.es/jaxiT3/Tabla.htm?t=1407
  - https://www.ine.es/jaxiT3/Tabla.htm?t=48879
  - https://www.ine.es/jaxiT3/Tabla.htm?t=1411
  - https://www.ine.es/jaxiT3/Tabla.htm?t=36655
  - https://www.ine.es/jaxiT3/Tabla.htm?t=36656
  - https://www.ine.es/jaxiT3/Tabla.htm?t=36657
- fecha de descarga: 2026-05-24
- periodo cubierto observado: 1975-2024
- periodo cubierto proyectado en bruto: 2024-2073
- periodo procesado combinado: 1975-2070, con 2025-2070 como proyeccion
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivos brutos:
  - `data/raw/ine/indicadores-demograficos-basicos/2026-05-24_ine_idb_indicador-coyuntural-fecundidad-total-nacional_1975-2024.json`
  - `data/raw/ine/indicadores-demograficos-basicos/2026-05-24_ine_idb_edad-media-maternidad-orden-nacimiento-total-nacional_1975-2024.json`
  - `data/raw/ine/indicadores-demograficos-basicos/2026-05-24_ine_idb_tasa-bruta-mortalidad-total-nacional_1975-2024.json`
  - `data/raw/ine/proyecciones-poblacion/componentes-demograficos/2026-05-24_ine_proyecciones-poblacion_indicador-coyuntural-fecundidad-total-nacional_2024-2073.json`
  - `data/raw/ine/proyecciones-poblacion/componentes-demograficos/2026-05-24_ine_proyecciones-poblacion_edad-media-maternidad-total-nacional_2024-2073.json`
  - `data/raw/ine/proyecciones-poblacion/componentes-demograficos/2026-05-24_ine_proyecciones-poblacion_tasa-bruta-mortalidad-total-nacional_2024-2073.json`
- archivos procesados principales:
  - `data/processed/ine/2026-05-24_ine_indicador-coyuntural-fecundidad-espana-observado-proyectado_1975-2070.csv`
  - `data/processed/ine/2026-05-24_ine_edad-media-maternidad-espana-observada-proyectada_1975-2070.csv`
  - `data/processed/ine/2026-05-24_ine_tasa-bruta-mortalidad-espana-observada-proyectada_1975-2070.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: series nacionales anuales de fecundidad, edad media a la maternidad y mortalidad, enlazando datos observados con proyecciones oficiales cuando existen.
- nota metodologica: la proyeccion oficial no publica edad media al primer hijo; esa serie queda observada hasta 2024 y no se estima para 2025-2070.

## INE - Nacimientos y defunciones observados y proyectados

- nombre de la fuente: nacimientos y defunciones anuales de Espana
- institucion: Instituto Nacional de Estadistica (INE)
- URLs observadas MNP:
  - nacimientos por residencia de la madre y sexo: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/6506?tip=AM
  - defunciones por residencia y sexo: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/6545?tip=AM
- URLs proyectadas, Proyecciones de Poblacion 2024-2074:
  - nacimientos por sexo y generacion de la madre: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36644?tip=AM
  - defunciones por sexo y generacion: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36646?tip=AM
- paginas de tabla:
  - https://www.ine.es/jaxiT3/Tabla.htm?t=6506
  - https://www.ine.es/jaxiT3/Tabla.htm?t=6545
  - https://www.ine.es/jaxiT3/Tabla.htm?t=36644
  - https://www.ine.es/jaxiT3/Tabla.htm?t=36646
- fecha de descarga: 2026-05-24
- periodo cubierto observado: 1975-2024
- periodo cubierto proyectado en bruto: 2024-2073
- periodo procesado combinado: 1975-2070, con 2025-2070 como proyeccion
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivos brutos:
  - `data/raw/ine/movimiento-natural-poblacion/2026-05-24_ine_mnp_nacimientos-residencia-madre-sexo-total-nacional_1975-2024.json`
  - `data/raw/ine/movimiento-natural-poblacion/2026-05-24_ine_mnp_defunciones-residencia-sexo-total-nacional_1975-2024.json`
  - `data/raw/ine/proyecciones-poblacion/componentes-demograficos/2026-05-24_ine_proyecciones-poblacion_nacimientos-sexo-generacion-madre-total-nacional_2024-2073.json`
  - `data/raw/ine/proyecciones-poblacion/componentes-demograficos/2026-05-24_ine_proyecciones-poblacion_defunciones-sexo-generacion-total-nacional_2024-2073.json`
- archivos procesados principales:
  - `data/processed/ine/2026-05-24_ine_nacimientos-espana-observados-proyectados_1975-2070.csv`
  - `data/processed/ine/2026-05-24_ine_defunciones-espana-observadas-proyectadas_1975-2070.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: conteos nacionales anuales de nacimientos y defunciones, con datos observados del MNP y proyecciones oficiales del INE.
- nota metodologica: los CSV combinados excluyen el 2024 proyectado y conservan 2024 como observado para evitar duplicar el ano de solape.

## INE - Esperanza de vida al nacimiento observada y proyectada por sexo

- nombre de la fuente: esperanza de vida al nacimiento por sexo, observada y proyectada
- institucion: Instituto Nacional de Estadistica (INE)
- URLs:
  - observada IDB: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/1414?tip=AM
  - proyectada Proyecciones de Poblacion 2024-2074: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36775?tip=AM
- fecha de descarga de las fuentes brutas: 2026-05-18
- fecha de generacion del combinado: 2026-05-24
- periodo procesado combinado: 1975-2070
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivo procesado combinado: `data/processed/ine/2026-05-24_ine_esperanza-vida-nacimiento-sexo-espana-observada-proyectada_1975-2070.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: union de esperanza de vida al nacimiento observada y proyectada para hombres y mujeres.
- nota metodologica: la proyeccion no publica "Ambos sexos"; el combinado solo contiene hombres y mujeres para mantener trazabilidad sin calcular un total propio.

## INE - Proyeccion de poblacion residente por sexo y edad

- nombre de la fuente: Poblacion residente a 1 de enero por sexo, edad y ano. Proyecciones de poblacion
- institucion: Instituto Nacional de Estadistica (INE)
- URL: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36643?tip=AM
- pagina de tabla: https://www.ine.es/jaxiT3/Tabla.htm?t=36643
- pagina de operacion: https://www.ine.es/dyngs/INEbase/operacion.htm?c=Estadistica_C&cid=1254736176953&idp=1254735572981&menu=ultiDatos
- fecha de descarga: 2026-05-18
- periodo cubierto: 2024-2074
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivo bruto: `data/raw/ine/proyecciones-poblacion/poblacion-residente/2026-05-18_ine_proyecciones-poblacion_poblacion-residente-sexo-edad_2024-2074.json`
- archivo procesado: `data/processed/ine/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: poblacion residente proyectada a 1 de enero para Total Nacional, por sexo y edades simples, incluyendo la categoria "Todas las edades".
- uso previsto en la web: explicar la evolucion prevista de la poblacion total y de la estructura por edades en Espana, manteniendo la proyeccion separada de los datos observados.
- nota metodologica: la descarga conserva la serie oficial del INE sin calcular escenarios alternativos ni interpolaciones propias.

## INE - Poblacion residente observada por sexo y edad

- nombre de la fuente: Poblacion residente por fecha, sexo y edad desde 1971. Estadistica Continua de Poblacion
- institucion: Instituto Nacional de Estadistica (INE)
- URL: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/56934?tip=AM
- pagina de tabla: https://www.ine.es/jaxiT3/Tabla.htm?t=56934
- referencia catalogo: https://datos.gob.es/es/catalogo/ea0042823-poblacion-residente-por-fecha-sexo-y-edad-ecp-identificador-api-569342
- fecha de descarga: 2026-05-18
- periodo cubierto en la fuente descargada: 1971-2025
- periodo procesado: 1975-2025
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivo bruto: `data/raw/ine/estadistica-continua-poblacion/poblacion-residente/2026-05-18_ine_ecp_poblacion-residente-sexo-edad_1971-2025.json`
- archivos procesados:
  - `data/processed/ine/2026-05-18_ine_ecp_poblacion-residente-espana-sexo-edad_1975-2025.csv`
  - `data/processed/ine/2026-05-18_ine_ecp_piramide-poblacion-espana-sexo-edad_1975-2025.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: poblacion residente observada de Espana por fecha, sexo y edad, con valores definitivos en la descarga actual.
- uso previsto en la web: construir piramides de poblacion historicas desde 1975 y compararlas, de forma separada, con las proyecciones oficiales.
- nota metodologica: el CSV para piramides conserva solo datos a 1 de enero, hombres y mujeres, edades publicadas por el INE; no se calculan agregados propios.

## INE - Poblacion residente observada por sexo, grupo de edad y pais de nacimiento

- nombre de la fuente: Poblacion residente por fecha, sexo, grupo de edad y pais de nacimiento. Estadistica Continua de Poblacion
- institucion: Instituto Nacional de Estadistica (INE)
- URL: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/56937?tip=AM
- pagina de tabla: https://www.ine.es/jaxiT3/Tabla.htm?t=56937
- referencia catalogo: https://datos.gob.es/es/catalogo/ea0010587-poblacion-residente-por-fecha-sexo-grupo-de-edad-y-pais-de-nacimiento-ecp-identificador-api-569372
- descarga XLSX publicada en datos.gob.es: https://www.ine.es/jaxiT3/files/t/xlsx/56937.xlsx
- fecha de descarga: 2026-05-24
- periodo cubierto en la fuente descargada: 2002-2025
- periodo procesado: 2002-2025
- ambito geografico: Total Nacional
- formato descargado: JSON
- archivo bruto: `data/raw/ine/estadistica-continua-poblacion/poblacion-nacimiento/2026-05-24_ine_ecp_poblacion-residente-sexo-grupo-edad-pais-nacimiento_2002-2025.json`
- archivos procesados:
  - `data/processed/ine/2026-05-24_ine_ecp_poblacion-residente-espana-sexo-grupo-edad-nacimiento_2002-2025.csv`
  - `data/processed/ine/2026-05-24_ine_poblacion-residente-nacimiento-cobertura-interpolacion_1975-2070.csv`
- licencia o condiciones de uso: aviso legal del INE, https://www.ine.es/aviso_legal
- descripcion breve: poblacion residente observada de Espana por fecha, sexo, grupo quinquenal de edad y pais de nacimiento. El CSV procesado conserva las categorias `Total`, `Espana` y `Extranjero`.
- uso previsto en la web: construir piramides o perfiles de poblacion nacida en Espana y nacida en el extranjero desde 2002.
- nota metodologica: no se han creado valores interpolados. La tabla de cobertura documenta los tramos donde solo hay anclas censales o proyecciones no cruzadas.

## INE - Modelo propio de poblacion por nacimiento, sexo y edad proyectada

- nombre de la fuente: modelo propio por cohortes para poblacion residente por lugar de nacimiento, sexo y grupo quinquenal de edad
- institucion: Instituto Nacional de Estadistica (INE), con transformacion propia del proyecto
- URL API usadas:
  - poblacion proyectada por lugar de nacimiento: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36642?tip=AM
  - poblacion proyectada por sexo y edad: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36643?tip=AM
  - defunciones proyectadas por sexo y edad: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36647?tip=AM
  - inmigraciones procedentes del extranjero por sexo y edad: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36649?tip=AM
  - emigraciones con destino al extranjero por sexo y edad: https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36651?tip=AM
- fecha de descarga: 2026-05-25
- periodo procesado: 2026-2070
- unidad: personas residentes a 1 de enero, por sexo, grupo quinquenal de edad y lugar de nacimiento `Espana`/`Extranjero`
- estado del dato: modelizado / estimado
- archivo bruto: `data/raw/ine/proyecciones-poblacion/poblacion-nacimiento-modelo/`
- archivo procesado: `data/processed/ine/2026-05-25_ine_modelo-cohortes-poblacion-nacimiento-sexo-grupo-edad_2026-2070.csv`
- script reproducible: `scripts/process-ine-migrant-cohort-model-2026-2070.ps1`
- descripcion breve: modelo por cohortes quinquenales que parte del stock observado 2025 de nacidos en el extranjero, lo envejece, aplica mortalidad y flujos migratorios proyectados, y calibra cada ano al total oficial de poblacion nacida en el extranjero.
- nota metodologica: el INE no publica una tabla oficial proyectada que cruce lugar de nacimiento, sexo y edad. Este CSV debe presentarse como estimacion propia, no como proyeccion oficial directa.

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

## IGAE/SEPG - BDMACRO, deuda publica historica enlazada

- nombre de la fuente: Base de datos anuales de la economia espanola BDMACRO, abril 2026
- institucion: Secretaria de Estado de Presupuestos y Gastos / IGAE
- URL pagina: https://www.sepg.pap.hacienda.gob.es/sitios/sepg/es-ES/Presupuestos/DocumentacionEstadisticas/Documentacion/paginas/bdmacro.aspx
- URL archivo XLSX: https://www.sepg.pap.hacienda.gob.es/sitios/sepg/es-ES/Presupuestos/DocumentacionEstadisticas/Documentacion/Documents/BASES%20DE%20DATOS/ANUALES%20DE%20LA%20ECONOMIA%20ESPA%C3%91OLA%20BDMACRO/BDMACRO_Abril_2026.xlsx
- fecha de descarga: 2026-05-18
- fecha de actualizacion indicada por la pagina: abril de 2026
- periodo cubierto extraido: 1975-1995
- ambito geografico: Espana
- formato descargado: XLSX
- archivo bruto: `data/raw/igae/bdmacro/2026-05-18_igae-sepg_bdmacro_abril-2026.xlsx`
- archivo procesado: `data/processed/igae/deuda-publica-espana-bdmacro-1975-1995.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones del portal de la Administracion Presupuestaria
- descripcion breve: extracto de la hoja `CUENTA DE LAS AAPP AGREGADAS`, columnas B, BA y BB: PIB a precios corrientes, deuda publica total de las AAPP en el Procedimiento de Deficit Excesivo y deuda publica PDE sobre PIB.
- uso previsto en la web: disponer de una aproximacion historica institucional para el tramo anterior a la serie Eurostat descargada.
- nota de comparabilidad: mantener esta serie separada de Eurostat `gov_10dd_edpt1` hasta documentar una conciliacion metodologica; BDMACRO indica que las series actuales 1995-2025 se enlazan hacia atras con series publicadas para 1954-1994.

## AIReF - Previsiones de deuda publica

- nombre de la fuente: Observatorio Interactivo de Deuda Publica e historico de previsiones de deuda
- institucion: Autoridad Independiente de Responsabilidad Fiscal (AIReF)
- URL pagina: https://www.airef.es/es/sostenibilidad/observatorio-deuda/
- URL historico de previsiones XLSX: https://www.airef.es/wp-content/uploads/2025/03/Historico_Deuda.xlsx
- URL informe presupuestos iniciales AAPP 2026: https://www.airef.es/wp-content/uploads/2026/04/Presupuestos-iniciales-2026/Informe-Presupuestos-Iniciales-2026.pdf
- URL opinion sostenibilidad AAPP largo plazo 2025: https://www.airef.es/wp-content/uploads/2025/03/Opini%C3%B3n_sobre_la_sostenibilidad_de_las_AAPP_largo_plazo/Opinion.pdf
- URL observatorio deuda junio 2025: https://www.airef.es/wp-content/uploads/2025/06/Observatorio-de-deuda/Observatorio.pdf
- fecha de descarga: 2026-05-18
- periodo cubierto extraido en historico: anos objetivo 2014-2029, con publicaciones de AIReF entre 2019-05-01 y 2024-10-01
- prevision puntual mas reciente extraida: 2026, 99,9% del PIB, publicada en el informe de presupuestos iniciales de las AAPP 2026
- proyecciones de largo plazo extraidas: anclas del escenario inercial para 2030, 2040, 2050, 2060 y 2070; ancla del escenario de ajuste fiscal para 2050
- ambito geografico: Espana
- formatos descargados: HTML, XLSX y PDF
- archivos brutos:
  - `data/raw/airef/deuda-publica-previsiones/2026-05-18_airef_pagina-observatorio-deuda.html`
  - `data/raw/airef/deuda-publica-previsiones/2026-05-18_airef_historico-previsiones-deuda.xlsx`
  - `data/raw/airef/deuda-publica-previsiones/2026-05-18_airef_informe-presupuestos-iniciales-aapp-2026.pdf`
  - `data/raw/airef/deuda-publica-previsiones/2026-05-18_airef_opinion-sostenibilidad-aapp-largo-plazo-2025.pdf`
  - `data/raw/airef/deuda-publica-previsiones/2026-05-18_airef_observatorio-deuda-junio-2025.pdf`
- archivos procesados:
  - `data/processed/airef/deuda-publica-previsiones-airef-historico-2014-2029.csv`
  - `data/processed/airef/deuda-publica-prevision-airef-2026.csv`
  - `data/processed/airef/deuda-publica-proyeccion-largo-plazo-airef-2030-2070.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones generales de AIReF
- descripcion breve: historico de previsiones de ratio deuda/PIB de AIReF, prevision puntual vigente para 2026 y anclas de proyecciones de largo plazo hasta 2070.
- uso previsto en la web: mostrar escenarios/previsiones de deuda separados de los datos observados.
- nota metodologica: no mezclar directamente con series observadas; estas filas representan previsiones publicadas en fechas concretas.

## AIReF - Previsiones de gasto de pensiones

- nombre de la fuente: Informe sobre la regla de gasto de pensiones
- institucion: Autoridad Independiente de Responsabilidad Fiscal (AIReF)
- URL pagina: https://www.airef.es/es/centro-documental/informes/informe-sobre-la-regla-de-gasto-de-pensiones/
- URL Excel cuadros y graficos: https://www.airef.es/wp-content/uploads/2025/03/Informe_regla_de_gasto_de_pensiones/Graficos-y-cuadros.-Informe-regla-de-gasto-de-pensiones.xlsx
- URL informe PDF: https://www.airef.es/wp-content/uploads/2025/03/Informe_regla_de_gasto_de_pensiones/Informe.pdf
- fecha de publicacion indicada en la pagina: 2025-03-31
- fecha de descarga: 2026-05-18
- periodo cubierto extraido:
  - gasto en pensiones: 2022-2070
  - numero de pensionistas: 2022-2070
  - fuentes de financiacion del sistema publico de pensiones: 2020-2070
- ambito geografico: Espana
- formatos descargados: HTML, XLSX y PDF
- archivos brutos:
  - `data/raw/airef/pensiones-previsiones/2026-05-18_airef_pagina-informe-regla-gasto-pensiones.html`
  - `data/raw/airef/pensiones-previsiones/2026-05-18_airef_graficos-cuadros-informe-regla-gasto-pensiones.xlsx`
  - `data/raw/airef/pensiones-previsiones/2026-05-18_airef_informe-regla-gasto-pensiones.pdf`
  - `data/raw/airef/pensiones-previsiones/2026-05-18_airef_resumen-ejecutivo-informe-regla-gasto-pensiones.pdf`
- archivos procesados:
  - `data/processed/airef/2026-05-18_airef_prevision-gasto-pensiones-pct-pib_2022-2070.csv`
  - `data/processed/airef/2026-05-18_airef_prevision-pensionistas-millones_2022-2070.csv`
  - `data/processed/airef/2026-05-18_airef_prevision-financiacion-sistema-pensiones-pct-pib_2020-2070.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones generales de AIReF
- descripcion breve: proyecciones de AIReF sobre gasto bruto publico en pensiones como porcentaje del PIB, numero de pensionistas y fuentes de financiacion del sistema publico de pensiones.
- uso previsto en la web: mostrar escenarios futuros de gasto de pensiones y pensionistas, siempre separados de los datos observados.
- nota metodologica: las series son previsiones/escenarios publicados por AIReF; no deben mezclarse con series historicas observadas salvo que se etiqueten como escenario.

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
- archivos procesados derivados:
  - `data/processed/pensiones/2026-05-25_seguridad-social_pensiones-contributivas-observado-modelizado_1975-2070.csv`
  - `data/processed/pensiones/2026-05-25_seguridad-social_pensiones-contributivas-regimen-clase_2026-04.csv`
  - `data/processed/pensiones/2026-05-25_seguridad-social_altas-bajas-pensiones-contributivas_2026-03.csv`
- nota metodologica: la serie anual observada local de numero de pensiones procede de la hoja `Pnes y ptas` y cubre 2006-2026. El tramo 2027-2070 se modeliza con pensionistas AIReF y ratio pensiones/pensionista de abril de 2026; 1975-2005 queda pendiente de Anuarios/eSTADISS.

## Imserso - Evolucion de nominas de PNC y PSPD

- nombre de la fuente: Evolucion de las nominas de las PNC y PSPD
- institucion: Instituto de Mayores y Servicios Sociales (Imserso)
- URL: https://imserso.es/el-imserso/documentacion/estadisticas/pensiones-no-contributivas-jubilacion-invalidez-pnc/historico-informes-publicados-pnc-pspd/evolucion-nominas-pnc-pspd
- fecha de descarga: 2026-05-25
- periodo cubierto por la coleccion: desde 1991; el informe 2019-2025 cubre datos anuales y mensuales del periodo 2019-2025
- ambito geografico: Espana, comunidades autonomas y provincias
- formato descargado: HTML y PDF
- archivos brutos:
  - `data/raw/imserso/pnc/2026-05-25_imserso_pagina-evolucion-nominas-pnc-pspd.html`
  - `data/raw/imserso/pnc/2026-05-25_imserso_evolnom20192025.pdf`
  - `data/raw/imserso/pnc/2026-05-25_imserso_evolnom19912000.pdf`
- archivo procesado: `data/processed/pensiones/2026-05-25_imserso_pensiones-no-contributivas-observado-modelizado_1991-2070.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones generales del Imserso
- descripcion breve: informes oficiales con numero de pensiones no contributivas de jubilacion e invalidez, importes brutos abonados y pension media.
- uso previsto en la web: construir la serie de pensiones no contributivas y su coste bruto, separando observado, pendiente historico y modelo futuro.
- nota metodologica: el CSV actual transcribe el Anexo 7 del informe 2019-2025 para Total Espana y deja 1991-2018 pendiente de extraccion reproducible desde PDFs historicos solapados.

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

## Seguridad Social - Afiliacion media total al sistema

- nombre de la fuente: Serie de afiliacion Media por regimenes 2001 - 2026
- institucion: Seguridad Social
- URL: https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas/EST8/EST10/EST290/EST291
- fecha de descarga: 2026-05-18
- fecha de actualizacion indicada por la pagina: 2026-05-05
- periodo cubierto en bruto: 2001M01-2026M04
- ambito geografico: Espana, sistema de Seguridad Social
- formato descargado: XLSX
- archivos brutos:
  - `data/raw/seguridad-social/afiliacion/2026-05-18_seguridad-social_pagina-afiliados-medios-totales.html`
  - `data/raw/seguridad-social/afiliacion/2026-05-18_seguridad-social_serie-afiliacion-media-regimenes_2001-2026-04.xlsx`
- archivos procesados:
  - `data/processed/seguridad-social/2026-05-18_seguridad-social_afiliacion-media-total-sistema_mensual_2001-2026.csv`
  - `data/processed/seguridad-social/2026-05-18_seguridad-social_afiliacion-media-total-sistema_anual_2001-2026.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones generales del portal de la Seguridad Social
- descripcion breve: afiliaciones medias mensuales en alta laboral por regimenes; se extrae la columna `TOTAL SISTEMA` como aproximacion oficial al numero de trabajadores afiliados/cotizantes al sistema.
- uso previsto en la web: construir la serie de trabajadores que aportan al sistema y calcular ratios como afiliados por pensionista, manteniendo separada la serie observada de previsiones o estimaciones.
- nota metodologica: la fuente mide afiliaciones medias, no personas unicas; una persona con varias altas puede aparecer mas de una vez.

## IGAE/SEPG - BDMACRO, prestaciones sociales de la Seguridad Social

- nombre de la fuente: Series macroeconomicas anuales BDMACRO. Abril 2026
- institucion: Secretaria de Estado de Presupuestos y Gastos; fuente estadistica IGAE para ingresos y gastos de Administraciones Publicas
- URL: https://www.sepg.pap.hacienda.gob.es/sitios/sepg/es-ES/Presupuestos/DocumentacionEstadisticas/Documentacion/paginas/bdmacro.aspx
- fecha de descarga: 2026-05-18
- periodo cubierto en la fuente: 1954-2025 para principales magnitudes; ingresos y gastos de Administraciones Publicas desde 1958 para el sector AAPP agregado y desde 1995 para subsectores
- periodo procesado: 1975-2025
- ambito geografico: Espana
- formato descargado: XLSX y PDF
- archivos brutos:
  - `data/raw/igae-bdmacro/2026-05-18_sepg_bdmacro_pagina.html`
  - `data/raw/igae-bdmacro/2026-05-18_sepg-igae_bdmacro_1954-2025.xlsx`
  - `data/raw/igae-bdmacro/2026-05-18_sepg-igae_bdmacro_nota-explicativa_abril-2026.pdf`
- archivo procesado: `data/processed/igae/2026-05-18_igae-bdmacro_prestaciones-sociales-seguridad-social_1975-2025.csv`
- licencia o condiciones de uso: reutilizacion segun condiciones generales del portal de la Administracion Presupuestaria
- descripcion breve: serie anual de prestaciones sociales del subsector Seguridad Social, con PIB corriente para calcular porcentaje del PIB.
- uso previsto en la web: ofrecer una serie larga desde 1975 como contexto de gasto social de la Seguridad Social.
- nota metodologica: no debe presentarse como serie pura de gasto en pensiones; BDMACRO indica que las prestaciones sociales incluyen pensiones, desempleo y otras prestaciones sociales.
