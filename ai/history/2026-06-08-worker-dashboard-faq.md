# 2026-06-08 - FAQ del worker salary dashboard

## Fecha

2026-06-08

## Objetivo

Anadir una seccion 8 con preguntas frecuentes al worker salary dashboard.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.css`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `ai/current.md`
- `ai/history/2026-06-08-worker-dashboard-faq.md`

## Resumen de cambios

- Anadido el paso 8 `Preguntas frecuentes` en la navegacion superior del dashboard.
- Creado un panel FAQ con seis preguntas y respuestas sobre bases, bruto/neto, coste de empresa, IRPF, IVA y alcance de la calculadora.
- Ajustada la tira de pasos para 8 tarjetas.
- Actualizado `WorkerConsumptionTaxesCard` para mostrar `Paso 7 de 8`.
- Anadidos estilos responsive para que el FAQ pase de dos columnas a una en movil.
- No se tocaron formulas ni se incorporaron datos nuevos.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox porque el intento normal fallo con `node.exe: Acceso denegado`; se mantiene el aviso conocido de chunk grande.
- Revision visual/DOM en `http://127.0.0.1:5189/calculadora-fiscal`: escritorio 1280x720 con 8 pasos y FAQ de 6 items sin overflow horizontal; movil 390x844 con FAQ en una columna y sin overflow horizontal de pagina.

## Estado siguiente

Pendiente revisar si la FAQ debe ampliarse con preguntas especificas por comunidad autonoma cuando haya mas metadata normativa documentada.
