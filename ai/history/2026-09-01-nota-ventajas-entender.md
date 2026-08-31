# 2026-09-01 — Nota ventajas: no aplica pero conviene entenderla

## Objetivo

Ajustar la nota de «Ventajas del trabajo» en salarios altos para dejar claro que no aplica, pero animar a entender el concepto y el simulador de debajo.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- Titular: «En tu caso no aplica, pero merece la pena entenderla» (alineado con el callout del `WorkIncomeReductionExplainer`).
- Cuerpo: no hace falta indicar otros ingresos; conviene saber cómo funciona la reducción en sueldos más bajos.
- Pista final hacia el simulador embebido.
- Estilos para párrafos múltiples y línea de pista (`__hint`).

## Estado siguiente

- Revisar en `/calculadora-fiscal` paso 4 con salario alto que la nota y el simulador debajo encajen bien sin repetir demasiado el mensaje.
