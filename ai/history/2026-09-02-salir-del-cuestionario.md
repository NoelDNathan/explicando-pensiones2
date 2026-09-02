# 2026-09-02 — Copy «Salir del cuestionario»

## Objetivo

Cambiar el texto del botón fantasma del pie de cada apartado del cuestionario (paso 11).

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerKnowledgeCheckCard.tsx`
- `ai/current.md`

## Resumen de cambios

- El botón que abandona el cuestionario y continúa el recorrido dice «Salir del cuestionario» en lugar de «Salir y seguir con el recorrido».
- El `onClick` sigue llamando a `onGoToStep?.(nextStepId)`.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
