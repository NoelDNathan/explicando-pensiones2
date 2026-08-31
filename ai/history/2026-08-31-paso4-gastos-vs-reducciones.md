# 2026-08-31 — Paso 4: separar gastos deducibles de reducciones y reescribir la explicación

## Objetivo

Dejar de llamar «reducciones de base» a cuatro preguntas que son gastos deducibles del art. 19, reescribir la explicación del paso 4 en lenguaje llano (reducción y mínimo personal y familiar) y explicar corto el límite del 30 % en la pregunta del plan de pensiones.

## Archivos modificados

- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
- `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen

`Irpf2025StructuredAdjustmentsForm` acepta `reductionsGroup` (`all` | `work-expenses` | `base-reductions`) y el paso 4 lo renderiza dos veces:

- **3 · Gastos de tu trabajo**: sindicato, colegio profesional, defensa jurídica y movilidad geográfica. Son gastos del art. 19: suman a los 2.000 € y bajan el rendimiento neto.
- **4 · Aportaciones que reducen tu base**: plan de pensiones personal, mutualidad, plan de empresa y patrimonio protegido. Restan después, sobre la base imponible.

El motor ya trataba bien los dos grupos; el cambio es de estructura y copy. Corregido también el bullet del desplegable de gastos deducibles: sindicato, colegio y defensa jurídica no engordan los 2.000 €, se suman aparte y con sus propios topes (500 y 300 €).

La cabecera del paso 4 pasa a «Reducciones y mínimo personal y familiar» con una explicación encadenada desde el paso 3, y el paso abre con dos bloques `wprc-concept`: qué es una reducción (con el ejemplo 30.000 − 2.000 = 28.000 €) y qué es el mínimo personal y familiar (no resta de la base: deja sin pagar la parte de cuota que le corresponde).

La pregunta del plan de pensiones incluye un desplegable `PensionLimitNote` con el límite del 30 %: los dos topes (1.500 € y 30 % del rendimiento neto), cuál manda en el caso del usuario y el efecto colateral de los gastos deducibles sobre ese 30 %.

## Verificación

- `pnpm run build` y `tsc -b` correctos.
- En `/calculadora-fiscal` paso 4: cuatro secciones numeradas, con las 4+4 preguntas repartidas en los grupos correctos.
- Nota del 30 % con 30.732 € de rendimiento neto: «ese 30 % son 9.220 €, así que en tu caso manda el tope de 1.500 €».
- Tema suave correcto y sin overflow horizontal en escritorio 1280 px ni en móvil 375 px.
- Las capturas del pane del navegador salen en blanco (fallo de render del propio pane); la comprobación visual se hizo sobre DOM y estilos computados.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
