# 2026-09-07 · Comparador IRPF en escala logarítmica

## Objetivo

Poner el gráfico del comparador de IRPF por comunidad (`WorkerIrpfRegionComparison`) en escala logarítmica.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.tsx`
- `ai/current.md`

## Resumen de cambios

El eje X (salario) ya era logarítmico. El eje Y (tipo efectivo o cuota anual) pasa también a logarítmico, con marcas 1-2-5 o décadas según el rango. Los valores nulos o casi nulos se anclan a un suelo (0,1 % o 1 €) porque el logaritmo de 0 no está definido.

## Estado siguiente

Sin cambio de alcance: sigue pendiente el resto de la calculadora y la trazabilidad listada en `ai/current.md`.
