# Comparador IRPF: correccion interacciones

Fecha: 2026-06-19

## Objetivo

Corregir comportamientos erraticos al interactuar con el comparador (hover, clic fijado, lineas y ranking).

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.tsx`
- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.css`

## Resumen de cambios

- Prioridad del punto activo: fijado por clic > hover > salario actual. El ranking y la franja resumen ya no saltan al mover el raton tras fijar un punto.
- Si hay punto fijado y el raton pasa por otro salario, se muestra una linea de previsualizacion discontinua sin cambiar el ranking.
- Eventos de raton movidos al contenedor del grafico con coordenadas via ref al SVG (mas fiable que depender del evento en el SVG).
- Lineas con trazo invisible ancho (16px) para facilitar hover y clic; clic en linea fija el salario y cambia de comunidad.
- Eliminado parpadeo de resaltado de comunidad al pasar entre filas del ranking.
- Protecciones ante puntos indefinidos en ranking, madridAmount y circulos del grafico.

## Verificacion

- `ReadLints` sin errores.
- Verificacion visual en navegador no ejecutada (sin subagente de navegador disponible).

## Estado siguiente

- Probar manualmente en movil (tap para fijar).
