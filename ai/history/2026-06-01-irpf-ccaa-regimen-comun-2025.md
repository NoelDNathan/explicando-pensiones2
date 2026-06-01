# Historial de interaccion

Fecha: 2026-06-01

Objetivo: completar la cobertura de IRPF autonomico 2025 para la calculadora fiscal, ignorando Pais Vasco y Navarra.

Archivos modificados:

- `data/processed/fiscal/2026-06-01_aeat-irpf-2025-ccaa-regimen-comun-cobertura.json`
- `data/sources.md`
- `data/inventory.md`
- `data/metadata.md`
- `data/methodology/transformations.md`
- `data/methodology/calculadora-fiscal-trabajador-2025.md`
- `data/methodology/calculadora-fiscal-datos-por-ano.md`
- `data/checksums.sha256`
- `ai/current.md`

Resumen de cambios:

- Anadidas escalas autonomicas y minimos autonomicos propios para las CCAA de regimen comun en 2025.
- Pais Vasco y Navarra quedan excluidos por alcance.
- Localizado y documentado el catalogo AEAT de deducciones autonomicas por familias, sin aplicarlas automaticamente hasta parametrizar requisitos, importes, limites e incompatibilidades.

Estado siguiente:

- Conectar estos parametros a la UI de la calculadora fiscal 2025.
- Mantener las deducciones autonomicas como aviso/catalogo hasta que existan reglas calculables por deduccion.
