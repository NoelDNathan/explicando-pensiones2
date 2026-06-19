# Base real: rango de salario hasta 500.000 EUR

Fecha: 2026-06-19

## Objetivo

Igualar el limite superior del salario en el paso `Base real` con el de `IRPF por tramos`, para permitir llegar a 500.000 EUR.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`

## Resumen de cambios

- Rango anual:
  - `max` de `120000` a `500000`;
  - `step` de `500` a `1000`;
  - marcas actualizadas a `[14000, 50000, 120000, 250000, 500000]`.
- Rango mensual:
  - `max` de `10000` a `42000`;
  - marcas actualizadas a `[1000, 5000, 12000, 25000, 42000]`.

## Verificacion

- `ReadLints` sin errores en el archivo modificado.
- Vite HMR actualiza correctamente `WorkerSalaryBaseCard.tsx`.

## Estado siguiente

- Si se quiere exactitud estricta por periodicidad, se puede hacer el maximo mensual dinamico segun 12/14 pagas para equivaler exactamente a 500.000 EUR anuales.
