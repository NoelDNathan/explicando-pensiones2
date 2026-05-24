# Estado actual

Fecha: 2026-05-24

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
- Descargada desde el INE la tasa bruta de natalidad observada, tabla 1381, para Total Nacional 1975-2024.
- Descargada desde el INE la tasa bruta de natalidad proyectada, tabla 36653, para Total Nacional 2024-2073.
- Generados tres CSV de natalidad: observado 1975-2024, proyectado 2025-2070 y combinado 1975-2070 con columna `estado_dato`.
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

- Respondida consulta sobre "Gasto publico en pensiones": el proyecto contiene previsiones AIReF de gasto bruto publico en pensiones como % del PIB, una aproximacion COFOG observada `10.2 Vejez + 10.3 Supervivientes`, una serie BDMACRO de prestaciones sociales de Seguridad Social y brutos pendientes de Seguridad Social; no hay aun una serie observada procesada estricta de gasto publico en pensiones.

- Rediseñado `TimeSeriesChart` al estilo editorial oscuro institucional (imagen de referencia): fondo navy `--color-surface-deep`, paleta de colores para fondo oscuro (teal, rojo, ámbar, púrpura), cabecera de dos filas (título + icono ⓘ / badge año; leyenda con swatches cuadrados), etiquetas de unidad horizontales sobre el eje (no rotadas), sistema de tokens CSS (`--tsc-*`) para soportar variantes `light` y `dark`, badge de proyección configurable, eliminación del relleno de zona de proyección. El componente mantiene compatibilidad total con la API anterior; la variante por defecto pasa a ser `dark`.
- Creado canvas `institutional-time-series-chart.canvas.tsx` en la carpeta gestionada por el IDE (`.cursor/projects/.../canvases/`). Implementa un grafico temporal de lineas multiples premium con: curvas suave Catmull-Rom, doble eje vertical (izquierdo/derecho), zonas de proyeccion con tramado y lineas discontinuas, marcadores de hito con etiquetas, leyenda horizontal automatica, tooltip interactivo al hover, paleta cromatica del SDK de cursor/canvas, y arquitectura completamente reutilizable con el tipo `Dataset`. El canvas usa datos de demostracion del sistema publico de pensiones de Espana (AIReF, IGAE BDMACRO, Seguridad Social). No se ha modificado ningun archivo del repositorio git.



- Descargadas y procesadas desde fuentes oficiales INE nuevas series demograficas nacionales para 1975-2070:
  - indicador coyuntural de fecundidad, observado 1975-2024 y proyectado 2025-2070;
  - edad media a la maternidad, observada 1975-2024 y proyectada 2025-2070;
  - edad media a la maternidad al primer hijo, observada 1975-2024 sin proyeccion oficial localizada;
  - tasa bruta de mortalidad, observada 1975-2024 y proyectada 2025-2070;
  - nacimientos y defunciones anuales, observados 1975-2024 y proyectados 2025-2070;
  - esperanza de vida al nacimiento por sexo, combinada 1975-2070 desde series ya existentes.
- Creado el script reproducible `scripts/process-ine-demografia-1975-2070.ps1` para descargar JSON del API INE, generar CSVs separados y combinados, y recalcular `data/checksums.sha256`.
- Actualizados `data/sources.md`, `data/inventory.md`, `data/metadata.md` y `data/methodology/transformations.md` con fuentes, transformaciones, limitaciones y notas de comparabilidad de las nuevas series.
- Documentado que los CSV combinados empiezan las proyecciones en 2025 para no duplicar el ano 2024, que aparece como observado y tambien existe en los brutos proyectados.
- Anadido el JSON `data/processed/boe/2026-05-24_boe_edad-minima-legal-trabajar-espana_antes-1976-2026.json` con la edad minima legal general para trabajar en Espana por periodos normativos: hasta 1976, 1976-1980 y 1980-actualidad (2026).
- Documentada la fuente BOE en `data/sources.md`, el inventario en `data/inventory.md` y la ficha de metadata en `data/metadata.md`.
- El tramo anterior a 1976 queda marcado como resumen historico con cautela, porque la normativa previa era heterogenea y puede requerir comprobacion por sector o regimen.
- Anadida en `AGENTS.md` una regla para considerar Tailwind cuando haya mas UI repetida, siempre configurado con tokens propios del proyecto y evitando colores sueltos como `bg-blue-500`.
- Anadida en `AGENTS.md` una seccion de reglas de diseno frontend para mantener colores/tokens coherentes, crear componentes reutilizables, probar variantes en `/componentes`, cuidar accesibilidad y comprobar escritorio/movil.
- Creada una primera base web en React/Vite para el proyecto.
- Sustituida la plantilla inicial por una portada minima de `Explicando pensiones`.
- Creada la ruta interna `/componentes` como laboratorio visual no orientado al usuario final.
- Creado el primer componente de interfaz, `PlayButton`, con variantes de tamano, variante solida o ligera, y estado deshabilitado.
- Verificado el frontend con `tsc --noEmit` y `vite build`; `pnpm` y `npm` no estan disponibles como comandos directos en el entorno, pero los binarios locales de `node_modules` si permiten la verificacion.
- Iniciado un servidor local de Vite en `http://127.0.0.1:5173/componentes` para revisar la pagina de componentes.
- Anadida la checklist de metadata como regla formal en `AGENTS.md`.
- Creado `data/metadata.md` con ficha de metadata para los datasets inventariados: fuente, institucion, URL de referencia, fecha de descarga, periodo, unidad, licencia, metodologia, estado del dato, transformaciones, archivos verificables y notas de ruptura o comparabilidad.
- Generado `data/checksums.sha256` con hashes SHA-256 de los archivos en `data/raw/` y `data/processed/`.
- Descargadas y procesadas las fuentes oficiales INE de tasa bruta de natalidad: tabla 1381 observada 1975-2024 y tabla 36653 proyectada. El CSV proyectado principal empieza en 2025 y el combinado conserva 2024 solo como observado para no mezclar dato observado y proyeccion.
- Respondida consulta sobre metadata de datasets: el proyecto guarda parte de la trazabilidad en `data/sources.md`, `data/inventory.md` y `data/methodology/transformations.md`, pero no existe aun una plantilla obligatoria completa con checksums, estado del dato y rupturas metodologicas por dataset.
- Localizadas fuentes INE candidatas para poblacion por edad, sexo y pais/lugar de nacimiento: la ECP ofrece tabla 56937 por pais de nacimiento, grupo quinquenal de edad, sexo y fecha desde 2002, y tabla 69795 con agrupaciones de paises hasta 2026. La tabla 56937 ya esta incorporada como dataset observado desde 2002.
- Respondida consulta sobre disponibilidad de datos de poblacion por edad, sexo y lugar de nacimiento: el proyecto ya contiene poblacion por edad y sexo, observada y proyectada, pero no lugar/pais de nacimiento.
- Creado `data/inventory.md` con una tabla ordenada de los datos recogidos hasta ahora, agrupando juntas las series que representan el mismo valor y separando observados, proyecciones, previsiones y aproximaciones metodologicas.
- Respondida consulta de alcance sobre disponibilidad de datos de evolucion del gasto publico por apartados: el proyecto contiene datos oficiales parciales, pero aun no una serie procesada de gasto publico total por funciones o politicas.
- Respondida consulta sobre tasa de natalidad: no hay dataset registrado ni procesado en `data/inventory.md`, `data/sources.md` ni en los archivos actuales; si se usa, debe incorporarse desde fuente oficial y con metadata completa.
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
- Incorporado Tailwind CSS v4 con tokens propios del proyecto definidos via `@theme` en `src/index.css`. Los primeros tokens cubren superficies oscuras (`--color-surface-deep`, `--color-text-inverted`, etc.), eje sobre oscuro, franja de edad de trabajar y paleta de la piramide poblacional con variantes activa/apagada por categoria.
- Creado el componente `PopulationPyramid` (`src/components/PopulationPyramid.tsx`) en SVG reutilizable y responsive, con datos de ejemplo internos. Diferencia visualmente los grupos en edad de trabajar (tono mas saturado) y fuera de ella (tono mas apagado), conserva la base cromatica por sexo y nacionalidad, e incluye franja de resalte de edad laboral, lineas de limite min/max continuas (64 en borde superior del grupo 60-64, 20 en borde inferior del grupo 20-24) con los numeros a la derecha de las lineas, ejes invertidos para hombres, leyenda y etiquetas de edad en el eje central (prop `ageLabels`: `'all'`, `'decade'` o `false`).
- Anadida al laboratorio `/componentes` la seccion `Componente 02 - Piramide poblacional` con marco de previsualizacion oscuro (`.component-preview--dark`).
- Creado el componente `InfoButton` (`src/components/InfoButton.tsx`) con variantes `on-dark` (tokens de la piramide) y `on-light` (paleta editorial), popover accesible y tamanos `sm`/`md`.
- Anadida al laboratorio `/componentes` la seccion `Componente 03 - Boton de informacion`.
- Descargada desde el INE la tabla 56937 de poblacion residente por fecha, sexo, grupo de edad y pais de nacimiento.
- Generado el CSV observado `data/processed/ine/2026-05-24_ine_ecp_poblacion-residente-espana-sexo-grupo-edad-nacimiento_2002-2025.csv`, filtrado a Total, nacidos en Espana y nacidos en el extranjero.
- Generada la tabla metodologica `data/processed/ine/2026-05-24_ine_poblacion-residente-nacimiento-cobertura-interpolacion_1975-2070.csv` con tramos observados, anclas censales y tramos pendientes de interpolacion o no cruzados.
- Actualizadas fuentes, inventario, metadata y transformaciones para el nuevo dataset de poblacion por nacimiento.

## Pendiente inmediato

- Si la web usa el JSON de edad minima legal para calculos o filtros, decidir si el tramo anterior a 1976 se presenta como referencia general o si se investiga una fuente juridica primaria mas completa por regimen laboral.
- Aplicar las nuevas reglas frontend al reorganizar componentes: separar componentes reutilizables, mantener tokens compartidos y evitar estilos duplicados en paginas finales.
- Extraer `PlayButton` a un modulo propio cuando se incorporen mas componentes y decidir la estructura definitiva de `src/components/`.
- Conectar `PopulationPyramid` con datos reales del INE cuando se decida la primera vista publica, usando la tabla 56937 si se quiere diferenciar nacidos en Espana y nacidos en el extranjero desde 2002.
- Ampliar `/componentes` con los siguientes elementos de interfaz: tarjetas de indicadores, etiquetas de fuente, avisos metodologicos y controles de grafico (el boton de informacion ya cubre parte de las notas contextuales).
- Integrar `InfoButton` en cabeceras de graficos como la piramide poblacional cuando se definan los textos metodologicos finales.
- Mantener `data/metadata.md` y `data/checksums.sha256` actualizados cuando se incorporen o procesen nuevas series.
- Mantener `data/inventory.md` actualizado cuando se incorporen o procesen nuevas series.
- Usar la nueva serie de tasa bruta de natalidad solo con etiqueta de `estado_dato`: observado 1975-2024 y proyectado 2025-2070. Si se necesita mostrar 2024 proyectado, tomarlo del JSON bruto de tabla 36653 y etiquetarlo explicitamente como proyectado.
- Si se necesita edad media al primer hijo despues de 2024, localizar una fuente oficial adicional o documentar una metodologia de estimacion; por ahora no se ha generado ninguna proyeccion propia.
- Decidir que series demograficas nuevas se conectaran primero a la web y como se diferenciara visualmente observado/proyectado.
- Si se necesita analizar inmigracion o poblacion nacida fuera de Espana antes de 2002, extraer anclas censales 1981 y 1991 y documentar cualquier interpolacion como estimada, no observada.
- Para 2026-2070 por pais/lugar de nacimiento, no hay una tabla oficial cruzada nacimiento + sexo + edad localizada; usar 36642 y 36643 solo como fuentes separadas salvo que se defina una metodologia explicita de modelizacion.
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
