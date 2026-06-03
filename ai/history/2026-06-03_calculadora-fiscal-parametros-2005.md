# Interaccion: calculadora fiscal 2005

- fecha: 2026-06-03
- objetivo: empezar a abarcar el ano 2005 para la calculadora fiscal del trabajador.
- archivos modificados:
  - `data/raw/boe/cotizaciones-2005/2026-06-03_boe_orden-tas-77-2005-cotizacion-regimen-general.html`
  - `data/raw/boe/irpf-2005/2026-06-03_boe_real-decreto-legislativo-3-2004-irpf-consolidado-2005.html`
  - `data/raw/boe/irpf-2005/2026-06-03_boe_ley-5-2004-madrid-medidas-fiscales-2005.html`
  - `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2005.json`
  - `data/methodology/calculadora-fiscal-trabajador-2005.md`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `data/methodology/transformations.md`
  - `data/checksums.sha256`
  - `ai/current.md`
- resumen de cambios: se creo un paquete normativo inicial 2005 con cotizacion del Regimen General, IRPF estatal, escala autonomica/complementaria, minimos/reducciones en base y tipos IVA legales. Se marco como `legacy` porque el algoritmo IRPF pre-2007 no equivale al de los anos modernos.
- estado siguiente: verificar normativa autonomica completa de Madrid 2005, parametrizar deducciones si se desean aplicar, y crear una rama de calculo pre-2007 antes de conectar el ano a la UI.
