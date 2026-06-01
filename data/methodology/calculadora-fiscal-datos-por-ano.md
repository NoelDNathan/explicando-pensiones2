# Como obtener datos para la calculadora fiscal por ano

Fecha: 2026-06-01

Objetivo: guiar futuras interacciones para reconstruir los parametros de la calculadora fiscal de cualquier ano, especialmente cuando se compare 2025 con anos pasados. No usar este documento para proyectar anos futuros salvo que exista norma aprobada o se etiquete explicitamente como escenario.

## Alcance funcional decidido

La calculadora debe usar estos factores del usuario:

| Factor | Efecto principal | Parametros que hay que obtener para cada ano |
| --- | --- | --- |
| Salario bruto anual | IRPF, cotizacion del trabajador, posible solidaridad si supera base maxima | Escalas IRPF, gastos/reducciones de trabajo, bases maximas/minimas y tipos de cotizacion |
| Comunidad autonoma | Cuota autonomica IRPF y minimos/deducciones propios | Escala autonomica, minimos autonomicos y deducciones seleccionadas de la CCAA |
| Edad | Minimo del contribuyente y posible minimo incrementado | Minimo personal general, incremento mayores de 65 y mayores de 75 |
| Estado civil | Retencion y posible tributacion conjunta si se implementa | Situaciones familiares del algoritmo de retenciones y reglas de unidad familiar |
| Hijos a cargo | Minimos por descendientes y posibles deducciones | Minimos por descendientes, menor de 3 anos, discapacidad y deducciones aplicables |
| Personas a cargo | Minimos por ascendientes o discapacidad de dependientes | Minimos por ascendientes, edad, convivencia, renta maxima y discapacidad |
| Discapacidad | Minimos, gastos deducibles incrementados y deducciones | Minimos por discapacidad, asistencia/reducida movilidad, trabajador activo con discapacidad |
| Categoria profesional | Base minima de cotizacion | Grupo de cotizacion y base minima/maxima del ano |
| Movilidad geografica | Mayor gasto deducible de rendimientos del trabajo | Importe del incremento por movilidad y requisitos de aplicacion |

No comparar con futuro en esta fase. La comparacion sera contra anos pasados y cada ano debe tener su propio paquete normativo.

## Fuentes oficiales por bloque

| Bloque | Fuente prioritaria | Que buscar | Archivo esperado |
| --- | --- | --- | --- |
| IRPF estatal | Agencia Tributaria, Manual practico de Renta del ejercicio | Escala estatal, minimo personal/familiar, discapacidad, rendimientos del trabajo, reducciones | JSON de parametros y enlace en `data/sources.md` |
| IRPF autonomico | Agencia Tributaria, Manual practico de Renta del ejercicio; Ministerio de Hacienda, fiscalidad autonomica | Escala por CCAA, minimos autonomicos, deducciones seleccionadas | JSON por ano con claves por CCAA |
| Retenciones | Agencia Tributaria, programa/algoritmo de retenciones del ejercicio | Situaciones familiares, minimo excluido, tipo de retencion y version vigente | Nota metodologica; usar algoritmo oficial si se calcula nomina |
| Cotizaciones | BOE y Seguridad Social, orden anual de cotizacion | Bases por grupo, tipos, MEI cuando exista, desempleo, formacion, FOGASA, solidaridad cuando exista | JSON por ano con `social_security` |
| Categoria profesional | Seguridad Social, bases por grupo de cotizacion | Correspondencia grupo-categoria y bases minimas | Dentro del bloque de cotizaciones |
| IVA | Agencia Tributaria, tipos impositivos del IVA del ano | Tipo general, reducido, superreducido, cero/exenciones relevantes | JSON `vat` por ano |
| Cesta de consumo para IVA | INE, Encuesta de Presupuestos Familiares | Gasto medio por COICOP y estructura de consumo si se quiere aproximacion por cesta | CSV separado; no mezclar con normativa |
| Otros impuestos aproximados | Agencia Tributaria y normas estatales/locales segun componente | Impuestos especiales, electricidad, carburantes, IBI/IVTM si se modelan | Modulo separado con estado `estimado` |

## Metodo recomendado por ano

1. Crear un archivo de parametros por ejercicio: `data/processed/fiscal/YYYY-MM-DD_calculadora-fiscal-trabajador-parametros-AAAA.json`.
2. Registrar antes las fuentes en `data/sources.md` con institucion, URL, fecha de consulta/descarga y periodo.
3. Separar normativa de estimaciones:
   - normativa: IRPF, cotizaciones, IVA legal;
   - estimacion: IVA soportado por consumo y otros impuestos aproximados.
4. Para IRPF anual, guardar al menos:
   - escala estatal;
   - escalas autonomicas;
   - minimos personales/familiares estatal y autonomicos;
   - discapacidad;
   - gastos deducibles de trabajo;
   - reducciones por rendimientos del trabajo;
   - movilidad geografica;
   - deducciones seleccionadas, si se implementan.
5. Para retenciones de nomina, no reconstruir a ojo: localizar el algoritmo/programa oficial de retenciones del ejercicio y documentar version y fecha de aplicacion.
6. Para cotizaciones, guardar:
   - bases minimas/maximas por grupo;
   - tipos trabajador/empresa;
   - desempleo por tipo de contrato;
   - MEI y solidaridad solo en los anos en que existan;
   - notas de cambios normativos.
7. Para IVA aproximado:
   - opcion media: usar INE EPF para gasto medio por categoria y tramo de ingresos/renta, mapear COICOP a tipos de IVA y mostrarlo como referencia por rango;
   - opcion personalizada: pedir al usuario gasto anual por categorias de consumo comprensibles y aplicar tipos por defecto ajustables;
   - mostrar siempre como `IVA estimado`, no como impuesto exacto.
8. Para otros impuestos:
   - en la primera version usar media espanola estimada, no formulario detallado;
   - etiquetar como `estimado_promedio` y documentar fuente, componentes incluidos y denominador;
   - no incluir IVA para evitar doble conteo;
   - mantener separado del salario neto, porque no sale directamente de la nomina.

## Estructura minima del JSON

```json
{
  "dataset_id": "fiscal-worker-calculator-params-AAAA",
  "scope": {
    "year": 2025,
    "comparison_policy": "comparar solo con anos con parametros normativos propios",
    "included_user_factors": [
      "salario_bruto_anual",
      "comunidad_autonoma",
      "edad",
      "estado_civil",
      "hijos_a_cargo",
      "personas_a_cargo",
      "discapacidad",
      "categoria_profesional",
      "movilidad_geografica"
    ]
  },
  "social_security": {},
  "irpf": {},
  "vat": {
    "approximation_policy": "por consumo declarado o cesta simplificada"
  },
  "other_taxes": {
    "approximation_policy": "modulo separado y estimado"
  }
}
```

## Criterios de aceptacion antes de usar en la web

- Cada parametro debe tener fuente oficial o institucional.
- Cada ano comparado debe tener su propio paquete de parametros; no aplicar reglas 2025 a anos pasados.
- Si falta una CCAA, el selector no debe permitirla o debe marcarla como pendiente. Para 2025 ya estan cubiertas las CCAA de regimen comun en escalas y minimos; Pais Vasco y Navarra se ignoran por alcance.
- Si falta una condicion personal, el resultado debe avisar que no la contempla.
- Las deducciones autonomicas pueden estar localizadas como catalogo de fuente sin estar listas para calculo. Solo se aplicaran cuando cada deduccion tenga importes, limites, requisitos, incompatibilidades y campos de usuario necesarios.
- IVA y otros impuestos deben aparecer como aproximaciones separadas de `neto laboral`.
- Cualquier dato medio de consumo debe vivir en `data/processed/` como dataset separado, con metadata y checksums.
- La metodologia especifica de IVA y otros impuestos esta en `data/methodology/calculadora-fiscal-iva-otros-impuestos.md`.

## Fuentes de referencia iniciales

- BOE y Seguridad Social para cotizaciones anuales.
- Agencia Tributaria para Manual practico de Renta, retenciones e IVA.
- INE EPF para estructura de gasto de hogares si se usa cesta media.
- Ministerio de Hacienda para normativa autonomica y local cuando AEAT no centralice todo el detalle.
