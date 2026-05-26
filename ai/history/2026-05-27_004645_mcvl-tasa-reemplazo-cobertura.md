# 2026-05-27 - MCVL tasa de reemplazo cobertura

## Objetivo

Empezar con la opcion MCVL para cubrir el tramo historico de la tasa de reemplazo de jubilacion.

## Archivos modificados

- `scripts/process-mcvl-replacement-rate-coverage.ps1`
- `data/methodology/mcvl-tasa-reemplazo.md`
- `data/processed/seguridad-social/2026-05-27_mcvl_tasa-reemplazo-cobertura-candidata_2004-2024.csv`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/checksums.sha256`
- `ai/current.md`
- `ai/history/2026-05-27_004645_mcvl-tasa-reemplazo-cobertura.md`

## Resumen

- Preparado un script que registra la cobertura candidata MCVL 2004-2024 y escanea si existen microdatos locales minimos para calcular la tasa.
- Preparada metodologia para reconstruir pension inicial o efectiva reconocida frente a bases de cotizacion previas de la misma persona.
- No se calculan valores de tasa de reemplazo porque no hay microdatos MCVL locales.

## Estado siguiente

Para calcular valores observados hace falta incorporar bajo `data/raw/seguridad-social/mcvl/` los ficheros MCVL de prestaciones, cotizacion y afiliacion de cada edicion autorizada.
