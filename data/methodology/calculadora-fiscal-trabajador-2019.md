# Calculadora fiscal del trabajador 2019

Fecha de preparacion: 2026-06-03.

## Objetivo

Crear un paquete normativo trazable para calcular, como caso base, cotizaciones sociales e IRPF anual de una persona trabajadora por cuenta ajena del Regimen General en la Comunidad de Madrid durante 2019.

## Fuentes

- BOE, Orden TMS/83/2019, de 31 de enero, para bases y tipos de cotizacion 2019.
- BOE, correccion de erratas BOE-A-2019-1932.
- Agencia Tributaria, manual de ayuda de Renta 2019: gravamen estatal, gravamen autonomico, minimos personales/familiares, gastos deducibles y reduccion por obtencion de rendimientos del trabajo.
- Agencia Tributaria, tipos impositivos de IVA.

## Transformacion

- Se conservaron los brutos HTML oficiales en `data/raw/boe/cotizaciones-2019/` y `data/raw/aeat/irpf-2019/`.
- Se transcribieron bases minimas y maxima del Regimen General.
- Para grupos 8 a 11, publicados en euros/dia, se conserva el valor diario y se calcula un equivalente mensual simple multiplicando por 30.
- Se transcribieron tipos de contingencias comunes, desempleo, FOGASA, formacion profesional, horas extra y ausencia de MEI/solidaridad.
- Se transcribio la escala estatal del IRPF 2019.
- Se extrajo la escala autonomica de Madrid desde la pagina AEAT de gravamen autonomico 2019.
- Se transcribieron minimos personales/familiares estatales y minimos por descendientes propios de Madrid.
- Se transcribieron gastos deducibles del articulo 19.2.f y reduccion general por obtencion de rendimientos del trabajo.

## Resultado

- `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2019.json`.

## Limites

- Paquete parcial calculable para Comunidad de Madrid.
- No activa selector completo de CCAA ni deducciones autonomicas automaticas.
- No incluye algoritmo AEAT de retenciones mensuales 2019.
- La cotizacion por contingencias profesionales depende de CNAE u ocupacion y queda fuera del caso base.
- IVA y otros impuestos se mantienen como modulos separados, no como resta directa del salario bruto.
