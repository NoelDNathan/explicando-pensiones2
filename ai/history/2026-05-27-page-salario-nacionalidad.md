# 2026-05-27 - Pagina dashboard salario por nacionalidad

## Objetivo

Crear una pagina tipo infografia/dashboard 16:9 sobre "Salario medio mensual por nacionalidad" siguiendo la referencia visual indicada.

## Archivos modificados

- `src/App.tsx`
- `src/components/SalaryNationalityDashboard.tsx`
- `src/components/SalaryNationalityDashboard.css`
- `src/data/salaryNationalityDashboardData.ts`
- `ai/current.md`
- `ai/history/2026-05-27-page-salario-nacionalidad.md`

## Resumen de cambios

- Creada la ruta `/salario-nacionalidad`.
- Anadido un dashboard oscuro con grafico de barras, grafico de linea con area, panel de interpretacion, ranking, tarjetas KPI y pie metodologico.
- Los valores se mantienen como datos ilustrativos de ejemplo, segun el texto de la propia pantalla.
- Verificacion: `tsc --noEmit`, ESLint de los archivos tocados y `vite build` correctos. `vite build` mantiene el aviso conocido de chunk grande.

## Estado siguiente

Pendiente revision visual con navegador/captura integrada cuando la herramienta este disponible en el hilo. La pagina responde HTTP 200 en `http://127.0.0.1:5174/salario-nacionalidad`.
