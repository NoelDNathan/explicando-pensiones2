# Estado actual

Fecha: 2026-09-26

Este archivo es **estado, no diario**: que es hoy el proyecto, que queda pendiente y como se
trabaja. El detalle de cada sesion vive en `ai/history/`, una nota por sesion y por fecha.
Al terminar una sesion se escribe su nota ahi y se **actualiza** lo que haga falta de aqui,
sin anteponer parrafos nuevos. El changelog anterior esta en
`ai/history/2026-09-02-archivo-changelog-current.md`.

## Que hay construido

Aplicacion React + TypeScript + Vite, sin backend. Rutas en `src/App.tsx`:

| Ruta | Estado |
| --- | --- |
| `/calculadora-fiscal` | La pieza principal. Recorrido de 13 pasos sobre datasets trazables. |
| `/poblacion` | Piramide poblacional observada 1975-2025 y modelizada 2026-2070. |
| `/gasto-sanitario` | Perfil de gasto sanitario por edad y sexo. |
| `/resumen` | **Prototipo.** Los datos estan escritos a mano en el componente. |
| `/irpf`, `/bases-cotizacion`, `/reduccion-trabajo`, `/salario-nacionalidad` | Piezas didacticas sueltas, sin integrar editorialmente. |
| `/cuenta` | Ya no es pagina: entrar y salir esta en el menu de la calculadora. No sincroniza datos todavia. |
| `/privacidad` | Terminos de uso y politica de privacidad. Publica tambien en produccion (`/terminos` apunta a lo mismo). |
| `/componentes` | Laboratorio interno de componentes. |

### Calculadora fiscal

Paso 0 de entrada mas 13 pasos: base real, limites de cotizacion, cotizaciones sociales,
retribucion en especie, base liquidable, IRPF por tramos, deducciones de cuota, IVA y consumo
diario, vivienda y coche, resumen del calculo (paso 10, con el permiso opcional de
estadisticas), comprueba lo aprendido, preguntas frecuentes y
fuentes del calculo.

- Ejercicios conectados: **2025** y **2005** (rama legacy). `TaxYear` solo admite esos dos,
  aunque en `data/` hay paquetes de parametros de 2015 y 2018-2024 listos.
- Comunidades: las 15 de regimen comun para el IRPF autonomico; sin deducciones autonomicas
  automaticas.
- El paso 0 empieza con una pregunta obligatoria: «De cada 100 € que cuesta tu trabajo, ¿cuántos
  crees que acaban en Hacienda y la Seguridad Social?» (deslizador 0-70 €), luego el salario y
  después la comparación con el cálculo. La respuesta se guarda en `fwd-tax-guess-v1`, fuera del
  escenario, para que no viaje en los enlaces compartidos.
- Todo se calcula en el navegador y se guarda en `localStorage`; no hay backend.
- El estado completo vive en `fiscalScenario.ts` (tipo `FiscalScenario`, con version, serializado
  y validacion defensiva) y se autoguarda con retardo en `fwd-fiscal-scenario-v1`. Al recargar se
  recupera todo: salario y periodicidad tal y como se escribieron, comunidad, situacion familiar,
  ajustes, borradores de consumo y patrimonio, y el paso en el que se estaba. El escenario se lee
  de forma **sincrona antes del primer render**, porque las tarjetas leen sus props `initial*` solo
  al montarse. Un escenario intacto no se guarda; uno corrupto degrada a los valores de inicio.
- «Guardar» abre un panel para descargar una copia en JSON o volver a abrir una guardada;
  «Compartir» copia un enlace con el escenario en el **fragmento** de la URL (`#escenario=...`),
  que no viaja al servidor ni aparece en `Referer` ni en los registros de acceso. Abrir un enlace
  compartido muestra ese caso y avisa de que es ajeno: **no pisa lo que el visitante tuviera
  guardado** hasta que cambie algo. Compartir advierte de que quien reciba el enlace vera el
  salario, la comunidad y la situacion familiar.
- El paso 13 lee las fuentes de los propios datasets (`fiscalSourceRefs.ts`), no de constantes.
- El simulador de la reduccion del paso 5 muestra una cajita *bruto − especie =
  lo que tributa*. El slider sigue siendo el salario de nomina; la Seguridad Social
  cotiza sobre ese bruto y el IRPF usa el resto.
- El paso 6 define el IRPF (Impuesto sobre la Renta de las Personas Físicas) antes de
  explicar escalas y tramos. Tipo marginal y tipo efectivo van como definiciones, no
  como un parrafo suelto.
- El paso 7 explica la deduccion como resta de la cuota (con ejemplo 3.000 € − 200 €), no
  como lista de partidas. Ya no hay recuadro lateral «No aparece en la nómina». No pide
  retenciones ni pagos a cuenta: la cadena es «cuota − ordinarias − reembolsables = IRPF
  del año», y solo pasa a «A devolver» si las reembolsables superan la cuota. Las preguntas
  llevan el requisito dentro y el «Sí» lo da por cumplido, sin chips de acreditacion aparte:
  donativos y alquiler se resuelven con pregunta e importe. El tope de las reembolsables sale
  de lo cotizado en el paso 3, no de una pregunta, y tampoco se pregunta por el abono
  anticipado ya cobrado. Sin las de 2023-2024 no se acredita la
  recurrencia de donativos: todo lo que pasa de 250 € va al 40 %, y la vivienda usa solo el
  7,5 % autonomico general.
- El paso 8 define el IVA (Impuesto sobre el Valor Añadido) y los impuestos especiales
  antes de pedir el reparto del gasto; el subtítulo es «El impuesto sobre lo que compras».

### Rediseño visual de la calculadora (en curso)

Fase 1 (auditoría) hecha en `ai/rediseno-calculadora/01-auditoria.md`: medidas por paso,
problemas por impacto y 27 textos redundantes candidatos (T1-T27). **No se ha borrado
ningún texto**: cada eliminación necesita aprobación explícita. El rediseño no cambia
el flujo, las preguntas, los cálculos ni el contenido educativo. Siguiente: tokens de
tipografía, espaciado y movimiento, y piloto en los pasos 0 y 5.

Propuestas visuales en un lienzo privado (https://claude.ai/artifact/WAvcAeqfPNxihpQbAxkMxo),
con el paso 3 completo como muestra: A Editorial, B Enfoque, C Nómina viva, D Escenario
(oscuro y animado), E Imprenta (risografía) y F Flujo (neobrutalista con diagrama de flujo),
cada una en escritorio y móvil. D es la favorita; D2 es una variante suya (gráfico de
mariposa trabajador/empresa, anillo AT/EP y resumen en cascada), junto a D en el lienzo. E y F usan paletas nuevas que no
existen como tokens: si se eligen, habrá que crear sus `--fiscal-*` antes de implementarlas.
**Elegida la dirección D (Escenario)** el 2026-09-26. La skill del proyecto
`.claude/skills/diseno-escenario/` recoge su lenguaje (tokens de escenario, tipografía,
movimiento y patrones) para aplicarlo paso a paso.
**v2 en `/calculadora-fiscal/v2`** (2026-09-26): la misma calculadora con el diseño D;
`/calculadora-fiscal` sigue siendo la v1 para comparar (comparten el escenario guardado).
- Contexto `fiscalVariant.ts`: cada componente sabe si pinta la v1 (`clasica`) o la v2 (`escenario`).
- Piezas de D en `worker-salary-dashboard/escenario/` (título display, barrido, cinta, 100 casillas,
  filas de carrera, escalera, aguja, ecuación, cifras que cuentan, interruptor segmentado).
- **Todos los pasos:** barra de progreso con 12 segmentos, título a todo el ancho, textos sin
  tarjeta, nómina en panel y navegación en píldoras con el nombre del paso.
- **Piezas comunes de D:** el primer párrafo de cada paso queda alineado a la izquierda; la
  nómina de los pasos 1-6 y 8-9 ya se muestra en panel oscuro con las mismas cifras en vivo y
  resaltados por paso. `EscQuestion` y `EscChapter` están preparados y documentados en
  `/componentes` para los pasos 5, 7 y 9; su integración llegará con el rediseño de esos pasos.
- **Paso 3 completo como la maqueta D** (consola, casillas + párrafo en vivo, trabajador/empresa
  con barras desplegables, paneles MEI y AT/EP, resumen en ecuación).
- **Pasos 0-2:** completos en D: las dos preguntas y el resultado con duelo y 100 casillas; el
  reparto en 12/14 pagas y complementos; y el pasillo entre bases mínima y máxima. Sus estados
  siguen conectados a los cálculos existentes y las tres piezas se pueden revisar en `/componentes`.
- **Pendiente:** el cuerpo interactivo de los pasos 4-12 sigue siendo el de la v1 en oscuro.
  Siguiente: darle su protagonista de D paso a paso, empezando por los pasos 4 y 5.
- **Maquetas D de todas las pantallas** (2026-09-26) en el lienzo privado
  (https://claude.ai/artifact/WAvcAeqfPNxihpQbAxkMxo, fila «D en todas las pantallas»): paso 0
  (pregunta y resultado), 1, 2 y 4-12, escritorio, con todo el texto de la v1. Pendiente de que
  la persona usuaria las revise antes de implementarlas en la v2.
- **Aprobadas con ajustes.** Copias en `ai/rediseno-calculadora/maquetas-d/` (visor:
  `python -m http.server 8765 --directory ai/rediseno-calculadora/maquetas-d` →
  `preview.html?f=Paso05.dc.html`). Plan de implementación en
  `ai/rediseno-calculadora/02-plan-v2-escenario.md`; lo ejecuta Codex.

### Base de datos (Supabase)

**Desplegado** en el proyecto `explicando-pensiones` (region `eu-west-1`, Irlanda), con las 10
migraciones y el seed aplicados: 7 tablas en `public`, 10 en `intake`, todas con RLS. La
aplicacion ya se conecta para **entrar y salir** (`/cuenta`); todavia no sube ni sincroniza
ningun dato de la calculadora.

- 10 migraciones en `supabase/migrations/`, mas `config.toml`, `seed.sql` y las Edge Functions
  `knowledge-check` y `fiscal-stats`.
- Dos mundos separados **por construccion**, no por permisos: el esquema `public` guarda lo
  identificado (perfil, sobres de clave, escenarios cifrados, suscripciones) y el esquema
  `intake` la ingesta anonima. Ninguna tabla de `intake` tiene FK a `auth.users`, y `intake`
  no entra en `db.schemas` de PostgREST, asi que no es alcanzable con la anon key.
- Los escenarios se cifran en el navegador (AES-256-GCM con clave derivada por HKDF de una DEK
  que se envuelve con una frase via Argon2id). El servidor solo ve el tamanyo y las fechas.
- Las cifras estadisticas van bucketizadas: nunca un salario exacto ni un importe en euros,
  solo tasas efectivas con un decimal. La vista de publicacion exige k >= 25.
- Los parametros fiscales **no** se mueven a la base de datos: siguen en `data/processed/` bajo
  el regimen de checksums y fichas, que es lo que los hace auditables.

Hecho ya: el esquema, el despliegue, el tipo `FiscalScenario` con autoguardado local y la
entrada por enlace magico. La base legal visible esta en `/privacidad`. Falta aun un correo de contacto del responsable, la boveda de claves
(Argon2id + DEK envuelta), el repositorio de escenarios cifrados, y desplegar las Edge
Functions de ingesta anonima. El plan por fases esta en las notas de sesion del 2026-09-09.

Pendiente de configurar a mano en el panel de Supabase: la lista de redirecciones permitidas
(Authentication > URL Configuration) con la URL de desarrollo y la de produccion, y un SMTP
propio, porque el correo integrado de Supabase solo envia a miembros del proyecto y con un
limite muy bajo.

### Datos

`data/` separa `raw/` (204 archivos de evidencia, sin editar), `processed/` (102 datasets),
`methodology/` (27 notas) y las tres fichas de trazabilidad: `sources.md`, `metadata.md` e
`inventory.md`. Los 306 archivos de `raw/` y `processed/` tienen su SHA-256 registrado.

## Como se verifica

```bash
pnpm run build            # tsc -b + vite build
pnpm run lint             # arrastra 24 errores previos en ficheros no tocados
pnpm run verify:irpf2025  # 34 comprobaciones del motor de IRPF contra casos dorados
pnpm run verify:data      # 469 comprobaciones de trazabilidad de data/
pnpm run verify:scenario  # 17 comprobaciones del escenario guardado y del enlace compartido
pnpm run verify:supabase  # 15 comprobaciones del esquema de la base de datos
pnpm run verify:styles    # calculadora: solo var(--fiscal-*); resto: ningun color literal nuevo
pnpm run seed:quiz        # regenera la lista blanca de preguntas en supabase/seed.sql
```

`verify:supabase` levanta un cluster de PostgreSQL desechable en un directorio temporal,
aplica las 10 migraciones y el seed, y comprueba el comportamiento: aislamiento por RLS entre
dos usuarios, k-anonimato de la vista de publicacion, rechazo de un salario exacto disfrazado
de banda, limite de peticiones, cuota de escenarios y rotacion de la frase de cifrado. No
necesita Docker ni la CLI de Supabase, solo los binarios de PostgreSQL; usa el puerto 55433,
configurable con `EPS_VERIFY_PGPORT`. Con `--keep` deja el cluster en marcha para inspeccionarlo.

`verify:styles` NO prohibe los colores literales (el repo ya tiene ~2.550), sino que fija una
linea base por archivo en `scripts/styles-baseline.json` y falla cuando un archivo gana colores
escritos a mano o aparece uno nuevo con ellos. Existe porque las reglas 1 y 7 de `AGENTS.md`
(usar tokens, comprobar en pantalla) se pueden incumplir sin que nada avise: asi paso una
pantalla entera en azul marino sobre una web clara. Con `--write` se regenera la linea base;
bajarla siempre esta bien, subirla hay que justificarlo.

En la calculadora fiscal (`worker-salary-dashboard/*.css`, `FiscalWorkerDashboard.css`,
`WorkIncomeReductionExplainer.css` y los TS/TSX de esas carpetas) no hay linea base: falla con
cualquier color a mano o con nombre, token de otra paleta (`--color-*`, `--fwd-*`, `:root`),
regla `.fwd--soft` fuera de `FiscalSoftTheme.css` o clase de color de Tailwind. En
`FiscalSoftTheme.css` los literales solo se admiten dentro del bloque de tokens.

`verify:data` valida el SHA-256 de todos los archivos de datos, detecta entradas huerfanas,
exige ficha en `metadata.md` y avisa de lo que falta en `inventory.md` y `sources.md`. Con
`--write` regenera `data/checksums.sha256`. Los archivos de datos se guardan y se hashean en
LF; `.gitattributes` impide que git reescriba sus bytes al hacer checkout.

## Pendiente

### Calculadora fiscal · paso 13, fuentes del calculo

- Completar el paso 13, que documenta 5 bloques de un recorrido de 13 pasos. Sin ninguna
  fuente: paso 4 (topes de exencion de la retribucion en especie, LIRPF art. 42 y Reglamento
  art. 43-46), paso 8 (impuestos especiales, Ley 38/1992), paso 9 (IBI e IVTM del TRLHL,
  ITP/AJD y matriculacion) y el bloque de recaudacion 2024 del paso 10, que si tiene
  metodologia en `data/`. Se muestran agregados y merecen entrada propia: MEI, cotizacion de
  solidaridad, los 2.000 € del art. 19.2.f y la deduccion por rentas del trabajo bajas; las
  deducciones de cuota aparecen como un total sin desglose ni enlace por deduccion.
- Otras mejoras, por orden: cambiar el badge binario Oficial/Estimacion por los estados del
  proyecto (el MEI 2026-2050 no es ninguno de los dos, es proyectado); citar el archivo de
  `data/processed` y su fecha de descarga junto al enlace normativo, que es lo que cierra la
  cadena con `verify:data`; anclar cada bloque a su paso con enlace de vuelta, como hace el
  paso 11; quitar `DEMO_ITEMS` del valor por defecto de `WorkerCalculationSourcesCard` (dos
  fuentes inventadas que viajan en el bundle y se renderizan tal cual en `/componentes`); y
  hacer el paso copiable o imprimible como justificante.
- Antes de mostrar `scope.excluded` y `data_gaps_before_ui_use` de los paquetes fiscales en la
  interfaz, corregirlos: el de 2025 sigue diciendo que quedan fuera los impuestos especiales,
  los tributos locales y la cotizacion AT/EP por CNAE, y la calculadora ya tiene los tres.

### Calculadora fiscal · cobertura por anos

- Extender por anos usando la matriz de cobertura: ya estan parametrizados parcialmente 2025,
  2024, 2023, 2022, 2021, 2020, 2019, 2018 y 2015 para caso base Madrid. Priorizar 2017, 2016 y
  finalmente 2014. No incorporar 2026 como ejercicio IRPF cerrado hasta que la AEAT publique el
  manual de Renta 2026.
- **2018**: implementar con cuidado la regla transitoria de reduccion por obtencion de
  rendimientos del trabajo antes de tratar el ano como calculo exacto en UI. El JSON documenta
  la regla anterior y la nueva, pero la combinacion transitoria queda como no automatizada.
- **2015**: convertir el indice candidato de Hacienda en parametros calculables comunidad por
  comunidad, verificando vigencia 2015 antes de transcribir importes. Madrid ya esta
  parametrizada; Andalucia requiere otra fuente porque la escala localizada indica efectos
  desde 2016. Sigue pendiente el algoritmo oficial AEAT de retenciones 2015 si se muestra
  nomina mensual, y decidir si las deducciones autonomicas 2015 van como catalogo o como reglas.
- **2005**: revisar visualmente la rama legacy y decidir si se incorporan retenciones AEAT 2005,
  deducciones autonomicas calculables o tarifa AT/EP por actividad. El caso base Madrid usa el
  paquete BOE 2005 y no pasa por el algoritmo moderno de minimos gravados por escala.

### Calculadora fiscal · calculo

- Deducciones autonomicas automaticas 2025: crear reglas por deduccion concreta, empezando por
  Madrid o por las familias prioritarias, con campos de usuario adicionales
  (nacimientos/adopciones del ejercicio, alquiler, familia numerosa/monoparental, guarderia,
  dependencia, discapacidad, limites de base individual/familiar e incompatibilidades).
- Valorar si el IVA medio pasa de grupos COICOP a 2 digitos a microdatos o codigos a 5 digitos
  de INE EPF. La version actual usa EPF 2024 como proxy 2025 y asigna tipos aproximados por
  grupo, asi que debe mostrarse como estimacion de contexto.
- Si se quiere una media de `otros_impuestos` en lugar de entrada manual, definir y justificar
  denominador y componentes. La version actual conserva fuente AEAT agregada 2025 y no la divide
  por hogares/adultos/trabajadores por sesgo de atribucion.

### Trazabilidad de datos

- Al incorporar o reprocesar una serie: actualizar `sources.md`, `metadata.md` e `inventory.md`,
  regenerar los hashes con `node scripts/verify-data-traceability.mjs --write` y dejar
  `pnpm run verify:data` en verde. La ficha en `metadata.md` es obligatoria y el verificador
  falla sin ella.
- Cerrar la cadena de custodia de las 58 capturas HTML de AEAT y BOE (IRPF 2018-2024,
  recaudacion 2025, cotizaciones 2005 y 2018-2024, IRPF 2005): sus hashes se re-basaron el
  2026-09-02 sobre el archivo del repositorio porque el registrado no correspondia a ningun byte
  del archivo guardado. Para provenance desde la descarga hay que volver a descargar cada
  pagina, comparar el contenido normativo y registrar la descarga nueva, teniendo en cuenta que
  los textos consolidados del BOE cambian con modificaciones posteriores.
- Citar por nombre al menos un archivo bruto en `sources.md` para las 15 carpetas documentadas
  solo a nivel de grupo (`aeat/irpf-2018` a `irpf-2023`, `aeat/recaudacion-tributaria-2025`,
  `boe/cotizaciones-2018` y `2019`, `ine/epf/iva-2025-proxy`,
  `ine/proyecciones-poblacion/poblacion-nacimiento-modelo`,
  `inebase-historia/pensiones-contributivas`, y las tres de `mites/`). `verify:data` las lista
  como aviso.
- Mantener etiquetado el desglose sanitario por categorias como `estimado`: combina AIReF/INE
  2022, pesos EGSP 2022 y perfiles relativos IGTGS 2005, no una tabla oficial categoria x edad.

### Paginas y contenido editorial

- **`/resumen`**: conectar a datasets procesados trazables y reemplazar los valores de prototipo
  de indicadores, grafico historico, comparador e impactos por series documentadas antes de uso
  editorial publico. Hoy `HISTORY_SERIES`, `comparisonPoints`, `winnersLosers` y los KPI estan
  escritos a mano en el componente, con la serie de gasto/PIB dando 17,1 % en 2070 frente al
  rango 14,7-16,7 % de los tres escenarios AIReF que ya estan procesados en `data/`.
- **`/irpf`**: antes de integrarlo editorialmente, documentar fuente normativa, ejercicio
  aplicable y metadata de los tramos usados. Hoy es didactico/prototipo y no debe presentarse
  como calculo fiscal oficial cerrado.
- **`/bases-cotizacion`**: antes de integrarlo, documentar fuente oficial y metadata completa de
  las bases de cotizacion 2026; no tratar los valores del brief como dataset trazable.
- Decidir como visualizar el CSV maestro fiscal 1975-2070 y como diferenciar en la interfaz las
  filas `observado`, `proyectado`, `escenario`, `estimado` y `no_estimado`. PIB, gasto publico
  total, intereses y saldo publico 2025-2070 son escenario derivado, no dato oficial tabulado.
- Definir como diferenciar visualmente observado y proyeccion en los graficos, y decidir que
  series demograficas se conectan primero a la web.
- Decidir como mostrar la inflacion (grafico mensual, medias anuales o ambas), las previsiones
  de deuda (ultima vigente, abanico historico o comparacion entre organismos) y las previsiones
  de pensiones (escenario AIReF principal, comparativa con el Informe de Envejecimiento 2024 o
  ambas).
- Elegir las siguientes metricas a construir: numero de pensionistas, pension media, ratio
  afiliados/pensionista, deficit o transferencias del Estado.
- Documentar en la narrativa que afiliacion media no equivale a personas unicas, porque mide
  afiliaciones en alta laboral.
- Revisar el diseno de pruebas en Figma y decidir si se convierte en base de implementacion web.

### Revision visual pendiente

Ya hay panel de navegador disponible en las sesiones, asi que estas revisiones dejan de estar
bloqueadas. Falta revisar en escritorio y movil: `/calculadora-fiscal` (incluida la rama legacy
de 2005), `/poblacion` (y su capa modelizada 2026-2070), `/gasto-sanitario`, `/bases-cotizacion`
y `/resumen` tras la extraccion de `DashboardSidebar`.

### Series de datos por localizar o decidir

- **Seguridad Social 1991-1994**: localizar la fuente primaria indicada por el PDF FIPROS
  (Anuario de Estadisticas Laborales o liquidaciones historicas CSS). El Observatorio Social de
  Espana 2007 confirma 1990 y resuelve 2002. Hasta localizarla, mantener solo
  `cotizaciones_sociales` y `transferencias_corrientes` como candidatos pendientes de fuente
  primaria; no usar `total_neto_consolidado`, `otros_ingresos` ni porcentajes sobre total.
- **Pensiones contributivas 1975-1979**: las rutas MITES de Anuarios dan 404. Hay PDFs
  candidatos, sobre todo INEbase Historia 1976-1979. Primera inspeccion: 1979 suma 3.947.153
  pensiones como candidato visual, pero 1976-1978 requieren doble transcripcion por celdas
  agrarias no cerradas. No interpolar ni sustituir por personas pensionistas.
- **Personas pensionistas 1975-2005**: exportacion manual desde eSTADISS documentando el CSV
  bruto; no usar numero de pensiones como sustituto.
- **Carreras de cotizacion al jubilarse**: vias abiertas son la Base de Datos de Prestaciones o
  sala segura para 1996-2012, microdatos MCVL autorizados (sobre todo 2004-2012) y exportacion
  manual de eSTADISS para 2022-2026. El dataset publico actual es distribucion porcentual por
  tramos, no dias cotizados ni media exacta. 2015 sigue sin tabla publica localizada.
- **Tasa de reemplazo historica**: decidir antes el nivel de fidelidad (exacta con MCVL desde
  2004; aproximada con altas iniciales y salario INE por edad desde 1995/2004/2006; o proxy
  larga 1975-hoy con salario medio macro, etiquetada como no equivalente a salario final medio).
- **Gasto publico por funciones**: localizar y procesar una fuente COFOG/IGAE/Eurostat que
  separe pensiones, intereses, sanidad y educacion con trazabilidad anual. Procesar el XLSX
  COFOG de IGAE a CSV largo de divisiones de primer nivel y validar totales. Decidir si se usa
  la aproximacion COFOG `10.2 + 10.3` o una serie presupuestaria estricta de Seguridad Social.
- **Pensiones antes de 1995**: buscar una fuente que las separe de otras prestaciones sociales;
  si no existe, explicar la discontinuidad. BDMACRO no vale como sustituto de pensiones puras
  antes de 1995. Si se muestra ese tramo, hacerlo como contexto separado con ruptura explicita.
- **Deuda publica**: conciliar o explicar el enlace entre BDMACRO 1975-1995 y Eurostat
  1995-2025 antes de mostrar una serie continua; revisar periodicamente Eurostat por revisiones,
  sobre todo el dato de 2025. Para una curva anual 2030-2070, buscar datos tabulares de AIReF o
  digitalizar la fuente con metodologia documentada; no interpolar.
- **Salario medio**: decidir si se usa BDMACRO como contexto de largo plazo o una encuesta
  salarial mas estricta con menos anos. No usar 2025-2070 como salario proyectado sin fuente
  oficial o metodologia documentada. Para paises concretos de salario de inmigrantes, revisar
  microdatos de la Encuesta Cuatrienal de Estructura Salarial 2022 o pedir explotacion al INE:
  las tablas agregadas solo dan grandes areas de nacionalidad.
- **Trabajadores/cotizantes futuros**: no inventar ni interpolar. Existe la proyeccion INE de
  poblacion por edad como proxy demografico separado; si se necesita empleo proyectado,
  localizar fuente institucional o documentar claramente la proxy.
- **Demografia**: usar la tasa bruta de natalidad solo con `estado_dato` (observado 1975-2024,
  proyectado 2025-2070); para edad media al primer hijo despues de 2024 hace falta fuente
  adicional o metodologia propia; para inmigracion antes de 2002, extraer anclas censales 1981 y
  1991 documentando la interpolacion como estimada; para 2026-2070 por lugar de nacimiento no
  hay tabla cruzada nacimiento + sexo + edad, usar 36642 y 36643 solo por separado. Diferenciar
  nacidos en Espana y fuera solo en el tramo observado con la tabla 56937.
- **Edad de jubilacion**: para una edad efectiva antes de 1980, localizar una fuente anual
  comparable de altas iniciales o reconstruirla desde tablas oficiales; no rellenar 1975-1979
  con el `effective labour market exit age` de la OCDE, que mide otra cosa. Si se usa el JSON de
  edad minima legal para calculos, decidir si el tramo anterior a 1976 se presenta como
  referencia general o se busca fuente juridica primaria por regimen.
- **Sanidad**: para separar urgencias, salud mental o cuidados de larga duracion, localizar una
  fuente institucional especifica y compatible por edad antes de incorporarlas.
- Decidir si la web muestra solo ambos sexos o tambien la brecha hombres/mujeres en esperanza
  de vida.

### Frontend e infraestructura

- Vercel Web Analytics esta montado en `src/main.tsx` con `@vercel/analytics/react`
  (Vite, no Next). Hay que tenerlo activado en el panel del proyecto de Vercel.
- Al reorganizar componentes: separar los reutilizables, mantener tokens compartidos y evitar
  estilos duplicados en paginas finales.
- **CSS de la calculadora fiscal** (migrado el 2026-09-25): cada tarjeta usa `var(--fiscal-*)`
  directamente y `FiscalSoftTheme.css` solo define tokens (mas la adaptacion del `SalarySlider`
  compartido). Pendiente menor: en `/componentes`, a ~1100 px, el selector Anual/Mensual del
  paso 3 se monta sobre el chip de AT/EP (ya pasaba antes). `Donut.tsx` y `FiscalLineChart.tsx`
  no se usan en ninguna parte; se podrian borrar.
- Extraer `PlayButton` a un modulo propio cuando se incorporen mas componentes y decidir la
  estructura definitiva de `src/components/`.
- Ampliar `/componentes` con tarjetas de indicadores, etiquetas de fuente, avisos metodologicos
  y controles de grafico. Integrar `InfoButton` en cabeceras de graficos como la piramide cuando
  se definan los textos metodologicos finales.
- Valorar si se compactan los CSV de poblacion para reducir el bundle de `/poblacion`.

## Nota operativa

Git esta configurado con remoto `origin`. Cuando el entorno marque el repositorio como
propiedad dudosa, se usa
`git -c safe.directory="C:/Users/Noel Nathan/Programacion/Projectos/explicando-pensiones2"`
para inspeccionar, commitear y publicar.
