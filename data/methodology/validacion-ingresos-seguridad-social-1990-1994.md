# Validacion de ingresos de Seguridad Social 1990-1994

Fecha: 2026-06-02

## Objetivo

Evaluar si el PDF Seguridad Social/FIPROS `Analisis prospectivo de los factores que inciden en la sostenibilidad del sistema publico de pensiones` puede servir para extender hacia 1990-1994 la serie moderna de ingresos de Seguridad Social, actualmente construida con liquidacion consolidada desde 1995.

## Fuente candidata

- Fuente: Seguridad Social/FIPROS, tabla 2.3, `Evolucion de la estructura de los recursos del sistema de Seguridad Social. 1990-2007`.
- URL: `https://www.seg-social.es/descarga/116336`.
- Archivo bruto: `data/raw/seguridad-social/ingresos-historicos-candidatos/2026-06-01_seguridad-social_fipros-recursos-sistema-ss_1990-2007.pdf`.
- CSV candidato: `data/processed/seguridad-social/2026-06-01_seguridad-social_fipros_recursos-sistema-candidato_1990-2007.csv`.
- CSV de validacion: `data/processed/seguridad-social/2026-06-01_seguridad-social_fipros_validacion-solape-serie-moderna_1995-2007.csv`.

La tabla candidata es secundaria: el PDF indica que procede de elaboracion propia a partir del Anuario de Estadisticas Laborales y del Observatorio Social de Espana, Informe 2007.

## Resultado de la validacion

La comparacion se hace en el solape 1995-2007 contra la serie moderna de Seguridad Social 1995-2025P. La serie moderna usa liquidacion consolidada para 1995-2024 y presupuesto solo para 2025P.

| Metrica | Resultado en el solape | Decision provisional |
| --- | --- | --- |
| `cotizaciones_sociales` | Coincide por redondeo en 1995-1996 y presenta diferencias menores en 1997-2007. | Usable como candidato para 1990-1994, pendiente de fuente primaria. |
| `transferencias_corrientes` | Coincide por redondeo en los 13 anos del solape 1995-2007. | Usable como candidato para 1990-1994, pendiente de fuente primaria. |
| `otros_ingresos` | Presenta una diferencia relevante en 2007 y depende de la definicion de cierre del total. | No usar como serie editorial por ahora. |
| `total_neto_consolidado` | Presenta diferencias relevantes en 2002, 2006 y 2007. En 2002 el total publicado no cuadra con la suma de componentes. | No usar como serie editorial por ahora. |
| Porcentajes sobre total | Dependen del total publicado por la tabla candidata. | No usar para narrativa cuantitativa hasta resolver el total. |

## Anomalia de 2002

En 2002, la tabla candidata publica:

| Concepto | Millones de euros |
| --- | ---: |
| Cotizaciones sociales | 70.829,10 |
| Transferencias corrientes | 7.701,08 |
| Otros ingresos | 1.840,92 |
| Suma de componentes | 80.371,10 |
| Total neto consolidado publicado | 100.439,43 |

La diferencia entre la suma de componentes y el total publicado es `-20.068,33` millones de euros. Ademas, el total publicado para 2002 coincide con el total publicado para 2001, lo que sugiere un posible error de tabla, arrastre del dato anterior o problema de transcripcion en la fuente secundaria.

La serie moderna liquidada para 2002 situa el total en `80.012,93` millones de euros, mucho mas cerca de la suma de componentes candidata que del total publicado por FIPROS. Por eso la anomalia afecta sobre todo a `total_neto_consolidado`, `otros_ingresos` y porcentajes sobre total, pero no invalida automaticamente las partidas principales de `cotizaciones_sociales` y `transferencias_corrientes`.

## Impacto sobre la web

- Para una metrica de ingresos vinculada al trabajo, puede avanzarse con `cotizaciones_sociales` como candidato 1990-1994, siempre etiquetado como `candidato_validacion`.
- Para explicar aportaciones del Estado o financiacion no laboral, puede avanzarse con `transferencias_corrientes` como candidato 1990-1994, tambien pendiente de fuente primaria.
- No debe mostrarse una serie continua de `total ingresos` 1990-2025 mezclando FIPROS y la serie moderna.
- No debe calcularse `% cotizaciones / total ingresos` con el total FIPROS mientras no se resuelva el descuadre.
- No debe usarse `otros_ingresos` para narrativa editorial antes de validar la fuente primaria o encontrar una liquidacion alternativa.

## Siguiente paso recomendado

Localizar la fuente primaria citada por FIPROS:

1. Anuario de Estadisticas Laborales, ejercicios que cubran 1990-2007 o al menos 1990-1994.
2. Observatorio Social de Espana, Informe 2007.

La prioridad es comprobar si esas fuentes publican importes por ano para cotizaciones, transferencias y total de recursos del Sistema de Seguridad Social. Si la fuente primaria confirma componentes pero no total, se puede preparar una serie candidata limitada a `cotizaciones_sociales` y `transferencias_corrientes` para 1990-1994. Si confirma un total corregido, se puede rehacer la validacion y reabrir `total_neto_consolidado`.
