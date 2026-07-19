# 2026-07-19 — Preguntas cotidianas de reducciones

- Objetivo: eliminar los conocimientos fiscales necesarios para responder el paso de reducciones.
- Archivos modificados: `Irpf2025StructuredAdjustmentsForm.tsx`, `Irpf2025StructuredAdjustmentsForm.css`, `WorkerPersonalReductionsCard.tsx`, `ai/current.md`.
- Cambios: los bloques generales se dividen en preguntas sobre hechos reconocibles de la vida cotidiana; se conserva cada campo y regla fiscal detrás de la respuesta afirmativa. Los datos de hijos y ascendientes se expresan asimismo como preguntas directas.
- Verificación: `tsc --noEmit` y `vite build` correctos; revisión visual de escritorio del recorrido de preguntas correcta.
- Estado siguiente: continuar puliendo textos específicos si el usuario identifica alguno que aún no resulte natural.
