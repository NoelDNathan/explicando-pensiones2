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
- Descargada desde Seguridad Social la serie de afiliacion media por regimenes 2001-2026, actualizada a abril de 2026.
- Generados dos CSV procesados con la afiliacion media total del sistema: serie mensual 2001M01-2026M04 y media anual 2001-2026, con 2026 marcado como ano parcial.
- Descargadas desde AIReF la Opinion sobre sostenibilidad de las AAPP a largo plazo 2025 y el Observatorio de Deuda de junio de 2025.
- Generado el CSV `data/processed/airef/deuda-publica-proyeccion-largo-plazo-airef-2030-2070.csv` con anclas de deuda a largo plazo por escenario.
- Descargada desde el INE la proyeccion de poblacion residente a 1 de enero por sexo y edad, tabla 36643, para 2024-2074.
- Generado el CSV `data/processed/ine/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv`, conservando edades simples y la categoria "Todas las edades".
- Descargada desde el INE la poblacion residente observada por fecha, sexo y edad, tabla 56934, con fuente bruta desde 1971.
- Generados dos CSV procesados para 1975-2025: uno normalizado con todas las fechas disponibles y otro anual a 1 de enero preparado para piramides de poblacion por sexo y edad.
- Localizada y descargada la serie oficial IGAE COFOG de gasto del sector Administraciones Publicas (S.13) por funciones desde 1995 hasta 2024.
- Documentada una metodologia inicial para generar cuatro vistas del gasto por funciones: nominal, real, porcentaje sobre total y per capita real.
- Procesado el detalle COFOG de `10 Proteccion social` para 1995-2024, con grupos `10.1` a `10.9`, total de proteccion social y cuatro metricas: nominal, real 2024, porcentaje y per capita real.
- Generada una serie separada de aproximacion COFOG a pensiones como `10.2 Vejez + 10.3 Supervivientes`, con advertencia metodologica.
- Verificado que no hay una continuacion oficial 1975-1994 con la misma metodologia y granularidad COFOG; BDMACRO sirve para contexto macro anterior, pero no como extension directa del detalle COFOG de proteccion social.
- Creado un diseno de pruebas en Figma para explorar una primera estructura visual de la web: https://www.figma.com/design/3QoTZ12u9h5Y48jw8cCTdZ.

## Cambios recientes

- Respondida consulta sobre metadata de datasets: el proyecto guarda parte de la trazabilidad en `data/sources.md`, `data/inventory.md` y `data/methodology/transformations.md`, pero no existe aun una plantilla obligatoria completa con checksums, estado del dato y rupturas metodologicas por dataset.
- Localizadas fuentes INE candidatas para poblacion por edad, sexo y pais/lugar de nacimiento: la ECP ofrece tabla 56937 por pais de nacimiento, grupo quinquenal de edad, sexo y fecha desde 2002, y tabla 69795 con agrupaciones de paises hasta 2026; no se ha incorporado aun al repositorio.
- Respondida consulta sobre disponibilidad de datos de poblacion por edad, sexo y lugar de nacimiento: el proyecto ya contiene poblacion por edad y sexo, observada y proyectada, pero no lugar/pais de nacimiento.
- Creado `data/inventory.md` con una tabla ordenada de los datos recogidos hasta ahora, agrupando juntas las series que representan el mismo valor y separando observados, proyecciones, previsiones y aproximaciones metodologicas.
- Respondida consulta de alcance sobre disponibilidad de datos de evolucion del gasto publico por apartados: el proyecto contiene datos oficiales parciales, pero aun no una serie procesada de gasto publico total por funciones o politicas.
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
- Incorporada la serie observada de afiliaciones medias totales a la Seguridad Social como aproximacion al numero de trabajadores cotizantes/aportantes al sistema.
- Incorporadas anclas de proyeccion de deuda publica de AIReF hasta 2070: escenario inercial y escenario de ajuste fiscal.
- Incorporada la proyeccion oficial del INE de poblacion residente por sexo y edad hasta 2074, util para construir graficos de poblacion total, poblacion en edad de trabajar y poblacion mayor, siempre separada de datos observados.
- Incorporada la serie observada del INE de poblacion residente por sexo y edad desde 1975 hasta 2025, util para construir la evolucion historica de piramides de poblacion.
- Creado en Figma un prototipo visual de pruebas con cabecera, hero, tarjetas de indicadores, modulo de grafico y panel metodologico. No incorpora datos numericos nuevos; usa placeholders visuales y textos de estructura.

## Pendiente inmediato

- Decidir si la checklist de metadata de datasets se convierte en regla formal del proyecto; si se aprueba, incorporarla a `AGENTS.md` y crear una plantilla por dataset con fuente, institucion, URL, fecha de descarga, periodo, unidad, licencia, metodologia, estado del dato, transformaciones, checksums y notas de ruptura metodologica.
- Mantener `data/inventory.md` actualizado cuando se incorporen o procesen nuevas series.
- Si se necesita analizar inmigracion o poblacion nacida fuera de Espana, localizar una fuente oficial del INE que cruce edad, sexo y lugar/pais de nacimiento, y mantenerla separada de las series actuales de poblacion residente por edad y sexo.
- Para 1975-2050 por pais/lugar de nacimiento, asumir de partida tres tramos separados: observado general 1975-2001 sin pais de nacimiento en la serie ya usada; observado por pais/grupo de nacimiento desde 2002 en ECP; proyeccion futura solo si se localiza tabla INE especifica con Espana/extranjero o pais de nacimiento, evitando interpolar o reconstruir paises sin fuente oficial.
- Localizar y procesar una fuente oficial/institucional para gasto publico total por grandes funciones o politicas, idealmente COFOG/IGAE/Eurostat, que permita separar pensiones, intereses de deuda, sanidad, educacion y otras areas con trazabilidad anual.
- Inicializar Git o confirmar si ya existe otro repositorio remoto a usar.
- Buscar una fuente tabular institucional que separe pensiones de otras prestaciones sociales antes de 1995; si no existe, explicar la discontinuidad entre la serie larga BDMACRO y la serie presupuestaria de Seguridad Social 1995-2025P.
- Elegir las siguientes metricas: numero de pensionistas, pension media, ratio afiliados/pensionista, deficit o transferencias del Estado.
- Documentar en la narrativa que afiliacion media no equivale estrictamente a personas unicas, porque mide afiliaciones en alta laboral.
- Para previsiones futuras de trabajadores/cotizantes, no usar una serie inventada ni interpolada: ya existe una proyeccion oficial INE de poblacion por edad que puede servir como proxy demografico separado; si se necesita empleo/cotizantes proyectados, localizar una fuente institucional especifica o documentar claramente la proxy.
- Decidir si la web mostrara solo ambos sexos o tambien la brecha hombres/mujeres en esperanza de vida.
- Revisar periodicamente Eurostat para posibles revisiones de la serie de deuda publica, especialmente el dato de 2025.
- Decidir como se mostrara la inflacion en la web: grafico mensual completo, medias anuales, o ambas.
- Conciliar o explicar explicitamente el enlace entre BDMACRO 1975-1995 y Eurostat 1995-2025 antes de mostrar una serie continua de deuda publica.
- Definir como diferenciar visualmente datos observados y proyecciones en los graficos.
- Construir el componente/grafico de piramide poblacional usando el CSV observado anual y, si procede, enlazarlo visualmente con la proyeccion INE manteniendo etiquetas separadas.
- Decidir como mostrar las previsiones de deuda: ultima prevision vigente, abanico historico de previsiones o comparacion entre organismos.
- Decidir si las previsiones de pensiones se mostraran como escenario AIReF principal, comparativa con Informe de Envejecimiento 2024, o ambas.
- Si se quiere una curva anual de deuda 2030-2070, buscar datos tabulares de AIReF o digitalizar la fuente con una metodologia documentada; no interpolar automaticamente.
- Procesar el XLSX COFOG de IGAE a un CSV largo de divisiones de primer nivel y validar los totales.
- Decidir si la web usara la aproximacion COFOG `10.2 + 10.3` para una vista de pensiones o si se priorizara una serie presupuestaria estricta de Seguridad Social.
- Si se muestra un tramo anterior a 1995, hacerlo como contexto separado y con ruptura metodologica explicita, no como continuidad COFOG.
- Revisar el diseno de pruebas en Figma y decidir si se convierte en base de implementacion web.

## Nota operativa

Git esta configurado con remoto `origin`. Cuando el entorno marque el repositorio como propiedad dudosa, se usa `git -c safe.directory="C:/Users/Noel Nathan/Programacion/Projectos/explicando-pensiones2"` para inspeccionar, commitear y publicar.
