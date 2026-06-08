# 2026-06-08 - Detalle ampliado de explicaciones fiscales

## Fecha

2026-06-08

## Objetivo

Mejorar y detallar un poco mas las explicaciones del worker salary dashboard sin hacer la pantalla pesada.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `ai/current.md`
- `ai/history/2026-06-08-worker-dashboard-explicaciones-detalle.md`

## Resumen de cambios

- Anadida una lista de tres detalles practicos por cada paso del dashboard fiscal.
- Detallados base real, base minima, base maxima, base usada, cotizaciones, reducciones, deducciones, tramos de IRPF, salario neto, IVA e impuestos especiales.
- Anadido estilo compacto para que los detalles se lean dentro del panel de ayuda sin convertirse en un bloque largo.
- No se tocaron formulas ni se incorporaron datos nuevos.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox porque el intento normal fallo con `node.exe: Acceso denegado`; se mantienen avisos conocidos de chunk grande y tiempos de plugins.
- Revision visual/DOM en `http://127.0.0.1:5188/calculadora-fiscal`: escritorio 1280x720 y movil 390x844 con detalles visibles; pasos 6 y 7 cambian correctamente y muestran sus detalles.
- Se detecto overflow horizontal residual en `sb-menu`, ajeno a esta tarjeta y no corregido en esta interaccion para no mezclar cambios.

## Estado siguiente

Pendiente decidir si conviene corregir el overflow movil de `sb-menu` en una interaccion separada.
