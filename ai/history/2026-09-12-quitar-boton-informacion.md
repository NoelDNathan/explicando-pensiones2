# 2026-09-12 — Quitar boton Informacion

Fecha: 2026-09-12

## Objetivo

Eliminar el boton de Informacion de la cabecera de la calculadora fiscal.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`

## Resumen

El boton no hacia nada (solo `aria-label`). Se retira junto con el icono `Info` de lucide y la regla `button:last-child` que le daba un ancho de icono.

## Estado siguiente

Sin cambio de alcance.
