# 2026-05-27 - Salario medio por nacionalidad

## Objetivo

Localizar y procesar datos oficiales recientes sobre salario medio de inmigrantes o extranjeros por area geografica y, si existe, por pais, incluyendo el caso de Espana.

## Archivos modificados

- `scripts/process-ine-eaes-salario-nacionalidad-2023.ps1`
- `data/raw/ine/encuesta-anual-estructura-salarial/salario-nacionalidad/`
- `data/processed/ine/2026-05-27_ine_eaes_salario-medio-nacionalidad-areas_2023.csv`
- `data/processed/ine/2026-05-27_ine_eaes_salario-medio-nacionalidad-ccaa_2023.csv`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/checksums.sha256`
- `ai/current.md`
- `ai/history/2026-05-27-salario-inmigrantes-nacionalidad.md`

## Resumen de cambios

- Localizadas dos tablas oficiales del INE, Encuesta Anual de Estructura Salarial 2023:
  - tabla 28190: salario medio bruto por sexo y areas de nacionalidad en Total Nacional;
  - tabla 28202: salario medio bruto por comunidad autonoma, sexo y nacionalidad total/espanola/extranjera.
- Procesados dos CSV trazables para 2023.
- Documentada la limitacion principal: las tablas agregadas localizadas usan nacionalidad, no lugar de nacimiento, y no publican pais individual salvo el caso de nacionalidad espanola; agrupan el resto por grandes areas.

## Estado siguiente

Si se necesitan paises concretos, revisar microdatos de la Encuesta Cuatrienal de Estructura Salarial 2022 o solicitar una explotacion especifica al INE, aplicando secreto estadistico y documentando ponderaciones.
