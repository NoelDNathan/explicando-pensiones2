# 2026-06-01 - Diferencia entre cotizacion media y datos existentes

## Fecha

2026-06-01

## Objetivo

Explicar por que el proyecto no contiene ya la serie de cotizacion media anual aunque si tenga ingresos por cotizaciones y afiliacion media.

## Archivos modificados

- `ai/history/2026-06-01-diferencia-cotizacion-media-datos-existentes.md`
- `ai/current.md`

## Resumen de cambios

- Se reviso el inventario y los CSV existentes.
- El proyecto ya tiene ingresos por cotizaciones sociales 1995-2025P y un indicador de ingresos por afiliacion media 2001-2025P.
- Ese indicador usa ingresos presupuestarios/liquidados divididos entre afiliacion media total del sistema; no usa bases medias de cotizacion ni tipos de cotizacion.
- La serie nueva propuesta seria otra cosa: base media mensual por cotizante/persona fisica * 12 * tipo de cotizacion, con cobertura por regimen y sin bonificaciones/reducciones salvo que se modele expresamente.

## Estado siguiente

Si se incorpora, documentarla como serie separada de `aportacion_anual_media_trabajador_empresa` o `cotizacion_normal_media_por_cotizacion`, no como duplicado de ingresos por afiliacion media.
