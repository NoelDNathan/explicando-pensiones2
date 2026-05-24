# 2026-05-25 — Componente 06: YearSelector

## Objetivo

Crear un componente selector de año con estética de panel de control futurista
(glassmorphism, neon teal, sci-fi HUD), siguiendo las convenciones de código y
estilo visual de `TimeSeriesChart.tsx`.

## Archivos modificados

- `src/components/YearSelector.tsx` — componente nuevo
- `src/components/YearSelector.css` — estilos nuevos
- `src/App.tsx` — importación y sección "Componente 06" añadidas al laboratorio

## Resumen de cambios

### YearSelector.tsx

- Componente React puramente presentacional con interactividad completa.
- Soporta estado controlado (`year`, `playing`) y no controlado internamente.
- Línea de tiempo en SVG con geometría en unidades viewBox (VW×VH), siguiendo el
  mismo patrón que TimeSeriesChart.
- Indicador circular luminoso con filtros SVG (`feGaussianBlur` + `feMerge`) para
  efecto LED de dos capas: halo suave + glow nítido + core `#36d9e0` + punto blanco.
- Fill de progreso (tramo izquierdo → indicador) con gradiente lineal.
- Tick marks en años configurables (por defecto 1950, 1975, 2000, 2025, 2050, 2070)
  con opacidad diferenciada: pasado / actual / futuro.
- Arrastre preciso con `setPointerCapture` para no perder el foco al salir del SVG.
- Teclado accesible: `←` / `→` para mover un año, `Space` para play/pause.
- Botón de play/pause circular con anillo de pulse animado (`ysl-pulse` keyframes)
  cuando está en reproducción.
- Loop RAF para auto-avance con `playIntervalMs` configurable (120 ms por defecto);
  se detiene sólo al llegar a `maxYear` y reinicia desde `minYear`.
- Tokens CSS prefijados `--ysl-*` para permitir futura variante clara.

### YearSelector.css

- Glassmorphism: `backdrop-filter: blur(24px)` + fondo `rgba(7,13,24,0.82)`.
- Borde luminoso: `rgba(54,217,224,0.22)` con edge glow pseudo-elemento superior
  (gradiente lineal centrado).
- Sombras en capas: ambient + directional + neon haze exterior.
- Play button con radial-gradient interior y tres estados: reposo, hover, activo.
- Responsive a ≤ 640 px: fuente del año reducida a 34 px, play button a 40 px.

## Estado siguiente

- Conectar `YearSelector` a los graficos de líneas temporales para filtrar el año
  mostrado.
- Considerar variante `light` si se necesita en fondos editoriales claros.
