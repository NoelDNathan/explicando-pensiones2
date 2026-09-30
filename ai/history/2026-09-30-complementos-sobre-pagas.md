# 2026-09-30 · Complementos encima de las 12 pagas

Objetivo: en el paso 1 de la v2, poner «Complementos salariales anuales» encima del gráfico de 12/14 pagas.

Archivos modificados:
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `ai/current.md`

Resumen: se invirtió el orden de los dos bloques de la rama escenario. El salario, los chips y la base real calculada no cambian; solo se lee primero el control de complementos y después el gráfico de pagas.

Estado siguiente: la revisión visual de la v2 sigue en curso.
