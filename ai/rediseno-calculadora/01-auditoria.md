# Rediseño de la calculadora fiscal · Fase 1: auditoría

Fecha: 2026-09-26. Solo lectura: no se ha tocado código.

Método: recorrido de los pasos 0-12 en el navegador a 1280 px y 375 px, midiendo el
DOM renderizado (cajas con borde o fondo, profundidad de anidamiento, bloques de texto,
tamaños de letra, altura) y contando en el CSS de la calculadora
(`worker-salary-dashboard/*.css`, `fiscal-worker-dashboard/*.css`, `SalarySlider.css`).
Escenario: 36.000 € brutos, Madrid, sin hijos.

## Resumen

Cada paso se lee como **dos páginas apiladas**. Primero viene una cabecera de
explicación (número grande, «Paso N de 12», título, subtítulo, párrafos y la nómina
dibujada). Después, una tarjeta de interacción que vuelve a empezar con su propio título,
a menudo el mismo. Dentro de la tarjeta hay paneles, y dentro de los paneles, filas en
caja. El contenido es bueno, pero el usuario atraviesa tres o cuatro "comienzos" antes de
poder hacer algo, y la jerarquía se invierte: explicaciones clave en 12-13 px y etiquetas
en 17-18 px.

## Medidas por paso

Cajas = elementos con borde o fondo redondeado de más de 60×30 px (sin contar botones
ni campos). Anid. = cuántas cajas hay una dentro de otra como máximo.

| Paso | Cajas (explicación + tarjeta) | Anid. | Página en móvil | Notas |
| --- | --- | --- | --- | --- |
| 0 Resumen | 9 | 3 | ~1,9 pantallas | 4 tarjetas de leyenda iguales en rejilla |
| 1 Base real | 8 + 8 | 4 | 2,5 pantallas | título repetido en la tarjeta |
| 2 Límites | 8 + 8 | 4 | 3,6 | título repetido; «Dentro del rango» aparece 3 veces |
| 3 Cotizaciones | 8 + 18 | 4 | 5,9 | textos de 8 px (MEI) y explicación de AT/EP en 12 px |
| 4 Especie | 7 + 8 | 3 | 3,9 | la tarjeta repite dos veces la misma instrucción |
| 5 Base liquidable | 6 + **63** | 3 | **16,4** | tarjeta de 10.987 px en móvil; 129 bloques de texto |
| 6 IRPF | 3 + 32 | 3 | 7,3 | título repetido; pista «clic = comparar» |
| 7 Deducciones | 7 + 20 | 3 | 5,0 | la tarjeta repite los recuadros de la explicación |
| 8 IVA | 2 + 27 | 4 | 5,4 | la tarjeta vuelve a poner «Paso 8 de 12» y el título |
| 9 Vivienda | 2 + 14 | 4 | 3,6 | la tarjeta repite casi literalmente la explicación |
| 10 Resumen | 37 | 4 | 8,9 | 6 bloques de impuesto iguales en rejilla |
| 11 Repaso | 17 | 3 | 3,6 | 3 insignias que repiten párrafos de al lado |
| 12 Fuentes | 28 | 3 | 4,2 | 5 fichas iguales de fuente |

En ningún paso hay scroll horizontal de la página. La nómina dibujada (pasos 1-6) mide
560 px y en móvil se mete en un marco de 285 px con scroll propio y letra de 9-10 px.

## Problemas, por orden de impacto

1. **Dos cabeceras por paso.** Explicación y tarjeta empiezan cada una con su título.
   En los pasos 1, 2, 3 y 6 el título es idéntico. En los pasos 8 y 9 la tarjeta repite
   además «Paso N de 12».
2. **El progreso se dice tres o cuatro veces:** número grande, «Paso N de 12» encima
   del título, la barra inferior «Paso N de 12 · Título» con puntos y, en algunos pasos,
   otra vez dentro de la tarjeta.
3. **La explicación queda lejos de la interacción.** En móvil hay entre 600 y 1.900 px
   de explicación antes del primer control. Lo que se toca y lo que cambia viven en
   bloques separados.
4. **Cajas dentro de cajas.** Hay tres o cuatro niveles en casi todos los pasos
   (página → tarjeta → panel → fila). En el paso 5 son 63 cajas, y en el paso 10, 37.
5. **Jerarquía tipográfica invertida y sin escala.** El CSS tiene 618 declaraciones de
   `font-size` con **201 valores distintos, ninguno con token**. En pantalla se ven 27
   tamaños distintos entre 8 y 61 px. Hay explicaciones enteras en 12-13 px (AT/EP,
   MEI, conceptos de los pasos 5 y 7) mientras que las etiquetas de campo van a 17-18 px.
   Los títulos de paso miden 24, 26, 28, 30, 38, 42 o 54 px según el paso.
6. **Espaciado a mano.** Hay 1.316 declaraciones de `padding`/`margin`/`gap` y solo 11
   usan variables. Los radios tienen 36 valores distintos; 60 de 397 usan
   `--fiscal-radius-*`. Hay 300 bordes de 1 px.
7. **Rejillas de piezas iguales** donde una lista o una frase bastarían: leyenda del
   paso 0 (4), impuestos del paso 10 (6), fuentes del paso 12 (5) y apartados del
   paso 11 (10).
8. **Dependencia del ratón.** Paso 5: «Pasa el ratón por el gráfico para ver el tipo de
   cada sueldo.» Paso 6: «clic = comparar · tu IRPF se cambia arriba». En táctil no hay
   equivalente anunciado.
9. **Movimiento irregular.** 49 transiciones o animaciones, y solo 3 archivos respetan
   `prefers-reduced-motion`. No hay tokens de duración ni de curva.
10. **Puntos de corte dispersos.** 12 anchos distintos de `@media` (520, 560, 640, 720,
    760, 860, 900, 1100, 1380...), así que cada pieza cambia de disposición en un punto
    diferente.

## Cobertura de tokens

| Categoría | Tokens definidos | Valores escritos a mano |
| --- | --- | --- |
| Color | completo (`--fiscal-*`) | 0 (lo vigila `verify:styles`) |
| Tipografía | ninguno | 618 `font-size`, 201 distintos |
| Espaciado | ninguno | 1.305 de 1.316 |
| Radios | 4 (`--fiscal-radius-*`) | 337 de 397, 36 distintos |
| Sombras | 2 | sin contar |
| Movimiento | ninguno | 49 declaraciones |
| Puntos de corte | ninguno | 12 anchos distintos |

## Textos candidatos a eliminar (pendiente de aprobación)

Solo textos que repiten algo ya dicho **en la misma pantalla**. No se ha borrado nada.

| Id | Paso | Texto literal que se quitaría | Dónde ya está dicho |
| --- | --- | --- | --- |
| T1 | 1-9 | «Paso N de 12» (encima del título de la explicación) | Barra inferior: «Paso N de 12 · Título», más el número grande |
| T2 | 1 | «Base real» (título de la tarjeta) | Título del paso: «Base real» |
| T3 | 2 | «Límites de cotización» (título de la tarjeta) | Título del paso |
| T4 | 3 | «Cotizaciones sociales» (título de la tarjeta) | Título del paso |
| T5 | 6 | «IRPF por tramos» (título de la tarjeta) | Título del paso |
| T6 | 7 | «Deducciones de cuota» (título de bloque en la tarjeta) | Título del paso |
| T7 | 8 | «Paso 8 de 12» y «8. IVA y consumo diario» (en la tarjeta) | Título del paso y barra inferior |
| T8 | 9 | «Paso 9 de 12» y «9. Vivienda y coche» (en la tarjeta) | Título del paso y barra inferior |
| T9 | 10 | «Paso 10 · Resumen» | Barra inferior |
| T10 | 11 | «Paso 11 de 12» y el prefijo «11. » del título | Barra inferior |
| T11 | 11 | Insignias «Paso opcional», «10–15 min», «37 preguntas · 10 apartados» | «Este paso es opcional…», «si tienes 10 o 15 minutos…», «37 preguntas repartidas en 10 apartados…» |
| T12 | 2 | «Cotizas por tu base real» (etiqueta bajo «Tu base real») | Estado: «Tu base real está entre la base mínima y la máxima. Cotizas por tu base real.» |
| T13 | 4 | Subtítulo «Lo que la empresa te paga sin darte dinero» | Tarjeta: «Dentro del bruto que declaraste en el paso 1 va lo que la empresa te paga sin darte dinero.» |
| T14 | 4 | «Una sola pregunta. Si no tienes ticket restaurante, transporte, seguro médico ni guardería de empresa, responde No y continúa.» | Explicación: «Si no tienes ninguno, responde «No» y continúa. Es un paso de una sola pregunta.» |
| T15 | 4 | Título «Retribuciones en especie» y su párrafo «El salario del paso 1 ya incluye estos beneficios si los tienes. Aquí solo reparte cuánto va a ticket restaurante, …» | Bloque siguiente: «¿Tu empresa te paga comida, transporte, seguro o guardería?» + «El salario del paso 1 ya los incluye si los tienes. Aquí solo indica a qué beneficio va cada parte…» |
| T16 | 5 | Subtítulo «Calculando las reducciones y el mínimo personal y familiar» | Explicación: «después veremos si puedes aplicar alguna reducción y calcularemos tu mínimo personal y familiar.» |
| T17 | 5 | Antetítulo «Reducción por rendimientos del trabajo» | Título justo debajo: «Cómo funciona tu reducción por rendimientos del trabajo» |
| T18 | 6 | Subtítulo «El impuesto sobre lo que ganas» | Explicación: «el impuesto personal que pagas a Hacienda sobre lo que ganas en el año» |
| T19 | 6 | «Tu IRPF se calcula con dos escalas distintas: la estatal y la de tu comunidad. Solo se tributa por la parte de renta que cae en cada tramo.» | Explicación: «Reparte esa base entre una escala estatal y otra autonómica, y cada porcentaje se aplica solo a la parte que cae en ese tramo.» |
| T20 | 7 | Subtítulo «Bajan el impuesto, no lo que ganas» | Explicación: «No reduce tu salario ni tu base: reduce el impuesto.» |
| T21 | 7 | «1 € de deducción te ahorra 1 €. No es como una reducción de base, que solo ahorra tu tipo marginal.» | Recuadro «¿Reducción o deducción?»: «1 € de deducción = 1 € menos a pagar» / «1 € de reducción ≈ tu tipo marginal» |
| T22 | 7 | «Las deducciones reembolsables (maternidad, guardería, familia numerosa, discapacidad a cargo) se abonan aunque la cuota sea 0 €.» | Bloque «Reembolsables»: «Maternidad, guardería, familia numerosa y discapacidad a cargo. Te las pagan aunque la cuota sea 0 €.» |
| T23 | 8 | Subtítulo «El impuesto sobre lo que compras» | Explicación: «el impuesto que pagas al comprar bienes o servicios» |
| T24 | 8 | «Distribuye tu gasto y calcula cuánto pagas al mes en IVA e impuestos especiales.» | Explicación: «Distribuye tu gasto mensual para obtener una estimación por categorías.» |
| T25 | 9 | Subtítulo «Impuestos por tener, no por gastar» | Explicación: «Hay impuestos que no dependen de tu consumo, sino de lo que posees.» |
| T26 | 9 | «Aquí no pagas por gastar, sino por tener: el IBI (…) y el IVTM (…) de tu coche se cobran cada año. También puedes recuperar lo que pagaste al comprar, que fue un pago único.» | Explicación, párrafos 1 y 2, casi palabra por palabra |
| T27 | 9 | «Responde las dos preguntas para completar el paso. Si no tienes vivienda o coche, marca «No».» | Explicación: «Si no tienes vivienda ni coche en propiedad, responde «No» a las dos preguntas y continúa.» |

**Dudosos, no propuestos:**
- Subtítulos de los pasos 1, 2 y 3: resumen el paso, pero no lo repiten literalmente.
- «Trazabilidad del cálculo» (paso 12).
- Las entradillas de tarjeta de los pasos 5 y 7 («No necesitas saber de impuestos…»,
  «No hace falta el BOE…») frente a «Completa únicamente…» de la explicación: se
  parecen, pero dicen cosas distintas.

## Dirección para la fase 2 (a validar)

- **Un paso = una sola columna narrativa:** título → explicación → interacción, sin
  cabecera propia en la tarjeta. La tarjeta deja de ser caja y pasa a ser la
  continuación del texto.
- **Una caja como máximo de profundidad,** y solo alrededor de lo que se toca.
- **Tokens nuevos en `FiscalSoftTheme.css`:** escala tipográfica
  (`--fiscal-text-*`, unos 6 pasos), espaciado (`--fiscal-space-*`, unos 7 pasos),
  movimiento (`--fiscal-duration-*`, `--fiscal-ease-*`) y dos o tres anchos de corte.
  `verify:styles` puede vigilarlos como ya vigila el color.
- **Explicaciones a 16 px como mínimo;** en la calculadora nada por debajo de 13 px.
- **La nómina, en móvil, plegada detrás de «Ver en tu nómina»** y sin scroll lateral.
- **Pistas de interacción válidas para táctil y ratón** (tocar o pasar por encima).
- **Piloto:** paso 0 y paso 5, el más largo.
