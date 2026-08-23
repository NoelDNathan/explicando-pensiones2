# 2026-08-23 — Pregunta unificada colegio profesional

## Objetivo

Fusionar «¿Pagas un colegio profesional…?» y «¿Es obligatorio estar colegiado?» en una sola pregunta, con ejemplos de profesiones en la descripción.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`

## Resumen

- Pregunta principal: «¿Pagas un colegio profesional donde es obligatorio estar colegiado?»
- Descripción con ejemplos: médico, enfermera, farmacéutico, abogado, arquitecto, ingeniero colegiado, economista, veterinario, dentista, etc.
- Eliminada la subpregunta duplicada y el componente `ProfessionalDuesQuestions`.
- `ReductionQuestion` admite `onYes`; al responder Sí se marca colegiación obligatoria y solo queda el importe anual.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

- Sin cambios pendientes en este punto.
