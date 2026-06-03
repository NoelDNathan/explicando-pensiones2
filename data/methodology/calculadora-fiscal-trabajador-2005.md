# Calculadora fiscal del trabajador 2005

Fecha de preparacion: 2026-06-03.

## Objetivo

Cerrar la cobertura del ejercicio 2005 para la calculadora fiscal del trabajador por cuenta ajena en Regimen General y caso base Comunidad de Madrid. Se mantiene como paquete `legacy` porque el IRPF vigente antes de 2007 no usa la misma mecanica que los anos modernos.

## Fuentes

- BOE, Orden TAS/77/2005, de 18 de enero, para bases y tipos de cotizacion 2005.
- BOE, Real Decreto Legislativo 3/2004, texto refundido de la Ley del IRPF, version consolidada a 31 de diciembre de 2005.
- BOE, Ley 5/2004 de la Comunidad de Madrid, de medidas fiscales y administrativas para 2005, revisada para comprobar si contiene escala autonomica propia o deducciones IRPF aplicables al caso base.

## Transformacion

- Se conservaron brutos oficiales en `data/raw/boe/cotizaciones-2005/` y `data/raw/boe/irpf-2005/`.
- Se transcribieron bases minima/maxima del Regimen General y los tipos de contingencias comunes, desempleo, FOGASA, formacion profesional y horas extra.
- Para los grupos 8 a 11, publicados en euros/dia, se conserva el valor diario y se calcula equivalente mensual de 30 dias.
- Se transcribio la escala estatal general del IRPF.
- Se transcribio la escala complementaria del RDL 3/2004 para Madrid 2005.
- Se reviso la Ley 5/2004 de Madrid con busquedas por `Renta`, `IRPF`, `Impuesto sobre la Renta`, `deducci`, `escala`, `tarifa` y `auton`; no se localizo escala autonomica propia ni deducciones IRPF especificas para el calculo base.
- Se transcribieron minimos y reducciones personales/familiares como reducciones en base: minimo personal, descendientes, cuidado de hijos, edad, asistencia y discapacidad.
- Se documento la reduccion por rendimientos del trabajo de 2005.

## Ruptura metodologica

El IRPF 2005 no debe conectarse directamente al algoritmo moderno de la calculadora. En este ejercicio:

- el minimo personal y familiar reduce la base imponible;
- la reduccion por rendimientos del trabajo tambien opera sobre base;
- las escalas estatal y complementaria se aplican despues de esas minoraciones.

En los paquetes modernos, los minimos personales y familiares se tratan como cuota del minimo gravado por escala. Esa diferencia exige una rama de calculo especifica para 2005.

## Resultado

- `data/processed/fiscal/2026-06-03_calculadora-fiscal-trabajador-parametros-2005.json`.
- El JSON incluye un caso de prueba reproducible: salario bruto 30.000 euros, contrato indefinido, grupo 7, Madrid, sin hijos ni discapacidad. Resultado esperado: cotizacion trabajador 1.905,00 euros; coste empresarial sin AT/EP 9.180,00 euros; base general IRPF tras reducciones 22.295,00 euros; cuota estatal 3.501,59 euros; cuota complementaria 1.829,01 euros; IRPF total 5.330,60 euros; neto tras cotizacion trabajador e IRPF 22.764,40 euros.

## Limites

- Paquete de datos cerrado para caso base Madrid 2005, pero no listo para pasar por la UI moderna hasta crear una rama de calculo IRPF pre-2007.
- Madrid se documenta con escala complementaria estatal tras revisar la Ley 5/2004 descargada.
- No incluye deducciones autonomicas como reglas calculables.
- No incluye algoritmo AEAT de retenciones 2005.
- La cotizacion por contingencias profesionales queda fuera por depender de tarifa de primas.
