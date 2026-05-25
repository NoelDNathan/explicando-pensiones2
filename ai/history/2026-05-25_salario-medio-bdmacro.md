# Interaccion: salario medio BDMACRO

- fecha: 2026-05-25
- objetivo: obtener datos de salario medio de Espana para el rango 1970-2070 con fuentes institucionales.
- archivos modificados:
  - `scripts/process-igae-bdmacro-salario-medio.ps1`
  - `data/processed/igae/2026-05-25_igae-bdmacro_salario-medio-espana_1970-2070.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: extraida la serie BDMACRO de salario medio macro, definida como remuneracion de asalariados / asalariados, con valores observados 1970-2024. El CSV conserva filas 2025-2070 como `no_estimado`, sin inventar proyecciones.
- estado siguiente: decidir si esta medida macro es adecuada para la narrativa web o si se prefiere una serie salarial de encuesta con menor cobertura temporal.
