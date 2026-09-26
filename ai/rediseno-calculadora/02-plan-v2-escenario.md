# Rediseño de la calculadora · Fase 2: plan para implementar la v2 «Escenario»

Plan para dejar `/calculadora-fiscal/v2` **exactamente** como las maquetas aprobadas (diseño D).
Está pensado para que lo ejecute otro agente sin contexto previo. Léelo entero antes de tocar código.

## 1. Cómo consultar el diseño

Las maquetas están en el repo, en `ai/rediseno-calculadora/maquetas-d/`:

| Archivo | Pantalla |
|---|---|
| `Paso00Pregunta.dc.html` | Paso 0, preguntas 1 y 2 (tweak `stage`: `guess` / `salary`) |
| `Paso00Resultado.dc.html` | Paso 0, resultado («Tu respuesta, frente al cálculo») |
| `Paso01.dc.html` … `Paso12.dc.html` | Pasos 1, 2 y 4-12 (escritorio, 1280 px) |
| `Escenario.dc.html`, `EscenarioMovil.dc.html` | Paso 3 (escritorio y móvil). Es la referencia de cómo se adapta todo a móvil |

Son HTML con plantillas (`{{hueco}}`, `<sc-for>`, `<sc-if>`) y una clase `Component` con `renderVals()`.
No se abren directamente en el navegador: usa el visor incluido.

```bash
python -m http.server 8765 --directory ai/rediseno-calculadora/maquetas-d
```

Abre `http://localhost:8765/preview.html?f=Paso05.dc.html` (cambia el nombre del archivo). El visor
ejecuta la lógica de la maqueta, así que los deslizadores, Sí/No y desplegables funcionan. Si el
panel del navegador es estrecho, reduce el zoom para ver los 1280 px.

Para leer el diseño exacto (tamaños, espacios, colores), abre el `.dc.html` en el editor: los estilos
son inline y hay una hoja común en el `<helmet>` (clases `.h1`, `.h2`, `.h3`, `.sub`, `.lead`, `.txt`,
`.panel`, `.q`, `.yn`, `.segs`, `.cta`, `.ghost`, `.outline`, `.eq`, `.fig`, `.cell`, animaciones
`stretch`, `rise`, `cell`, `growx`, `growy`, `sweep`, `pop`). Los colores de las maquetas son hex
porque el lienzo no tiene tokens; **en la app cada hex se sustituye por su token** (tabla en §4).

El lienzo original (privado, requiere sesión) es https://claude.ai/artifact/WAvcAeqfPNxihpQbAxkMxo;
no hace falta si tienes las copias del repo.

## 2. Reglas que no se negocian

Vienen de `AGENTS.md`, de la skill `.claude/skills/diseno-escenario/SKILL.md` (léela) y de la persona usuaria.

1. **Solo la v2.** La v1 (`/calculadora-fiscal`) debe quedar idéntica. Todo cambio visual va detrás de
   `useFiscalVariant() === 'escenario'` (`src/components/fiscal-worker-dashboard/fiscalVariant.ts`) o
   bajo la clase `.fwd--escenario`. No cambies flujo, pasos, preguntas, cálculos, datos ni fuentes.
2. **Texto literal.** Todo texto educativo sale tal cual de la v1. Se puede partir un texto en
   párrafos o marcar frases con barrido; no reescribir ni resumir. Los textos nuevos de la lista §7
   están pendientes de aprobación: impleméntalos, pero márcalos con un comentario `// texto nuevo D`.
3. **Solo tokens `--fiscal-*`.** Ningún color a mano en CSS ni TSX. Si falta un color, se añade como
   token en el bloque `.fwd--soft { … }` de `FiscalSoftTheme.css`. `pnpm verify:styles` lo comprueba.
4. **Nada depende del hover.** Ayudas y desplegables se abren al tocar (`button` con `aria-expanded`).
5. **Accesibilidad:** HTML semántico, `aria-live` en párrafos con cifras vivas, gráficos con
   `role="img"` + `aria-label` con las cifras (o `aria-hidden` si hay tabla), foco visible, 44 px de
   objetivo táctil, `prefers-reduced-motion` desactiva animaciones.
6. **Componentes reutilizables** (regla 2 y 3 de diseño de `AGENTS.md`): si una pieza sale en dos
   pasos, es un componente con props en `src/components/worker-salary-dashboard/escenario/` y se
   añade a `/componentes` dentro de `component-preview--calculadora fwd--soft fwd--escenario fwd-worker-card`.
7. **Al terminar cada bloque:** nota en `ai/history/`, actualizar `ai/current.md`, commit y push.

## 3. Lo que ya existe (no lo rehagas)

- Ruta `/calculadora-fiscal/v2` (`src/App.tsx`) → `<FiscalWorkerDashboard variant="escenario" />`,
  que añade `fwd--escenario` y el `FiscalVariantContext`.
- Tokens de escenario en `FiscalSoftTheme.css` (`--fiscal-stage*`, fuentes, `--fiscal-text-*`,
  `--fiscal-space-*`, duraciones) y el bloque `.fwd.fwd--escenario` que reasigna la paleta.
- Fuentes Anybody e Instrument Sans (Fontsource) importadas en `FiscalWorkerDashboard.tsx`.
- `src/components/worker-salary-dashboard/escenario/EscenarioParts.tsx`: `useTweenedNumber`,
  `EscFigure`, `EscTitle`, `EscSweepText`, `EscRibbon`, `EscHundredCells`, `EscRaceRow`,
  `EscStairs`, `EscNeedle`, `EscEquation`, `EscSegmented` (+ `Escenario.css`).
- `WorkerFiscalStepsCard.tsx`: rama v2 (barra de 13 segmentos + «03/12», título display, subtítulo,
  primer párrafo, pareja de párrafos, cinta, nómina, conceptos, navegación fija en píldoras). CSS en
  `escenario/EscenarioStep.css`. `ESCENARIO_STEP_EXTRAS` define por paso las frases con barrido y la cinta.
- `WorkerSocialContributionsCard.tsx`: rama v2 completa del paso 3 (`escenario/EscenarioSocial.css`).
- `FiscalEscenario.css`: marco común (márgenes, sin cajas, títulos de tarjeta en display).

Arranque: `pnpm dev` y abre `http://localhost:5173/calculadora-fiscal/v2`. Para saltar la pregunta
inicial: `localStorage.setItem('fwd-tax-guess-v1','35')` y recarga; luego «Ver cómo se calcula, paso a paso».

## 4. Tokens: correspondencia hex de maqueta → token

| Hex en la maqueta | Token |
|---|---|
| `#172033` fondo | `--fiscal-stage` |
| `#23364e` paneles, pistas | `--fiscal-stage-raised` |
| `#4f5f70` separadores, bordes | `--fiscal-stage-line` |
| `#ffffff` texto | `--fiscal-stage-text` |
| `#dbe4ec` párrafos | `--fiscal-stage-copy` |
| `#c4d2df` etiquetas | `--fiscal-stage-muted` |
| `#718096` operadores, decorativo | `--fiscal-stage-faint` |
| `#b6ded3` verde claro (lo que te queda, CTA, foco) | `--fiscal-stage-positive` |
| `#d5c9ee` violeta claro (trabajador) | `--fiscal-stage-worker` |
| `#efd2a9` naranja claro (empresa) | `--fiscal-stage-company` |
| `#bdd4ef` azul claro (IVA, mínimo, Estado) | `--fiscal-stage-blue` |
| `#efd7a0` amarillo claro | `--fiscal-stage-yellow` |
| `#efc5cc` rosa (IRPF) | `--fiscal-stage-red` |
| `#18865b` relleno verde | `--fiscal-stage-positive-fill` |
| `#b96b18` relleno naranja | `--fiscal-stage-company-fill` |
| `#9a7418` / `#c4455b` rellenos aguja | `--fiscal-stage-yellow-fill` / `--fiscal-stage-red-fill` |
| `#5d469c` / `#8b5418` barridos | `--fiscal-stage-worker-mark` / `--fiscal-stage-company-mark` |
| `#14614f` barrido verde | **crear** `--fiscal-stage-positive-mark: #14614f` |
| `#2f6fce` relleno azul (IVA en casillas) | **crear** `--fiscal-stage-blue-fill: #2f6fce` |
| `#e3a857` IVA 10 % | **crear** `--fiscal-stage-vat-10: #e3a857` |
| Escala IVA completa | **crear** `--fiscal-stage-vat-0: var(--fiscal-stage-line)`, `--fiscal-stage-vat-4: var(--fiscal-stage-yellow)`, `--fiscal-stage-vat-10`, `--fiscal-stage-vat-21: var(--fiscal-stage-company-fill)`, `--fiscal-stage-vat-special: var(--fiscal-stage-red-fill)` |
| `#fff7d9`/`#7a5a10`, `#e9f1fd`/`#245a8f` avisos | `--fiscal-stage-yellow-paper`/`-ink`, `--fiscal-stage-blue-paper`/`-ink` |

Las transparencias (`rgba(182,222,211,.18)`, `rgba(255,255,255,.06)`) se hacen con
`color-mix(in srgb, var(--token) 18%, transparent)`.

## 5. Cambios comunes (hazlos primero)

1. **Introducción de cada paso** (`EscenarioStep.css`): el primer párrafo (`.esc-step__lead`) va
   **alineado a la izquierda**, `margin: 0`, `max-width: 860px` (la persona usuaria rechazó el
   párrafo desplazado a la derecha). Orden: barra de progreso → título display (`.h1`, 150 px, última
   palabra en verde) → subtítulo (`.sub`, Anybody 28 px, `--fiscal-stage-muted`) → primer párrafo
   (26 px) → pareja de párrafos en dos columnas (24 px) o párrafo suelto. Revisa en cada maqueta
   cómo se reparten los párrafos del texto del paso y qué frase lleva barrido (`sweepV` violeta,
   `sweepO` naranja, `sweepG` verde); añádelas a `ESCENARIO_STEP_EXTRAS`.
2. **Nómina de ejemplo en el escenario** (nuevo componente `EscNomina`, sustituye en v2 al papel
   blanco de `PayrollExamplePanel`). Mira cualquier `Paso0X` con nómina (1, 2, 4, 5, 6). Panel
   `--fiscal-stage-raised`, radio 32 px, dos columnas (`1fr 300px`):
   - Izquierda: cabecera pequeña en mayúsculas («RECIBO INDIVIDUAL JUSTIFICATIVO DEL PAGO DE
     SALARIOS» y periodo · «[DATOS PERSONALES OCULTOS]»), grupo **DEVENGOS** y grupo **DEDUCCIONES**
     con filas `código | concepto | precio | importe`, y la línea de aportación de empresa.
   - Derecha: bases (REM.TOTALES, BASE IRPF ESPECIE, BASE IRPF, BASE CC.CC., BASE CC.PP., TOTAL
     DEVENGADO, TOT.DEDUCCIONES) y **LÍQUIDO TOTAL** en display 56 px abajo.
   - Filas del paso **encendidas** (fondo blanco 6 %, filete izquierdo de 4 px en su color, importe
     26 px en su color); el resto al 38 % de opacidad. Bases del paso con fondo de color y texto oscuro.
   - Usa los mismos datos en vivo que `PayrollExamplePanel` (`buildPayrollSnapshot`) y la misma
     selección de filas resaltadas por paso que ya tiene; el color: verde = lo que trata el paso,
     violeta = cotización del trabajador, naranja = empresa.
   - Leyenda: «Nómina simplificada: lo resaltado es la parte que se trata en este paso.»
   - En móvil: una columna, bases debajo.
3. **Cifras grandes nunca parten línea** (`white-space: nowrap` en toda cifra display).
4. **Pregunta Sí/No** (nuevo `EscQuestion`): fila con borde superior `--fiscal-stage-line`, pregunta
   22 px semibold, ayuda 16 px debajo, y a la derecha dos píldoras Sí/No de 52 px (`aria-pressed`;
   seleccionada = fondo `--fiscal-stage-positive`, texto `--fiscal-stage`). Úsala en los pasos 5, 7 y
   9 conectándola a los mismos estados y handlers que las preguntas actuales (no cambies qué pasa al
   responder: los campos que se abren tras «Sí» se mantienen, con estilo de escenario). Si la pregunta
   v1 tiene botón «?» con más ayuda, conviértelo en desplegable al tocar.
5. **Capítulo numerado** (nuevo `EscChapter`): número gigante hueco (Anybody 170 px, `wdth` 70, relleno
   `--fiscal-stage-raised`, contorno 2 px `--fiscal-stage-positive`) en columna de 200 px + título
   `.h2` + contenido. Pasos 5 (01-04) y 7 (1-2).
6. **Navegación**: ya existe; debe verse como en las maquetas (atrás con borde y nombre del paso
   anterior, siguiente en píldora verde con el nombre del siguiente).

## 6. Paso a paso

Para cada paso: abre su maqueta en el visor y la v2 en `pnpm dev`, lado a lado. La tarjeta de cada
paso gana una rama `if (variant === 'escenario') return (…)` que reutiliza **sus propios** estados,
cálculos y textos (como ya hace `WorkerSocialContributionsCard`). Si el componente es muy grande,
saca la rama v2 a `escenario/<Paso>Escenario.tsx` y pásale lo que necesita por props.

| Paso | Maqueta | Componente(s) | Qué construir |
|---|---|---|---|
| 0 | `Paso00Pregunta`, `Paso00Resultado` | `WorkerFiscalSummaryCard` | **Pregunta 1:** pregunta en display 84 px (segunda mitad en verde), ayuda, cifra gigante (190 px, violeta; «¿?» gris sin respuesta), rejilla de 100 casillas (20×5) que se encienden hasta tu respuesta, deslizador 0-70 con 0/35/70 €, CTA «Siguiente» y la nota. **Pregunta 2:** «¿Cuál es tu salario?» 150 px, salario 180 px, deslizador log, «Ver mi resultado» y «Cambiar mi respuesta (35 €)». **Resultado:** título 120 px, consola (deslizador + cifra 80 px + Al mes/Al año), duelo de barras «Tú dijiste / El cálculo» con cifras 92 px, «−13 €» 132 px en columna de 400 px separada 72 px del texto, frases con barrido, «Volver a responder», 100 casillas en 4 colores + 4 filas (etiqueta, ayuda, importe 44 px, %), CTA grande «Ver cómo se calcula, paso a paso» y nota. Las cifras (35, 48, 13, 52, importes) salen del cálculo real. |
| 1 | `Paso01` | `WorkerSalaryBaseCard` | Consola (deslizador + cifra 88 px + Anual/Mensual + 12/14 pagas); **÷ 12 pagas**: columnas iguales (una por paga, verde; las 2 extra en violeta con 14 pagas) con el importe mensual en vertical y la capa de complementos (amarillo) encima según el %; chips de complementos (0-25 %); panel «Base real calculada» con cifra 80 px; nómina. |
| 2 | `Paso02` | `WorkerContributionLimitsCard` | Consola (deslizador, grupo en `select` píldora, chips MÍN./MÁX., Mensual/Anual); **pasillo**: pista con zonas rayadas fuera de rango, paredes blancas en mínimo y máximo, marcador verde (píldora 52×110) que se mueve con muelle, exceso punteado si supera el máximo, rótulos «Debajo del mínimo / Dentro del rango / Por encima del máximo», marcas SMI y Salario medio (con sus valores reales de la v1); fila de 3 cifras (mínima, tu base 56 px, máxima); chip de estado + veredicto en display 104 px («Cotizas por tu base real» y los textos reales de la v1 para los otros estados); panel «Margen dentro del rango»; ecuación Tu base real → Base usada para cotizar; nómina. |
| 3 | `Escenario`, `EscenarioMovil` | `WorkerSocialContributionsCard` | Ya hecho. Solo repasar contra la maqueta y aplicar §5.1. |
| 4 | `Paso04` | `WorkerPersonalReductionsCard` (paso 4) | Pregunta única en display 76 px + ayuda + **Sí/No gigantes** (dos botones de 140 px de alto, 72 px de texto). Con «Sí»: texto de reparto, 4 paneles numerados 01-04 (ticket restaurante, transporte, seguro médico, guardería) con los campos reales + Al mes/Al año. **Bifurcación** «Cotiza entero, tributa solo en parte» (título 88 px): tres barras (Salario bruto, Seguridad Social entera, IRPF con la parte exenta rayada). Ecuación Salario bruto anual − Especie exenta = Bruto que tributa en IRPF, nota del paso 5, desplegable «¿Hasta dónde llega la exención?» en 4 paneles + frase final; nómina. |
| 5 | `Paso05` | `WorkerPersonalReductionsCard` (paso 5) + `WorkIncomeReductionExplainer` | **Cascada** de 6 columnas (bruto, −SS, −gastos, RNT, −reducciones, base liquidable) sobre pista de 280 px con la base resaltada, panel del mínimo al lado; «Completa únicamente…»; capítulos **01 Gastos deducibles** (texto, ecuación de 4 términos, desplegable «¿Pueden ser más de 2.000 €?», 4 preguntas), **02 Ventajas del trabajo** (texto + bloque de la reducción: aviso amarillo «En tu caso no aplica…», simulador con 4 resultados, cinta de tramos coloreada, 4 tarjetas de tramo con la tuya en verde, lista, desplegable «De dónde sale el número», gráficos «Cómo se apaga la reducción» y «La joroba del IRPF», 3 paneles de detalles, «Ocultar»), **03 Aportaciones** (4 preguntas), **04 Situación familiar** (estado civil en segmentado + 5 preguntas + desplegable «¿Quién y cuándo puedes declarar conjunta?»); nómina. Los gráficos reutilizan los datos y la lógica actuales del explicador; solo cambia el dibujo. |
| 6 | `Paso06` | `WorkerIrpfTranchesCard`, `WorkerFamilyMinimumExplainer`, `WorkerIrpfRegionComparison` | Definiciones tipo marginal/efectivo en 2 paneles; consola (comunidad, deslizador, cifra); **escalones**: cada tramo es un bloque de ancho ∝ rango (tope visual 70.000 €, `flex-grow`, mínimo 8) y alto ∝ tipo (tipo × 10 px) que se **llena** hasta tu base, con el tipo arriba y el importe dentro; escala estatal (violeta) y autonómica (naranja) con rangos debajo; marginal máximo; dos paneles «Cálculo por tramos»; barra Estado/CCAA + ecuación cuota estatal + cuota CCAA = Total IRPF (64 px) con tipo efectivo; bloque del mínimo (título 60 px, texto, 3 paneles con − e =, «El mínimo te ahorra…»), 3 desplegables; comparador (3 resúmenes, gráfico, ranking con tu comunidad en verde y la comparada resaltada); nómina. |
| 7 | `Paso07` | `WorkerPersonalReductionsCard` (paso 7) | **Monedas**: moneda de 380 px «1 € deducción» (verde) y de 114 px «0,30 € reducción» (amarilla) junto al texto «¿Reducción o deducción?»; bloque reembolsable con ecuación 0 € − 1.200 € = 1.200 €; **escalera de la cuota** (cuota íntegra, − mínimo, cuota antes de deducciones, − ordinarias, − reembolsables, IRPF del año 64 px) junto al texto y el desplegable «¿Puede salir a devolver?»; capítulos 1 y 2 con preguntas; aviso de deducciones autonómicas con borde. |
| 8 | `Paso08` | `WorkerConsumptionTaxesCard` | Cifra de reparto 88 px (amarilla «Falta X %» / verde completo); **cesta**: barra de 140 px agrupada por tipo en el orden 0 %, 4 %, 10 %, 21 %, 21 % + especial, cada tramo con su etiqueta y su % dentro, color de la escala IVA de §4, tramo rayado «Falta» si no suma 100; leyenda como escala con flechas; «Valores medios (España)» y «Restablecer»; consejo; tabla de 13 categorías (número, nombre, pastilla del tipo con el color de la escala, € y % en píldoras, notas); total; resumen como ecuación (gasto → IVA + especiales = impuestos al consumir) y nota del paso 9. |
| 9 | `Paso09` | `WorkerWealthTaxesCard` | **Dos relojes** (SVG: uno con arco discontinuo y aguja girando, otro con un solo arco naranja) a los lados del título «Dos relojes distintos» 76 px con su texto y barridos; dos paneles de pregunta grandes (vivienda, coche) con estado «Sin responder/Sí/No», pregunta 40 px, ayuda y Sí/No de 64 px; con «Sí», los campos reales; «Lo que suma a tu mes» (IBI, IVTM, total recurrente 64 px) y panel punteado «FUERA DE TU MES»; frase de aviso. Sin nómina. El párrafo de introducción repetido de la tarjeta se omite (pendiente de aprobación, §7). |
| 10 | `Paso10` | `WorkerFinalSummaryCard`, `WorkerStatsConsent` | Título 112 px, consola, **100 casillas** en 5 colores + «52 €» 200 px + «de cada 100 € son para ti» + 5 filas; «se van en impuestos y cotizaciones» con 21.976 € en 150 px; aviso «Tu casa y tu coche» con «Volver al paso 9»; «La otra cara» (título 76 px, texto) con **6 filas de carrera** (nombre, subtítulo, recaudación, % ingresos, % PIB, barra ∝ recaudación) que se abren al tocar con «En qué se gasta» y «Qué efecto tiene»; fuentes y notas; «Ver fuentes del cálculo»; bloque de estadísticas en panel verde claro con texto oscuro y dos botones. |
| 11 | `Paso11` | `WorkerKnowledgeCheckCard` (portada) | Chips «Paso opcional» y «10–15 min», título 130 px, «37 preguntas» y «10 apartados» en 260 px, textos, CTA grande + «Saltar este paso», **escalera** de 10 columnas (altura ∝ nº de preguntas) con paso, nombre y recuento, paneles «Qué se envía / Qué no se envía», 4 puntos con filete verde. El cuestionario en sí solo recibe el marco común. |
| 12 | `Paso12` | `WorkerCalculationSourcesCard` | Rótulo «TRAZABILIDAD DEL CÁLCULO», título 124 px, «5» 240 px + «fuentes», texto; cada fuente es un artículo con número hueco 130 px (contorno del color de su tema), título, sello OFICIAL (verde) o ESTIMACIÓN (amarillo), editor, rejilla de 4 columnas de valores, enlace y nota; aviso final. Los datos vienen de `fiscalSourceRefs.ts`, no escritos a mano. |

**Móvil (390 px):** todo en una columna siguiendo `EscenarioMovil.dc.html`: márgenes de 20 px,
títulos con el tamaño ajustado a la palabra más larga (ya lo hace `EscTitle`), cifras 24-52 px,
paneles a una columna, ecuaciones en vertical, casillas y barras a ancho completo, nómina en una
columna, tablas con scroll propio si no caben. Sin scroll horizontal a 320 px.

## 7. Textos nuevos pendientes de aprobación

Márcalos en el código con `// texto nuevo D`:
- Paso 0: ninguno. Paso 1: «Nómina ordinaria», «Paga extra» (leyenda). Paso 2: rótulos de zona si no
  existen en la v1. Paso 3: «Cada casilla, 1 %.», «1 %» / «7 %». Paso 6: «Escala estatal y
  autonómica» (título). Paso 7: «deducción» / «reducción» en las monedas. Paso 8: «Reparto completo»,
  «Falta». Paso 9: se omite el párrafo introductorio repetido de la tarjeta.

## 8. Orden de trabajo y verificación

1. §5 (común) → 2. pasos 0, 1, 2 → 3. 4 y 5 → 4. 6 y 7 → 5. 8 y 9 → 6. 10, 11, 12 → 7. `/componentes`.
   Un commit por bloque.
2. Tras cada bloque:
   - `npx tsc -b`, `pnpm -s verify:styles`, `pnpm -s verify:scenario` en verde.
   - Mirar la v2 renderizada a **1280 px y 390 px** junto a la maqueta: mismo orden, mismas piezas,
     mismos tamaños aproximados. Sin scroll horizontal (`document.documentElement.scrollWidth`).
   - Recorrer el paso con teclado y con `prefers-reduced-motion` emulado.
   - Comprobar que `/calculadora-fiscal` (v1) no cambia.
   - Inventario: cada texto de la v1 del paso sigue presente en la v2.
3. Nota en `ai/history/AAAA-MM-DD-v2-<bloque>.md`, actualizar `ai/current.md`, commit y push.
