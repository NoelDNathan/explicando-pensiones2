# 2026-06-09 - Elimina controles superiores calculadora

## Objetivo

Eliminar la banda superior de controles de `/calculadora-fiscal` porque duplicaba valores del worker salary dashboard y generaba comportamiento inestable.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `ai/current.md`

## Resumen de cambios

- Eliminado el bloque `section.fwd-controls` con ejercicio, comunidad, edad, movilidad geografica y slider de salario bruto anual.
- Retirados estilos muertos de `fwd-controls`, `fwd-slider`, `fwd-scale` y `fwd-switch`, incluidas referencias responsive.
- El flujo queda centrado en `WorkerFiscalStepsCard` y las tarjetas activas del worker salary dashboard.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- `http://127.0.0.1:5191/calculadora-fiscal`: HTTP 200.

## Estado siguiente

Revisar visualmente `/calculadora-fiscal` en escritorio y movil cuando haya navegador/captura disponible.
