# 2026-09-26 · Fidelidad de maquetas D en v2

- **Objetivo:** corregir los textos y el orden de la v2 que se habían quedado como una capa visual genérica.
- **Archivos modificados:** cabeceras y pregunta de los pasos 4-9 y 11; estilos de escenario; `ai/current.md`.
- **Cambios:** el paso 4 usa la composición y el texto de la maqueta antes de su bifurcación; los pasos 5, 7, 8, 9 y 11 recuperan títulos/subtítulos literales sin afectar a la v1. Se retiró la cifra dinámica que rompía el título de la pregunta de especie.
- **Verificación:** `tsc -b`, `verify:styles` y `verify:fiscal-scenario` superados.
- **Estado siguiente:** continuar la auditoría paso a paso con comparación a 1280/390 px; no considerar terminados los pasos 4-12 hasta sustituir las composiciones genéricas restantes.
