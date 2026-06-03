# Calculadora fiscal del trabajador 2018

Fecha de preparacion: 2026-06-03.

## Objetivo

Crear un paquete normativo trazable para calcular, como caso base, cotizaciones sociales e IRPF anual de una persona trabajadora por cuenta ajena del Regimen General en la Comunidad de Madrid durante 2018, documentando la regla transitoria de reduccion por rendimientos del trabajo.

## Fuentes

- BOE, Orden ESS/55/2018, de 26 de enero, para bases y tipos de cotizacion 2018.
- Agencia Tributaria, manual de ayuda de Renta 2018: gravamen estatal, gravamen autonomico, minimos personales/familiares y reduccion por obtencion de rendimientos del trabajo.
- Agencia Tributaria, Manual practico Renta y Patrimonio 2018 en PDF para gastos deducibles del articulo 19.2.f.
- Agencia Tributaria, tipos impositivos de IVA.

## Transformacion

- Se conservaron los brutos oficiales en `data/raw/boe/cotizaciones-2018/` y `data/raw/aeat/irpf-2018/`.
- Se transcribieron bases minimas y maxima del Regimen General.
- Para grupos 8 a 11, publicados en euros/dia, se conserva el valor diario y se calcula un equivalente mensual simple multiplicando por 30.
- Se transcribieron tipos de contingencias comunes, desempleo, FOGASA, formacion profesional, horas extra y ausencia de MEI/solidaridad.
- Se transcribio la escala estatal del IRPF 2018.
- Se extrajo la escala autonomica de Madrid desde la pagina AEAT de gravamen autonomico 2018.
- Se transcribieron minimos personales/familiares estatales y minimos por descendientes propios de Madrid.
- Se documentaron gastos deducibles y la reduccion por obtencion de rendimientos del trabajo.

## Regla transitoria 2018

La pagina AEAT de reduccion por rendimientos del trabajo 2018 distingue:

- contribuyentes fallecidos antes del 5 de julio de 2018, con la regla anterior: 3.700 euros hasta 11.250 euros de rendimiento neto del trabajo y formula decreciente hasta 14.450 euros;
- contribuyentes con devengo desde el 5 de julio hasta el 31 de diciembre de 2018, donde se aplica la mitad de la diferencia positiva entre la nueva regla y la regla anterior.

Por eso el JSON no copia la regla 2019 como si fuera aplicable completa a todo 2018. La deja documentada como `documented_not_fully_automated` hasta implementar el calculo transitorio.

## Resultado

- `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2018.json`.

## Limites

- Paquete parcial calculable para Comunidad de Madrid, con cautela de la reduccion transitoria de trabajo.
- No activa selector completo de CCAA ni deducciones autonomicas automaticas.
- No incluye algoritmo AEAT de retenciones mensuales 2018.
- La cotizacion por contingencias profesionales depende de CNAE u ocupacion y queda fuera del caso base.
- IVA y otros impuestos se mantienen como modulos separados, no como resta directa del salario bruto.
