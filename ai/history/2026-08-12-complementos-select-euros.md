# 2026-08-12 — Complementos: select % + input euros

## Objetivo

Separar complementos salariales y salario en especie en un desplegable de porcentajes y un input de euros anuales, sincronizados, con el porcentaje como referencia.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.css`
- `ai/current.md`
- `ai/history/2026-08-12-complementos-select-euros.md`

## Resumen

- `AmountPercentSelect` sustituido por `AmountPercentPair`: select solo con presets `%` e input numérico con etiqueta `EUR/año`.
- El estado canónico es el porcentaje (`number`); los euros se derivan con `eurosFromPercent`.
- Al editar euros se recalcula el porcentaje exacto; si no coincide con un preset, el desplegable muestra ese % calculado (p. ej. `6,14 %`) en lugar de redondear al más cercano.
- Al mover el salario fijo se mantienen los porcentajes y se actualizan los euros.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

- Revisión visual en `/calculadora-fiscal` paso 1 (escritorio y móvil 390 px) cuando haya navegador disponible.
