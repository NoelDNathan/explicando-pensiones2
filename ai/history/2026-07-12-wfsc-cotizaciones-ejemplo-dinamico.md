# 2026-07-12 - Ejemplo dinamico de cotizaciones en pasos fiscales

## Objetivo

Conectar el ejemplo textual del paso `Cotizaciones sociales` con el salario introducido en el dashboard, evitando importes fijos como 1.929 EUR y 125 EUR.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `ai/current.md`
- `ai/history/2026-07-12-wfsc-cotizaciones-ejemplo-dinamico.md`

## Resumen de cambios

- El texto del paso 3 ahora usa `payrollLiveData` para mostrar base mensual de cotizacion, tipo/cuota del trabajador y tipo/aportacion de empresa.
- Para el caso visible de 35.000 EUR/anio, el navegador muestra `2.916,67 EUR`, `6,48 %`, `189,00 EUR`, `30,57 %` y `891,63 EUR`.
- No se incorporaron datos nuevos ni fuentes nuevas.

## Verificacion

- `ReadLints` sin errores en `WorkerFiscalStepsCard.tsx`.
- `.\node_modules\.bin\tsc.cmd --noEmit` correcto.
- `node node_modules\vite\bin\vite.js build` correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Revision en navegador integrado en `/calculadora-fiscal`, paso 3, sin overflow horizontal en escritorio ni movil 390px.

## Estado siguiente

El ejemplo queda sincronizado con el salario/base/cotizaciones actuales. No se hizo commit/push automatico para no mezclar cambios no solicitados del arbol de trabajo.
