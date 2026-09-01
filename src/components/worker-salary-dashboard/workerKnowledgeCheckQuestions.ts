/*
 * Banco de preguntas del paso «Comprueba lo aprendido».
 *
 * Reglas del cuestionario:
 * - Ninguna pregunta se responde escribiendo: todo es clic, seleccion, orden,
 *   emparejado, clasificacion o deslizador.
 * - Cada apartado apunta al paso del recorrido que lo explica (`stepId`), para
 *   poder volver a repasarlo desde la correccion.
 * - Los datos numericos salen de los mismos parametros que usa el motor 2025
 *   (Orden PJC/178/2025 para cotizacion, AEAT para IRPF e IVA).
 */

export type KnowledgeChoice = {
  id: string
  label: string
}

export type KnowledgeStatement = {
  id: string
  text: string
  isTrue: boolean
}

export type KnowledgeOrderItem = {
  id: string
  label: string
}

export type KnowledgeMatchPair = {
  id: string
  left: string
  right: string
}

export type KnowledgeClassifyItem = {
  id: string
  label: string
  bucketId: string
}

type KnowledgeQuestionBase = {
  id: string
  prompt: string
  /** Aclaracion breve del enunciado, opcional. */
  hint?: string
  /** Se muestra siempre al corregir, se acierte o no. */
  explanation: string
}

export type KnowledgeQuestion = KnowledgeQuestionBase &
  (
    | { kind: 'single'; choices: KnowledgeChoice[]; correctId: string }
    | { kind: 'multiple'; choices: KnowledgeChoice[]; correctIds: string[] }
    | { kind: 'truefalse'; statements: KnowledgeStatement[] }
    | { kind: 'order'; items: KnowledgeOrderItem[]; correctOrder: string[]; topLabel: string; bottomLabel: string }
    | { kind: 'match'; pairs: KnowledgeMatchPair[]; rightOrder: string[] }
    | { kind: 'classify'; buckets: KnowledgeChoice[]; items: KnowledgeClassifyItem[] }
    | { kind: 'slider'; min: number; max: number; step: number; unit: string; correct: number; tolerance: number }
  )

export type KnowledgeSection = {
  id: string
  /** Paso del recorrido que explica este apartado. */
  stepId: number
  title: string
  subtitle: string
  questions: KnowledgeQuestion[]
}

export const KNOWLEDGE_CHECK_SECTIONS: KnowledgeSection[] = [
  {
    id: 'bruto',
    stepId: 1,
    title: 'El salario bruto',
    subtitle: 'De dónde parte todo el cálculo',
    questions: [
      {
        id: 'bruto-que-incluye',
        kind: 'single',
        prompt: '¿Qué incluye tu salario bruto anual?',
        choices: [
          { id: 'a', label: 'Solo el dinero que te ingresan en la cuenta cada mes' },
          { id: 'b', label: 'Salario fijo, pagas extra, complementos y retribución en especie, antes de descuentos' },
          { id: 'c', label: 'El salario fijo menos las cotizaciones sociales' },
          { id: 'd', label: 'Todo lo anterior más lo que la empresa paga de cotizaciones' },
        ],
        correctId: 'b',
        explanation:
          'El bruto reúne todo lo que la empresa te reconoce como retribución antes de restar cotizaciones e IRPF. Lo que la empresa cotiza por su cuenta no es parte de tu bruto: es coste de empresa y aparece en el paso 10.',
      },
      {
        id: 'bruto-verdadero-falso',
        kind: 'truefalse',
        prompt: 'Verdadero o falso',
        statements: [
          { id: 's1', text: 'Cobrar en 12 o en 14 pagas cambia tu salario bruto anual.', isTrue: false },
          { id: 's2', text: 'Las pagas extra forman parte del bruto anual.', isTrue: true },
          { id: 's3', text: 'Tu bruto mensual (bruto ÷ 12) ya es tu base de cotización.', isTrue: false },
          { id: 's4', text: 'Un seguro médico que paga la empresa forma parte de tu bruto.', isTrue: true },
        ],
        explanation:
          'El número de pagas solo reparte el mismo bruto anual. Y ese bruto todavía no es una base: la de cotización se calcula en el paso 2 y la del IRPF en el paso 5.',
      },
      {
        id: 'bruto-nomina',
        kind: 'single',
        prompt: 'Tu nómina dice 1.750,00 € de «total devengado» y 1.426,24 € de «líquido total». ¿Qué separa las dos cifras?',
        choices: [
          { id: 'a', label: 'Las cotizaciones que paga la empresa por ti' },
          { id: 'b', label: 'Tu cotización a la Seguridad Social más la retención de IRPF' },
          { id: 'c', label: 'El IVA de tus compras del mes' },
          { id: 'd', label: 'Nada: son la misma cifra en dos momentos del mes' },
        ],
        correctId: 'b',
        explanation:
          'Del devengado solo se restan tus descuentos: cotización del trabajador y retención de IRPF. Lo que aporta la empresa no pasa por tu nómina.',
      },
    ],
  },
  {
    id: 'bases',
    stepId: 2,
    title: 'Bases y límites de cotización',
    subtitle: 'El suelo y el techo sobre los que se cotiza',
    questions: [
      {
        id: 'bases-tope-maximo',
        kind: 'single',
        prompt: 'Ganas 70.000 € brutos al año, bastante por encima de la base máxima (4.909,50 € al mes en 2025). ¿Qué pasa con tus cotizaciones ordinarias?',
        choices: [
          { id: 'a', label: 'Cotizas sobre todo tu salario, sin ningún límite' },
          { id: 'b', label: 'Cotizas solo hasta la base máxima: por encima no crecen las cuotas ordinarias' },
          { id: 'c', label: 'Dejas de cotizar y te devuelven lo pagado de más' },
          { id: 'd', label: 'Cotizas el doble por superar el tope' },
        ],
        correctId: 'b',
        explanation:
          'La base máxima actúa de techo. Sobre el exceso solo se aplica la cuota de solidaridad, un porcentaje pequeño y aparte. Como contrapartida, tus prestaciones futuras también quedan limitadas por ese tope.',
      },
      {
        id: 'bases-tope-minimo',
        kind: 'single',
        prompt: 'Ahora al revés: tu salario queda por debajo de la base mínima de tu grupo. ¿Qué ocurre?',
        choices: [
          { id: 'a', label: 'No cotizas hasta que llegues a la base mínima' },
          { id: 'b', label: 'Cotizas por la base mínima: pagas algo más de lo que te tocaría, pero generas derechos sobre esa base' },
          { id: 'c', label: 'Cotizas por tu salario exacto, sin más' },
          { id: 'd', label: 'La empresa paga la diferencia y a ti no te afecta' },
        ],
        correctId: 'b',
        explanation:
          'La base mínima es el suelo: se cotiza por ella aunque el salario sea menor. Pagas un poco más, pero también acumulas derecho a prestaciones más altas.',
      },
      {
        id: 'bases-verdadero-falso',
        kind: 'truefalse',
        prompt: 'Verdadero o falso',
        statements: [
          { id: 's1', text: 'El grupo de cotización coincide siempre con el nombre de tu puesto.', isTrue: false },
          { id: 's2', text: 'En 2025 la base máxima mensual es la misma para todos los grupos.', isTrue: true },
          { id: 's3', text: 'La base mínima sí cambia según el grupo de cotización.', isTrue: true },
        ],
        explanation:
          'El grupo es una categoría de la Seguridad Social, no tu cargo comercial. En 2025 el techo es común (4.909,50 € al mes) y lo que cambia por grupo es el suelo.',
      },
    ],
  },
  {
    id: 'cotizaciones',
    stepId: 3,
    title: 'Cotizaciones sociales',
    subtitle: 'Quién paga qué cada mes',
    questions: [
      {
        id: 'cotiz-quien-paga',
        kind: 'classify',
        prompt: 'Coloca cada concepto donde le corresponde.',
        hint: 'Elige la columna de cada concepto.',
        buckets: [
          { id: 'worker', label: 'Se descuenta de tu nómina' },
          { id: 'company', label: 'Lo paga la empresa aparte' },
        ],
        items: [
          { id: 'i1', label: 'Contingencias comunes del trabajador (4,70 %)', bucketId: 'worker' },
          { id: 'i2', label: 'Contingencias comunes de la empresa (23,60 %)', bucketId: 'company' },
          { id: 'i3', label: 'Desempleo del trabajador (1,55 %)', bucketId: 'worker' },
          { id: 'i4', label: 'FOGASA (0,20 %)', bucketId: 'company' },
          { id: 'i5', label: 'Accidentes de trabajo y enfermedades profesionales', bucketId: 'company' },
          { id: 'i6', label: 'Retención de IRPF', bucketId: 'worker' },
        ],
        explanation:
          'De tu nómina solo salen tus cuotas (contingencias comunes, MEI, desempleo y formación) y la retención de IRPF. FOGASA y accidentes son íntegramente de la empresa.',
      },
      {
        id: 'cotiz-porcentaje-trabajador',
        kind: 'slider',
        prompt: 'Con contrato indefinido, ¿qué porcentaje de tu base de cotización se te descuenta a ti (contingencias comunes + MEI + desempleo + formación)?',
        hint: 'Mueve el deslizador hasta la cifra que creas.',
        min: 0,
        max: 20,
        step: 0.1,
        unit: '%',
        correct: 6.48,
        tolerance: 0.7,
        explanation:
          '4,70 % de contingencias comunes + 0,13 % de MEI + 1,55 % de desempleo + 0,10 % de formación = 6,48 %. Es lo que ves como descuento en la nómina, antes del IRPF.',
      },
      {
        id: 'cotiz-porcentaje-empresa',
        kind: 'single',
        prompt: 'Sobre esa misma base, ¿cuánto aporta la empresa (sin contar accidentes de trabajo)?',
        choices: [
          { id: 'a', label: 'Alrededor del 6 %, lo mismo que tú' },
          { id: 'b', label: 'Alrededor del 15 %' },
          { id: 'c', label: 'Alrededor del 30 %' },
          { id: 'd', label: 'Alrededor del 45 %' },
        ],
        correctId: 'c',
        explanation:
          '23,60 % + 0,67 % de MEI + 5,50 % de desempleo + 0,20 % de FOGASA + 0,60 % de formación = 30,57 %, más el tipo de accidentes según la actividad. La empresa aporta casi cinco veces lo que tú.',
      },
      {
        id: 'cotiz-verdadero-falso',
        kind: 'truefalse',
        prompt: 'Verdadero o falso',
        statements: [
          { id: 's1', text: 'La parte que paga la empresa también te la descuentan de la nómina.', isTrue: false },
          { id: 's2', text: 'Las cotizaciones financian pensiones, desempleo, bajas y formación.', isTrue: true },
          { id: 's3', text: 'Cuanto más cotiza la empresa por ti, menor es tu salario neto.', isTrue: false },
        ],
        explanation:
          'La aportación empresarial no toca tu neto: encarece el coste de contratarte. Tu neto solo baja por tus cuotas y por el IRPF.',
      },
    ],
  },
  {
    id: 'especie',
    stepId: 4,
    title: 'Retribución en especie',
    subtitle: 'Lo que cobras sin que sea dinero',
    questions: [
      {
        id: 'especie-definicion',
        kind: 'single',
        prompt: '¿Qué es la retribución en especie?',
        choices: [
          { id: 'a', label: 'Un regalo de la empresa que no cuenta como salario' },
          { id: 'b', label: 'Parte de tu retribución que recibes en bienes o servicios en vez de en dinero' },
          { id: 'c', label: 'Una deducción que resta de tu cuota de IRPF' },
          { id: 'd', label: 'Un adelanto de nómina' },
        ],
        correctId: 'b',
        explanation:
          'Ticket restaurante, abono de transporte, seguro médico o guardería son retribución: forman parte de tu bruto del paso 1, aunque no los veas ingresados.',
      },
      {
        id: 'especie-limites',
        kind: 'match',
        prompt: 'Empareja cada beneficio con su límite exento en 2025.',
        hint: 'Elige un beneficio y después su límite.',
        pairs: [
          { id: 'p1', left: 'Ticket restaurante', right: '11 € por día trabajado' },
          { id: 'p2', left: 'Abono de transporte', right: '136,36 € al mes, hasta 1.500 € al año' },
          { id: 'p3', left: 'Seguro médico', right: '500 € por persona (1.500 € si tiene discapacidad)' },
          { id: 'p4', left: 'Guardería de empresa', right: 'Exenta sin límite de importe' },
        ],
        rightOrder: ['p3', 'p1', 'p4', 'p2'],
        explanation:
          'Cada beneficio tiene su propia regla. Lo que pasa del límite no desaparece: se suma al bruto que tributa.',
      },
      {
        id: 'especie-verdadero-falso',
        kind: 'truefalse',
        prompt: 'Verdadero o falso',
        statements: [
          { id: 's1', text: 'Para la Seguridad Social la especie cotiza entera, aunque para el IRPF una parte quede exenta.', isTrue: true },
          { id: 's2', text: 'Lo que supera el límite exento se suma a tu bruto que tributa.', isTrue: true },
          { id: 's3', text: 'La retribución en especie no forma parte del salario bruto del paso 1.', isTrue: false },
        ],
        explanation:
          'Este es el punto donde la Seguridad Social y el IRPF dejan de ir juntos: se cotiza por todo, pero se tributa solo por la parte no exenta.',
      },
      {
        id: 'especie-calculo',
        kind: 'single',
        prompt: 'La empresa te paga un seguro médico de 700 € al año, solo para ti. ¿Cuánto tributa?',
        choices: [
          { id: 'a', label: 'Nada: el seguro médico está siempre exento' },
          { id: 'b', label: '200 €' },
          { id: 'c', label: '500 €' },
          { id: 'd', label: '700 €' },
        ],
        correctId: 'b',
        explanation:
          'Están exentos 500 € por persona cubierta. Los 200 € restantes se suman a tu bruto que tributa (700 − 500 = 200).',
      },
    ],
  },
  {
    id: 'base-liquidable',
    stepId: 5,
    title: 'Base liquidable, reducciones y mínimo',
    subtitle: 'Del bruto a la cifra sobre la que se calcula el IRPF',
    questions: [
      {
        id: 'base-orden',
        kind: 'order',
        prompt: 'Ordena la cadena que lleva de tu bruto a la base liquidable.',
        hint: 'Usa las flechas para mover cada pieza.',
        topLabel: 'Primero',
        bottomLabel: 'Último',
        items: [
          { id: 'o3', label: '− Gastos deducibles (2.000 € generales)' },
          { id: 'o1', label: 'Salario bruto que tributa' },
          { id: 'o5', label: '− Reducciones de base (plan de pensiones, mutualidad…)' },
          { id: 'o2', label: '− Cotizaciones sociales del trabajador' },
          { id: 'o6', label: '= Base liquidable' },
          { id: 'o4', label: '= Rendimiento neto del trabajo' },
        ],
        correctOrder: ['o1', 'o2', 'o3', 'o4', 'o5', 'o6'],
        explanation:
          'Bruto − cotizaciones − gastos deducibles = rendimiento neto del trabajo. Sobre él se aplican las reducciones y sale la base liquidable, que es la que recorre la escala del paso 6.',
      },
      {
        id: 'base-gastos-2000',
        kind: 'single',
        prompt: 'Los 2.000 € de «otros gastos deducibles»…',
        choices: [
          { id: 'a', label: 'Hay que justificarlos con facturas' },
          { id: 'b', label: 'Se aplican automáticamente a todo trabajador por cuenta ajena, sin justificar nada' },
          { id: 'c', label: 'Solo se aplican si cambias de residencia por trabajo' },
          { id: 'd', label: 'Se restan de la cuota de IRPF, no de la base' },
        ],
        correctId: 'b',
        explanation:
          'Son automáticos y representan lo que cuesta trabajar. Suben en casos concretos (movilidad geográfica, discapacidad) y no tienen que ver con el autónomo, que sí deduce gastos reales con factura.',
      },
      {
        id: 'base-minimo-importe',
        kind: 'slider',
        prompt: '¿Cuál es el mínimo del contribuyente en 2025 para alguien menor de 65 años?',
        hint: 'Mueve el deslizador hasta la cifra que creas.',
        min: 2000,
        max: 10000,
        step: 50,
        unit: '€',
        correct: 5550,
        tolerance: 300,
        explanation:
          'Son 5.550 € al año. Sube con la edad (+1.150 € a partir de los 65) y con hijos, ascendientes a cargo o discapacidad.',
      },
      {
        id: 'base-minimo-como',
        kind: 'single',
        prompt: '¿Cómo se aplica el mínimo personal y familiar?',
        choices: [
          { id: 'a', label: 'Se resta de la base liquidable antes de la escala' },
          { id: 'b', label: 'Se resta directamente de la cuota, euro a euro' },
          { id: 'c', label: 'Recorre la misma escala y la cuota que sale de él se resta de tu cuota' },
          { id: 'd', label: 'Se descuenta de tu salario bruto' },
        ],
        correctId: 'c',
        explanation:
          'Es la parte de tu renta que no tributa, pero no se resta de la base: pasa por la escala y su cuota se resta de la tuya. Por eso el efecto se ve en el paso 6 y no en la base liquidable.',
      },
      {
        id: 'base-clasifica',
        kind: 'classify',
        prompt: '¿Cada concepto baja la base o baja la cuota?',
        hint: 'Elige la columna de cada concepto.',
        buckets: [
          { id: 'base', label: 'Baja la base (antes de la escala)' },
          { id: 'cuota', label: 'Baja la cuota (después de la escala)' },
        ],
        items: [
          { id: 'i1', label: 'Aportación a un plan de pensiones', bucketId: 'base' },
          { id: 'i2', label: 'Cuota sindical', bucketId: 'base' },
          { id: 'i3', label: 'Donativo a una ONG', bucketId: 'cuota' },
          { id: 'i4', label: 'Deducción por maternidad', bucketId: 'cuota' },
          { id: 'i5', label: 'Aportación a una mutualidad', bucketId: 'base' },
          { id: 'i6', label: 'Deducción por rentas del trabajo bajas (340 €)', bucketId: 'cuota' },
        ],
        explanation:
          'Lo que baja la base te ahorra tu tipo marginal. Lo que baja la cuota te ahorra el importe entero. Por eso la misma cifra vale más como deducción que como reducción.',
      },
    ],
  },
  {
    id: 'irpf',
    stepId: 6,
    title: 'IRPF por tramos',
    subtitle: 'Por qué no hay un único porcentaje',
    questions: [
      {
        id: 'irpf-verdadero-falso',
        kind: 'truefalse',
        prompt: 'Verdadero o falso',
        statements: [
          { id: 's1', text: 'Si entras en un tramo superior, todo tu salario pasa a tributar a ese porcentaje.', isTrue: false },
          { id: 's2', text: 'Cada tipo se aplica solo a la parte de la base que cae dentro de su tramo.', isTrue: true },
          { id: 's3', text: 'El IRPF suma una escala estatal y otra autonómica.', isTrue: true },
          { id: 's4', text: 'Dos personas con el mismo bruto pagan el mismo IRPF vivan donde vivan.', isTrue: false },
        ],
        explanation:
          'La escala es progresiva por tramos, no por escalones enteros. Y como la mitad autonómica la fija cada comunidad, el mismo bruto paga distinto según dónde vivas.',
      },
      {
        id: 'irpf-marginal-efectivo',
        kind: 'single',
        prompt: '¿Qué diferencia hay entre tipo marginal y tipo efectivo?',
        choices: [
          { id: 'a', label: 'El marginal es el estatal y el efectivo es el autonómico' },
          { id: 'b', label: 'El marginal es lo que pagarías por el siguiente euro; el efectivo es la media real sobre toda tu base' },
          { id: 'c', label: 'El marginal es antes de deducciones y el efectivo después' },
          { id: 'd', label: 'Son dos nombres para lo mismo' },
        ],
        correctId: 'b',
        explanation:
          'El marginal siempre es mayor que el efectivo, porque solo afecta al último tramo. Cuando alguien dice «me quitan el 37 %» suele estar confundiendo el marginal con lo que paga de verdad.',
      },
      {
        id: 'irpf-subida',
        kind: 'single',
        prompt: 'Te suben el sueldo 1.000 € y tu tipo marginal es del 37 %. Mirando solo el IRPF, ¿cuánto de esa subida te queda?',
        choices: [
          { id: 'a', label: '0 €: la subida se la lleva entera Hacienda' },
          { id: 'b', label: '370 €' },
          { id: 'c', label: '630 €' },
          { id: 'd', label: '1.000 €' },
        ],
        correctId: 'c',
        explanation:
          'Solo esos 1.000 € tributan al 37 %: 370 € de impuesto y 630 € para ti. Una subida de sueldo nunca te deja cobrando menos que antes.',
      },
      {
        id: 'irpf-escala-estatal',
        kind: 'single',
        prompt: 'La escala estatal empieza con un 9,5 % en el primer tramo. ¿Por qué se dice normalmente que el primer tramo del IRPF es el 19 %?',
        choices: [
          { id: 'a', label: 'Porque el 9,5 % se aplica dos veces al año' },
          { id: 'b', label: 'Porque a la escala estatal se le suma la autonómica, de tamaño parecido' },
          { id: 'c', label: 'Porque el 19 % incluye ya las cotizaciones sociales' },
          { id: 'd', label: 'Porque el 9,5 % es solo para rentas bajas' },
        ],
        correctId: 'b',
        explanation:
          'El IRPF se reparte a medias: cada comunidad aprueba su propia escala. Estatal + autonómica es lo que acabas pagando.',
      },
    ],
  },
  {
    id: 'deducciones',
    stepId: 7,
    title: 'Deducciones de cuota',
    subtitle: 'Lo que se resta al final, del impuesto',
    questions: [
      {
        id: 'deduc-reduccion-vs-deduccion',
        kind: 'single',
        prompt: 'Tienes 100 € de reducción o 100 € de deducción. ¿Qué te ahorra más?',
        choices: [
          { id: 'a', label: 'La reducción: baja la base antes de calcular nada' },
          { id: 'b', label: 'La deducción: resta 100 € de impuesto, mientras que la reducción ahorra 100 € × tu tipo marginal' },
          { id: 'c', label: 'Las dos ahorran exactamente lo mismo' },
          { id: 'd', label: 'Depende de la comunidad autónoma' },
        ],
        correctId: 'b',
        explanation:
          'Con un marginal del 30 %, 100 € de reducción ahorran 30 € y 100 € de deducción ahorran 100 €. La deducción vale más porque actúa sobre el impuesto ya calculado.',
      },
      {
        id: 'deduc-rentas-bajas',
        kind: 'single',
        prompt: 'La deducción por rentas del trabajo bajas (hasta 340 €)…',
        choices: [
          { id: 'a', label: 'Se cobra siempre, sea cual sea tu salario' },
          { id: 'b', label: 'Se cobra entera hasta 16.576 € de rendimientos íntegros y se va perdiendo hasta desaparecer en 18.276 €' },
          { id: 'c', label: 'Solo se aplica si tienes hijos' },
          { id: 'd', label: 'Resta de la base liquidable, como el plan de pensiones' },
        ],
        correctId: 'b',
        explanation:
          'Entre 16.576 € y 18.276 € se pierde a razón de 0,20 € por cada euro de más. Además se limita a la cuota: si tu cuota ya es 0, no hay nada que restar.',
      },
      {
        id: 'deduc-verdadero-falso',
        kind: 'truefalse',
        prompt: 'Verdadero o falso',
        statements: [
          { id: 's1', text: 'Las deducciones generales no pueden dejar la cuota por debajo de 0.', isTrue: true },
          { id: 's2', text: 'Hay deducciones reembolsables (maternidad, familia numerosa) que se cobran aunque tu cuota sea 0.', isTrue: true },
          { id: 's3', text: 'Las deducciones autonómicas son iguales en toda España.', isTrue: false },
        ],
        explanation:
          'Las generales solo pueden reducir el impuesto hasta dejarlo en cero. Las reembolsables funcionan como una ayuda: se cobran aunque no pagues IRPF. Y cada comunidad aprueba las suyas.',
      },
    ],
  },
  {
    id: 'iva',
    stepId: 8,
    title: 'IVA y consumo diario',
    subtitle: 'Los impuestos que dependen de cómo gastas',
    questions: [
      {
        id: 'iva-tipos',
        kind: 'match',
        prompt: 'Empareja cada gasto con su tipo de IVA.',
        hint: 'Elige un gasto y después su tipo.',
        pairs: [
          { id: 'p1', left: 'Pan, leche, fruta y verdura', right: '4 % (superreducido)' },
          { id: 'p2', left: 'Restaurante o comida a domicilio', right: '10 % (reducido)' },
          { id: 'p3', left: 'Ropa, móvil o electrónica', right: '21 % (general)' },
          { id: 'p4', left: 'Alquiler de tu vivienda habitual', right: 'Sin IVA (exento)' },
        ],
        rightOrder: ['p3', 'p4', 'p1', 'p2'],
        explanation:
          'El transporte público también va al 10 %. En gasolina, tabaco, alcohol y electricidad, además del 21 % hay impuestos especiales encima.',
      },
      {
        id: 'iva-verdadero-falso',
        kind: 'truefalse',
        prompt: 'Verdadero o falso',
        statements: [
          { id: 's1', text: 'El IVA se descuenta de tu nómina.', isTrue: false },
          { id: 's2', text: 'Dos personas con el mismo neto pueden pagar cantidades de IVA muy distintas.', isTrue: true },
          { id: 's3', text: 'En gasolina, tabaco o alcohol se pagan impuestos especiales además del IVA.', isTrue: true },
        ],
        explanation:
          'El IVA no sale de la nómina: lo pagas al consumir, con el dinero que ya has cobrado. Por eso depende de tu patrón de gasto y no solo de tu salario.',
      },
      {
        id: 'iva-calculo',
        kind: 'single',
        prompt: 'Pagas 121 € por un móvil, con el IVA del 21 % ya incluido. ¿Cuánto de esos 121 € es IVA?',
        choices: [
          { id: 'a', label: '25,41 €' },
          { id: 'b', label: '21,00 €' },
          { id: 'c', label: '12,10 €' },
          { id: 'd', label: '100,00 €' },
        ],
        correctId: 'b',
        explanation:
          'El 21 % se calcula sobre el precio sin impuesto: 100 € de móvil + 21 € de IVA = 121 €. Aplicar el 21 % al total (25,41 €) es el error habitual.',
      },
    ],
  },
  {
    id: 'patrimonio',
    stepId: 9,
    title: 'Vivienda y coche',
    subtitle: 'Impuestos por tener, no por gastar',
    questions: [
      {
        id: 'patrimonio-clasifica',
        kind: 'classify',
        prompt: '¿Se paga todos los años o fue un pago único al comprar?',
        hint: 'Elige la columna de cada impuesto.',
        buckets: [
          { id: 'anual', label: 'Cada año' },
          { id: 'unico', label: 'Una sola vez, al comprar' },
        ],
        items: [
          { id: 'i1', label: 'IBI de tu vivienda', bucketId: 'anual' },
          { id: 'i2', label: 'IVTM (impuesto de circulación)', bucketId: 'anual' },
          { id: 'i3', label: 'ITP de una vivienda de segunda mano', bucketId: 'unico' },
          { id: 'i4', label: 'IVA + AJD de una vivienda nueva', bucketId: 'unico' },
          { id: 'i5', label: 'Impuesto de matriculación del coche', bucketId: 'unico' },
        ],
        explanation:
          'Solo el IBI y el IVTM se reparten en tu impacto mensual. Los impuestos de la compra fueron un desembolso de entonces y por eso se muestran aparte.',
      },
      {
        id: 'patrimonio-ibi',
        kind: 'single',
        prompt: '¿Sobre qué se calcula el IBI?',
        choices: [
          { id: 'a', label: 'Sobre el precio que pagaste por la vivienda' },
          { id: 'b', label: 'Sobre el valor catastral, que suele ser bastante menor que el precio de mercado' },
          { id: 'c', label: 'Sobre lo que te queda de hipoteca' },
          { id: 'd', label: 'Sobre el alquiler que podrías cobrar' },
        ],
        correctId: 'b',
        explanation:
          'El valor catastral lo fija la Administración y suele rondar la mitad del precio de compra. El tipo lo decide cada ayuntamiento, normalmente entre el 0,4 % y el 1,1 %.',
      },
      {
        id: 'patrimonio-verdadero-falso',
        kind: 'truefalse',
        prompt: 'Verdadero o falso',
        statements: [
          { id: 's1', text: 'El IVTM depende de los caballos fiscales del coche.', isTrue: true },
          { id: 's2', text: 'El tipo del IBI lo fija tu ayuntamiento.', isTrue: true },
          { id: 's3', text: 'Si vives de alquiler, el IBI lo pagas tú al ayuntamiento.', isTrue: false },
        ],
        explanation:
          'El IBI y el IVTM los paga quien es propietario. En alquiler, el IBI es del casero, aunque a veces se repercuta en el contrato.',
      },
    ],
  },
  {
    id: 'conjunto',
    stepId: 10,
    title: 'Visión de conjunto',
    subtitle: 'Cómo encajan todas las piezas',
    questions: [
      {
        id: 'conjunto-orden',
        kind: 'order',
        prompt: 'Ordena estas cuatro cifras de mayor a menor.',
        hint: 'Usa las flechas para mover cada pieza.',
        topLabel: 'La mayor',
        bottomLabel: 'La menor',
        items: [
          { id: 'o3', label: 'Salario neto de tu nómina' },
          { id: 'o1', label: 'Coste total de contratarte para la empresa' },
          { id: 'o4', label: 'Lo que te queda tras pagar IVA y demás impuestos' },
          { id: 'o2', label: 'Tu salario bruto' },
        ],
        correctOrder: ['o1', 'o2', 'o3', 'o4'],
        explanation:
          'Coste de empresa = bruto + cotizaciones empresariales. Del bruto salen tus cuotas y el IRPF, y de lo que cobras aún se va una parte en impuestos al consumir.',
      },
      {
        id: 'conjunto-fuera-nomina',
        kind: 'multiple',
        prompt: '¿Cuáles de estos impuestos NO salen de tu nómina?',
        hint: 'Puedes marcar varias.',
        choices: [
          { id: 'a', label: 'IVA de tus compras' },
          { id: 'b', label: 'Retención de IRPF' },
          { id: 'c', label: 'IBI de tu vivienda' },
          { id: 'd', label: 'Cotización del trabajador' },
          { id: 'e', label: 'IVTM del coche' },
        ],
        correctIds: ['a', 'c', 'e'],
        explanation:
          'De la nómina solo salen tu cotización y la retención de IRPF. El IVA, el IBI y el IVTM los pagas después, con el dinero que ya has cobrado.',
      },
      {
        id: 'conjunto-coste-empresa',
        kind: 'single',
        prompt: 'Te suben el bruto 1.000 € al año. ¿Cuánto le cuesta a la empresa esa subida, aproximadamente?',
        choices: [
          { id: 'a', label: 'Unos 700 €, porque parte se la queda Hacienda' },
          { id: 'b', label: 'Exactamente 1.000 €' },
          { id: 'c', label: 'Unos 1.300 €, porque también suben sus cotizaciones' },
          { id: 'd', label: 'Unos 2.000 €' },
        ],
        correctId: 'c',
        explanation:
          'La empresa aporta alrededor de un 30 % sobre el bruto. Cada euro de subida le cuesta cerca de 1,30 €, mientras que a ti te llega menos de un euro tras cotizaciones e IRPF.',
      },
    ],
  },
]

export const KNOWLEDGE_CHECK_TOTAL_QUESTIONS = KNOWLEDGE_CHECK_SECTIONS.reduce(
  (total, section) => total + section.questions.length,
  0,
)
