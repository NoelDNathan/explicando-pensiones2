# 2026-08-15 — Explicación AT/EP para público general

## Objetivo

Reescribir la nota explicativa de AT/EP en el panel de cotizaciones de empresa para que sea más comprensible para un público no especializado.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `ai/current.md`

## Resumen de cambios

- Sustituido el texto técnico de `.wscc-atep-note` por una explicación en lenguaje cotidiano: analogía de seguro, variación del porcentaje según actividad y riesgo, desglose IT/IMS y aclaración de que lo paga la empresa.
- Los porcentajes (total, IT e IMS) siguen calculándose dinámicamente según la categoría AT/EP seleccionada.

## Verificación

- `pnpm run build` — correcto.

## Estado siguiente

- Revisar en `/calculadora-fiscal` paso 3 que el bloque AT/EP se lea bien en escritorio y móvil con distintas categorías de actividad.
