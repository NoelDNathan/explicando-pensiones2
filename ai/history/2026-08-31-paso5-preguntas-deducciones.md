# 2026-08-31 — Paso 5 al patrón de preguntas del paso 4

## Objetivo

Reescribir el paso 5 (deducciones y salario en especie) con el mismo patrón didáctico del paso 4: conceptos en cabecera, descripción encadenada, preguntas Sí/No, ecuación visual, cadena sticky y aviso de alcance autonómico.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/App.tsx` (laboratorio `/componentes`, variante paso 5)
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css` (llave CSS suelta que impedía cargar la app)

## Resumen

- Cabecera del paso 5: conceptos «¿Reducción o deducción?» y «¿Qué es una deducción reembolsable?» con fórmulas; descripción que encadena con los pasos 4 y 6; tildes.
- Los ~50 campos del formulario pasan a 8 preguntas Sí/No (`ReductionQuestion`) con `effectAmount`.
- Ecuación cuota íntegra − mínimo = cuota; cadena sticky cuota → ordinarias → reembolsables → retenciones → resultado.
- Subsecciones 1–4 y aviso de que las deducciones autonómicas propias no están en el motor.

## Estado siguiente

Comprobar en móvil 375 px el wrap de la cadena sticky de 5 eslabones si hace falta compactar más.
