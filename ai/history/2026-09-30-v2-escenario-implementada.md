# 2026-09-30 · v2 «Escenario» implementada según las maquetas D

**Objetivo:** implementar en `/calculadora-fiscal/v2` el diseño D de todas las pantallas (la versión de Codex no convencía).

**Archivos:** se deshizo el código de Codex (`80d84f7`). Nuevos en `src/components/worker-salary-dashboard/escenario/`: `D.css`, `EscenarioSummary.css`, `EscenarioSalaryBase.css`, `EscenarioLimits.css`, `EscenarioForms.css`, `EscenarioIrpf.css`, `EscenarioIva.css`, `EscenarioWealth.css`, `EscenarioFinal.css`, `EscenarioKnowledge.css`, `EscenarioSources.css`; ampliados `EscenarioParts.tsx`, `EscenarioStep.css`, `Escenario.css`. Ramas v2 en `WorkerFiscalSummaryCard`, `WorkerSalaryBaseCard`, `WorkerContributionLimitsCard`, `WorkerPersonalReductionsCard`, `WorkerIrpfTranchesCard`, `WorkerConsumptionTaxesCard`, `WorkerWealthTaxesCard`, `WorkerFinalSummaryCard`, `WorkerKnowledgeCheckCard`, `WorkerCalculationSourcesCard`, `WorkerFiscalStepsCard` (nómina nueva, conceptos con dibujo, marcas). Tokens nuevos: `--fiscal-stage-blue-fill`, `-positive-mark`, escala `--fiscal-stage-vat-*`. `FiscalEscenario.css`: deslizador de salario con aspecto D.

**Comprobado:** `tsc`, `verify:styles`, `verify:scenario` en verde; los 13 pasos a 1280, 390 y 375 px sin scroll horizontal ni títulos o cifras que se salgan; todo el texto de la v1 aparece en la v2 (comparación palabra a palabra por paso); contraste de textos por script; v1 intacta; capturas de cada paso comparadas con su maqueta.

**No comprobado:** recorrido completo con teclado ni lector de pantalla; movimiento reducido solo por CSS.

**Siguiente:** revisión de la persona usuaria; textos nuevos pendientes; piezas en `/componentes`.
