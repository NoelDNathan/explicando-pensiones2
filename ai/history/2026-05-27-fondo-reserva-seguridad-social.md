# 2026-05-27 - Fondo de Reserva de la Seguridad Social

- fecha: 2026-05-27
- objetivo: buscar y documentar datos oficiales sobre evolucion de entradas, salidas y saldo del Fondo de Reserva de la Seguridad Social.
- archivos modificados:
  - `scripts/process-seguridad-social-fondo-reserva-2000-2024.ps1`
  - `data/raw/seguridad-social/fondo-reserva/2026-05-27_seguridad-social_fondo-reserva-informe-cortes-2011.pdf`
  - `data/raw/seguridad-social/fondo-reserva/2026-05-27_seguridad-social_fondo-reserva-informe-cortes-2017.pdf`
  - `data/raw/seguridad-social/fondo-reserva/2026-05-27_seguridad-social_fondo-reserva-informe-cortes-2024.pdf`
  - `data/processed/seguridad-social/2026-05-27_seguridad-social_fondo-reserva-dotaciones-disposiciones-saldo_2000-2024.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: descargados informes oficiales a Cortes 2011, 2017 y 2024; creada serie anual 2000-2024 con dotaciones, rendimientos netos, entradas totales, disposiciones, variacion de saldo y saldo de cierre; documentada metadata, inventario, fuentes, metodologia y checksums.
- estado siguiente: la serie esta lista para uso editorial con cautela de redondeo a millones de euros. Si se necesita exactitud contable al euro, extraer importes no redondeados de anexos o cuentas oficiales cuando existan.
