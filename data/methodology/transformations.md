# Transformaciones de datos

## Series fiscales solicitadas 1975-2070

- Fecha de transformacion: 2026-05-25.
- Script reproducible: `scripts/process-fiscal-series-1975-2070.ps1`.
- Fuentes brutas:
  - `data/raw/igae/bdmacro/2026-05-18_igae-sepg_bdmacro_abril-2026.xlsx`.
  - `data/raw/igae/cofog/2026-05-18_igae_cofog-aapp-serie-1995-2024.xlsx`.
  - `data/raw/comision-europea/ageing-report-2024/2026-05-25_ec_2024-ageing-report_statistical-annex-country-fiches.xlsx`.
- Fuentes procesadas reutilizadas:
  - `data/processed/igae/2026-05-18_igae_cofog-aproximacion-pensiones-vejez-supervivientes-aapp_1995-2024.csv`.
  - `data/processed/eurostat/deuda-publica-espana-1995-2025.csv`.
  - `data/processed/airef/2026-05-18_airef_prevision-gasto-pensiones-pct-pib_2022-2070.csv`.
  - `data/processed/airef/deuda-publica-prevision-airef-2026.csv`.
  - `data/processed/airef/deuda-publica-proyeccion-largo-plazo-airef-2030-2070.csv`.
- Transformacion aplicada:
  - extraccion desde BDMACRO, hoja `CUENTA DE LAS AAPP AGREGADAS`, de PIB, empleos no financieros de AAPP, intereses + otras rentas, capacidad/necesidad de financiacion, deuda PDE y prestaciones sociales de AAPP para 1975-2024;
  - calculo de porcentajes sobre PIB para gasto publico total, intereses + otras rentas y prestaciones sociales agregadas;
  - extraccion desde COFOG de la division `07 Salud`, fila `GASTO TOTAL`, para 1995-2024;
  - extraccion desde el Ageing Report 2024 de las hojas `ESb` y `ESc` para pensiones publicas brutas, gasto sanitario publico y coste total del envejecimiento, baseline, 2022-2070;
  - incorporacion de la deuda observada Eurostat para 2025, al no estar completo 2025 en la hoja BDMACRO usada;
  - construccion de un CSV maestro en formato largo para 1975-2070 y siete variables solicitadas;
  - marcado explicito de huecos como `no_estimado`, sin ceros ficticios ni interpolaciones.
- Archivos generados:
  - `data/processed/igae/2026-05-25_igae-bdmacro_aapp-principales-series-fiscales-espana_1975-2024.csv`.
  - `data/processed/igae/2026-05-25_igae-cofog_gasto-salud-aapp-espana_1995-2024.csv`.
  - `data/processed/comision-europea/2026-05-25_ec-ageing-report_espana-pensiones-sanidad-coste-envejecimiento_2022-2070.csv`.
  - `data/processed/fiscal/2026-05-25_series-fiscales-espana_1975-2070.csv`.
- Periodo resultante del maestro: 1975-2070, 672 filas: 96 anos por 7 variables.
- Cobertura principal:
  - PIB, gasto publico total, intereses y saldo publico: observado 1975-2024; 2025-2070 no estimado.
  - deuda publica total: observado 1975-2025; 2026 y anclas 2030/2040/2050/2060/2070 como escenario AIReF; anos intermedios no estimados.
  - gasto en pensiones: 1995-2024 como aproximacion COFOG `10.2 Vejez + 10.3 Supervivientes`; 2025-2070 como escenario AIReF; 1975-1994 no estimado.
  - gasto en sanidad: 1995-2024 observado COFOG `07 Salud`; 2025-2070 proyectado Ageing Report; 1975-1994 no estimado.
- Notas de definicion:
  - `intereses_deuda` usa la columna BDMACRO `Intereses + Otras rentas de la propiedad`, no D.41 puro.
  - `deficit_saldo_publico` usa capacidad/necesidad de financiacion: negativo = deficit.
  - las proyecciones no contienen importes en millones de euros cuando la fuente solo publica porcentaje del PIB.

## IGAE/SEPG - BDMACRO, salario medio macro 1970-2070

- Fecha de transformacion: 2026-05-25.
- Script reproducible: `scripts/process-igae-bdmacro-salario-medio.ps1`.
- Fuente bruta: `data/raw/igae/bdmacro/2026-05-18_igae-sepg_bdmacro_abril-2026.xlsx`.
- Hoja utilizada: `Remuneracion Asalariados`.
- Columnas utilizadas:
  - `A`: ano.
  - `U`: Salario Medio (SM), definido en el libro como remuneracion de asalariados / asalariados.
- Transformacion aplicada:
  - lectura directa del XLSX BDMACRO mediante el XML interno del libro;
  - extraccion de los anos 1970-2024 con valor publicado en la columna `U`;
  - generacion de filas 2025-2070 sin valor numerico, marcadas como `no_estimado`;
  - exportacion a CSV con punto decimal, unidad y nota de trazabilidad por fila.
- Archivo generado: `data/processed/igae/2026-05-25_igae-bdmacro_salario-medio-espana_1970-2070.csv`.
- Periodo resultante: 101 filas, 55 observadas (1970-2024) y 46 no estimadas (2025-2070).
- Nota de definicion: esta serie es una medida macro de salario medio, no una encuesta de salario bruto anual. Para uso editorial debe nombrarse como "salario medio macro" o explicarse la formula.
- Nota de proyeccion: no se ha localizado una proyeccion oficial/institucional permitida para salario medio 2025-2070; no se inventa, interpola ni extrapola.

## INE - tasa bruta de natalidad observada y proyectada 1975-2070

- Fecha de transformacion: 2026-05-24.
- Fuentes brutas:
  - `data/raw/ine/indicadores-demograficos-basicos/2026-05-24_ine_idb_tasa-bruta-natalidad-total-nacional_1975-2024.json`.
  - `data/raw/ine/proyecciones-poblacion/natalidad/2026-05-24_ine_proyecciones-poblacion_tasa-bruta-natalidad-total-nacional_2024-2073.json`.
- Tablas API INE:
  - observada: `DATOS_TABLA/1381`, Indicadores Demograficos Basicos, tasa bruta de natalidad.
  - proyectada: `DATOS_TABLA/36653`, Proyecciones de poblacion, tasa bruta de natalidad a largo plazo.
- Transformacion aplicada:
  - lectura de ambos JSON oficiales con codificacion UTF-8;
  - extraccion de ano, ambito geografico, indicador, valor, estado del dato, tipo de dato INE, fuente y URL API;
  - orden ascendente por ano;
  - exportacion de un CSV observado 1975-2024;
  - exportacion de un CSV proyectado principal 2025-2070;
  - exportacion de un CSV combinado 1975-2070 con columna `estado_dato`.
- Archivos generados:
  - `data/processed/ine/2026-05-24_ine_idb_tasa-bruta-natalidad-espana-observada_1975-2024.csv`.
  - `data/processed/ine/2026-05-24_ine_proyeccion-tasa-bruta-natalidad-espana_2025-2070.csv`.
  - `data/processed/ine/2026-05-24_ine_tasa-bruta-natalidad-espana-observada-proyectada_1975-2070.csv`.
- Periodos resultantes:
  - observada: 1975-2024, 50 observaciones.
  - proyectada principal: 2025-2070, 46 observaciones.
  - combinada: 1975-2070, 96 observaciones.
- Nota de definicion: la tabla 36653 descargada incluye 2024 proyectado. Para evitar tratar 2024 observado y 2024 proyectado como equivalentes, el CSV proyectado principal empieza en 2025 y el CSV combinado conserva 2024 solo como observado.

## INE - fecundidad, maternidad, mortalidad, nacimientos y defunciones 1975-2070

- Fecha de transformacion: 2026-05-24.
- Script reproducible: `scripts/process-ine-demografia-1975-2070.ps1`.
- Fuentes brutas observadas:
  - IDB tabla 1407, indicador coyuntural de fecundidad.
  - IDB tabla 48879, edad media a la maternidad por orden del nacimiento.
  - IDB tabla 1411, tasa bruta de mortalidad.
  - MNP tabla 6506, nacimientos por residencia de la madre y sexo.
  - MNP tabla 6545, defunciones por residencia y sexo.
- Fuentes brutas proyectadas:
  - Proyecciones de poblacion tabla 36655, indicador coyuntural de fecundidad.
  - Proyecciones de poblacion tabla 36656, edad media a la maternidad.
  - Proyecciones de poblacion tabla 36657, tasa bruta de mortalidad.
  - Proyecciones de poblacion tabla 36644, nacimientos por sexo y generacion de la madre.
  - Proyecciones de poblacion tabla 36646, defunciones por sexo y generacion.
- Transformacion aplicada:
  - descarga de JSON oficiales con `tip=AM`;
  - filtrado a `Total Nacional`;
  - para nacimientos y defunciones, filtrado a sexo `Total` y generacion total en proyecciones;
  - para fecundidad y edad media a la maternidad, filtrado a `Ambas nacionalidades`;
  - para edad media a la maternidad observada, conservacion de `Todos` y `Primero` en `orden_nacimiento`;
  - recorte de observados a 1975-2024 y de proyecciones a 2025-2070;
  - generacion de CSV separados observado/proyectado y CSV combinados con columna `estado_dato`;
  - normalizacion a punto decimal, codificacion UTF-8 y recalculo de checksums.
- Archivos combinados generados:
  - `data/processed/ine/2026-05-24_ine_indicador-coyuntural-fecundidad-espana-observado-proyectado_1975-2070.csv`.
  - `data/processed/ine/2026-05-24_ine_edad-media-maternidad-espana-observada-proyectada_1975-2070.csv`.
  - `data/processed/ine/2026-05-24_ine_tasa-bruta-mortalidad-espana-observada-proyectada_1975-2070.csv`.
  - `data/processed/ine/2026-05-24_ine_nacimientos-espana-observados-proyectados_1975-2070.csv`.
  - `data/processed/ine/2026-05-24_ine_defunciones-espana-observadas-proyectadas_1975-2070.csv`.
- Periodos resultantes:
  - indicador coyuntural de fecundidad: 96 observaciones, 1975-2070.
  - tasa bruta de mortalidad: 96 observaciones, 1975-2070.
  - nacimientos: 96 observaciones, 1975-2070.
  - defunciones: 96 observaciones, 1975-2070.
  - edad media a la maternidad: 146 observaciones; `Todos` cubre 1975-2070 y `Primero` cubre 1975-2024.
- Nota de definicion: no se estima la edad media al primer hijo para 2025-2070 porque la proyeccion oficial del INE localizada no publica esa dimension por orden de nacimiento.
- Nota de solape: las tablas proyectadas incluyen 2024; los CSV combinados empiezan la proyeccion en 2025 para conservar 2024 como observado.

## INE - esperanza de vida al nacimiento combinada por sexo 1975-2070

- Fecha de transformacion: 2026-05-24.
- Script reproducible: `scripts/process-ine-demografia-1975-2070.ps1`.
- Fuentes procesadas de partida:
  - `data/processed/ine/esperanza-vida-nacimiento-espana-1975-2024.csv`.
  - `data/processed/ine/2026-05-18_ine_proyeccion-esperanza-vida-nacimiento-espana_2024-2073.csv`.
- Transformacion aplicada:
  - filtrado a hombres y mujeres para mantener continuidad con la proyeccion;
  - recorte de proyecciones a 2025-2070;
  - union con columna `estado_dato`;
  - normalizacion del decimal observado a punto.
- Archivo generado:
  - `data/processed/ine/2026-05-24_ine_esperanza-vida-nacimiento-sexo-espana-observada-proyectada_1975-2070.csv`.
- Periodo resultante: 1975-2070, 192 observaciones: hombres y mujeres, observado 1975-2024 y proyectado 2025-2070.
- Nota de definicion: no se calcula la categoria `Ambos sexos` para la proyeccion porque la tabla 36775 no la publica.

## INE - esperanza de vida restante a edades de jubilacion 1975-2070

- Fecha de transformacion: 2026-05-25.
- Script reproducible: `scripts/process-ine-esperanza-vida-jubilacion-1975-2070.ps1`.
- Fuentes procesadas:
  - INE Tablas de Mortalidad, tabla API 27150, 1975-1990.
  - INE Tablas de Mortalidad, tabla API 27153, 1991-2024.
  - INE Proyecciones de Poblacion 2024-2074, tabla API 36775, bruto 2024-2073.
- Transformacion aplicada:
  - filtrado a la funcion `Esperanza de vida`;
  - filtrado a edades simples 65, 66 y 67 anos;
  - filtrado a hombres y mujeres para mantener continuidad con la proyeccion;
  - recorte del tramo observado a 1975-2024;
  - recorte de la proyeccion a 2025-2070 para no duplicar el ano 2024;
  - union con columna `estado_dato`.
- Archivos generados:
  - `data/processed/ine/2026-05-25_ine_tm_esperanza-vida-restante-65-66-67-sexo-espana-observada_1975-2024.csv`.
  - `data/processed/ine/2026-05-25_ine_proyeccion-esperanza-vida-restante-65-66-67-sexo-espana_2025-2070.csv`.
  - `data/processed/ine/2026-05-25_ine_esperanza-vida-restante-65-66-67-sexo-espana-observada-proyectada_1975-2070.csv`.
- Periodo resultante: 1975-2070, 576 observaciones: 96 anos por 3 edades de referencia por 2 sexos.
- Nota de definicion: esta serie mide anos medios restantes al alcanzar 65, 66 o 67 anos. No calcula una edad legal dinamica de jubilacion ni `Ambos sexos` proyectado.

## IGAE - COFOG, detalle de proteccion social 1995-2024

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: `data/raw/igae/cofog/2026-05-18_igae_cofog-aapp-serie-1995-2024.xlsx`.
- Hojas utilizadas: hojas anuales `1995` a `2024`.
- Filas utilizadas: `GASTO TOTAL`.
- Columnas utilizadas:
  - `10.1` a `10.9`: grupos COFOG de segundo nivel dentro de Proteccion social.
  - `Total 10`: total de Proteccion social.
  - total general de Administraciones Publicas del mismo ano para porcentajes sobre gasto total.
- Transformacion aplicada:
  - extraccion de gasto nominal en millones de euros corrientes;
  - calculo de porcentaje sobre gasto publico total;
  - calculo de porcentaje sobre el total de Proteccion social;
  - calculo de euros reales de 2024 con el indice general nacional del IPC del INE;
  - calculo de euros reales per capita con poblacion residente total del INE a 1 de enero;
  - generacion de una aproximacion separada a pensiones como `10.2 Vejez + 10.3 Supervivientes`.
- Archivos generados:
  - `data/processed/igae/2026-05-18_igae_cofog-proteccion-social-detalle-aapp_1995-2024.csv`.
  - `data/processed/igae/2026-05-18_igae_cofog-aproximacion-pensiones-vejez-supervivientes-aapp_1995-2024.csv`.
- Nota sobre IPC: para 1995-2001 se reconstruye el indice mensual hacia atras desde los niveles disponibles desde 2002 usando la tasa de variacion interanual mensual publicada por el INE.
- Nota de definicion: la aproximacion `10.2 + 10.3` no equivale exactamente a una serie presupuestaria de pensiones contributivas. Debe etiquetarse como aproximacion COFOG de vejez y supervivencia.

## Eurostat - deuda publica de Espana

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: `gov_10dd_edpt1`, Espana (`geo=ES`), Administraciones Publicas (`sector=S13`), deuda bruta consolidada (`na_item=GD`).
- Unidades descargadas:
  - `MIO_EUR`: millones de euros.
  - `PC_GDP`: porcentaje del PIB.
- Transformacion aplicada:
  - extraccion de la dimension anual disponible en Eurostat;
  - union por ano de las dos unidades descargadas;
  - calculo propio de `debt_billion_eur` como `debt_million_eur / 1000`;
  - exportacion a CSV con punto decimal.
- Periodo resultante: 1995-2025.
- Nota: los datos de 2025 proceden de la publicacion de Eurostat disponible el 2026-04-22 y deben revisarse si Eurostat publica revisiones posteriores.

## IGAE/SEPG - BDMACRO, deuda publica historica 1975-1995

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: Excel `BDMACRO_Abril_2026.xlsx`.
- Hoja utilizada: `CUENTA DE LAS AAPP AGREGADAS`.
- Columnas utilizadas:
  - `A`: ano.
  - `B`: Producto Interior Bruto a precios corrientes.
  - `BA`: Deuda publica total de las AAPP, Procedimiento de Deficit Excesivo, Banco de Espana.
  - `BB`: Deuda publica PDE / PIB.
- Transformacion aplicada:
  - extraccion de los anos 1975-1995;
  - conservacion del PIB, deuda en millones de euros y porcentaje sobre PIB;
  - calculo propio de `debt_billion_eur` como `debt_million_eur / 1000`;
  - exportacion a CSV con punto decimal.
- Periodo resultante: 1975-1995.
- Nota de comparabilidad: esta serie procede de BDMACRO y debe mantenerse separada de Eurostat `gov_10dd_edpt1` hasta documentar una conciliacion metodologica. El tramo 1975-1994 es una serie historica enlazada hacia atras por BDMACRO.

## AIReF - historico de previsiones de deuda publica

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: Excel `Historico_Deuda.xlsx`.
- Hoja utilizada: `Historico_Deuda_PIB`.
- Estructura original:
  - columnas: fecha de publicacion e informe de AIReF;
  - filas: ano objetivo;
  - celdas: ratio de deuda sobre PIB (%).
- Transformacion aplicada:
  - conversion de fechas Excel a formato ISO `yyyy-mm-dd`;
  - transformacion de matriz ancha a formato largo;
  - eliminacion de celdas vacias o con guion;
  - exportacion a CSV con punto decimal.
- Periodo resultante: anos objetivo 2014-2029, con publicaciones de 2019-05-01 a 2024-10-01.
- Nota: el archivo contiene previsiones y valores historicos usados en cada publicacion; cada fila debe interpretarse en el contexto de su fecha de publicacion.

## AIReF - prevision vigente de deuda 2026

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: PDF `Informe-Presupuestos-Iniciales-2026.pdf`.
- Valor extraido: deuda publica en 2026 del 99,9% del PIB.
- Transformacion aplicada: registro manual de la prevision puntual publicada por AIReF en un CSV separado.
- Nota: mantener separada del historico observado y del historico de previsiones, porque representa una publicacion posterior.

## AIReF - proyecciones de deuda publica a largo plazo

- Fecha de transformacion: 2026-05-18.
- Fuentes brutas:
  - PDF `Opinion.pdf`, Opinion sobre la sostenibilidad de las AAPP a largo plazo 2025.
  - PDF `Observatorio.pdf`, Observatorio de Deuda de junio de 2025.
- Valores extraidos:
  - escenario inercial AIReF: 2030 = 97% del PIB, 2040 = 104%, 2050 = 129%, 2060 = 157%, 2070 = 181%;
  - escenario de ajuste fiscal AIReF: 2050 = 62% del PIB.
- Transformacion aplicada:
  - registro de anclas de largo plazo publicadas explicitamente por AIReF;
  - separacion por escenario;
  - exportacion a CSV con punto decimal.
- Nota: no se ha interpolado una serie anual. El CSV solo contiene anclas publicadas y debe representarse como puntos/escenarios, no como datos observados.

## INE - inflacion interanual mensual del IPC

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: INE, tabla 76134, `data/raw/ine/2026-05-18_ine_ipc-tasa-variacion-indice-general-nacional.csv`.
- Archivo generado: `data/processed/ine/2026-05-18_ine_ipc_inflacion-interanual-mensual_1962-2026.csv`.
- Transformacion aplicada:
  - filtrado de filas con `Tipo de dato = Variación anual`;
  - descarte de registros sin valor en `Total`, correspondientes al ano 1961 en la descarga actual;
  - ordenacion ascendente por `Periodo`;
  - creacion de la columna `fecha` con el primer dia del mes;
  - conversion del separador decimal de coma a punto en `inflacion_interanual_pct`;
  - conservacion de ambito, fuente y URL para trazabilidad.
- Periodo resultante: 1962M01-2026M04.
- Resultado: 772 observaciones mensuales de inflacion interanual del IPC general nacional.

## INE - proyeccion de poblacion residente por sexo y edad 2024-2074

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: INE, tabla 36643, `data/raw/ine/proyecciones-poblacion/poblacion-residente/2026-05-18_ine_proyecciones-poblacion_poblacion-residente-sexo-edad_2024-2074.json`.
- Archivo generado: `data/processed/ine/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv`.
- Transformacion aplicada:
  - lectura del JSON de la API del INE;
  - extraccion de ano, ambito geografico, sexo, edad, valor, naturaleza, escenario y tipo de dato;
  - conservacion de edades simples y de la categoria agregada "Todas las edades";
  - redondeo del valor de poblacion a personas enteras, sin agregaciones propias;
  - exportacion a CSV con punto decimal y codificacion UTF-8.
- Periodo resultante: 2024-2074.
- Resultado: 15.606 observaciones, correspondientes a 306 series por 51 anos.
- Nota de definicion: los valores son proyecciones de poblacion residente a 1 de enero y deben representarse separados de datos observados.

## INE - poblacion residente observada por sexo y edad 1975-2025

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: INE, tabla 56934, `data/raw/ine/estadistica-continua-poblacion/poblacion-residente/2026-05-18_ine_ecp_poblacion-residente-sexo-edad_1971-2025.json`.
- Archivos generados:
  - `data/processed/ine/2026-05-18_ine_ecp_poblacion-residente-espana-sexo-edad_1975-2025.csv`.
  - `data/processed/ine/2026-05-18_ine_ecp_piramide-poblacion-espana-sexo-edad_1975-2025.csv`.
- Transformacion aplicada:
  - lectura del JSON de la API del INE con codificacion UTF-8;
  - extraccion de fecha, ano, periodo INE, ambito geografico, sexo, edad, valor, naturaleza del dato, concepto y tipo de dato;
  - filtrado del periodo desde 1975, aunque el bruto conserva datos desde 1971;
  - creacion de `edad_num` a partir de la etiqueta publicada por el INE y marcado de edades abiertas en `edad_grupo_abierto`;
  - exportacion de un CSV normalizado completo con todas las fechas disponibles desde 1975;
  - exportacion de un CSV especifico para piramides con solo datos a 1 de enero, hombres y mujeres, excluyendo la categoria "Todas las edades", descartando edades simples con valor cero y evitando categorias abiertas solapadas cuando el INE publica mas detalle de edades avanzadas.
- Periodo resultante:
  - CSV normalizado: 1975-2025, 34.032 observaciones.
  - CSV para piramides: 1975-2025, 10.252 observaciones.
- Nota de definicion: es una serie observada de poblacion residente. Debe mantenerse separada de la proyeccion INE 2024-2074.
- Nota tecnica: el numero de edades publicadas cambia en la serie historica; el tramo antiguo agrupa edades superiores antes que el tramo reciente. Para el CSV de piramides se conserva la edad abierta compatible con el maximo detalle disponible en cada fecha y sexo. No se desagregan edades abiertas ni se interpolan valores.

## INE - poblacion residente por sexo, grupo de edad y lugar de nacimiento 2002-2025

- Fecha de transformacion: 2026-05-24.
- Fuente bruta: INE, tabla 56937, `data/raw/ine/estadistica-continua-poblacion/poblacion-nacimiento/2026-05-24_ine_ecp_poblacion-residente-sexo-grupo-edad-pais-nacimiento_2002-2025.json`.
- Archivos generados:
  - `data/processed/ine/2026-05-24_ine_ecp_poblacion-residente-espana-sexo-grupo-edad-nacimiento_2002-2025.csv`.
  - `data/processed/ine/2026-05-24_ine_poblacion-residente-nacimiento-cobertura-interpolacion_1975-2070.csv`.
- Transformacion aplicada al CSV observado:
  - lectura del JSON de la API del INE con codificacion UTF-8;
  - extraccion de fecha, ano, periodo INE, ambito geografico, sexo, grupo de edad, lugar de nacimiento, valor, naturaleza del dato, concepto y tipo de dato;
  - filtrado a `Total Nacional` y a las categorias de nacimiento `Total`, `Espana` y `Extranjero`;
  - normalizacion de grupos quinquenales en `edad_desde`, `edad_hasta` y `edad_grupo_abierto`;
  - redondeo del valor de poblacion a personas enteras, sin agregaciones propias;
  - exportacion a CSV con codificacion UTF-8.
- Transformacion aplicada a la tabla de cobertura:
  - registro manual de tramos 1975-2070 con estado de disponibilidad;
  - separacion entre puntos censales observados, tramo ECP observado, tramos pendientes de interpolar y proyecciones no cruzadas;
  - inclusion de URL oficiales de INE para anclas censales, ECP y proyecciones.
- Periodo resultante:
  - CSV observado: 2002-2025, 9.900 observaciones.
  - tabla de cobertura: 1975-2070, 7 tramos metodologicos.
- Nota de definicion: el CSV observado permite diferenciar poblacion nacida en Espana y nacida en el extranjero por sexo y grupo de edad desde 2002. No se han creado interpolaciones numericas para 1975-2001 ni una matriz proyectada nacimiento + sexo + edad para 2026-2070.

## INE - modelo de cohortes para poblacion por nacimiento 2026-2070

- Fecha de transformacion: 2026-05-25.
- Script: `scripts/process-ine-migrant-cohort-model-2026-2070.ps1`.
- Fuentes brutas oficiales:
  - stock observado inicial 2025: `data/processed/ine/2026-05-24_ine_ecp_poblacion-residente-espana-sexo-grupo-edad-nacimiento_2002-2025.csv`;
  - poblacion proyectada por lugar de nacimiento: tabla INE 36642;
  - poblacion proyectada por sexo y edad: tabla INE 36643;
  - defunciones proyectadas por sexo y edad: tabla INE 36647;
  - inmigraciones procedentes del extranjero por sexo y edad: tabla INE 36649;
  - emigraciones con destino al extranjero por sexo y edad: tabla INE 36651.
- Transformacion aplicada:
  - se toma como ancla el stock observado de nacidos en el extranjero a 1 de enero de 2025 por sexo y grupo quinquenal de edad;
  - cada ano se envejece el stock en grupos quinquenales moviendo una quinta parte del grupo al siguiente tramo;
  - se aplica mortalidad usando la tasa media de defunciones proyectadas de toda la poblacion por sexo y grupo de edad;
  - se resta una salida estimada de nacidos en el extranjero aplicando a la emigracion proyectada por sexo y edad la cuota de nacidos en el extranjero del grupo;
  - se suman inmigraciones procedentes del extranjero por sexo y edad como perfil de entrada;
  - el resultado se calibra cada ano al total oficial INE de poblacion nacida en el extranjero de la tabla 36642;
  - la poblacion nacida en Espana se calcula como poblacion total proyectada por sexo y edad menos nacidos en el extranjero modelizados.
- Archivo generado: `data/processed/ine/2026-05-25_ine_modelo-cohortes-poblacion-nacimiento-sexo-grupo-edad_2026-2070.csv`.
- Periodo resultante: 2026-2070, 3.420 observaciones.
- Nota de definicion: el resultado es una estimacion propia, no una tabla oficial del INE. Los flujos migratorios son entradas/salidas anuales, no stock residente acumulado. El modelo usa lugar de nacimiento, no nacionalidad, y no incorpora nacionalizaciones porque estas no cambian el lugar de nacimiento.

## IGAE/SEPG - BDMACRO, prestaciones sociales de la Seguridad Social 1975-2025

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: `data/raw/igae-bdmacro/2026-05-18_sepg-igae_bdmacro_1954-2025.xlsx`.
- Hoja utilizada: `CTAS. DE LA SEGURIDAD SOCIAL`.
- Columnas utilizadas:
  - `A`: ano.
  - `B`: Producto Interior Bruto a precios corrientes, millones de euros.
  - `R`: prestaciones sociales del subsector Seguridad Social, millones de euros.
- Transformacion aplicada:
  - extraccion de los anos 1975-2025;
  - conservacion de PIB y prestaciones sociales en millones de euros;
  - calculo propio de `social_benefits_social_security_pct_gdp` como prestaciones sociales / PIB * 100;
  - exportacion a CSV con punto decimal.
- Archivo generado: `data/processed/igae/2026-05-18_igae-bdmacro_prestaciones-sociales-seguridad-social_1975-2025.csv`.
- Periodo resultante: 1975-2025.
- Nota de definicion: esta serie no es una serie pura de gasto en pensiones. BDMACRO define prestaciones sociales como prestaciones sociales en especie adquiridas en el mercado mas prestaciones sociales distintas de transferencias en especie; incluye pensiones, desempleo y otras prestaciones sociales.

## AIReF - previsiones de pensiones 2020-2070

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: `data/raw/airef/pensiones-previsiones/2026-05-18_airef_graficos-cuadros-informe-regla-gasto-pensiones.xlsx`.
- Hojas utilizadas:
  - `Grafico 3`: evolucion del gasto en pensiones (% PIB), 2022-2070.
  - `Grafico 6`: numero de pensionistas (millones), 2022-2070.
  - `Grafico RE_2.1`: fuentes de financiacion del sistema publico de pensiones (% PIB), 2020-2070.
- Transformacion aplicada:
  - lectura de las series anuales publicadas por AIReF en el Excel de cuadros y graficos;
  - conversion de tablas en formato ancho a CSV en formato largo;
  - conservacion del nombre del escenario o rubrica publicado;
  - exportacion a CSV con punto decimal.
- Archivos generados:
  - `data/processed/airef/2026-05-18_airef_prevision-gasto-pensiones-pct-pib_2022-2070.csv`
  - `data/processed/airef/2026-05-18_airef_prevision-pensionistas-millones_2022-2070.csv`
  - `data/processed/airef/2026-05-18_airef_prevision-financiacion-sistema-pensiones-pct-pib_2020-2070.csv`
- Periodos resultantes:
  - gasto en pensiones: 2022-2070.
  - pensionistas: 2022-2070.
  - financiacion: 2020-2070.
- Nota de definicion: estas filas son previsiones o escenarios publicados por AIReF en marzo de 2025. Deben mostrarse separadas de los datos observados y con etiqueta de fuente/escenario.

## Seguridad Social - afiliacion media total al sistema 2001-2026

- Fecha de transformacion: 2026-05-18.
- Fuente bruta: `data/raw/seguridad-social/afiliacion/2026-05-18_seguridad-social_serie-afiliacion-media-regimenes_2001-2026-04.xlsx`.
- Hoja utilizada: primera hoja del libro, `Datos totales de afiliados Medios en alta por Regimenes`.
- Columnas utilizadas:
  - `A`: periodo mensual.
  - `N`: total sistema.
- Transformacion aplicada:
  - extraccion de las filas mensuales desde enero de 2001 hasta abril de 2026;
  - conversion del periodo textual a fecha ISO con el primer dia del mes;
  - conservacion de la afiliacion media mensual total del sistema;
  - calculo de una media anual simple de los meses disponibles en la fuente;
  - marcado de 2026 como ano parcial porque solo contiene enero-abril en la descarga actual;
  - exportacion a CSV con punto decimal.
- Archivos generados:
  - `data/processed/seguridad-social/2026-05-18_seguridad-social_afiliacion-media-total-sistema_mensual_2001-2026.csv`.
  - `data/processed/seguridad-social/2026-05-18_seguridad-social_afiliacion-media-total-sistema_anual_2001-2026.csv`.
- Periodo resultante:
  - mensual: 2001M01-2026M04.
  - anual: 2001-2026, con 2026 parcial.
- Nota de definicion: la afiliacion media mide afiliaciones en alta laboral, no necesariamente personas unicas. Debe presentarse como "afiliaciones medias" o explicarse si se usa como aproximacion al numero de trabajadores cotizantes.

## Seguridad Social / INE - pensionistas-personas 1975-2070

- Fecha de transformacion: 2026-05-25.
- Script reproducible: `scripts/process-seguridad-social-pensionistas-1975-2070.ps1`.
- Fuente bruta observada: `data/raw/seguridad-social/pensiones/2026-05-18_seguridad-social_libro-evolucion-mensual-pensiones_2026-04.xlsx`.
- Hoja observada utilizada: `Pnes y ptas`.
- Columnas observadas utilizadas:
  - `A`: ano.
  - `B`: mes.
  - `C`: pensionistas, personas.
  - `D`: pensiones, conservada solo como comprobacion conceptual en la fuente, no usada para estimar personas.
- Fuente auxiliar para el tramo futuro: `data/processed/ine/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv`, derivada de INE Proyecciones de poblacion tabla 36643.
- Transformacion aplicada:
  - extraccion directa de `PENSIONISTAS` como personas, no pensiones;
  - seleccion de diciembre para 2006-2025 y abril para 2026, ultimo mes disponible en el libro bruto local;
  - creacion de filas 1975-2005 con `estado_dato = no_estimado`, sin usar pensiones como proxy;
  - agregacion de poblacion proyectada INE de 67 anos o mas para 2026-2070;
  - calculo del ratio ancla `pensionistas oficiales abril 2026 / poblacion INE 67+ en 2026`;
  - modelizacion 2027-2070 como `ratio ancla * poblacion INE 67+ del ano`;
  - exportacion de tres CSV: observado, modelizado y combinado.
- Archivos generados:
  - `data/processed/seguridad-social/2026-05-25_seguridad-social_pensionistas-personas-observado_2006-2026.csv`.
  - `data/processed/seguridad-social/2026-05-25_modelo-demografico_pensionistas-personas_2027-2070.csv`.
  - `data/processed/seguridad-social/2026-05-25_seguridad-social-pensionistas-personas-observado-modelizado_1975-2070.csv`.
- Periodo resultante:
  - observado: 2006-2026.
  - modelizado: 2027-2070.
  - cobertura combinada: 1975-2070.
- Nota de definicion: la serie observada mide personas pensionistas. Una persona con varias pensiones cuenta una vez. El tramo 2027-2070 es una proxy demografica propia calibrada al ultimo dato oficial, no una prevision oficial; no modela carreras de cotizacion, jubilacion anticipada/demorada, pensionistas menores de 67 por clase de pension, mortalidad diferencial ni cambios normativos futuros.
