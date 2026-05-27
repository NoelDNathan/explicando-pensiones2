# Interaccion: reduccion hueco edad de jubilacion 1980-2005

- fecha: 2026-05-27
- objetivo: resolver el tramo pendiente 1975-2005 de edad efectiva de jubilacion sin usar OCDE ni edad de salida del mercado laboral.
- archivos modificados:
  - `scripts/process-seguridad-social-edad-jubilacion-1975-2026.ps1`
  - `data/raw/seguridad-social/edad-jubilacion/2026-05-27_pacto-toledo_informe-evaluacion-2011_edad-media-jubilacion_2004-2010.pdf`
  - `data/raw/seguridad-social/edad-jubilacion/2026-05-27_ministerio-trabajo_insercion-temprana-jovenes_mcvl-edad-jubilacion-rg_1980-2004.pdf`
  - `data/processed/seguridad-social/2026-05-27_seguridad-social_edad-legal-efectiva-jubilacion-espana_1975-2026.csv`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/methodology/fuentes-edad-jubilacion.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se anadio una proxy institucional MCVL para Regimen General 1980-2003 y total sistema Pacto de Toledo para 2004-2005. La serie queda con edad efectiva 1980-2026, distinguiendo cobertura por fila. Solo 1975-1979 queda `no_localizado`.
- estado siguiente: si se necesita cubrir 1975-1979, buscar anuarios historicos o tablas de altas por edad previas a 1980; mantener diferenciado el tramo MCVL de Regimen General frente al total sistema.
