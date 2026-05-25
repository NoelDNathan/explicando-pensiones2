Fecha: 2026-05-25

Objetivo: buscar una alternativa oficial para cubrir el hueco de pensiones contributivas 1975-2000 tras los 404 de MITES.

Archivos modificados:
- `scripts/process-pensiones-contributivas-no-contributivas-1975-2070.ps1`
- `data/processed/pensiones/2026-05-25_seguridad-social_pensiones-contributivas-observado-modelizado_1975-2070.csv`
- `data/checksums.sha256`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `ai/current.md`

Resumen de cambios:
- Descargadas tablas oficiales de INEbase Historia / Anuario Estadistico de Espana en `data/raw/inebase-historia/pensiones-contributivas/`.
- Incorporado el tramo observado 1986-2000 de pensiones contributivas como medias anuales en miles de pensiones, convertido a pensiones.
- Reducido el hueco sin estimar de contributivas de 1975-2000 a 1975-1985.
- Documentado que los PDFs localizados para 1976-1979 y 1981-1982 quedan como candidatos pendientes porque son cortes a 31 de diciembre con estructura antigua.

Estado siguiente:
- Extraer y validar 1976-1979 y 1981-1982 por separado si se decide mezclar cortes a 31 de diciembre con medias anuales, o seguir buscando BEL/eSTADISS/Anuarios con media anual para 1975-1985.
