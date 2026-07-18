# 2026-07-19 - Resultado de reducciones claro y adherente

- Objetivo: aclarar el cálculo de reducciones y mínimos familiares, y mantener visible su impacto durante el scroll.
- Archivos modificados: `WorkerPersonalReductionsCard.tsx`, `WorkerPersonalReductionsCard.css`, `FiscalWorkerDashboard.tsx`, `FiscalSoftTheme.css`, `ai/current.md`.
- Resumen: se separan las reducciones de base del mínimo personal y familiar, se muestra el mínimo estatal/autonómico real y el resultado pasa a una barra adhesiva. También se reemplaza el pequeño menú nativo de las tarjetas superiores por un desplegable accesible propio.
- Verificación: TypeScript y Vite build correctos; revisión DOM en escritorio y móvil 390 px, sin overflow horizontal. La barra queda fijada al superar su posición durante el scroll.
- Estado siguiente: seguir simplificando los textos y campos de reducciones/deducciones que genere confusión al usuario.
