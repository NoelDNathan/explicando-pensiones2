# 2026-09-07 — Quitar aclaración lateral del paso 7

## Objetivo

Eliminar el aside de aclaración del paso 7 («No aparece en la nómina» / «¿Por qué van después de los tramos?»).

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/history/2026-09-07-paso7-quitar-aclaracion.md`
- `ai/current.md`

## Resumen de cambios

- El héroe del paso 7 queda solo con el texto principal y las tarjetas de concepto (reducción vs deducción, reembolsable).
- Se retiran las clases `wfsc-help--concept` / `wfsc-stage--concept` / `wfsc-hero--concept`.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
