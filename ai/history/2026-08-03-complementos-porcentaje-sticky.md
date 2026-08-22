# Complementos: el porcentaje se mantiene al mover el salario

Fecha: 2026-08-03

## Objetivo

Al subir o bajar el salario fijo, que cambien los euros de complementos y salario en especie, no el porcentaje.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`

## Resumen de cambios

- El porcentaje pasa a ser la referencia persistente de complementos y especie.
- Los euros se derivan del salario fijo anual × porcentaje.
- Editar euros actualiza el porcentaje; editar el salario mantiene el porcentaje y recalcula euros.

## Verificación

- `pnpm run build` correcto.
- Comprobado en `/calculadora-fiscal` paso 1: con 10 % fijo, al pasar el salario de 50.000 a 70.000 los complementos pasan de 5.000 a 7.000 € y el porcentaje sigue en 10.

## Estado siguiente

Sin commit/push (solo bajo petición explícita).
