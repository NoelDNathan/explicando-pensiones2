# 2026-07-12 - Badge MEI extra 2030

## Objetivo

Mostrar en la vista compacta cuanto pagaria de mas el trabajador por MEI en 2030, destacado arriba a la derecha del panel Trabajador.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`
- `ai/current.md`
- `ai/history/2026-07-12_mei-extra-2030-badge.md`

## Resumen de cambios

- Badge `wscc-panel__mei-extra` con importe extra del MEI trabajador en 2030 vs hoy, segun base y vista anual/mensual.
- Solo visible con la nota MEI colapsada; se oculta al expandir el detalle.
- Estado `meiNoteExpanded` elevado al card para coordinar badge y nota.

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

- Revision visual del badge en escritorio y movil.
