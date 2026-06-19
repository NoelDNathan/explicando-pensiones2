# IRPF marginal maximo en cabecera

Fecha: 2026-06-19

## Objetivo

Mostrar en la esquina superior derecha del paso 5 el IRPF marginal maximo actual, sumando la parte estatal y la autonoma.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`

## Resumen de cambios

- Se calcula el tipo marginal activo estatal y el autonomico a partir del ultimo tramo activo de cada escala (`stateLines` y `regionalLines`).
- Se calcula el `currentCombinedMarginalRate` como suma de ambos tipos cuando hay doble escala.
- Se anade un bloque `output` en la cabecera derecha:
  - titulo: `IRPF marginal max actual`;
  - valor principal: porcentaje combinado;
  - subtitulo con desglose: `% estatal + % comunidad`.
- Fallback cuando no hay doble escala: usa el ultimo tramo activo de la escala generica.
- Ajuste responsive del layout de cabecera para que el bloque se apile correctamente en anchos pequenos.

## Verificacion

- `ReadLints` sin errores para los archivos modificados.

## Estado siguiente

- Si se desea, se puede hacer clicable este bloque para abrir un mini-tooltip explicando que es tipo marginal y no tipo efectivo.
