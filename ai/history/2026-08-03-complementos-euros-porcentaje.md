# 2026-08-03 — Complementos y especie en euros y %

- Objetivo: dividir los campos de complementos salariales y salario en especie en dos entradas sincronizadas: euros anuales y porcentaje del salario fijo.
- Archivos modificados: `WorkerSalaryBaseCard.tsx`, `WorkerSalaryBaseCard.css`, `ai/current.md`.
- Cambios: cada fila muestra un input en euros y otro en % del salario anual fijo; el valor canónico sigue siendo euros para el resto del dashboard. Al editar el porcentaje se recalculan los euros; al cambiar el salario se actualiza el porcentaje mostrado.
- Verificación: `pnpm run build` correcto; revisión en `/componentes` escritorio y móvil (~390–445 px) con ambos campos visibles, sincronización 10 % → 3.500 € y sin overflow horizontal en el card.
- Estado siguiente: si se pide, afinar edición tipográfica del porcentaje o llevar el mismo patrón a otros importes.
