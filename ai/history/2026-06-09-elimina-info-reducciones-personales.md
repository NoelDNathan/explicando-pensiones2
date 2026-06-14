# 2026-06-09 - Eliminar info de reducciones personales

## Objetivo

Eliminar el componente de informacion de `WorkerPersonalReductionsCard` para que las explicaciones vivan solo en el componente de explicacion del dashboard.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `ai/current.md`
- `ai/history/2026-06-09-elimina-info-reducciones-personales.md`

## Resumen de cambios

- Retirado el import de `Info`, el estado `infoOpen`, el boton de informacion y el popover explicativo.
- Eliminados los estilos `.wprc-info` y `.wprc-popover`, incluida su regla responsive.
- No se incorporaron datos nuevos ni se alteraron formulas.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Revision visual/DOM en `http://127.0.0.1:5195/calculadora-fiscal`: escritorio y movil correctos en el paso 4, sin boton de informacion, sin popover y sin overflow horizontal.

## Estado siguiente

- Las explicaciones de reducciones/deducciones quedan centralizadas en `WorkerFiscalStepsCard`.
- No se hizo commit/push automaticamente porque el arbol de trabajo ya contenia cambios previos no atribuibles a esta interaccion y un `git add .` mezclaria trabajos distintos.
