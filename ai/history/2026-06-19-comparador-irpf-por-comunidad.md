# Comparador de IRPF por comunidad

Fecha: 2026-06-19

## Objetivo

Anadir, debajo del paso 5 (IRPF), un componente que compare cuanto IRPF paga el mismo salario en cada comunidad autonoma, con eje X = salario bruto anual y eje Y conmutable entre porcentaje del salario y euros al ano.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/irpfRegionCalc.ts` (nuevo)
- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.tsx` (nuevo)
- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.css` (nuevo)
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`

## Resumen de cambios

- Nuevo modulo `irpfRegionCalc.ts` con `computeRegionalIrpf2025(bruto, comunidad)` y `getComparableRegions()`. Reutiliza los mismos parametros 2025 (BOE/AEAT) que el dashboard: cotizacion (con topes y cuota de solidaridad), gastos deducibles, reduccion por rendimientos del trabajo, base liquidable, escala estatal y autonomica y minimo personal restado de cada cuota.
- Perfil tipo explicito y documentado en el propio modulo: soltero, 40 anos, sin hijos ni ascendientes, sin discapacidad, contrato indefinido, grupo de cotizacion 7, salario = bruto anual.
- Nuevo componente `WorkerIrpfRegionComparison`:
  - grafico SVG sin dependencias con una linea por comunidad;
  - conmutador "% del salario" / "€ al año";
  - comunidad seleccionada resaltada y marcador vertical en el salario actual;
  - ranking lateral ordenado de menos a mas IRPF en el salario activo, clicable para cambiar de comunidad y con diferencia respecto a la mas barata;
  - al pasar el raton por el grafico, el cursor vertical y el ranking se actualizan al salario bajo el puntero.
- Integrado en el paso 5 bajo la tarjeta de IRPF (solo en 2025; 2005 solo cubre Madrid). El click en el grafico o en el ranking actualiza la comunidad del dashboard (`setRegion`).
- Rango por defecto del eje X: 14.000 - 120.000 EUR (banda donde mas se aprecian las diferencias autonomicas).

## Verificacion

- `ReadLints` sin errores en los archivos nuevos y modificados.
- `pnpm exec tsc --noEmit` sin errores.
- HMR de Vite aplico los cambios del dashboard sin errores.
- `pnpm run build` (`tsc -b`) sigue fallando por errores PREEXISTENTES y ajenos a este cambio (p. ej. `fogasa` en la ruta de 2005 de `getContributionRatesForYear` y varios imports/variables sin usar en `WorkerContributionLimitsCard`, `WorkerPersonalReductionsCard` y `WorkerSocialContributionsCard`). Los archivos nuevos de esta sesion no generan ningun error.
- Bloqueo: no se pudo ejecutar la verificacion visual en navegador (escritorio/movil) porque el subagente de navegador no estaba disponible en este entorno (limite de API). Pendiente de revision visual manual del apilado en movil.

## Estado siguiente

- Revisar visualmente el grafico y el ranking en escritorio y movil.
- Posibles mejoras: permitir ampliar el eje X hasta 500k para coherencia con el slider; tooltip que explique el perfil tipo; resaltar min/max o media nacional; opcion de mostrar solo IRPF autonomico para aislar el efecto de la comunidad.
