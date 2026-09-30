# 2026-09-30 — Pregunta de entrada: una sola respuesta

## Objetivo

Impedir repetir la pregunta «de cada 100 €…» tras haberla contestado.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`

## Resumen

- Eliminados «Volver a responder» (variante Escenario y soft) y «Cambiar mi respuesta» en la pregunta 2.
- Efecto que fija `reveal` cuando `taxGuess` ya está guardada.
- `handleTaxGuessChange` ignora `null` para no borrar la respuesta persistida.

## Estado siguiente

Nada pendiente de esta petición; la pregunta solo vuelve si el usuario borra `fwd-tax-guess-v1` en el navegador.
