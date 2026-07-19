# 2026-07-19 — Decisiones explícitas en reducciones

- Objetivo: hacer que el usuario pueda completar reducciones con decisiones simples, sin recorrer campos que no aplican.
- Archivos modificados: `Irpf2025StructuredAdjustmentsForm.tsx`, `Irpf2025StructuredAdjustmentsForm.css`, `FiscalSoftTheme.css`, `ai/current.md`.
- Cambios: componente reutilizable de pregunta con acciones `Sí, me aplica` y `No, continuar`; los tres bloques completos de reducciones se despliegan solo al responder sí; la respuesta no reinicia de forma segura los valores del grupo.
- Verificación: `tsc --noEmit` y `vite build` correctos; flujo de sí/no comprobado en navegador con limpieza de importe introducido.
- Estado siguiente: ajustar el contenido de cualquier subpregunta que el usuario indique como poco natural.
