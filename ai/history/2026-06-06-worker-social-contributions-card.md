# 2026-06-06 - Worker social contributions card

## Fecha

2026-06-06

## Objetivo

Crear el componente del paso `3. Cotizaciones sociales` en `worker-salary-dashboard`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`
- `src/components/worker-salary-dashboard/index.ts`
- `src/App.tsx`
- `src/App.css`
- `ai/current.md`
- `ai/history/2026-06-06-worker-social-contributions-card.md`

## Resumen de cambios

- Anadido componente visual y calculable para cotizaciones sociales del trabajador y empresa.
- FOGASA aparece solo en empresa.
- Separado salario bruto de base usada para cotizar.
- Anadidos toggles anual/mensual y `%`, `€`, `% + €`.
- Expuesto resultado calculado para pasos posteriores, incluyendo salario despues de cotizaciones y coste total empresa.
- Incorporado al laboratorio `/componentes` como Componente 17.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox porque el primer intento fallo con `Acceso denegado`; mantiene avisos conocidos de chunk grande y tiempos de plugins.
- `Invoke-WebRequest http://127.0.0.1:5173/componentes`: HTTP 200.
- Revision visual escritorio/movil pendiente: no hay Browser tool callable en este turno y `playwright` no esta instalado en `node_repl`.

## Estado siguiente

- Documentar fuente oficial, ano aplicable y metadata de los tipos de cotizacion antes de uso editorial publico.
- Revisar visualmente el Componente 17 en escritorio y movil cuando haya navegador/captura disponible.
- No se hizo commit/push porque el arbol de trabajo contiene cambios previos no atribuibles a esta interaccion y `git add .` mezclaria trabajos distintos.
