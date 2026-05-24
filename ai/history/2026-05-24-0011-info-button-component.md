# Historial de interaccion

Fecha: 2026-05-24

## Objetivo

Crear un boton de informacion reutilizable alineado con el estilo visual de `PopulationPyramid`.

## Archivos modificados

- `src/components/InfoButton.tsx`
- `src/components/InfoButton.css`
- `src/App.tsx`
- `src/App.css`
- `ai/current.md`
- `ai/history/2026-05-24-0011-info-button-component.md`

## Resumen de cambios

- Creado `InfoButton` con variantes `on-dark` y `on-light`, tamanos `sm`/`md` y popover accesible (click, Escape, clic fuera).
- Reutilizados tokens de superficie oscura de la piramide (`--color-axis-on-dark`, `--color-text-inverted-muted`, etc.).
- Anadida la seccion `Componente 03` en `/componentes` con previsualizaciones sobre fondo oscuro y claro.

## Estado siguiente

- Integrar `InfoButton` en la cabecera de `PopulationPyramid` o en paneles de grafico cuando se conecten datos reales.
- Valorar posicionamiento automatico del popover si se usa cerca de bordes del viewport.
