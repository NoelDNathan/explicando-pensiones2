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
- Descargadas desde el INE las proyecciones de esperanza de vida por edad y sexo, tabla 36775, para 2024-2073.
- Generado un CSV procesado de proyeccion de esperanza de vida al nacimiento para hombres y mujeres, sin calcular "ambos sexos".

## Cambios recientes

- Definido que cada interaccion debe dejar un resumen corto en `ai/history/`.
- Definido que cada interaccion debe actualizar este archivo.
- Definido que debe hacerse commit y push despues de cada interaccion cuando Git este configurado.
- Definida una estructura para guardar datos descargados, procesados y documentacion de fuentes.
- Incorporado primer indicador demografico del INE para contexto de longevidad: esperanza de vida al nacimiento.
- Incorporado indicador fiscal agregado de Eurostat: deuda publica de Espana en millones de euros y porcentaje del PIB.
- Incorporada la serie historica oficial de inflacion interanual mensual del IPC general nacional.
- Incorporada la proyeccion oficial del INE de esperanza de vida al nacimiento para hombres y mujeres hasta 2073.

## Pendiente inmediato

- Inicializar Git o confirmar si ya existe otro repositorio remoto a usar.
- Elegir las primeras metricas: gasto en pensiones, numero de pensionistas, pension media, afiliados, ratio afiliados/pensionista, deficit o transferencias del Estado.
- Decidir si la web mostrara solo ambos sexos o tambien la brecha hombres/mujeres en esperanza de vida.
- Revisar periodicamente Eurostat para posibles revisiones de la serie de deuda publica, especialmente el dato de 2025.
- Decidir como se mostrara la inflacion en la web: grafico mensual completo, medias anuales, o ambas.
- Definir como diferenciar visualmente datos observados y proyecciones en los graficos.

## Nota operativa

En este momento no se ha podido hacer commit ni push porque esta carpeta no es todavia un repositorio Git.
