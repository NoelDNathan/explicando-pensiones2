# Estado actual

Fecha: 2026-05-18

## Situacion

Se ha iniciado la estructura documental para coordinar agentes IA en el proyecto de una web sobre pensiones en Espana.

## Hecho

- Creado `AGENTS.md` con reglas de trabajo para agentes.
- Creado este archivo `ai/current.md` como estado vivo del proyecto.
- Creado historial inicial en `ai/history/`.
- Creada guia de datos en `data/README.md`.
- Creado indice inicial de fuentes en `data/sources.md`.
- Descargada desde el INE la serie nacional de esperanza de vida al nacimiento por sexo, 1975-2024.
- Guardado el JSON bruto en `data/raw/ine/indicadores-demograficos-basicos/`.
- Generado un CSV limpio en `data/processed/ine/esperanza-vida-nacimiento-espana-1975-2024.csv`.
- Registrada la fuente en `data/sources.md`.
- Descargada desde Eurostat la serie anual de deuda bruta consolidada de las Administraciones Publicas de Espana, 1995-2025.
- Guardados los JSON brutos en `data/raw/eurostat/deuda-publica/`.
- Generado el CSV limpio `data/processed/eurostat/deuda-publica-espana-1995-2025.csv`.
- Documentada la transformacion en `data/methodology/transformations.md`.
- Descargadas desde el INE dos series nacionales de IPC:
  - tasa de variacion del indice general nacional, tabla 76134;
  - indice general nacional, tabla 24077.
- Generado un CSV procesado con la inflacion interanual mensual util para graficos, de 1962M01 a 2026M04.
- Documentada la transformacion del IPC en `data/methodology/transformations.md`.
- Descargada desde IGAE/SEPG la base BDMACRO de abril de 2026.
- Extraida la serie historica de deuda publica total de las AAPP, 1975-1995, desde la hoja `CUENTA DE LAS AAPP AGREGADAS`.
- Generado el CSV `data/processed/igae/deuda-publica-espana-bdmacro-1975-1995.csv`.
- Extraida desde BDMACRO la serie de prestaciones sociales del subsector Seguridad Social, 1975-2025.
- Generado el CSV `data/processed/igae/2026-05-18_igae-bdmacro_prestaciones-sociales-seguridad-social_1975-2025.csv`.
- Descargadas desde el INE las proyecciones de esperanza de vida por edad y sexo, tabla 36775, para 2024-2073.
- Generado un CSV procesado de proyeccion de esperanza de vida al nacimiento para hombres y mujeres, sin calcular "ambos sexos".
- Descargado desde AIReF el historico de previsiones de deuda publica del Observatorio de Deuda.
- Generado el CSV `data/processed/airef/deuda-publica-previsiones-airef-historico-2014-2029.csv`.
- Descargado el informe de AIReF sobre presupuestos iniciales de las AAPP 2026.
- Generado el CSV `data/processed/airef/deuda-publica-prevision-airef-2026.csv` con la prevision puntual de deuda 2026.
- Descargado desde AIReF el informe sobre la regla de gasto de pensiones, junto con el Excel de cuadros y graficos.
- Generados tres CSV de previsiones de pensiones: gasto en pensiones como porcentaje del PIB 2022-2070, numero de pensionistas 2022-2070 y fuentes de financiacion del sistema publico de pensiones 2020-2070.
- Descargadas desde AIReF la Opinion sobre sostenibilidad de las AAPP a largo plazo 2025 y el Observatorio de Deuda de junio de 2025.
- Generado el CSV `data/processed/airef/deuda-publica-proyeccion-largo-plazo-airef-2030-2070.csv` con anclas de deuda a largo plazo por escenario.

## Cambios recientes

- Definido que cada interaccion debe dejar un resumen corto en `ai/history/`.
- Definido que cada interaccion debe actualizar este archivo.
- Definido que debe hacerse commit y push despues de cada interaccion cuando Git este configurado.
- Definida una estructura para guardar datos descargados, procesados y documentacion de fuentes.
- Incorporado primer indicador demografico del INE para contexto de longevidad: esperanza de vida al nacimiento.
- Incorporado indicador fiscal agregado de Eurostat: deuda publica de Espana en millones de euros y porcentaje del PIB.
- Incorporada la serie historica oficial de inflacion interanual mensual del IPC general nacional.
- Incorporada una serie historica BDMACRO para deuda publica 1975-1995, marcada como separada de Eurostat hasta conciliacion metodologica.
- Incorporada una serie larga BDMACRO 1975-2025 de prestaciones sociales de la Seguridad Social como contexto de gasto; queda marcada como no equivalente a gasto puro en pensiones.
- Incorporada la proyeccion oficial del INE de esperanza de vida al nacimiento para hombres y mujeres hasta 2073.
- Incorporadas previsiones de deuda publica de AIReF, separadas de los datos observados.
- Incorporadas previsiones de pensiones de AIReF hasta 2070, separadas de los datos observados.
- Incorporadas anclas de proyeccion de deuda publica de AIReF hasta 2070: escenario inercial y escenario de ajuste fiscal.

## Pendiente inmediato

- Inicializar Git o confirmar si ya existe otro repositorio remoto a usar.
- Buscar una fuente tabular institucional que separe pensiones de otras prestaciones sociales antes de 1995; si no existe, explicar la discontinuidad entre la serie larga BDMACRO y la serie presupuestaria de Seguridad Social 1995-2025P.
- Elegir las siguientes metricas: numero de pensionistas, pension media, afiliados, ratio afiliados/pensionista, deficit o transferencias del Estado.
- Decidir si la web mostrara solo ambos sexos o tambien la brecha hombres/mujeres en esperanza de vida.
- Revisar periodicamente Eurostat para posibles revisiones de la serie de deuda publica, especialmente el dato de 2025.
- Decidir como se mostrara la inflacion en la web: grafico mensual completo, medias anuales, o ambas.
- Conciliar o explicar explicitamente el enlace entre BDMACRO 1975-1995 y Eurostat 1995-2025 antes de mostrar una serie continua de deuda publica.
- Definir como diferenciar visualmente datos observados y proyecciones en los graficos.
- Decidir como mostrar las previsiones de deuda: ultima prevision vigente, abanico historico de previsiones o comparacion entre organismos.
- Decidir si las previsiones de pensiones se mostraran como escenario AIReF principal, comparativa con Informe de Envejecimiento 2024, o ambas.
- Si se quiere una curva anual de deuda 2030-2070, buscar datos tabulares de AIReF o digitalizar la fuente con una metodologia documentada; no interpolar automaticamente.

## Nota operativa

Git esta configurado con remoto `origin`. Cuando el entorno marque el repositorio como propiedad dudosa, se usa `git -c safe.directory="C:/Users/Noel Nathan/Programacion/Projectos/explicando-pensiones2"` para inspeccionar, commitear y publicar.
