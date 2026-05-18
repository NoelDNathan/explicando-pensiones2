# Interaccion 0012 - detalle proteccion social COFOG

Fecha: 2026-05-18

## Objetivo

Bajar del apartado COFOG `10 Proteccion social` al detalle de segundo nivel para separar una aproximacion a pensiones.

## Archivos modificados

- `data/processed/igae/2026-05-18_igae_cofog-proteccion-social-detalle-aapp_1995-2024.csv`
- `data/processed/igae/2026-05-18_igae_cofog-aproximacion-pensiones-vejez-supervivientes-aapp_1995-2024.csv`
- `data/sources.md`
- `data/methodology/gasto-publico-cofog.md`
- `data/methodology/transformations.md`
- `ai/current.md`
- `ai/history/2026-05-18-0012-detalle-proteccion-social-cofog.md`

## Resumen de cambios

- Extraido del XLSX oficial de IGAE el gasto total anual de los grupos `10.1` a `10.9` y `Total 10`, para 1995-2024.
- Calculadas cuatro vistas: nominal, real en euros de 2024, porcentaje sobre gasto publico total y per capita real.
- Anadido porcentaje sobre el propio total de Proteccion social para facilitar una vista interna.
- Generada una serie calculada de `10.2 Vejez + 10.3 Supervivientes` como aproximacion COFOG a pensiones.
- Documentado que esa aproximacion no equivale exactamente a una serie presupuestaria estricta de pensiones contributivas.

## Estado siguiente

Validar visualmente la serie y decidir si la narrativa principal usara la aproximacion COFOG o una serie presupuestaria de Seguridad Social para el bloque especifico de pensiones.
