# Alinea columnas de cotizaciones sociales (sin escalonado)

Fecha: 2026-07-12

## Objetivo

Corregir el aspecto escalonado del paso 3 (`WorkerSocialContributionsCard`): las columnas Trabajador, Empresa y Resumen tenian distinto numero de filas, por lo que sus cajas "Total" y sus bordes inferiores no coincidian.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.css`
- `ai/current.md`

## Resumen de cambios

- `.wscc-panel`: ahora es `display: flex; flex-direction: column;` para que el contenido pueda repartir el alto.
- `.wscc-lines`: pasa de `grid` a `flex` en columna con `flex: 1`, ocupando el alto disponible del panel.
- `.wscc-total`: `margin-top: auto` en lugar de `margin-top: 10px`, fijando el total al fondo del panel.
- Con el grid en `align-items: stretch` (ya existente), los paneles igualan alturas y los totales de Trabajador y Empresa quedan alineados abajo, eliminando el efecto escalonado.

## Verificacion

- `pnpm run build` (`tsc -b && vite build`): correcto (avisos conocidos de chunk grande y tiempos de plugins).
- Revision visual en navegador: pendiente de comprobar en escritorio y movil.

## Estado siguiente

- Revisar visualmente el paso 3 en escritorio y movil cuando haya navegador interactivo.
