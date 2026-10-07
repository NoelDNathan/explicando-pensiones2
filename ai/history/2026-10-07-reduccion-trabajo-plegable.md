# 2026-10-07 — Reducción trabajo plegable

## Objetivo
Hacer opcional y extensible el bloque `WorkIncomeReductionExplainer` en el paso 5: resumen compacto por defecto y vista completa actual al expandir.

## Archivos modificados
- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.tsx`
- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.css`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx` (comentario)

## Resumen
- En `variant="embedded"` el explainer arranca plegado (`collapsible` por defecto).
- Resumen según caso: reducción aplicada (importe, tramo, ahorro), pendiente por otras rentas, bloqueada o fuera de rango.
- «Ver explicación completa» / «Ocultar explicación detallada» muestra u oculta simulador, gráficos y textos actuales sin cambios.
- La página `/reduccion-trabajo` sigue mostrando todo (`collapsible` desactivado salvo que se pase la prop).

## Estado siguiente
- Probar en paso 5 escenario con salarios bajos, altos y con otras rentas.
