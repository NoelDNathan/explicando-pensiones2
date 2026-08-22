# 2026-08-15 — Preguntas de propiedad y IBI multi-vivienda

## Objetivo

Mejorar el paso 7 de impuestos de consumo: preguntar antes si hay vivienda o coche en propiedad, quitar el interruptor «Incluido» del IBI y permitir calcular el IBI de varias viviendas.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `ai/current.md`

## Resumen de cambios

- Nuevo componente interno `OwnershipGate` con botones Sí/No antes de desplegar cada bloque.
- Vivienda: pregunta «¿Tienes vivienda en propiedad?» (cuenta aunque quede hipoteca); al decir Sí se muestran IBI y compra.
- Coche: pregunta «¿Tienes coche en propiedad?»; al decir Sí se muestra la calculadora de impuesto en la compra.
- Eliminado el switch «Incluido» del IBI.
- IBI refactorizado a lista de viviendas (`propertyIbis`) con valor catastral, tipo y totales por fila; botón para añadir otra vivienda.
- Al responder No se limpian los datos del apartado correspondiente.

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

- Revisar visualmente en escritorio y movil el flujo Si/No y las filas de IBI con varias viviendas.
