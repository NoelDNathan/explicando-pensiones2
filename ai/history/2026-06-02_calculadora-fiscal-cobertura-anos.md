# Interaccion: cobertura anual de calculadora fiscal

Fecha: 2026-06-02

## Objetivo

Revisar para que anos se puede extender la calculadora fiscal del trabajador con fuentes oficiales comparables.

## Archivos modificados

- `data/processed/fiscal/2026-06-02_calculadora-fiscal-trabajador-cobertura-por-ano-2014-2026.json`
- `data/methodology/calculadora-fiscal-cobertura-por-ano.md`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/checksums.sha256`
- `ai/current.md`

## Resumen

Se revisaron fuentes oficiales AEAT y BOE para delimitar la cobertura anual de la calculadora fiscal. Resultado: se pueden abarcar 2014-2025 con trazabilidad razonable. 2016-2024 son el tramo mas directo para completar despues de los paquetes ya iniciados de 2015 y 2025; 2020 queda marcado con cautela metodologica por prorroga normativa; 2026 no queda cubierto como ejercicio IRPF anual cerrado.

## Estado siguiente

Empezar la extraccion anual por 2024, 2023 y 2022, dejando 2020 y 2021 con notas metodologicas especificas.
