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
