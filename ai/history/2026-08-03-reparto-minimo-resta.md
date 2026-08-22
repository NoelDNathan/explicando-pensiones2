# 2026-08-03 — Reparto al 50 % muestra resta

## Objetivo

Que al elegir «A medias (50 %)» el badge de la pregunta de reparto muestre resta (−) y no suma (+).

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/history/2026-08-03-reparto-minimo-resta.md`

## Resumen

- Con `entitlementShare === "0.5"`, `effectAmount` pasa a `-contribution` (la mitad que no te corresponde).

## Verificacion

- `pnpm run build` correcto.
