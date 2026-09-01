# Recaudacion por figura tributaria y cotizaciones (2024)

Fecha: 2026-09-01

Objetivo: dar contexto agregado al paso 10 de la calculadora fiscal. Cuando una persona ve cuanto paga de IRPF, IVA, cotizaciones, impuestos especiales, IBI e IVTM, el paso 10 muestra tambien cuanto recauda el conjunto de Administraciones Publicas por esas mismas figuras.

## Fuente unica y por que

Se usa una sola fuente para todas las figuras: IGAE, *Contabilidad nacional. Serie anual. Impuestos y cotizaciones sociales de las Administraciones publicas*, hoja `Tabla1a` del fichero de Administraciones Publicas (S.13), actualizacion de 30/09/2025.

Motivo: es la unica publicacion que da, en el mismo marco contable (SEC 2010), el mismo ano y el mismo sector, tanto los impuestos estatales gestionados por la AEAT como los tributos locales (IBI, IVTM) y las cotizaciones sociales. La alternativa era mezclar el Informe Anual de Recaudacion Tributaria de la AEAT (caja, solo territorio comun, sin tributos locales) con presupuestos de la Seguridad Social y con estimaciones locales; eso incumpliria la regla 9 del protocolo porque combinaria criterios de devengo, caja y presupuesto.

El ultimo ano disponible en la fuente es 2024, marcado como provisional (P). Por eso el bloque editorial esta fechado en 2024 y no en 2025, aunque la calculadora simule el ejercicio 2025.

## Filas usadas

| Figura del paso 10 | Concepto exacto en la fuente | Codigo SEC | Millones de euros 2024 |
| --- | --- | --- | ---: |
| Cotizaciones sociales | Cotizaciones sociales efectivas a cargo de los empleadores | D.611 | 151.551 |
| Cotizaciones sociales | Cotizaciones sociales efectivas a cargo de los hogares | D.613 | 51.747 |
| IRPF | Impuesto sobre la Renta de las Personas Fisicas / IRNR (personas fisicas) | D.51 | 145.873 |
| IVA | Impuesto sobre el Valor Anadido (IVA) | D.211 | 100.170 |
| Impuestos especiales | Hidrocarburos | D.214 | 13.613 |
| Impuestos especiales | Labores del Tabaco | D.214 | 7.524 |
| Impuestos especiales | Electricidad | D.214 | 1.175 |
| Impuestos especiales | Alcohol y Bebidas Derivadas | D.214 | 894 |
| Impuestos especiales | Cerveza | D.214 | 377 |
| Impuestos especiales | Productos Intermedios | D.214 | 23 |
| Impuestos especiales | Carbon | D.214 | 20 |
| IBI | Impuesto sobre Bienes Inmuebles / Recargo sobre el IBI | D.29 | 14.104 |
| IBI | IBI (viviendas desocupadas) | D.59 | 853 |
| IVTM | Vehiculos de Traccion Mecanica (empresas) | D.29 | 500 |
| IVTM | Vehiculos de Traccion Mecanica (hogares) | D.59 | 1.809 |
| ITP y AJD | Transmisiones Patrimoniales y Actos Juridicos Documentados | D.214 | 12.523 |
| Matriculacion | Impuesto Especial sobre Determinados Medios de Transporte | D.214 | 914 |

Agregados usados en la ficha: cotizaciones efectivas 203.298; impuestos especiales de fabricacion 23.626; IBI 14.957; IVTM 2.309.

Exclusiones deliberadas:

- D.612, cotizaciones sociales imputadas (7.039), no es un pago efectivo y no se suma a la linea de cotizaciones.
- El IGIC canario y el IPSI de Ceuta y Melilla no se suman al IVA porque son figuras distintas con territorio propio.
- Matriculacion, envases de plastico, gases fluorados y bebidas azucaradas no se suman a los impuestos especiales de fabricacion.
- El IAE no se suma al IBI: grava la actividad economica, no la propiedad del inmueble.

## Denominadores

Los dos denominadores proceden de la serie IGAE/SEPG BDMACRO abril 2026 ya procesada en el repositorio, con el mismo marco SEC 2010 y el mismo ano:

- PIB 2024: 1.594.330 millones de euros.
- Ingresos no financieros de las AAPP 2024: 673.734 millones de euros, calculados como gasto publico total (725.001) menos deficit publico (-51.267). Estado del dato: `observado_derivado`.

Comprobacion de coherencia: los porcentajes del PIB calculados con ese denominador coinciden hasta el cuarto decimal con la hoja `Tabla1b` de la propia fuente IGAE, que expresa las mismas filas en porcentaje del PIB. Ejemplos: IVA 6,2829 %; IRPF 9,1495 %; IBI 0,8846 %; total impuestos 23,9186 %.

## Cifras de gasto usadas como referencia editorial

Del fichero `data/processed/fiscal/2026-05-25_series-fiscales-espana_1975-2070.csv`, ano 2024: gasto publico total 725.001; pensiones 200.475 (`observado_aproximado`); sanidad 102.942; intereses de la deuda 38.801. Sirven para comparar magnitudes, no para afirmar que un impuesto concreto financia una partida concreta: en Espana rige el principio de no afectacion salvo en las cotizaciones sociales, que si financian prestaciones contributivas.

## Limites de uso

- No presentar estas cifras como carga fiscal individual ni dividirlas entre trabajadores.
- No comparar directamente con el Informe Anual de Recaudacion Tributaria de la AEAT: distinto criterio contable y distinto ambito territorial.
- 2024 es provisional y puede revisarse en actualizaciones posteriores de la IGAE.
- El texto editorial sobre destino y efectos de cada impuesto vive en el componente de interfaz, no en el fichero de datos.
