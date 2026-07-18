# 2026-07-19 — Reducciones como preguntas

- Objetivo: transformar el paso de reducciones en un recorrido entendible para público general.
- Archivos modificados: `WorkerPersonalReductionsCard.tsx`, `WorkerPersonalReductionsCard.css`, `Irpf2025StructuredAdjustmentsForm.tsx`, `FiscalSoftTheme.css`, `ai/current.md`.
- Cambios: preguntas directas para la situación familiar, introducción de paso 1, tarjetas de preguntas más anchas, cálculo familiar progresivo y bloques fiscales opcionales formulados como preguntas.
- Verificación: `tsc --noEmit` y `vite build` correctos; escritorio y móvil 390 px sin desbordamiento horizontal.
- Estado siguiente: seguir simplificando los detalles internos de una pregunta concreta si el usuario detecta otro texto o caso que no entienda.
