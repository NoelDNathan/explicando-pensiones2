# 2026-08-16 — Infobox plan cónyuge en lenguaje llano

## Objetivo

Simplificar el vocabulario del desplegable «¿Cuál es cuál?» y ajustar sus colores al tema suave.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- Títulos alineados con la pregunta principal: mutualidad profesional y seguro de jubilación.
- Definiciones más cortas y sin jerga (entidad de previsión, partícipe, plan de previsión asegurado).
- Overrides de color en tema suave para el infobox y textos del subflujo marital.

## Verificación

- `pnpm run build` — correcto.

## Estado siguiente

Revisar en UI el desplegable con estado civil casado/a.
