# 2026-06-09 - Explica limites de cotizacion con ejemplos

## Objetivo

Mantener el slider de salario y simplificar la explicacion de limites de cotizacion con casos de base minima y maxima.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.tsx`
- `ai/current.md`

## Resumen de cambios

- Se mantuvo el slider de salario en `WorkerSalaryBaseCard`.
- Reescrita la explicacion de `Limites de cotizacion` con lenguaje sencillo.
- Anadidos ejemplos con Grupo 7: 100 EUR por debajo de la base minima y 100 EUR por encima de la base maxima.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con aviso conocido de chunk grande.
- `http://127.0.0.1:5194/calculadora-fiscal`: HTTP 200.

## Estado siguiente

Revisar visualmente `/calculadora-fiscal` en escritorio y movil cuando haya navegador/captura disponible.
