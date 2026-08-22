# 2026-08-04 — Defaults No en trabajo y discapacidad

## Objetivo

Trabajo y discapacidad por defecto en No; al elegir 25+ (o menos de 65) no premarcar discapacidad.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`
- `ai/history/2026-08-04-defaults-trabajo-discapacidad.md`

## Resumen

- «¿Trabaja?» arranca en No.
- Discapacidad arranca en No; se puede marcar No sin que se fuerce el 33 %.
- Etiquetas de edad: «25 o más» / «Menos de 65» (sin «con discapacidad»).
- Eliminado el auto-33 % al elegir esas edades; nota si hace falta discapacidad para computar.

## Verificacion

- `pnpm run build` correcto.
