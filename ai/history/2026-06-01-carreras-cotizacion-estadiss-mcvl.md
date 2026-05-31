Fecha: 2026-06-01

Objetivo: continuar la busqueda de datos de anos/dias cotizados antes de jubilarse, especialmente 2015 y 2022-2026.

Archivos modificados:
- `data/raw/seguridad-social/carreras-cotizacion/2026-06-01_seguridad-social_mcvl-guia-contenido-campos-cotizacion-jubilacion_2021.pdf`
- `data/processed/seguridad-social/2026-05-28_seguridad-social_altas-jubilacion-anos-cotizados-cobertura_1975-2026.csv`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/methodology/fuentes-carreras-cotizacion.md`
- `data/checksums.sha256`
- `ai/current.md`

Resumen de cambios:
- Revisada la via eSTADISS: permite exportar Excel/CSV, pero requiere captcha, por lo que queda como exportacion manual documentada.
- Descargada la guia oficial MCVL 2021 para documentar campos administrativos de anos/periodo cotizado.
- Actualizada la cobertura: no se localizaron informes publicos con tabla equivalente posterior al dato 2021; 2022-2026 queda pendiente de eSTADISS o microdato.

Estado siguiente:
- Realizar exportacion manual eSTADISS si se puede configurar la tabla de altas de jubilacion por anos cotizados.
- Si se obtiene MCVL, disenar transformacion separada para dias/meses cotizados desde 1996.
