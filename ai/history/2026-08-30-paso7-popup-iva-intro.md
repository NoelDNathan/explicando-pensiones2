# 2026-08-30 — Pop-up inicial del paso 7 (IVA)

## Objetivo

Al entrar en el paso 7, preguntar una sola vez si se quieren valores medios de IVA o rellenar a mano; si se elige a mano, recomendar la app del banco.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `src/App.tsx`
- `ai/current.md`

## Resumen

- Nuevo dialogo accesible al montar el paso 7: «Usar valores medios» aplica el preset de España; «Rellenarlos yo» deja los campos a 0 y recomienda el resumen de gasto de la app del banco.
- La eleccion se guarda en `localStorage` para no repetir el dialogo y, si se eligieron medias, reaplicarlas al volver al paso.
- Variante documentada en `/componentes` (boton «Ver pregunta inicial»).

## Estado siguiente

El boton de cabecera «Valores medios (España)» sigue disponible para cambiar de opinion despues del dialogo.
