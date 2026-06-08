# 2026-06-09 - Corrige bucle slider salario

## Objetivo

Evitar que el slider de salario de `WorkerSalaryBaseCard` suba y baje repetidamente al moverlo.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `ai/current.md`

## Resumen de cambios

- Eliminada la resincronizacion de props iniciales hacia el estado local mientras la tarjeta esta montada.
- Los props siguen actuando como valores iniciales, pero el slider mantiene el control local durante la interaccion y comunica los cambios al dashboard.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- `http://127.0.0.1:5192/calculadora-fiscal`: HTTP 200.
- Revision visual directa del arrastre: pendiente; no hay herramienta Browser callable en este turno.

## Estado siguiente

Revisar visualmente el arrastre del slider en `/calculadora-fiscal` cuando haya navegador/captura disponible.
