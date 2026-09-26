# 2026-09-26 · v2 Escenario · pasos 10 y 11

- Fecha: 2026-09-26.
- Objetivo: completar dos protagonistas que faltaban al contrastar los pasos 10 y 11 con las maquetas D.
- Archivos modificados: `WorkerFinalSummaryCard.tsx`, `WorkerKnowledgeCheckCard.tsx`, `FiscalEscenario.css`, `ai/current.md`.
- Resumen: el bloque de recaudación del paso 10 usa en v2 seis filas de carrera con barras proporcionales y detalle al pulsar; la portada del paso 11 separa las 37 preguntas y 10 apartados como cifras de gran formato. Ambas ramas usan el contexto de variante y dejan la v1 igual.
- Comprobación: `tsc -b`, `verify:styles`, `verify:scenario` y `git diff --check` correctos.
- Estado siguiente: revisar el resultado en móvil cuando se pueda iniciar un navegador aislado y contrastar las proporciones restantes con las maquetas.
