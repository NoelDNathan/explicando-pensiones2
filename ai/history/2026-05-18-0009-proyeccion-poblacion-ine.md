Fecha: 2026-05-18

Objetivo: descargar las previsiones oficiales de evolucion de la poblacion en Espana.

Archivos modificados:
- `data/raw/ine/proyecciones-poblacion/poblacion-residente/2026-05-18_ine_proyecciones-poblacion_poblacion-residente-sexo-edad_2024-2074.json`
- `data/processed/ine/2026-05-18_ine_proyeccion-poblacion-residente-espana-sexo-edad_2024-2074.csv`
- `data/sources.md`
- `data/methodology/transformations.md`
- `ai/current.md`
- `ai/history/2026-05-18-0009-proyeccion-poblacion-ine.md`

Resumen de cambios:
- Descargada desde el INE la tabla API 36643 de proyeccion de poblacion residente a 1 de enero por sexo y edad.
- Generado un CSV procesado con 15.606 observaciones para 2024-2074, manteniendo edades simples y "Todas las edades".
- Registrada la fuente y documentada la transformacion.

Estado siguiente:
- Si se usa para ratios de dependencia o poblacion en edad de trabajar, crear un CSV derivado separado y documentar las edades elegidas.
