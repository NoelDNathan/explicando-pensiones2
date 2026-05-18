# Gasto publico por funciones COFOG

Fecha: 2026-05-18

## Objetivo

Preparar una serie oficial para una visualizacion del gasto publico de Espana por grandes apartados, similar a un treemap anual.

## Fuente principal recomendada

Usar IGAE, `Administraciones publicas. Clasificacion funcional: serie desde 1995`, para el sector Administraciones Publicas (S.13).

La fuente publica el gasto segun COFOG, una clasificacion internacional por finalidad del gasto. A primer nivel contiene diez divisiones:

- 01 Servicios publicos generales
- 02 Defensa
- 03 Orden publico y seguridad
- 04 Asuntos economicos
- 05 Proteccion del medio ambiente
- 06 Vivienda y servicios comunitarios
- 07 Salud
- 08 Ocio, cultura y religion
- 09 Educacion
- 10 Proteccion social

## Formatos a generar

Partiendo de una tabla anual larga con `year`, `cofog_code`, `cofog_name` y `nominal_million_eur`:

- Nominales: gasto publicado en millones de euros corrientes.
- Reales: `nominal_million_eur * ipc_base_year / ipc_year`, usando el indice general nacional del IPC del INE. Conviene fijar una base visible, por ejemplo euros de 2024.
- Porcentaje sobre el total: `nominal_million_eur / total_nominal_million_eur * 100`, donde el total debe proceder del mismo fichero COFOG y ano.
- Per capita real: `real_million_eur * 1000000 / population`, usando poblacion residente oficial del INE para el ano correspondiente.

## Fuentes auxiliares

- IPC: INE, indice general nacional del IPC, ya registrado en `data/sources.md`.
- Poblacion: INE, poblacion residente observada por sexo y edad, ya registrada en `data/sources.md`. Para gasto anual, usar la categoria "Todas las edades" a 1 de enero o documentar otra medida si se elige poblacion media.

## Cautelas

- No mezclar COFOG con clasificaciones presupuestarias: COFOG mide finalidad del gasto en Contabilidad Nacional, no programas presupuestarios.
- A nivel de division COFOG no existe "Pensiones" como bloque separado. Ese bloque queda incluido en `10 Proteccion social`.
- Si la web necesita un bloque especifico de pensiones, hay que generar una vista separada con fuente y definicion propias, o bajar a grupos COFOG de segundo nivel cuando el fichero lo permita.
- Mantener los datos brutos de IGAE en `data/raw/igae/cofog/` y los CSV derivados en `data/processed/igae/`.
