# 2026-09-30 — Moneda «reducción» en móvil

## Objetivo
Corregir el recorte de «0,30 €» dentro de `.esc-coin--small` en el paso 7 (concepto deducción vs reducción).

## Archivos modificados
- `src/components/worker-salary-dashboard/escenario/EscenarioStep.css`

## Resumen
La bolita pequeña tenía 80px de ancho mínimo pero el `strong` forzaba `1.25rem` (~81px con Anybody 900), desbordando el círculo. Se añadió `container-type: inline-size`, tipografía en `cqi` (proporción de la maqueta 30px/114px), padding, `max-width: 100%` y un poco menos de ancho variable en la fuente.

## Estado siguiente
Revisar en dispositivo real el paso 7; si hace falta, subir el mínimo de ancho de la moneda pequeña en viewports muy estrechos.
