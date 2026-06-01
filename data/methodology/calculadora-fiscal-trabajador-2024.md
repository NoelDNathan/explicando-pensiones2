# Calculadora fiscal del trabajador 2024

Fecha: 2026-06-02

Objetivo: anadir un paquete normativo 2024 trazable para continuar la comparacion historica de la calculadora fiscal del trabajador.

## Alcance implementable

El paquete cubre trabajador por cuenta ajena del Regimen General, contrato indefinido y caso base Comunidad de Madrid. Se puede usar para comparar 2024 con otros anos ya parametrizados, siempre que la comparacion use el mismo perfil laboral y territorial.

No activa todavia selector completo de comunidad autonoma. Para eso hay que transcribir y validar las escalas y minimos autonomicos 2024 de las CCAA de regimen comun. Pais Vasco y Navarra siguen fuera del alcance por decision metodologica del proyecto.

## Fuentes oficiales usadas

- BOE: Orden PJC/51/2024, de 29 de enero, normas de cotizacion 2024, con modificacion de bases minimas por Orden PJC/281/2024.
- Agencia Tributaria: Manual practico de Renta 2024, gravamen estatal.
- Agencia Tributaria: Manual practico de Renta 2024, gravamen autonomico Comunidad de Madrid.
- Agencia Tributaria: cuadro comparativo de minimos personales y familiares estatales/autonomicos 2024.
- Agencia Tributaria: gastos deducibles del articulo 19.2.f de la Ley del IRPF.
- Agencia Tributaria: reduccion general por obtencion de rendimientos del trabajo 2024.
- Agencia Tributaria: tipos impositivos de IVA.

## Parametros recogidos

- Bases minimas y maximas mensuales del Regimen General por grupo de cotizacion.
- Tipos de cotizacion 2024: contingencias comunes, desempleo indefinido/temporal, FOGASA, formacion profesional, MEI y horas extra.
- Escala estatal general del IRPF 2024.
- Escala autonomica general de la Comunidad de Madrid 2024.
- Minimos personales y familiares estatales basicos.
- Minimos personales y familiares autonomicos de la Comunidad de Madrid.
- Gastos deducibles generales de rendimientos del trabajo y reduccion por obtencion de rendimientos del trabajo.
- Tipos legales generales de IVA.

## Reglas de calculo recomendadas

1. Prorratear pagas extra en 12 bases mensuales para cotizacion.
2. Aplicar base minima o maxima mensual segun grupo de cotizacion.
3. Calcular cuota obrera con contingencias comunes, desempleo, formacion profesional y MEI. FOGASA es solo empresa.
4. No aplicar cotizacion adicional de solidaridad en 2024.
5. Para IRPF anual, partir del rendimiento integro del trabajo, restar cotizaciones del trabajador y gastos deducibles, aplicar reducciones si proceden, calcular cuota estatal y autonomica con sus escalas y restar la cuota correspondiente al minimo personal/familiar.
6. Para retenciones de nomina, no aproximar con la escala anual: incorporar el algoritmo oficial AEAT de retenciones 2024 si se necesita esa vista.
7. Para IVA, pedir gasto anual y porcentaje de gasto por tipo; si el gasto esta expresado con IVA incluido, extraer la cuota con `gasto * tipo / (100 + tipo)`.

## Limitaciones

- Solo queda calculable Madrid como caso base.
- Las deducciones autonomicas pueden cambiar el resultado individual y no se aplican automaticamente.
- La cotizacion por contingencias profesionales depende de actividad/CNAE y no se inventa.
- El IVA es un modulo de consumo separado del salario neto laboral.
- Este paquete no contiene datos de 2026 ni proyecciones.

## Archivos generados

- `data/processed/fiscal/2026-06-02_calculadora-fiscal-trabajador-parametros-2024.json`
- `data/raw/boe/cotizaciones-2024/2026-06-02_boe_orden-pjc-51-2024-cotizacion-regimen-general.html`
- `data/raw/aeat/irpf-2024/2026-06-02_aeat_irpf-2024-gravamen-estatal.html`
- `data/raw/aeat/irpf-2024/2026-06-02_aeat_irpf-2024-gravamen-autonomico-madrid.html`
- `data/raw/aeat/irpf-2024/2026-06-02_aeat_irpf-2024-minimos-estatal-autonomicos.html`
- `data/raw/aeat/irpf-2024/2026-06-02_aeat_irpf-2024-gastos-articulo-19-2-f.html`
- `data/raw/aeat/irpf-2024/2026-06-02_aeat_irpf-2024-reduccion-rendimientos-trabajo.html`
