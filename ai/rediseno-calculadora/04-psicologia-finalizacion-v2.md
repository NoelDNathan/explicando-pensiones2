# Calculadora fiscal v2: por qué se abandona y cómo rediseñar el recorrido

Fecha: 2026-10-07. Alcance: análisis conductual y propuesta de flujo. **No se ha cambiado la
aplicación.** Complementa `03-retencion-v2.md` (mismo día): aquí se reconstruye el recorrido
pantalla a pantalla, se añaden hallazgos nuevos y se prioriza.

Método: recorrido real de `http://localhost:5173/calculadora-fiscal/v2` como visitante nuevo
(almacenamiento borrado), en móvil 375 × 812 y en escritorio, con 35.000 € brutos y los demás
valores por defecto. Medidas del DOM con los repasos saltados y los desplegables cerrados.
**No hay datos de abandono**: la aplicación no registra ningún evento del embudo
(`src/main.tsx` monta Vercel Analytics, pero no hay ningún `track()`). Todo lo que sigue son
hipótesis argumentadas, no resultados. No se promete ningún porcentaje de mejora.

---

## 0. El diagnóstico en cinco frases

1. **La curiosidad se resuelve en el minuto 1 y el trabajo empieza después.** El paso 0 entrega
   la apuesta frente al cálculo y el reparto completo. A partir de ahí no queda ninguna pregunta
   abierta para el usuario: los 10 pasos se presentan como «ver cómo se calcula», es decir,
   como deberes. Con los valores por defecto, el paso 10 da **el mismo 52 €** que el paso 0.
2. **Es un curso disfrazado de calculadora.** En móvil, los pasos 1–10 suman unos 83.000 px
   (≈ 100 pantallas), unas 7.400 palabras (30–35 min solo de lectura) y 37 preguntas de repaso
   que bloquean «Siguiente». Quien vino a calcular no firmó para eso.
3. **El orden es el de la ley, no el del interés del usuario.** Base real → límites → cotizaciones
   → especie → base liquidable → tramos → deducciones. La comunidad autónoma, la variable que más
   cambia el IRPF para casi todos, aparece en el paso 6; en el paso 5 se preguntan antes cosas
   que aplican a muy pocos (colegio profesional, abogado laboral, traslado, patrimonio protegido).
4. **Los supuestos son invisibles.** El primer resultado usa Madrid, soltero, Grupo 7
   «Auxiliares administrativos», actividad 62 «Programación» y consumo medio, pero no lo dice.
   Quien vive en Sevilla lo descubre en el paso 6, y lo que siente no es «estoy afinando» sino
   «el primer resultado estaba mal».
5. **El final no premia haber terminado.** El paso 10 repite el reparto del paso 0, salta a la
   recaudación del Estado (de «yo» a «el país»), pide 3 preguntas más y su botón siguiente lleva a
   «Fuentes del cálculo». No compara con la apuesta ni dice qué cambió gracias a lo contestado.

La palanca principal no es decorar los pasos: es **reabrir una pregunta honesta después del
primer resultado** («esto es una aproximación con 5 supuestos; ¿cuál es el tuyo?») y **hacer que
cada respuesta mueva visiblemente esa cifra**.

---

## 1. El recorrido real, tal y como lo vive alguien

### Pantalla de entrada (paso 0, pregunta 1 de 2)

Lo primero que se ve en móvil: el nombre pequeño «Calculadora fiscal del trabajador 2025», tres
botones —Guardar, Compartir, Tu cuenta— y la pregunta en tipografía enorme. El deslizador está
**a 1,6 pantallas de distancia** y el «¿?» de la cifra y el deslizador no caben juntos: al moverlo
no se ve el número que se elige, solo las casillas.

- *Piensa:* «¿Qué es esto? ¿Me van a pedir registrarme?» (los tres botones sin haber dado nada
  a cambio) y luego «buena pregunta, ni idea».
- *Siente:* curiosidad (la pregunta funciona), algo de desorientación.
- *Puede abandonar porque:* no se dice qué va a obtener, cuánto tarda ni si es gratis/privado.
  En móvil, quien no hace scroll no ve que hay que mover algo.

### Pregunta 2 de 2: salario

Bien resuelta: una pregunta, valor por defecto, «una cifra aproximada vale», «se calcula en tu
navegador». Fallos menores: las etiquetas «250.000» y «500.000» de la escala se pisan en móvil.
El valor por defecto (35.000 €) permite pulsar sin pensar: es bueno para la fricción y malo para
la relevancia, porque el resultado puede no ser «suyo».

### Revelación (paso 0, resultado)

Al pulsar «Ver mi resultado», en móvil la pantalla muestra **otra vez el deslizador de salario**
y un hueco; la comparación «Tú dijiste 48 € / El cálculo 48 €» queda bajo el pliegue. El pico
emocional del producto ocurre fuera de la vista. Debajo, las 100 casillas y el reparto
(2.021 € tuyos de 3.852 € que cuesta el puesto) están muy bien.

- *Piensa:* «Vale, ya lo sé. ¿Y ahora qué?»
- *Siente:* satisfacción (o sorpresa) breve, y cierre.
- *Puede abandonar porque:* ya tiene la respuesta. Es un abandono **sano** si la respuesta le
  basta; el problema es que el producto no le da un motivo honesto para seguir.

El botón de continuar es «Ver cómo se calcula, paso a paso»: en móvil ocupa tres líneas con una
flecha diminuta, y promete lectura, no beneficio. La nota «Son cifras aproximadas… En los
siguientes pasos lo ajustamos contigo» es exactamente el motivo para seguir, pero va en letra
pequeña, después del botón y sin decir **qué** se supuso.

### Paso 1 · Base real

Título en jerga («Base real»), un párrafo que ya introduce «base de cotización» y «base
liquidable» sin definirlas, y **el mismo deslizador de salario por tercera vez**. Lo único nuevo
son anual/mensual y 12/14 pagas, que no cambian el resultado anual. Después, 3 preguntas de
examen (una con 4 verdadero/falso) y un aviso de que las respuestas se envían.

- *Piensa:* «Esto ya lo he puesto. ¿Me están examinando?»
- *Siente:* retroceso justo después del pico; leve evaluación.
- *Abandono:* alto. Es la primera pantalla tras la recompensa y no aporta nada personal.

El botón siguiente en móvil mide 80 px y se lee **«L…»** (su texto es «Límites de cotización»).
La acción principal de cada paso es ilegible en el dispositivo más probable.

### Paso 2 · Límites de cotización

Pide el grupo de cotización (por defecto «G7 · Auxiliares administrativos»). Casi nadie sabe su
grupo y para la mayoría de salarios no cambia nada: está dentro del rango. El panel lo confirma
(«Dentro del rango»), con lo que el usuario ha leído ~500 palabras para saber que **no le afecta**.

- *Piensa:* «¿Cuál es mi grupo? ¿Lo pongo mal?» (miedo a equivocarse) y después «no cambia nada».
- *Abandono:* medio. Duda + esfuerzo sin efecto visible.

### Paso 3 · Cotizaciones sociales

El paso más valioso a nivel emocional: lo que paga la empresa (935 €/mes) y el desglose. Pero
mide ~11 pantallas en móvil, pide contrato y actividad AT/EP (por defecto «62 · Programación»),
y el descubrimiento («tu empresa paga casi 1.000 € al mes que no ves») está enterrado en un
párrafo intermedio, no en un titular.

### Paso 4 · Retribución en especie

Una sola pregunta («¿Tu empresa te paga comida, transporte, seguro o guardería?») precedida de
~700 palabras sobre exención/reducción/deducción. A la mayoría le aplica «No». El texto ya lo
admite («Es un paso de una sola pregunta»). Coste alto, relevancia baja.

### Paso 5 · Base liquidable — el punto de mayor riesgo

~19 pantallas en móvil, ~1.450 palabras, 14 preguntas Sí/No más estado civil, y 7 preguntas de
repaso (ordenar 6 piezas, clasificar 6 conceptos, memorizar el mínimo de 5.550 €, dos sobre la
«joroba» de una explicación que empieza plegada y «fuera de rango»).

Problemas concretos:
- Pregunta por baja prevalencia antes que por impacto: sindicato, colegio obligatorio, abogado
  laboral, traslado desde el paro, mutualidad, aportación de la empresa al plan, patrimonio
  protegido, previsión de la pareja. Cada una cuesta a todo el mundo y aplica a pocos.
- Preguntas sensibles sin explicar por qué se piden ni que no salen del navegador: estado civil
  (divorciado/viudo), discapacidad, ascendientes a cargo.
- **Incoherencia visible:** en la misma pantalla aparece «Rendimiento neto del trabajo
  30.732 €» y, más abajo, «Tu RNT (32.732 €) supera 19.747,50 €». Legalmente son dos magnitudes
  distintas (el rendimiento neto previo, antes de los 2.000 € de gastos), pero se rotulan igual.
  Para alguien que duda de una herramienta fiscal, dos cifras distintas con el mismo nombre son
  la señal de «esto está mal».
- Errores de redacción en el texto de entrada («Pero si se tienen en cuenta…», «es por eso que
  no paga IRPF»), que restan profesionalidad justo donde más confianza hace falta.
- El mínimo personal y familiar se explica aquí, otra vez en el paso 6 y otra en el 7.

- *Piensa:* «¿Esto me aplica? ¿Qué es una mutualidad? Paso de esto».
- *Siente:* fatiga de decisión, sensación de interrogatorio, miedo a contestar mal algo fiscal.
- *Abandono:* el más alto del recorrido, por hipótesis.

### Paso 6 · IRPF por tramos

Aquí aparece **por primera vez la comunidad autónoma** (selector con Madrid por defecto). El
cálculo por tramos es didáctico y la escalera funciona, pero el usuario descubre que llevaba
6 pasos con una comunidad que no es la suya.

### Paso 7 · Deducciones de cuota

Buena explicación de deducción vs. reducción (la moneda de 1 € vs. 0,30 €). Preguntas por
donativos, alquiler anterior a 2015, vivienda anterior a 2013… de nuevo, baja prevalencia.
«Completa únicamente lo que puedas acreditar» suena a advertencia legal.

### Paso 8 · IVA y consumo diario

Se abre con una barra que dice **«Falta 100,00 % · 2.236,03 € / mes»** y 13 categorías con dos
campos cada una (importe y %): 27 campos. El consejo invita a abrir la app del banco. Las cifras
cambian de nombre: 2.021 € «a tu bolsillo» en el paso 0 frente a 2.236 € de gasto aquí.

- *Piensa:* «¿Tengo que rellenar todo esto? No sé cuánto gasto en farmacia».
- *Siente:* deuda («falta 100 %»), esfuerzo desproporcionado: el IVA es el 6 % del reparto.
- *Abandono:* alto, y con cambio de tarea (ir al banco) que rara vez vuelve.

### Paso 9 · Vivienda y coche

Dos preguntas claras. Correcto. «Responde las dos preguntas para completar el paso» es
razonable aquí.

### Paso 10 · Resumen

Entra con animación (en móvil el primer instante es una pantalla vacía), repite el deslizador
de salario por sexta vez y muestra el reparto: 52 € de cada 100. Para el usuario con valores por
defecto es **la misma cifra del minuto 1**. Luego la recaudación del Estado, 3 preguntas de
repaso y el botón siguiente lleva a «Fuentes del cálculo».

- *Piensa:* «¿Para esto he hecho todo? Me ha salido lo mismo».
- *Siente:* anticlímax. Regla pico-final: el recuerdo del producto se forma con el pico
  (la apuesta) y con este final, que es un examen y un listado de fuentes.

### Repasos en cada paso (transversal)

«Comprueba lo aprendido» + «Corregir apartado» + «Siguiente» que no avanza y te baja al
cuestionario. Es un peaje con forma de examen. Psicológicamente activa amenaza de evaluación
(miedo a fallar), convierte la herramienta en una tarea escolar y castiga a quien solo quería su
cifra. El aviso «Tus respuestas se envían de forma anónima» aparece justo cuando se pide
contestar: en un producto fiscal, la palabra «envían» genera la duda que el resto de la página
intenta evitar.

### Lo que funciona y hay que conservar

- La apuesta inicial: compromiso, curiosidad y una comparación personal. Es el mejor gancho.
- «Pregunta 1 de 2»: compromiso pequeño y finito.
- «Una cifra aproximada vale» y «se calcula en tu navegador».
- Las 100 casillas como unidad mental (de cada 100 €).
- El reparto en cuatro colores con frases cotidianas («Te lo quedas tú», «No sale de tu nómina»).
- La trazabilidad real (BOE, AEAT, INE) y el cálculo local: son ventajas de confianza que hoy
  están escondidas en un enlace al pie.
- Autoguardado: quien vuelve recupera su paso.

---

## 2. Motivación inicial

**¿Está clara la propuesta de valor?** No. La primera pantalla es una pregunta sin contexto. El
usuario no sabe qué obtendrá, cuánto tardará, si es gratis, si necesita cuenta ni quién está
detrás. La pregunta es buena precisamente porque genera curiosidad; lo que falta es una línea
que diga **qué hay al final** y **cuánto cuesta llegar**.

**Cómo generar anticipación sin clickbait:** la curiosidad honesta nace de una brecha real de
información que el usuario reconoce como suya. Aquí hay dos:

1. «¿Cuánto de lo que cuesta mi trabajo me llega?» (ya se usa: la apuesta).
2. «¿Y en mi caso concreto, con mi comunidad, mis hijos y mi forma de gastar?» (no se usa).

Propuesta de cabecera, sobre la pregunta 1 (sin quitarla):

> **¿A dónde van los 100 € que cuesta tu trabajo?**
> Primera respuesta en 2 preguntas. Ajustada a tu caso en unos minutos más.
> Gratis · sin registro · nada sale de tu navegador · datos oficiales (BOE, AEAT, INE)

Quitar Guardar, Compartir y Tu cuenta de la cabecera hasta que haya un resultado. Pedir guardar
antes de dar valor es pedir compromiso sin reciprocidad.

---

## 3. Fricción psicológica

### Mapa de carga por fase

| Fase | Carga cognitiva | Tipo de fricción dominante | Comentario |
| --- | --- | --- | --- |
| Apuesta | Baja | Desorientación (móvil) | Acción bajo el pliegue |
| Salario | Baja | Ninguna relevante | Buena |
| Revelación | Baja | Pico fuera de vista (móvil) | El mejor momento, mal encuadrado |
| Paso 1 | Media | Repetición, examen | No aporta nada personal |
| Paso 2 | Media-alta | Incertidumbre («¿cuál es mi grupo?») | Efecto nulo para la mayoría |
| Paso 3 | Alta | Longitud | Contiene el mejor descubrimiento |
| Paso 4 | Media | Texto previo largo para una pregunta | «No» para la mayoría |
| Paso 5 | **Muy alta** | Fatiga de decisión, preguntas íntimas, examen de 7 preguntas | Mayor riesgo |
| Paso 6 | Alta | Descubrimiento tardío de la comunidad | Rompe la confianza en el paso 0 |
| Paso 7 | Media | Baja prevalencia, tono legal | |
| Paso 8 | **Muy alta** | 27 campos, «Falta 100 %», cambio de app | Esfuerzo ≫ impacto |
| Paso 9 | Baja | — | Correcto |
| Paso 10 | Media | Anticlímax, examen final, salida a fuentes | El final no premia |

### Preguntas que sobran, se adelantan o se retrasan

- **Eliminar del recorrido principal** (dejar con un valor por defecto rotulado y editable en el
  modo completo): grupo de cotización, actividad AT/EP, tipo de contrato salvo temporal, 12/14
  pagas, colegio profesional, abogado laboral, traslado desde el paro, patrimonio protegido,
  previsión de la pareja, alquiler anterior a 2015, vivienda anterior a 2013, inversión en
  empresa nueva.
- **Adelantar**: comunidad autónoma (es la variable de mayor impacto para todos), hijos y
  ascendientes a cargo.
- **Agrupar en un filtro** («¿Algo de esto te aplica?»): plan de pensiones, sindicato, donativos,
  discapacidad, beneficios en especie, vivienda o alquiler antiguos.
- **Convertir en elección única**: consumo («Uso la media para mi sueldo» / «Lo ajusto»).
- **Explicar por qué se pide** cada dato sensible, al lado del dato: «Con hijos el IRPF baja. Lo
  usamos solo para el cálculo; no sale de tu navegador».

Regla de diseño: **preguntar por impacto × prevalencia**, no por el orden del articulado.

---

## 4. Progreso y sensación de avance

**Situación actual:** contador «01/10» y segmentos superiores. El contador es honesto, pero mide
lo que no importa (pasos del cálculo) y no lo que sí (cuánto falta para tener *mi* resultado).
Diez pasos de longitud muy desigual (el 5 es cuatro veces el 1) rompen la expectativa: el
usuario calibra el esfuerzo con los primeros pasos y el 5 le parece una trampa. Además, los
segmentos permiten saltar y «Siguiente» no: dos controles con reglas distintas.

**Propuesta:**
- Cuatro capítulos de usuario con nombre cotidiano: **Tu nómina · Tu situación · Lo que compras ·
  Lo que tienes**, y después **Tu ticket**. Cada capítulo, de 1 a 4 preguntas.
- Progreso con **pasos restantes**, no porcentaje ni minutos: «Te quedan 2 bloques: compras y
  casa». El porcentaje sobre 10 pasos desiguales engaña; los minutos solo se deben mostrar cuando
  se hayan medido (mediana real), nunca inventados.
- **Progreso dotado honesto (endowed progress):** la apuesta y el salario ya son trabajo real.
  Mostrarlo: «Ya tienes tu primera respuesta. 4 bloques para ajustarla». No es inflar: es contar
  lo hecho.
- **Gradiente de meta:** el último bloque se anuncia como último («Último bloque: tu casa y tu
  coche, 2 preguntas») y el botón final dice «Ver mi ticket».
- **Feedback inmediato por respuesta:** cada respuesta que mueve la cifra la mueve en pantalla
  (la cifra de «de cada 100 €» fija en una franja superior, con la variación «−0,8 €» al
  contestar «Sí, 2 hijos»). Ver que lo que uno dice cambia algo es la recompensa más honesta.
- Botones con la siguiente recompensa, no con el siguiente concepto: «Ver cuánto paga tu empresa»
  en vez de «Cotizaciones sociales»; y en móvil, a ancho completo, nunca truncados.

---

## 5. Abandono por punto del flujo

| Punto | Qué piensa | Emoción | Por qué abandona | Cambio concreto |
| --- | --- | --- | --- | --- |
| Llegada | «¿Qué es esto? ¿Me pedirán cuenta?» | Desorientación | No sabe qué obtiene ni cuánto tarda; ve «Tu cuenta» antes que valor | Cabecera de valor + «2 preguntas · gratis · sin registro · en tu navegador». Ocultar Guardar/Compartir/Cuenta hasta el resultado |
| Apuesta (móvil) | «¿Dónde contesto?» | Confusión | Deslizador a 1,6 pantallas; no ve la cifra al moverlo | Cifra, casillas y deslizador en una sola pantalla; título más compacto en móvil |
| Salario | «¿Pongo el bruto exacto?» | Leve inseguridad | Poco | Mantener; arreglar etiquetas de escala que se pisan |
| Revelación | «Ya lo sé» | Sorpresa → cierre | Curiosidad satisfecha, sin pregunta abierta | Encuadrar arriba la comparación; mostrar los **supuestos** como fichas editables; CTA «Ajustar a mi caso» |
| CTA «paso a paso» | «Esto va a ser largo» | Pereza anticipada | Promete lectura, no beneficio | «Ajustar a mi caso · 4 bloques» como primario; «Entender cómo se calcula» como secundario |
| Paso 1 | «Ya puse esto» | Retroceso | Repite el salario; examen | Eliminar del recorrido principal; pagas y periodicidad como ajuste opcional |
| Repaso (cada paso) | «¿Me examinan?» | Amenaza de evaluación | «Siguiente» no avanza | Repaso voluntario, una pregunta-predicción por capítulo como máximo, nunca bloqueante |
| Paso 2 | «¿Cuál es mi grupo?» | Miedo a equivocarse | Duda sin efecto | Por defecto rotulado, «Solo cambia si ganas menos de X o más de Y» |
| Paso 3 | «Cuánto texto» | Fatiga | Longitud | Titular-descubrimiento «Tu empresa paga 935 €/mes que no ves»; desglose plegado |
| Paso 4 | «No tengo nada de eso» | Impaciencia | 700 palabras para un «No» | Integrar en el filtro de «¿Algo de esto te aplica?» |
| Paso 5 | «¿Esto me aplica? Paso» | Fatiga de decisión, intrusión | 15 decisiones + 7 preguntas de examen + cifras incoherentes | Filtro por chips; solo se abren los elegidos; explicar por qué se pide lo sensible; corregir RNT y redacción |
| Paso 6 | «¿Madrid? Yo no vivo ahí» | Desconfianza retroactiva | El resultado anterior «estaba mal» | Comunidad en el primer bloque (o editable desde la revelación) |
| Paso 7 | «¿Puedo acreditarlo?» | Inseguridad legal | Tono de advertencia | Dentro del filtro; tono «si te aplica, baja tu IRPF» |
| Paso 8 | «No sé cuánto gasto en farmacia» | Deuda, agobio | 27 campos; ir al banco | «Uso la media» por defecto con fuente; ajuste en 3–4 grandes partidas |
| Paso 9 | — | — | Bajo | Mantener |
| Paso 10 | «¿Para esto? Me sale lo mismo» | Anticlímax | El final no premia | Ticket, cambio frente a la aproximación y frente a la apuesta, 3 descubrimientos, laboratorio |
| Retorno | «¿Dónde estaba?» | Indiferencia | No se le recuerda | «Tu cálculo sigue aquí. Te falta: compras y casa» |

---

## 6. Confianza

Lo que ya hay es excelente y no se ve: cálculo local, cero servidor para los datos fiscales,
enlace compartido en el fragmento, fuentes del BOE/AEAT/INE con checksums. El usuario no
percibe nada de eso porque vive en un enlace al pie y en `ai/`.

**Credibilidad**
- Mostrar en la revelación: «Calculado con la Orden PJC/178/2025 (BOE), la escala de la AEAT
  2025 y la EPF del INE · ver fuentes». Fuentes junto a la cifra, no al final.
- Corregir la incoherencia RNT 30.732 € / 32.732 € (rotular «rendimiento neto previo»).
- Revisar la redacción del paso 5. Un error gramatical en una calculadora fiscal se lee como
  error de cálculo.
- Nombrar quién hace esto y por qué (una línea en el pie o en la cabecera de valor).

**Seguridad y transparencia**
- Cada supuesto visible y editable: «Hemos supuesto: Madrid · sin hijos · consumo medio de tu
  nivel de renta». La transparencia sobre lo que no sabemos aumenta la confianza en lo que sí.
- Junto a cada dato sensible: por qué se pide y que no sale del navegador.
- Mover el aviso de envío anónimo de los repasos a una línea plegable o al momento de pulsar
  «Enviar»; nunca antes de que el usuario decida contestar.
- Etiquetar estimaciones: el IVA es una estimación con la EPF (hogares, no individuos). Decirlo
  como fortaleza («estimación con datos del INE»), no como letra pequeña.

**Profesionalidad**
- Botones no truncados, escalas que no se pisan, nada de pantallas vacías durante animaciones
  de entrada. Los fallos de acabado en móvil hacen más daño a la confianza que cualquier texto.
- Un solo nombre por concepto en todo el recorrido («a tu bolsillo», «neto», «lo que te
  queda»): hoy conviven varios con cifras distintas (2.021 € y 2.236 €).

**Confianza para introducir datos**
- Rangos en lugar de cifras exactas donde sea posible (hijos: 0 / 1 / 2 / 3+; edades por tramo).
- «No lo sé» como respuesta válida en todo dato con valor por defecto razonable. No convertir
  un «no lo sé» en un «No» confirmado: marcarlo como supuesto.

---

## 7. Engagement (sin manipulación)

Mecanismos propuestos, cada uno con su base y su límite ético:

1. **Supuestos como bucle abierto honesto (efecto Zeigarnik).** La revelación muestra «4
   supuestos sin confirmar». Cada bloque confirma uno. La tarea pendiente es real, no fabricada.
   Límite: el resultado aproximado se da completo; no se oculta nada para forzar a continuar.
2. **Predicción antes de cada revelación (efecto de generación + curiosidad).** Repite la
   mecánica que mejor funciona, la apuesta, en lugar del examen: «¿Cuánto crees que paga tu
   empresa además de tu bruto?» → deslizador → revelación. Una por capítulo como máximo.
   Sustituye a los 37 repasos en el recorrido principal; el banco completo queda en el modo
   «Aprender».
3. **Un descubrimiento personal por capítulo (microrecompensa informativa).** Tarjeta corta con
   una cifra tuya:
   - Nómina: «Tu empresa paga 935 € al mes por ti que no aparecen en tu nómina».
   - Situación: «De cada euro extra que ganes, X céntimos van a IRPF y cotizaciones» (tipo
     marginal personal).
   - Compras: «Unos 215 € al mes se te van en IVA al comprar».
   - Final: «Trabajas hasta el día D del año para pagar impuestos y cotizaciones» (calculado con
     tu reparto, rotulado como estimación).
4. **Cifra viva (reducción de incertidumbre + feedback).** Franja fija con «de cada 100 €» y la
   variación de la última respuesta. Ver la consecuencia inmediata de cada respuesta da sentido
   a responder.
5. **Aversión a la pérdida, en versión honesta.** «Si tienes hijos, plan de pensiones o
   donativos, tu IRPF probablemente es menor de lo que muestra esta aproximación». Es cierto,
   no es miedo inventado, y no se exagera la cuantía.
6. **Compromiso y consistencia.** La apuesta del principio vuelve al final: «Dijiste 40 €. Con
   tu caso completo son 47 €». Cierra el ciclo que el usuario abrió.
7. **Elegir el propio camino (autonomía).** En la revelación: «¿Qué quieres descubrir primero?»
   (lo que paga mi empresa / cómo me afecta mi familia / cuánto IVA pago). Experimento A/B, no
   cambio por defecto.
8. **Comparaciones útiles, no rankings.** «Con el mismo sueldo en Andalucía / Cataluña» (ya hay
   un comparador retirado del paso 6 que podría volver al final como exploración). Nunca
   «pagas más que el 80 % de la gente» si no hay una fuente que lo sostenga.

Lo que **no** hay que hacer: puntos, rachas, insignias por responder bien, temporizadores,
porcentajes de progreso inflados, ocultar el primer resultado, compartir el salario por defecto
o pedir cuenta para ver el final.

---

## 8. El resultado final: que haya merecido la pena

Hoy el usuario que termina recibe lo mismo que en el minuto 1. Para que el final valga el viaje,
tiene que contener cosas que **solo existen porque contestó**:

1. **Tu ticket fiscal.** Un ticket de caja vertical (encaja con Escenario y con el reel ya hecho):
   coste del puesto → cotizaciones de empresa → tus cotizaciones → IRPF → IVA → IBI/IVTM → te
   queda. Total y «de cada 100 €» arriba.
2. **Qué cambió gracias a ti.** «La aproximación decía 48 €. Con tu comunidad, tus 2 hijos y tu
   consumo son 44 €.» Con la lista de las respuestas que más movieron la cifra. Si no cambió
   nada, decirlo también: «Tu caso coincide con la aproximación: tus respuestas lo confirman».
3. **Tu apuesta, cerrada.** Comparación con lo que dijo en la pregunta 1 y una frase que no
   juzgue («La mayoría no cuenta lo que paga la empresa»; solo si hay un dato que lo respalde,
   y si no, sin esa frase).
4. **Tres descubrimientos personales** como los del apartado 7.
5. **Un laboratorio corto:** «¿Y si gano 1.000 € más?», «¿Y si viviera en…?», «¿Y si tuviera un
   hijo?». Siempre con vuelta al caso original y sin sobrescribirlo.
6. **Llevárselo:** guardar en este dispositivo, descargar imagen del ticket, compartir **solo el
   porcentaje** por defecto. Aquí, y no antes, aparecen Guardar/Compartir/Cuenta.
7. **Después, si quiere:** «¿Qué financia cada parte?» (la recaudación del Estado que hoy ocupa
   el paso 10) y «Entender cada línea» (los pasos didácticos y sus repasos).

Botón final: nunca «Fuentes del cálculo». Las fuentes, como enlace junto a cada línea del ticket.

---

## 9. Rediseño: flujo pantalla a pantalla

Principio: **dos velocidades**. Un recorrido corto que termina en *tu* resultado (objetivo:
completarlo) y un modo «Aprender» con el contenido didáctico actual, accesible desde cada línea
del ticket y desde el final. El motor de cálculo no cambia; cambian el orden, qué se pregunta en
el recorrido corto y cómo se presenta.

### P0 · Entrada y apuesta

- **Objetivo psicológico:** orientar y comprometer con algo pequeño.
- **Información:** qué obtendrá, cuánto cuesta, privacidad, fuentes.
- **Acción:** mover el deslizador y pulsar «Siguiente».
- **Microcopy:** «¿A dónde van los 100 € que cuesta tu trabajo? · Primera respuesta en
  2 preguntas · Gratis, sin registro, todo en tu navegador». Pregunta actual sin cambios.
- **Motivación:** curiosidad + compromiso (la apuesta).
- **Riesgo:** no encontrar el control en móvil.
- **Mejora:** cifra, casillas y deslizador en una pantalla; sin botones de cuenta.

### P1 · Salario

- **Objetivo:** dato mínimo con coste mínimo.
- **Acción:** deslizador o cifra.
- **Microcopy:** actual («Bruto al año… una cifra aproximada vale»). Añadir «¿Solo sabes lo que
  cobras al mes? Cámbialo aquí» si se quiere recuperar el modo mensual sin un paso aparte.
- **Riesgo:** bajo. **Mejora:** arreglar la escala en móvil.

### P2 · Revelación

- **Objetivo:** recompensa inmediata + abrir una pregunta honesta.
- **Información, en este orden y en la primera pantalla:** «Tú dijiste 40 € / Con tus datos,
  unos 48 €» → 100 casillas → reparto en cuatro líneas → **«Hemos supuesto:»** fichas
  `Madrid` `Sin hijos` `Consumo medio` `Sin vivienda ni coche`.
- **Acción principal:** «Ajustar a mi caso · 4 bloques». Secundaria: «Ver cómo se calcula».
- **Microcopy:** «Es una aproximación. Tu comunidad, tu familia y tu forma de gastar pueden
  moverla varios euros. ¿Lo afinamos?»
- **Motivación:** reducción de incertidumbre, Zeigarnik honesto, autonomía.
- **Riesgo:** abandono satisfecho (aceptable) o abandono porque continuar parece largo.
- **Mejora:** el usuario puede tocar una ficha y corregirla allí mismo (la comunidad, sobre
  todo) y ver moverse la cifra antes de decidir seguir.

### P3 · Bloque 1 «Tu nómina» (1 de 4)

- **Objetivo:** primer acierto rápido y el descubrimiento más potente.
- **Preguntas:** comunidad autónoma (si no se tocó en P2); «¿Tu contrato es temporal?» (Sí/No).
  Todo lo demás por defecto rotulado y editable con «Ajustar detalles».
- **Antes de revelar:** predicción «¿Cuánto crees que paga tu empresa además de tu bruto cada
  mes?» (opcional, «Saltar»).
- **Descubrimiento:** «Tu empresa paga 935 € al mes por ti. No aparecen en tu nómina».
- **Microcopy del botón:** «Seguir: tu situación personal».
- **Riesgo:** bajo. **Mejora frente a hoy:** sustituye a los pasos 1, 2 y 3 en el recorrido
  corto (≈ 18.000 px de móvil a ≈ 2 pantallas).

### P4 · Bloque 2 «Tu situación» (2 de 4)

- **Objetivo:** personalizar sin interrogar.
- **Pregunta única:** «¿Algo de esto te aplica? Marca lo que quieras, o ninguno».
  Chips: `Hijos` `Padres o abuelos a cargo` `Discapacidad` `Plan de pensiones` `Cuota sindical o
  colegio` `Donativos` `Comida, transporte o seguro pagado por la empresa` `Vivienda comprada
  antes de 2013 o alquiler antes de 2015` `Ninguna` `No lo sé`.
- **Después:** solo se abren los campos de lo marcado, con rangos cuando se pueda.
- **Microcopy:** «Lo usamos solo para el cálculo y no sale de tu navegador. Si no estás seguro,
  déjalo sin marcar: lo marcaremos como supuesto».
- **Motivación:** feedback inmediato en la franja («Hijos: −1,2 € de cada 100»), aversión a la
  pérdida honesta («Si algo de esto te aplica, probablemente pagas menos IRPF»).
- **Riesgo:** sensación de intrusión. **Mejora:** sustituye a los pasos 4, 5 y 7 del recorrido
  corto; estado civil y declaración conjunta solo si marca hijos o si lo pide desde «Ajustar».

### P5 · Bloque 3 «Lo que compras» (3 de 4)

- **Objetivo:** incluir el IVA sin convertirlo en contabilidad.
- **Información:** «Con tu sueldo, un hogar medio paga unos 215 € al mes de IVA e impuestos
  especiales (INE, EPF 2024)».
- **Acción:** «Me vale la media» (primaria) o «Ajustarlo» → 3–4 grandes partidas (comida,
  gasolina, luz, resto) con deslizadores; las 13 categorías quedan en «Aprender».
- **Microcopy:** nunca «Falta 100 %». En su lugar «Usando la media de tu nivel de renta».
- **Riesgo:** cambio de app (ir al banco). **Mejora:** no sugerir el banco en el recorrido corto.

### P6 · Bloque 4 «Lo que tienes» (último)

- **Objetivo:** cierre rápido del último bloque.
- **Preguntas:** «¿Tienes vivienda en propiedad?» «¿Y coche?» (como hoy).
- **Microcopy:** «Último bloque · 2 preguntas». Botón: «Ver mi ticket fiscal».
- **Motivación:** gradiente de meta.

### P7 · Tu ticket fiscal

- **Objetivo:** pico-final positivo; que se lleve algo.
- **Información:** ticket; «la aproximación decía X, tu caso da Y» y qué lo movió; la apuesta
  cerrada; tres descubrimientos; fuentes junto a cada línea.
- **Acciones:** guardar, descargar imagen, compartir solo el porcentaje.
- **Motivación:** cierre, competencia («ahora entiendo mi nómina»), algo que enseñar.
- **Riesgo:** ninguno de abandono; el riesgo es que no se perciba valor. **Mejora:** todo lo
  que hay aquí es personal y nuevo respecto a P2.

### P8 · Explorar y aprender (opcional)

- **Laboratorio:** «¿Y si gano 1.000 € más?», «¿Y si viviera en…?».
- **Aprender cada línea:** el contenido actual de los pasos 1–10, con sus repasos
  («¿Te atreves con 3 preguntas?»), sin bloqueo.
- **Qué financia cada parte:** la recaudación del Estado del paso 10 actual.
- **Retorno:** «Tu ticket está guardado en este dispositivo».

**Efecto esperado en carga:** el recorrido corto pasa de ~100 pantallas, ~60 campos y 37
preguntas de repaso a unas 8–10 pantallas y entre 4 y 12 respuestas según el caso. Es una
estimación de diseño, no una medida.

**Antes de implementar** (AGENTS.md): llevar a `/componentes` las piezas nuevas (fichas de
supuestos, franja de cifra viva, filtro de chips, tarjeta de descubrimiento, ticket); los
descubrimientos que sean cifras nuevas («trabajas hasta el día D», «tipo marginal personal»)
necesitan su nota de metodología antes de uso editorial; los perfiles de consumo deben salir de
la EPF documentada o rotularse como ilustrativos.

---

## 10. Priorización

Impacto y facilidad en escala Alta / Media / Baja. «Impacto» es el esperado sobre la tasa de
finalización según la hipótesis, no una medida.

### Requisito previo (sin esto nada es medible)

| Mejora | Impacto | Facilidad | Prioridad | Hipótesis | Métrica |
| --- | --- | --- | --- | --- | --- |
| Instrumentar el embudo con eventos sin datos personales (`step_viewed`, `step_completed`, `result_viewed`, `quiz_skipped`, `save_clicked`) por versión y dispositivo | — | Alta | **P0** | No se puede optimizar lo que no se mide | Línea base de cada métrica de esta tabla |

### Quick wins

| Mejora | Impacto | Facilidad | Prioridad | Hipótesis psicológica | Métrica |
| --- | --- | --- | --- | --- | --- |
| Botón siguiente legible en móvil (ancho completo, nunca «L…») | Alta | Alta | P1 | Una acción principal ilegible bloquea el avance | Clics en siguiente / vistas de paso, móvil |
| Revelación del paso 0 encuadrada arriba en móvil (comparación visible sin scroll) | Alta | Alta | P1 | El pico debe verse para recompensar | % que ve la comparación (evento de visibilidad) |
| Repaso no bloqueante: «Siguiente» siempre avanza | Alta | Alta | P1 | Amenaza de evaluación y peaje → abandono | Paso n → n+1; tiempo por paso |
| CTA de la revelación: «Ajustar a mi caso» primario, «Ver cómo se calcula» secundario | Media | Alta | P1 | Prometer beneficio, no trabajo | Clic en continuar / resultados vistos |
| Mostrar los supuestos («Madrid · sin hijos · consumo medio») bajo el resultado | Alta | Alta | P1 | Zeigarnik honesto, transparencia | Clic en continuar; cambios de comunidad |
| Cabecera de valor y ocultar Guardar/Compartir/Cuenta hasta el resultado | Media | Alta | P1 | Reciprocidad: no pedir antes de dar | Inicio de apuesta / visitas |
| Apuesta en una sola pantalla en móvil | Media | Media | P2 | Encontrar el control sin buscar | Apuesta completada / visitas |
| Corregir RNT 30.732/32.732 y redacción del paso 5; escala de salario que se pisa | Media | Alta | P1 | Las incoherencias destruyen confianza | Abandono en paso 5; «Esto no estaba bien explicado» |
| Paso 8: arrancar en «media» sin «Falta 100 %» | Media | Alta | P2 | Encuadre de deuda → agobio | Abandono en paso 8 |
| Paso 10: botón final hacia guardar/compartir, no a «Fuentes» | Media | Alta | P2 | Regla pico-final | Guardados/compartidos por resultado |
| Quitar la repetición del deslizador de salario en pasos 1, 2, 6 y 10 (dejar resumen editable) | Baja | Alta | P3 | «Ya te lo dije» = retroceso | Tiempo en paso 1 |

### Mejoras de impacto medio

| Mejora | Impacto | Facilidad | Prioridad | Hipótesis | Métrica |
| --- | --- | --- | --- | --- | --- |
| Comunidad autónoma en el primer bloque o editable desde la revelación | Alta | Media | P1 | Evita la desconfianza retroactiva | Cambios de comunidad; abandono en paso 6 |
| Filtro «¿Algo de esto te aplica?» en lugar de las 14 preguntas del paso 5 | Alta | Media | P1 | Menos decisiones, menos intrusión | Abandono en bloque 2; tiempo por bloque |
| Cifra viva con variación por respuesta | Media | Media | P2 | Feedback inmediato da sentido a contestar | Respuestas por bloque; finalización |
| Una tarjeta de descubrimiento por capítulo | Media | Media | P2 | Microrecompensa informativa | Avance tras ver la tarjeta |
| Repasos convertidos en una predicción por capítulo | Media | Media | P2 | Generación + curiosidad > examen | % de predicciones contestadas; avance |
| Cierre con apuesta, «qué cambió gracias a ti» y ticket | Alta | Media | P1 | Pico-final, consistencia | Guardar/compartir; retorno |
| Banner de retorno «Te falta: compras y casa» | Media | Alta | P2 | Zeigarnik para quien se interrumpe | Sesiones retomadas que terminan |
| Explicar por qué se pide cada dato sensible | Media | Alta | P2 | Seguridad percibida | Respuestas en datos familiares |

### Cambios estructurales

| Mejora | Impacto | Facilidad | Prioridad | Hipótesis | Métrica |
| --- | --- | --- | --- | --- | --- |
| Dos velocidades: recorrido corto de 4 bloques + modo «Aprender» | Alta | Baja | P1 (diseñar ya) | Separar calcular de estudiar | Resultados personalizados vistos / personalizaciones iniciadas |
| Ticket fiscal como hilo conductor que crece por capítulo | Alta | Baja | P2 | Progreso tangible y cierre | Finalización; descargas de imagen |
| Laboratorio «¿Y si…?» tras el ticket | Media | Media | P3 | Exploración y valor posterior | Uso del laboratorio; retorno |
| Fuentes junto a cada línea del resultado | Media | Media | P2 | Credibilidad en el punto de duda | Clics en fuentes; abandono tras ver cifra |

### Experimentos A/B

| Experimento | Variante | Hipótesis | Métrica principal | Métrica de control |
| --- | --- | --- | --- | --- |
| Texto del CTA de la revelación | «Ver cómo se calcula» vs «Ajustar a mi caso» vs «Ver qué he supuesto» | Beneficio > tarea | Clic en continuar | Resultados finales vistos |
| Supuestos visibles | Sin fichas vs con fichas editables | Bucle abierto honesto | Continuar tras revelación | Abandono en revelación |
| Repaso | Bloqueante vs opcional vs predicción | Examen = fricción | Paso 1 → 2 | Respuestas correctas, «no estaba bien explicado» |
| Progreso | «01/10» vs «Bloque 1 de 4 · te quedan…» | Gradiente de meta | Finalización | Tiempo total |
| Camino elegido | Orden fijo vs «¿Qué quieres descubrir primero?» | Autonomía | Finalización | Bloques completados |
| Consumo | 13 categorías vs media + 4 grandes partidas | Esfuerzo ∝ impacto | Abandono en compras | Precisión del IVA declarado |

Medir siempre por versión y dispositivo. No optimizar tiempo en página: un recorrido mejor
debería ser **más corto** y terminar más.

---

## Siguiente decisión

Propuesta de orden: (1) instrumentar el embudo; (2) los quick wins de móvil, repaso no
bloqueante, CTA y supuestos visibles; (3) diseñar el recorrido de dos velocidades con la skill
`diseno-escenario`, empezando por la revelación (P2) y el ticket (P7), que son el pico y el
final. Todo pendiente de aprobación: este documento no cambia la aplicación.
