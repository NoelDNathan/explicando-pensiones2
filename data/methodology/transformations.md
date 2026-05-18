# Transformaciones de datos

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
