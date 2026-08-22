# 2026-08-15 — Plan del cónyuge con preguntas sencillas

## Objetivo

Sustituir la casilla técnica del plan del cónyuge por un flujo entendible: ingresos &lt; 8.000 €, tope 1.000 € y tipo de producto.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
- `ai/current.md`

## Resumen de cambios

- Pregunta Sí/No: ¿gana menos de 8.000 € por nómina o cuenta propia?
- Aviso del máximo de 1.000 € de reducción anual.
- Importe aportado con hint del tope.
- Pregunta Sí/No en lenguaje llano sobre plan de pensiones/jubilación (sustituye «El plan cumple los requisitos»).
- Si ingresos ≥ 8.000 €, mensaje de que no aplica y se limpian aportación y elegibilidad.

## Verificación

- `pnpm run build` — correcto.

## Estado siguiente

Revisar flujo completo casado/a en UI tras recargar.
