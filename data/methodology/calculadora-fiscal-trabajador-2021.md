# Calculadora fiscal del trabajador 2021

Fecha de documentacion: 2026-06-03.

## Objetivo

Crear un paquete normativo minimo para calcular, con trazabilidad, el caso base de un trabajador por cuenta ajena del Regimen General en 2021, usando Comunidad de Madrid como autonomia por defecto.

## Fuentes

- BOE, Orden PCM/1353/2021, de 2 de diciembre: `https://www.boe.es/eli/es/o/2021/12/02/pcm1353`.
- AEAT, Manual practico Renta 2021, gravamen estatal de la base liquidable general.
- AEAT, Manual practico Renta 2021, gravamen autonomico Comunidad de Madrid.
- AEAT, Manual practico Renta 2021, minimos personales y familiares estatales.
- AEAT, Manual practico Renta 2021, minimo por descendientes Comunidad de Madrid.
- AEAT, Manual practico Renta 2021, gastos deducibles del articulo 19.2.f LIRPF.
- AEAT, Manual practico Renta 2021, reduccion general por obtencion de rendimientos del trabajo.
- AEAT, tipos impositivos de IVA.

## Archivos

- Brutos:
  - `data/raw/boe/cotizaciones-2021/2026-06-03_boe_orden-pcm-1353-2021-cotizacion-regimen-general.html`
  - `data/raw/aeat/irpf-2021/2026-06-03_aeat_irpf-2021-gravamen-estatal.html`
  - `data/raw/aeat/irpf-2021/2026-06-03_aeat_irpf-2021-gravamen-autonomico-madrid.html`
  - `data/raw/aeat/irpf-2021/2026-06-03_aeat_irpf-2021-minimos-estatales.html`
  - `data/raw/aeat/irpf-2021/2026-06-03_aeat_irpf-2021-minimos-autonomicos.html`
  - `data/raw/aeat/irpf-2021/2026-06-03_aeat_irpf-2021-minimos-autonomicos-madrid-descendientes.html`
  - `data/raw/aeat/irpf-2021/2026-06-03_aeat_irpf-2021-gastos-articulo-19-2-f.html`
  - `data/raw/aeat/irpf-2021/2026-06-03_aeat_irpf-2021-reduccion-rendimientos-trabajo.html`
- Procesado:
  - `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2021.json`

## Transformaciones

- Se transcriben importes publicados en HTML oficial a JSON estructurado.
- Los grupos de cotizacion 8 a 11 conservan las bases diarias publicadas y anaden equivalente mensual de 30 dias para calculo mensual simple.
- La Orden PCM/1353/2021 fija topes y bases desde el 1 de septiembre de 2021; el JSON conserva ese cierre normativo y marca el hueco para subperiodos si se requiere calculo anual exacto.
- La escala estatal 2021 incluye el tramo adicional desde 300.000 euros introducido en 2021.
- La escala autonomica y los minimos de Madrid se mantienen separados de los estatales; Madrid solo sustituye importes del minimo por descendientes tercero y cuarto y siguientes.
- Se deja MEI y cotizacion adicional de solidaridad a 0 porque no aplican en 2021.
- El IVA se limita a tipos legales; no se calcula IVA medio por renta sin EPF compatible.

## Limitaciones

- No incluye CCAA completas ni deducciones autonomicas calculables.
- No replica el algoritmo oficial de retenciones AEAT 2021.
- No incluye contingencias profesionales por CNAE.
- No estima otros impuestos sin fuente y denominador del usuario.
- Para cotizacion anual exacta 2021 falta modelar enero-agosto y septiembre-diciembre por separado.

## Estado de uso

Usable como paquete normativo parcial para comparar 2021 contra otros anos parametrizados, siempre etiquetando que solo cubre caso base Comunidad de Madrid y que la cotizacion requiere cautela temporal si se busca exactitud anual.
