# 2026-06-07 - IRPF tramos en una sola linea

## Objetivo

Forzar que los seis tramos del componente `WorkerIrpfTranchesCard` aparezcan siempre en una misma linea.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`
- `ai/current.md`

## Resumen de cambios

- Eliminado el breakpoint que cambiaba los tramos de seis columnas a tres columnas.
- Eliminado el apilado movil de los tramos.
- Reducidos minimos, gap y tipografia en pantallas pequenas para conservar los seis tramos en linea.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: no completado. El intento normal fallo por `node.exe: Acceso denegado`; el intento fuera del sandbox fallo por `Could not resolve './WorkerConsumptionTaxesCard.css'` en `WorkerConsumptionTaxesCard.tsx`, bloqueo ajeno a este ajuste.

## Estado siguiente

- Resolver o completar `WorkerConsumptionTaxesCard.css` para recuperar el build de Vite.
- Revisar visualmente el componente cuando haya navegador disponible.
- No se hizo commit/push porque el arbol de trabajo ya contenia cambios previos no atribuibles a esta interaccion y un `git add .` mezclaria trabajos distintos.
