# 2026-07-09 - Dos colores en nomina paso 3

## Objetivo

Separar visualmente cotizaciones del trabajador y aportacion de la empresa en la nomina del paso 3.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`

## Resumen de cambios

- `PayrollExample` admite `highlightWorkerRows` y `highlightCompanyRows`.
- Paso 3: azul para `/350`, `/370`, `/380`; verde para `TOTAL`, `Desempleo` y `Form. Profesional`.
- Se quitan del paso 3 `RETENCION IRPF`, `TOT.DEDUCCIONES` y `Base sujeta a retencion del IRPF`.

## Estado siguiente

- Revisar visualmente el paso 3 en `/calculadora-fiscal`.
