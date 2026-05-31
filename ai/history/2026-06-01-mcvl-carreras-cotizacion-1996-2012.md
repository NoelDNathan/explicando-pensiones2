Fecha: 2026-06-01

Objetivo: continuar la via 1996-2012 para anos/dias cotizados al jubilarse mediante MCVL o dato administrativo.

Archivos modificados:
- `scripts/process-mcvl-carreras-cotizacion-1996-2012-coverage.ps1`
- `data/methodology/mcvl-carreras-cotizacion-1996-2012.md`
- `data/processed/seguridad-social/2026-06-01_mcvl_carreras-cotizacion-jubilacion-cobertura-candidata_1996-2012.csv`
- `data/raw/seguridad-social/carreras-cotizacion/2026-06-01_seguridad-social_mcvl-guia-contenido-campos-cotizacion-jubilacion_2025.pdf`
- `data/processed/seguridad-social/2026-05-28_seguridad-social_altas-jubilacion-anos-cotizados-cobertura_1975-2026.csv`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/methodology/fuentes-carreras-cotizacion.md`
- `data/checksums.sha256`
- `ai/current.md`

Resumen de cambios:
- Preparada una metodologia especifica para calcular carreras de cotizacion 1996-2012 si se obtiene Base de Datos de Prestaciones o microdatos MCVL.
- Generada una tabla de cobertura candidata con 17 anos: 1996-2003 queda como pendiente de acceso administrativo completo; 2004-2012 como pendiente de microdatos MCVL.
- Descargada la guia MCVL 2025 y documentados los campos necesarios de tabla 4.

Estado siguiente:
- No hay valores calculados aun. Para producirlos hace falta acceso a Base de Datos de Prestaciones/sala segura o incorporar microdatos MCVL autorizados bajo `data/raw/seguridad-social/mcvl/`.
