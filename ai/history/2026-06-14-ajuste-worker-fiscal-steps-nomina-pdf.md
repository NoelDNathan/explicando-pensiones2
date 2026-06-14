# 2026-06-14 - Ajuste WorkerFiscalStepsCard nomina PDF

## Objetivo

Corregir la UI de `WorkerFiscalStepsCard` para que el texto largo no genere listas laterales no deseadas y para que la nomina de ejemplo tenga formato de recibo/PDF.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- Eliminada la lista lateral bajo la explicacion principal del paso.
- Eliminado el bloque explicativo con lista dentro del panel de nomina.
- Rehecha la nomina de ejemplo como documento con cabecera, datos de empresa/trabajador, tabla de filas y resultado formal.
- Corregido el grid movil para que la escena ocupe el ancho disponible y la nomina no quede estrecha.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Browser integrado en `http://127.0.0.1:5208/calculadora-fiscal`: escritorio y movil 390x844 correctos, sin lista lateral, sin overflow horizontal y sin errores de consola.
- Captura visual pendiente: `Page.captureScreenshot` volvio a agotar tiempo en CDP.

## Estado siguiente

La pantalla queda lista para nueva revision visual manual. Si se quiere una captura adjunta en el historial, hace falta resolver el timeout de CDP o usar otra via de captura autorizada.
