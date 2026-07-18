# Geometria suave en la calculadora fiscal

- Fecha: 2026-07-18.
- Objetivo: eliminar el aspecto excesivamente cuadrado de los controles y paneles en todas las pantallas de la calculadora fiscal.
- Archivos modificados: `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`, `ai/current.md` y este historial.
- Resumen: se incorporan tokens globales de radio y sombra; se aplican a tarjetas, paneles, campos, selectores, filas y resultados de los pasos 1-10; el formulario de base real gana espacio, agrupacion visual y estados de foco mas suaves. La geometria queda centralizada para facilitar futuros cambios de estilo y paleta.
- Verificacion: TypeScript (`tsc --noEmit`) y build de Vite correctos usando los ejecutables locales. Revision visual en escritorio de los pasos 1, 3, 7 y 8; revision movil a 390 px de los pasos 1 y 8, sin overflow horizontal. `pnpm run build` intento purgar dependencias y se aborto por falta de TTY, por lo que se ejecutaron sus equivalentes locales.
- Estado siguiente: cambio terminado; conviene mantener los nuevos radios como tokens al crear componentes fiscales futuros.
