# Selector de grupo con bases mínima y máxima

Fecha: 2026-08-03

## Objetivo

Mejorar el selector de grupo de cotización del paso 2 para que, al desplegarse, cada opción muestre su base mínima y máxima.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`

## Resumen de cambios

- Sustituido el `<select>` nativo por un desplegable accesible propio (mismo patrón que AT/EP).
- Cada opción muestra badge de grupo, nombre y pastillas Mín./Máx. en la unidad activa (mensual/anual).
- El trigger cerrado también resume las bases del grupo seleccionado.
- Estilos oscuros y modo suave alineados; overflow visible mientras el menú está abierto.

## Verificación

- `pnpm run build` correcto.
- Revisión en `/calculadora-fiscal` paso 2: escritorio sin overflow horizontal; móvil 390×844 sin overflow horizontal, con mín./máx. visibles en el desplegable.

## Estado siguiente

Sin commit/push (regla de usuario: solo bajo petición explícita).
