# 2026-09-30 · Paso 5: salto del simulador · Paso 6: resultado en una línea

- **Objetivo:** que el simulador del paso 5 no salte entre grande y pequeño al engancharse, y poner las cuatro cifras del resultado del paso 6 en una línea.
- **Archivos:** `escenario/EscenarioForms.css`, `escenario/EscenarioIrpf.css`.
- **Cambios:**
  - Paso 5: el panel encoge unos 400 px al engancharse. El anclaje de scroll del navegador compensaba ese cambio moviendo la página, el centinela volvía a quedar debajo de la línea y el panel alternaba entre los dos tamaños (medido: la posición saltaba 182 → −21 → 197 → −6 bajando con la rueda). Con `overflow-anchor: none` en el explicador cambia una vez al bajar y otra al subir.
  - Paso 6: `.witc-results` es una rejilla de cuatro columnas: estatal, Madrid, total (más ancho) y tipo efectivo. Las cifras escalan con el ancho del bloque. En móvil, el total va arriba y las otras tres en 2 × 2 debajo.
  - Color de la barra del paso 5: no es un fallo de estilos. Sale del tipo marginal calculado con el perfil guardado en cada navegador (discapacidad, hijos…), así que dos navegadores con datos distintos pintan barras distintas.
- **Comprobado:** en pantalla a 1450 × 900, a unos 870 px y a 375 px; cifras sin cortar y sin scroll horizontal. `verify:styles` pasa.
- **Siguiente:** revisión del usuario. El mismo salto probablemente existe en v1; no se ha tocado.
