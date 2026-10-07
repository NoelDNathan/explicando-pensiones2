# 2026-10-07 — Quitar cascada paso 5

## Objetivo
Eliminar el bloque «Cómo cambian la base y el IRPF» (`esc-pr__cascade` / `DWaterfall`) del paso de reducciones de base en variante Escenario.

## Archivos modificados
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`

## Resumen
- Se quitó la sección `esc-pr__cascade` del paso 5 (reducciones de base).
- Se eliminó la construcción de `reductionSteps` y el import de `DWaterfall` (solo servía a esa cascada).
- La escalera del paso 7 (`DLadder` / `deductionSteps`) se mantiene.

## Estado siguiente
- Valorar si limpiar estilos huérfanos `.esc-pr__cascade` / `.esc-pr__minimum` en `EscenarioForms.css` si no se reutilizan.
