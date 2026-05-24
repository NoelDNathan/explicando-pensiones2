# Historial de interaccion

Fecha: 2026-05-24

## Objetivo

Crear el primer componente visual de tipo grafico del laboratorio:
una piramide poblacional de Espana en SVG, con barras por sexo y
nacionalidad, franja resaltada de edad de trabajar y diferenciacion
tonal entre grupos en edad de trabajar y fuera de ella.

## Archivos modificados

- `package.json` (anadidas devDependencies `tailwindcss` y `@tailwindcss/vite`).
- `pnpm-lock.yaml` (actualizado por la instalacion).
- `vite.config.ts` (registrado el plugin `@tailwindcss/vite`).
- `src/index.css` (anadido `@import "tailwindcss"` y bloque `@theme` con
  los primeros tokens del proyecto: superficies oscuras, ejes, franja
  de edad de trabajar y paleta de la piramide poblacional con variantes
  activa/apagada).
- `src/App.tsx` (anadido la nueva seccion `Componente 02 - Piramide
  poblacional` al laboratorio interno).
- `src/App.css` (anadida la variante `.component-preview--dark` para el
  marco de previsualizacion sobre fondo oscuro).
- `src/components/PopulationPyramid.tsx` (componente reutilizable nuevo).
- `ai/current.md`.
- `ai/history/2026-05-24-0009-componente-piramide-poblacional.md`.

## Resumen de cambios

- Incorporado Tailwind CSS v4 al proyecto con tokens propios mapeados via
  `@theme`, en cumplimiento de la regla frontend que prohibe colores
  sueltos como `bg-blue-500` y exige tokens primero.
- Definidos tokens iniciales para superficies oscuras
  (`--color-surface-deep`, `--color-text-inverted`, etc.), eje en oscuro,
  franja de edad de trabajar y paleta de la piramide poblacional. Cada
  categoria de barra tiene dos variantes:
  - `*-active` para grupos en edad de trabajar (hue mas saturado).
  - `*-rest` para grupos fuera de edad de trabajar (hue mas apagado).
- Creado `src/components/PopulationPyramid.tsx`, componente SVG
  reutilizable y responsive con `viewBox` 620x493:
  - Barras horizontales segmentadas por nacionalidad (espanol + fuera),
    hombres a la izquierda, mujeres a la derecha.
  - Eje vertical fino central con etiqueta `Edad`.
  - Rectangulo semitransparente de color verde azulado oscuro que
    resalta la franja en edad de trabajar (20-64 por defecto).
  - Etiquetas a la derecha con `Fuera de edad de trabajar` y
    `En edad de trabajar`.
  - Ejes inferiores separados: hombres con escala invertida `500 250 0`
    y mujeres normal `0 250 500`, ambos con `Poblacion (miles)`.
  - Leyenda inferior con cuatro entradas usando los colores activos.
  - Datos de ejemplo internos con grupos quinquenales `0-4` a `90+` y
    forma demografica realista (base media, zona adulta ancha y edades
    avanzadas estrechas).
  - Tipos `PyramidAgeGroup` y `PopulationPyramidProps` exportados para
    permitir inyectar datos reales mas adelante.
- Anadida una nueva seccion al laboratorio `/componentes` para mostrar
  el componente sobre un marco oscuro.
- Verificado con `tsc -p tsconfig.app.json --noEmit` y `vite build`,
  ambos sin errores. Comprobado visualmente en navegador en escritorio
  y en viewport reducido.

## Estado siguiente

- Conectar `PopulationPyramid` con datos reales del INE: usar el CSV
  observado anual `data/processed/ine/...poblacion-residente-espana...`
  para una vista inicial sin nacionalidad y, cuando se incorpore la
  serie ECP por pais de nacimiento, ampliar el modelo de datos con la
  segmentacion espanol/extranjero real.
- Si se necesitan mas componentes con el mismo lenguaje visual oscuro
  (dashboard, paneles), reutilizar los tokens de superficie y texto
  invertido ya definidos.
- Considerar exportar `DEFAULT_DATA` o moverlo a un fichero de fixtures
  cuando crezca el numero de visualizaciones.
