# 2026-06-08 - Pastilla de progreso visible

## Objetivo

Evitar que el texto `% completado` de la barra de progreso de `WorkerFiscalStepsCard` se vea cortado.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`
- `ai/history/2026-06-08-worker-progress-chip.md`

## Resumen

- Aumentada la zona de la barra de progreso a 30px de alto.
- Separada la pista inferior de la pastilla de texto usando una capa `::before`.
- Reposicionado el progreso verde y la pastilla para que el texto quede completo.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecucion fuera del sandbox; el intento normal fallo con `node.exe: Acceso denegado`.
- Revision visual/DOM en `http://127.0.0.1:5186/calculadora-fiscal`: escritorio 1280x720 y movil 390x844 con la pastilla dentro del contenedor, texto visible y sin overflow horizontal.

## Estado siguiente

Pendiente revisar si el indicador debe mostrar porcentajes por paso o numeracion tipo `Paso 1 de 7` cuando se cierre el copy final.
