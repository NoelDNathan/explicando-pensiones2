# Calculadora fiscal del trabajador 2020

Fecha de documentacion: 2026-06-03.

## Objetivo

Crear un paquete normativo minimo para calcular, con trazabilidad, el caso base de un trabajador por cuenta ajena del Regimen General en 2020, usando Comunidad de Madrid como autonomia por defecto.

## Fuentes

- BOE, Real Decreto-ley 18/2019, de 27 de diciembre: `https://www.boe.es/eli/es/rdl/2019/12/27/18/con`.
- BOE, Orden TMS/83/2019, de 31 de enero, prorrogada en materia de cotizacion para 2020: `https://www.boe.es/buscar/doc.php?id=BOE-A-2019-1366`.
- AEAT, Manual practico Renta 2020, gravamen estatal de la base liquidable general.
- AEAT, Manual practico Renta 2020, gravamen autonomico Comunidad de Madrid.
- AEAT, Manual practico Renta 2020, minimos personales y familiares estatales.
- AEAT, Manual practico Renta 2020, minimo por descendientes Comunidad de Madrid.
- AEAT, Manual practico Renta 2020, gastos deducibles del articulo 19.2.f LIRPF.
- AEAT, Manual practico Renta 2020, reduccion general por obtencion de rendimientos del trabajo.
- AEAT, tipos impositivos de IVA.

## Archivos

- Brutos:
  - `data/raw/boe/cotizaciones-2020/2026-06-03_boe_real-decreto-ley-18-2019-prorroga-cotizacion-2020.html`
  - `data/raw/boe/cotizaciones-2020/2026-06-03_boe_orden-tms-83-2019-cotizacion-prorrogada-2020.html`
  - `data/raw/aeat/irpf-2020/2026-06-03_aeat_irpf-2020-gravamen-estatal.html`
  - `data/raw/aeat/irpf-2020/2026-06-03_aeat_irpf-2020-gravamen-autonomico-madrid.html`
  - `data/raw/aeat/irpf-2020/2026-06-03_aeat_irpf-2020-minimos-estatales.html`
  - `data/raw/aeat/irpf-2020/2026-06-03_aeat_irpf-2020-minimos-autonomicos.html`
  - `data/raw/aeat/irpf-2020/2026-06-03_aeat_irpf-2020-minimos-autonomicos-madrid-descendientes.html`
  - `data/raw/aeat/irpf-2020/2026-06-03_aeat_irpf-2020-gastos-articulo-19-2-f.html`
  - `data/raw/aeat/irpf-2020/2026-06-03_aeat_irpf-2020-reduccion-rendimientos-trabajo.html`
- Procesado:
  - `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2020.json`

## Transformaciones

- Se transcriben importes publicados en HTML oficial a JSON estructurado.
- La cotizacion 2020 se documenta como prorroga normativa: el Real Decreto-ley 18/2019 mantiene la aplicacion de la Orden TMS/83/2019 en materia de cotizacion mientras no se oponga a dicho real decreto-ley.
- Los grupos de cotizacion 8 a 11 conservan las bases diarias publicadas y anaden equivalente mensual de 30 dias para calculo mensual simple.
- La escala estatal 2020 no incluye el tramo de 300.000 euros que aparece desde 2021.
- La escala autonomica y los minimos de Madrid se mantienen separados de los estatales; Madrid solo sustituye importes del minimo por descendientes tercero y cuarto y siguientes.
- Se deja MEI y cotizacion adicional de solidaridad a 0 porque no aplican en 2020.
- El IVA se limita a tipos legales; no se calcula IVA medio por renta sin EPF compatible.

## Limitaciones

- No incluye CCAA completas ni deducciones autonomicas calculables.
- No replica el algoritmo oficial de retenciones AEAT 2020.
- No incluye contingencias profesionales por CNAE.
- No estima otros impuestos sin fuente y denominador del usuario.

## Estado de uso

Usable como paquete normativo parcial para comparar 2020 contra otros anos parametrizados, siempre etiquetando que solo cubre caso base Comunidad de Madrid y que la cotizacion procede de normativa prorrogada.
