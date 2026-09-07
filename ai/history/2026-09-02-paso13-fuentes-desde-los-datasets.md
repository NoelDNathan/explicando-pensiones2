# 2026-09-02 — El paso 13 lee las fuentes de los datasets, no del código

## Objetivo

Quitar del código los enlaces y las etiquetas de fuente del paso 13. Estaban escritos a mano con los datos de 2025 para cualquier año que no fuera 2005, y cada paquete anual de `data/processed/fiscal` ya declara su propia norma y su URL.

## Archivos añadidos

- `src/components/fiscal-worker-dashboard/fiscalSourceRefs.ts`

## Archivos modificados

- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/vatEpFProxy.ts`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `src/components/worker-salary-dashboard/WorkerCalculationSourcesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerCalculationSourcesCard.css`

## Resumen de cambios

- **`fiscalSourceRefs.ts`**: traduce las fuentes declaradas por los datasets a los descriptores que pinta la tarjeta. Entiende las dos formas en que los JSON las declaran (`{label, url}` en los paquetes normativos y `{institution, table, url}` en los estadísticos), normaliza el nombre de la institución (BOE, AEAT, INE), parte la etiqueta en institución + norma y deriva el texto del enlace del dominio más el primer tramo de la norma.
- **Selección por palabra clave con posición de respaldo**: los paquetes recientes etiquetan cada enlace («gravamen estatal», «gravamen autonomico») pero los antiguos citan la norma directamente, así que 2005 cae al respaldo por posición y resuelve igual de bien.
- **`calculationSources`** pasa de dos bloques duplicados de 153 líneas a uno de 114: las dos ramas siguen decidiendo *qué valores* se muestran (2005 no tiene AT/EP ni tipos desglosados), pero ninguna decide ya *qué fuente* se cita.
- **Norma complementaria**: el descriptor arrastra `supporting_source_url` y la tarjeta pinta un segundo enlace cuando existe. Hoy no lo usa ningún año activo; el paquete de 2019 sí lo trae (la corrección de erratas de la Orden TMS/83/2019), que era un dato que no había forma de ver.
- **Fuente sin enlace**: si un paquete no declarara la norma, la tarjeta ya no pinta un `<a href="">` roto, sino un aviso en ámbar.

## Dos cosas que salieron al probarlo

- **La tarifa AT/EP citaba la norma equivocada.** Buscar `42/2006` en cualquier parte del texto encontraba primero la Orden PJC/178/2025, que la menciona de pasada. Los porcentajes de IT e IMS que se muestran salen de la Ley 42/2006, así que la selección ahora exige que la etiqueta *empiece* por esa norma. El resultado coincide con lo que enlazaba antes del refactor.
- **La cobertura por CCAA es un dataset de 2025 y le prestaba su URL a cualquier año.** Al probar con el paquete de 2019 la escala autonómica enlazaba al manual de Renta 2025. Ahora solo aporta la URL si `scope.year` coincide con el año calculado; si no, se usa el manual del propio paquete anual. No era un bug vivo, porque hoy `TaxYear` solo admite `'2025' | '2005'`, pero lo habría sido al conectar el selector de años.

## Verificación

`tsc -b`, `vite build`, `eslint` sobre los ficheros tocados (limpios; el repo arrastra 24 errores previos en otros ficheros), `pnpm run verify:irpf2025` (26 comprobaciones) y `pnpm run verify:data` (469 comprobaciones) correctos.

En `/calculadora-fiscal` paso 13 se pintan las 5 fuentes con sus etiquetas y enlaces correctos; al cambiar la comunidad a Andalucía en el paso 6, el bloque autonómico pasa a «Manual practico Renta 2025 · Andalucia» y su enlace a la página de Andalucía. Comprobado también con los paquetes de 2005 y 2019 fuera de la interfaz: cada uno resuelve sus propias normas. Sin desbordes ni errores de consola a 1280 px ni a 375 px.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió). Del paso 13 siguen pendientes las mejoras 2 a 8 de la lista: cubrir los pasos 4, 8, 9 y 10, que no tienen ninguna fuente; desglosar MEI, cotización de solidaridad, gastos del art. 19.2.f y deducción por rentas del trabajo bajas; cambiar el badge binario Oficial/Estimación por los estados del proyecto; citar el archivo de `data/` y su fecha de descarga; anclar cada bloque a su paso; quitar `DEMO_ITEMS` del valor por defecto; hacerlo copiable; y mostrar `scope.excluded` y `data_gaps_before_ui_use`, que están desactualizados y hay que corregir antes de enseñarlos.
