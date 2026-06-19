# SalarySlider con edicion de texto

Fecha: 2026-06-19

## Objetivo

Permitir editar manualmente el salario escribiendo el importe en texto, ademas de mover el slider.

## Archivos modificados

- `src/components/ui/SalarySlider.tsx`
- `src/components/ui/SalarySlider.css`

## Resumen de cambios

- Se anade estado local `textValue` sincronizado con el valor real del slider.
- El valor mostrado pasa de `output` a `input` editable con parseo de formato espanol.
- Confirmacion de cambios al perder foco o pulsar `Enter`.
- Restauracion del valor original con `Escape`.
- Normalizacion del valor:
  - escala lineal: ajuste al `step`;
  - escala logaritmica: redondeo progresivo (`roundNice`) y clamp a min/max.

## Verificacion

- `ReadLints` sin errores en los archivos modificados.

## Estado siguiente

- Si se desea, se puede anadir un boton explicito de confirmar/cancelar junto al campo para usuarios que prefieran no usar teclado.
