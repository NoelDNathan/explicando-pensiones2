# 2026-06-08 - Explicaciones del worker salary dashboard

## Fecha

2026-06-08

## Objetivo

Mejorar las explicaciones del worker salary dashboard para que sean claras, sencillas y expliquen bases, grupos, categorias, reducciones, tramos, salario neto e impuestos indirectos.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerContributionLimitsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerSocialContributionsCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`
- `ai/history/2026-06-08-worker-dashboard-explicaciones.md`

## Resumen de cambios

- Reescritos los textos de los 7 pasos con definiciones mas directas y ejemplos de lectura fiscal.
- Aclarado que la base real no es automaticamente la base de cotizacion ni la base del IRPF.
- Explicados grupo de cotizacion, base minima, base maxima y base usada.
- Explicada la diferencia entre cotizacion del trabajador, aportacion de empresa y coste laboral.
- Aclarada la diferencia entre reducciones y deducciones.
- Reforzada la diferencia entre tipo marginal y tipo efectivo en IRPF.
- Separados salario neto e impuestos indirectos para evitar confundir nomina con consumo.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox porque el intento normal fallo con `node.exe: Acceso denegado`; se mantienen avisos conocidos de chunk grande y tiempos de plugins.
- Revision visual/DOM en `http://127.0.0.1:5187/calculadora-fiscal`: escritorio 1280x720 y movil 390x844 con textos visibles y sin overflow horizontal.

## Estado siguiente

Pendiente revisar si se quiere una segunda capa de microayudas dentro de cada campo individual, especialmente en IRPF y consumo, sin alargar demasiado la pantalla.
