# 2026-09-30 — Paso 2: selector de grupo y Mensual/Anual

## Objetivo

Más aire entre el círculo G7 y el nombre del grupo, y alinear en vertical el centro del selector con el conmutador Mensual/Anual.

## Archivos modificados

- `src/components/worker-salary-dashboard/escenario/EscenarioLimits.css`

## Resumen

La etiqueta «Grupo de cotización» queda solo para lectores de pantalla (fuera del flujo), para que la fila alinee el trigger de 76 px con `d-segs`. Más margen entre badge y nombre, padding izquierdo del trigger y `align-items: center` explícito en `.esc-cl__controls.d-row`.

## Estado siguiente

Revisar en `/calculadora-fiscal/v2` paso 2 en escritorio.
