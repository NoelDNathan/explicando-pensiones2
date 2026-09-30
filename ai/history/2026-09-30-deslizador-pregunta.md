# 2026-09-30 — Deslizador de la pregunta 1

## Objetivo

Que el círculo del deslizador de «¿cuántos euros de cada 100 acaban en Hacienda?» quede bajo el cursor.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.tsx`
- `src/components/worker-salary-dashboard/escenario/EscenarioSummary.css`
- `ai/current.md`

## Resumen

El `input range` nativo pintaba el tirador en otro sitio que el puntero (Chrome y Edge con la escala de Windows; Firefox, con el borde del tirador). La pista y el círculo se dibujan ahora con CSS a partir del valor, y el arrastre se calcula en píxeles CSS. El `input` se queda solo para el teclado y el lector de pantalla.

## Estado siguiente

Comprobar en el navegador de la persona usuaria. El deslizador del salario (pregunta 2 y el resto de pasos) sigue siendo nativo y puede hacer lo mismo.
