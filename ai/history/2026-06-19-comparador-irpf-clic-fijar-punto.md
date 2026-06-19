# Comparador IRPF: clic fija el salario en el grafico

Fecha: 2026-06-19

## Objetivo

Permitir fijar un punto del grafico al hacer clic, de modo que la linea vertical y el ranking permanezcan en ese salario al quitar el raton.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.css`

## Resumen de cambios

- Nuevo estado `pinnedIndex`: al hacer clic en el grafico se fija el indice de salario activo.
- Prioridad del punto activo: hover (vista previa) > fijado por clic > salario actual del dashboard.
- Al cambiar el salario desde el slider superior, se libera el punto fijado y vuelve a seguir el salario del usuario.
- Estilo visual distinto para cursor fijado (linea solida cyan) frente a la vista previa al pasar el raton (linea discontinua).

## Verificacion

- `ReadLints` sin errores.

## Estado siguiente

- Opcional: doble clic o boton para volver al salario actual sin mover el slider.
