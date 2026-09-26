# 2026-09-26 · v2: estructura del diseño D y paso 3 completo

**Objetivo:** que la v2 tenga el estilo de la maqueta D y no solo sus colores (queja de la persona usuaria).

**Archivos modificados:**
- `src/components/fiscal-worker-dashboard/fiscalVariant.ts` (nuevo), `FiscalWorkerDashboard.tsx`: contexto de versión.
- `src/components/worker-salary-dashboard/escenario/` (nuevo): `EscenarioParts.tsx`, `Escenario.css`, `EscenarioStep.css`, `EscenarioSocial.css`.
- `WorkerFiscalStepsCard.tsx`: rama v2 (barra de progreso, título, textos, cinta, nómina, navegación); el párrafo en vivo del paso 3 sale a `buildContributionsLiveParagraph` sin cambiar su texto.
- `WorkerSocialContributionsCard.tsx`: rama v2 del paso 3 con los mismos datos y textos.
- `FiscalSoftTheme.css`: rellenos y avisos del escenario; título hasta 150 px.
- `FiscalEscenario.css`: marco común de la v2 (márgenes, sin cajas).
- `scripts/verify-styles.mjs`: también revisa `FiscalEscenario.css` y la carpeta `escenario/`.

**Textos:** ninguno cambiado. Añadidos visibles, a confirmar: «Cada casilla, 1 %.» y las etiquetas «1 %» / «7 %» de la aguja (vienen de la maqueta D). El título «Cotizaciones sociales» de la tarjeta queda solo para lectores de pantalla porque ya está en el título del paso.

**Comprobado:** 390 y 1280 px, los 12 pasos sin scroll horizontal, títulos sin salirse, contraste por script, filas desplegables, v1 intacta. `tsc`, `verify:styles`, `verify:scenario` en verde.

**Siguiente:** protagonistas de D en los demás pasos; piezas en `/componentes`.
