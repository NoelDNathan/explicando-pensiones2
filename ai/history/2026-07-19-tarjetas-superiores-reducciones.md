# 2026-07-19 - Tarjetas superiores de reducciones

- Fecha: 2026-07-19
- Objetivo: arreglar la tira superior de reducciones, donde los textos se veian muy claros y algunos valores quedaban recortados.
- Archivos modificados:
  - `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
  - `ai/current.md`
  - `ai/history/2026-07-19-tarjetas-superiores-reducciones.md`
- Resumen de cambios: en modo suave, `.wprc-top-grid` pasa a una cuadricula con separacion real; cada `.wprc-top-field` se trata como tarjeta clara independiente, con contraste alto, valor sin `ellipsis` y selector circular a la derecha. El select nativo sigue cubriendo el boton para mantener la interaccion, pero visualmente no corta texto.
- Verificacion: `tsc --noEmit` correcto; Vite build correcto. Comprobacion DOM en navegador local de `.wprc-top-grid` en escritorio y viewport movil: valores visibles, selector 40x40, sin overflow horizontal de pagina.
- Estado siguiente: si se quiere afinar mas, revisar visualmente la captura manual de la pagina completa para decidir si el grid debe mostrarse en 5 columnas o partir antes a 2/3 columnas.
