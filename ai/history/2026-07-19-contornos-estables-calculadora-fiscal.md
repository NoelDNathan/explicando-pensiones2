# 2026-07-19 - Contornos estables en calculadora fiscal

- Fecha: 2026-07-19
- Objetivo: eliminar definitivamente el efecto de borde izquierdo borrado en campos de reducciones/deducciones e IVA.
- Archivos modificados:
  - `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
  - `ai/current.md`
  - `ai/history/2026-07-19-contornos-estables-calculadora-fiscal.md`
- Resumen de cambios: los controles IRPF y los campos de IVA en modo suave dejan de usar el borde del propio input/contenedor como contorno principal. Ahora usan una capa `::before` con borde completo, visible por encima del contenido y con `pointer-events: none`, para evitar que fondos internos o composicion subpixel oculten el lateral izquierdo.
- Verificacion: `tsc --noEmit` correcto; Vite build correcto. Revision DOM en navegador local del campo "Guarderia pagada por la empresa" y de `.wctc-input`: borde base `0`, pseudo-contorno completo, `overflow: visible` y sin overflow horizontal de pagina.
- Estado siguiente: revisar manualmente en el navegador visible si algun campo externo a IRPF/IVA usa otro patron visual antiguo; si aparece, migrarlo al mismo contorno decorativo.
