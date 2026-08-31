# 2026-08-31 - Paso 6: como el minimo personal y familiar baja la cuota

## Objetivo

Explicar en el paso 6 el paso que mas confunde del IRPF: el minimo personal y
familiar no se resta de la base liquidable, sino que recorre la misma escala y
la cuota resultante se resta de la cuota. Se decidio el paso 6 (y no el 5)
porque es donde vive la escala y donde ya estaban las cifras.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerFamilyMinimumExplainer.tsx` (nuevo)
- `src/components/worker-salary-dashboard/WorkerFamilyMinimumExplainer.css` (nuevo)
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/worker-salary-dashboard/index.ts`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`

## Resumen de cambios

- Bloque explicativo nuevo en el paso 6, encima de «Calculo por tramos», con las
  cifras reales del contribuyente en tres columnas: base liquidable -> escala ->
  cuota de la escala; minimo -> misma escala -> cuota del minimo; y la resta que
  da la cuota integra. Se apoya en las clases `witc-tramo` ya existentes para el
  desglose y en los tokens de `.witc`, sin patrones nuevos.
- Tres desplegables: el recorrido del minimo tramo a tramo por las dos escalas,
  por que no se resta de la base (el ahorro seria a tipo marginal y valdria mas
  cuanto mas ganas) y por que hay un minimo estatal y otro autonomico.
- El minimo se topa en la base liquidable, igual que en el motor: con bases
  bajas el bloque avisa de cuanto se aplica de verdad y de que la cuota se queda
  en 0, no en negativo.
- Arreglo: la fila «Minimo personal y familiar» del paso 6 se calculaba como
  `cuota de la escala - cuota final`, asi que incluia tambien las deducciones
  generales de cuota, que ademas se listaban aparte (doble cómputo visual).
  Ahora el motor pasa `stateMinimumQuota` / `regionalMinimumQuota` y el reparto
  estatal/autonomico de las deducciones generales, y cada columna muestra sus
  dos restas por separado. El fallback anterior se conserva para el uso suelto
  del componente.
- Etiquetas mas precisas en las columnas: «La escala sobre tu base» y «Cuota del
  minimo personal y familiar» (antes «Cuota integra (escala)» y «Minimo personal
  y familiar», que nombraban mal las dos magnitudes).
- En el paso 5, la tarjeta «Cuota antes de deducciones» aclara que esa cifra ya
  lleva aplicado el minimo y remite al paso 6.

## Verificacion

- `pnpm run build` y `pnpm run verify:irpf2025` (24 comprobaciones) correctos.
- En `/calculadora-fiscal` paso 6 con 35.000 € y Madrid: escala 3.692,55 € −
  527,25 € = 3.165,30 € (estatal) y 3.240,63 € − 506,32 € = 2.734,32 € (Madrid);
  el bloque muestra 6.933,18 € − 1.033,57 € = 5.899,61 €, que cuadra con el total
  IRPF de la tarjeta.
- Caso de base baja (14.000 €): base liquidable 3.623,98 €, minimo aplicado
  3.623,98 € de 5.550 €, cuota integra 0,00 € y aviso visible.
- Caso con deducciones generales (donativo de 500 € con entidad de la Ley
  49/2002): cada columna resta 527,25 €/506,32 € de minimo y 150 € de
  deducciones por separado, y desaparece la linea agregada duplicada.
- Revisado en escritorio 1280 px (tres columnas) y movil 375 px (apiladas, sin
  desbordes horizontales).

## Estado siguiente

- Queda abierta la pregunta de si conviene intercambiar los pasos 5 y 6, para
  que el recorrido siga el orden real del calculo (escala y minimo antes que las
  deducciones). De momento se resuelve con el remite del paso 5 al 6.
