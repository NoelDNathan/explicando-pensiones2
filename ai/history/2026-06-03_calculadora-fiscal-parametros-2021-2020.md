# 2026-06-03 - Calculadora fiscal 2021 y 2020

## Objetivo

Continuar la extension de datos normativos de la calculadora fiscal hacia anos cercanos ya cubribles, empezando por 2021 y 2020.

## Archivos modificados

- `data/raw/boe/cotizaciones-2021/`
- `data/raw/boe/cotizaciones-2020/`
- `data/raw/aeat/irpf-2021/`
- `data/raw/aeat/irpf-2020/`
- `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2021.json`
- `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2020.json`
- `data/processed/fiscal/2026-06-02_calculadora-fiscal-trabajador-cobertura-por-ano-2014-2026.json`
- `data/methodology/calculadora-fiscal-trabajador-2021.md`
- `data/methodology/calculadora-fiscal-trabajador-2020.md`
- `data/methodology/transformations.md`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/checksums.sha256`
- `ai/current.md`

## Resumen de cambios

- Descargadas fuentes oficiales BOE/AEAT para cotizacion, IRPF estatal, IRPF Madrid, minimos, gastos y reducciones de trabajo 2021 y 2020.
- Creado un paquete JSON para 2021 y otro para 2020, calculables para caso base Comunidad de Madrid.
- Documentada la cautela temporal 2021: la Orden PCM/1353/2021 fija bases desde el 1 de septiembre.
- Documentada la prorroga normativa 2020: Real Decreto-ley 18/2019 mantiene la Orden TMS/83/2019 en materia de cotizacion.
- Actualizada la matriz de cobertura para dejar como siguientes anos recomendados 2019, 2018, 2017, 2016 y 2014.

## Verificacion

- JSON validados con `ConvertFrom-Json`.
- Checksums recalculados en `data/checksums.sha256`.
- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules/vite/bin/vite.js build`: correcto; mantiene el aviso conocido de chunk grande.

## Estado siguiente

Continuar con 2019 y 2018, aprovechando que 2020 ya dejo descargada y verificada la Orden TMS/83/2019 que tambien sirve como base para 2019.
