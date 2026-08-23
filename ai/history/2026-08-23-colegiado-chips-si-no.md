# 2026-08-23 — Colegiado obligatorio con chips Sí/No

## Objetivo

Alinear la subpregunta de colegiado obligatorio con el formato de otras preguntas del paso 4 (como el grado de discapacidad): texto de pregunta + chips Sí/No.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`

## Resumen

- Eliminado el `CheckField` del bloque de colegio profesional.
- Nuevo componente `ProfessionalDuesQuestions` con importe anual y subpregunta «¿Es obligatorio estar colegiado para ejercer?» usando `YesNoChips`.
- Nota contextual si hay importe pero la colegiación no es obligatoria.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

- Sin cambios pendientes en este punto.
