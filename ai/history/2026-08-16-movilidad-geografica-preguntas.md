# 2026-08-16 — Movilidad geográfica como preguntas encadenadas

## Objetivo

Que la reducción por mudanza a otro municipio para empezar un trabajo use el mismo patrón conversacional que el plan del cónyuge: preguntas Sí/No progresivas en lugar de checkboxes sueltos.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `ai/current.md`
- `ai/history/2026-08-16-movilidad-geografica-preguntas.md`

## Resumen de cambios

- Nuevo componente `GeographicMobilityQuestions` con tres subpreguntas encadenadas (paro, empleo en otro municipio, cambio de residencia).
- Al responder No en cualquier paso se limpian los datos posteriores y se muestra una nota breve.
- Tras cumplir los tres requisitos aparecen año de mudanza, salario bruto y gastos específicos, con aviso del tope de 2.000 €.
- Helper `clearGeographicMobilityFields` reutilizado en el `onNo` de la pregunta principal.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

Commit/push solo si el usuario lo pide.
