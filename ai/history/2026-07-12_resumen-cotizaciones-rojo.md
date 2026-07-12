# 2026-07-12 - Rojo en cotizaciones trabajador

## Objetivo

Mostrar en rojo el importe de cotizaciones del trabajador en el resumen del paso 3.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`
- `ai/current.md`
- `ai/history/2026-07-12_resumen-cotizaciones-rojo.md`

## Resumen de cambios

- `wscc-summary__worker` pasa a rojo `#ff6b69`, coherente con el total de cotizaciones.
- `wscc-summary__gross` mantiene el azul.

## Estado siguiente

Verificacion: `pnpm run build` correcto.
