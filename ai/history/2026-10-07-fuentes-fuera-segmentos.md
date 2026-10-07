# 2026-10-07 — Fuentes fuera de segmentos y enlace inferior

## Objetivo

Quitar «Fuentes del cálculo» de la barra de segmentos superior y ofrecer acceso fijo abajo en todas las pantallas.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `src/components/worker-salary-dashboard/escenario/EscenarioStep.css`
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `src/components/worker-salary-dashboard/WorkerKnowledgeCheckCard.tsx`

## Resumen

- Los segmentos (`esc-step__segments` y `wfsc-step-dots`) solo listan pasos 0–11; el id 12 queda como pantalla aparte.
- «Continuar» ya no avanza al paso 12; el enlace «Fuentes del cálculo» va en la barra inferior fija (escenario y clásica).
- Paso 0 (resumen inicial): barra inferior solo con enlace a fuentes.
- Repaso (paso 11): saltar o terminar vuelve al resumen (paso 10), no a fuentes.

## Estado siguiente

Probar en `/calculadora-fiscal/v2` que no aparece el segmento 12 arriba y que el enlace inferior abre fuentes desde varios pasos y desde el paso 0.
