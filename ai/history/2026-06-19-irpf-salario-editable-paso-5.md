# IRPF: salario editable desde el paso 5

Fecha: 2026-06-19

## Objetivo

Permitir cambiar el salario bruto anual directamente en la tarjeta del paso 5 ("IRPF por tramos"), sin tener que volver al paso 1, viendo el efecto en tiempo real sobre las cuotas estatal y autonomica.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`

## Resumen de cambios

- Nuevas props en `WorkerIrpfTranchesCard`: `grossSalary` (salario bruto anual actual) y `onSalaryChange` (callback al ajustarlo).
- Estado local `salary` sincronizado con la prop via `useEffect`; al mover el slider se llama a `onSalaryChange`, que en el dashboard ejecuta `setSalary`, recalculando la cadena completa (base de cotizacion, minimos, escala estatal y autonomica, neto, KPIs) que vuelve a la tarjeta como props autoritativas.
- UI: slider anual 14.000-120.000 EUR (paso 500) con valor visible y escala de marcas, alineado con el control del paso 1. Solo se renderiza cuando llegan ambas props (`showSalaryControl`).
- `FiscalWorkerDashboard` pasa `grossSalary={salary}` y `onSalaryChange={setSalary}` al caso 5.
- Estilos nuevos `.witc-salary`, `.witc-salary__head`, `.witc-salary__scale` y estilizado del `input[type=range]`.

## Verificacion

- Sin errores de linter (TS language server) en los archivos modificados.
- HMR de Vite (localhost:5174) aplica los cambios sin errores.
- `pnpm run build` completo sigue bloqueado por errores TypeScript pre-existentes y ajenos en `WorkerContributionLimitsCard`, `WorkerPersonalReductionsCard`, `WorkerSocialContributionsCard` y `FiscalWorkerDashboard` (propiedad `fogasa`).

## Estado siguiente

- Revisar el control en movil dentro del paso 5.
- Valorar si el salario editado aqui deberia distinguir base vs complementos/especie (ahora ajusta solo el salario base, igual que el campo principal del paso 1).
