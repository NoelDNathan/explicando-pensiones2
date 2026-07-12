# Centra panel de nomina en WorkerFiscalStepsCard

Fecha: 2026-07-12

## Objetivo

Centrar verticalmente el aside `.wfsc-help` (nomina simplificada) respecto al bloque explicativo en todos los pasos.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- `.wfsc-help`: `align-self: center` y `align-content: center`.
- En movil (<1240px): `justify-self: center` y ancho maximo coherente.
- El texto del paso sigue alineado arriba; solo la nomina se centra en el eje vertical.

## Verificacion

- Cambio solo CSS; revision visual pendiente en `/calculadora-fiscal`.

## Estado siguiente

- Comprobar en escritorio y movil que la nomina queda centrada en pasos con texto largo y corto.
