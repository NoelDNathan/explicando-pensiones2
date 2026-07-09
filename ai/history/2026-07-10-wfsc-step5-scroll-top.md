# 2026-07-10 — Paso 5 empieza arriba, no en el centro

## Objetivo

Evitar que al entrar en el paso 5 (IRPF por tramos) la vista arranque desde el centro de la página.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- `.wfsc-hero` pasa de `align-items: center` a `align-items: start` para que texto y nómina empiecen arriba.
- Al cambiar de paso, `scrollIntoView({ block: 'start' })` sobre la sección WFSC (sin ejecutarse en el montaje inicial).
- `scroll-margin-top` en `.wfsc` para un margen al hacer scroll.

## Verificación

- `pnpm run build`: falla por errores TS preexistentes en otros módulos. Sin errores nuevos en WFSC.

## Estado siguiente

- Probar navegación 4 → 5 y acceso directo al paso 5 en escritorio y móvil.
