# 2026-06-07 - Ajuste visual IVA y otros impuestos

## Objetivo

Ajustar el componente `IVA y otros impuestos` para parecerse mas a la referencia aportada: pantalla de paso completo con tabla de reparto, importes sincronizados y resumen lateral.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `ai/current.md`
- `ai/history/2026-06-07-ajuste-worker-consumption-taxes-design.md`

## Resumen de cambios

- Redisenado `WorkerConsumptionTaxesCard` como `Paso 7 de 7`, con cabecera, texto de ayuda y botones visuales de navegacion.
- Cambiado el modelo editable para repartir un gasto anual total entre categorias: editar `% del gasto` recalcula euros y editar euros recalcula el porcentaje.
- Anadida tabla densa con indices, tono por categoria, tipo impositivo/regla, microbarra e importe anual.
- Anadido total inferior con suma de porcentaje e importe asignado.
- Reorganizado el IBI como bloque opcional inferior con toggle, valor catastral e importe estimado.
- Anadido resumen lateral con gasto asignado, IVA estimado, impuestos especiales, IBI e impacto total aproximado.
- Anadidas notas inferiores para ocio/suscripciones, salud/farmacia e IBI.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox porque el intento normal fallo con `node.exe: Acceso denegado`. Mantiene aviso conocido de chunk grande.
- `Invoke-WebRequest http://127.0.0.1:5179/componentes`: HTTP 200.
- Revision visual real en escritorio/movil pendiente porque no hay Browser tool callable en este turno.

## Estado siguiente

- Revisar visualmente `/componentes` en escritorio y movil cuando haya navegador integrado disponible.
- Antes de uso editorial publico, documentar fuente normativa/metodologica de cada tipo y de la separacion entre IVA e impuestos especiales.
- No se hizo commit/push porque el arbol de trabajo ya contiene cambios previos no atribuibles a esta interaccion y un `git add .` mezclaria trabajos distintos.
