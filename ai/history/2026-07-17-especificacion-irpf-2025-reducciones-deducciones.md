# Especificación IRPF 2025 de reducciones y deducciones

Fecha: 2026-07-17

## Objetivo

Documentar todos los datos, requisitos, límites y fórmulas necesarios para calcular correctamente los pasos 4 y 5 de la calculadora fiscal 2025.

## Archivos modificados

- `data/methodology/calculadora-fiscal-irpf-2025-reducciones-deducciones.md`
- `data/methodology/calculadora-fiscal-trabajador-2025.md`
- `ai/current.md`
- `ai/history/2026-07-17-especificacion-irpf-2025-reducciones-deducciones.md`

## Resumen

- Definido el orden legal completo desde rendimiento íntegro hasta resultado de la declaración.
- Documentadas fórmulas 2025, límites, datos de entrada, salidas auditables, incompatibilidades y estados de cálculo.
- Mapeados todos los controles actuales de reducciones, deducciones y salario en especie.
- Añadidas 34 fuentes directas de la AEAT y casos de regresión.
- Verificados los cercos Markdown, la continuidad de fórmulas y que todos los enlaces incluidos pertenecen a la AEAT.
- No se modificó código; no aplica build frontend en esta interacción.

## Estado siguiente

Implementar la especificación por bloques, empezando por gastos del trabajo, reducción del artículo 20, mínimos y nueva deducción 2025; después contrastar cada caso con Renta WEB 2025.
