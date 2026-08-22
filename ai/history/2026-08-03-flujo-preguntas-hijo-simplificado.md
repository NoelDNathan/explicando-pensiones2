# 2026-08-03 — Flujo de preguntas del hijo simplificado

## Objetivo

Acortar y aclarar las preguntas del detalle de cada hijo: omitir ingresos si es menor de 3 o no trabaja, premarcar discapacidad al elegir 25+, aclarar el reparto del mínimo y dar importe por defecto a la pensión de alimentos.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `ai/current.md`
- `ai/history/2026-08-03-flujo-preguntas-hijo-simplificado.md`

## Resumen de cambios

- Menor de 3: se ocultan trabajo, umbral de 8.000 € y declaración; se fuerza el perfil que sí computa.
- A partir de 3 años: puerta «¿Trabaja o tiene ingresos propios?»; solo si Sí aparecen las dos preguntas siguientes.
- «25 o más con discapacidad» premaca 33 % y solo ofrece 33 % / 65 %.
- Reparto reformulado: «¿solo a ti o a medias con el otro progenitor?» con chips «Solo a mí (100 %)» / «A medias (50 %)».
- Alimentos: al decir Sí, importe por defecto 3.600 EUR/año.

## Verificacion

- `pnpm run build` correcto.

## Estado siguiente

Commit/push solo si el usuario lo pide.
