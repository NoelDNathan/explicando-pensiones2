# Validacion de ingresos de Seguridad Social 1990-1994

Fecha: 2026-06-02
Ultima revision: 2026-06-07

## Objetivo

Evaluar si el PDF Seguridad Social/FIPROS `Analisis prospectivo de los factores que inciden en la sostenibilidad del sistema publico de pensiones` puede servir para extender hacia 1990-1994 la serie moderna de ingresos de Seguridad Social, actualmente construida con liquidacion consolidada desde 1995.

## Fuente candidata

- Fuente: Seguridad Social/FIPROS, tabla 2.3, `Evolucion de la estructura de los recursos del sistema de Seguridad Social. 1990-2007`.
- URL: `https://www.seg-social.es/descarga/116336`.
- Archivo bruto: `data/raw/seguridad-social/ingresos-historicos-candidatos/2026-06-01_seguridad-social_fipros-recursos-sistema-ss_1990-2007.pdf`.
- CSV candidato: `data/processed/seguridad-social/2026-06-01_seguridad-social_fipros_recursos-sistema-candidato_1990-2007.csv`.
- CSV de validacion: `data/processed/seguridad-social/2026-06-01_seguridad-social_fipros_validacion-solape-serie-moderna_1995-2007.csv`.

La tabla candidata es secundaria: el PDF indica que procede de elaboracion propia a partir del Anuario de Estadisticas Laborales y del Observatorio Social de Espana, Informe 2007.

## Fuente primaria/contraste localizada

El 2026-06-07 se localizo y conservo el PDF oficial alojado en Seguridad Social del `Informe 2007. Observatorio Social de Espana`:

- URL: `https://www.seg-social.es/descarga/51945`.
- Archivo bruto: `data/raw/seguridad-social/ingresos-historicos-candidatos/2026-06-07_seguridad-social_observatorio-social-espana-informe-2007_recursos-ss.pdf`.
- CSV procesado: `data/processed/seguridad-social/2026-06-07_seguridad-social_observatorio-social-informe-2007_recursos-ss_1980-2007.csv`.
- Validacion: `data/processed/seguridad-social/2026-06-07_seguridad-social_observatorio-social-informe-2007_validacion-serie-moderna_1995-2007.csv`.

La tabla 4.6 del Observatorio publica recursos de Seguridad Social para 1980, 1990, 1995 y 2000-2007. Esta fuente confirma los importes de 1990 para `cotizaciones_sociales`, `transferencias_corrientes`, `otros_ingresos` y total, pero no publica los anos 1991-1994. Por tanto, no limpia por si sola el tramo completo 1990-1994.

## Resultado de la validacion

La comparacion se hace en el solape 1995-2007 contra la serie moderna de Seguridad Social 1995-2025P. La serie moderna usa liquidacion consolidada para 1995-2024 y presupuesto solo para 2025P.

| Metrica | Resultado en el solape | Decision provisional |
| --- | --- | --- |
| `cotizaciones_sociales` | Coincide por redondeo en 1995-1996 y presenta diferencias menores en 1997-2007. | Usable como candidato para 1990-1994, pendiente de fuente primaria. |
| `transferencias_corrientes` | Coincide por redondeo en los 13 anos del solape 1995-2007. | Usable como candidato para 1990-1994, pendiente de fuente primaria. |
| `otros_ingresos` | Presenta una diferencia relevante en 2007 y depende de la definicion de cierre del total. | No usar como serie editorial por ahora. |
| `total_neto_consolidado` | Presenta diferencias relevantes en 2002, 2006 y 2007. En 2002 el total publicado no cuadra con la suma de componentes. | No usar como serie editorial por ahora. |
| Porcentajes sobre total | Dependen del total publicado por la tabla candidata. | No usar para narrativa cuantitativa hasta resolver el total. |

## Resolucion operativa de la discrepancia de 2002

En 2002, la tabla candidata publica:

| Concepto | Millones de euros |
| --- | ---: |
| Cotizaciones sociales | 70.829,10 |
| Transferencias corrientes | 7.701,08 |
| Otros ingresos | 1.840,92 |
| Suma de componentes | 80.371,10 |
| Total neto consolidado publicado | 100.439,43 |

La diferencia entre la suma de componentes y el total publicado es `-20.068,33` millones de euros. Ademas, el total publicado para 2002 coincide exactamente con el total publicado para 2001, lo que se trata como indicio suficiente de error probable en la tabla secundaria, arrastre del dato anterior o problema de transcripcion.

La serie moderna liquidada para 2002 situa el total en `80.012,93` millones de euros, mucho mas cerca de la suma de componentes candidata que del total publicado por FIPROS. Por eso la anomalia afecta sobre todo a `total_neto_consolidado`, `otros_ingresos` y porcentajes sobre total, pero no invalida automaticamente las partidas principales de `cotizaciones_sociales` y `transferencias_corrientes`.

Decision de uso desde 2026-06-07:

- No se corrige el total FIPROS de 2002 dentro del CSV candidato, porque no hay fuente primaria limpia que publique una fe de erratas o una liquidacion historica equivalente para esa tabla.
- El Observatorio Social de Espana 2007 si publica 2002 con `total = 80.371,10`, igual a la suma de componentes, y con porcentajes recalculados sobre ese total. Esto confirma que el total FIPROS de `100.439,43` para 2002 no debe usarse.
- Para 1995 en adelante, el total editorial de ingresos de Seguridad Social debe salir de la serie moderna liquidada `ss-ingresos-rubricas-1995-2025p`, no de FIPROS.
- Para 1990, el Observatorio Social de Espana 2007 sirve como contraste institucional adicional de los importes publicados por FIPROS.
- Para 1991-1994, los totales historicos FIPROS quedan bloqueados como fuente editorial. Pueden conservarse en bruto/procesado solo como rastro de la tabla candidata.
- Las partidas 1991-1994 `cotizaciones_sociales` y `transferencias_corrientes` siguen como candidato FIPROS pendiente de fuente primaria, porque el Observatorio no publica esos anos y en el solape validable son las dos partidas con comportamiento mas consistente.
- No se deben calcular porcentajes historicos sobre total FIPROS, ni `otros_ingresos`, ni `total_neto_consolidado` 1991-1994 para narrativa publica hasta localizar el Anuario de Estadisticas Laborales u otra liquidacion primaria limpia.

## Impacto sobre la web

- Para una metrica de ingresos vinculada al trabajo, puede avanzarse solo en borradores internos con `cotizaciones_sociales` como candidato 1991-1994, siempre etiquetado como `candidato_fipros_pendiente_fuente_primaria`; 1990 queda contrastado por Observatorio Social de Espana 2007.
- Para explicar aportaciones del Estado o financiacion no laboral, puede avanzarse solo en borradores internos con `transferencias_corrientes` como candidato 1991-1994, tambien pendiente de fuente primaria; 1990 queda contrastado por Observatorio Social de Espana 2007.
- No debe mostrarse una serie continua de `total ingresos` 1990-2025 mezclando FIPROS y la serie moderna.
- No debe calcularse `% cotizaciones / total ingresos` con el total FIPROS mientras no se resuelva el descuadre.
- No debe usarse `otros_ingresos` para narrativa editorial antes de validar la fuente primaria o encontrar una liquidacion alternativa.

## Siguiente paso recomendado

Localizar la fuente primaria citada por FIPROS:

1. Anuario de Estadisticas Laborales, ejercicios que cubran 1991-1994.
2. Liquidaciones historicas de Seguridad Social o tablas antiguas CSS equivalentes anteriores a los Anuarios online de MITES, si existen.

La prioridad es comprobar si esas fuentes publican importes por ano para cotizaciones, transferencias y total de recursos del Sistema de Seguridad Social. Si la fuente primaria confirma componentes pero no total, se puede preparar una serie candidata limitada a `cotizaciones_sociales` y `transferencias_corrientes` para 1991-1994. Si confirma totales anuales limpios, se puede rehacer la validacion y reabrir `total_neto_consolidado` para esos anos.
