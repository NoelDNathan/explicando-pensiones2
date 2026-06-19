# SalarySlider reutilizable con escala logaritmica

Fecha: 2026-06-19

## Objetivo

Que el control de salario del paso 5 use el mismo componente que "Base real", con tope de 500.000 EUR y una escala que suba mas rapido cuanto mas alto es el importe (logaritmica).

## Archivos modificados

- `src/components/ui/SalarySlider.tsx` (nuevo)
- `src/components/ui/SalarySlider.css` (nuevo)
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.css`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`
- `src/App.tsx`

## Resumen de cambios

- Nuevo componente reutilizable `SalarySlider` con props `value`, `onChange`, `min`, `max`, `step`, `markers`, `unitLabel`, `scale` ('linear' | 'log'), `id`, `ariaLabel`.
  - En `linear` usa el `input[type=range]` directo con `step`.
  - En `log` mapea una posicion interna 0..1000 a euros con `min * (max/min)^(p/1000)` y redondea a escalones "bonitos" crecientes (100 / 500 / 1000 / 2500 / 5000 segun importe). El relleno del track se calcula desde la posicion logaritmica.
  - Estilos copiados del slider de Base real para mantener identidad visual (gradiente verde->cian, thumb, escala).
- `WorkerSalaryBaseCard` reemplaza su markup `.wsbc-slider` por `<SalarySlider scale="linear" ... />`; se elimina el CSS duplicado del slider y la variable `salaryPercent` / import `CSSProperties` sobrantes.
- `WorkerIrpfTranchesCard` usa `<SalarySlider scale="log" max={500000} markers={[14000,50000,120000,250000,500000]} />`; se elimina el slider casero anterior y su CSS.
- `App.tsx`: nuevo `SalarySliderShowcase` y seccion en `/componentes` con variantes lineal y logaritmica.

## Verificacion

- Sin errores de linter (TS language server) ni de tipos (`tsc -b`) en los archivos modificados.
- HMR de Vite (localhost:5174) aplica los cambios sin errores.
- `pnpm run build` completo sigue bloqueado por errores TypeScript pre-existentes y ajenos en `WorkerContributionLimitsCard`, `WorkerPersonalReductionsCard`, `WorkerSocialContributionsCard` y `FiscalWorkerDashboard` (propiedad `fogasa`).

## Estado siguiente

- Revisar en movil el slider en ambos pasos.
- Valorar posicionar las marcas de la escala logaritmica en su posicion real (ahora van equiespaciadas, igual que en Base real).
