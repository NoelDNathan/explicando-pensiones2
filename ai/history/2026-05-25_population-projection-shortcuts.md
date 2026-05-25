# Interaccion: hacer visibles los anos proyectados

Fecha: 2026-05-25

## Objetivo

Facilitar que la pagina `/poblacion` muestre claramente los anos proyectados.

## Archivos modificados

- `src/App.tsx`
- `src/App.css`
- `ai/current.md`

## Resumen de cambios

- Verificado que el CSV de proyeccion del INE contiene datos para 2026, 2050 y 2070.
- Anadidos botones de salto rapido bajo el selector: `2025 observado`, `Inicio proyeccion 2026`, `Ver 2050` y `Ver 2070`.
- Estilizados los botones proyectados con el mismo tono ambar de la etiqueta `Proyectado`.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con aviso conocido de chunk grande por importar CSV.

## Estado siguiente

- La zona proyectada queda accesible directamente sin tener que arrastrar el selector de ano.
