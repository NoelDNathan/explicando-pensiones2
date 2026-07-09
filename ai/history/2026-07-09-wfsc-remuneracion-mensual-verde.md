# 2026-07-09 - Ajusta resaltado Importe remuneracion mensual en paso 2

## Objetivo

Corregir el resaltado verde del bloque de bases en el paso 2 de `WorkerFiscalStepsCard`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`

## Resumen de cambios

- En `PAYROLL_EXAMPLES[2]`, se sustituye `common-base-detail` por `salary-monthly`.
- `Importe remuneracion mensual` queda resaltado en verde.
- La fila `TOTAL` del bloque de aportacion empresa deja de resaltarse.

## Estado siguiente

- Revisar visualmente el paso 2 en `/calculadora-fiscal`.
