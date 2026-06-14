# 2026-06-10 - Corrige FOGASA en cotizaciones sociales

## Objetivo

Explicar y corregir por que FOGASA no se veia correctamente en `WorkerSocialContributionsCard` dentro de `/calculadora-fiscal`.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`
- `ai/history/2026-06-10-corrige-fogasa-cotizaciones-sociales.md`

## Resumen de cambios

- Detectado que `WorkerSocialContributionsCard` ya tenia una fila `FOGASA` en el bloque de empresa.
- Corregido el mapeo de tipos de cotizacion 2025 en `FiscalWorkerDashboard`: antes se pasaba `fogasa: 0`, aunque el JSON procesado documenta `fogasa.employer: 0.2`.
- Ahora se pasa `rates.fogasa.employer / 100`, igual que en 2005 y el resto de conceptos.
- No se incorporaron datos nuevos; se usa el valor ya documentado en `data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json`.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Revision visual/DOM en `http://127.0.0.1:5199/calculadora-fiscal`: en paso 3, panel Empresa, FOGASA aparece como `0,20 %` y `70,00 €` para el caso base de 35.000 EUR.

## Estado siguiente

FOGASA queda visible y calculado en la tarjeta de cotizaciones sociales para 2025.
