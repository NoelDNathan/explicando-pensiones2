# 2026-08-03 — Ayuda/movilidad solo con discapacidad 33 %

## Objetivo

Que la pregunta de ayuda/movilidad reduzca refleje el Sí/No: no mostrarla cuando el 65 % ya incluye el incremento automático.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`
- `ai/history/2026-08-03-ayuda-movilidad-solo-33.md`

## Resumen de cambios

- Pregunta de ayuda/movilidad solo si discapacidad = 33 %; Sí suma +3.000 EUR y No no muestra badge.
- Con 65 %, el +3.000 va en el badge de discapacidad (+12.000) y se explica con una nota.
- Misma regla para el contribuyente y para hijo/ascendiente.

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

Commit/push solo si el usuario lo pide.
