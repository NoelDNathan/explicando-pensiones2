# 2026-08-03 — Preguntas familiares estilo ReductionQuestion

## Objetivo

Que las preguntas de situación personal/familiar del paso 4 usen el mismo patrón visual e interactivo que las reducciones: `Sí, me aplica` / `No, continuar`, a ancho completo.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`
- `ai/history/2026-08-03-preguntas-familiares-estilo-reduccion.md`

## Resumen de cambios

- Sustituida la rejilla `TopField` (selectores compactos) por `FamilyQuestion` con el markup de `irpf-reduction-question`.
- Hijos, ascendientes y discapacidad: Sí abre chips de cantidad/grado; No limpia el valor.
- Ayuda/movilidad reducida solo aparece si hay discapacidad > 0.
- Estado civil se pregunta con chips de opción, sin puerta Sí/No.
- Añadidos estilos de `.irpf-reduction-question__options` y variantes soft.

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

Commit/push solo si el usuario lo pide.
