# 2026-09-01 — Barra de base liquidable siempre visible en el paso 4

## Objetivo

Que al llegar al punto 4 («Cómo tu situación familiar afecta a tu IRPF») se vea el mínimo
personal y familiar aunque no haya ninguna reducción, y que la barra diga explícitamente que
sin reducciones el rendimiento neto del trabajo es la base liquidable.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- La barra fija `wprc-explained--sticky` deja de depender de `showChainSteps`: se renderiza
  siempre en el paso 4, así que el mínimo personal y familiar acompaña a todas las preguntas.
- Nuevo eslabón `is-empty` («Reducciones de base · 0,00 € · no tienes ninguna») cuando no hay
  ninguna reducción aplicada, y nota en la base liquidable: «sin reducciones: es tu rendimiento
  neto del trabajo».
- Estilos apagados para ese eslabón en el tema oscuro y en `fwd--soft`; en móvil la nota de la
  base liquidable envuelve en vez de desbordar.

## Estado siguiente

- Nada pendiente; al marcar cualquier reducción la cadena vuelve a su forma normal.
