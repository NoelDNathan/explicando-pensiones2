# 2026-06-07 - Slider de salario

## Objetivo

Convertir el control `Salario anual o mensual` de la tarjeta de base real en un slider.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.css`
- `ai/current.md`
- `ai/history/2026-06-07-worker-salary-slider.md`

## Resumen

- Sustituido el campo numerico principal de salario por un `input type="range"` con valor visible y marcas de escala.
- Anadidos rangos diferentes para salario anual y mensual.
- Al cambiar entre anual y mensual se convierte el importe aproximado y se limita al rango del nuevo modo.
- Estilizado el slider para encajar con la tarjeta oscura: pista con progreso, thumb luminoso y escala inferior.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecucion fuera del sandbox; el intento normal fallo con `node.exe: Acceso denegado`.
- Revision visual/DOM en `http://127.0.0.1:5184/calculadora-fiscal`: escritorio 1280x720 y movil 390x844 con slider visible, valor `35.000 EUR` y sin overflow horizontal.

## Estado siguiente

Pendiente decidir si este slider debe controlar tambien el salario global del dashboard o seguir siendo un simulador local dentro del paso 1.
