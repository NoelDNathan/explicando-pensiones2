# 2026-05-25 — Componente 07: Simulador de reformas

## Objetivo

Crear un componente visual móvil de estilo fintech/govtech para un simulador de reformas del sistema de pensiones, siguiendo el diseño del mockup de referencia y la estética de los componentes existentes del proyecto.

## Archivos modificados

- `src/components/ReformSimulator.tsx` — nuevo componente
- `src/components/ReformSimulator.css` — estilos del componente
- `src/App.tsx` — importación y sección "Componente 07" en `/componentes`

## Resumen de cambios

- Creado `ReformSimulator`: tarjeta móvil (max-width 360 px, proporciones 9:16) con fondo navy oscuro degradado, borde sutil con glow azul y esquinas redondeadas (20 px).
- Cabecera con título "Simulador de reformas", subtítulo y botón circular de información.
- Barra de pestañas (`Medidas activas` / `Añadir medida`) con indicador de línea azul bajo la pestaña activa y badge con el número de medidas.
- Lista de cinco medidas de ejemplo con icono circular de color (morado/persona, azul/porcentaje, verde/grupo, ámbar/maletín), título en muted, valor en blanco negrita y fecha a la derecha.
- Botón de tres puntos vertical en cada fila con callback `onMeasureMenu`.
- Botón CTA ancho con gradiente azul y sombra de glow.
- Tokens CSS locales (prefijo `--rs-`) para colores, sin contaminar el espacio global.
- Toda la API del componente es de tipo estricto (`ReformMeasure`, `ReformSimulatorTab`, `ReformSimulatorProps`); el componente es puramente presentacional.
- `tsc --noEmit`: sin errores. ESLint: sin errores.

## Estado siguiente

- El componente está disponible en `/componentes` como Componente 07.
- Pendiente: conectar el simulador con datos reales de proyección y habilitar la pestaña "Añadir medida".
