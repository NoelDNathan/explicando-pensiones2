# 2026-09-30 · Selector de grupo: min/máx centrados

Objetivo: en el trigger del paso 2 (v2 Escenario), las etiquetas Mín./Máx. y las cifras no quedaban bien alineadas con el nombre del grupo.

Archivos: `src/components/worker-salary-dashboard/escenario/EscenarioLimits.css`, `ai/current.md`.

Cambios: el preview del trigger usa la misma rejilla de tres columnas que las opciones del desplegable (badge | nombre | bases), con `align-items: center`. Cada par min/máx pasa de `baseline` a `center`. Ajuste fino: bases más a la izquierda (menos hueco con el nombre), gap etiqueta–importe al 50 % (4px) y nombre en una línea con ellipsis si no cabe.

Estado siguiente: revisión visual en `/calculadora-fiscal/v2` paso 2; commit cuando el usuario lo pida.
