# 2026-06-07 - Observatorio Social 2007 e ingresos Seguridad Social

## Objetivo

Continuar la resolucion de ingresos historicos de Seguridad Social buscando la fuente primaria o de contraste citada por FIPROS.

## Archivos modificados

- `scripts/process-seguridad-social-observatorio-social-informe-2007-recursos.ps1`
- `data/raw/seguridad-social/ingresos-historicos-candidatos/2026-06-07_seguridad-social_observatorio-social-espana-informe-2007_recursos-ss.pdf`
- `data/processed/seguridad-social/2026-06-07_seguridad-social_observatorio-social-informe-2007_recursos-ss_1980-2007.csv`
- `data/processed/seguridad-social/2026-06-07_seguridad-social_observatorio-social-informe-2007_validacion-serie-moderna_1995-2007.csv`
- `data/checksums.sha256`
- `data/sources.md`
- `data/metadata.md`
- `data/inventory.md`
- `data/methodology/transformations.md`
- `data/methodology/validacion-ingresos-seguridad-social-1990-1994.md`
- `ai/current.md`
- `ai/history/2026-06-07-observatorio-social-ingresos-ss.md`

## Resumen de cambios

- Se descargo el `Informe 2007. Observatorio Social de Espana` desde Seguridad Social.
- Se proceso la tabla 4.6/4.7 de recursos de Seguridad Social para 1980, 1990, 1995 y 2000-2007.
- El Observatorio confirma 1990 y resuelve 2002 frente a FIPROS: el total correcto de la tabla es `80.371,10` millones de euros, igual a la suma de componentes.
- 1991-1994 siguen sin fuente primaria limpia localizada; solo `cotizaciones_sociales` y `transferencias_corrientes` pueden mantenerse como candidatos FIPROS.

## Estado siguiente

Pendiente localizar Anuarios de Estadisticas Laborales o liquidaciones CSS anteriores a los Anuarios online de MITES que publiquen 1991-1994 con importes anuales comparables.
