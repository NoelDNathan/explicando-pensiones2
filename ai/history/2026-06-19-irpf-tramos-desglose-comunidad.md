# Mejora visual: IRPF desglosado por comunidad autonoma

Fecha: 2026-06-19

## Objetivo

Hacer visible de forma clara que parte del IRPF corresponde al Estado y que parte corresponde a la comunidad autonoma seleccionada, usando el nombre real de la comunidad en lugar de la etiqueta generica "autonomico".

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`

## Resumen de cambios

- Se calcula `regionLabel` a partir del array `regions` para mostrar el nombre real de la comunidad seleccionada.
- En el calculo acumulado (modo autoritativo), la etiqueta "autonomico" se reemplaza por el nombre de la comunidad en la fila de cuota y en la formula.
- Se anade una barra de reparto proporcional (`witc-split-bar`) debajo del calculo, con franjas de color azul (Estado) y naranja (comunidad) y etiquetas de porcentaje.
- La columna derecha de KPIs muestra tres tarjetas separadas: cuota estatal (azul), cuota de la comunidad con su nombre real (naranja) y total IRPF (morado).
- Sin cambios de estructura de datos ni de logica de calculo.

## Estado siguiente

- Los errores de build previos estan en `WorkerContributionLimitsCard`, `WorkerPersonalReductionsCard`, `WorkerSocialContributionsCard` y `FiscalWorkerDashboard`; no estan relacionados con esta sesion.
- Pendiente revisar en pantalla movil si la barra de reparto queda bien en el breakpoint estrecho.
