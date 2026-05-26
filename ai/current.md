# Estado actual

Fecha: 2026-05-27

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

- Aclarada cobertura temporal util para tasa de paro EPA. Para serie trimestral digital/homogenea: 1976T3-2026T1, segun ultimo dato INE localizado. Para medias anuales completas calculadas a partir de cuatro trimestres: 1977-2025. Los anos 1976 y 2026 quedan parciales con los datos disponibles actualmente; 1975 existe dentro de la EPA trimestral historica, pero no como tramo online homogeneo y debe tratarse aparte si se extrae de publicaciones oficiales en papel.

- Localizado y procesado un paquete oficial INE sobre salario medio bruto por nacionalidad. Se creo `scripts/process-ine-eaes-salario-nacionalidad-2023.ps1`, se descargaron las tablas EAES 28190 y 28202 desde el API del INE y se generaron dos CSV 2023: `data/processed/ine/2026-05-27_ine_eaes_salario-medio-nacionalidad-areas_2023.csv` y `data/processed/ine/2026-05-27_ine_eaes_salario-medio-nacionalidad-ccaa_2023.csv`. La tabla 28190 incluye Total Nacional por sexo y nacionalidad/area: Total, Espanola, UE27 sin Espana, resto de Europa, Africa, America y Otros paises. La tabla 28202 incluye comunidades autonomas por sexo y nacionalidad total/espanola/extranjera. Limitacion: no se ha localizado en tablas agregadas un desglose por pais individual; la variable es nacionalidad, no lugar de nacimiento ni condicion migratoria. Actualizados fuentes, inventario, metadata, metodologia y checksums.

- Incorporada la proyeccion del Ageing Report 2024 para tasa de reemplazo de jubilacion en Espana. Se creo `scripts/process-ageing-report-replacement-rate.ps1`, que extrae del XLSX oficial ya descargado la hoja `ESb`, fila 24, `Gross replacement rate at retirement (earnings-related public pensions)`, y genera `data/processed/comision-europea/2026-05-27_ec-ageing-report_espana-tasa-reemplazo-jubilacion_2022-2070.csv`. Actualizados `data/sources.md`, `data/inventory.md`, `data/metadata.md`, `data/methodology/transformations.md` y `data/checksums.sha256`. Cautela: es proyeccion baseline, no historico observado, y debe mantenerse separada de cualquier reconstruccion historica.

- Localizadas fuentes oficiales para tasa de paro en Espana. Fuente primaria recomendada: INE, Encuesta de Poblacion Activa (EPA), resultados nacionales de tasa de paro, con serie digital desde 1976T3 y datos actuales en INEbase/CONSUL. El INE documenta que la EPA se publica desde 1964 y es trimestral desde 1975, pero tambien que desde 1964 hasta 1976T2 solo hay datos publicados en papel y que las bases online difunden series trimestrales desde 1976T3. Criterio recomendado: usar INE EPA desde 1976T3 como serie trazable digital; si se necesita 1975, extraerlo de publicacion oficial en papel y marcarlo como tramo historico no homogeneo/no enlazado automaticamente. Eurostat puede servir como fuente armonizada/comparativa, no como fuente principal para reconstruir 1975.

- Respondida consulta sobre disponibilidad de tasa de paro. Revision de `data/inventory.md`, `data/metadata.md`, `data/sources.md`, `data/methodology/transformations.md`, scripts, `src` y nombres de archivos: el proyecto no contiene actualmente una serie procesada/documentada de tasa de paro. Hay menciones laterales a desempleo dentro de la definicion de prestaciones sociales BDMACRO y una referencia a EPA como posible fuente salarial, pero no un dataset de paro usable editorialmente. Si se necesita, incorporar INE EPA u otra fuente oficial/institucional con metadata completa.

- Respondida consulta sobre fuentes para tasa de reemplazo de jubilacion 1975-2070. Fuente recomendada para proyeccion: 2024 Ageing Report, Country Fiche Spain, tabla 13, `Public scheme: old-age earnings related (RR)`, que define la tasa como pension inicial media de nuevos pensionistas sobre salario final medio antes de la jubilacion. Para historico 1975-actualidad no se ha localizado una tabla oficial publica continua con esa definicion exacta; las fuentes candidatas son Seguridad Social/MITES para pension media de altas iniciales de jubilacion y MCVL/INE EES/EPA para salarios cercanos a jubilacion, con cautela metodologica.

- Respondida consulta sobre disponibilidad de salario medio de inmigrantes. Revision de inventario, fuentes, metadata y CSV procesados: el proyecto contiene `data/processed/igae/2026-05-25_igae-bdmacro_salario-medio-espana_1970-2070.csv`, una serie de salario medio macro total de Espana, pero no una serie salarial desagregada para inmigrantes, extranjeros o nacidos en el extranjero. Tambien existe poblacion por lugar de nacimiento, pero no debe combinarse con salario total para inferir salarios de inmigrantes sin fuente salarial especifica.

- Anadida vista colectiva al dashboard de gasto sanitario. Se creo `scripts/process-health-collective-age-profile-2022.ps1`, que multiplica el gasto anual per capita estimado por categoria y edad por la poblacion residente media trimestral INE 2022. Genera dos CSV en `data/processed/ministerio-sanidad/` para detalle por edad y bandas de dashboard. La interfaz permite alternar entre vista individual y vista colectiva desde la cabecera y la barra lateral; en vista colectiva las barras, ranking y KPIs muestran gasto anual estimado del sistema. Verificacion: `tsc --noEmit` correcto.

- Anadido tooltip al grafico de barras apiladas de gasto sanitario por categoria. Al pasar el mouse por cada segmento se muestra una tarjeta flotante con banda de edad, importe en euros y porcentaje dentro de la categoria, usando el mismo valor que dibuja Recharts. Archivos modificados: `src/components/StackedBarChart.tsx` y `src/components/StackedBarChart.css`. Verificacion: `tsc --noEmit` correcto, `vite build` correcto con aviso de chunk grande ya conocido y `/gasto-sanitario` devuelve HTTP 200.

- Corregida la curva de consumo sanitario acumulado para que el punto de "total esperado" corresponda al final de la vida y no a una edad intermedia. Se ajusto `LifetimeAreaChart` para usar linea lineal entre puntos derivados del CSV, eje Y ajustado al maximo real y marcador en edad 100. Tambien se corrigio `scripts/process-airef-health-age-profile-2022.ps1` para que el tramo abierto `95 y mas` use anos-persona de la tabla de mortalidad INE en lugar de quedar a cero. El total vital esperado de ambos sexos pasa de 172.838 a 174.183 euros. Se regeneraron los CSV AIReF/INE y el desglose estimado por categorias. Verificacion: `tsc --noEmit` correcto y `vite build` correcto con aviso de chunk grande ya conocido.

- Construida y conectada una estimacion documentada de gasto sanitario vital por categoria y edad para 2022. Se descargaron PDFs oficiales del Ministerio de Sanidad (EGSP principales resultados e IGTGS 2005), se creo `scripts/process-health-category-age-profile-2022.ps1` y se generaron dos CSV en `data/processed/ministerio-sanidad/`: detalle categoria x grupo de edad y bandas de dashboard. La vista `/gasto-sanitario` consume ahora categorias estimadas: hospitalaria/especializada, atencion primaria como proxy ambulatoria, farmacia, protesis/traslados y salud publica/colectivos/capital. Urgencias y salud mental quedan excluidas como categorias separadas por falta de cruce institucional compatible. Verificacion: `tsc --noEmit` correcto, `vite build` correcto con aviso de chunk grande ya conocido, `/gasto-sanitario` devuelve HTTP 200.

- Conectado `HealthExpenditureDashboard` a los CSV procesados de gasto sanitario por edad. `src/data/healthExpenditureData.ts` importa los CSV de AIReF/INE con `?raw`, normaliza las bandas de edad, calcula la curva acumulada, KPIs, interpretaciones y ranking desde datos trazables. La vista principal muestra ahora `Total sanidad` por bandas de edad, no categorias inventadas, porque no hay cruce completo categoria sanitaria x edad x sexo localizado. Ajustados `StackedBarChart` y `LifetimeAreaChart`; el total esperado queda recalculado en 174.183 euros tras incorporar el tramo abierto 95+. Verificacion: `tsc --noEmit` correcto, `vite build` correcto con aviso de chunk grande ya conocido, `/gasto-sanitario` devuelve HTTP 200. Revision visual con Playwright no completada porque `playwright` no esta instalado en el proyecto y el browser MCP no aparecio disponible.

- Refinado el dashboard `HealthExpenditureDashboard` al diseno de referencia "El gasto sanitario a lo largo de la vida": sidebar, header con selector de ano, grid 3 columnas, graficos Recharts, iconos Lucide, interpretacion con checks verdes, ranking, 5 KPIs y footer. Nuevos componentes `StackedBarChart`, `LifetimeAreaChart`, `InterpretationCard`, `RankingCard`, `KpiCard`; dataset demo en `src/data/healthExpenditureData.ts`. Ruta `/gasto-sanitario` y preview en `/componentes` (Componente 08). Reutiliza `InfoButton`, `DashboardPanel`, `MetricCard`, `InfoBanner`, `FooterNote`, `Sidebar`, `DashboardHeader`, `ToolbarChip`. Verificacion: `tsc --noEmit` y `vite build` correctos.

- Ampliada la cobertura observada de pensiones contributivas hasta 1980-2026. Se incorporo 1980 desde INEbase Historia / Anuario Estadistico de Espana 1982 como suma controlada de los regimenes con total impreso en la tabla de pensiones en vigor a 31 de diciembre, y 1981-1985 desde MITES Principales Series mediante consulta WebFOCUS oficial para `PENSIONES`, clase TOTAL, regimen TOTAL y mes diciembre. El CSV `data/processed/pensiones/2026-05-25_seguridad-social_pensiones-contributivas-observado-modelizado_1975-2070.csv` queda con 1975-1979 como `no_estimado`, 1980-2026 observado y 2027-2070 modelizado. Cautela: 1980-1985 son cortes de diciembre, no medias anuales como 1986-2005.

- Procesado un primer paquete trazable para gasto sanitario por edad en Espana con ano base 2022. Se descargaron desde AIReF el PDF y Excel del Documento tecnico de sanidad, educacion y cuidados 2025, se extrajo el perfil de gasto sanitario publico per capita por grupos de edad y sexo, y se genero `data/processed/airef/2026-05-25_airef_perfil-gasto-sanitario-edad-sexo-percapita_2022.csv`. Ademas, se combino ese perfil con la poblacion estacionaria de las Tablas de Mortalidad INE 2022 para calcular una vista derivada de gasto sanitario vital esperado: `data/processed/airef/2026-05-25_airef_ine_gasto-sanitario-vital-esperado-edad-sexo_2022.csv` y su version agregada por bandas de dashboard. Cautela: AIReF no publica en ese Excel un cruce completo categoria sanitaria x edad x sexo, asi que no se deben construir barras apiladas por hospitalaria/primaria/farmacia/etc. como dato trazable hasta localizar otra fuente.

- Avanzada la busqueda alternativa para pensiones contributivas 1975-2000. Se localizaron y descargaron tablas oficiales de INEbase Historia / Anuario Estadistico de Espana en `data/raw/inebase-historia/pensiones-contributivas/`. Se incorporo al CSV maestro el tramo observado 1986-2000 como media anual en miles de pensiones, convertida a pensiones: 1986-1994 desde INEbase Historia y 1995-2000 desde Anuarios INE 1999/2004. El hueco real baja de 1975-2000 a 1975-1985. Quedan como candidatos pendientes, no usados editorialmente todavia, PDFs de 1976-1979 y 1981-1982 porque publican cortes a 31 de diciembre con estructura antigua por regimen/ramas y requieren extraccion/validacion separada antes de mezclarse con medias anuales.

- Anadida en `AGENTS.md` una regla metodologica especifica para inflacion/precios futuros: IPC observado del INE para historico, Banco de Espana o AIReF para corto plazo y HICP del Ageing Report/Comision Europea solo como supuesto macro de largo plazo. La regla exige etiquetar cada tramo con indicador, fuente, horizonte, `estado_dato` y ruptura metodologica, y evita llamar "inflacion INE" a supuestos HICP futuros.

- Respondida consulta sobre que fuente usar para estimaciones futuras de inflacion/precios. Recomendacion: no buscar una fuente unica 1975-2070; usar IPC observado INE para historico, previsiones Banco de Espana o AIReF para corto plazo y HICP del Ageing Report solo como supuesto macro de largo plazo para escenarios, con ruptura metodologica y etiqueta separada. Si se genera un dataset 1975-2070, debe distinguir `IPC observado`, `prevision macro corto plazo` y `supuesto HICP largo plazo`.

- Respondida consulta sobre si el supuesto HICP 2025-2070 del Ageing Report puede usarse como inflacion. Criterio recomendado: no usarlo como continuidad directa del IPC observado del INE ni llamarlo "inflacion INE"; si se usa, debe aparecer como supuesto macro de precios de la Comision Europea/Ageing Report, separado del IPC historico y con ruptura metodologica explicita. Para deflactar importes o contar una historia historica de precios, usar el IPC observado; para escenarios fiscales largos, HICP puede usarse solo como supuesto de escenario.

- Completada una capa derivada 2025-2070 para las variables fiscales que estaban como `no_estimado`: PIB, gasto publico total, intereses de deuda y deficit/saldo publico. Se actualizo `scripts/process-fiscal-series-1975-2070.ps1`, se descargo la presentacion oficial de documentos tecnicos de la Opinion AIReF 2025 y se genero `data/processed/fiscal/2026-05-25_series-fiscales-espana_escenario-derivado-pib-y-aapp_2025-2070.csv`. El CSV maestro `data/processed/fiscal/2026-05-25_series-fiscales-espana_1975-2070.csv` ahora rellena 2025-2070 para esas cuatro variables con `estado_dato = estimado`: PIB corriente se estima desde PIB BDMACRO 2024 + crecimiento de PIB potencial e HICP del Ageing Report; gasto/intereses/saldo interpolan linealmente anclas AIReF 2029, 2041, 2050 y 2070 y calculan importes con ese PIB estimado. Cautela editorial: no son cifras oficiales anuales tabuladas y deben mostrarse como escenario derivado.

- Mejorada la cobertura observada del paquete de pensiones solicitado. Para contributivas se incorporaron Anuarios MITES PEN-01 2001-2005 (media anual en miles de pensiones, convertida a pensiones), dejando el hueco real reducido a 1975-2000. Problema localizado: las rutas MITES probadas para Anuarios 1975-2000 bajo el patron `ANUARIOAAAA/PEN/pen01.html` devuelven una pagina 404 moderna, no una tabla estadistica; no se usan como datos.

- Completada la serie observada PNC 1991-2025 con informes oficiales Imserso de evolucion de nominas. Se descargaron y procesaron PDFs solapados 1991-2000, 2001-2007, 2008-2014, 2009-2015, 2016-2022 y 2019-2025. El tramo 1991-2000 procede de tablas escaneadas renderizadas localmente con Ghostscript y transcritas de forma controlada; sus importes originales en pesetas se convierten a euros con 1 EUR = 166,386 pesetas. El CSV `data/processed/pensiones/2026-05-25_imserso_pensiones-no-contributivas-observado-modelizado_1991-2070.csv` ya no tiene filas `no_estimado`: 1991-2025 queda `observado` y 2026-2070 `modelizado`.

- Anadida en `AGENTS.md` una regla explicita para revisar la coherencia de supuestos antes de crear, actualizar o usar estimaciones, modelizaciones, proyecciones propias o combinaciones de escenarios. La regla exige identificar fuente/escenario/vintage, comprobar compatibilidad de poblacion, PIB, precios, edad, definicion, unidad y periodo base, y documentar la revision antes de uso editorial.

- Generado un primer paquete de datos sobre numero de pensiones contributivas y no contributivas. Se creo `scripts/process-pensiones-contributivas-no-contributivas-1975-2070.ps1` y cuatro CSV en `data/processed/pensiones/`: pensiones contributivas 1975-2070 con observado 2006-2026, modelo 2027-2070 y 1975-2005 `no_estimado`; PNC 1991-2070 con observado transcrito 2019-2025, modelo demografico 2026-2070 y 1991-2018 `no_estimado`; desglose puntual contributivo abril 2026 por regimen y clase; y altas/bajas contributivas marzo 2026 con pension media de altas iniciales. Descargados brutos Imserso HTML, PDF 2019-2025 y PDF 1991-2000 en `data/raw/imserso/pnc/`. Actualizados `data/sources.md`, `data/inventory.md`, `data/metadata.md`, `data/methodology/transformations.md` y `data/checksums.sha256`. Cautela: quedan pendientes las extracciones historicas completas desde Anuarios/eSTADISS e Imserso; las filas futuras son modelizadas, no oficiales.

- Revisada la coherencia de supuestos de las estimaciones AIReF ya procesadas. Criterio: gasto en pensiones y pensionistas del informe de regla de gasto de pensiones son comparables solo dentro del mismo escenario/vintage; el CSV maestro fiscal usa `AIReF Opinion 2025` para pensiones y el escenario inercial para deuda de largo plazo, pero mezcla ademas una prevision puntual de deuda 2026 publicada en 2026 y una fuente europea Ageing Report para sanidad, por lo que la narrativa debe etiquetar cada bloque como escenario/fuente y no presentarlo como una unica simulacion homogenea.

- Revisada disponibilidad historica de pensiones vs pensionistas antes de 2006. El libro mensual/eSTADISS usado localmente publica `PENSIONISTAS`, `PENSIONES` y ratio `PENSIONES / PENSIONISTAS` desde 2006. Los Anuarios MITES muestran que hay tablas historicas con `pensionistas` alrededor de 2004-2006 y tablas de `pensiones` en anos anteriores; por tanto, la ratio antes de 2006 no esta localizada como serie continua, pero puede calcularse en los anos donde existan ambas magnitudes. Cautela: los anuarios usan media anual en miles, mientras el libro mensual usa datos de diciembre o mes concreto.

- Sustituidas las etiquetas laterales de `PopulationPyramid` por tres metricas en formato compacto: `PENSIONISTAS`, `20-64 AÑOS` y `NIÑOS`. Se elimino el bloque superior derecho de dos totales; ahora las cifras viven en la columna derecha del grafico y se calculan desde los datos visibles, sumando ambos sexos y categorias de nacimiento. Verificacion: `tsc --noEmit` correcto y `vite build` correcto con aviso de chunk grande ya conocido.

- Procesada una serie de pensionistas-personas con cobertura 1975-2070: `data/processed/seguridad-social/2026-05-25_seguridad-social-pensionistas-personas-observado-modelizado_1975-2070.csv`. El tramo oficial observado disponible en el libro mensual de Seguridad Social cubre 2006-2025 a diciembre y 2026 a abril; 1975-2005 queda marcado como `no_estimado` para no sustituir personas por numero de pensiones. El tramo 2027-2070 se modeliza con INE Proyecciones de poblacion 36643, aplicando la evolucion de la poblacion de 67 anos o mas al ancla oficial de abril de 2026. Script reproducible: `scripts/process-seguridad-social-pensionistas-1975-2070.ps1`. Actualizados `data/sources.md`, `data/inventory.md`, `data/metadata.md`, `data/methodology/transformations.md` y `data/checksums.sha256`.

- Anadidos totales en el encabezado de `PopulationPyramid`, arriba a la derecha junto al titulo/subtitulo: total de personas de 20-64 anos y total fuera de esa edad. Las cifras se calculan desde los datos visibles de la piramide y suman ambos sexos y ambas categorias de nacimiento. Verificacion: `tsc --noEmit` correcto y `vite build` correcto con aviso de chunk grande ya conocido.

- Generado el primer paquete de series fiscales solicitadas 1975-2070. Se creo el script reproducible `scripts/process-fiscal-series-1975-2070.ps1` y cuatro CSV:
  - `data/processed/igae/2026-05-25_igae-bdmacro_aapp-principales-series-fiscales-espana_1975-2024.csv` con PIB, gasto publico total, intereses + otras rentas de la propiedad, saldo publico, deuda PDE y prestaciones sociales agregadas de AAPP desde BDMACRO;
  - `data/processed/igae/2026-05-25_igae-cofog_gasto-salud-aapp-espana_1995-2024.csv` con gasto publico en sanidad COFOG `07 Salud`;
  - `data/processed/comision-europea/2026-05-25_ec-ageing-report_espana-pensiones-sanidad-coste-envejecimiento_2022-2070.csv` con proyecciones del Ageing Report 2024 para pensiones publicas brutas, sanidad y coste total de envejecimiento;
  - `data/processed/fiscal/2026-05-25_series-fiscales-espana_1975-2070.csv` como CSV maestro largo de 672 filas, 7 variables por ano, con `estado_dato`.
  Cobertura: PIB/gasto publico/intereses/saldo publico observados 1975-2024 y no estimados 2025-2070; deuda observada 1975-2025, prevision/anclas AIReF para 2026, 2030, 2040, 2050, 2060 y 2070; pensiones no estimadas 1975-1994, aproximacion COFOG 1995-2024 y escenario AIReF 2025-2070; sanidad no estimada 1975-1994, COFOG 1995-2024 y proyeccion Ageing Report 2025-2070. Actualizados `data/sources.md`, `data/inventory.md`, `data/metadata.md`, `data/methodology/transformations.md` y `data/checksums.sha256`.

- Refinado el margen izquierdo de `PopulationPyramid`: se elimino la columna fija de totales masculinos y el total vuelve a colocarse junto al extremo real de cada barra, con una separacion de 8 px y una reserva suave de margen izquierdo para evitar solapamientos con las etiquetas internas. Verificacion: `tsc --noEmit` correcto y `vite build` correcto con aviso de chunk grande ya conocido.

- Ajustado el margen izquierdo de `PopulationPyramid`: los totales del lado masculino pasan a una columna fija y la longitud maxima de las barras masculinas reserva espacio para evitar solapamientos con las etiquetas internas de nacidos en el extranjero. Verificacion: `tsc --noEmit` correcto y `vite build` correcto con aviso de chunk grande ya conocido.

- Anadidas etiquetas numericas a `PopulationPyramid`: cada tramo muestra el total por sexo en el exterior de la barra y, en la variante con desglose por nacimiento, los valores internos de nacidos en Espana y nacidos en el extranjero cuando el segmento tiene ancho suficiente para ser legible. Se desplazo la columna de anotaciones de edad laboral para evitar solapamientos. Verificacion: `tsc --noEmit` correcto y `vite build` correcto con aviso de chunk grande ya conocido; queda pendiente revision visual en navegador por bloqueo de localhost en el navegador integrado.

- Creado `data/methodology/fuentes-series-fiscales-1970-2070.md` como mapa de fuentes candidatas para construir series 1970-2070 de gasto publico total, intereses, deficit/saldo publico, deuda publica, gasto en pensiones, gasto sanitario y PIB. El documento distingue fuentes historicas, fuentes de proyeccion, posibilidad real de cubrir 1970-2070 y cautelas metodologicas. No incorpora valores numericos nuevos ni convierte escenarios en datos observados. Quedan pendientes de procesamiento especifico intereses, deficit, gasto publico total, sanidad y una serie propia de PIB inventariada.

- Obtenidos y procesados desde fuentes oficiales INE los datos de esperanza de vida restante a edades de referencia de jubilacion: 65, 66 y 67 anos. Se descargaron las Tablas de Mortalidad nacionales 1975-1990 (tabla 27150) y 1991-2024 (tabla 27153), y se enlazaron con la proyeccion oficial 2025-2070 desde la tabla 36775. Generados tres CSV: observado 1975-2024, proyectado 2025-2070 y combinado 1975-2070 con columna `estado_dato`. La serie combinada conserva hombres y mujeres, sin calcular `Ambos sexos` proyectado ni una edad legal dinamica de jubilacion. Script reproducible: `scripts/process-ine-esperanza-vida-jubilacion-1975-2070.ps1`.

- Modelizada para `/poblacion` la capa 2026-2070 de nacidos en Espana/nacidos en el extranjero por sexo y grupo quinquenal de edad. Se creo el script reproducible `scripts/process-ine-migrant-cohort-model-2026-2070.ps1` y el CSV `data/processed/ine/2026-05-25_ine_modelo-cohortes-poblacion-nacimiento-sexo-grupo-edad_2026-2070.csv`. Metodologia: stock observado 2025 de INE ECP 56937, envejecimiento anual por cohortes quinquenales, mortalidad proyectada INE 36647, flujos proyectados de inmigracion/emigracion INE 36649/36651, poblacion total proyectada INE 36643 y calibracion al total oficial por lugar de nacimiento INE 36642. La web etiqueta 2026-2070 como `Modelizado`; no debe presentarse como tabla oficial INE cruzada nacimiento + sexo + edad. Verificacion: `tsc --noEmit` correcto, `vite build` correcto con aviso de chunk grande ya conocido, totales de nacidos en el extranjero calibrados a +/- 1 persona por redondeo en 2026, 2050 y 2070. El navegador integrado no pudo acceder a localhost, aunque `Invoke-WebRequest` devolvio HTTP 200.

- Respondida consulta sobre esperanza de vida despues de la jubilacion: no hay todavia un CSV procesado/inventariado de esperanza de vida restante a los 65 o 67 anos. Si existe materia prima oficial en bruto: el JSON de INE Proyecciones tabla 36775 contiene esperanza de vida por edad y sexo, incluidas edades 65 y 67 para 2024-2073. La serie historica procesada actual solo cubre esperanza de vida al nacimiento; el valor visible de demo en `App.tsx` debe tratarse como placeholder hasta procesar y documentar una serie trazable.

- Obtenido un dataset trazable para salario medio de Espana desde BDMACRO abril 2026: `Salario Medio (SM) = remuneracion de asalariados / asalariados`, hoja `Remuneracion Asalariados`, columna `U`. Se creo el script reproducible `scripts/process-igae-bdmacro-salario-medio.ps1` y el CSV `data/processed/igae/2026-05-25_igae-bdmacro_salario-medio-espana_1970-2070.csv`. El archivo cubre 1970-2070 en filas anuales, pero solo contiene valores observados para 1970-2024; 2025-2070 queda sin valor y con `estado_dato = no_estimado` al no localizarse una proyeccion oficial/institucional permitida. Actualizados `data/sources.md`, `data/inventory.md`, `data/metadata.md`, `data/methodology/transformations.md` y `data/checksums.sha256`.

- Respondida consulta sobre nacimientos: los datos si contienen una serie de numero de nacimientos de Espana, con observado 1975-2024 y proyectado 2025-2070 en `data/processed/ine/2026-05-24_ine_nacimientos-espana-observados-proyectados_1975-2070.csv`. Tambien existe un dataset distinto de poblacion residente por lugar de nacimiento 2002-2025, que no debe confundirse con nacimientos anuales.

- Analizada la posibilidad de proyectar poblacion nacida en el extranjero por sexo y edad hasta 2070 mediante un modelo demografico por cohortes. Es tecnicamente posible, pero debe etiquetarse como serie `modelizada` o `estimada`, no como proyeccion oficial INE, porque los flujos migratorios proyectados son entradas/salidas anuales y no equivalen directamente al stock residente por edad. Antes de usarlo editorialmente haria falta una metodologia formal separada y un dataset derivado con trazabilidad.

- Creado `ReformSimulator` (`src/components/ReformSimulator.tsx` + `.css`): tarjeta móvil de estilo fintech/govtech (max-width 360 px) para un simulador de reformas del sistema de pensiones. Incluye cabecera con título/subtítulo/botón de información, barra de pestañas con badge de medidas activas, lista de medidas con iconos circulares de color (persona/porcentaje/grupo/maletín), valor y fecha por fila, menú de tres puntos por medida, y botón CTA con gradiente azul y glow. Tokens CSS locales con prefijo `--rs-`. API completamente tipada y puramente presentacional. Añadida la sección "Componente 07" al laboratorio `/componentes`.



- Anadida a `/poblacion` una capa observada de nacidos en Espana y nacidos en el extranjero para 2002-2025 usando el CSV INE 56937 (`data/processed/ine/2026-05-24_ine_ecp_poblacion-residente-espana-sexo-grupo-edad-nacimiento_2002-2025.csv`). La piramide cambia automaticamente a leyenda por nacimiento cuando el ano seleccionado tiene ese desglose; 1975-2001 y 2026-2070 se mantienen como sexo y edad sin nacimiento. Verificacion: `tsc --noEmit` correcto y `vite build` correcto con aviso de chunk grande; el navegador integrado bloqueo la interaccion con localhost, asi que queda pendiente revision visual interactiva.

- Explicados los terminos recomendados para la narrativa de edad de jubilacion: edad ordinaria/legal, edad efectiva, jubilacion anticipada, jubilacion demorada, jubilacion forzosa y edad minima de acceso. Criterio editorial: no mezclar reglas normativas con comportamiento observado.

- Corregida la pagina `/poblacion` para que los anos proyectados 2026-2070 se muestren correctamente al seleccionarlos: el parser de `populationPyramidData.ts` limpia marcas BOM/encoding en cabeceras CSV y descarta campos numericos vacios en vez de convertirlos a `0`. Se anadieron accesos rapidos visibles a 2025, inicio de proyeccion, 2050 y 2070. Verificado en navegador que 2070 muestra badge `Proyectado`, selector `2070`, total `54,3 M` y fuente de proyeccion; `tsc --noEmit` y `vite build` correctos, con aviso ya conocido de chunk grande por importar CSV.

- Aclarado criterio narrativo sobre "edad maxima de jubilacion": no debe usarse como etiqueta principal salvo que se documente una norma concreta de jubilacion forzosa. Para la web conviene separar edad ordinaria/legal, edad anticipada, edad demorada y edad efectiva observada de las altas iniciales de jubilacion.

- Respondida consulta sobre edad de jubilacion: el proyecto no tiene todavia un CSV procesado ni una entrada especifica en inventario/metadata, pero el libro bruto de Seguridad Social `data/raw/seguridad-social/pensiones/2026-05-18_seguridad-social_libro-evolucion-mensual-pensiones_2026-04.xlsx` contiene datos utilizables en las hojas `AJ_ambos_sexos`, `AJ_hombres`, `AJ_mujeres`, `EVO_acumula_altas_jub_edad` y `EVO_acumula_altas_jub_modalidad`. Se localizaron edad media y distribucion por edad de altas iniciales de jubilacion; queda pendiente procesarlas antes de usarlas editorialmente.

- Ajustada la pagina `/poblacion` para que la animacion de la piramide llegue hasta 2070: datos observados 1975-2025 y datos proyectados 2026-2070. Se actualizaron las marcas del `YearSelector` y el texto visible de la pagina.

- Creada la pagina publica `/poblacion` con una piramide poblacional animable mediante `YearSelector`.
- Conectado `PopulationPyramid` con datos oficiales procesados del INE: poblacion observada 1975-2025 y proyeccion 2026-2070, agregando edades simples en grupos quinquenales y manteniendo separado el estado observado/proyectado.
- Creado `src/data/populationPyramidData.ts` como adaptador de datos para la vista: parsea CSV, calcula total poblacional, porcentaje 20-64, porcentaje 65+ y escala comun de la piramide.
- Ampliado `PopulationPyramid` con `legendVariant="sex"` para mostrar solo Hombres/Mujeres cuando no hay desglose por nacimiento o nacionalidad en la fuente usada.
- Verificacion: `tsc --noEmit` correcto; `vite build` correcto con aviso de chunk grande por importar CSV; `/poblacion` responde HTTP 200; ESLint correcto en archivos tocados. ESLint global queda bloqueado por errores previos en `TimeSeriesChart.tsx` (`subtitle` y `projStart` sin uso).

- Creado el componente `YearSelector` (`src/components/YearSelector.tsx` +
  `src/components/YearSelector.css`): selector de año con estética de panel
  futurista sci-fi. Glassmorphism con `backdrop-filter: blur`, borde luminoso
  neon teal, línea de tiempo SVG con indicador circular de efecto LED (halo +
  glow + core + punto blanco), fill de progreso, tick marks con opacidad
  diferenciada por estado (pasado/actual/futuro), botón play/pause circular
  con anillo de pulse animado, auto-avance por RAF y soporte completo de estado
  controlado/no controlado. Teclado accesible (`←` / `→` / `Space`).
- Añadida la sección "Componente 06 - Selector de año" al laboratorio en `App.tsx`.


- Creado `MetricCard` (`src/components/MetricCard.tsx` + `.css`): tarjeta de indicador reutilizable para dashboards oscuros. Acepta `icon: ReactNode`, `label`, `value`, `secondary`/`secondaryColor` y `note`/`noteColor`. Sin logica de dominio interna.
- Creado `KeyIndicatorsPanel` (`src/components/KeyIndicatorsPanel.tsx` + `.css`): panel que compone `MetricCard` en una cuadricula de 2 columnas con titulo, grid accesible (`<ul>`) y boton CTA opcional tipo ghost. Reflow a 1 columna por debajo de 480 px.
- Anadida demo `INDICATORS_2025` en `App.tsx` con 10 indicadores del sistema de pensiones (ingresos, gasto, deficit, deuda publica, ratio presupuesto, relacion cotizantes/pensionistas, hucha, edad efectiva, esperanza de vida y tasa de reemplazo), con iconos SVG inline tematicos por indicador.
- Anadida la seccion `Componente 05` al laboratorio `/componentes`.
- Anadido `.component-preview--panel` en `App.css` para previsualizacion sin altura minima forzada.
- `tsc --noEmit` y ESLint: cero errores, cero warnings.



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
- Extraida desde BDMACRO de IGAE/SEPG la serie de salario medio macro de Espana, definida como remuneracion de asalariados / asalariados, para 1970-2024.
- Generado el CSV `data/processed/igae/2026-05-25_igae-bdmacro_salario-medio-espana_1970-2070.csv`, con 2025-2070 marcado como `no_estimado` porque no se ha localizado una proyeccion oficial permitida.
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

- Si se construye una serie historica de tasa de reemplazo, decidir antes el nivel de fidelidad: exacta con microdatos MCVL desde 2004 aprox.; aproximada con altas iniciales de jubilacion Seguridad Social/MITES y salario INE por edad desde 1995/2004/2006; o proxy larga 1975-actualidad usando salario medio macro, etiquetada explicitamente como no equivalente a salario final medio.
- Revisar visualmente `/gasto-sanitario` en escritorio y movil con navegador disponible; la comprobacion actual cubre TypeScript, build y respuesta HTTP 200, pero no captura visual.
- Mantener claramente etiquetado el desglose sanitario por categorias como `estimado`: combina AIReF/INE 2022, pesos EGSP 2022 y perfiles relativos IGTGS 2005, no una tabla oficial categoria x edad.
- Si se quiere separar urgencias, salud mental o cuidados de larga duracion en el panel sanitario, localizar una fuente institucional especifica y compatible por edad antes de incorporarlas.
- Localizar/procesar una fuente tabular alternativa para cubrir numero de pensiones contributivas 1975-1979. Las rutas MITES de Anuarios probadas devuelven 404. INEbase Historia ya aporta candidatos 1976-1979, pero son cortes a 31 de diciembre y requieren extraccion/validacion separada; no interpolar ni sustituir por personas pensionistas.
- Si se necesita cubrir 1975-2005 con personas pensionistas observadas, hacer una exportacion manual desde eSTADISS y documentar el CSV bruto; no usar numero de pensiones como sustituto.
- Decidir como visualizar el nuevo CSV maestro fiscal 1975-2070 y diferenciar en la interfaz las filas `observado`, `proyectado`, `escenario`, `estimado` y `no_estimado`. PIB, gasto publico total, intereses y saldo publico 2025-2070 ya estan completados como escenario derivado, no como dato oficial tabulado.
- Decidir si la web usara el salario medio macro BDMACRO como contexto de largo plazo o si se prefiere una serie de encuesta salarial mas estricta aunque cubra menos anos. No usar 2025-2070 como salario proyectado salvo que se localice una fuente oficial/institucional especifica o se documente una metodologia de estimacion separada.
- Si se necesitan paises concretos para salario de inmigrantes/extranjeros, revisar los microdatos de la Encuesta Cuatrienal de Estructura Salarial 2022 o solicitar explotacion especifica al INE. Las tablas agregadas procesadas el 2026-05-27 solo ofrecen grandes areas de nacionalidad y nacionalidad extranjera total por comunidad autonoma.
- Si la web usa el JSON de edad minima legal para calculos o filtros, decidir si el tramo anterior a 1976 se presenta como referencia general o si se investiga una fuente juridica primaria mas completa por regimen laboral.
- Procesar y documentar la edad media de altas iniciales de jubilacion desde el libro mensual de Seguridad Social antes de mostrarla en la web; decidir si se presenta como edad efectiva de nuevas jubilaciones, por modalidad o por sexo.
- Aplicar las nuevas reglas frontend al reorganizar componentes: separar componentes reutilizables, mantener tokens compartidos y evitar estilos duplicados en paginas finales.
- Extraer `PlayButton` a un modulo propio cuando se incorporen mas componentes y decidir la estructura definitiva de `src/components/`.
- Revisar visualmente `/poblacion` en escritorio y movil cuando haya navegador/captura disponible; la comprobacion automatizada actual solo valido build y respuesta HTTP.
- Revisar visualmente la nueva capa modelizada 2026-2070 de la piramide cuando el navegador integrado permita abrir localhost.
- Valorar si se compactan los CSV de poblacion para reducir el tamano del bundle de la pagina `/poblacion`.
- Si se quiere diferenciar nacidos en Espana y nacidos en el extranjero, limitarlo al tramo observado con tabla 56937 o documentar una metodologia explicita, porque la proyeccion usada en `/poblacion` solo cruza sexo y edad.
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
