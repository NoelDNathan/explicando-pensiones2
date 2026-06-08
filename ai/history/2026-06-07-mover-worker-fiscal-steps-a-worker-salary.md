# 2026-06-07 - Mover navegacion fiscal a worker salary dashboard

## Objetivo

Corregir la ubicacion de `WorkerFiscalStepsCard`, que debia pertenecer a `worker-salary-dashboard` y no a `fiscal-worker-dashboard`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/index.ts`
- `src/App.tsx`
- `ai/current.md`
- `ai/history/2026-06-07-mover-worker-fiscal-steps-a-worker-salary.md`

## Resumen de cambios

- Movidos `WorkerFiscalStepsCard.tsx` y `WorkerFiscalStepsCard.css` a `src/components/worker-salary-dashboard/`.
- Exportado `WorkerFiscalStepsCard` desde `worker-salary-dashboard/index.ts`.
- Eliminado el export desde `fiscal-worker-dashboard/index.ts`.
- Actualizados los imports en `FiscalWorkerDashboard.tsx` y `App.tsx`.

## Verificacion

- `rg "WorkerFiscalStepsCard" src`: todas las referencias apuntan al componente movido o al export de `worker-salary-dashboard`.
- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox porque el intento normal fallo con `node.exe: Acceso denegado`; conserva avisos conocidos de chunk grande y tiempos de plugins.

## Estado siguiente

- Revisar visualmente el Componente 21 en `/componentes` y la integracion en `/calculadora-fiscal` cuando haya navegador integrado o Playwright disponible.
- No se hizo commit/push porque el arbol de trabajo ya contiene cambios previos no atribuibles a esta interaccion y un `git add .` mezclaria trabajos distintos.
