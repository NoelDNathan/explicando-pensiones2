# 2026-09-01 — Explicar la deducción de 340 € en el paso 4

## Objetivo

En el paso 4 la deducción de 340 € solo existía como una línea suelta del panel sticky
(«Deducción por rentas bajas · en la cuota (paso 6)») y como tres menciones de contraste dentro del
explicador de la reducción, siempre antes de que se dijera qué es. Darle un bloque propio con las
cifras del usuario y unificar el nombre en los pasos 4, 5 y 6.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/irpf2025Calc.ts`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/worker-salary-dashboard/WorkerIrpfTranchesCard.tsx`
- `src/components/fiscal-worker-dashboard/WorkIncomeReductionExplainer.tsx`
- `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
- `ai/current.md`

## Resumen de cambios

- Constantes exportadas (`LOW_WORK_INCOME_DEDUCTION_MAX_EUR`, `..._FULL_GROSS_EUR`,
  `..._WITHDRAWAL_RATE`) y helper `lowWorkIncomeDeductionTheoretical2025`, que ahora usa también
  `calculateLowWorkIncomeDeduction2025`: las cifras dejan de estar a mano en el copy.
- Nuevo `LowWorkIncomeDeductionPanel` en la sección «2 · Ventajas del trabajo», justo detrás de la
  pregunta de otras rentas y antes del explicador. Cinco estados: aplicada (ecuación bruto →
  importe → tope de cuota → menos de IRPF), cuota en cero, pendiente de confirmar otras rentas,
  bloqueada por superar los 6.500 € y fuera de rango por bruto. Desplegable «¿Cuándo se pierde?»
  con la retirada (0,20 €/€ entre 16.576 € y 18.276 €, con el margen o lo ya perdido del usuario),
  el escalón de los 6.500 € y el tope de cuota.
- El bloque va en azul (`wprc-net-income--deduction`) frente al verde de los bloques que restan de
  la base, y repite el contraste en texto: 1 € de deducción es 1 € menos a pagar.
- Mismo nombre en los tres sitios: «Deducción por rentas del trabajo bajas» en el sticky del paso 4,
  en el del paso 5 y en el resultado del paso 6 (antes «Deduccion trabajo 2025»).
- En el explicador: el aviso de otras rentas y la trampa del escalón dicen que el umbral también se
  lleva esta deducción; el párrafo de la joroba aclara que la retirada arranca en 16.576 €, no en el
  primer euro; las menciones sueltas a «340 € de 2025» pasan a nombrar la deducción.

## Estado siguiente

- El panel solo se muestra cuando `workBenefitsCouldApply`; con sueldos altos no aparece nada, y el
  explicador sigue siendo el único sitio donde se nombra la deducción.
