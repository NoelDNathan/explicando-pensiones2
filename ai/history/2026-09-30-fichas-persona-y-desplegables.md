# 2026-09-30 · Fichas de hijos y ascendientes, y desplegables de la v2

- **Objetivo:** mejorar el aspecto de la ficha de cada hijo o ascendiente (paso 5) y de todos los desplegables nativos de la v2.
- **Archivos:** `escenario/EscenarioForms.css`.
- **Cambios:**
  - Ficha de persona:
    - Franja izquierda verde si la persona suma y amarilla si no suma. El círculo con el número va en ese mismo color.
    - Título en la letra de titulares; la etiqueta «No suma» / «+1150 € mínimo» va en una píldora del mismo color.
    - Cada pregunta es una fila separada por una línea.
    - Los botones van sobre una pista más oscura que la ficha, que antes no se distinguía.
    - «Hace que no sume» va en amarillo, y la nota final lleva una raya amarilla.
    - En móvil los botones comparten una sola fila.
  - Desplegables (`select` de una opción, en toda la v2):
    - Sin la flecha del sistema; en su lugar un chevrón verde dibujado con degradados (tokens) y separado del borde.
    - Misma altura mínima y letra en todos, y borde verde con el foco.
    - Donde el navegador admite `appearance: base-select` (Chrome reciente), la lista abierta es oscura, con filas redondeadas, la opción elegida en verde y scroll en las listas largas. En los demás navegadores se ve la lista del sistema con fondo oscuro.
    - Se oculta el chevrón `<svg>` que ya traía el selector de comunidad del paso 6, para que no salgan dos.
- **Comprobado:** en pantalla a unos 810 px y a 375 px. Listas abiertas en los pasos 5 y 6, y desplegables de los pasos 3, 5, 6 y 9 sin chevrón doble. `verify:styles` pasa.
- **Siguiente:** revisión del usuario.
