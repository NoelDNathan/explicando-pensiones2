# 2026-06-01 - Prueba real de aportacion anual 2014

## Fecha

2026-06-01

## Objetivo

Hacer una prueba real con un ano oficial para calcular aportacion trabajador+empresa a partir de base media de cotizacion.

## Archivos modificados

- `ai/history/2026-06-01-prueba-real-aportacion-2014.md`
- `ai/current.md`

## Resumen de cambios

- Se usa el Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2016, que recoge 2014 como ultimo ano liquidado.
- Para Regimen General sin sistemas especiales, 2014 tiene 12.374.262 cotizaciones, base media mensual de 1.725,68 euros y tipo de cotizacion del 28,30%.
- La prueba por cotizacion media da 20.708,16 euros de base anual y 5.860,41 euros de cotizacion anual trabajador+empresa.
- La cuenta agregada reproduce la cotizacion normal oficial del informe: 12.374.262 * 5.860,41 euros ~= 72.518,24 millones de euros.

## Estado siguiente

El metodo queda validado para un ano agregado, pero no equivale todavia a aportacion acumulada de vida laboral; para eso haria falta aplicar la misma logica mes a mes sobre MCVL o una fuente administrativa equivalente.
