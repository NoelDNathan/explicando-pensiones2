# 2026-08-03 — Paso 5 sin nómina en el encabezado

## Objetivo

Quitar la nómina de ejemplo del paso 5 (deducciones y salario en especie), porque esas partidas no aparecen en la nómina mensual, y compactar el encabezado para dejar más espacio al formulario.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- El paso 5 ya no muestra `PayrollExamplePanel`.
- En su lugar hay un aside conceptual compacto (`wfsc-help--concept`) que aclara deducción vs beneficio exento y que no es una línea de la nómina.
- Tipografía, órbita y padding del stage se reducen en modo `wfsc-stage--concept`.
- Texto introductorio del paso 5 acortado a un párrafo.

## Verificación

- `pnpm run build` correcto.
- Escritorio: stage ~244 px, sin `.wfsc-payroll`, sin overflow horizontal.
- Móvil 390 px: layout apilado, sin overflow horizontal.

## Estado siguiente

Si el aside conceptual del paso 5 resulta redundante con el párrafo, se puede acortar aún más o unificar el mensaje en una sola línea.
