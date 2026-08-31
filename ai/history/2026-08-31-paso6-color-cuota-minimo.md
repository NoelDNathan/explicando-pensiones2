# 2026-08-31 — Color de la cuota del mínimo en el paso 6

## Objetivo

Corregir el color de la cuota del mínimo en el bloque explicativo del paso 6: estaba en morado (tono del segundo tramo) y ese importe recorre el primer tramo, que es verde.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFamilyMinimumExplainer.css`
- `src/components/worker-salary-dashboard/WorkerFamilyMinimumExplainer.tsx`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- La tarjeta «Cuota del mínimo» y el 1033,57 € de la resta pasan a verde (`--witc-green` / `--fiscal-green`), el mismo tono que el tramo 0–12.450 €.
- El bloque deja de usar morado neón y fondos oscuros sueltos: tokens propios y override `.fwd--soft` (fondo claro, cuota íntegra en azul fiscal).
- En la ecuación, el importe del mínimo hereda ese verde para que se reconozca al restarse.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
