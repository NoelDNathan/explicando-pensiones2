# 2026-09-26 · Capítulos de la v2

- **Objetivo:** corregir el corte de «Ventajas del trabajo» mostrado en la captura de la persona usuaria.
- **Archivos modificados:** `EscenarioPersonalReductions.css`, `ai/current.md`.
- **Cambios:** el patrón compartido de capítulos usa la proporción de la maqueta (200 px + 48 px), da ancho reducible a la columna de texto y permite partir títulos; en móvil pasa a una sola columna.
- **Verificación:** `tsc -b`, `verify:styles` y `verify:fiscal-scenario` superados.
- **Estado siguiente:** revisar el resto de composiciones de los pasos 4-12 contra las maquetas; el navegador local continúa sin iniciar para la comprobación mediante captura.
