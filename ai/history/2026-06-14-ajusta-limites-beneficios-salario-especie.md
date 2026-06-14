# 2026-06-14 - Ajuste de limites en salario en especie

## Objetivo

Hacer que los beneficios de salario en especie arranquen en 0 y muestren el limite legal/orientativo junto al importe mensual.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `ai/current.md`
- `ai/history/2026-06-14-ajusta-limites-beneficios-salario-especie.md`

## Resumen de cambios

- Los importes por defecto de tarjeta comida, tarjeta transporte, seguro medico y guarderia empresa pasan a `0`.
- Tarjeta comida, tarjeta transporte y seguro medico tienen `max` y clamp en el input.
- Cada beneficio muestra una etiqueta visible con el limite aplicable; guarderia queda como sin tope mensual general si cumple requisitos.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto en segundo intento; el primero agoto tiempo.
- `http://127.0.0.1:5205/calculadora-fiscal`: HTTP 200.
- Browser integrado: paso 4 validado en escritorio por DOM; valores iniciales `0`, etiquetas presentes y clamp de transporte probado (`999` -> `136.36`).
- Pendiente: captura visual y comprobacion movil completa por timeouts CDP/Browser.

## Estado siguiente

Revisar visualmente el bloque en movil cuando el Browser integrado permita capturas/interacciones estables. No se hizo commit/push para no mezclar cambios previos del arbol de trabajo.
