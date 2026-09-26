---
name: diseno-escenario
description: Diseña o rediseña pantallas de la calculadora fiscal (/calculadora-fiscal) con el lenguaje visual «Escenario» (diseño D elegido en septiembre de 2026) - fondo oscuro, tipografía Anybody que se estira, cifras grandes que cuentan, casillas de 100 €, barras que crecen y explicaciones que se abren al tocar. Úsala siempre que se pida rediseñar, maquetar, animar o «hacer más atractivo» cualquier paso, tarjeta o componente de la calculadora fiscal, aplicar el piloto del rediseño a los pasos 0 y 5 (o a cualquier otro), crear una maqueta o plantilla de un paso, o cuando alguien diga «como el diseño D», «estilo escenario» o «como la opción que elegimos», aunque no nombre la skill. No la uses para páginas del sitio fuera de la calculadora ni para cambiar cálculos o datos.
---

# Diseño «Escenario» para la calculadora fiscal

Esta skill traslada a la app el diseño D («Escenario») que se eligió entre seis propuestas
para el rediseño de `/calculadora-fiscal`. La referencia visual completa, con el paso 3
(Cotizaciones sociales) ya resuelto, está en `assets/escenario-paso3-escritorio.dc.html` y
`assets/escenario-paso3-movil.dc.html` (y en el lienzo privado
https://claude.ai/artifact/WAvcAeqfPNxihpQbAxkMxo). Ábrelas cuando necesites ver cómo encaja
una pieza; son maquetas en formato de lienzo, no código de la app.

## Por qué este diseño

La persona usuaria sentía que la calculadora «se hacía difícil de tragar»: demasiadas cajas,
textos sueltos, antetítulos y subtítulos. Escenario resuelve eso con un escenario oscuro y
pocas piezas muy grandes: en cada momento hay **una** cosa protagonista (un título, una cifra,
un gráfico) y el movimiento sirve para explicar cambios, no para decorar. Conserva todo el
contenido educativo, pero lo ordena para que se lea de arriba abajo sin esfuerzo:
**título → explicación → interacción → resultado**.

## Reglas del proyecto que manda esta skill

Estas no son preferencias de estilo: son acuerdos con la persona usuaria y reglas de
`AGENTS.md`. Romperlas deshace trabajo aprobado.

1. **El contenido educativo es literal.** Copia cada explicación tal cual está en el código
   (`WorkerFiscalStepsCard.tsx`, las tarjetas de cada paso). Partir un párrafo en dos bloques
   para colocarlo mejor está bien; resumir, reescribir o añadir frases no.
2. **Nada de texto nuevo sin avisar.** Etiquetas de gráfico imprescindibles («1 %», «7 %»)
   se pueden proponer, pero dilo en la respuesta para que se puedan quitar. Los textos
   redundantes de la auditoría (T1-T27 en `ai/rediseno-calculadora/01-auditoria.md`) solo se
   eliminan si están aprobados.
3. **No cambies flujo, pasos, preguntas, cálculos, datos ni fuentes.** El rediseño es visual.
4. **Nada depende del hover.** Toda explicación extra se abre al tocar o con teclado
   (`button` con `aria-expanded`). Si el original usa `InfoButton` o un tooltip, conviértelo
   en una fila o chip que despliega su texto.
5. **Solo tokens `--fiscal-*`.** Ningún color a mano en CSS ni en TSX. El diseño necesita
   tokens de escenario que aún no existen: créalos primero (ver
   `references/tokens-escenario.md`) y úsalos después. `pnpm verify:styles` lo comprueba.
6. **Solo la calculadora.** No toques nada fuera de `/calculadora-fiscal` ni los tokens de
   otras paletas.

## Flujo de trabajo

1. Lee `ai/current.md` y la sección del rediseño. Comprueba qué pasos ya están migrados y
   qué textos están aprobados para quitar.
2. Si los tokens de escenario no existen aún en `FiscalSoftTheme.css`, añádelos (una sola vez)
   siguiendo `references/tokens-escenario.md`. Igual con las fuentes.
3. Inventaría el paso que vas a rediseñar: cada texto, control, cifra, aviso, tabla, nota
   desplegable y estado (vacío, base mínima, base máxima, deshabilitado). Haz una lista y
   compruébala al final: la queja que motivó esta skill fue precisamente «se está perdiendo
   información».
4. Decide la pieza protagonista del paso (ver «Qué elegir como protagonista») y ordena el
   resto por debajo.
5. Monta la pantalla con los patrones de `references/patrones.md`. Reutiliza componentes: si
   un patrón aparece en dos pasos, sácalo a un componente con props (regla de `AGENTS.md`) y
   añádelo a `/componentes` dentro de `component-preview--calculadora fwd--soft
   fwd-worker-card` con sus variantes y estados.
6. Verifica (sección «Cómo comprobarlo»).
7. Deja nota en `ai/history/` y actualiza `ai/current.md`; commit y push si hay remoto.

## El lenguaje visual

### Escenario
- Fondo `--fiscal-stage` (azul noche). Paneles elevados, solo cuando agrupan algo que se
  entiende como un todo (MEI, AT/EP), en `--fiscal-stage-raised` con radio grande (32 px
  escritorio, 26 px móvil). Nada de tarjetas dentro de tarjetas.
- Texto principal `--fiscal-stage-text`; párrafos `--fiscal-stage-copy`; etiquetas y notas
  `--fiscal-stage-muted`. Separadores `--fiscal-stage-line`.
- Márgenes generosos: 80 px laterales en escritorio, 20 px en móvil; 88-120 px entre bloques
  en escritorio, 56-72 px en móvil. El espacio separa, no las cajas.

### Color con significado
Sobre fondo oscuro se usan las variantes claras de cada acento:
- Trabajador: `--fiscal-stage-worker` (violeta claro).
- Empresa: `--fiscal-stage-company` (naranja claro) para texto; `--fiscal-company` para
  rellenos.
- Lo que te queda / positivo: `--fiscal-stage-positive` (verde claro) para texto;
  `--fiscal-positive` para rellenos.
- Estado (Hacienda, Seguridad Social): `--fiscal-state-line`.
Cuando dos colores tengan que distinguirse en un gráfico, que también difieran en claridad
y lleven etiqueta; el color nunca va solo.

### Tipografía
- Display: **Anybody** (variable, ejes `wdth` 50-150 y `wght`). Títulos en mayúsculas, muy
  grandes (140-150 px escritorio, 50 px móvil), interlineado 0,86-0,9, `wdth` 110-130.
  Cifras grandes también en Anybody 800-900.
- Texto: **Instrument Sans**. Explicaciones a 22-26 px en escritorio y 18-20 px en móvil,
  interlineado 1,45-1,6. Nunca por debajo de 16 px para contenido educativo.
- Cifras siempre con `font-variant-numeric: tabular-nums` para que no bailen al animarse.
- Usa los tokens de tamaño `--fiscal-text-*` (ver referencia) en vez de valores sueltos.

### Movimiento
El movimiento explica un cambio o marca el orden de lectura. Catálogo (detalles y código en
`references/patrones.md`):
- **Título que se estira**: de `wdth 50` a `wdth 130` al entrar (1,4 s).
- **Entrada escalonada**: párrafos que suben 24 px con retraso creciente.
- **Barrido de marcador**: el fondo violeta u naranja se desliza bajo «cotización del
  trabajador» / «la paga la empresa» para señalar quién paga.
- **Cifras que cuentan**: interpolación de 600 ms con `ease-out` cúbico cuando cambia el
  salario, el contrato o la vista mensual/anual; brillo breve (`text-shadow`) al terminar.
- **Casillas que aparecen**: las 100 casillas entran girando con 12 ms de retraso entre ellas
  y cambian de color con transición.
- **Barras que crecen**: desde la izquierda (horizontal) o desde abajo (columnas), con
  transición de anchura cuando cambian los datos.
- **Aguja con rebote** en indicadores de escala.
- **Cinta en bucle** (opcional, decorativa, `aria-hidden`) con las palabras clave del paso.

Todo se desactiva con `@media (prefers-reduced-motion: reduce)` y las cifras saltan al valor
final. Nada parpadea más de tres veces por segundo.

## Qué elegir como protagonista

Pregúntate qué debería recordar alguien que solo mire la pantalla tres segundos:
- Si el paso reparte dinero (cotizaciones, resumen final): **las 100 casillas** «de cada
  100 € que cuesta tu puesto» o una **barra apilada**.
- Si compara partes de un mismo total (trabajador frente a empresa, tramos): **barras de
  carrera** ordenadas, una por concepto.
- Si hay un valor que depende de una elección (tipo AT/EP, tipo marginal): un **indicador de
  escala con aguja**.
- Si evoluciona en el tiempo (MEI, calendarios legales): **columnas en escalera**,
  acompañadas de la tabla real (el gráfico es `aria-hidden`; la tabla es la fuente accesible).
- Si el paso es sobre todo una pregunta (paso 0, retribución en especie): la **pregunta en
  display gigante** y el control justo debajo, sin nada más compitiendo.
- Para cerrar: **resumen como ecuación** (bruto − trabajador = bruto después;
  bruto + empresa = coste total).

## Estructura de un paso

1. Cabecera fina: nombre de la calculadora, 12 segmentos de progreso (el actual crece al
   entrar) y «03/12» en Anybody. Una sola indicación de progreso por pantalla.
2. Título en display y la primera explicación grande.
3. Resto de explicaciones, con los conceptos clave marcados con barrido de color.
4. Consola de control: control principal grande (deslizador o pregunta) y selectores en
   píldora; vista mensual/anual como interruptor segmentado; avisos (base mínima/máxima) en
   bloques claros con icono y texto.
5. Protagonista visual + párrafo con cifras en vivo al lado (escritorio) o debajo (móvil).
6. Desglose (filas tocables con su explicación) y notas en paneles elevados.
7. Resumen como ecuación.
8. Navegación: «atrás» discreto con borde y «siguiente» en píldora clara con el nombre del
   paso siguiente. Botones de 56-64 px de alto.

En móvil se apila todo en una columna con el mismo orden; los grupos de dos columnas pasan a
una, y las cifras grandes bajan a 24-52 px. Sin scroll horizontal a 320 px de ancho.

## Accesibilidad

- HTML semántico: `h1` por pantalla, `section` con `aria-labelledby`, `table` con `caption`
  y `th scope` para datos tabulares, `output` para totales.
- Filas desplegables: `button` con `aria-expanded` y `aria-controls`; el signo +/− es
  `aria-hidden`.
- Gráficos: `role="img"` con un `aria-label` que diga las cifras («De cada 100 € que cuesta
  tu puesto al mes: 77 € de bruto después de cotizaciones…»), o `aria-hidden` si hay tabla.
- Párrafos con cifras vivas: `aria-live="polite"`.
- Foco visible: contorno de 3 px en `--fiscal-stage-positive` con separación de 4 px.
- Contraste mínimo 4,5:1 para texto normal sobre `--fiscal-stage` y `--fiscal-stage-raised`
  (los tokens de la referencia ya lo cumplen; no uses los acentos sólidos oscuros como color
  de texto sobre el escenario).
- Objetivos táctiles de 44 px como mínimo.

## Cómo comprobarlo

1. `npx tsc -b`, `pnpm -s verify:styles` y `pnpm -s verify:scenario` en verde. Los errores de
   lint previos de `FiscalKpiRow.tsx` e `irpf2025Adjustments.ts` no son tuyos.
2. Mira la pantalla renderizada (vista previa del servidor de desarrollo) a 390 px y a
   1280 px: sin desbordes horizontales, orden de lectura correcto, animaciones activas.
   Repite con `prefers-reduced-motion` emulado.
3. Recorre el paso solo con teclado: todo se alcanza, el foco se ve y las filas se abren.
4. Repasa tu inventario del paso 3 del flujo: cada texto, control y estado sigue ahí.
5. En la respuesta, di qué comprobaste de verdad y qué no.

## Referencias

- `references/tokens-escenario.md`: bloque de tokens listo para `FiscalSoftTheme.css`
  (colores de escenario, tipografía, tamaños, espacios, duraciones) y cómo cargar las fuentes.
- `references/patrones.md`: CSS y JSX de cada patrón (título que se estira, barrido, cifras
  que cuentan, 100 casillas, barras de carrera, filas desplegables, escalera, aguja, ecuación,
  cinta) con su versión sin movimiento.
- `assets/escenario-paso3-*.dc.html`: la maqueta aprobada del paso 3, escritorio y móvil.
