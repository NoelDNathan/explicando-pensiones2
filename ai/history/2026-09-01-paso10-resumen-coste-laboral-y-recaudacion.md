# 2026-09-01 · Paso 10: resumen del coste laboral y contexto de recaudacion

## Objetivo

Sustituir el paso 10 (tarjeta resumen reutilizada mas una fila de KPIs) por un resumen propio que responda a tres peticiones: un grafico de queso con el reparto del coste laboral entre impuestos, la presencia explicita de la vivienda y el coche, y un bloque sobre la situacion del Estado con la recaudacion de cada figura, su destino y su efecto sobre el contribuyente.

## Archivos modificados

Datos:

- `data/raw/igae/impuestos-cotizaciones-aapp/2026-09-01_igae_aapp-impuestos-y-cotizaciones-sec2010_1995-2024.xlsx` (nuevo bruto)
- `data/processed/fiscal/2026-09-01_igae-recaudacion-por-figura-aapp-2024.json` (nuevo)
- `data/methodology/recaudacion-por-figura-tributaria-2024.md` (nuevo)
- `data/sources.md`, `data/metadata.md`, `data/inventory.md`, `data/checksums.sha256`

Interfaz:

- `src/components/worker-salary-dashboard/WorkerFinalSummaryCard.tsx` (nuevo)
- `src/components/worker-salary-dashboard/WorkerFinalSummaryCard.css` (nuevo)
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `src/App.tsx`

## Resumen de cambios

- Nuevo componente `WorkerFinalSummaryCard` con tres bloques: grafico de queso del coste laboral, ficha «Tu casa y tu coche» y bloque «La otra cara: que recauda el Estado».
- El total del grafico es el coste laboral (bruto + cotizaciones de empresa), no el bruto, para que las cotizaciones de empresa quepan dentro del 100 %. Porciones: neto que queda, cotizaciones de empresa, cotizaciones del trabajador, IRPF, IVA, impuestos especiales e IBI/IVTM; las de importe cero no se dibujan.
- El grafico usa recharts como el paso 8, pero con `isAnimationActive={false}`: el reparto se recalcula al mover el deslizador de salario y la animacion de barrido reiniciaba en cada cambio.
- La ficha de vivienda y coche toma el IBI y el IVTM del paso 9, muestra su peso sobre el coste laboral y separa los impuestos de compra como pago unico. Sin propiedades declaradas, estado vacio con boton de vuelta al paso 9.
- El bloque del Estado muestra, por figura, recaudacion en millones, porcentaje de los ingresos publicos y porcentaje del PIB, mas dos lineas: «En que se gasta» y «Que efecto tiene». Los porcentajes se calculan en el componente desde los importes y los denominadores del dataset.
- Datos de una unica fuente IGAE (contabilidad nacional SEC 2010, total AAPP, 2024 provisional) para poder mezclar impuestos estatales, tributos locales y cotizaciones en el mismo marco. Denominadores de PIB e ingresos no financieros de la serie BDMACRO ya procesada; los porcentajes del PIB coinciden con la hoja `Tabla1b` de la fuente. El texto editorial de destino y efectos vive en el componente, no en el dataset.
- Se retira el bloque `.fwd-net-step`, su CSS y la fila de KPIs que ocupaban el paso 10, y se reescribe el copy del paso 10 en la navegacion.
- Alta en el laboratorio `/componentes` con IBI, IVTM e impuestos especiales rellenos para ver el estado completo.

## Verificacion

- `tsc -b`, `eslint` sobre los archivos tocados y `pnpm run verify:irpf2025` (26 comprobaciones) correctos.
- `/calculadora-fiscal` paso 10: siete porciones posibles, separadores de miles correctos (`2.268 €`, `5.900 €`), estado vacio de vivienda y coche cuando el paso 9 esta sin responder.
- `/componentes` Componente 24: las siete porciones con sus colores, ficha de casa y coche con impuestos de compra.
- Sin desborde horizontal a 1440 px ni a 375 px; a ancho estrecho la rejilla, las fichas del Estado y sus tres cifras pasan a una columna.

## Estado siguiente

- Queda pendiente decidir si el bloque del Estado enlaza a una pagina propia con la serie completa 1995-2024 de la misma fuente IGAE.
- Cuando la IGAE publique 2025 (ahora el ultimo ano es 2024 provisional), actualizar el bruto, el JSON y los checksums.
