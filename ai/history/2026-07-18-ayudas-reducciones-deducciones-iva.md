# 2026-07-18 - Ayudas en reducciones/deducciones y switch IVA

- Fecha: 2026-07-18
- Objetivo: suavizar el interruptor del bloque IVA/IBI y anadir ayudas contextuales a reducciones y deducciones.
- Archivos modificados:
  - `src/components/worker-salary-dashboard/WorkerConsumptionTaxesCard.css`
  - `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.tsx`
  - `src/components/worker-salary-dashboard/Irpf2025StructuredAdjustmentsForm.css`
  - `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`
  - `ai/current.md`
- Resumen de cambios: el interruptor de IBI usa ahora una pista clara en modo apagado y un estado activo verde/teal. El formulario estructurado de IRPF incorpora `InfoButton` junto a las etiquetas de reducciones, deducciones, beneficios en especie, deducciones reembolsables y pagos a cuenta, con textos explicativos centralizados por etiqueta y estilos coherentes con el resto de ayudas.
- Verificacion: `.\node_modules\.bin\tsc.cmd --noEmit` correcto; `node node_modules\vite\bin\vite.js build` correcto con el aviso conocido de chunk grande. Revision visual en navegador integrado: paso 4 con 31 ayudas, paso 5 con 59 ayudas, popover blanco y mismo icono de 24 px; movil 390 px sin overflow en pasos 4, 5 y 7.
- Estado siguiente: si se quieren textos mas juridicos, revisar una a una las ayudas contra el manual AEAT antes de presentarlas como explicacion normativa exhaustiva.
