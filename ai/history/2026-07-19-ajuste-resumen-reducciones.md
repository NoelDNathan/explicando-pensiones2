# 2026-07-19 - Ajuste visual del resumen de reducciones

- Objetivo: corregir la composición del resumen adhesivo y la superposición de los desplegables.
- Archivos modificados: `WorkerPersonalReductionsCard.css`, `ai/current.md`.
- Resumen: el resumen usa cuatro métricas en fila en escritorio y dos en móvil; un desplegable abierto gana prioridad sobre la barra adhesiva.
- Verificación: TypeScript y Vite build correctos; revisión DOM en escritorio y móvil 390 px, sin overflow horizontal.
- Estado siguiente: continuar las mejoras visuales solicitadas en la calculadora fiscal.
