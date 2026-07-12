# Divide paso 4 del recorrido fiscal

Fecha: 2026-07-12

## Objetivo

Separar el paso 4 en dos pasos didacticos: reducciones/minimos y deducciones/salario en especie.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`

## Resumen de cambios

- Paso 4: `Reducciones y minimos` (base IRPF, minimos personales/familiares).
- Paso 5: `Deducciones y salario en especie` (cuota final, beneficios exentos).
- Pasos 6-9: IRPF por tramos, salario neto, IVA, FAQ.
- `WorkerPersonalReductionsCard` con prop `focus` para alternar secciones sin perder estado entre pasos 4 y 5.
- Nomina de ejemplo: paso 4 resalta `BASE IRPF`; paso 5 resalta `BASE IRPF ESPECIE`.

## Verificacion

- Lints de archivos editados: sin errores.
- `tsc --noEmit`: correcto.
- `vite build`: correcto (avisos conocidos de chunk grande y tiempos de plugins).

## Estado siguiente

- Revisar pasos 4 y 5 en `/calculadora-fiscal` en escritorio y movil.
- Valorar si el paso 6 (IRPF) debe mostrar en su cabecera el numero de paso actualizado.
