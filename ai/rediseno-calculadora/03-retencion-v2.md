# Retención en la calculadora fiscal v2

Fecha: 2026-10-07. Alcance: análisis y propuestas; no se modifica la aplicación.

## Diagnóstico

La dirección visual Escenario puede sostener una experiencia memorable. La fricción
principal está en el ritmo: el visitante obtiene pronto una respuesta bastante completa,
y después atraviesa un recorrido educativo largo para personalizarla y entenderla.
La continuación se presenta como «Ver cómo se calcula, paso a paso», que promete trabajo
de lectura. Conviene prometer un beneficio personal concreto al continuar.

Esto es una hipótesis de producto basada en el recorrido y el código. No se han consultado
datos reales de abandono ni pruebas con usuarios, y no se promete un aumento porcentual
de retención. El éxito principal debería ser completar y comprender un resultado útil;
el tiempo en la página puede bajar aunque la experiencia mejore.

## Evidencia de la versión actual

Revisión en el navegador de `http://localhost:5173/calculadora-fiscal/v2`, sobre el árbol
de trabajo actual, que ya contenía cambios de otras sesiones. Caso de ejemplo:
35.000 € de salario bruto anual, manteniendo los demás valores iniciales; consumo medio
seleccionado al revisar el IVA. No se han introducido datos personales reales.

- El paso 0 pide una intuición y el salario; después revela el porcentaje y el reparto
  completo. El paso 1 vuelve a mostrar el salario, con periodicidad y pagas.
- Hay 10 pasos didácticos y 37 preguntas de repaso. Algunas preguntas contienen varios
  enunciados, clasificaciones u operaciones de ordenación: la carga es superior a 37 clics.
- El botón siguiente llama a `handleBeforeNext`: si el repaso no está corregido o saltado,
  permanece en el paso y desplaza el scroll al cuestionario. Se verificó en el paso 1.
  Los segmentos superiores permiten saltar directamente: dos controles de navegación
  tienen expectativas distintas.
- El paso 5 muestra gastos de trabajo, aportaciones, situación familiar y siete preguntas
  de repaso. Dos de ellas tratan la «joroba del IRPF», aunque su explicación completa
  empieza plegada y el caso probado está fuera del rango de la reducción.
- En el paso 8 aparece una elección entre consumo medio y manual. El formulario completo
  muestra 13 categorías, con importe y porcentaje por categoría; el modo medio ya existe.
- El paso 10 reúne el resultado personal, contexto de recaudación pública y tres preguntas
  más. No recupera la apuesta inicial como cierre personalizado.
- Guardar, compartir y cuenta están visibles desde la primera pregunta. Ya existe
  autoguardado local; «retomar» sería hacer visible una capacidad existente.
- `src/main.tsx` monta Vercel Analytics, pero en el código revisado no se encontraron
  eventos del embudo. El envío del cuestionario mide respuestas y claridad, no el recorrido.

Medidas orientativas del DOM renderizado, con desplegables cerrados. Son longitud de
página, no tiempos de lectura ni mediciones de abandono; cambian con ancho, respuestas,
fuentes y estado de los paneles.

| Paso | Vista | Altura total | Altura del repaso | Preguntas |
| --- | --- | ---: | ---: | ---: |
| 1, Base real | 523 × 532 px | 3.623 px | 2.268 px | 3 |
| 3, Cotizaciones | 523 × 532 px | 8.620 px | 3.264 px | 4 |
| 5, Base liquidable | 523 × 532 px | 14.639 px | 5.514 px | 7 |
| 8, IVA | 523 × 532 px | 7.915 px | 2.402 px | 3 |
| 9, Vivienda y coche | 523 × 532 px | 5.417 px | 2.421 px | 3 |
| 10, Resumen | 390 × 844 px | 8.221 px | 2.447 px | 3 |

La comparación completa en escritorio no se cerró por problemas de respuesta del
navegador. Se restauró el tamaño habitual al terminar. Las medidas de esta tabla no
proceden de la auditoría de septiembre: se tomaron en esta revisión.

## Propuesta de experiencia

**Apuesta → aproximación inicial → personalización breve → ticket fiscal → exploración.**

Mantener la recompensa temprana. Presentarla claramente como aproximación y ofrecer
«Ajustar a mi caso» con una explicación breve de qué falta: comunidad, situación personal,
consumo y patrimonio. El recorrido largo se conserva como opción educativa. No ocultar
artificialmente un resultado ya disponible para obligar a continuar.

Agrupar el viaje principal en cuatro capítulos con nombres cotidianos: «Tu trabajo»,
«Tu situación», «Lo que compras» y «Tu resultado». La simplificación debe reducir trabajo
real, no limitarse a cambiar el contador. Los detalles de bases, tramos y normativa
siguen accesibles desde cada resultado.

## Cambios, por prioridad

### 1. Repaso voluntario, sin peaje para avanzar

«Siguiente» debe continuar. Mostrar como invitación secundaria «¿Probamos tu intuición?».
En el recorrido breve, ofrecer una sola pregunta relevante en momentos elegidos; mantener
el banco completo en el modo educativo. Corregir al responder, con explicación amable,
sin un botón adicional de corrección por apartado.

Ejemplo: «Si subes de tramo, ¿tributa todo tu sueldo al nuevo porcentaje?» antes de
una animación de los escalones. Mostrar las preguntas sobre la reducción del trabajo
después de abrir su explicación o dentro de esa exploración. No pedir memorizar una
cifra normativa para poder terminar el cálculo.

### 2. Convertir el paso 5 en un selector de lo que aplica

Una entrada breve: «Marca lo que quieres revisar». Opciones agrupadas por familia,
gastos de trabajo y aportaciones, con «Ninguna de estas» y «No lo sé». Abrir únicamente
los campos elegidos y pedir cada requisito cuando sea necesario para ese cálculo.

Un resumen persistente debe permitir editar las selecciones. No transformar una omisión
en un «No» confirmado: distinguir datos contestados, supuestos iniciales y apartados
pendientes. La personalización tiene que conservar todos los requisitos del motor.

### 3. Una pantalla, una acción principal y un descubrimiento

Orden: pregunta o resultado personal → interacción → explicación breve → detalle opcional.
Reducir cabeceras repetidas y separar lo esencial de ampliaciones accesibles. No convertir
cada campo en una pantalla: aumentaría los clics y penalizaría a quien sabe sus datos.

Ejemplos de títulos propuestos: «Lo que cuesta contratarte», «Qué cambia tu IRPF»,
«El impuesto que va dentro del precio». El término técnico aparece junto al resultado
o al abrir «Cómo se calcula», para mantener la función didáctica.

### 4. Un ticket fiscal que se construye durante el viaje

Usar las 100 casillas existentes como hilo conductor. Añadir una línea del ticket por
capítulo: coste del puesto, cotizaciones, IRPF, consumo y patrimonio recurrente. Resaltar
la cifra que acaba de cambiar y explicar la causa en una frase.

En móvil, una franja compacta desplegable; en escritorio, un lateral si cabe. Reutilizar
tokens `--fiscal-*` y piezas de Escenario. Mantener estable el denominador de cada 100 €
(coste laboral) y diferenciar neto de nómina de disponible después de impuestos al consumo.
Los pagos únicos de compra siguen separados del total anual recurrente.

### 5. Dar al IVA un modo breve de verdad

El consumo medio ya está implementado: convertirlo en una vista resumida con la fuente,
el carácter estimado y «Ajustar mis gastos». El visitante puede continuar sin atravesar
las 13 filas. Quien elija personalizar ve un campo principal en euros; el porcentaje
se calcula y se muestra como información secundaria.

La invitación a abrir la app bancaria queda para quien busque mayor precisión. Si se
proponen nuevos perfiles de gasto, documentar su procedencia o rotularlos como ejemplos
ilustrativos; no presentarlos como medias oficiales. Mantener visibles el ahorro y la
parte aún no distribuida para no tratar todo el neto como consumo.

### 6. Botones que anuncien la siguiente recompensa

Sustituir etiquetas técnicas aisladas por invitaciones concretas: «Ver cuánto añade tu
empresa», «Ajustar mi IRPF», «Descubrir los impuestos de mis compras», «Ver mi ticket».
El avance sigue siendo explícito; sin navegación automática al mover un deslizador.

La barra de progreso se basa en capítulos completados y datos realmente revisados.
No marcar como hechos todos los pasos anteriores solo por saltar al resumen. Mostrar
«Te queda consumo y resultado» es más honesto que un porcentaje arbitrario o un tiempo
de finalización sin pruebas previas.

### 7. Un cierre que resuelva la curiosidad inicial

Arriba del resultado: «Tu ticket fiscal», comparación con la apuesta inicial y dos o
tres descubrimientos concretos sobre el caso. Diferenciar la aproximación de entrada
del cálculo actualizado: una variación por nuevos datos no es un error de intuición.

Acciones junto al resultado: guardar, descargar imagen y compartir. Compartir solo el
porcentaje por defecto; incluir salario o escenario completo debe ser una elección
explícita. La recaudación pública queda como invitación «¿Qué financia cada parte?» tras
el cierre personal, conservando fuentes y limitaciones. El paso final debe sentirse acabado.

### 8. Un pequeño laboratorio después del ticket

Proponer «¿Qué pasa si gano 1.000 € más al año?», con comparación antes/después calculada
por el mismo motor, manteniendo el ejercicio y los demás supuestos. Mostrar cuánto
crecen el coste de empresa y el neto por separado. Mantener un botón para volver al caso
original; no sobrescribirlo silenciosamente.

Antes de usar editorialmente este nuevo escenario, documentar la coherencia de entradas
y transformaciones conforme a AGENTS.md. El juego nace de descubrir una consecuencia,
no de puntos, rachas o rankings de quién paga más impuestos.

### 9. Recuperar a quien se interrumpe

Al volver: «Tu cálculo está guardado en este dispositivo. ¿Seguimos por consumo?».
Ofrecer continuar y empezar otro caso. No exigir cuenta para el cierre, porque el cálculo
y el autoguardado ya son locales. Concentrar guardar, compartir y cuenta en el momento
en que hay un resultado que merece conservarse.

## Cómo comprobar la mejora

Medir por versión y dispositivo: inicio, aproximación vista, personalización iniciada,
capítulo visto/completado, resultado personal visible y guardado/compartido solicitado.
Contar una exposición real del resultado, no solo montar el paso 10 ni pulsar su segmento.

Indicador principal: resultados personalizados vistos / personalizaciones iniciadas.
Medir también aproximaciones vistas / visitas para no perder la recompensa temprana,
y separar completar la calculadora de terminar el modo educativo. Contrastar navegación
normal con saltos directos, supuestos pendientes y retomadas. Registrar únicamente eventos
de navegación y categorías operativas; no salario, situación familiar, importes, respuestas
personales ni enlaces de escenario. La eventual instrumentación necesita su propio diseño.

Probar primero cambios pequeños por separado: repaso sin bloqueo; selector del paso 5;
resumen breve del IVA. Después experimentar con el ticket y los cuatro capítulos. En
una revisión cualitativa, observar dónde una persona duda o cambia de tarea y preguntar
al final si distingue bruto, neto y coste de empresa. No optimizar solo el tiempo de estancia.

## Siguiente decisión

Empezar por repaso voluntario, filtro de relevancia del paso 5 y cierre con ticket.
Son propuestas pendientes de selección e implementación. Antes de integrar nuevos
componentes públicos, incorporarlos a `/componentes` con estados y variantes, conservar
el lenguaje de Escenario y verificar móvil, teclado y movimiento reducido.

Referencias locales: `FiscalWorkerDashboard.tsx`, `WorkerFiscalStepsCard.tsx`,
`WorkerFiscalSummaryCard.tsx`, `WorkerKnowledgeCheckCard.tsx`,
`workerKnowledgeCheckQuestions.ts`, `Irpf2025StructuredAdjustmentsForm.tsx`,
`WorkerConsumptionTaxesCard.tsx`, `WorkerFinalSummaryCard.tsx`, `knowledgeCheckReporting.ts`
y `src/main.tsx`. Las observaciones se basan en estos archivos y en la interfaz revisada.
