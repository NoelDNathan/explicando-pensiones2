# 2026-07-18 — Arregla 404 de subpaginas en Vercel

Fecha: 2026-07-18

## Objetivo

Corregir el error `404: NOT_FOUND` al abrir rutas como `/calculadora-fiscal` o `/poblacion` en el despliegue de Vercel.

## Archivos modificados

- `vercel.json` (nuevo)
- `ai/current.md`
- `ai/history/2026-07-18-vercel-spa-rewrites.md`

## Resumen de cambios

La app enruta con `window.location.pathname` sobre un unico `index.html` de Vite. En local el servidor de desarrollo resuelve esas rutas; en Vercel, al pedir una subruta, buscaba un archivo real y respondia 404.

Se anade `vercel.json` con rewrite `/(.*) -> /index.html` para que cualquier ruta sin archivo estatico caiga en la SPA.

## Verificacion

No aplica `pnpm run build`: solo configuracion de despliegue. Hay que redesplegar en Vercel (push o redeploy) para que surta efecto.

## Estado siguiente

Tras el redeploy, comprobar en produccion `/`, `/resumen`, `/poblacion`, `/calculadora-fiscal` y el resto de enlaces de la home.
