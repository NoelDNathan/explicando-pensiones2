# 2026-07-10 — Pie de nómina simplificada en pasos fiscales

## Objetivo

Eliminar el texto «Copia anonimizada - datos personales ocultos» del panel de nómina y sustituirlo por una leyenda didáctica que explique que es una simplificación con la parte del paso actual resaltada.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- Nuevo `figcaption`: «Nómina simplificada: lo resaltado es la parte que se trata en este paso.»
- Actualizado `aria-label` del `figure` para alinearlo con el nuevo mensaje.
- Ajustado CSS del `figcaption`: ancho alineado con la hoja de nómina, centrado y mejor interlineado.

## Verificación

- `pnpm run build`: falla por errores TS preexistentes en otros módulos (`FiscalWorkerDashboard`, `WorkerPersonalReductionsCard`, `WorkerSocialContributionsCard`). Sin errores nuevos en WFSC.

## Estado siguiente

- Revisar visualmente el pie de la nómina en escritorio y móvil en `/calculadora-fiscal`.
