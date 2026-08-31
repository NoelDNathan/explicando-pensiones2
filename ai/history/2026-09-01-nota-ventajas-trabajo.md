# 2026-09-01 — Nota ventajas del trabajo más visible

## Objetivo

Hacer más llamativa y fácil de entender la nota que aparece en «Ventajas del trabajo» cuando el salario ya descarta esas ventajas fiscales.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- Texto simplificado: titular en negrita («Con tu salario actual no entran estas ventajas») y explicación directa de que no hace falta indicar otros ingresos.
- Estilo naranja/ámbar con borde lateral destacado; en tema suave usa tokens `--fiscal-orange` y `--fiscal-orange-soft`.
- `role="status"` para accesibilidad.

## Estado siguiente

- Revisar en `/calculadora-fiscal` paso 4 con salario alto (p. ej. 35.000 €) que la nota se vea bien en escritorio y móvil.
