# 2026-07-12 - Nota evolucion MEI

## Objetivo

Mostrar bajo la linea MEI del panel Trabajador una explicacion similar a la nota AT/EP, con la evolucion programada del MEI para empresa y trabajador y su traduccion en euros.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`
- `data/processed/fiscal/2026-07-12_mei-evolucion-programada.json`
- `ai/current.md`
- `ai/history/2026-07-12_nota-evolucion-mei.md`

## Resumen de cambios

- Nuevo componente `MeiEvolutionNote` con tabla 2025-2050, reparto empresa/trabajador y ejemplo monetario segun la base de cotizacion activa.
- `ContributionRows` admite `afterRowKey` para insertar contenido justo despues de una linea concreta.
- Estilos `wscc-mei-note` con variante violeta en el panel trabajador.
- Dataset procesado con fuente Real Decreto-ley 21/2021 y tipos observados 2023-2025.

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

- Revision visual en escritorio y movil del panel Trabajador con la nota MEI desplegada.
- Valorar si conviene una version resumida en el panel Empresa para no duplicar texto largo.
