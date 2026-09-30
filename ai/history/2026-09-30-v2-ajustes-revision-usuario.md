# 2026-09-30 · v2: ajustes tras la revisión del usuario

Objetivo: aplicar las decisiones y correcciones pedidas sobre /calculadora-fiscal/v2.

Cambios:
- Textos nuevos D aprobados (pasos 1, 7 y 8). Párrafo repetido del paso 9 quitado en la v2 (aprobado).
- Marco v2 sin columna lateral de 250 px entre 901 y 1180 px (aplastaba los pasos).
- Nómina: conceptos solo se parten tras un punto; hoja apilada por debajo de 1180 px.
- Paso 2: escala propia por tramos (base bajo el mínimo visible con círculo y línea; exceso sin chocar con el borde); selector de grupo en estilo D.
- Paso 3: ecuación del resumen en una línea y con tamaño ajustado a la columna.
- Paso 4: barra de especie exenta proporcional (antes x6); formulario de especie en filas D.

Verificado: tsc y verify:styles. Nómina sin cortes a 1024/1180/1280/390 px.
Pendiente de verificar en pantalla: pasos 2 (corredor y selector), 3 (resumen) y 4 (formulario).
Nota: el formulario admite especie mayor que el salario bruto (lógica v1, sin tocar).
