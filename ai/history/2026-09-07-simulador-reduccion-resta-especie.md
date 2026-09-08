Fecha: 2026-09-07

Objetivo: que el simulador de la reduccion por rendimientos del trabajo use el mismo bruto
que la cadena del IRPF, restando la especie exenta.

Archivos modificados:
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.tsx`
- `src/components/fiscal-worker-dashboard/irpfRegionCalc.ts`
- `ai/current.md`

Resumen:
- El explicador empotrado arranca en el bruto que tributa (declarado menos especie exenta)
  en lugar del salario bruto de nomina.
- La cotizacion del simulador se calcula sobre ese bruto mas la especie exenta, para no
  bajar la Seguridad Social al restar un importe que sigue cotizando.
- La cadena y la ecuacion del paso 5 etiquetan ese importe como bruto que tributa cuando
  hay especie.

Estado siguiente: recargar el paso 5 con especie en el paso 4 y comprobar que slider y
tira coinciden. No hay commit: no se pidio.
