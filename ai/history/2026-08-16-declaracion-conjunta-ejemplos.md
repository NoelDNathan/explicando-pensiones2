# 2026-08-16 — Ejemplos declaración conjunta

## Objetivo

Añadir ejemplos y requisitos a la pregunta «¿Vas a hacer la declaración conjunta?» del paso 4.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
- `ai/current.md`

## Resumen de cambios

- Descripción ampliada con ejemplos (pareja e hijos, padre/madre con hijos).
- Nuevo desplegable `JointTaxationGuide` visible antes de responder, adaptado al estado civil.
- Contenido: unidad con cónyuge (3.400 €), unidad monoparental (2.150 €), convivencia con otro progenitor (sin reducción), requisitos comunes y ejemplos de hijos que forman unidad.
- `ReductionQuestion` admite prop opcional `guide` en el área del prompt.

## Verificación

- `pnpm run build` — correcto.

## Estado siguiente

Revisar en UI el desplegable en escritorio y móvil; confirmar que el texto se adapta al estado civil elegido.
