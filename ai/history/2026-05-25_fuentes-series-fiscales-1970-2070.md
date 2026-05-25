# Interaccion: fuentes para series fiscales 1970-2070

Fecha: 2026-05-25

## Objetivo

Crear una tabla metodologica de donde obtener datos 1970-2070 para gasto publico, intereses de deuda, deficit, deuda total, gasto en pensiones, gasto en sanidad y PIB de Espana.

## Archivos modificados

- `data/methodology/fuentes-series-fiscales-1970-2070.md`
- `ai/current.md`
- `ai/history/2026-05-25_fuentes-series-fiscales-1970-2070.md`

## Resumen de cambios

- Anadido un mapa de fuentes con columnas de fuente historica, fuente de proyeccion, viabilidad 1970-2070 y comentario metodologico.
- Documentada la necesidad de separar observado, escenario/proyeccion y aproximacion metodologica.
- Registrado que intereses, deficit, gasto publico total, sanidad y PIB aun requieren procesamiento especifico antes de uso editorial.

## Estado siguiente

Si se decide convertir esta tabla en datasets, el siguiente paso es descargar/procesar cada serie con metadata completa, checksums y columna `estado_dato`, sin mezclar fuentes historicas y escenarios como si fueran una unica serie observada.
