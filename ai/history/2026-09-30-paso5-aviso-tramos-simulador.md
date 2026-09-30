# 2026-09-30 · Paso 5 v2: aviso, tramos y simulador

- **Objetivo:** mejorar el color del aviso «En tu caso no aplica», la tira del simulador cuando se engancha arriba y en móvil, y la parte de «Los tres tramos de la fórmula».
- **Archivos:** `escenario/EscenarioForms.css`.
- **Cambios:**
  - Aviso: deja el fondo amarillo; ahora va sobre el fondo oscuro con una franja amarilla a la izquierda (roja si la reducción está bloqueada) y el título en ese color.
  - Simulador: cada cifra se ajusta al ancho de su celda (unidades de contenedor), así que ya no se corta «16.834 €». Enganchado, el valor del deslizador es más pequeño y las etiquetas pueden ocupar dos líneas. En móvil, las cifras van en 2 × 2 y la escala del deslizador solo muestra 10.000, 18.000 y 30.000.
  - Tramos: son una lista de filas (nombre y rango a la izquierda, fórmula a la derecha) en lugar de cuatro cajas. El tuyo lleva una franja y un fondo verde, y se ve la etiqueta «Tu tramo», que antes quedaba negra sobre negra. La fórmula usa la letra normal en lugar de la monoespaciada. En la regla, 17.673,52 € baja a una segunda línea para no pisar a 19.747,50 €.
- **Comprobado:** en pantalla a unos 870 px, en 1450 × 900 (enganchado) y a 375 px; las cuatro cifras sin cortar y sin scroll horizontal. `verify:styles` pasa.
- **Siguiente:** revisión del usuario.
