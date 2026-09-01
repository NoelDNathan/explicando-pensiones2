# 2026-09-01 — Retribución en especie como paso 4 y deducciones detrás del IRPF

## Objetivo

Dos reordenaciones del recorrido que el código ya pedía:

1. **La especie no era una deducción, era una exención.** En `Irpf2025StructuredAdjustmentsForm` la pregunta está marcada `effectKind="exempt"` y en `FiscalWorkerDashboard` el importe exento se resta del bruto (`taxableWorkIncome = grossSalaryAnnual − min(inKindSalary, exemptAmount) + ingresoACuenta`), que es el `grossWorkIncome` que entra al motor. Estaba aguas arriba de todo el paso 4 pero se preguntaba en el 5: quien declaraba tickets después de ver su base liquidable la veía cambiar retroactivamente.
2. **Las deducciones necesitan una cuota de la que restar.** El paso 5 abría con la ecuación `cuota íntegra − mínimo` y dos referencias hacia adelante («los tramos (paso 6)», «el detalle está en el paso 6») para explicar una cifra de la que partía.

## Recorrido

De 11 a 12 pasos. El IRPF por tramos **se queda en el 6**: insertar un paso antes (+1) y mover deducciones detrás (−1) se cancelan.

| # | Paso | Antes |
|---|------|-------|
| 1–3 | Base real · Límites · Cotizaciones | igual |
| **4** | **Retribución en especie** | nuevo (salía del 5) |
| 5 | Base liquidable | 4 |
| 6 | IRPF por tramos | 6 |
| 7 | Deducciones de cuota | 5 |
| 8 | IVA y consumo diario | 7 |
| 9 | Vivienda y coche | 8 |
| 10–12 | Resumen · FAQ · Fuentes | 9–11 |

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerWealthTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerFiscalSummaryCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `src/App.tsx`
- `ai/current.md`

## Resumen

- **Paso 4, «Retribución en especie»** (`Icon: Gift`): tercer valor `focus="in-kind"` de `WorkerPersonalReductionsCard`, así que reutiliza el estado de `adjustments` y no hay que duplicar la fontanería de `onResultChange`. Una sola pregunta Sí/No; quien responde No lo despacha en dos clics. Encima, una ecuación viva `bruto (paso 1) − especie exenta [+ ingreso a cuenta] = bruto que tributa en IRPF`, calculada con `calculateInKindBenefits2025` sobre el estado local para que responda mientras se teclea. Debajo, `<details>` con los topes (11 €/día de comida; 136,36 €/mes y 1.500 €/año de transporte; 500 € o 1.500 € por persona de seguro; guardería sin tope).
- **El momento didáctico**: el paso se sitúa justo detrás de cotizaciones porque es donde IRPF y Seguridad Social se separan. Para cotizar la especie cuenta entera y ya está en la base del paso 2; para el IRPF una parte queda exenta. Concepto nuevo en la cabecera: «¿Exención, reducción o deducción?», con los tres momentos (bruto → base → cuota) y su paso.
- El aviso de descuadre entre lo declarado en el paso 1 y lo detallado aquí (`benefitsMismatch`) pasa a ser un `wprc-calculation-warnings` propio del paso 4, a un paso de donde se declaró el total en vez de a cuatro.
- **Paso 7, «Deducciones de cuota»** (antes «Deducciones y salario en especie», `Icon: BadgePercent`): pierde la sección de especie y renumera sus bloques 2→1 y 3→2. El copy pasa a tiempo pasado («la cuota que acaba de salir en el paso 6») en vez de referenciar hacia adelante.
- `PayrollLiveData` gana `inKindSalaryAnnual`, así que la línea `BASE IRPF ESPECIE` de la nómina simplificada deja de estar siempre vacía y es la que se resalta en el paso 4. `PAYROLL_EXAMPLES` y `resultValues` se remapean al nuevo orden.
- Renumerados `showPayrollHelp` / `showConceptHelp` / `isCompactStep`, el override `:is(.wfsc-stage--step-7, .wfsc-stage--step-8)` del tema suave (ahora 8 y 9) y todas las referencias de copy a números de paso, incluidos los títulos con prefijo `7.` y `8.` de las tarjetas de consumo y patrimonio.
- `/componentes` gana la vista `focus="in-kind"` del componente 18 y actualiza los textos de los componentes 20, 21 y 22.

## Verificación

- `tsc -b`, `pnpm run build` y `pnpm run verify:irpf2025` (24 comprobaciones) correctos.
- En `/calculadora-fiscal` con 35.000 € y 1.500 € de especie en el paso 1: el paso 4 con 1.200 € de ticket restaurante da 36.500 − 1.200 = **35.300 €** de bruto que tributa, y el paso 5 abre exactamente en 35.300 € (antes el paso 4 mostraba una base que luego cambiaba). Sin especie declarada, el aviso del descuadre no aparece y la fila queda en 0,00 €.
- La línea `BASE IRPF ESPECIE` de la nómina muestra 125,00 € con 1.500 € anuales.
- Los 13 puntos de navegación (R + 12) apuntan al paso correcto y cada uno renderiza su tarjeta; «Continuar» del paso 10 lleva al 11.
- Panel lateral: nómina en los pasos 4, 5 y 6; concepto en el 7; oculto en el 8 y el 9.
- Sin desborde horizontal en escritorio 1280 px ni en móvil 390 px.

## Ajuste posterior: importes mensuales o anuales en el paso 4

El cálculo del paso partía de un importe anual por beneficio, pero la nómina suele traer la cifra del mes. Ahora cada beneficio se pregunta con un selector **Al mes / Al año** (`PeriodAmountField`): se teclea lo que se tenga a mano y la otra cifra se calcula sola. Dentro del estado se sigue guardando el anual, así que `calculateInKindBenefits2025` y el motor no cambian.

- Mensual ↔ anual es ×12 salvo en el transporte, donde se usan los meses del detalle (ahí la nota dice «repartido en N meses»).
- Si se cambian los meses de transporte estando en modo mensual, manda el importe del mes y se recalcula el anual; en modo anual sigue mandando el anual, como antes.
- Debajo de cada campo, el equivalente en el otro periodo y el reparto **exento / tributa** de ese beneficio (`breakdown` de `calculateInKindBenefits2025`).
- Tras la rejilla, un total «Total que te da la empresa en especie» con el anual, el mensual y cuánto queda exento y cuánto tributa.
- La prima de personas con discapacidad, dentro de «Afinar el detalle», usa el mismo campo.
- CSS nuevo: `.irpf-period-field`, `.irpf-period-toggle`, `.irpf-inkind-total`, más sus overrides `.fwd--soft` y un apilado por debajo de 440 px.

Verificación: `tsc -b`, `pnpm run build` y `pnpm run verify:irpf2025` (24 comprobaciones) correctos. En `/calculadora-fiscal` paso 4: 100 €/mes de ticket comida → 1.200 €/año, exentos enteros; al pulsar «Al año» el campo pasa a 1.200 y la nota a «Al mes: 100 €»; 600 €/año de seguro → 50 €/mes, 500 € exentos y 100 € que tributan; 50 €/mes de transporte con 11 meses → 660 €/año. Sin desborde horizontal a 1280 px ni a 375 px.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
