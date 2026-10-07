# 2026-10-07 · Preguntas al final de cada paso

Fecha: 2026-10-07

## Objetivo

Quitar el paso 11 «Comprueba lo aprendido» (11 apartados seguidos) y mostrar las
preguntas de cada apartado al terminar el paso que las explica, para no perder
engagement al final del recorrido.

## Archivos modificados

- `src/components/worker-salary-dashboard/workerKnowledgeCheckQuestions.ts`
- `src/components/worker-salary-dashboard/WorkerKnowledgeCheckCard.tsx`
- `src/components/worker-salary-dashboard/WorkerKnowledgeCheckCard.css`
- `src/components/worker-salary-dashboard/escenario/EscenarioKnowledge.css`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/worker-salary-dashboard/knowledgeCheckReporting.ts`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerWealthTaxesCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/App.tsx`
- `ai/current.md`

## Resumen de cambios

- Cada sección del banco (`stepId` 1–10) se pinta al final de su paso.
- El paso 11 desaparece del recorrido; el contador pasa a 10/10. Fuentes sigue
  siendo el id 12. Un escenario guardado en 11 se remapea al 10.
- «Siguiente» no salta las preguntas: si el apartado no está corregido ni
  saltado, la página baja hasta el bloque. «Saltar estas preguntas» continúa.
- El envío anónimo se dispara cuando todos los apartados están corregidos o
  saltados y al menos uno se corrigió.

Texto nuevo (se puede quitar): el botón «Saltar estas preguntas». El resto
reutiliza copias ya existentes («Comprueba lo aprendido», el aviso de envío
anónimo, «Corregir apartado», «Continuar»).

## Estado siguiente

Valorar si en el paso 10, al terminar, se muestra un recap de aciertos de todo
el recorrido (el informe anónimo ya se envía sin esa pantalla). No hay commit:
el usuario no lo ha pedido.
