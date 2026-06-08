# 2026-06-07 - Worker IRPF por tramos

## Objetivo

Crear en `worker-salary-dashboard` el componente visual del paso `5. IRPF por tramos`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`
- `src/components/worker-salary-dashboard/index.ts`
- `src/App.tsx`
- `src/App.css`
- `ai/current.md`

## Resumen de cambios

- Anadido `WorkerIrpfTranchesCard` con selector de comunidad autonoma, tramos progresivos, base liquidable, calculo acumulado, cuota integra estimada y tipo efectivo.
- Exportado el componente y sus tipos desde la carpeta `worker-salary-dashboard`.
- Incorporado al laboratorio `/componentes` como Componente 19.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox por bloqueo `node.exe: Acceso denegado`; mantiene avisos conocidos de chunk grande y tiempos de plugins.
- `Invoke-WebRequest http://127.0.0.1:5177/componentes`: HTTP 200.
- Revision visual escritorio/movil pendiente porque no hay Browser tool callable en este turno.

## Estado siguiente

- Antes de uso editorial publico, documentar fuente normativa, ejercicio aplicable y metadata de los tramos usados.
- Revisar visualmente el Componente 19 en escritorio y movil cuando haya navegador integrado disponible.
- No se hizo commit/push porque el arbol de trabajo ya contenia cambios previos no atribuibles a esta interaccion y un `git add .` mezclaria trabajos distintos.
