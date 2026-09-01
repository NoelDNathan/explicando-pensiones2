# 2026-09-01 — Simulador enganchado: leyenda arriba, cifras plegables y barra compacta

## Objetivo

En el paso 4, que la escala de color del simulador se lea arriba del todo (junto al botón con los
euros), que las cifras se puedan ocultar mientras el panel va enganchado al scroll y que esa barra
ocupe menos pantalla.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.tsx`
- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.css`
- `ai/current.md`

## Resumen de cambios

- `wir-ramp-legend__scale` (0 % / 35 % / 70 %) sube a la fila del título, junto a «Ocultar cifras»
  y «Volver a tu salario». Debajo de la barra solo queda la frase que explica el color, que sigue
  ocultándose al engancharse.
- Nuevo botón `wir-toggle`, visible solo con el panel enganchado, que pliega los cuatro KPI
  (`hidden` + `aria-expanded`). Al despegarse el panel vuelve a verse entero.
- Enganchado y a partir de 1000 px la barra pasa a dos columnas: el slider ocupa la columna
  izquierda entera y a su derecha se apilan controles y cifras. Slider, pastillas y tarjetas
  encogen; sin cifras la columna derecha se reduce a los controles.

## Estado siguiente

- Por debajo de 1000 px el panel enganchado sigue apilado (título, slider, cifras).
