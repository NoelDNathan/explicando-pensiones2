# 2026-09-12 — Vercel Web Analytics

Fecha: 2026-09-12

## Objetivo

Montar Vercel Web Analytics en el arranque de la aplicacion.

## Archivos modificados

- `src/main.tsx`
- `src/pages/PrivacyTermsPage.tsx`
- `ai/current.md`

## Resumen

- El paquete `@vercel/analytics` ya estaba en dependencias y no se usaba.
- La app es Vite + React, no Next.js: el componente se importa de `@vercel/analytics/react` y se renderiza junto a `App`.
- En `/privacidad` se menciona el recuento agregado de visitas (sin cookies de publicidad) y se actualiza la fecha de la pagina.

## Estado siguiente

Activar Web Analytics en el panel de Vercel si aun no lo esta. Commit pendiente si se pide.
