# 2026-09-25 — Migración del CSS de la calculadora a tokens

Fecha: 2026-09-25

## Objetivo

Que los componentes de la calculadora no salgan con otra paleta: quitar la base oscura
repintada por `FiscalSoftTheme.css` y dejar un único sistema de tokens `--fiscal-*`.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css` (de 2.914 a ~170 líneas: tokens)
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`, `WorkIncomeReductionExplainer.css`
- Los 18 CSS de `src/components/worker-salary-dashboard/`
- `src/components/worker-salary-dashboard/WorkerIrpfRegionComparison.tsx` (colores del gráfico)
- `src/App.tsx`, `src/App.css` (vistas previas de `/componentes`)
- `src/index.css` (comentario del `@theme`)
- `scripts/verify-styles.mjs`, `scripts/styles-baseline.json`, `AGENTS.md`

## Resumen

1. Fusión (commit aparte): cada regla `.fwd--soft X` pasó al CSS dueño de X sin el prefijo.
   Los conflictos de especificidad se resolvieron en la regla que ganaba. Verificado
   comparando los estilos calculados de los 12 pasos a 1280 y 390 px contra una foto previa:
   solo cambió el fondo de algunos inputs sin borde.
2. Tokens: nuevos `-line`, `-ink`, `--fiscal-on-accent`, `--fiscal-shade`, `--fiscal-paper-*`
   (la nómina dibujada, en blanco y negro a propósito) y de significado: `worker`, `company`,
   `state`, `region`, `positive`, `negative`. Paso 3 (trabajador/empresa) y paso 6
   (estatal/autonómico) ya los usan.
3. Los ~1.400 colores a mano de la calculadora pasaron a tokens. Coincidencias exactas sin
   cambio visual; los restos del tema oscuro que sí se veían (verdes y azules neón, brillos
   de texto) toman ahora la paleta. Revisado con capturas de todos los pasos.
4. Quitados los alias `--fwd-*` y 339 reglas de clases que ya no usa ningún componente.
5. `/componentes` muestra las piezas de la calculadora dentro de `fwd--soft fwd-worker-card`,
   como en la página real (antes las mostraba sin tokens y con marco oscuro).
6. `verify:styles` es estricto para la calculadora, sin línea base; `AGENTS.md` lo explica.

## Estado siguiente

Los dos errores de lint en `WorkerIrpfRegionComparison.tsx` (setState en efecto) ya existían.
Pendiente menor en `current.md`: solape del selector Anual/Mensual en el laboratorio y
componentes sin uso (`Donut.tsx`, `FiscalLineChart.tsx`).
