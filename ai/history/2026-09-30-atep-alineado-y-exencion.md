# 2026-09-30 · Selector AT/EP alineado y exención/reducción/deducción

- **Objetivo:** alinear los tipos del selector AT/EP con el nombre (paso 3) y mejorar la lista exención/reducción/deducción (paso 4) en v2.
- **Archivos:** `escenario/EscenarioSocial.css`, `escenario/EscenarioStep.css`.
- **Cambios:**
  - Los tipos IT/IMS/total heredaban `justify-content: flex-end` de v1; ahora empiezan donde empieza el nombre (en el selector cerrado y en la lista).
  - Paso 4: los tres términos son tres filas separadas por líneas: término grande en su color (verde, azul, amarillo), la explicación al lado y una etiqueta con el paso en el mismo color. En móvil, el término y el paso van arriba y la explicación debajo. Texto sin cambios.
- **Comprobado:** en pantalla a unos 870 px y a 375 px, sin scroll horizontal; `verify:styles` pasa.
- **Siguiente:** revisión del usuario.
