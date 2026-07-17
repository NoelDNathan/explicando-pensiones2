# 2026-07-17 - IRPF 2025 completo en pasos 4 y 5

- Fecha: 2026-07-17.
- Objetivo: terminar la captura de datos y los calculos de reducciones, minimos, deducciones y salario en especie del IRPF 2025.
- Archivos modificados: motor IRPF y minimos familiares, formulario estructurado, tarjetas de pasos 4-6, regresiones y metodologia fiscal.
- Resumen: se sustituyeron importes orientativos por reglas calculables y entradas verificables; se separaron cuota anual, deducciones reembolsables, pagos a cuenta y resultado de declaracion; las reglas autonomicas manuales exigen metadatos.
- Verificacion: 23 regresiones fiscales, TypeScript, lint y `pnpm run build` correctos. Revision funcional en escritorio de gastos, prevision social, donativos y maternidad; revision movil del paso 5 a 390 x 844 sin desbordamiento horizontal ni errores de consola.
- Estado siguiente: contrastar expedientes completos con Renta WEB 2025 y automatizar el catalogo de deducciones autonomicas comunidad por comunidad.
