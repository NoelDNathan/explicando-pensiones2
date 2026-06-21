# 2026-06-21 — IRPF marginal al lado del salario

## Objetivo

Colocar el bloque "IRPF marginal max actual" en la misma fila que el slider de salario bruto anual.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`

## Resumen de cambios

- Nueva fila `witc-salary-row`: slider a la izquierda (flexible) y tipo marginal a la derecha.
- Variante `witc-max-rate--inline` para alineación dentro de la fila; en pantallas estrechas se apilan.

## Verificación

- Build global sigue fallando por errores TS preexistentes en otros archivos.

## Estado siguiente

- Revisar visualmente en escritorio y móvil la fila salario + tipo marginal.
