# 2026-06-07 - Integrar worker salary dashboard

## Objetivo

Combinar las tarjetas de `worker-salary-dashboard` dentro de `/calculadora-fiscal`, con la explicacion arriba y el resto de elementos en filas de tres columnas.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `ai/current.md`
- `ai/history/2026-06-07-integrar-worker-salary-dashboard.md`

## Resumen de cambios

- Se dejo `WorkerFiscalStepsCard` como bloque explicativo superior.
- Se anadio una rejilla con `WorkerSalaryBaseCard`, `WorkerContributionLimitsCard`, `WorkerSocialContributionsCard`, `WorkerPersonalReductionsCard`, `WorkerIrpfTranchesCard` y `WorkerConsumptionTaxesCard`.
- La tarjeta de IVA y otros impuestos queda en la tercera columna de la segunda fila en escritorio.
- Se ajusto el layout responsive para evitar overflow horizontal en movil.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `pnpm run build`: no ejecutable porque `pnpm` no esta disponible.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox porque el intento normal fallo con `node.exe: Acceso denegado`; mantiene avisos conocidos de chunk grande y tiempos de plugins.
- Navegador integrado en `http://127.0.0.1:5181/calculadora-fiscal`: escritorio 1280x720 con 6 tarjetas en 3 columnas y sin overflow; movil 390x844 con una columna y sin overflow.

## Estado siguiente

- Revisar si las tarjetas deben compartir estado bidireccional con los controles superiores; por ahora reciben valores iniciales/contexto desde el dashboard.
- No se hizo commit/push porque el arbol de trabajo contiene cambios previos no atribuibles a esta interaccion y un `git add .` mezclaria trabajos distintos.
