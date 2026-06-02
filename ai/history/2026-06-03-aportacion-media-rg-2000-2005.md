# 2026-06-03 - Aportacion media Regimen General 2000-2005

## Fecha

2026-06-03

## Objetivo

Continuar la investigacion de trabajadores/cotizaciones vinculada a la calculadora fiscal para los anos 2000-2005.

## Archivos modificados

- `data/raw/seguridad-social/cotizacion-regimen-general/2026-06-03_seguridad-social_informe-economico-financiero-2021_cotizacion-rg_2000-2019.pdf`
- `data/processed/seguridad-social/2026-06-03_seguridad-social_aportacion-anual-media-regimen-general_2000-2005.csv`
- `data/methodology/aportacion-anual-media-trabajador-empresa-regimen-general-2000-2005.md`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/checksums.sha256`
- `ai/current.md`
- `ai/history/2026-06-03-aportacion-media-rg-2000-2005.md`

## Resumen de cambios

- Se descargo el Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2021 como fuente oficial para cotizaciones y bases medias mensuales del Regimen General desde 2000.
- Se genero un CSV 2000-2005 con cotizaciones, base media mensual, tipo total 28,30%, base anual, aportacion anual media trabajador+empresa y control agregado en millones de euros.
- El indicador queda marcado como `estimado` porque la aportacion anual media es calculada por el proyecto sobre agregados oficiales.
- Se documento que no mide personas trabajadoras unicas ni aportacion vitalicia individual.
- Verificacion: importacion CSV correcta, `tsc --noEmit` correcto y `vite build` correcto con aviso conocido de chunk grande.

## Estado siguiente

Si se quiere completar una serie amplia del indicador, extender el mismo metodo a 2006-2019 desde el mismo informe y a 2020 en adelante con informes posteriores, manteniendo separadas bonificaciones, reducciones y otros conceptos.
