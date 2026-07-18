# 2026-07-18 - Suaviza bordes de cajas IRPF

- Fecha: 2026-07-18
- Objetivo: corregir el aspecto raro de bordes en las cajas de importes del formulario de reducciones/deducciones.
- Archivos modificados:
  - `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
  - `ai/current.md`
- Resumen de cambios: en el modo suave de `/calculadora-fiscal`, los campos `irpf-rule-field` y `irpf-rule-check` usan un borde exterior mas discreto, fondo blanco suave y sombra ligera. Los controles interiores (`input`, `select` y `irpf-rule-field__control`) pasan a ser el contorno visual principal con 42 px de alto, radio coherente y foco teal suave.
- Verificacion: `.\node_modules\.bin\tsc.cmd --noEmit` correcto; `node node_modules\vite\bin\vite.js build` correcto con aviso conocido de chunk grande. Revision visual integrada en paso 5: escritorio sin overflow y movil 390 px sin overflow.
- Estado siguiente: si aparecen mas cajas con doble borde en otros pasos, aplicar el mismo criterio en el tema suave antes de tocar estilos base.
