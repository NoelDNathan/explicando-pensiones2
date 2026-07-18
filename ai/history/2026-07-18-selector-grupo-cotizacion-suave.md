# Controles y resultados fiscales mas claros

- Fecha: 2026-07-18.
- Objetivo: suavizar los controles, ayudas y bloques de resultado que aun conservaban rasgos del tema oscuro.
- Archivos modificados: `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`, `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`, `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`, `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`, `ai/current.md` y este historial.
- Resumen: el selector de grupo y sus opciones usan una apariencia clara; todos los iconos de ayuda reutilizan `InfoButton` con el mismo tamano, color y popover; el aviso de datos pendientes y el total de reducciones/deducciones usan superficies suaves; y el resumen movil apila el total en una fila completa para impedir solapamientos.
- Verificacion: revision visual integrada en escritorio y movil a 390 px, incluidos popovers y los pasos 1, 3, 4 y 7, sin overflow horizontal; TypeScript y build de Vite correctos con los ejecutables locales.
- Estado siguiente: terminado.
