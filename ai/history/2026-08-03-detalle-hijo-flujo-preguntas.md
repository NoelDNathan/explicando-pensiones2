# 2026-08-03 — Detalle de hijo como flujo de preguntas

## Objetivo

Tras responder la pregunta de hijos, mostrar el detalle de cada persona justo debajo, con estilo de preguntas (chips) y menos aspecto de formulario cuadrado.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`
- `ai/history/2026-08-03-detalle-hijo-flujo-preguntas.md`

## Resumen de cambios

- `DependentEditor` pasa a flujo conversacional (`wprc-person`) con chips por pregunta.
- Se anida dentro del cuerpo de `¿Tienes hijos?` y `¿Tienes padres o abuelos a cargo?`.
- Eliminada la rejilla de dos columnas con selects nativos.
- Ayuda/movilidad del dependiente solo si hay discapacidad; alimentos formalizados solo si hay importe.
- Soft theme actualizado para el nuevo flujo.

## Verificacion

- `pnpm run build` correcto.
- Revisión visual en `/componentes`: detalle del hijo bajo la cantidad, con chips.

## Estado siguiente

Commit/push solo si el usuario lo pide.
