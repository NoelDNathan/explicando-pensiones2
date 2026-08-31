# 2026-08-31 — Gastos deducibles de 2.000 € explicados en el paso 4

## Objetivo

Explicar en el paso 4 los gastos deducibles de 2.000 €: que se aplican automáticamente a todos los trabajadores por cuenta ajena, que representan lo que cuesta trabajar (frente al autónomo, que deduce gastos reales con factura) y mostrar la ecuación `salario bruto − Seguridad Social − gastos deducibles = rendimiento neto del trabajo` con los valores del usuario.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen

Los 2.000 € del art. 19.2.f ya se aplicaban en el motor (`general_other_expenses` → `article19OtherExpenses`) pero no se explicaban en pantalla: «Rendimiento neto del trabajo» aparecía como número mágico en la barra sticky.

El dashboard reparte ahora los gastos del art. 19 en dos cifras (`socialSecurityWorkExpense` y `otherDeductibleWorkExpenses`) y las pasa al paso 4 junto con el bruto fiscal y el importe general de 2.000 €. El paso 4 abre con un bloque `wprc-net-income` antes de la sección 1: explicación en lenguaje llano, pastilla «Ya aplicado», la ecuación de cuatro filas con los valores reales y un desplegable con los casos que suben el importe (movilidad geográfica, discapacidad, cuotas de sindicato/colegio) y el tope de que no puede dejar el rendimiento en negativo.

El reparto está construido para que la ecuación cuadre siempre en pantalla: la fila de gastos deducibles absorbe los gastos adicionales del art. 19 cuando existen, y muestra el desglose `2.000 € generales + X € por tu situación`.

## Verificación

- `pnpm run build` y `tsc -b` correctos.
- En `/calculadora-fiscal` paso 4 con 35.000 € brutos: `35.000,00 − 2.268,00 − 2.000,00 = 30.732,00 €`.
- Con discapacidad reconocida del 33 %: `35.000,00 − 2.268,00 − 5.500,00 = 27.232,00 €`, con el texto `2.000 € generales + 3.500 € por tu situación`.
- Tema suave correcto (fondo blanco, resultado en verde `--fiscal-primary-strong`) y sin overflow horizontal en escritorio ni en móvil 375 px.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
