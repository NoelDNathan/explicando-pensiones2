# 2026-08-23 — Botones Sí/No y No por defecto en el paso 4

## Objetivo

Unificar las etiquetas de los botones raíz del paso 4 a «Sí» y «No», y dejar «No» marcado por defecto en todas las preguntas raíz.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/fiscal-worker-dashboard/irpf2025Adjustments.ts`
- `ai/current.md`
- `ai/history/2026-08-23-paso4-botones-si-no-default.md`

## Resumen

- `ReductionQuestion` y `FamilyQuestion` pasan de «Sí, me aplica» / «No, continuar» a «Sí» / «No».
- Si no hay datos previos, la respuesta inicial es «No»; si ya hay importe o hecho relevante, sigue en «Sí».
- El formulario vacío confirma otras rentas a 0 € (`otherIncomeKnown: true`) y declaración individual, alineado con el No por defecto.
- Al pasar a Sí en declaración conjunta, el selector arranca en cónyuge (casado/a) o unidad monoparental.
- El aviso de «no aplicaremos nada» solo aparece si el usuario pulsa No después de haber abierto el apartado.

## Verificación

- `pnpm run build` correcto.
- `pnpm run verify:irpf2025` (24 comprobaciones) correcto.
- Comprobado en `/calculadora-fiscal` paso 4: todas las preguntas raíz muestran «Sí»/«No» con «No» pulsado; al pulsar «Sí» en hijos se abre el detalle.

## Estado siguiente

- Commit/push solo si el usuario lo pide.
