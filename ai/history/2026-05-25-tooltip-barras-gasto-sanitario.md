# 2026-05-25 - Tooltip en barras de gasto sanitario

- fecha: 2026-05-25
- objetivo: mostrar el importe en euros al pasar el mouse por cada segmento de las barras apiladas.
- archivos modificados:
  - `src/components/StackedBarChart.tsx`
  - `src/components/StackedBarChart.css`
  - `ai/current.md`
- resumen de cambios: se anadio un tooltip de Recharts con banda de edad, importe y porcentaje dentro de la categoria. El valor mostrado sale del mismo dato que dibuja cada segmento.
- estado siguiente: revisar visualmente el comportamiento en escritorio y movil cuando haya captura disponible.
