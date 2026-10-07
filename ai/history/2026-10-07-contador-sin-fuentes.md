# 2026-10-07 — Contador de pasos sin «Fuentes»

## Objetivo

Que el paso «Fuentes del cálculo» (id 12) no entre en el contador visual `01/12` del recorrido escenario.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`

## Resumen

- Total contado: 11 (pasos 1–11; excluye resumen 0 y fuentes 12).
- El contador `esc-step__count`, etiquetas de estado, barra de progreso (v1) y clamp de navegación usan constantes separadas (`FISCAL_COUNTED_STEP_TOTAL` vs `FISCAL_MAX_STEP_ID`).
- En fuentes: contador `11/11` y título sin «Paso 12 de …».

## Estado siguiente

Revisar en `/calculadora-fiscal/v2` que el paso 1 muestre `01/11` y que fuentes siga siendo accesible por segmentos y «Continuar».
