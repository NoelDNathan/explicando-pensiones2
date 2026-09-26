# 2026-09-26 · v2 Escenario · ajuste de fidelidad

- Fecha: 2026-09-26.
- Objetivo: contrastar la implementación de la v2 con las maquetas D y corregir diferencias estructurales visibles.
- Archivos modificados: `EscenarioIntro.css`, `Irpf2025StructuredAdjustmentsForm.tsx`, `WorkerPersonalReductionsCard.tsx`, `WorkerConsumptionTaxesCard.tsx`, `EscenarioParts.tsx`, `Escenario.css`, `EscenarioPersonalReductions.css`, `FiscalEscenario.css`, `App.tsx`, `ai/current.md`.
- Resumen: la pregunta inicial adopta la escala de la maqueta; las preguntas reales de ajustes pasan por `EscQuestion`; el paso 8 sustituye el anillo heredado por una cesta horizontal agrupada por 0 %, 4 %, 10 %, 21 %, especiales y el reparto pendiente; el paso 7 añade sus dos monedas; y se refuerza la escala de los relojes patrimoniales y la cifra protagonista del resumen. La cesta se añadió también a `/componentes`.
- Comprobación: se obtuvo una captura local de Chrome a 1280 px de la portada; `tsc -b`, `verify:styles`, `verify:scenario` y `git diff --check` correctos. La captura a 390 px no se pudo generar: Chrome devuelve código 13 al arrancar con perfiles temporales posteriores.
- Estado siguiente: retomar la comparación visual móvil en un navegador operativo y ajustar cualquier diferencia restante de orden o proporción frente a las maquetas D.
