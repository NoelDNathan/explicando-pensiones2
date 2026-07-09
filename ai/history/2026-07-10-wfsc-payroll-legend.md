# 2026-07-10 — Leyenda azul/verde en nómina paso 3

## Objetivo

Indicar visualmente en el panel de nómina que el resaltado azul corresponde a la cotización del trabajador y el verde a la aportación de la empresa.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- Leyenda condicional bajo el `figcaption`, visible solo en pasos con `highlightWorkerRows` o `highlightCompanyRows` (paso 3).
- Textos: «Azul: cotización del trabajador» y «Verde: aportación de la empresa», con muestras de color alineadas al resaltado de la nómina.

## Verificación

- `pnpm run build`: falla por errores TS preexistentes en otros módulos. Sin errores nuevos en WFSC.

## Estado siguiente

- Revisar la leyenda en escritorio y móvil en el paso 3 de `/calculadora-fiscal`.
