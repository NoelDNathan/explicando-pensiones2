# 2026-07-19 — Claridad en datos de descendientes

- Objetivo: hacer comprensibles los campos familiares que generaban dudas en el paso de reducciones.
- Archivos modificados: `WorkerPersonalReductionsCard.tsx`, `WorkerPersonalReductionsCard.css`, `ai/current.md`.
- Cambios: renombrados los campos de rentas, reparto del mínimo y pensión de alimentos; añadidos tres iconos de ayuda con explicaciones prácticas; reescrita la casilla de sentencia o convenio para indicar cuándo marcarla y su efecto.
- Verificación: `tsc --noEmit` y `vite build` correctos; comprobación visual en escritorio y móvil 390 px, sin desbordamiento horizontal.
- Estado siguiente: continuar afinando solo los textos o comportamientos de la calculadora que el usuario señale.
