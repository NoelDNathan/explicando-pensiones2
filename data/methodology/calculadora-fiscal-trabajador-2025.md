# Calculadora fiscal del trabajador 2025

Fecha: 2026-06-01

Objetivo: dejar localizados y parametrizados los datos oficiales necesarios para sustituir los valores de maqueta de la calculadora fiscal 2025 por un calculo trazable.

## Alcance implementable

El paquete de parametros creado cubre trabajador por cuenta ajena del Regimen General, contrato indefinido, salario bruto anual, consumo anual estimado por el usuario y selector de comunidad autonoma para las CCAA de regimen comun. Pais Vasco y Navarra quedan fuera del alcance por decision del proyecto.

La calculadora 2025 no debe comparar con 2030 ni con ningun futuro en esta fase. La comparacion posterior se hara con anos pasados, siempre que cada ano tenga su propio paquete normativo.

Los factores de usuario que si se tendran en cuenta en este proyecto son: salario bruto anual, comunidad autonoma, edad, estado civil, hijos a cargo, personas a cargo, discapacidad, categoria profesional y movilidad geografica.

Quedan fuera del calculo base los autonomos, empleados de hogar, sistema agrario, trabajadores del mar, artistas, taurinos, regimenes forales y aplicacion automatica de deducciones autonomicas completas. La cotizacion por contingencias profesionales AT/EP se incorpora solo como selector didactico con una seleccion trazable de actividades frecuentes y ocupaciones especiales 2025; no sustituye a la determinacion completa de la TGSS.

## Fuentes oficiales usadas

- BOE: Orden PJC/178/2025, de 25 de febrero, normas de cotizacion 2025.
- BOE: Ley 42/2006, disposicion adicional cuarta, tarifa de primas AT/EP aplicable en 2025 por remision de la Orden PJC/178/2025. Redaccion vigente tras Real Decreto-ley 28/2018, con CNAE-2009 y Cuadro II de ocupaciones especiales.
- Agencia Tributaria: Manual practico de Renta 2025, gravamen estatal, gravamen autonomico por CCAA, cuadro de minimos personales/familiares estatales y autonomicos, guia de deducciones autonomicas, gastos/reducciones de rendimientos del trabajo y pagina del algoritmo oficial de retenciones 2025.
- Agencia Tributaria: tipos impositivos de IVA 2025.

## Parametros recogidos

- Bases minimas y maximas mensuales del Regimen General por grupo de cotizacion.
- Tipos de cotizacion 2025: contingencias comunes, desempleo indefinido/temporal, FOGASA, formacion profesional, MEI, horas extra y cotizacion adicional de solidaridad.
- Seleccion de tipos AT/EP 2025: categorias frecuentes del Cuadro I y todas las ocupaciones especiales del Cuadro II usadas por el selector de la UI. Cada categoria conserva IT, IMS y total como suma.
- Escala estatal general del IRPF 2025.
- Escalas autonomicas generales de las CCAA de regimen comun 2025, excluyendo Pais Vasco y Navarra.
- Minimos personales y familiares estatales basicos y minimos autonomicos propios cuando la CCAA fija importes diferentes.
- Gastos deducibles generales de rendimientos del trabajo y reduccion por obtencion de rendimientos del trabajo.
- Tipos de IVA general, reducido, superreducido y cero.
- Catalogo AEAT de familias de deducciones autonomicas 2025: hijos/nacimiento/adopcion/acogimiento, familia numerosa o monoparental, discapacidad, dependencia/personas a cargo, alquiler de vivienda habitual, guarderia, empleados de hogar/cuidado de dependientes, entre otras.

## Reglas de calculo recomendadas

1. Prorratear pagas extra en 12 bases mensuales para cotizacion.
2. Aplicar base minima o maxima mensual segun grupo de cotizacion.
3. Calcular cuota obrera de Seguridad Social con contingencias comunes, desempleo, formacion profesional y MEI; FOGASA y AT/EP son solo empresa.
4. Para salarios por encima de la base maxima, aplicar la cuota de solidaridad por tramos mensuales.
5. Para IRPF anual, partir del rendimiento integro del trabajo, restar cotizaciones del trabajador y gastos deducibles, aplicar reducciones si proceden, calcular cuota estatal y autonomica con las escalas y restar la cuota correspondiente al minimo personal/familiar.
6. Para AT/EP, aplicar `base de contingencias profesionales * (IT + IMS)`. IT cubre incapacidad temporal derivada de contingencias profesionales; IMS cubre incapacidad permanente, muerte y supervivencia.
7. Para retencion de nomina, no aproximar con la escala anual: usar el algoritmo oficial AEAT de retenciones 2025.
8. Para IVA, pedir gasto anual y porcentaje de gasto por tipo; si el gasto esta expresado con IVA incluido, extraer la cuota con `gasto * tipo / (100 + tipo)`.
9. Para IVA aproximado, ofrecer dos opciones: media por rango salarial/renta si se procesa INE EPF, y personalizado por gasto declarado en categorias de consumo.
10. Para `otros impuestos`, crear un modulo separado con media espanola estimada. No pedir datos detallados en la primera version y no mezclarlo con salario neto laboral.

## Limitaciones

- Las escalas autonomicas y minimos propios quedan parametrizados para CCAA de regimen comun. Pais Vasco y Navarra no se incorporan.
- Las deducciones estatales/autonomicas pueden cambiar mucho el resultado individual. Para autonomicas hay catalogo oficial localizado, pero no se aplican automaticamente hasta codificar importes, limites, requisitos e incompatibilidades de cada deduccion.
- La cotizacion por contingencias profesionales depende de actividad/CNAE u ocupacion y es cuota empresarial. El selector actual usa una seleccion 2025, no la tarifa completa; para casos reales la determinacion corresponde a la Tesoreria General de la Seguridad Social.
- `Otros impuestos` no es una magnitud directamente deducible del salario bruto. En este proyecto se tratara como aproximacion separada, basada en datos declarados por el usuario o en una cesta media documentada.
- La guia para replicar este paquete en otros ejercicios esta en `data/methodology/calculadora-fiscal-datos-por-ano.md`.
- La metodologia especifica de IVA y otros impuestos esta en `data/methodology/calculadora-fiscal-iva-otros-impuestos.md`.
- La especificacion detallada de datos, orden, formulas y validaciones de reducciones, minimos, deducciones y salario en especie esta en `data/methodology/calculadora-fiscal-irpf-2025-reducciones-deducciones.md`.

## Archivo generado

- `data/processed/fiscal/2026-06-01_calculadora-fiscal-trabajador-parametros-2025.json`
- `data/processed/fiscal/2026-06-01_aeat-irpf-2025-ccaa-regimen-comun-cobertura.json`
- `data/processed/fiscal/2026-06-02_ine-epf-2024-iva-medio-proxy-2025.json`
- `data/processed/fiscal/2026-06-02_aeat-otros-impuestos-2025-modulo-contexto.json`
- `data/processed/fiscal/2026-07-12_boe-tarifa-at-ep-2025-seleccion.json`

## Integracion en la UI

La ruta `/calculadora-fiscal` queda conectada al paquete normativo 2025. La pantalla calcula salario neto laboral anual a partir de salario bruto, CCAA de regimen comun, edad, hijos, ascendientes, discapacidad y movilidad geografica.

Las deducciones autonomicas no se aplican automaticamente porque el catalogo AEAT exige requisitos heterogeneos por deduccion: nacimiento/adopcion en ano concreto, convivencia, familia numerosa, alquiler, edad, municipios, limites de base individual y familiar, incompatibilidades y justificantes. La UI permite introducir una deduccion autonomica ya verificada por el usuario o por una futura regla especifica.

Desde 2026-07-17, el calculo anual 2025 usa un nucleo compartido y auditable para los pasos 4 y 5. Implementa el orden completo desde el rendimiento integro del trabajo hasta el resultado estimado de la declaracion, separando gastos, reducciones de base, minimos, cuotas estatal y autonomica, deducciones ordinarias, deduccion por rendimientos del trabajo, deducciones reembolsables, retenciones y abonos anticipados.

La interfaz recoge datos estructurados para cuotas sindicales/colegiales y defensa juridica; movilidad; prevision social individual y de empleo; aportaciones al conyuge; pension compensatoria; tributacion conjunta; patrimonios protegidos; anualidades por alimentos; donativos; alquiler y vivienda en regimen transitorio; empresas nuevas; maternidad; guarderia; familia numerosa; discapacidad a cargo; y retribuciones en especie. Los minimos de descendientes y ascendientes se calculan por persona y respetan requisitos, prorrateo y la incompatibilidad con anualidades por alimentos.

Las deducciones y reducciones autonomicas sin regla versionada no se inventan: solo se aplican mediante importe manual verificado con codigo, fuente y memoria de calculo. Sigue pendiente convertir el catalogo completo de cada comunidad en reglas automaticas y contrastar expedientes integrales con Renta WEB 2025.

La regresion numerica del nucleo se ejecuta con `pnpm run verify:irpf2025`. Incluye 23 comprobaciones: salarios de 16.576, 18.000, 20.000 y 35.000 EUR, limites de gastos y prevision social, retribuciones en especie, donativos, vivienda, alquiler, empresas nuevas y deducciones reembolsables.

El IVA medio por renta/salario se implementa como proxy de contexto usando INE EPF 2024 por nivel de ingresos mensuales netos del hogar y grupo COICOP a 2 digitos. No es dato observado 2025 ni IVA individual exacto. La EPF 2025 anual no se usa como fuente observada en esta revision.

`Otros impuestos` se convierte en modulo separado: por defecto 0 euros y entrada manual. La fuente AEAT 2025 se conserva como contexto agregado de impuestos especiales y otras figuras, pero no se divide por hogares, trabajadores o adultos porque la recaudacion mezcla consumo de hogares, empresas, operaciones exteriores y figuras no atribuibles directamente a un trabajador.
