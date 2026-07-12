# 2026-07-12 - Alineacion toolbar cotizaciones

## Objetivo

Corregir el aspecto escalonado del toolbar del paso 3 alineando base, contrato, AT/EP y vista anual/mensual.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`
- `src/components/worker-salary-dashboard/AtEpCategorySelect.tsx`
- `src/components/worker-salary-dashboard/AtEpCategorySelect.css`
- `ai/current.md`
- `ai/history/2026-07-12_toolbar-alineacion-wscc.md`

## Resumen de cambios

- Nuevo patron `wscc-toolbar-cell` con filas fijas de etiqueta y control.
- Altura unificada de controles (64px) para base, contrato, AT/EP y segmentos.
- `AtEpCategorySelect` admite `layout="compact"` para mostrar actividad y pildoras en una fila en el trigger.
- El toggle Anual/Mensual queda alineado con un espaciador equivalente a la etiqueta.

## Estado siguiente

Pendiente verificar compilacion y revision visual en escritorio y movil.
