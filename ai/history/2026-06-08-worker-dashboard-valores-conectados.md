# 2026-06-08 - Worker dashboard valores conectados

## Objetivo

Hacer que los valores editados en los pasos del `worker-salary-dashboard` se tengan en cuenta en el resto de componentes de `/calculadora-fiscal`.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `ai/current.md`

## Resumen de cambios

- Se subio al dashboard central el estado de base real, complementos, salario en especie, grupo de cotizacion, situacion personal, ajustes de reducciones/deducciones, region de IRPF y resultado de consumo.
- Se sincronizaron props en las tarjetas activas para evitar que los controles superiores y el paso abierto muestren valores distintos.
- No se incorporaron datos nuevos ni fuentes nuevas.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- `http://127.0.0.1:5190/calculadora-fiscal`: HTTP 200.
- Revision visual escritorio/movil: pendiente; no hay herramienta Browser callable en este turno y Playwright no esta instalado.

## Estado siguiente

Revisar visualmente `/calculadora-fiscal` en escritorio y movil cuando haya navegador/captura disponible y decidir si se anaden controles visibles para complementos, salario en especie y consumo en la cabecera principal.
