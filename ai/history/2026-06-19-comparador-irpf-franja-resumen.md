# Comparador IRPF: franja menos, media y mas

Fecha: 2026-06-19

## Objetivo

Anadir una franja resumen con tres columnas (menos IRPF, media de CCAA, mas IRPF) en el formato de la maqueta: porcentaje, euros y diferencia respecto a Madrid en pp y euros.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.css`

## Resumen de cambios

- Nueva franja `.wirc-stats` bajo la cabecera del comparador, actualizada al salario activo (hover, clic fijado o salario del usuario).
- Columna 1: comunidad con menos IRPF (clicable); si es Madrid, etiqueta "referencia".
- Columna 2: media aritmetica de todas las CCAA incluidas.
- Columna 3: comunidad con mas IRPF (clicable).
- Cada columna muestra `% · €`; si paga mas que Madrid, anade `+X pp · +Y €` en verde.
- Layout responsive: tres columnas en escritorio, apilado en movil.

## Verificacion

- `ReadLints` sin errores.

## Estado siguiente

- Revisar legibilidad de la franja en movil con nombres largos de CCAA.
