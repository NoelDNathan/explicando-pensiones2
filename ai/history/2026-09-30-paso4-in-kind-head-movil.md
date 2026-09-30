# 2026-09-30 — Cabecera paso 4 (especie) en móvil

## Objetivo
Corregir título y párrafo «Cotiza entero, tributa solo en parte» que en móvil quedaban en una columna de ~120px (texto vertical).

## Archivos modificados
- `src/components/worker-salary-dashboard/escenario/EscenarioForms.css`

## Resumen
En `@media (max-width: 900px)` la rejilla con hueco para el número gigante se aplicaba a todos los `.wprc-net-income__head`, incluidos `--no-num` (paso 4 sin cifra). El contenido (h3 + p) ocupaba `clamp(64px, 18vw, 120px)`. Se limitó esa rejilla a cabeceras con número (`:not(.wprc-net-income__head--no-num)`), igual con la pill.

## Estado siguiente
Revisar en dispositivo real el paso 4 escenario; otros bloques `--no-num` del mismo componente deberían beneficiarse del mismo arreglo.
