# IVA y otros impuestos en calculadora fiscal

- fecha: 2026-06-01
- objetivo: incorporar la decision de producto sobre IVA y otros impuestos en la calculadora fiscal.
- archivos modificados:
  - `data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json`
  - `data/methodology/calculadora-fiscal-iva-otros-impuestos.md`
  - `data/methodology/calculadora-fiscal-datos-por-ano.md`
  - `data/methodology/calculadora-fiscal-trabajador-2025.md`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se definieron dos opciones de IVA, media por rango salarial/renta pendiente de procesar con INE EPF y personalizado por categorias de gasto. Otros impuestos queda como media espanola estimada, separada del neto laboral y sin incluir IVA para evitar doble conteo.
- estado siguiente: procesar INE EPF por tramo de ingresos/renta y localizar una fuente institucional para la media espanola de otros impuestos.
