# 2026-08-16 — Ingresos fuera de nómina como subpreguntas

## Objetivo

Plantear la pregunta de ingresos fuera de la nómina como un flujo de subpreguntas Sí/No, en lugar de casilla + importe.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `ai/current.md`

## Resumen de cambios

- Nuevo componente `OtherIncomeQuestions` con el patrón `irpf-marital-subflow` / `irpf-marital-subask`.
- Subpregunta 1: «¿Sabes cuánto suman al año?» (Sí/No).
- Si Sí: campo de importe y aviso si supera 6.500 €.
- Si No: nota de que no se aplican reducción por rendimientos ni deducción por rentas bajas hasta confirmar.
- Helper `clearOtherIncomeFields` para limpiar al responder No en la pregunta principal.

## Estado siguiente

- Revisar en `/calculadora-fiscal` paso 4 que el flujo encadenado sea claro en móvil.
