# 2026-10-01 — Paso 12 sin botón Continuar

## Objetivo
Quitar el botón «Continuar» deshabilitado en el último paso del recorrido (Fuentes del cálculo).

## Archivos modificados
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/escenario/EscenarioStep.css`

## Resumen
En el paso 12 no hay paso siguiente: el botón siguiente ya no se renderiza (variante escenario y barra `wfsc-chrome`). Solo queda «Anterior» hacia Comprueba lo aprendido.

## Estado siguiente
Verificar en `/calculadora-fiscal` paso 12 que la barra inferior solo muestra retroceso.
