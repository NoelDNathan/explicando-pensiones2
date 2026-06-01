# Alcance calculadora fiscal 2025

- fecha: 2026-06-01
- objetivo: documentar el alcance definitivo de factores para la calculadora fiscal 2025 y como obtener datos equivalentes en otros anos.
- archivos modificados:
  - `data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json`
  - `data/methodology/calculadora-fiscal-trabajador-2025.md`
  - `data/methodology/calculadora-fiscal-datos-por-ano.md`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se fijo que la calculadora no comparara con futuro por ahora, sino mas adelante con anos pasados. Se documentaron como factores incluidos salario bruto anual, comunidad autonoma, edad, estado civil, hijos a cargo, personas a cargo, discapacidad, categoria profesional y movilidad geografica. IVA y otros impuestos quedan como aproximaciones separadas.
- estado siguiente: adaptar la UI de `/calculadora-fiscal` al nuevo alcance y retirar la comparacion 2030 de maqueta.
