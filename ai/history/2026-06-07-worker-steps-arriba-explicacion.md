# 2026-06-07 - Pasos encima de la explicacion

## Objetivo

Mover la navegacion visual de pasos de `WorkerFiscalStepsCard` para que aparezca por encima de la explicacion activa.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`
- `ai/history/2026-06-07-worker-steps-arriba-explicacion.md`

## Resumen

- Reordenado el JSX de `WorkerFiscalStepsCard` para renderizar la tira de 7 pasos antes del panel de explicacion.
- Ajustado el margen de la ayuda contextual para que siga asociada a la tira de pasos y no invada el bloque explicativo.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `pnpm run build`: no ejecutable porque `pnpm` no esta disponible en el entorno.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecucion fuera del sandbox; el intento normal fallo con `node.exe: Acceso denegado`.
- Revision visual/DOM en `http://127.0.0.1:5183/calculadora-fiscal`: escritorio 1280x720 y movil 390x844 con pasos encima de la explicacion y sin overflow horizontal.

## Estado siguiente

Pendiente decidir si la tira de pasos debe quedar fija/sticky al hacer scroll dentro de `/calculadora-fiscal`.
