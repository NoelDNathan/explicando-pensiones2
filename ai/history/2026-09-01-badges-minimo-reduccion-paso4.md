# 2026-09-01 — Badges mínimo vs reducción en el paso 4

## Objetivo

Que en el paso 4 se distinga visualmente si un importe suma al mínimo personal y familiar (p. ej. +1.150 € por ascendiente) o es una reducción de base (p. ej. plan de pensiones), con color y texto en el badge.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- `QuestionEffect` en familia y reducciones muestra «+X € mínimo» o «−X € reducción» (y «−X € deducción» / «X € exentos» en el formulario de ajustes).
- Verde (`--minimum`) para mínimo; azul (`--reduction`) para reducción de base; ámbar si el mínimo baja (reparto al 50 %).
- CSS: badge con `max-width: 100%`, padding vertical y sin `nowrap` fijo para móvil; tema oscuro añade estilo azul a `--reduction`.

## Verificación

- En `/calculadora-fiscal` paso 4: 1 ascendiente → `+1150 € mínimo` (verde); 1.200 € de plan de pensiones → `−1200 € reducción` (azul).

## Estado siguiente

Commit/push solo si el usuario lo pide.
