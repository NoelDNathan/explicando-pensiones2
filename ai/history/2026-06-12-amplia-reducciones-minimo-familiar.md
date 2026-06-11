# 2026-06-12 - Ampliacion de reducciones y minimo familiar

## Objetivo

Completar el apartado de reducciones de la calculadora fiscal con el detalle solicitado para situacion personal, dependientes, beneficios de empresa, reducciones, deducciones y resultado explicado.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `ai/current.md`
- `ai/history/2026-06-12-amplia-reducciones-minimo-familiar.md`

## Resumen de cambios

- Anadido detalle por descendiente y ascendiente: convivencia, rentas propias, declaracion, edad, discapacidad, grado y ayuda/movilidad reducida.
- Anadida familia numerosa general/especial, minimo progresivo por descendientes y mayores de 75.
- Anadido bloque de beneficios de empresa con estados exento, parcial, tributa y revisar requisitos.
- Ampliadas reducciones y deducciones manuales/verificadas.
- Anadido resultado explicado que separa reducciones de base y deducciones de cuota.
- Conectado el calculo central a menores de 3, ascendientes mayores de 75 y minimo por discapacidad de dependientes.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Revision visual/DOM en `http://127.0.0.1:5201/calculadora-fiscal`: escritorio y movil 390x844 sin overflow horizontal.

## Estado siguiente

Queda pendiente convertir cada deduccion autonomica concreta en regla calculable cuando se documenten sus requisitos completos por comunidad.
