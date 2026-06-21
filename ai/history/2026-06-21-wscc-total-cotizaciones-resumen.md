# 2026-06-21 — Total cotizaciones en resumen WSCC

## Objetivo

Mostrar en el resumen de `WorkerSocialContributionsCard` el coste total de cotizaciones sociales (trabajador + empresa).

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`

## Resumen de cambios

- Añadidos `totalContributionsAnnual` y `totalContributionsMonthly` a `SocialContributionResult`.
- Nueva fila en el aside de resumen: **Coste total cotizaciones** = cotizaciones trabajador + coste adicional empresa, con nota «Trabajador + empresa».
- Estilo visual `wscc-summary__item--total` con gradiente que combina acentos trabajador/empresa.

## Verificación

- `pnpm run build`: falla por errores TypeScript preexistentes en otros archivos (`FiscalWorkerDashboard.tsx`, `WorkerContributionLimitsCard.tsx`, `WorkerPersonalReductionsCard.tsx`); el cambio en WSCC no introduce errores nuevos.

## Estado siguiente

- Valorar si el dashboard fiscal debe consumir `totalContributionsAnnual` en un resumen global de cargas.
