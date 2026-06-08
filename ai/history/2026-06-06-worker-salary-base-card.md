# 2026-06-06 - Componente base real salarial

## Objetivo

Crear en `worker-salary-dashboard` una tarjeta editable como la referencia visual del paso `1. Base real`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.css`
- `src/components/worker-salary-dashboard/index.ts`
- `src/App.tsx`
- `src/App.css`
- `ai/current.md`
- `ai/history/2026-06-06-worker-salary-base-card.md`

## Resumen de cambios

- Anadido `WorkerSalaryBaseCard` con salario anual/mensual, periodicidad, 12/14 pagas, complementos, salario en especie y resultado calculado.
- Integrado el componente en `/componentes` como Componente 15 con preview oscuro.
- La tarjeta usa valores demo editables y no incorpora datos editoriales ni datasets nuevos.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras reintento con aprobacion por bloqueo inicial de `node.exe: Acceso denegado`; mantiene avisos conocidos de chunk grande y tiempos de plugins.
- Navegador integrado en `/componentes`: escritorio 1280x720 y movil 390x844 sin overflow horizontal; resultado inicial `37.500 €`.
- Captura PNG bloqueada por timeout en `Page.captureScreenshot`.

## Estado siguiente

- Revisar captura visual cuando el navegador integrado permita screenshot estable.
- No se hizo commit/push porque el arbol contiene cambios previos no atribuibles a esta interaccion en archivos compartidos y no conviene mezclarlos.
