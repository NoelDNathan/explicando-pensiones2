# 2026-07-12 — FAQ sin duplicar titulo ni hero

## Objetivo

Evitar que el paso 8 repita «Preguntas frecuentes» y texto explicativo en `WorkerFiscalStepsCard` y en `fwd-faq-step`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `ai/current.md`

## Resumen de cambios

- Paso 8: `wfsc-stage--compact` sin bloque hero (orb, titulo, descripcion).
- Unico encabezado editorial en `fwd-faq-step` (titulo + parrafo introductorio).
- Eliminado el prefijo «8.» redundante en la cabecera FAQ.

## Estado siguiente

- Revisar paso 8 en escritorio y movil: barra de navegacion compacta arriba y FAQ debajo sin repeticiones.
