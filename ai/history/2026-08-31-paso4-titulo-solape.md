# 2026-08-31 — Titulo del paso 4 sin solape

## Objetivo

Corregir el titulo «Base liquidable» del paso 4, que se solapaba al partirse en dos lineas y con el subtitulo.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`

## Resumen de cambios

- Interlineado del `h2` de la cabecera didactica de 1.03 a 1.18 y tamanio un poco menor.
- Hueco en `.wfsc-copy` y selector mas especifico para el subtitulo, porque `.wfsc-copy p` anulaba su margen superior.

## Estado siguiente

Seguir con el resto del flujo del paso 4 si hay mas ajustes visuales.
