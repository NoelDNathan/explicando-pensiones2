# 2026-06-03 - Tarjeta editable Tus datos fiscal

- Fecha: 2026-06-03 23:59 +02:00.
- Objetivo: disenar una tarjeta UI dark premium titulada "Tus datos" para introducir datos personales usados en deducciones fiscales.
- Archivos modificados:
  - `src/components/fiscal-worker-dashboard/FiscalPersonalDataCard.tsx`
  - `src/components/fiscal-worker-dashboard/FiscalPersonalDataCard.css`
  - `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
  - `src/components/fiscal-worker-dashboard/types.ts`
  - `src/App.tsx`
  - `src/App.css`
- Resumen de cambios: creado componente reutilizable con header luminoso, filas con iconos lineales, steppers, select de discapacidad, input de euros y nota informativa; integrado en `/calculadora-fiscal` y anadido al laboratorio `/componentes`.
- Verificacion:
  - `.\node_modules\.bin\tsc.cmd --noEmit`: correcto tras el cambio final.
  - `.\node_modules\.bin\vite.cmd build`: correcto antes del ultimo movimiento de layout; tras el ultimo cambio no pudo repetirse porque el revisor automatico de escalaciones bloqueo la ejecucion por limite de uso.
  - Revision visual: captura de `/componentes` en escritorio correcta; comprobacion movil con medidas DOM sin solapes. La revision final de `/calculadora-fiscal` quedo bloqueada por politica del navegador integrado para `127.0.0.1:5176`.
- Estado siguiente: revisar visualmente `/calculadora-fiscal` en escritorio y movil cuando el navegador vuelva a permitir localhost y repetir `vite build` si hay credito de escalacion disponible.
- Git: no se hizo commit/push porque el arbol de trabajo ya contenia cambios previos no relacionados en archivos de la calculadora y componentes; no conviene mezclar esos cambios con esta interaccion.
