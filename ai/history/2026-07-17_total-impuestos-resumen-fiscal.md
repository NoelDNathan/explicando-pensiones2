# 2026-07-17 — Total de impuestos en el resumen fiscal

- Fecha: 2026-07-17.
- Objetivo: mostrar el total de impuestos y cotizaciones asociados al trabajo.
- Archivos modificados: `WorkerFiscalSummaryCard.tsx`, `WorkerFiscalSummaryCard.css` y `ai/current.md`.
- Resumen: cuarta metrica con la suma de cotizaciones empresariales, cotizaciones del trabajador e IRPF; disponible en euros y porcentaje, con desglose de empresa y trabajador. Se mantienen nombres accesibles en los botones del selector cuando el texto visual se oculta en movil.
- Verificacion: TypeScript y build de Vite correctos; cuatro tarjetas sin overflow horizontal en escritorio (1280 px) y movil (390 px), y modo porcentaje interactivo correcto.
- Estado siguiente: revisar el lenguaje editorial de la nueva suma con usuarios.
