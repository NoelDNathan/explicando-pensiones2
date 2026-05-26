# 2026-05-27 - Alternativas para historico de tasa de reemplazo

## Objetivo

Buscar alternativas oficiales para cubrir los anos previos al tramo proyectado del Ageing Report en la tasa de reemplazo de jubilacion.

## Archivos modificados

- `ai/current.md`
- `ai/history/2026-05-27_004036_alternativas-historico-tasa-reemplazo.md`

## Resumen

- Opcion preferida: microdatos oficiales MCVL para reconstruir una tasa cercana a la definicion exacta desde los anos disponibles, probablemente desde 2004 en adelante para muestras publicadas y con historicos administrativos internos mas largos segun variables.
- Opcion proxy agregada: numerador con pension media de altas iniciales de jubilacion de Seguridad Social/MITES y denominador con salario de trabajadores mayores de INE EES/EAES o decil salarial EPA.
- Opcion larga debil: pension inicial media o altas iniciales frente a salario medio agregado INE/BDMACRO, solo como proxy de contexto, no comparable directamente con Ageing Report.
- Opcion contraste externo: Eurostat ARR y OCDE replacement rates, utiles para comparacion, pero con definiciones distintas.

## Estado siguiente

Antes de construir CSV historico, elegir si se prioriza fidelidad metodologica (MCVL) o cobertura temporal larga con etiqueta de proxy.
