# 2026-09-25 — Diagnostico del CSS de la calculadora fiscal

Fecha: 2026-09-25

## Objetivo

Entender por que los componentes nuevos de la calculadora salen con otra paleta.

## Archivos modificados

- `ai/current.md` (pendiente de frontend)
- esta nota

Sin cambios de codigo.

## Resumen

- La calculadora solo se renderiza con `fwd fwd--soft`, pero los CSS base de las 18 tarjetas
  de `worker-salary-dashboard/` y los 6 de `fiscal-worker-dashboard/` estan escritos para un
  tema oscuro (fondos tipo `#020713`, `rgba(3, 15, 31, ...)`, acentos neon) con literales y
  0 usos de `var(--fiscal-*)`, salvo `WorkerKnowledgeCheckCard` y `WorkerPrivacyNotice`.
- `FiscalSoftTheme.css` (2.914 lineas, 601 selectores `.fwd--soft`) repinta cada clase en
  claro. Ademas tiene ~214 literales fuera del bloque de tokens (`#b8ded7` x20, `#efd2a9` x11...).
- Hay dos juegos de alias (`--fwd-*` y `--fiscal-*`) y el `@theme` de Tailwind en
  `src/index.css` solo ofrece colores oscuros (`surface-deep`, `text-inverted`).
- `verify:styles` no detecta el problema: excluye `FiscalSoftTheme.css` y solo vigila que la
  cuenta de literales no suba.
- Escaneo en el navegador de los pasos 1-12: sin fondos oscuros grandes, pero con textos y
  puntos fuera de paleta, p. ej. `.wscc-summary__after-contributions` en `rgb(98, 215, 107)`
  sobre `#f8fafc` (contraste ~1,9:1), `.wirc-rank-dot` con 7 colores propios, `.wctc-index`,
  `.witc-tramo__amount`.

## Estado siguiente

Decidir con el usuario si se migra por tarjetas: tokens semanticos -> CSS base con `var()` ->
borrar parches de `FiscalSoftTheme.css`, empezando por la tarjeta del paso 3.
