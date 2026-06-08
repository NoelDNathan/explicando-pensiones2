# 2026-06-07 - Campos anuales en base real

## Objetivo

Aclarar que `Complementos salariales` y `Salario en especie` son siempre importes anuales.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSalaryBaseCard.css`
- `ai/current.md`
- `ai/history/2026-06-07-worker-campos-anuales.md`

## Resumen

- Cambiadas las etiquetas a `Complementos salariales anuales` y `Salario en especie anual`.
- Anadida una marca visual `al año` dentro de ambos campos.
- Actualizados los `aria-label` para indicar que ambos importes son anuales.
- No se modifico la formula porque el calculo ya los sumaba como importes anuales.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecucion fuera del sandbox; el intento normal fallo con `node.exe: Acceso denegado`.
- Revision visual/DOM en `http://127.0.0.1:5185/calculadora-fiscal`: escritorio 1280x720 y movil 390x844 con etiquetas anuales, dos marcas `al año` y sin overflow horizontal.

## Estado siguiente

Pendiente decidir si los complementos y salario en especie deben exponerse tambien con sliders o permanecer como inputs precisos.
