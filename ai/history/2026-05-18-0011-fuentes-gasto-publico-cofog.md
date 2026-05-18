# Interaccion 0011 - fuentes gasto publico COFOG

Fecha: 2026-05-18

## Objetivo

Localizar fuentes oficiales para construir una visualizacion de evolucion del gasto publico por apartados, con vistas nominal, real, porcentaje sobre total y per capita real.

## Archivos modificados

- `data/sources.md`
- `data/methodology/gasto-publico-cofog.md`
- `ai/current.md`
- `ai/history/2026-05-18-0011-fuentes-gasto-publico-cofog.md`
- `data/raw/igae/cofog/2026-05-18_igae_cofog-aapp-serie-1995-2024.xlsx`

## Resumen de cambios

- Identificada IGAE COFOG como fuente principal oficial para gasto de Administraciones Publicas por grandes funciones desde 1995.
- Descargado el XLSX oficial de Administraciones Publicas, sector S.13.
- Registrada la fuente en `data/sources.md`.
- Documentadas las formulas iniciales para nominales, reales, porcentaje sobre total y per capita real.
- Anotada la cautela clave: "pensiones" no es division COFOG de primer nivel; queda dentro de Proteccion social.

## Estado siguiente

Procesar el XLSX COFOG a CSV largo de divisiones de primer nivel y validar totales antes de usarlo en la web.
