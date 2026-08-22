# 2026-08-20 - Marcas proporcionales en SalarySlider

## Objetivo

Corregir desalineación visual entre la posición del thumb del slider y las marcas de escala (p. ej. 133.000 € parecía estar en 50.000 €).

## Archivos modificados

- `src/components/ui/SalarySlider.tsx`
- `src/components/ui/SalarySlider.css`
- `ai/current.md`
- `ai/history/2026-08-20-salary-slider-marcas-proporcionales.md`

## Resumen

- Las marcas inferiores usaban `space-between` (espaciado uniforme) mientras el thumb sigue escala lineal o logarítmica.
- Cada marca se posiciona con `left` según su valor real en la escala activa (`valueToPercent`).
- Primer y último marcador alineados al borde; los demás centrados con `translateX(-50%)`.

## Verificación

- `pnpm run build`: correcto.

## Estado siguiente

- Valorar escala logarítmica en el paso 1 para salario anual (max 500.000 €), como en el showcase de `/componentes`.
