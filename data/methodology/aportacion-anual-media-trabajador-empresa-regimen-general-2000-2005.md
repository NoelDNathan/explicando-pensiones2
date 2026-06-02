# Aportacion anual media trabajador+empresa - Regimen General 2000-2005

Fecha: 2026-06-03

## Objetivo

Continuar la investigacion iniciada con la prueba de 2014 para construir un indicador anual medio de cotizacion trabajador+empresa a partir de bases medias del Regimen General.

El indicador sirve como contexto agregado para la calculadora fiscal y para explicar la financiacion del sistema, pero no debe presentarse como aportacion acumulada de vida laboral ni como cuota efectiva de una persona concreta.

## Fuente

- Institucion: Seguridad Social / Ministerio de Inclusion, Seguridad Social y Migraciones.
- Documento: `Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2021`.
- URL: https://www.seg-social.es/wps/wcm/connect/wss/7fad23dd-65cf-4ff4-baf3-50c5d2fabf61/202120003.pdf?CVID=&MOD=AJPERES
- Archivo bruto conservado: `data/raw/seguridad-social/cotizacion-regimen-general/2026-06-03_seguridad-social_informe-economico-financiero-2021_cotizacion-rg_2000-2019.pdf`.
- Fecha de descarga: 2026-06-03.

## Datos transcritos

Del bloque de cotizacion del Regimen General se toman, para 2000-2005:

- numero de cotizaciones;
- base media mensual en euros;
- tipo total de cotizacion aplicado a la cotizacion normal: 28,30%.

La extraccion queda marcada como transcripcion controlada porque el entorno no dispone de extractor PDF instalado. El bruto oficial se conserva y queda identificado con checksum en `data/checksums.sha256`.

## Transformacion

Para cada ano:

1. `base_media_anual_eur = base_media_mensual_eur * 12`.
2. `aportacion_anual_media_trabajador_empresa_eur = base_media_anual_eur * 0,283`.
3. `cotizacion_normal_calculada_millones_eur = aportacion_anual_media_trabajador_empresa_eur * cotizaciones_numero / 1.000.000`.

El calculo conserva dos decimales en euros y millones de euros.

## Limitaciones

- `cotizaciones_numero` no equivale necesariamente a personas trabajadoras unicas.
- El indicador usa base media agregada del Regimen General, no historiales individuales.
- No incorpora bonificaciones, reducciones, horas extra, otros conceptos ni recaudacion efectiva distinta de la cotizacion normal calculada.
- No cubre regimenes especiales ni autonomos.
- No debe mezclarse con ingresos presupuestarios totales de Seguridad Social.

## Archivo generado

- `data/processed/seguridad-social/2026-06-03_seguridad-social_aportacion-anual-media-regimen-general_2000-2005.csv`.
