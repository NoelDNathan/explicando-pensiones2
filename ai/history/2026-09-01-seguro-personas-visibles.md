# 2026-09-01 — Personas del seguro a la vista en el paso 4

## Objetivo

Quitar el desplegable «Afinar el detalle» y poner junto al seguro médico los contadores de personas, con el desglose de exención por persona.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
- `src/components/fiscal-worker-dashboard/irpf2025Adjustments.ts`
- `scripts/verify-irpf-2025-core.mjs`
- `ai/current.md`

## Resumen de cambios

- Eliminado el `<details class="irpf-inkind-detail">` (días, meses, prima de discapacidad e ingreso a cuenta).
- Bajo el seguro: personas cubiertas y personas con discapacidad; mínimo 1 cubierta si hay prima; la discapacidad no puede superar el total.
- El split pasa a `Exento 500 € /persona × 3 = 1.500 € · tributa 500 €` (y suma 1.500 €/persona si hay discapacidad).
- El motor aplica un tope conjunto sobre la prima total, no dos primas separadas.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
