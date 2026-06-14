# 2026-06-14 - Parrafos sin scroll en pasos fiscales

## Objetivo

Quitar el scroll interno de la explicacion principal de `WorkerFiscalStepsCard` y mostrar el texto en parrafos reales.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- `activeStep.description` se divide por saltos dobles y se renderiza como varios `<p>`.
- Eliminado el `span` antiguo que compactaba todo el texto en un bloque.
- Eliminados `max-height`, `overflow-y` y scrollbar propio de la descripcion.
- Ajustada la separacion entre parrafos en escritorio y movil.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto en reintento; el primer intento agoto tiempo.
- Browser integrado en `http://127.0.0.1:5211/calculadora-fiscal`: paso 1 con 4 parrafos, sin `span` antiguo, `overflow-y: visible`, `max-height: none`, sin errores de consola y sin overflow horizontal en escritorio ni movil 390x844.

## Estado siguiente

La explicacion queda en flujo normal. Si algun paso largo ocupa demasiado alto, conviene ajustar el layout global o resumir visualmente por paso, no volver a meter scroll interno al texto principal.
