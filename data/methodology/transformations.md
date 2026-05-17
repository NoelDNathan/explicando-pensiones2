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
