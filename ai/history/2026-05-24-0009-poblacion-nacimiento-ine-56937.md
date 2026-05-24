# Interaccion 2026-05-24 - poblacion por nacimiento INE 56937

- fecha: 2026-05-24
- objetivo: completar la disponibilidad de poblacion residente por fecha, sexo, grupo de edad y nacimiento Espana/extranjero.
- archivos modificados:
  - `data/raw/ine/estadistica-continua-poblacion/poblacion-nacimiento/2026-05-24_ine_ecp_poblacion-residente-sexo-grupo-edad-pais-nacimiento_2002-2025.json`
  - `data/processed/ine/2026-05-24_ine_ecp_poblacion-residente-espana-sexo-grupo-edad-nacimiento_2002-2025.csv`
  - `data/processed/ine/2026-05-24_ine_poblacion-residente-nacimiento-cobertura-interpolacion_1975-2070.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: descargada la tabla oficial INE 56937, generada una vista limpia para Total/Espana/Extranjero de nacimiento y documentada una tabla metodologica de tramos con anclas censales e interpolaciones pendientes.
- estado siguiente: extraer anclas censales 1981 y 1991 si se quiere crear una serie estimada 1982-2001; no modelizar 2026-2070 sin metodologia explicita.
