# 2026-06-12 - Ajuste visual de beneficios de empresa

## Objetivo

Hacer que el bloque de beneficios de empresa de la calculadora fiscal encaje mejor con el estilo compacto de la tarjeta de salario en especie, sin incluir coche de empresa.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `ai/current.md`
- `ai/history/2026-06-12-ajusta-beneficios-empresa.md`

## Resumen de cambios

- Sustituida la rejilla de beneficios por una tarjeta compacta con filas, icono, input de importe mensual y chip de estado.
- Renombrados los beneficios a tarjeta comida, tarjeta transporte, seguro medico, guarderia empresa, telefono movil, formacion y otros beneficios.
- Eliminado `Coche de empresa`.
- Anadido resumen local de importe mensual informado y aviso de beneficios que requieren revisar requisitos.
- No se incorporaron datos nuevos ni se alteraron formulas fiscales.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- `http://127.0.0.1:5202/calculadora-fiscal`: HTTP 200.
- Revision visual directa pendiente: no hay Browser plugin disponible en este turno y Playwright no esta instalado en el proyecto.
- No se hizo commit/push porque el arbol ya contenia cambios previos no atribuibles a esta interaccion, incluido un hunk previo en `WorkerPersonalReductionsCard.css`, y commitear el archivo completo mezclaria trabajos distintos.

## Estado siguiente

Revisar visualmente `/calculadora-fiscal`, paso 4, en escritorio y movil cuando haya navegador o Playwright disponible, y decidir si estos importes locales deben conectarse mas adelante con el salario en especie calculable.
