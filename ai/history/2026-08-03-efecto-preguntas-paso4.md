# 2026-08-03 — Efecto en euros junto a las preguntas del paso 4

## Objetivo

Que cada pregunta del paso 4 muestre al lado el efecto en euros de la respuesta; si no hay efecto, no se muestra nada.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`
- `ai/history/2026-08-03-efecto-preguntas-paso4.md`

## Resumen de cambios

- Badge `irpf-question-effect` junto al título de cada pregunta familiar y de cada reducción.
- En el detalle del hijo/ascendiente: efecto solo en edad (+2.800 / +1.400), discapacidad, asistencia, reparto al 50 % y exclusión por alimentos formalizados.
- Preguntas puerta (convivencia, ingresos, declaración) y estado civil sin badge si no mueven euros.
- Reducciones: importe aplicado estimado (sindicato, colegio, abogado, movilidad, planes, conjunta, etc.).
- Tema suave con variantes verde (mínimo), azul (reducción) y ámbar (resta de mínimo).

## Verificacion

- `pnpm run build` correcto.
- En `/calculadora-fiscal` paso 4: con 1 hijo menor de 3 y discapacidad 33 %, badges `+8200`, `+2800` y `+3000` EUR visibles; sin efecto no aparece badge.

## Estado siguiente

Commit/push solo si el usuario lo pide.
