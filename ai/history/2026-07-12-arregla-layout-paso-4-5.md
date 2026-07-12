# Arregla layout tras dividir paso 4/5

Fecha: 2026-07-12

## Objetivo

Corregir los huecos y la distribucion rara de `WorkerPersonalReductionsCard` tras dividir el paso 4 en reducciones (4) y deducciones/beneficios (5).

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `ai/current.md`

## Resumen de cambios

- Clase modificadora en la raiz: `wprc--reductions` / `wprc--deductions-benefits` segun `focus`.
- `.wprc-panels`: de 2 columnas a 1 columna cuando solo se muestra un panel (elimina el hueco lateral).
- Lista de ajustes del panel visible: se reparte en 2 columnas para ocupar el ancho; en movil vuelve a 1 columna.
- `.wprc-summary`: de 4 a 3 columnas para no reservar hueco del segundo total ausente.

## Verificacion

- Lints: sin errores.
- `tsc --noEmit`: correcto.
- `vite build`: correcto (avisos conocidos de chunk grande y tiempos de plugins).
- Revision visual en navegador: BLOQUEADA. El navegador integrado no ejecuta los manejadores de React (los puntos de paso, el boton Siguiente y un toggle simple no responden; sin errores en consola) incluso tras reiniciar el dev server limpio. No se pudo llegar a los pasos 4/5 para captura.

## Estado siguiente

- Revisar manualmente pasos 4 y 5 en `/calculadora-fiscal` en escritorio y movil cuando el navegador vuelva a ser interactivo.
