# 2026-07-12 - MEI colapsable y tildes

## Objetivo

Corregir tildes en la nota MEI y mostrar inicialmente solo titulo, mini descripcion y tabla, con detalle expandible.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`
- `ai/current.md`
- `ai/history/2026-07-12_mei-nota-colapsable.md`

## Resumen de cambios

- Nota MEI colapsable con boton "Ver mas detalle" / "Ver menos" y `aria-expanded`.
- Vista inicial: titulo, mini descripcion y tabla de evolucion.
- Vista expandida: explicacion completa, reparto 50-50, traduccion a euros y fuente.
- Tildes corregidas (año, cotización, prestación, público, serían, órdenes, evolución).

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

- Revision visual del estado colapsado y expandido en escritorio y movil.
