# Historial de interaccion

- Fecha: 2026-05-25
- Objetivo: completar hasta 2070 las series de PIB, gasto publico total, intereses de deuda y deficit/saldo publico que estaban como `no_estimado`.
- Archivos modificados:
  - `scripts/process-fiscal-series-1975-2070.ps1`
  - `data/processed/fiscal/2026-05-25_series-fiscales-espana_1975-2070.csv`
  - `data/processed/fiscal/2026-05-25_series-fiscales-espana_escenario-derivado-pib-y-aapp_2025-2070.csv`
  - `data/raw/airef/deuda-publica-previsiones/2026-05-25_airef_documentos-tecnicos-opinion-sostenibilidad-aapp-2025_presentacion.pdf`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- Resumen de cambios: se creo una capa estimada 2025-2070. El PIB corriente futuro parte del PIB BDMACRO 2024 y aplica crecimiento de PIB potencial e HICP del Ageing Report 2024. Gasto publico total, intereses y saldo publico interpolan linealmente anclas publicadas por AIReF para 2029, 2041, 2050 y 2070; los importes se calculan sobre el PIB estimado. El CSV maestro queda completo para esas cuatro variables con `estado_dato = estimado`.
- Estado siguiente: usar estas filas solo como escenario derivado, no como dato oficial anual tabulado, y mostrar claramente `estado_dato` en la interfaz.
