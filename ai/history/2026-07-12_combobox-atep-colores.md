# 2026-07-12 - Combobox AT/EP con busqueda y colores

## Objetivo

Mostrar IT, IMS y total dentro del selector al buscar actividades, destacados con color.

## Archivos modificados

- `src/components/worker-salary-dashboard/AtEpCategorySelect.tsx` (nuevo)
- `src/components/worker-salary-dashboard/AtEpCategorySelect.css` (nuevo)
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`
- `src/components/worker-salary-dashboard/index.ts`
- `ai/current.md`
- `ai/history/2026-07-12_combobox-atep-colores.md`

## Resumen de cambios

- Nuevo combobox accesible con busqueda por codigo o actividad.
- Cada opcion muestra codigo, etiqueta y pildoras IT/IMS/Total con colores diferenciados.
- El valor seleccionado usa el mismo formato visual en el trigger cerrado.
- Se elimina el `<select>` nativo, que no permitia resaltar partes del texto.

## Estado siguiente

Pendiente verificar compilacion y revision visual del panel desplegable en escritorio y movil.
