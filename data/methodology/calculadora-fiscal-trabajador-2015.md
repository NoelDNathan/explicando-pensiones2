# Calculadora fiscal del trabajador 2015

Fecha: 2026-06-01

Objetivo: dejar localizado y parametrizado un primer paquete oficial de datos para comparar la calculadora fiscal del trabajador con el ejercicio 2015.

## Alcance implementable

El paquete cubre trabajador por cuenta ajena del Regimen General, contrato indefinido o temporal basico, salario bruto anual y caso base Comunidad de Madrid.

No activa todavia un selector completo de comunidad autonoma para 2015. Para eso faltan escalas, minimos propios y catalogo de deducciones de todas las comunidades de regimen comun. Pais Vasco y Navarra siguen fuera del alcance por decision del proyecto.

La estimacion anual puede usar escalas IRPF y minimos, pero no debe presentarse como nomina mensual exacta hasta incorporar el algoritmo oficial de retenciones AEAT 2015.

## Fuentes oficiales usadas

- BOE: Orden ESS/86/2015, de 30 de enero, normas de cotizacion 2015.
- BOE: Ley 35/2006 del IRPF consolidada a 31 de diciembre de 2015.
- AEAT: Manual practico de Renta 2015, conservado como fuente bruta de contraste.
- BOE: Ley 4/2014 de la Comunidad de Madrid, con escala autonomica y minimos por descendientes aplicables en 2015.
- Agencia Tributaria: tipos impositivos de IVA como referencia general.

## Parametros recogidos

- Bases minimas y maximas mensuales del Regimen General por grupo de cotizacion. Los grupos 8 a 11 se publican en euros por dia y se guardan tambien como equivalente mensual multiplicando por 30.
- Tipos de cotizacion 2015: contingencias comunes, desempleo indefinido/temporal, FOGASA, formacion profesional y horas extra.
- Confirmacion de que en 2015 no existen MEI ni cotizacion adicional de solidaridad.
- Escala estatal general del IRPF 2015.
- Escala autonomica general de la Comunidad de Madrid 2015.
- Minimos personales/familiares estatales basicos y minimos por descendientes propios de Madrid.
- Gastos deducibles generales de rendimientos del trabajo y reduccion por obtencion de rendimientos del trabajo.
- Tipos de IVA general, reducido, superreducido y cero como estructura de parametros.

## Reglas de calculo recomendadas

1. Prorratear pagas extra en 12 bases mensuales para cotizacion.
2. Aplicar base minima o maxima mensual segun grupo de cotizacion.
3. Para grupos 8 a 11, si el usuario trabaja por dias o alta parcial, volver al valor diario publicado; para una primera calculadora anual a jornada completa, usar el equivalente mensual.
4. Calcular cuota obrera de Seguridad Social con contingencias comunes, desempleo y formacion profesional; FOGASA es solo empresa.
5. No aplicar MEI ni solidaridad en 2015.
6. Para IRPF anual, partir del rendimiento integro del trabajo, restar cotizaciones del trabajador y gastos deducibles, aplicar reducciones si proceden, calcular cuota estatal y autonomica con las escalas y restar la cuota correspondiente al minimo personal/familiar.
7. Para retencion de nomina, localizar e incorporar el algoritmo oficial AEAT 2015 antes de mostrar resultados mensuales.
8. Para IVA, no calcular media por rango de renta hasta procesar INE EPF 2015 o un tramo temporal compatible.

## Limitaciones

- Solo queda parametrizada Madrid como comunidad autonoma.
- Las deducciones autonomicas de Madrid no se han convertido en reglas de calculo automatico.
- La cotizacion por contingencias profesionales depende de actividad/CNAE y es cuota empresarial; queda fuera del calculo base.
- `Otros impuestos` queda pendiente porque requiere componentes, fuente y denominador.
- El paquete 2015 es normativo y no debe mezclarse con datos observados de recaudacion o consumo sin dataset separado.

## Archivo generado

- `data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2015.json`
