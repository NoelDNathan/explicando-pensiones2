# 2026-08-17 — Patrimonio protegido con preguntas concretas

## Objetivo

Sustituir el checkbox genérico «La aportación cumple los requisitos» del patrimonio protegido por un subflujo de preguntas Sí/No en lenguaje cotidiano.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/irpf2025Adjustments.ts`
- `src/components/fiscal-worker-dashboard/irpf2025Calc.ts`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`

## Resumen de cambios

- Eliminado `protectedAssetsEligible`; la elegibilidad se deriva de tres respuestas: patrimonio constituido, parentesco/legitimación y aportante distinto del titular.
- Nuevo componente `ProtectedAssetsQuestions` con flujo encadenado y pregunta opcional sobre aportaciones de otras personas (para el límite de 24.250 €).
- Avisos de cálculo más específicos según qué requisito falte.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

- Revisar visualmente el subflujo en escritorio y móvil en `/calculadora-fiscal` paso 4.
