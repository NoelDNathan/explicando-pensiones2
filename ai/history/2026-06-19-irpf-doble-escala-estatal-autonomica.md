# IRPF: doble escala estatal y autonomica con calculo por tramos

Fecha: 2026-06-19

## Objetivo

Mostrar de forma clara que el IRPF se calcula con dos escalas distintas (estatal y autonomica), que tienen tramos y tipos diferentes, y desglosar en el calculo acumulado cuanto se paga en cada tramo de cada escala por separado.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`

## Resumen de cambios

- Nuevas props consumidas (ya las pasaba el dashboard): `stateScale`, `regionalScale`, `stateMinimum`, `regionalMinimum`, con el tipo `WorkerIrpfScaleBracket`.
- Helper `computeScaleLines(scale, base)` que convierte una escala oficial en lineas con importe gravado y cuota por tramo; helper `formatRate` para tipos con decimales ("9,5").
- Vista de doble escala (`hasScales`): dos filas de tramos en la cabecera, "Escala estatal" y "Escala autonomica · <comunidad>", con activos/inactivos segun la base.
- Bloque "Calculo por tramos" en dos columnas (Estatal y comunidad): por cada tramo activo, importe x tipo = cuota; despues subtotal de cuota integra de la escala, resta del minimo personal y familiar (etiquetando la base exenta) y cuota final, cuadrando con `stateTax`/`regionalTax`.
- Se conservan la barra de reparto Estado vs comunidad y los tres KPIs de resultado.
- `.witc-brackets` pasa a `auto-fit` para soportar escalas con distinto numero de tramos; nuevas clases `.witc-scales`, `.witc-scale-tag`, `.witc-calc-cols`, `.witc-calc-col`, `.witc-tramos`, `.witc-tramo`.
- Fallback intacto: si no hay escalas o no es autoritativo, se mantiene el comportamiento previo.

## Verificacion

- `tsc -b`: sin errores nuevos en `WorkerIrpfTranchesCard`. Persisten errores previos ajenos a esta sesion en `WorkerContributionLimitsCard`, `WorkerPersonalReductionsCard`, `WorkerSocialContributionsCard` y `FiscalWorkerDashboard` (propiedad `fogasa`), que bloquean `pnpm run build` completo.
- Revision visual en navegador pendiente (servidor dev levantado en localhost:5174; la captura automatica se cancelo).

## Estado siguiente

- Revisar en escritorio y movil la vista de doble escala, especialmente comunidades con muchos tramos (Aragon, Asturias).
- Considerar resolver los errores de TypeScript pre-existentes para desbloquear el build completo.
