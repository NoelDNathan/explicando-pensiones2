# 2026-07-18 - Corrige bordes izquierdos en calculadora

- Fecha: 2026-07-18
- Objetivo: eliminar el efecto visual de bordes izquierdos cortados o borrados en reducciones/deducciones y en el paso de IVA.
- Archivos modificados:
  - `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
  - `ai/current.md`
- Resumen de cambios: en el modo suave, `irpf-rule-group` deja de recortar contenido; `wprc-adjustment-list` y `wctc-rows` dejan de funcionar como contenedores con recorte y pasan a listas con separacion real. Las filas `wprc-adjustment-row` y `wctc-row`, y los controles IRPF/IVA, reciben contorno interior uniforme para que el borde completo sea visible sobre fondo blanco.
- Verificacion: `.\node_modules\.bin\tsc.cmd --noEmit` correcto; `node node_modules\vite\bin\vite.js build` correcto con aviso conocido de chunk grande. Revision integrada en navegador: pasos 4 y 7 en escritorio con `overflow: visible` y contornos completos; movil 390 px sin overflow horizontal de pagina. La tabla de IVA conserva su scroll interno intencionado.
- Estado siguiente: revisar visualmente en dispositivo real si algun campo aislado fuera de pasos 4/5/7 necesita el mismo tratamiento.
