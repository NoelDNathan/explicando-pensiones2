# 2026-09-26 · Pregunta de entrada en la calculadora fiscal

## Objetivo

Que lo primero que vea quien entra en `/calculadora-fiscal` sea una pregunta
que le obligue a dar una cifra, luego su salario, y despues la comparacion con
el calculo.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.tsx` y `.css`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/fiscalScenarioStorage.ts`
- `src/App.tsx` (`/componentes`)

## Resumen

- El resumen del paso 0 acepta `taxGuess` y `onTaxGuessChange`. Con ellos
  recorre tres pantallas: «De cada 100 € que cuesta tu trabajo, ¿cuantos crees
  que acaban en Hacienda y la Seguridad Social?» (deslizador 0-70 €, sin valor
  hasta moverlo; «Siguiente» deshabilitado hasta responder), «¿Cual es tu
  salario?» y la comparacion «Tu dijiste / El calculo» con barras en escala
  0-100 € y una frase segun la diferencia (±3 € cuenta como casi exacto).
- La cifra real es `100 − takeHomePer100`, la misma base que ya usaba el
  resumen: coste total del puesto, incluidos cotizacion de empresa e IVA
  estimado. Asi las dos cifras de la tarjeta suman 100.
- La respuesta se guarda en `fwd-tax-guess-v1`, **fuera** del escenario: es de
  quien visita, no del caso, y no debe viajar en los enlaces compartidos. Quien
  vuelve ve directamente la comparacion, con «Volver a responder».
- El foco pasa al titular de cada pantalla (comparando con la pantalla anterior,
  para que el doble efecto del modo estricto no lo robe al cargar). Las barras
  se animan salvo con `prefers-reduced-motion`.
- Solo tokens `--fiscal-*`; los parrafos nuevos llevan `.wfsc-summary--intro`
  delante porque `.fwd-worker-card p` les ganaba el color.
- `/componentes` muestra tres variantes: sin pregunta, sin responder y ya
  respondida.

Comprobado en el navegador a ancho de escritorio y de movil (375 px, sin scroll
horizontal). `tsc`, `verify:styles` y `verify:scenario` pasan. Lint: los dos
errores que salen (`FiscalKpiRow.tsx`, `irpf2025Adjustments.ts`) son anteriores.

## Estado siguiente

- Decidir si la respuesta se anade a las estadisticas del paso 10 (con el
  permiso que ya existe) para poder decir «la mayoria cree que paga X».
