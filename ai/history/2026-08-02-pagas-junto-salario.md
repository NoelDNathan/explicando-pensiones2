# 2026-08-02 — Selector de pagas junto al salario

- Objetivo: colocar el selector de 12/14 pagas al lado del salario y justo debajo del selector Anual/Mensual en el paso Base real.
- Archivos modificados: `WorkerSalaryBaseCard.tsx`, `WorkerSalaryBaseCard.css`, `FiscalSoftTheme.css`, `ai/current.md`.
- Cambios: el control de pagas deja su fila propia y pasa a una columna lateral `.wsbc-salary-side` junto al `SalarySlider`, apilado bajo Anual/Mensual. En móvil la columna lateral ocupa todo el ancho y muestra ambos selectores en dos columnas bajo el slider.
- Verificación: `pnpm run build` correcto; revisión visual en escritorio (pagas bajo Anual, a la derecha del slider) y móvil 390 px (Anual y pagas en fila bajo el slider, sin overflow horizontal).
- Estado siguiente: seguir con ajustes de layout del paso Base real si el usuario lo pide.
