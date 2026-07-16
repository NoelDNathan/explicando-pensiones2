# Auditoria de deducciones y reducciones IRPF 2025

Fecha: 2026-07-16

## Objetivo

Revisar en detalle las reglas y calculos de los pasos 4 y 5 de la calculadora fiscal para el ejercicio 2025.

## Archivos modificados

- `ai/current.md`.
- Este registro de historial.

## Resumen de cambios

- Auditoria estatica del componente `WorkerPersonalReductionsCard` y de su conexion con `FiscalWorkerDashboard`.
- Contraste con el Manual practico de Renta 2025 de la AEAT y sus paginas institucionales sobre minimos, reducciones, deducciones y retribuciones en especie.
- Confirmado que los importes base de los minimos estatales son correctos, pero el calculo completo no es fiscalmente fiable: la reduccion por rendimientos del trabajo usa una magnitud incorrecta, falta la nueva deduccion por rendimientos del trabajo de 2025, varias entradas se aplican como importes directos sin porcentajes ni limites, las anualidades a hijos y las cuotas sindicales/colegiales se clasifican mal, y los beneficios en especie no llegan al motor.
- Comprobaciones numericas independientes para Madrid, grupo 7, sin otras rentas: a 20.000 EUR el motor infravalora el IRPF aproximadamente 635,99 EUR por el orden de calculo de la reduccion; a 35.000 EUR el panel explicado muestra 5.200 EUR frente a una cuota calculada por el motor de aproximadamente 5.899,62 EUR antes de deducciones.
- No se ha cambiado codigo ni se han incorporado datos nuevos.

## Verificacion

- Revision estatica de formulas y estados React.
- Recalculo independiente de casos de 16.576, 18.000, 20.000 y 35.000 EUR con escala estatal y escala/minimo de Madrid 2025.
- No se ejecuta `pnpm run build` porque no hay cambios de codigo; el proyecto no dispone de una suite de pruebas fiscales automatizadas.

## Estado siguiente

Pendiente corregir el motor por capas fiscales, parametrizar requisitos y limites de 2025, conectar el salario en especie, persistir el formulario y anadir pruebas de regresion con casos AEAT antes de presentar el resultado como calculo fiscal.
