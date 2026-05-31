# 2026-06-01 - Prueba de aportacion anual con base de cotizacion

## Fecha

2026-06-01

## Objetivo

Responder como se calcularia una aportacion anual sumando trabajador y empresa a partir de una base de cotizacion, y aclarar la representatividad de la MCVL.

## Archivos modificados

- `ai/history/2026-06-01-prueba-aportacion-anual-mcvl.md`
- `ai/current.md`

## Resumen de cambios

- Se define una prueba sencilla para 2025 con una base mensual hipotetica de 2.000 euros durante 12 meses.
- Con contingencias comunes del Regimen General, la suma trabajador+empresa seria 28,30% de la base; si se incluye MEI 2025, el total usado como aportacion al sistema sube al 29,10%.
- Se aclara que la MCVL es representativa del ano de referencia para personas con relacion con la Seguridad Social, pero no debe usarse sin cautela para representar automaticamente a todos los trabajadores historicos de 1975.

## Estado siguiente

Si se implementa un indicador, separar claramente `cotizacion_contingencias_comunes` y `cotizacion_contingencias_comunes_mas_mei`, y etiquetar el calculo como reconstruccion aplicada a microdatos o ejemplo metodologico.
