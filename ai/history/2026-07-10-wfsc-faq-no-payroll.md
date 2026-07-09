# 2026-07-10 — Sin nómina en paso FAQ

## Objetivo

No mostrar el panel de nómina simplificada en el paso 8 (Preguntas frecuentes) de `WorkerFiscalStepsCard`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- `showPayrollHelp` false cuando `activeStep.id === 8`.
- El `aside.wfsc-help` con `PayrollExamplePanel` solo se renderiza si `showPayrollHelp`.
- Clase `wfsc-hero--single` para layout de una columna sin el panel lateral.

## Estado siguiente

- Revisar paso 8 en `/calculadora-fiscal` en escritorio y móvil.
