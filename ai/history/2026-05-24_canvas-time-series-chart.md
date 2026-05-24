# 2026-05-24 · Canvas: Institutional time-series chart

## Objetivo

Crear una visualizacion de datos estilo dashboard institucional, moderna y premium, como grafico temporal de lineas multiples completamente reutilizable.

## Archivos modificados

- `~/.cursor/projects/.../canvases/institutional-time-series-chart.canvas.tsx` (nuevo, fuera del repositorio git)
- `ai/current.md` (actualizado)

## Resumen de cambios

Implementado un canvas de Cursor con las siguientes capacidades:

**Tipos de datos configurables:**
- `Dataset` con titulo, subtitulo, categorias, series, hitos y nota al pie
- `Series` con nombre, valores, unidad, eje (left/right), tipo (historical/projection/mixed) y punto de corte
- `Milestone` con indice de categoria y etiqueta

**Funciones matematicas:**
- `niceTicks`: calcula valores de marca agradables para cualquier dominio
- `paddedDomain`: extiende el dominio un 10% para evitar que las curvas toquen los bordes
- `makeScale`: escala lineal generica dominio-rango
- `catmullRom`: convierte puntos a bezier cubico suavizado (sin distorsion de valores)

**Elementos visuales:**
- Zona de proyeccion con fondo sombreado muy sutil
- Lineas de cuadricula horizontales sutiles (stroke.tertiary)
- Eje izquierdo y eje derecho con etiquetas de unidad rotadas
- Eje X con densidad automatica de etiquetas (maximo ~14 visibles)
- Marcadores de hito verticales con etiquetas rotadas escalonadas
- Curvas historicas (linea solida) y de proyeccion (linea discontinua)
- Tooltip interactivo al hover: crosshair vertical + puntos en cada serie + valores

**Arquitectura:**
- `HoverOverlay` extraido como componente separado para garantizar el tipado correcto de TypeScript
- `ChartSVG` encapsula toda la geometria SVG y la logica de escalas
- `Dashboard` envuelve el grafico con cabecera (titulo + leyenda) y pie de pagina
- Paleta de colores del SDK de cursor/canvas (`colorPalette`) para garantizar coherencia tematica

**Datos de demostracion:**
- Gasto en pensiones como % del PIB, 2000-2070 (eje izquierdo, `% PIB`)
- Ratio afiliados/pensionistas, 2000-2070 (eje derecho, `ratio`)
- Hitos: Reforma 2011, Factor de sostenibilidad 2013, Acuerdo Toledo 2021, Inicio proyeccion 2024
- Fuentes: AIReF (Opinion A/2025/1), IGAE BDMACRO, Seguridad Social

## Estado siguiente

El canvas es un artefacto del IDE, no del repositorio. Para usarlo como componente web habria que adaptarlo (sin dependencias de cursor/canvas) al proyecto React/Vite del frontend.
