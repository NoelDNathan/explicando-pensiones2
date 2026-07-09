# 2026-07-10 — Botones valores medios y reset en WCTC

## Objetivo

Añadir en `WorkerConsumptionTaxesCard` un botón para rellenar automáticamente los % del gasto con valores orientativos para el salario medio en España, y otro para restablecer.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `ai/current.md`

## Resumen de cambios

- Preset `AVERAGE_SPAIN_SHARE_PRESETS` (suma 100 %): ahorro 8 %, vivienda/deudas 34 %, alimentación básica 7 %, general 10 %, restaurantes 5 %, compras 11 %, ocio 7 %, transporte público 4 %, gasolina 5 %, electricidad 4 %, salud 3 %, tabaco 0,5 %, alcohol 1,5 %.
- Botones en cabecera: «Valores medios (España)» y «Restablecer».
- Estilos `.wctc-header-actions` y `.wctc-action`.

## Estado siguiente

- Probar en paso 7 que el total marque ≈100 % tras aplicar valores medios.
