# 2026-07-12 - Porcentajes IT/IMS en desplegable AT/EP

## Objetivo

Mostrar en el selector de actividad AT/EP el desglose IT, IMS y total de cada categoria.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`
- `ai/current.md`
- `ai/history/2026-07-12_desplegable-atep-porcentajes.md`

## Resumen de cambios

- Cada opcion del desplegable sigue el formato `codigo - actividad · IT x% + IMS y% = z%`.
- Se reutiliza el formateo de porcentajes existente para mantener coherencia visual.
- Se reduce ligeramente el tamano de fuente del selector AT/EP para acomodar textos mas largos.

## Estado siguiente

Pendiente verificar compilacion y legibilidad del desplegable en escritorio y movil.
