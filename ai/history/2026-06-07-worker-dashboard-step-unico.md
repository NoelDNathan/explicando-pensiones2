# 2026-06-07 - Worker dashboard con step unico

## Objetivo

Mejorar la distribucion del worker salary dashboard en `/calculadora-fiscal`, evitando que todos los componentes aparezcan apretados a la vez y corrigiendo selects y textos oscuros.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `ai/current.md`
- `ai/history/2026-06-07-worker-dashboard-step-unico.md`

## Resumen de cambios

- `WorkerFiscalStepsCard` acepta ahora `activeStepId` y `onStepChange` para sincronizarse con el dashboard.
- `/calculadora-fiscal` muestra solo el componente del step activo en el area inferior.
- El paso 6 usa un panel de resumen de salario neto con `FiscalKpiRow`.
- Se corrigieron colores de `select`, `option` y titulos dentro del dashboard oscuro.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `pnpm run build`: no ejecutable porque `pnpm` no esta disponible.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox porque el intento normal fallo con `node.exe: Acceso denegado`; mantiene avisos conocidos de chunk grande y tiempos de plugins.
- Navegador integrado en `http://127.0.0.1:5182/calculadora-fiscal`: una sola tarjeta visible, pasos 2 y 7 navegables, titulos claros, selects/options legibles y sin overflow en escritorio ni movil 390x844.

## Estado siguiente

- Decidir si el paso 6 debe convertirse en componente propio `WorkerNetSalaryCard`.
- No se hizo commit/push porque el arbol de trabajo contiene cambios previos no atribuibles a esta interaccion y un `git add .` mezclaria trabajos distintos.
