# Calculadora fiscal del trabajador 2022

Fecha de documentacion: 2026-06-03.

## Objetivo

Crear un paquete normativo minimo para calcular, con trazabilidad, el caso base de un trabajador por cuenta ajena del Regimen General en 2022, usando Comunidad de Madrid como autonomia por defecto.

## Fuentes

- BOE, Orden PCM/244/2022, de 30 de marzo: `https://www.boe.es/buscar/doc.php?id=BOE-A-2022-5063`.
- AEAT, Manual practico Renta 2022, gravamen estatal de la base liquidable general.
- AEAT, Manual practico Renta 2022, gravamen autonomico Comunidad de Madrid.
- AEAT, Manual practico Renta 2022, cuadro de minimos personales y familiares estatal/autonomicos.
- AEAT, Manual practico Renta 2022, gastos deducibles del articulo 19.2.f LIRPF.
- AEAT, Manual practico Renta 2022, reduccion general por obtencion de rendimientos del trabajo.
- AEAT, tipos impositivos de IVA.

## Archivos

- Brutos:
  - `data/raw/boe/cotizaciones-2022/2026-06-03_boe_orden-pcm-244-2022-cotizacion-regimen-general.html`
  - `data/raw/aeat/irpf-2022/2026-06-03_aeat_irpf-2022-gravamen-estatal.html`
  - `data/raw/aeat/irpf-2022/2026-06-03_aeat_irpf-2022-gravamen-autonomico-madrid.html`
  - `data/raw/aeat/irpf-2022/2026-06-03_aeat_irpf-2022-minimos-estatal-autonomicos.html`
  - `data/raw/aeat/irpf-2022/2026-06-03_aeat_irpf-2022-gastos-articulo-19-2-f.html`
  - `data/raw/aeat/irpf-2022/2026-06-03_aeat_irpf-2022-reduccion-rendimientos-trabajo.html`
- Procesado:
  - `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2022.json`

## Transformaciones

- Se transcriben importes publicados en HTML oficial a JSON estructurado.
- Los grupos de cotizacion 8 a 11 conservan las bases diarias publicadas y anaden equivalente mensual de 30 dias para calculo mensual simple.
- Se deja MEI a 0 porque no aplica en 2022.
- La escala autonomica y minimos de Madrid se mantienen separados de los estatales; 2022 no se copia de 2023 porque los tramos y minimos de Madrid son distintos.
- El IVA se limita a tipos legales; no se calcula IVA medio por renta sin EPF compatible.

## Limitaciones

- No incluye CCAA completas ni deducciones autonomicas calculables.
- No replica el algoritmo oficial de retenciones AEAT 2022.
- No incluye contingencias profesionales por CNAE.
- No estima otros impuestos sin fuente y denominador del usuario.

## Estado de uso

Usable como paquete normativo parcial para comparar 2022 contra otros anos parametrizados, siempre etiquetando que solo cubre caso base Comunidad de Madrid.
