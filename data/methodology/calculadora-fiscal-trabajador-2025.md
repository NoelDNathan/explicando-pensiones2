# Calculadora fiscal del trabajador 2025

Fecha: 2026-06-01

Objetivo: dejar localizados y parametrizados los datos oficiales necesarios para sustituir los valores de maqueta de la calculadora fiscal 2025 por un calculo trazable.

## Alcance implementable

El paquete de parametros creado cubre el caso base que aparece hoy en la interfaz: trabajador por cuenta ajena del Regimen General, contrato indefinido, residente en la Comunidad de Madrid, salario bruto anual y consumo anual estimado por el usuario.

Quedan fuera del calculo base los autonomos, empleados de hogar, sistema agrario, trabajadores del mar, artistas, taurinos, regimenes forales, deducciones autonomicas completas y contingencias profesionales por CNAE.

## Fuentes oficiales usadas

- BOE: Orden PJC/178/2025, de 25 de febrero, normas de cotizacion 2025.
- Agencia Tributaria: Manual practico de Renta 2025, gravamen estatal, gravamen autonomico de Madrid, minimo personal y familiar, gastos/reducciones de rendimientos del trabajo y pagina del algoritmo oficial de retenciones 2025.
- Agencia Tributaria: tipos impositivos de IVA 2025.

## Parametros recogidos

- Bases minimas y maximas mensuales del Regimen General por grupo de cotizacion.
- Tipos de cotizacion 2025: contingencias comunes, desempleo indefinido/temporal, FOGASA, formacion profesional, MEI, horas extra y cotizacion adicional de solidaridad.
- Escala estatal general del IRPF 2025.
- Escala autonomica general de la Comunidad de Madrid 2025.
- Minimos personales y familiares estatales basicos.
- Gastos deducibles generales de rendimientos del trabajo y reduccion por obtencion de rendimientos del trabajo.
- Tipos de IVA general, reducido, superreducido y cero.

## Reglas de calculo recomendadas

1. Prorratear pagas extra en 12 bases mensuales para cotizacion.
2. Aplicar base minima o maxima mensual segun grupo de cotizacion.
3. Calcular cuota obrera de Seguridad Social con contingencias comunes, desempleo, formacion profesional y MEI; FOGASA es solo empresa.
4. Para salarios por encima de la base maxima, aplicar la cuota de solidaridad por tramos mensuales.
5. Para IRPF anual, partir del rendimiento integro del trabajo, restar cotizaciones del trabajador y gastos deducibles, aplicar reducciones si proceden, calcular cuota estatal y autonomica con las escalas y restar la cuota correspondiente al minimo personal/familiar.
6. Para retencion de nomina, no aproximar con la escala anual: usar el algoritmo oficial AEAT de retenciones 2025.
7. Para IVA, pedir gasto anual y porcentaje de gasto por tipo; si el gasto esta expresado con IVA incluido, extraer la cuota con `gasto * tipo / (100 + tipo)`.

## Limitaciones

- La escala autonomica solo esta parametrizada para Madrid. Para que el selector de comunidad sea real, hay que incorporar todas las escalas autonomicas y minimos autonomicos aplicables.
- Las deducciones estatales/autonomicas pueden cambiar mucho el resultado individual; no se incluyen salvo los minimos y reducciones basicas.
- La cotizacion por contingencias profesionales depende de actividad/CNAE y es cuota empresarial; no debe inventarse.
- `Otros impuestos` no es una magnitud directamente deducible del salario bruto. Debe eliminarse, pedirse como entrada o transformarse en un modulo de consumo/patrimonio con fuentes propias.

## Archivo generado

- `data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json`
