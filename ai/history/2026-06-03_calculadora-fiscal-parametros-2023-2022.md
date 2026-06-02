# 2026-06-03 - Calculadora fiscal 2023 y 2022

## Objetivo

Extender la calculadora fiscal del trabajador a otros anos cercanos, aprovechando continuidad normativa solo cuando la fuente oficial confirma que no hay cambios relevantes.

## Archivos modificados

- `data/raw/boe/cotizaciones-2023/2026-06-03_boe_orden-pcm-74-2023-cotizacion-regimen-general.html`
- `data/raw/boe/cotizaciones-2022/2026-06-03_boe_orden-pcm-244-2022-cotizacion-regimen-general.html`
- `data/raw/aeat/irpf-2023/`
- `data/raw/aeat/irpf-2022/`
- `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2023.json`
- `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2022.json`
- `data/processed/fiscal/2026-06-02_calculadora-fiscal-trabajador-cobertura-por-ano-2014-2026.json`
- `data/methodology/calculadora-fiscal-trabajador-2023.md`
- `data/methodology/calculadora-fiscal-trabajador-2022.md`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/checksums.sha256`
- `ai/current.md`

## Resumen de cambios

- Descargados y conservados brutos oficiales BOE/AEAT para 2023 y 2022.
- Creado un JSON calculable para 2023 con bases/tipos del Regimen General, MEI 0,6%, escala estatal, escala Madrid, minimos estatales/Madrid, gastos/reducciones de trabajo y tipos legales de IVA.
- Creado un JSON calculable para 2022 con bases/tipos del Regimen General, MEI a 0, escala estatal, escala Madrid, minimos estatales/Madrid, gastos/reducciones de trabajo y tipos legales de IVA.
- Documentado que Madrid 2022 no se copia de 2023 porque cambian tramos y minimos autonomicos.
- Actualizada la matriz de cobertura para marcar 2023 y 2022 como `parametrizado_parcial_ampliable`.

## Estado siguiente

Quedan parametrizados parcialmente 2025, 2024, 2023, 2022 y 2015 para caso base Comunidad de Madrid. Siguiente bloque recomendado: 2021 y 2020, con cautela especial en 2020 por prorroga normativa.
