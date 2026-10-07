# 2026-10-07 — MEI y AT/EP como desplegables opcionales

## Objetivo

En el paso 3 v2, plegar los paneles MEI y AT/EP para que el detalle sea opcional.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/escenario/EscenarioSocial.css`
- `ai/current.md`

## Resumen

Los dos paneles elevados del paso 3 (MEI y AT/EP) salen cerrados: solo se ve el título con el tipo vigente y un +. Al tocar se abre el contenido que ya estaba (escalera y tabla del MEI, aguja y textos de AT/EP, y el «Ver más detalle» interno del MEI). Misma pieza `EscNotePanel`, botón con `aria-expanded`. La v1 no cambia.

## Estado siguiente

Sin commit (no solicitado).
