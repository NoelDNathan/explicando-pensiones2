# 2026-08-15 — Plan del cónyuge sin selector de tipo

## Objetivo

Simplificar la reducción por aportación a la previsión del cónyuge: fiscalmente es igual para plan de pensiones, mutualidad o plan asegurado; solo preguntar si aplica y mostrar ayuda desplegable.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`

## Resumen de cambios

- Pregunta principal renombrada a previsión para la jubilación (tres productos equivalentes).
- Eliminado el selector de tipo de producto tras el importe.
- Bloque «¿Cuál es cuál?» pasa a desplegable con las tres definiciones.
- Al introducir importe se marca automáticamente producto válido para el cálculo.

## Verificación

- `pnpm run build` correcto.

## Estado siguiente

- Revisar en `/calculadora-fiscal` paso 4 con estado civil casado/a: desplegable, ingresos &lt; 8.000 € e importe.
