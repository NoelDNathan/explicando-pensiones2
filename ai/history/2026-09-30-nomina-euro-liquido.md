# 2026-09-30 · Euro del líquido total dentro del panel

Objetivo: que el euro de «Líquido total» en la nómina de la v2 no se salga de la esquina redonda del panel.

Archivos modificados:
- `src/components/worker-salary-dashboard/escenario/EscenarioStep.css`
- `ai/current.md`

Resumen: la cifra usaba hasta 3,5 rem según el ancho de la ventana. En la columna de 300 px, «2236,03 €» medía más que la columna y el euro pintaba fuera del panel. Ahora el tamaño es `min(3,5 rem, 100cqi / 7,4)`, medido sobre el propio bloque, de modo que cabe también un neto largo («10.000,00 €»).

Estado siguiente: la revisión visual de la v2 sigue en curso.
