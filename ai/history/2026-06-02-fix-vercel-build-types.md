# 2026-06-02 - Correccion de errores de build Vercel

## Objetivo

Corregir errores de TypeScript reportados por Vercel y anadir una regla para verificar que los cambios funcionan antes de cerrar una interaccion.

## Archivos modificados

- `AGENTS.md`
- `ai/current.md`
- `src/components/charts/StackedBarChart.tsx`
- `src/components/charts/TimeSeriesChart.tsx`
- `src/components/pension-overview/ReformSimulator.css`
- `src/components/pension-overview/ReformSimulator.tsx`
- `src/components/ui/YearSelector.tsx`

## Resumen

- Ajustados tipos de coordenadas de ticks de Recharts para aceptar `number | string` y normalizarlos antes de usarlos en SVG.
- Anadido contenido a `InfoButton` en los usos que solo pasaban `label`.
- Mostrado el `subtitle` de `TimeSeriesChart` y eliminado `projStart`, que se calculaba pero no se usaba.
- Permitidas marcas `readonly` y refs SVG nulables en `YearSelector`.
- Eliminado un boton anidado alrededor del `InfoButton` del simulador de reformas.
- Anadida regla operativa para ejecutar `pnpm run build` o verificacion equivalente tras cambios de codigo, y documentar cualquier bloqueo.

## Estado siguiente

Pendiente ejecutar la verificacion completa en un entorno con `pnpm`/`node` disponible. En esta sandbox, `pnpm` no existe como comando y la ejecucion de `node`/TypeScript fuera de sandbox quedo bloqueada por limite de uso.
