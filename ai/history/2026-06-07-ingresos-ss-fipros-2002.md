# 2026-06-07 - Ingresos Seguridad Social FIPROS y discrepancia 2002

## Objetivo

Dejar resuelto el criterio de uso para ingresos historicos de Seguridad Social: 1990-1994 sigue como candidato FIPROS por falta de fuentes primarias limpias, y la discrepancia de 2002 debe impedir el uso de totales historicos.

## Archivos modificados

- `data/methodology/validacion-ingresos-seguridad-social-1990-1994.md`
- `data/metadata.md`
- `data/inventory.md`
- `data/sources.md`
- `data/methodology/transformations.md`
- `ai/current.md`
- `ai/history/2026-06-07-ingresos-ss-fipros-2002.md`

## Resumen de cambios

- Se marco la discrepancia de 2002 como resuelta operativamente mediante bloqueo de los totales FIPROS: el total publicado repite 2001, no cuadra con los componentes y no debe usarse para serie historica ni porcentajes.
- Se mantuvo 1990-1994 solo como candidato FIPROS pendiente de fuente primaria limpia, limitado a `cotizaciones_sociales` y `transferencias_corrientes`.
- Se aclaro que no se crea un total corregido propio sin fuente primaria.

## Estado siguiente

Pendiente localizar el Anuario de Estadisticas Laborales, el Observatorio Social de Espana 2007 u otra liquidacion primaria limpia para confirmar o sustituir FIPROS. No hubo cambios de codigo ni datasets nuevos.
