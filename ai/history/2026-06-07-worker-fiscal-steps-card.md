# 2026-06-07 - Navegacion fiscal del trabajador

## Objetivo

Crear dentro de `FiscalWorkerDashboard` una cabecera guiada de siete pasos como la referencia aportada por el usuario.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/fiscal-worker-dashboard/WorkerFiscalStepsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/index.ts`
- `src/App.tsx`
- `ai/current.md`
- `ai/history/2026-06-07-worker-fiscal-steps-card.md`

## Resumen de cambios

- Creado `WorkerFiscalStepsCard` con panel superior, botones anterior/siguiente, barra de progreso, ayuda contextual y tarjetas inferiores de pasos.
- Los siete pasos son: Base real, Limites de cotizacion, Cotizaciones sociales, Reducciones, IRPF por tramos, Salario neto e IVA y otros impuestos.
- Integrado el componente dentro de `/calculadora-fiscal`, justo despues de los controles principales.
- Anadido al laboratorio `/componentes` como Componente 21.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `pnpm run build`: no ejecutable porque `pnpm` no esta disponible en el entorno.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox porque el intento normal fallo con `node.exe: Acceso denegado`; conserva avisos conocidos de chunk grande y tiempos de plugins.
- `http://127.0.0.1:5180/calculadora-fiscal`: HTTP 200.
- `http://127.0.0.1:5180/componentes`: HTTP 200.
- Revision visual real escritorio/movil pendiente: no hay Browser tool callable y Playwright no esta instalado/disponible.

## Estado siguiente

- Revisar visualmente `/calculadora-fiscal` y el Componente 21 en `/componentes` en escritorio y movil cuando haya navegador integrado o Playwright disponible.
- Ajustar copy/orden del wizard si se decide que reemplace visualmente a los controles actuales en lugar de convivir con ellos.
- No se hizo commit/push porque el arbol de trabajo ya contiene cambios previos no atribuibles a esta interaccion y un `git add .` mezclaria trabajos distintos.
