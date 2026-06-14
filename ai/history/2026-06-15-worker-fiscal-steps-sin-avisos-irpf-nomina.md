# 2026-06-15 - WorkerFiscalSteps sin avisos e IRPF en nomina

## Objetivo

Ajustar la pantalla didactica de pasos fiscales para quitar los avisos bajo la nomina, acercar texto y documento, e incorporar un ejemplo de nomina con retencion IRPF.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- Eliminados los bloques auxiliares `.wfsc-important` del render de todos los pasos.
- Reducido el hueco entre explicacion y nomina mediante la proporcion del grid, el gap y el ancho del recibo.
- Anadida una retencion IRPF ficticia de ejemplo: `/475 RETENCION IRPF`, 12,00%, 210,00 EUR.
- Actualizados los totales del recibo: `TOT.DEDUCCIONES` 323,76 EUR y `LIQUIDO TOTAL` 1.426,24 EUR.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Browser integrado en `http://127.0.0.1:5212/calculadora-fiscal`: sin `.wfsc-important`, importes IRPF nuevos presentes, importes antiguos ausentes, separacion escritorio de 26 px entre texto y nomina, sin overflow horizontal, paso 5 resaltando la fila IRPF, movil 390x844 sin overflow de pagina y consola sin errores.

## Estado siguiente

Revisar visualmente si se quiere ajustar el tamano exacto de la nomina por paso, pero la peticion actual queda implementada y verificada.
