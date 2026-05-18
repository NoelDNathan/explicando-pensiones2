# Interaccion 2026-05-18 - Piramide de poblacion INE

- fecha: 2026-05-18
- objetivo: descargar y preparar los datos oficiales del INE para construir piramides de poblacion historicas de Espana desde 1975.
- archivos modificados:
  - `data/raw/ine/estadistica-continua-poblacion/poblacion-residente/2026-05-18_ine_ecp_poblacion-residente-sexo-edad_1971-2025.json`
  - `data/processed/ine/2026-05-18_ine_ecp_poblacion-residente-espana-sexo-edad_1975-2025.csv`
  - `data/processed/ine/2026-05-18_ine_ecp_piramide-poblacion-espana-sexo-edad_1975-2025.csv`
  - `data/sources.md`
  - `data/methodology/transformations.md`
  - `ai/current.md`
- resumen de cambios: descargada la tabla INE 56934 de poblacion residente por fecha, sexo y edad; generado un CSV normalizado desde 1975 y otro anual a 1 de enero para piramides poblacionales.
- estado siguiente: construir el grafico de piramide historica y decidir como conectarlo con la proyeccion INE 2024-2074 sin mezclar datos observados y proyectados.
