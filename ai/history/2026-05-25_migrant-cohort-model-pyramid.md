# 2026-05-25 - Modelo de cohortes para nacidos en el extranjero

## Objetivo

Modelizar la capa de poblacion nacida en el extranjero para la piramide de `/poblacion` entre 2026 y 2070, manteniendo separada la proyeccion oficial del INE de la estimacion propia.

## Archivos modificados

- `scripts/process-ine-migrant-cohort-model-2026-2070.ps1`
- `data/raw/ine/proyecciones-poblacion/poblacion-nacimiento-modelo/`
- `data/processed/ine/2026-05-25_ine_modelo-cohortes-poblacion-nacimiento-sexo-grupo-edad_2026-2070.csv`
- `data/checksums.sha256`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `src/data/populationPyramidData.ts`
- `src/App.tsx`

## Resumen de cambios

- Creado un modelo de cohortes quinquenales que parte del stock observado 2025 de nacidos en el extranjero.
- Se incorporan flujos proyectados de inmigracion y emigracion por sexo y edad, mortalidad por sexo y edad, y calibracion anual al total oficial INE de nacidos en el extranjero.
- La piramide muestra 2026-2070 con desglose Espana/Extranjero y badge `Modelizado`.
- Documentadas fuente, metadata, transformacion y limitaciones.

## Estado siguiente

- Revisar visualmente `/poblacion` en navegador cuando el entorno permita acceso a localhost desde el navegador integrado.
- Si la narrativa publica usa esta capa, mantener visible que es una estimacion propia y no una tabla oficial INE cruzada.
