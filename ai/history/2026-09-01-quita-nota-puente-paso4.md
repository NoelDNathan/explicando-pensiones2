# 2026-09-01 — Quitar nota puente paso 4

## Objetivo

Eliminar el párrafo `.wprc-chain-note` entre gastos deducibles y «Ventajas del trabajo» en el paso 4.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- Eliminado el `<p className="wprc-chain-note">` con el texto «Con el rendimiento neto ya calculado, ahora vienen las reducciones y el mínimo personal y familiar».
- Eliminados los estilos `.wprc-chain-note` en el CSS del componente y en el tema suave fiscal.

## Estado siguiente

Sin cambios pendientes por esta interacción.
