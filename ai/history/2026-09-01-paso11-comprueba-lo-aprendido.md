# 2026-09-01 — Paso 11 «Comprueba lo aprendido» (repaso opcional)

## Objetivo

Añadir un paso opcional de repaso, por apartados, que compruebe si se ha entendido
el recorrido y nos diga qué apartados no están bien explicados. Duración estimada
10-15 min y prohibido preguntar nada que haya que responder escribiendo.

## Archivos modificados

- `src/components/worker-salary-dashboard/workerKnowledgeCheckQuestions.ts` (nuevo)
- `src/components/worker-salary-dashboard/WorkerKnowledgeCheckCard.tsx` (nuevo)
- `src/components/worker-salary-dashboard/WorkerKnowledgeCheckCard.css` (nuevo)
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/worker-salary-dashboard/WorkerFiscalStepsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerWealthTaxesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/App.tsx`
- `ai/current.md`

## Resumen de cambios

- El recorrido pasa de 12 a 13 pasos: nuevo paso 11 «Comprueba lo aprendido»,
  detrás del resumen del cálculo; la FAQ pasa del 11 al 12 y las fuentes del 12 al 13.
- 35 preguntas en 10 apartados, uno por bloque (pasos 1 a 10). Siete formatos, ninguno
  con teclado: opción única, opción múltiple, verdadero/falso por bloques, ordenar con
  flechas, emparejar por clic, clasificar en dos columnas y deslizador con tolerancia.
- Pantalla de entrada que deja claro que el paso es opcional, que dura 10-15 min y por
  qué nos importa: cada pregunta está atada a un paso, así que los fallos repetidos
  señalan el apartado mal explicado.
- Corrección por apartado con explicación al momento, botón «Repasar el paso N» y, en
  cada pregunta, un marcador «Esto no estaba bien explicado» que también funciona si se
  acierta.
- Resultados con nota global, barra por apartado, apartados marcados y un resumen de
  texto copiable. No hay backend: todo se guarda en `localStorage`
  (`fwd-knowledge-check-2025-v1`) y se avisa de que nada sale del navegador.
- Cifras de las preguntas tomadas de los parámetros del motor 2025: base máxima
  4.909,50 €/mes, 6,48 % de cuota del trabajador, 30,57 % de empresa, 11 €/día de ticket,
  136,36 €/mes y 1.500 €/año de transporte, 500 €/persona de seguro, 2.000 € de gastos,
  5.550 € de mínimo, 340 € entre 16.576 y 18.276 €, IVA 4/10/21 %.
- El componente se añade al laboratorio `/componentes` como «Componente 26».

## Verificación

- `tsc -b`, `eslint` y `vite build` correctos; `pnpm run verify:irpf2025` con 26 comprobaciones.
- En `/calculadora-fiscal` paso 11: corregir sin responder avisa de las que faltan;
  apartado 1 con 2 de 3; apartado 3 con clasificación, deslizador (6,5 % dentro de ±0,7)
  y verdadero/falso da 4 de 4; emparejar y ordenar responden bien.
- Resultados muestran nota, barras por apartado, preguntas marcadas y resumen copiable;
  «Repasar el paso 3» lleva al paso 3 y «Continuar» al 12; el paso 13 cierra el progreso al 100 %.
- Sin desborde horizontal a 390 px ni errores de consola.

## Estado siguiente

Sin commit ni push (el usuario no lo pidió).
