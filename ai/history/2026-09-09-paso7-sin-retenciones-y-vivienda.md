# 2026-09-09 — Paso 7: fuera retenciones y cierre del hueco de vivienda

## Objetivo

Revisar las deducciones del paso 7 y arreglar lo que salio de la revision: el recorrido
prometia retenciones que no se podian introducir, y la deduccion por vivienda se aplicaba
sin comprobar el segundo requisito de la DT18 LIRPF.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/irpf2025Adjustments.ts`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `scripts/verify-irpf-2025-core.mjs`
- `ai/history/2026-09-09-paso7-sin-retenciones-y-vivienda.md`
- `ai/current.md`

## Resumen de cambios

**Retenciones fuera del recorrido.** `deductionsGroup="withholdings"` no se renderizaba en
ninguna parte, asi que `withholdings` y `paymentsOnAccount` valian siempre 0: la fila de la
barra fija mostraba `− 0,00 €` y el resultado se etiquetaba «A pagar» con el IRPF anual
entero, que es justo el error que el paso intenta desmontar. Se elimina el concepto:
los dos campos salen de `Irpf2025AdjustmentInput`, desaparece `WithholdingQuestions` con su
grupo y su helper de limpieza, y la cadena queda `cuota − ordinarias − reembolsables =
IRPF del año`. El resultado se muestra en positivo y solo pasa a «A devolver» cuando las
reembolsables superan la cuota. Los textos que prometian retenciones (nota de la ecuacion,
desplegable «¿Puede salir a devolver?» y el `details` del paso) ahora explican que esa cifra
es el IRPF del año completo, el mismo que se adelanta con la retencion de cada nomina.

**Vivienda habitual (DT18).** Antes bastaba con teclear un importe: los `NumberField`
ponian `homeTransitionalRight: true` por su cuenta y el motor no pedia nada mas. Se anade
`homePriorDeductionRight`, que el calculo exige junto al derecho transitorio, y una pregunta
explicita «¿Aplicaste esta deducción por esa vivienda en 2012 o antes?». Los importes ya no
conceden el regimen.

**Menos preguntas y menos norma.** El paso pedia 28 controles, muchos de ellos citando la
ley (Ley 49/2002, regimen transitorio, tope de cotizaciones) para cosas que el usuario no
puede contestar sin tenerla delante. Se baja a 16 con una regla: un control se queda solo si
el usuario lo puede contestar desde su vida y cambia el numero.

| Bloque | Antes | Ahora |
| --- | --- | --- |
| Donativos | pregunta + importe + chip Ley 49/2002 + donativos de 2024 y 2023 | pregunta + importe |
| Alquiler | pregunta + importe + 3 chips del regimen transitorio | pregunta + importe |
| Vivienda | pregunta + importe + % + chip de 2012 + select de tramo + chip del 9 % catalan | pregunta + importe + % |
| Empresa nueva | pregunta + importe + chip de certificacion | pregunta + importe |
| Maternidad | 4 campos + guarderia con 5 campos | 2 campos + guarderia con 1 |
| Familia numerosa | 9 campos, dos de ellos sobre cotizaciones | 4 campos |

El requisito se mueve a la pregunta de cabecera y el "Si" lo da por cumplido: «¿Vives de
alquiler desde antes de 2015 y ya te lo deducias entonces?», «¿Compraste tu vivienda antes de
2013 y ya te la deducias entonces?», «¿Invertiste en una empresa recien creada y te dieron su
certificado?». Los meses-hijo y los meses-persona se piden como meses normales y se
multiplican por dentro. Tampoco se pregunta por el abono anticipado ya cobrado, por lo mismo
que no se preguntan las retenciones: la cifra del paso es el IRPF del ano, no la liquidacion
de la declaracion. El titulo de familia numerosa se da por vigente los doce meses, asi que esa
pregunta tambien desaparece; los meses de la persona con discapacidad a cargo si se piden,
porque ahi la variacion es real.

Consecuencias en el motor, todas documentadas en el codigo:

- **Tope de cotizaciones automatico.** `refundableContributionLimit` y
  `refundableBenefitEntitlement` desaparecen: el limite entra como argumento de
  `calculateRefundableDeductions2025` y sale de lo cotizado en el paso 3. Esto ademas quita el
  cero silencioso de antes, cuando familia numerosa salia 0 € por un campo sin rellenar.
- **Donativos sin recurrencia.** Sin las preguntas de 2023 y 2024 no se puede acreditar el
  45 %, asi que todo lo que pasa de 250 € va al 40 %.
- **Vivienda solo al 7,5 % autonomico.** Se retira el 9 % catalan, que exigia una pregunta
  imposible de contestar sin la norma.
- **Guarderia sin duplicados.** El gasto que ya paga la empresa se lee de la retribucion en
  especie del paso 4 en vez de preguntarse otra vez.
- **Fuera el incremento de 150 € de maternidad**, que no tenia norma identificada.
- **Sin abono anticipado.** `maternityAdvanceReceived`, `largeFamilyAdvanceReceived` y
  `disabilityAdvanceReceived` salen del tipo, y con ellos `advancesReceived` del resultado:
  `netRefundable` pasa a ser lo generado. Los tres textos que prometian el descuento del
  anticipo se retiran.
- **Familia numerosa a 12 meses fijos.** `largeFamilyEligibleMonths` sigue en el motor y los
  casos dorados lo siguen prorrateando, pero la interfaz lo fija en 12.

**Redaccion de las preguntas.** El ejercicio va en la pregunta de cabecera y no se repite
dentro: «¿Has donado a una ONG o fundación en 2025?» con el importe como «¿Cuánto has
donado?». El alquiler pasa de un parrafo de aviso y tres chips encadenados a la pregunta
que discrimina mas «¿Pagas alquiler con un contrato anterior a 2015?», el importe y un unico
chip «¿Ya te deducías este alquiler antes de 2015?» que fija los tres flags que pide el
motor. En vivienda se quita el parrafo que repetia la descripcion de la pregunta.

## Como se ha verificado

- `pnpm run verify:irpf2025`: 34 comprobaciones. Nuevas: vivienda con los dos requisitos
  678 + 678 € y sin el segundo 0; familia numerosa 1.200 € con cotizacion de 5.000 € y 800 €
  cuando la cotizacion es 800 €; media custodia de categoria especial 1.200 €; maternidad de
  1.000 € que ya no se minora por anticipos; guarderia
  topada a 1.000 € y a 400 € cuando el gasto neto de la parte de empresa se queda corto;
  donativo de 1.250 € = 600 €.
- `pnpm run build` limpio; `eslint` sin errores nuevos sobre los 5 previos de esos archivos.
- Navegador: la cadena del paso 7 no tiene fila de retenciones; un donativo de 1.250 €
  resta 600 € con dos preguntas, y familia numerosa general resta 1.200 € contestando solo
  «tengo el titulo» y la categoria, sin cotizaciones, sin meses y sin anticipos.

## Pendiente relacionado

De la revision quedaron sin tocar, por orden de importancia:

- A maternidad no se le aplica el tope de cotizaciones del art. 81, que si entra en familia
  numerosa y discapacidad. Ahora que el tope es automatico, aplicarlo cuesta una linea; falta
  confirmar la redaccion vigente tras la Ley 6/2023.
- `sliceQuotaDeduction` calcula el efecto de cada pregunta contra la cuota integra completa,
  asi que la suma de las tarjetas no cuadra con «Deducciones ordinarias» cuando topa.
- `appliedQuotaDeductions`, `refundableDeductionsGenerated` y `finalDeclarationResult` solo
  se leen en la rama `showReductionsSection`, pero la barra que los pinta vive en la de
  deducciones: son props muertas y el paso recalcula todo en local.
- `helpTitle` y `helpBody` ya no se pintan en ningun paso; el aside solo muestra la nomina.

## Estado siguiente

Sin commit ni push (el usuario no lo pidio).
