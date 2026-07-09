# 2026-07-09 - Corrige resaltado Desempleo en paso 2

## Objetivo

Evitar que la fila `Desempleo` del bloque de aportacion empresa quede resaltada en verde en el paso 2 (`Limites de cotizacion`).

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`

## Resumen de cambios

- Se elimina `unemployment-base` de `PAYROLL_EXAMPLES[2].highlightRows`.
- El paso 2 sigue resaltando `BASE CC.CC.`, `BASE CC.PP.` y el total de bases; la fila de desempleo queda sin resaltar porque corresponde al desglose de cotizaciones del paso 3.

## Verificacion

- Cambio localizado en configuracion de resaltados; sin errores TS nuevos esperados en este archivo.

## Estado siguiente

- Revisar visualmente el paso 2 y, si procede, valorar si `unemployment-base` debe resaltarse en el paso 3 junto a las demas cotizaciones.
