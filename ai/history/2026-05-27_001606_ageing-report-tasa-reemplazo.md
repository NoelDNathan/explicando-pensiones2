# 2026-05-27 - Ageing Report tasa de reemplazo

## Objetivo

Empezar por la proyeccion oficial del 2024 Ageing Report para la tasa de reemplazo de jubilacion en Espana.

## Archivos modificados

- `scripts/process-ageing-report-replacement-rate.ps1`
- `data/processed/comision-europea/2026-05-27_ec-ageing-report_espana-tasa-reemplazo-jubilacion_2022-2070.csv`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/checksums.sha256`
- `ai/current.md`
- `ai/history/2026-05-27_001606_ageing-report-tasa-reemplazo.md`

## Resumen

- Extraida la serie anual 2022-2070 desde el XLSX oficial del Ageing Report 2024 ya descargado.
- Fuente exacta: hoja `ESb`, fila 24, `Gross replacement rate at retirement (earnings-related public pensions)`.
- Generado CSV con definicion, escenario, fuente y `estado_dato = proyectado`.
- Documentada la metadata y la transformacion.

## Estado siguiente

Discutir despues como reconstruir o aproximar el tramo historico sin mezclarlo con la proyeccion europea.
