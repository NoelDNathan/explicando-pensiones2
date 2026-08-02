# 2026-08-02 — Tipografía más grande en resumen intro

- Objetivo: hacer más legibles los textos del resumen rápido inicial de `/calculadora-fiscal`.
- Archivos modificados: `WorkerFiscalSummaryCard.css`, `Irpf2025StructuredAdjustmentsForm.tsx` (import sin uso que bloqueaba build), `ai/current.md`.
- Cambios: subidos ~dos escalones tipográficos en lead, titular, nota, leyenda, pie, CTA y etiquetas del slider de sueldo dentro de la variante intro.
- Verificación: `pnpm run build` correcto tras eliminar el import `FileCheck2` no usado.
- Estado siguiente: layout de pagas junto al salario (ver entrada siguiente).
