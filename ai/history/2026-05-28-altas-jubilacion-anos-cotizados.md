Fecha: 2026-05-28

Objetivo: obtener datos oficiales sobre anos cotizados antes de la jubilacion.

Archivos modificados:
- `scripts/process-seguridad-social-carreras-cotizacion-altas-2013-2021.ps1`
- `data/raw/seguridad-social/carreras-cotizacion/`
- `data/processed/seguridad-social/2026-05-28_seguridad-social_altas-jubilacion-anos-cotizados-tramos_2013-2021.csv`
- `data/processed/seguridad-social/2026-05-28_seguridad-social_altas-jubilacion-anos-cotizados-cobertura_1975-2026.csv`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/methodology/fuentes-carreras-cotizacion.md`
- `data/checksums.sha256`
- `ai/current.md`

Resumen de cambios:
- Descargados PDFs oficiales de Informes Economico-Financieros de Seguridad Social/Congreso con tablas de altas de jubilacion por anos cotizados.
- Procesadas distribuciones porcentuales por regimen y tramos para 2013, 2014 y 2016-2021.
- Documentada cobertura 1975-2026 y limitaciones: no hay dias cotizados ni media exacta; 2015 y 2022-2026 quedan pendientes; 1975-1995 no localizado como serie comparable.

Estado siguiente:
- Buscar o exportar 2015 y 2022-2026 desde eSTADISS/informes recientes.
- Si se quieren dias exactos, preparar una linea separada de microdato administrativo/MCVL desde 1996.
