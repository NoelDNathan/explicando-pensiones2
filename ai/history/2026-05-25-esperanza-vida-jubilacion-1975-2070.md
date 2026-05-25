# Esperanza de vida despues de la jubilacion 1975-2070

- fecha: 2026-05-25
- objetivo: obtener una serie oficial trazable de esperanza de vida restante despues de edades habituales de jubilacion.
- archivos modificados:
  - `scripts/process-ine-esperanza-vida-jubilacion-1975-2070.ps1`
  - `data/raw/ine/tablas-mortalidad/2026-05-25_ine_tm_tablas-mortalidad-nacional-1975-1990.json`
  - `data/raw/ine/tablas-mortalidad/2026-05-25_ine_tm_tablas-mortalidad-nacional-1991-2024.json`
  - `data/processed/ine/2026-05-25_ine_tm_esperanza-vida-restante-65-66-67-sexo-espana-observada_1975-2024.csv`
  - `data/processed/ine/2026-05-25_ine_proyeccion-esperanza-vida-restante-65-66-67-sexo-espana_2025-2070.csv`
  - `data/processed/ine/2026-05-25_ine_esperanza-vida-restante-65-66-67-sexo-espana-observada-proyectada_1975-2070.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
  - `ai/history/2026-05-25-esperanza-vida-jubilacion-1975-2070.md`
- resumen de cambios: se descargaron tablas oficiales INE de mortalidad observadas, se filtraron los anos restantes de vida a 65, 66 y 67 anos por sexo, y se enlazaron con proyecciones oficiales hasta 2070.
- estado siguiente: conectar el CSV combinado a un grafico o indicador, manteniendo visible la separacion entre observado y proyectado.
