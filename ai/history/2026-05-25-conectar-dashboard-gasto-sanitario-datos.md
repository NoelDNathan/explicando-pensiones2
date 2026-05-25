# 2026-05-25 - Conectar dashboard de gasto sanitario a datos procesados

## Objetivo

Conectar `HealthExpenditureDashboard` con los CSV trazables de AIReF/INE en vez de usar valores demo.

## Archivos modificados

- `src/data/healthExpenditureData.ts`
- `src/components/HealthExpenditureDashboard.tsx`
- `src/components/StackedBarChart.tsx`
- `src/components/LifetimeAreaChart.tsx`
- `ai/current.md`

## Resumen

El dataset del dashboard importa los CSV procesados con `?raw`, filtra `Ambos sexos`, genera bandas de edad, curva acumulada, ranking, interpretaciones y KPIs desde el calculo AIReF/INE 2022. La grafica principal se limita a `Total sanidad`, porque no hay fuente completa para desagregar por categorias sanitarias.

## Estado siguiente

Revisar visualmente `/gasto-sanitario` en escritorio y movil cuando haya navegador/captura disponible. Mantener pendiente la busqueda de un cruce oficial categoria sanitaria x edad x sexo si se quiere recuperar el apilado por categorias.
