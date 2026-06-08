# 2026-06-06 - Limites de cotizacion worker dashboard

## Objetivo

Crear el componente visual del paso 2, `Limites de cotizacion`, en la carpeta `worker-salary-dashboard`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.css`
- `src/components/worker-salary-dashboard/index.ts`
- `src/App.tsx`
- `src/App.css`
- `ai/current.md`
- `ai/history/2026-06-06-limites-cotizacion-worker-dashboard.md`

## Resumen de cambios

- Creado `WorkerContributionLimitsCard` con selector de grupo, selector mensual/anual, barra de minimo/rango/maximo, estados `below_minimum`, `within_range` y `above_maximum`, simulaciones `Tu caso`, `En el minimo` y `En el maximo`, y callback `onResultChange` con `baseUsedMonthly`.
- Incorporados datos demo oficiales de 2026 para grupos mensuales 1-7 desde la Orden PJC/297/2026 del BOE; no se incorporan grupos 8-11 porque la tabla oficial los publica en euros/dia y requieren tratamiento separado.
- Anadidos estilos responsive dark/HUD para reproducir la referencia visual sin mezclar importes mensuales y anuales.
- Exportado el componente desde `worker-salary-dashboard`.
- Anadido al laboratorio `/componentes` como Componente 16.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutar fuera del sandbox porque `node.exe` dio `Acceso denegado` en el intento normal. Mantiene avisos conocidos de chunk grande y tiempos de plugins.
- Revision en navegador integrado de `/componentes`: escritorio sin overflow del componente; movil 390px sin overflow interno; simulacion `En el maximo` actualiza resultado a `5.101,20 € / mes` y `61.214,40 € / ano`.

## Estado siguiente

- El componente queda listo como pieza de UI/prototipo con fuente visible. Antes de uso editorial publico, documentar metadata completa de las bases de cotizacion por grupo y ano en los archivos de datos del proyecto.
- No se hizo commit/push porque el arbol ya contiene cambios previos no atribuibles a esta interaccion; un `git add .` mezclaria trabajos distintos.
