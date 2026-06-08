# 2026-06-07 - Componente IVA y otros impuestos editable

## Objetivo

Crear un componente de `IVA y otros impuestos` con categorias editables, sincronizacion entre porcentaje e importe en euros y modulo de vivienda en propiedad.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.css`
- `src/components/worker-salary-dashboard/index.ts`
- `src/App.tsx`
- `src/App.css`
- `ai/current.md`
- `ai/history/2026-06-07-worker-consumption-taxes-card.md`

## Resumen de cambios

- Anadido `WorkerConsumptionTaxesCard` como componente 20 del laboratorio `/componentes`.
- Incluidas las categorias indicadas: ahorro/inversion, suministros, alimentacion, supermercado no esencial, restaurantes, ocio, compras, transporte, gasolina, electricidad, salud/farmacia, educacion/seguros/banca, tabaco y alcohol.
- Cada fila permite editar gasto anual, porcentaje e impuesto anual en euros; porcentaje y euros se actualizan mutuamente.
- Anadido modulo opcional de vivienda en propiedad con IBI simplificado como `valor catastral x 0,6%`.
- Repuesto `WorkerIrpfTranchesCard.css`, que faltaba en disco y bloqueaba el build de Vite aunque el componente lo importaba.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit`: correcto.
- `node node_modules\vite\bin\vite.js build`: correcto tras ejecutarlo fuera del sandbox porque el intento normal fallo con `node.exe: Acceso denegado`. Mantiene avisos conocidos de chunk grande y tiempos de plugins.
- `Invoke-WebRequest http://127.0.0.1:5178/componentes`: HTTP 200.
- Revision visual en escritorio/movil pendiente: no hay Browser tool callable en este turno.

## Estado siguiente

- Revisar visualmente el componente en escritorio y movil cuando haya navegador integrado disponible.
- Antes de uso editorial publico, documentar fuente normativa/metodologica de cada tipo y etiqueta especial; por ahora es un modulo editable/prototipo.
- No se hizo commit/push porque el arbol de trabajo ya contiene cambios previos no atribuibles a esta interaccion y hay archivos compartidos modificados, por lo que un `git add .` mezclaria trabajos distintos.
