# Comparador IRPF: rango 500k y ranking vs Madrid

Fecha: 2026-06-19

## Objetivo

Ampliar el comparador de IRPF por comunidad hasta 500.000 EUR, ordenar el ranking de mayor a menor IRPF y mantener la diferencia respecto a Madrid como referencia.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.tsx`

## Resumen de cambios

- Rango del eje X ampliado de 120k a 500k EUR, con distribucion logaritmica de puntos (14k–500k) y marcas fijas en 14k, 50k, 120k, 250k y 500k.
- Ranking ordenado de mas a menos IRPF (posicion 1 = mayor carga).
- La columna de diferencia compara siempre contra Madrid: Madrid muestra "—"; el resto muestra "+X" cuando paga mas que Madrid.
- Texto del ranking actualizado: "de mas a menos IRPF · vs Madrid".

## Verificacion

- `ReadLints` sin errores en el archivo modificado.
- `tsc --noEmit` sin errores relacionados con el componente.

## Estado siguiente

- Revisar legibilidad del grafico con escala log en movil.
