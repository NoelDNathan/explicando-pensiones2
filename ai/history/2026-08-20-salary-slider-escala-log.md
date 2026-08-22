# 2026-08-20 - Escala log en sliders de salario anual

## Objetivo

Separar visualmente las marcas inferiores del slider (14.000 y 50.000 se veían pegadas con escala lineal hasta 500.000 €).

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `ai/current.md`
- `ai/history/2026-08-20-salary-slider-escala-log.md`

## Resumen

- Sliders con rango 14.000–500.000 € usan `scale="log"` (resumen intro/final y paso 1 en modo anual).
- En escala log, 50.000 queda al ~36 % del recorrido (antes ~7 % en lineal), alineado con paso 3 y showcase de `/componentes`.

## Verificación

- `pnpm run build`: correcto.

## Estado siguiente

- Revisar en móvil si las marcas centrales (120.000 / 250.000) mantienen legibilidad.
