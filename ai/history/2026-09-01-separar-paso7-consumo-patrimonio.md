# 2026-09-01 — Separar el paso 7 en consumo (7) y vivienda/coche (8)

## Objetivo

Partir el paso 7 («IVA y otros impuestos») en dos pasos por el concepto que mezclaba: impuestos que pagas al gastar frente a impuestos que pagas por tener o por haber comprado. De paso, romper el archivo de 1.860 líneas que concentraba las dos cosas.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx` (solo gasto, IVA y especiales)
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `src/components/worker-salary-dashboard/WorkerWealthTaxesCard.tsx` (nuevo)
- `src/components/worker-salary-dashboard/WorkerWealthTaxesCard.css` (nuevo)
- `src/components/worker-salary-dashboard/WorkerTaxStepShell.css` (nuevo, chasis compartido)
- `src/components/worker-salary-dashboard/workerTaxesFormat.ts` (nuevo)
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.tsx`
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `src/App.tsx`
- `ai/current.md`

## Resumen

- Paso 7 «IVA y consumo diario»: presupuesto, reparto por categorías, gráfico circular, tabla y diálogo inicial de valores medios. Su resumen lateral pasa a ser solo consumo (gasto asignado, IVA, especiales, total) más una nota que remite al paso 8.
- Paso 8 «Vivienda y coche» (`WorkerWealthTaxesCard`): las dos preguntas de propiedad, las fichas de vivienda (IBI e impuesto de compra) y de coche (IVTM e impuesto de compra), con resumen propio que separa lo recurrente (IBI + IVTM, al mes) de los pagos únicos de la compra. Si se responde «No» a las dos preguntas, el paso se despacha en dos clics.
- El recorrido pasa de 10 a 11 pasos: resumen del cálculo 8→9, FAQ 9→10 y fuentes 10→11, con `PAYROLL_EXAMPLES`, `showPayrollHelp`, `isCompactStep` y el override `.wfsc-stage--step-7` del tema suave ajustados.
- El borrador único `ConsumptionTaxesDraft` se parte en dos (`ConsumptionTaxesDraft` y `WealthTaxesDraft`), ambos guardados en `FiscalWorkerDashboard`, así que cada paso conserva sus valores al ir y volver. `ConsumptionTaxesResult` deja de incluir IBI e IVTM: el dashboard suma `specialTaxesAnnual` del paso 7 con `recurringTaxAnnual` del paso 8. Como efecto colateral, `effectiveRate` (que alimenta `vatRate`) ya no arrastra el IBI.
- El CSS de 1.813 líneas se reparte en tres archivos (chasis compartido, consumo, patrimonio) manteniendo el prefijo `wctc-`, para no tocar las ~180 líneas de override del tema suave.
- En la introducción del paso 8 se desarrollan las siglas: IBI (Impuesto sobre Bienes Inmuebles) e IVTM (Impuesto sobre Vehículos de Tracción Mecánica, el «impuesto de circulación»).
- `/componentes` gana la tarjeta nueva como componente 21 y renumera los dos siguientes.

## Verificación

- `tsc -b` y `vite build` correctos. ESLint limpio salvo el aviso heredado `react-hooks/set-state-in-effect` en el efecto de `initialBudgetAnnual` del paso 7, que ya existía antes del cambio.
- En `/calculadora-fiscal`: paso 7 con valores medios reparte 100 % y da 219,68 €/mes de impuestos al consumir; paso 8 con 85.000 € catastrales y 0,6 % da 510 €/año y 42,50 €/mes de IBI, y 180.000 € en Madrid de segunda mano da 10.800 € de ITP que quedan fuera del total recurrente.
- Ir al paso 9 y volver conserva los valores de los pasos 8 y 7. Los pasos 9, 10 y 11 cargan sin errores de consola.
- Sin desborde horizontal de página a 390 px (`scrollWidth` = `innerWidth`); la tabla de consumo mantiene su scroll interno a propósito.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
