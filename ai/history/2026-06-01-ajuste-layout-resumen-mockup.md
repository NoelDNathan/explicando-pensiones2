# 2026-06-01 - Ajuste layout resumen al mockup

## Objetivo

Corregir la distribucion de la pagina `/resumen` para que se parezca mucho mas a la referencia aportada.

## Archivos modificados

- `src/components/PensionOverviewPage.tsx`
- `src/components/PensionOverviewPage.css`
- `ai/current.md`
- `ai/history/2026-06-01-ajuste-layout-resumen-mockup.md`

## Resumen de cambios

- Movido el selector de ano dentro del area central, por encima de piramide e indicadores, dejando la rail derecha para el simulador desde la parte superior.
- Ajustadas las proporciones de grid: sidebar mas contenida, rail derecha paralela, bloque superior con piramide a la izquierda e indicadores a la derecha.
- Compactado el panel de indicadores para que tenga una altura similar a la piramide y permita que la evolucion historica aparezca debajo en el primer viewport.
- Verificado con `tsc --noEmit`, `vite build` y capturas headless de escritorio y movil.

## Estado siguiente

Pendiente sustituir valores de prototipo por datos trazables y seguir afinando la fidelidad visual si se decide tomar el mockup como especificacion exacta.
