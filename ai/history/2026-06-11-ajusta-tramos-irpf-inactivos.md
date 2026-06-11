# 2026-06-11 - Ajuste visual de tramos IRPF

## Objetivo

En la pantalla 5 de la calculadora fiscal, desactivar visualmente los bloques de IRPF que la base liquidable no alcanza y eliminar la flecha naranja sobre el ultimo tramo alcanzado.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`
- `ai/current.md`
- `ai/history/2026-06-11-ajusta-tramos-irpf-inactivos.md`

## Resumen de cambios

- Anadida clase `is-inactive` a los tramos de IRPF sin importe gravado.
- Eliminado el marcador triangular que senalaba el ultimo tramo alcanzado.
- Anadidos estilos desaturados para que los tramos no alcanzados queden claramente apagados.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Revision visual/DOM en `http://127.0.0.1:5200/calculadora-fiscal`: correcta en escritorio y movil 390x844, con 3 tramos activos, 3 inactivos, 0 marcadores y sin overflow horizontal movil.

## Estado siguiente

Pendiente decidir si se quiere ajustar tambien el contraste exacto de los tramos inactivos tras una revision visual de diseno, pero el comportamiento solicitado queda implementado.
