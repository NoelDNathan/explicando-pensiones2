# 2026-10-01 · «Qué vas a repasar» alineado (paso 11 v2)

- **Objetivo:** en la portada del repaso, la columna del paso 5 (y las de nombre largo) no quedaba alineada con las demás.
- **Archivos:** `escenario/EscenarioKnowledge.css` y `WorkerKnowledgeCheckCard.tsx` (solo la variable `--esc-kc-h` en el `style` del `<li>` de la v2). Los cambios entraron en el commit `20d382f` de otra sesión; esta nota va aparte.
- **Cambios:**
  - Cada columna se apilaba desde abajo, así que un nombre de tres líneas subía su barra.
  - Ahora la lista es una rejilla de 10 columnas con filas compartidas (`subgrid`): cifra y barra en la misma fila, y luego «Paso N», el nombre y «N preguntas».
  - Todas las barras nacen de la misma línea. La cifra va 8 px encima de su barra, colocada con la altura de la barra (`--esc-kc-h`).
  - Por debajo de 900 px la lista sigue como antes.
- **Comprobado:** a 1450 × 900 y a 1000 px, las 10 barras acaban a la misma altura y los nombres empiezan en la misma línea; a 375 px sin cambios y sin scroll horizontal. `verify:styles` pasa y `tsc` no da errores en el archivo.
- **Siguiente:** revisión del usuario.
