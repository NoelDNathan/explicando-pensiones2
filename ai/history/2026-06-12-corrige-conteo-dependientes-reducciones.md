# 2026-06-12 - Corrige conteo de dependientes en reducciones

## Fecha

2026-06-12

## Objetivo

Evitar que marcar descendientes o ascendientes como `No computa` reduzca el selector de personas y oculte/reescriba el formulario en `/calculadora-fiscal`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`
- `ai/history/2026-06-12-corrige-conteo-dependientes-reducciones.md`

## Resumen de cambios

- `WorkerPersonalReductionsCard` devuelve por separado personas seleccionadas y personas que computan.
- `FiscalWorkerDashboard` conserva el numero seleccionado para rehidratar el paso 4 y usa solo el numero computable para el calculo fiscal.
- La prueba DOM confirma que con 2 descendientes seleccionados y uno marcado como `No computa`, siguen visibles 2 tarjetas y el resumen muestra 1 descendiente computable.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Browser integrado en `http://127.0.0.1:5176/calculadora-fiscal`: correcto en escritorio para el flujo de dependientes.
- `http://127.0.0.1:5173/calculadora-fiscal` estaba ocupado por otra app (`Rompe Hielo`), por lo que se valido este proyecto en 5176.
- Captura y comprobacion movil completa pendientes: el Browser integrado agoto tiempo en `Page.captureScreenshot` y despues fallo el click movil por timeout CDP.

## Estado siguiente

Pendiente revisar en movil cuando el navegador integrado responda con estabilidad. No se hizo commit/push porque el arbol contiene cambios previos no atribuibles a esta interaccion en archivos relacionados y un commit mezclaria trabajos.
