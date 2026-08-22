# 2026-08-03 — Color alerta base máxima (paso 3)

## Objetivo

Corregir el color del aviso `.wscc-alert--maximum` en `WorkerSocialContributionsCard` dentro del tema suave de `/calculadora-fiscal`, donde el texto crema del tema oscuro quedaba ilegible.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`
- `ai/history/2026-08-03-color-alerta-wscc-maximo.md`

## Resumen de cambios

- Anadidos overrides soft para `.wscc-alert--maximum` (fondo naranja suave, texto marrón/naranja) y `.wscc-alert--minimum` (fondo violeta suave, texto violeta).
- El radio del alert pasa a usar `--fiscal-radius-control` junto al resto de notas del paso 3.

## Verificacion

- `pnpm run build` correcto.
- Revision visual en paso 3: alerta máxima con fondo `#fff1df`, strong `#8b5418`, span/em `#b96b18`.

## Estado siguiente

Sin pendientes de este ajuste. Commit/push solo si el usuario lo pide.
