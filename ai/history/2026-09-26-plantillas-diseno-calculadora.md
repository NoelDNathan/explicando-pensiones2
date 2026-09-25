# 2026-09-26 · Plantillas de diseño para la calculadora

## Objetivo
Enseñar varias direcciones visuales para el rediseño de la calculadora fiscal, con
animaciones, usando el paso 3 (Cotizaciones sociales) como muestra, sin perder contenido.

## Archivos modificados
- `ai/current.md`
- `ai/history/2026-09-26-plantillas-diseno-calculadora.md`

Los diseños no están en el repositorio: viven en un lienzo privado de Claude
(https://claude.ai/artifact/WAvcAeqfPNxihpQbAxkMxo).

## Resumen de cambios
- Cuatro direcciones, cada una en escritorio y móvil: A Editorial, B Enfoque (7 bloques
  con «Seguir»), C Nómina viva y D Escenario (fondo oscuro, tipografía que se estira,
  100 casillas del coste del puesto, barras de desglose, gráfico del MEI y un indicador AT/EP).
- Todas incluyen el contenido completo del paso 3: las cuatro explicaciones, el párrafo con
  cifras en vivo, contrato, actividad AT/EP, vista mensual/anual, base usada y grupo, avisos
  de base máxima/mínima, filas del trabajador y la empresa con su explicación desplegable,
  nota y tabla del MEI con «Ver más detalle», nota AT/EP (IT/IMS) y el resumen completo.
- Las explicaciones de cada concepto se abren al tocar la fila (no dependen del hover).
- Colores solo de los tokens `--fiscal-*`; animaciones desactivadas con
  `prefers-reduced-motion`.

## Estado siguiente
Elegir dirección (o mezcla) y aplicarla como piloto a los pasos 0 y 5. Siguen pendientes de
aprobación los textos T1-T27 de la auditoría.
