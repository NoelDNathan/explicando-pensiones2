# 2026-07-09 - Iconos de informacion en WorkerSalaryBaseCard

## Objetivo

Anadir iconos de ayuda junto a `Complementos salariales anuales` y `Salario en especie anual` para explicar que significa cada campo.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.css`

## Resumen de cambios

- Se reutiliza `InfoButton` con textos didacticos alineados con el paso 1 de `WorkerFiscalStepsCard`.
- Cada etiqueta pasa a un contenedor `wsbc-label-row` con el icono al lado.
- Se anaden estilos `wsbc-help` para integrar el boton en la tarjeta oscura.

## Verificacion

- `pnpm run build` falla por errores TS preexistentes en otros modulos; `WorkerSalaryBaseCard` no introduce errores nuevos.

## Estado siguiente

- Revisar visualmente en `/calculadora-fiscal` y `/componentes` que el popover se lea bien en escritorio y movil.
