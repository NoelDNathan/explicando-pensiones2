# Especificación de cálculo IRPF 2025: reducciones, mínimos y deducciones

Fecha de revisión: 2026-07-17

Ejercicio fiscal: 2025

Ámbito: declaración anual del IRPF de trabajadores por cuenta ajena residentes en comunidades autónomas de régimen común

Estado: especificación normativa pendiente de implementación y contraste final con Renta WEB 2025

## 1. Objetivo y alcance

Este documento reúne los datos, validaciones y fórmulas necesarios para calcular correctamente los pasos **4. Reducciones y mínimos** y **5. Deducciones y salario en especie** de la calculadora.

La especificación calcula la cuota anual del IRPF. No calcula la retención mensual de nómina: para esta última debe emplearse el algoritmo oficial de retenciones 2025 de la AEAT.

El alcance base es:

- ejercicio 2025;
- territorio común, con escala y mínimos autonómicos de la comunidad seleccionada;
- rendimientos del trabajo por cuenta ajena;
- tributación individual o conjunta;
- sin regímenes forales de País Vasco y Navarra;
- sin automatizar una deducción autonómica hasta que exista una regla específica y versionada para ella.

Cuando falte un dato exigido por la norma, el resultado del beneficio fiscal debe ser `no_estimado`. No se debe convertir un selector incompleto en una deducción automática.

## 2. Metadatos y trazabilidad obligatorios

Todo paquete de reglas usado por el motor debe guardar:

| Campo | Valor o requisito |
| --- | --- |
| `tax_year` | `2025` |
| `tax_scope` | `annual_irpf` |
| `territory` | comunidad autónoma de régimen común |
| `legal_vintage` | normativa consolidada a 31-12-2025 |
| `source_institution` | AEAT o BOE |
| `source_url` | URL directa a la regla aplicada |
| `source_accessed_at` | fecha de consulta |
| `data_status` | `normativo` |
| `effective_from` / `effective_to` | vigencia de la regla |
| `transformation` | fórmula implementada y redondeo |
| `implementation_version` | versión del paquete de reglas |

Los datos personales introducidos por el usuario se consideran `declarados`, no datos observados por el proyecto.

## 3. Conceptos que no se pueden mezclar

El motor debe mantener compartimentos separados:

1. **Rendimiento íntegro del trabajo**: dinero y retribuciones en especie sujetas.
2. **Gastos deducibles del artículo 19.2.a-e**: Seguridad Social, derechos pasivos, colegios de huérfanos, cuotas sindicales, cuotas obligatorias a colegios profesionales y defensa jurídica.
3. **Otros gastos del artículo 19.2.f**: importe general de 2.000 euros y sus incrementos por movilidad o discapacidad activa.
4. **Reducción por obtención de rendimientos del trabajo**: artículo 20; reduce el rendimiento neto del trabajo, no la cuota.
5. **Reducciones de la base imponible**: previsión social, pensión compensatoria, tributación conjunta, patrimonios protegidos, etc.
6. **Mínimo personal y familiar**: no es una resta ordinaria de la base. Se aplica la escala a la base liquidable y, por separado, al mínimo; después se resta la segunda cuota de la primera.
7. **Deducciones de cuota íntegra**: donativos, vivienda en régimen transitorio, inversión en empresa nueva y deducciones autonómicas.
8. **Deducción 2025 por obtención de rendimientos del trabajo**: minora la cuota líquida total con sus propios límites.
9. **Deducciones reembolsables**: maternidad, guardería, familia numerosa y discapacidad a cargo; pueden hacer negativo el resultado de la declaración.
10. **Retribuciones en especie exentas**: no son deducciones. La parte exenta no entra en el rendimiento íntegro sujeto.

## 4. Orden completo de cálculo

### 4.1. Clasificar la remuneración

```text
retribucion_dineraria_sujeta
+ valor_retribucion_especie_sujeta
+ ingreso_a_cuenta_no_repercutido_al_trabajador
= rendimiento_integro_trabajo
```

Antes de esta suma se separa, beneficio por beneficio, la parte exenta de la parte sujeta. No se debe sumar otra vez una retribución flexible que ya esté incluida en el salario bruto contractual.

### 4.2. Gastos deducibles del trabajo

```text
gastos_art_19_2_a_e =
    seguridad_social_trabajador
  + derechos_pasivos
  + colegios_huerfanos
  + cuotas_sindicales
  + cuotas_colegio_profesional_admisibles
  + defensa_juridica_admisible

rendimiento_previo_art_19_f =
  max(0, rendimiento_integro_trabajo - gastos_art_19_2_a_e)
```

Límites y condiciones:

- cuotas sindicales: importe efectivamente satisfecho;
- colegio profesional: solo si la colegiación es obligatoria para ejercer el trabajo y con máximo de 500 euros anuales;
- defensa jurídica: litigios del trabajador con quien recibe sus servicios, máximo de 300 euros anuales;
- Seguridad Social: solo la cuota soportada por el trabajador, no la aportación de la empresa.

Después se aplican los otros gastos del artículo 19.2.f:

```text
otros_gastos_19_2_f_teoricos =
    2_000
  + incremento_movilidad
  + incremento_discapacidad_activa

otros_gastos_19_2_f_aplicados =
  min(otros_gastos_19_2_f_teoricos, limite_legal_rendimiento)

rendimiento_neto_trabajo =
  max(0, rendimiento_previo_art_19_f - otros_gastos_19_2_f_aplicados)
```

Incrementos 2025:

- movilidad geográfica: 2.000 euros adicionales en el ejercicio del cambio de residencia y el siguiente, si el contribuyente estaba inscrito como demandante de empleo, acepta un puesto en otro municipio y traslada su residencia; el incremento se limita al rendimiento íntegro del nuevo empleo menos sus gastos específicos;
- trabajador activo con discapacidad: 3.500 euros;
- trabajador activo con discapacidad igual o superior al 65 %, o que acredite necesidad de ayuda de terceras personas o movilidad reducida: 7.750 euros en lugar de 3.500.

Los incrementos no pueden generar un rendimiento neto negativo.

### 4.3. Reducción por obtención de rendimientos del trabajo

La magnitud que determina el tramo **no resta** los otros gastos del artículo 19.2.f:

```text
rnt_para_reduccion_art_20 =
  rendimiento_integro_trabajo - gastos_art_19_2_a_e
```

Requisitos acumulativos:

- `rnt_para_reduccion_art_20 < 19_747,50`;
- rentas no exentas distintas de las del trabajo `<= 6_500`.

Fórmula 2025:

```text
si rnt <= 14_852:
    reduccion_teorica = 7_302

si 14_852 < rnt <= 17_673,52:
    reduccion_teorica = 7_302 - 1,75 * (rnt - 14_852)

si 17_673,52 < rnt < 19_747,50:
    reduccion_teorica = 2_364,34 - 1,14 * (rnt - 17_673,52)

en otro caso:
    reduccion_teorica = 0

reduccion_trabajo_aplicada =
  min(max(0, reduccion_teorica), rendimiento_neto_trabajo)

rendimiento_neto_reducido_trabajo =
  rendimiento_neto_trabajo - reduccion_trabajo_aplicada
```

### 4.4. Formar la base imponible

Para el perfil simplificado con solo trabajo:

```text
base_imponible_general = rendimiento_neto_reducido_trabajo
base_imponible_ahorro = 0
```

Si se permiten otras rentas, deben calcularse según su categoría antes de continuar. No basta con pedir su suma: se necesitan su naturaleza, rendimiento neto y base general o del ahorro. La cifra agregada de rentas distintas del trabajo sí es necesaria, además, para los umbrales de 6.500 euros de los apartados 4.3 y 4.9.

### 4.5. Reducciones de la base imponible

Cada reducción se limita a la base sobre la que legalmente pueda aplicarse. El motor debe conservar `importe_aportado`, `importe_aplicable_2025` y `exceso_pendiente`.

```text
base_liquidable_general =
  max(0, base_imponible_general - reducciones_aplicables_base_general)
```

Las reducciones por pensión compensatoria y por tributación conjunta que no puedan absorberse en la base general pueden minorar la base imponible del ahorro sin hacerla negativa. Las reducciones de previsión social y patrimonio protegido no deben trasladarse automáticamente a la base del ahorro.

### 4.6. Mínimo personal y familiar

Se calculan dos importes:

- `minimo_estatal`, con las cuantías estatales;
- `minimo_autonomico`, con las cuantías aprobadas por la comunidad autónoma para 2025 o, si no existen cuantías propias, las estatales que correspondan.

Aplicación correcta:

```text
cuota_integra_estatal =
  escala_estatal(base_liquidable_general)
  - escala_estatal(parte_minimo_estatal_en_base_general)

cuota_integra_autonomica =
  escala_autonomica(base_liquidable_general)
  - escala_autonomica(parte_minimo_autonomico_en_base_general)
```

Si la base liquidable general es inferior al mínimo, el remanente del mínimo se aplica, con las reglas legales, sobre la base del ahorro. La cuota nunca puede ser negativa en esta fase.

### 4.7. Especialidad por anualidades por alimentos a hijos

Las anualidades a hijos fijadas por resolución judicial o por convenio regulador formalizado legalmente **no reducen la base**.

Si el pagador no tiene derecho al mínimo por descendientes respecto de esos hijos y el importe es inferior a la base liquidable general:

1. separar la base en `A = anualidades` y `B = resto de base`;
2. aplicar las escalas estatal y autonómica por separado a A y B;
3. sumar ambas cuotas;
4. calcular la cuota correspondiente al mínimo personal y familiar incrementado en 1.980 euros anuales;
5. restar la cuota del mínimo sin obtener resultado negativo.

El motor debe impedir simultáneamente la especialidad y el mínimo por descendientes respecto del mismo hijo.

### 4.8. Deducciones de la cuota íntegra

```text
cuota_liquida_estatal =
  max(0, cuota_integra_estatal - deducciones_estatales)

cuota_liquida_autonomica =
  max(0, cuota_integra_autonomica - deducciones_autonomicas)

cuota_liquida_total =
  cuota_liquida_estatal + cuota_liquida_autonomica
```

Las deducciones generales se distribuyen entre cuota estatal y autonómica según su norma. Como regla de parametrización, se debe guardar `state_share` y `regional_share`; no se debe restar todo del total sin asignación. La inversión en empresa nueva corresponde íntegramente al tramo estatal. Las deducciones autonómicas solo minoran la cuota autonómica.

### 4.9. Nueva deducción 2025 por obtención de rendimientos del trabajo

Requisitos acumulativos:

- rendimientos íntegros derivados de la prestación efectiva de servicios ` < 18_276`;
- rentas no exentas distintas de las del trabajo `<= 6_500`.

Fórmula:

```text
si rendimiento_integro_efectivo <= 16_576:
    deduccion_teorica = 340

si 16_576 < rendimiento_integro_efectivo < 18_276:
    deduccion_teorica = 340 - 0,20 * (rendimiento_integro_efectivo - 16_576)

en otro caso:
    deduccion_teorica = 0
```

La deducción aplicada no puede superar la parte de las cuotas íntegras estatal y autonómica que corresponda proporcionalmente a los rendimientos netos del trabajo que generan el derecho. Se resta de la cuota líquida total, después de la deducción por doble imposición internacional cuando proceda.

El motor debe devolver tanto el importe teórico como el límite y el importe aplicado.

### 4.10. Resultado anual y deducciones reembolsables

No se debe confundir impuesto anual con resultado a ingresar o devolver:

```text
cuota_resultante_autoliquidacion =
  cuota_liquida_total
  - deduccion_trabajo_2025_aplicada
  - otras_deducciones_de_cuota_resultante

cuota_diferencial_antes_reembolsables =
  cuota_resultante_autoliquidacion
  - retenciones
  - ingresos_a_cuenta
  - pagos_fraccionados
  - cuotas_diferenciales_extranjeras_aplicables

resultado_declaracion =
  cuota_diferencial_antes_reembolsables
  - deduccion_maternidad
  - incremento_guarderia
  - deduccion_familia_numerosa
  - deducciones_discapacidad_a_cargo
  - abonos_anticipados_ya_cobrados_con_signo_inverso
```

Para mostrar “IRPF anual soportado” en la calculadora deben publicarse por separado:

- cuota anual antes de pagos a cuenta;
- deducciones reembolsables generadas;
- retenciones ya practicadas;
- abonos anticipados cobrados;
- resultado estimado de la declaración.

## 5. Datos de entrada mínimos

### 5.1. Contribuyente, territorio y unidad familiar

| Campo | Tipo | Obligatorio | Validación o uso |
| --- | --- | --- | --- |
| `tax_year` | entero | sí | debe ser 2025 |
| `region_code` | catálogo | sí | CCAA de régimen común |
| `declaration_mode` | enum | sí | `individual` o `joint` |
| `family_unit_type` | enum | si conjunta | matrimonio no separado o unidad monoparental legal |
| `birth_date` | fecha | sí | edad a 31-12-2025 y mínimos de edad |
| `marital_status` | enum | sí | no determina por sí solo una unidad familiar |
| `spouse_taxpayer` | booleano | si conjunta | composición y reducción aplicable |
| `other_parent_cohabits` | booleano | unidad monoparental | invalida la reducción de 2.150 euros cuando convive con el otro progenitor |
| `tax_residence_days_region` | entero | sí | residencia autonómica aplicable |

### 5.2. Rendimientos e importes de trabajo

| Campo | Unidad | Uso |
| --- | --- | --- |
| `cash_work_income` | €/año | rendimiento dinerario sujeto |
| `taxable_in_kind_value` | €/año | valor sujeto de especie antes del ingreso a cuenta |
| `non_passed_on_payment_on_account` | €/año | se suma al rendimiento íntegro cuando no se repercute |
| `employee_social_security` | €/año | gasto artículo 19.2.a |
| `passive_rights_contributions` | €/año | gasto artículo 19.2.b |
| `orphan_institution_contributions` | €/año | gasto artículo 19.2.c |
| `union_dues` | €/año | gasto artículo 19.2.d |
| `mandatory_professional_dues` | €/año | gasto artículo 19.2.d, máximo 500 |
| `professional_membership_mandatory` | booleano | requisito de las cuotas profesionales |
| `employment_legal_defense_cost` | €/año | gasto artículo 19.2.e, máximo 300 |
| `other_non_exempt_non_work_income` | €/año | umbrales de 6.500; debe incluir toda renta no exenta distinta del trabajo |
| `withholdings` | €/año | resultado de declaración, no cálculo de cuota íntegra |
| `payments_on_account_already_made` | €/año | resultado de declaración |

### 5.3. Movilidad y discapacidad activa

| Campo | Tipo | Uso |
| --- | --- | --- |
| `was_registered_jobseeker` | booleano | movilidad geográfica |
| `accepted_job_other_municipality` | booleano | movilidad geográfica |
| `moved_residence` | booleano | movilidad geográfica |
| `move_tax_year` | entero | solo 2025 o 2024 para aplicar en 2025 |
| `new_job_integral_income` | €/año | límite del incremento |
| `new_job_specific_expenses` | €/año | límite del incremento |
| `active_worker` | booleano | incremento por discapacidad |
| `taxpayer_disability_percent` | porcentaje | mínimos e incremento de gasto |
| `needs_third_party_help` | booleano | incremento superior y asistencia |
| `reduced_mobility_accredited` | booleano | incremento superior y asistencia |

### 5.4. Descendientes y ascendientes

Debe existir un registro por persona, no solo un contador.

| Campo | Uso |
| --- | --- |
| `relationship` | descendiente o ascendiente y grado |
| `birth_date` | edad a fecha de devengo |
| `death_date` | prorrateos o devengo si procede |
| `disability_percent` | requisito y mínimo por discapacidad |
| `needs_third_party_help` / `reduced_mobility` | complemento de asistencia |
| `cohabitation_days` | convivencia; ascendientes al menos medio año |
| `economically_dependent` | asimilación a convivencia en descendientes |
| `annual_non_exempt_income` | debe ser `<= 8.000` para el mínimo |
| `filed_return` | existencia de declaración propia |
| `filed_return_income` | si supera 1.800 euros impide el mínimo |
| `custody_share` | prorrateo entre progenitores |
| `number_of_entitled_taxpayers` | reparto del mínimo |
| `entitlement_share` | porcentaje aplicado por este contribuyente |
| `child_support_speciality` | incompatibilidad por hijo con mínimo por descendiente |

Condiciones estatales esenciales:

- descendiente: menor de 25 años o cualquier edad con discapacidad igual o superior al 33 %, convivencia o dependencia económica, rentas no exentas no superiores a 8.000 euros y sin declaración propia con rentas superiores a 1.800 euros;
- ascendiente: mayor de 65 años o con discapacidad igual o superior al 33 %, convivencia al menos durante la mitad del ejercicio, rentas no exentas no superiores a 8.000 euros y sin declaración propia con rentas superiores a 1.800 euros;
- cuando varias personas tienen derecho, se prorratea por partes iguales salvo regla especial aplicable.

## 6. Cuantías de mínimos 2025

### 6.1. Mínimo estatal

| Concepto | Cuantía anual |
| --- | ---: |
| Contribuyente | 5.550 € |
| Incremento si mayor de 65 años | 1.150 € |
| Incremento adicional si mayor de 75 años | 1.400 € |
| Primer descendiente | 2.400 € |
| Segundo descendiente | 2.700 € |
| Tercer descendiente | 4.000 € |
| Cuarto y siguientes | 4.500 € |
| Incremento por descendiente menor de 3 años | 2.800 € |
| Ascendiente mayor de 65 años o con discapacidad | 1.150 € |
| Incremento por ascendiente mayor de 75 años | 1.400 € |
| Discapacidad del contribuyente, ascendiente o descendiente: 33 % a menos de 65 % | 3.000 € por persona |
| Discapacidad igual o superior al 65 % | 9.000 € por persona |
| Asistencia: ayuda de terceros, movilidad reducida o discapacidad igual o superior al 65 % | 3.000 € adicionales por persona |

La edad se comprueba a la fecha de devengo. Debe aplicarse el prorrateo que corresponda y conservar el detalle por persona.

### 6.2. Mínimos autonómicos

El motor debe leer los importes 2025 de:

`data/processed/fiscal/2026-06-01_aeat-irpf-2025-ccaa-regimen-comun-cobertura.json`

No se puede aplicar automáticamente el mínimo estatal de discapacidad a la cuota autonómica cuando la comunidad haya aprobado importes propios. El paquete debe tener, por comunidad, todas estas claves:

```text
taxpayer_base
taxpayer_over_65_increment
taxpayer_over_75_increment
descendant_by_order[1..4+]
descendant_under_3_increment
ascendant_base
ascendant_over_75_increment
disability_33_65
disability_65_plus
assistance_increment
```

Si falta una clave necesaria, el cálculo autonómico debe quedar `no_estimado`, no rellenarse silenciosamente con cero.

## 7. Reducciones de la base: datos y reglas

### 7.1. Sistemas de previsión social

No deben existir tres bolsas independientes para “plan individual”, “plan de empresa” y “mutualidad”. Comparten límites y requieren desglose.

Datos mínimos:

- aportación individual del contribuyente;
- contribución empresarial imputada;
- aportación del trabajador al mismo instrumento de empleo;
- rendimiento neto del trabajo y de actividades económicas;
- tipo de instrumento y elegibilidad;
- contribución empresarial anual que determina el coeficiente aplicable;
- excesos pendientes de los cinco ejercicios anteriores.

Límite general conjunto aplicado en 2025:

```text
limite_porcentual = 30 % * rendimientos_netos_trabajo_y_actividades
limite_absoluto_base = 1_500
```

El límite absoluto puede incrementarse hasta en 8.500 euros por contribuciones empresariales y determinadas aportaciones del trabajador al mismo instrumento de empleo, con los coeficientes legales según el importe de la contribución empresarial. No se debe conceder ese incremento a una aportación individual ordinaria.

La aportación máxima del trabajador que puede formar ese incremento se calcula por empleador y por instrumento:

| Rendimiento íntegro procedente de ese empleador | Contribución empresarial anual al instrumento | Aportación máxima del trabajador vinculada al incremento |
| --- | ---: | ---: |
| Hasta 60.000 € | Hasta 500 € | contribución empresarial × 2,5 |
| Hasta 60.000 € | De 500,01 a 1.500 € | 1.250 € + 0,25 × (contribución empresarial − 500 €) |
| Hasta 60.000 € | Más de 1.500 € | contribución empresarial × 1 |
| Más de 60.000 € | Cualquier importe | contribución empresarial × 1 |

Las aportaciones deben realizarse al mismo sistema que recibe la contribución empresarial. Las cantidades aportadas por la empresa por decisión del trabajador se consideran aportaciones del trabajador. En cualquier caso, el incremento total por contribuciones empresariales y aportaciones vinculadas no puede superar 8.500 euros.

```text
limite_aplicable = min(limite_porcentual, 1_500 + incremento_empleo_admisible)
reduccion_aplicada = min(aportaciones_admisibles + excesos_prioritarios, limite_aplicable, base_disponible)
```

Los excesos de años anteriores se aplican antes que las aportaciones del propio 2025 y se guarda el remanente para los cinco ejercicios siguientes cuando proceda.

Casos que necesitan reglas separadas:

- aportaciones a sistemas del cónyuge con rendimientos netos del trabajo y actividades inferiores a 8.000 euros: máximo 1.000 euros, independiente del límite general;
- seguros colectivos de dependencia satisfechos por la empresa: límite adicional propio de 5.000 euros.

Si el formulario no pregunta estos datos, la reducción debe ser `no_estimado`.

#### Sistemas constituidos a favor de personas con discapacidad

Beneficiarios admisibles: discapacidad física o sensorial igual o superior al 65 %, discapacidad psíquica igual o superior al 33 %, o persona sujeta a la curatela judicial prevista por la norma. También pueden aportar parientes en línea directa o colateral hasta tercer grado, cónyuge, tutor/acogedor o curador legitimado, con designación única e irrevocable del beneficiario para las contingencias cubiertas.

Límites anuales:

- aportación y reducción de la propia persona con discapacidad: 24.250 euros;
- aportación y reducción de cada persona distinta legitimada: 10.000 euros, compatible con su propio sistema general;
- suma de todas las aportaciones y reducciones a favor de un mismo beneficiario: 24.250 euros;
- se aplican primero las aportaciones de la propia persona con discapacidad y después las de otras personas proporcionalmente;
- el exceso por insuficiencia de base puede solicitarse para los cinco ejercicios siguientes.

El formulario necesita identificar aportante, beneficiario, relación, tipo y grado de discapacidad, importes propios y de terceros, y excesos pendientes.

### 7.2. Pensión compensatoria y anualidades distintas de hijos

La pensión compensatoria al cónyuge y las anualidades por alimentos a personas distintas de los hijos reducen la base cuando se satisfacen por decisión judicial o convenio regulador formalizado ante letrado de la Administración de Justicia o notario.

Datos mínimos:

- importe efectivamente pagado en 2025;
- beneficiario;
- tipo de pago;
- resolución o convenio válido;
- fecha y vigencia;
- parte no satisfecha, si existe.

Las anualidades a hijos siguen la especialidad del apartado 4.7 y nunca se suman aquí.

### 7.3. Tributación conjunta

| Unidad familiar | Reducción |
| --- | ---: |
| Matrimonio no separado legalmente y, si existen, hijos que forman unidad | 3.400 € |
| Unidad monoparental legal | 2.150 € |

La reducción de 2.150 euros no se aplica si el contribuyente convive con el otro progenitor de alguno de los hijos que forman la unidad. Se minora primero la base general y el remanente puede minorar la base del ahorro sin hacerla negativa.

### 7.4. Patrimonio protegido de persona con discapacidad

Datos mínimos por aportación:

- aportante y parentesco o legitimación;
- beneficiario y patrimonio protegido;
- grado y tipo de discapacidad del beneficiario;
- importe y naturaleza dineraria/no dineraria;
- total aportado por este aportante a todos los patrimonios;
- total aportado por todos los aportantes a ese patrimonio;
- excesos 2021-2024 pendientes y solicitud de aplicación futura.

Límites:

- 10.000 euros anuales por aportante para el conjunto de patrimonios protegidos;
- 24.250 euros anuales para el conjunto de reducciones de todos los aportantes a un mismo patrimonio;
- si se supera el segundo límite, reducción proporcional entre aportantes;
- la reducción tampoco puede superar la base imponible general positiva disponible;
- el exceso de 2025 puede aplicarse en los cuatro ejercicios siguientes si se consigna correctamente.

Las aportaciones del propio beneficiario y las que no cumplan los requisitos personales o formales no generan esta reducción.

### 7.5. Reducciones autonómicas verificadas

Una entrada manual solo es admisible con:

- comunidad y ejercicio;
- denominación legal de la reducción;
- importe calculado;
- base y límite usados;
- requisitos verificados;
- fuente oficial y fecha;
- persona que declara la verificación.

Sin esos metadatos, el valor no se incorpora al cálculo.

## 8. Deducciones: datos y fórmulas

### 8.1. Maternidad

No basta un selector “sí/no”. Debe registrarse cada hijo y cada mes con derecho.

Datos mínimos:

- hijo que genera el derecho y fecha de nacimiento/adopción/acogimiento;
- beneficiario legal de la deducción;
- meses de 2025 en que se cumplen los requisitos;
- situación de alta o percepción de prestación contributiva/asistencial que habilita el derecho;
- fecha de alta posterior al nacimiento y fecha en que se completan 30 días cotizados, si procede;
- meses en que algún progenitor percibe complemento de ayuda para la infancia, con la excepción transitoria aplicable;
- abono anticipado ya cobrado.

```text
deduccion_maternidad_generada = 100 € * meses_con_derecho_por_hijo
```

Si el derecho nace por un alta en Seguridad Social o mutualidad posterior al nacimiento, el mes en que se completa un período mínimo de 30 días cotizados incorpora una sola vez 150 euros adicionales.

Máximo general: 1.200 euros por hijo; 1.350 euros en el ejercicio en que proceda el incremento único de 150 euros. El abono anticipado no reduce el derecho generado; se resta al calcular el saldo de la declaración para evitar duplicidad.

### 8.2. Incremento por gastos de custodia en guardería

Datos mínimos por hijo y mes:

- guardería o centro de educación infantil autorizado y NIF;
- hijo menor de tres años y meses completos de asistencia;
- gastos de preinscripción, matrícula, asistencia y alimentación;
- importes subvencionados;
- importes satisfechos por la empresa como retribución en especie exenta;
- importe efectivamente pagado por el contribuyente;
- derecho previo a deducción por maternidad.

```text
gasto_neto_admisible =
  gasto_total
  - subvenciones
  - importes_empresa_exentos

incremento_teorico = (1_000 € / 12) * meses_completos_admisibles

incremento_guarderia =
  min(1_000, incremento_teorico, gasto_neto_admisible)
```

Para el límite de gasto efectivo se computan las cantidades anuales admisibles aunque incluyan algún mes incompleto; para determinar los meses que generan incremento solo se cuentan meses completos. En el ejercicio en que el menor cumple tres años, el derecho puede extenderse hasta el mes anterior a aquel en que pueda comenzar el segundo ciclo de educación infantil.

### 8.3. Familia numerosa

Datos mínimos:

- título oficial y categoría;
- fechas de vigencia durante 2025;
- número de hijos que excede del mínimo exigido;
- contribuyentes con derecho y cesiones del derecho;
- meses con alta en Seguridad Social, mutualidad o prestación habilitante;
- abonos anticipados.

Máximos anuales:

- categoría general: 1.200 euros;
- categoría especial: 2.400 euros;
- incremento: hasta 600 euros por cada hijo que exceda del mínimo necesario para la categoría.

El importe se calcula por meses y se prorratea entre quienes tengan derecho, salvo cesión válida.

### 8.4. Discapacidad a cargo

Debe distinguirse cada descendiente, ascendiente o cónyuge no separado legalmente que genere derecho.

Máximo general: 1.200 euros anuales por cada persona que cumpla los requisitos. Se calcula por meses, con prorrateo o cesión del derecho y límite de cotizaciones/prestaciones cuando corresponda. Deben descontarse los abonos anticipados ya cobrados.

Un simple booleano “discapacidad a cargo” no permite calcular la deducción.

### 8.5. Donativos

Datos mínimos por donativo:

- entidad beneficiaria y régimen fiscal;
- importe efectivamente donado;
- parte revocada o con contraprestación;
- importe donado a la misma entidad en 2023 y 2024 para comprobar recurrencia;
- base liquidable total para aplicar el límite.

Para entidades de la Ley 49/2002:

```text
base_primer_tramo = min(base_donativo_admisible, 250)
base_resto = max(0, base_donativo_admisible - 250)

deduccion_teorica =
  80 % * base_primer_tramo
  + (45 % si hay recurrencia; si no, 40 %) * base_resto

base_donativo_aplicada <= 10 % * base_liquidable_total
```

La recurrencia exige donativos a la misma entidad en los dos ejercicios anteriores por importe igual o superior, en cada uno, al del ejercicio precedente. Otros tipos de entidad o aportación necesitan su porcentaje específico.

### 8.6. Alquiler de vivienda habitual: régimen transitorio estatal

Requisitos:

- contrato anterior al 1-1-2015;
- cantidades satisfechas antes de esa fecha;
- derecho a esta deducción en un ejercicio devengado antes de 2015;
- vivienda habitual;
- base imponible total inferior a 24.107,20 euros.

```text
si base_imponible_total <= 17_707,20:
    base_maxima = 9_040

si 17_707,20 < base_imponible_total < 24_107,20:
    base_maxima = 9_040 - 1,4125 * (base_imponible_total - 17_707,20)

en otro caso:
    base_maxima = 0

base_deduccion = min(alquiler_pagado_admisible, base_maxima)
deduccion = 10,05 % * base_deduccion
```

La deducción estatal transitoria y una eventual deducción autonómica por alquiler son reglas distintas y pueden tener requisitos, bases e incompatibilidades diferentes.

### 8.7. Inversión en vivienda habitual anterior a 2013

Datos mínimos:

- fecha y forma de adquisición, construcción, rehabilitación o ampliación;
- prueba de aplicación del régimen transitorio;
- titularidad y porcentaje del contribuyente;
- principal, intereses y gastos financiados admisibles pagados en 2025;
- devoluciones o regularizaciones de cláusulas suelo;
- comunidad y posible régimen especial de Cataluña.

Regla general:

```text
base_deduccion = min(cantidades_admisibles_pagadas_2025, 9_040)
tramo_estatal = 7,5 % * base_deduccion
tramo_autonomico_general = 7,5 % * base_deduccion
```

Cataluña puede aplicar un porcentaje autonómico del 9 % en el régimen especial y 7,5 % en el general. El motor no debe aplicar el 15 % total sin comprobar la comunidad, la elegibilidad transitoria y el porcentaje de titularidad.

### 8.8. Inversión en empresas de nueva o reciente creación

Datos mínimos:

- importe y fecha de suscripción de acciones o participaciones;
- certificación de la entidad;
- forma y fecha de constitución o ampliación;
- fondos propios y actividad económica real;
- porcentaje de participación del contribuyente y familiares;
- periodo de permanencia;
- ausencia de transmisión de una actividad previamente ejercida bajo otra titularidad;
- importes excluidos por otras deducciones.

```text
base_deduccion = min(inversion_admisible, 100_000)
deduccion_estatal = 50 % * base_deduccion
```

Es una deducción estatal. Por la cantidad de requisitos societarios, debe quedar `requiere_verificacion_documental` hasta disponer de todos los datos.

### 8.9. Deducciones autonómicas

No existe una fórmula genérica. Cada regla debe parametrizar al menos:

```text
region_code
tax_year
deduction_code
eligible_persons
eligible_expense_or_event
percentage_or_fixed_amount
individual_and_joint_income_limits
tax_base_definition_for_limit
maximum_amount
proration
joint_ownership_rule
incompatibilities
documentary_requirements
state_or_regional_quota = regional
official_source_url
```

Hasta disponer de ese catálogo ejecutable, la interfaz solo puede aceptar un importe **ya verificado**, con los metadatos del apartado 7.5.

## 9. Salario en especie exento

### 9.1. Datos comunes

Para cada beneficio:

- modalidad: adicional al salario o sustitución/retribución flexible;
- pagador y proveedor;
- coste o valor de mercado;
- importe repercutido al trabajador;
- ingreso a cuenta y si se repercute;
- meses o días de uso;
- cumplimiento de los requisitos específicos;
- importe ya incluido en el salario bruto introducido.

```text
parte_sujeta = max(0, valor_total - parte_exenta_admisible)
```

La parte sujeta se integra como rendimiento del trabajo en especie. El ingreso a cuenta no repercutido se añade al rendimiento íntegro.

### 9.2. Tarjeta o vale de comida

Datos: importe diario, días hábiles con uso, lugar de consumo, no acumulación y sistema nominativo cuando proceda.

```text
exento_comida = sum(min(importe_dia, 11 €) para cada dia_admisible)
```

El exceso de 11 euros diarios es sujeto. No se admiten días de desplazamiento que ya generen dietas exentas ni días no trabajados.

### 9.3. Transporte colectivo

Debe destinarse al desplazamiento entre residencia y centro de trabajo mediante transporte público colectivo y cumplir los requisitos de las fórmulas indirectas de pago.

```text
exento_transporte = min(importe_admisible, 136,36 € * meses_admisibles, 1_500 €)
```

El límite de 136,36 euros mensuales no puede ignorarse aunque el total anual sea inferior a 1.500 euros.

### 9.4. Seguro médico

Personas cubiertas admisibles: trabajador, cónyuge y descendientes.

```text
limite_persona = 1_500 € si esa persona tiene discapacidad; si no, 500 €
exento_seguro = sum(min(prima_por_persona, limite_persona))
```

El exceso por persona es rendimiento en especie sujeto.

### 9.5. Guardería o educación pagada por la empresa

La prestación directa o mediante contratación con terceros del servicio de primer ciclo de educación infantil puede estar exenta si cumple el artículo 42.3.b de la Ley del IRPF. También existe la exención específica de servicios educativos prestados por centros autorizados a los hijos de sus propios empleados.

Debe distinguirse:

- servicio contratado y pagado por la empresa;
- mera entrega de dinero al trabajador, que en general es retribución dineraria;
- centro autorizado y tipo de servicio;
- importe exento satisfecho por la empresa.

El importe pagado por la empresa como retribución en especie exenta no forma parte del gasto que permite el incremento de la deducción por guardería.

## 10. Correspondencia con los controles actuales

| Control actual | Tratamiento correcto | Datos que faltan en el control actual |
| --- | --- | --- |
| Planes de pensiones | reducción con límite conjunto | rendimiento neto, tipo de plan, excesos y aportación exacta |
| Plan de pensiones de empresa | misma bolsa con posible incremento | contribución empresarial, aportación del trabajador, instrumento y coeficiente |
| Mutualidades de previsión social | previsión social, no bolsa independiente | elegibilidad y límites conjuntos |
| Pensión compensatoria | reducción de base | resolución/convenio, beneficiario e importe pagado |
| Anualidades por alimentos | escala separada si son para hijos | beneficiario, resolución, custodia y mínimo por descendiente |
| Tributación conjunta | 3.400 o 2.150 euros | tipo legal de unidad y convivencia con otro progenitor |
| Patrimonios protegidos | reducción limitada y coordinada | aportante, beneficiario, totales conjuntos y excesos |
| Reducciones autonómicas verificadas | importe manual trazable | código, fuente, requisitos y cálculo |
| Cuotas sindicales/colegios | gasto del trabajo antes de artículo 20 | separar sindicato/colegio, obligatoriedad y límite de 500 |
| Maternidad | 100 euros por mes e hijo | hijo, meses, situación habilitante y anticipos |
| Gastos de guardería | hasta 1.000 euros con límites | meses completos, centro, gasto neto y subvenciones |
| Familia numerosa | cálculo mensual | título, categoría, hijos excedentes, cotizaciones y anticipos |
| Discapacidad a cargo | por persona y mes | parentesco, meses, cotizaciones, reparto y anticipos |
| Donativos | porcentajes sobre base admisible | entidad, recurrencia, límite del 10 % y certificación |
| Alquiler vivienda habitual | régimen estatal transitorio o regla autonómica | contrato, derecho previo, base imponible y comunidad |
| Compra vivienda antigua | régimen transitorio | fecha, derecho previo, titularidad y pagos admisibles |
| Inversión en empresas nuevas | 50 % con base máxima y requisitos | certificación y datos societarios |
| Deducciones autonómicas | regla individual por comunidad | catálogo ejecutable completo |
| Tarjeta comida | exención diaria | días e importe por día |
| Tarjeta transporte | exención mensual y anual | meses, importe mensual y modalidad válida |
| Seguro médico | límite por persona | personas cubiertas, primas y discapacidad |
| Guardería empresa | exención en especie | contratación, centro, hijo e importe; coordinación con guardería |

Conclusión operativa: los selectores de importes prefijados `0/1.000/2.000/3.000/5.000/8.000` y los booleanos actuales no aportan datos suficientes para un cálculo legalmente correcto.

## 11. Salidas intermedias obligatorias

El resultado del motor debe ser auditable. Como mínimo devolverá:

```text
work_income.cash
work_income.in_kind_exempt
work_income.in_kind_taxable
work_income.payment_on_account_added
work_income.integral
work_expenses.article_19_a_e_by_type
work_expenses.article_19_f_general
work_expenses.mobility_increment
work_expenses.disability_increment
work_income.net
work_income.article_20_basis
work_income.article_20_theoretical
work_income.article_20_applied
work_income.net_reduced
tax_base.general_before_reductions
tax_base.savings_before_reductions
base_reductions.by_type
base_reductions.applied
base_reductions.excess_pending
tax_base.general_liquid
tax_base.savings_liquid
minimum.state_by_person
minimum.regional_by_person
quota.state_before_minimum
quota.state_minimum
quota.state_integral
quota.regional_before_minimum
quota.regional_minimum
quota.regional_integral
quota.deductions_by_type_and_share
quota.state_liquid
quota.regional_liquid
work_deduction_2025.theoretical
work_deduction_2025.limit
work_deduction_2025.applied
refundable_deductions.generated
refundable_deductions.advance_received
payments.withholdings
result.annual_tax_before_payments
result.return_before_refundable
result.final_return
calculation_status
warnings[]
sources[]
```

Cada importe debe conservar precisión de céntimos. Los cálculos internos no deben redondear por tramo antes de tiempo; se redondea a dos decimales en los puntos exigidos por el modelo de declaración y para presentación.

## 12. Estados, validaciones e incompatibilidades

Estados permitidos por beneficio:

- `not_applicable`: no cumple el requisito;
- `estimated_exact`: fórmula completa con todos los datos;
- `requires_document_verification`: fórmula calculada, pero falta acreditar un requisito;
- `not_estimated`: faltan datos que afectan al importe;
- `manual_verified`: importe externo documentado con fuente y cálculo;
- `unsupported`: regla fuera del alcance del motor.

Advertencias mínimas:

| Código | Condición |
| --- | --- |
| `MISSING_OTHER_INCOME` | no se conoce la renta distinta del trabajo y puede afectar a umbrales de 6.500 € |
| `PENSION_LIMIT_INPUTS_MISSING` | aportación sin datos para límite conjunto |
| `CHILD_SUPPORT_CONFLICT` | mismo hijo con mínimo y especialidad de anualidades |
| `DEPENDENT_PRORATION_MISSING` | no se conoce el reparto del mínimo/deducción |
| `REGIONAL_MINIMUM_INCOMPLETE` | falta una cuantía autonómica necesaria |
| `REGIONAL_DEDUCTION_UNVERIFIED` | importe autonómico sin metadatos |
| `REFUNDABLE_ADVANCE_MISSING` | no se conoce el abono anticipado |
| `IN_KIND_ALREADY_IN_GROSS_UNKNOWN` | riesgo de doble suma del salario en especie |
| `DAYCARE_DOUBLE_BENEFIT` | gasto pagado por empresa exento incluido también como gasto de guardería |
| `TRANSITIONAL_REGIME_UNVERIFIED` | vivienda o alquiler sin prueba del régimen transitorio |

## 13. Casos de regresión

Todos los casos deben compararse con Renta WEB 2025 antes de considerarse definitivos. Perfil común salvo indicación: Madrid, grupo 7, soltero, menor de 65 años, sin hijos, sin discapacidad, sin otras rentas, tributación individual, sin deducciones ni retribución en especie y con cotizaciones 2025 calculadas por el módulo de Seguridad Social.

| Caso | Bruto anual | Resultado esperado dentro del alcance | Propósito |
| --- | ---: | ---: | --- |
| A | 16.576 € | cuota anual 0 € | reducción artículo 20 y deducción 2025 limitada por cuota |
| B | 18.000 € | 891,13 € | tramo decreciente de ambas medidas |
| C | 20.000 € | 1.882,99 € | fuera de la deducción nueva; casi fuera de reducción artículo 20 |
| D | 35.000 € | 5.899,62 € | sin reducción de trabajo por renta baja |

Casos adicionales obligatorios:

1. 35.000 euros y aportación individual de 8.000: solo se aplican 1.500 euros si el 30 % no limita más y no existe incremento por empleo; resultado orientativo del caso auditado, 5.482,62 euros.
2. Cuota sindical de 250 y colegio no obligatorio de 500: solo 250 como gasto.
3. Colegio obligatorio de 800 y defensa jurídica de 450: aplicar 500 y 300.
4. Tarjeta comida de 15 euros durante 200 días admisibles: 2.200 exentos y 800 sujetos.
5. Transporte de 200 euros durante 6 meses: exento 818,16, aunque no alcance 1.500 al año.
6. Seguro médico: trabajador sin discapacidad 600 y descendiente con discapacidad 1.700: 2.000 exentos y 300 sujetos.
7. Donativo Ley 49/2002 de 400 sin recurrencia: 260 euros de deducción antes del límite de base.
8. Alquiler con contrato de 2018: deducción estatal transitoria cero, aunque exista una posible deducción autonómica.
9. Maternidad con 10 meses de derecho y 400 de abono anticipado: 1.000 generados y 600 pendientes en la declaración antes de otros ajustes.
10. Guardería pagada íntegramente por la empresa como retribución en especie exenta: gasto computable para incremento de guardería igual a cero.

## 14. Fuentes oficiales

Consultadas el 2026-07-17 salvo indicación distinta:

### Rendimientos del trabajo

- [AEAT: esquema general del rendimiento neto del trabajo](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c03-rendimientos-trabajo/rendimiento-neto-trabajo-integrar-base-imponible/esquema-general.html)
- [AEAT: gastos deducibles del artículo 19](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c03-rendimientos-trabajo/rendimiento-neto-trabajo-integrar-base-imponible/fase-2-determinacion-rendimiento-neto/gastos-deducibles-articulo-19-ley-irpf.html)
- [AEAT: otros gastos del artículo 19.2.f](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c03-rendimientos-trabajo/rendimiento-neto-trabajo-integrar-base-imponible/fase-2-determinacion-rendimiento-neto/particular-analisis-gastos-articulo-19_2_f-lirpf.html)
- [AEAT: reducción por obtención de rendimientos del trabajo](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2025/7-cumplimentacion-irpf/7_1-rendimientos-trabajo-personal/7_1_6-reduccion-obtencion-rendimientos-trabajo.html)
- [AEAT: deducción 2025 por obtención de rendimientos del trabajo](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/deducciones-cuota-liquida-total/deduccion-obtencion-rendimientos-trabajo.html)

### Mínimos y familia

- [AEAT: cuantías de los mínimos personal y familiar](https://sede.agenciatributaria.gob.es/Sede/ciudadanos-familias-personas-discapacidad/minimo-personal-familiar/cuantias-minimos.html)
- [AEAT: requisitos del mínimo por descendientes](https://sede.agenciatributaria.gob.es/Sede/ciudadanos-familias-personas-discapacidad/minimo-personal-familiar/minimo-descendientes.html)
- [AEAT: mínimo por ascendientes](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-especifico-personas-discapacidad/irpf-2025/minimos/minimo-ascendientes.html)
- [AEAT: mínimo por discapacidad del contribuyente](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c14-adecuacion-impuesto-circunstancias-personales/minimo-discapacidad/minimo-discapacidad-contribuyente.html)

### Reducciones

- [AEAT: cuadro resumen de reducciones de la base imponible general](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c13-determinacion-renta-contribuyente-sujeta-gravamen/reducciones-base-imponible-general/cuadro-resumen-reducciones-base-imponible-general.html)
- [AEAT: límites y excesos de aportaciones a previsión social](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c13-determinacion-renta-contribuyente-sujeta-gravamen/reducciones-base-imponible-general/reducciones-aportaciones-contribuciones-sistemas-prevision-social/normas-comunes-aplicables-aportaciones-sistemas-social/limites-exceso-aportaciones.html)
- [AEAT: sistemas de previsión social a favor de personas con discapacidad](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-especifico-personas-discapacidad/irpf-2025/reducciones-aportaciones-contribuciones-personas-discapacidad/limites-exceso-aportaciones.html)
- [AEAT: reducción por tributación conjunta](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2025/8-cumplimentacion-irpf/8_2-base-liquidable-general-base-ahorro/8_2_1-reduccion-tributacion-conjunta.html)
- [AEAT: pensiones compensatorias y anualidades](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c13-determinacion-renta-contribuyente-sujeta-gravamen/reducciones-base-imponible-general/reducciones-pensiones-compensatorias.html)
- [AEAT: anualidades por alimentos a favor de hijos](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/especialidades-determinacion-cuota-integra-estatal-autonomica/anualidades-alimentos-favor-hijos/especialidad-tratamiento-anualidades-alimentos.html)
- [AEAT: límites de aportaciones a patrimonios protegidos](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c13-determinacion-renta-contribuyente-sujeta-gravamen/reducciones-base-imponible-general/reducciones-aportaciones-patrimonios-protegidos/limites-maximos-exceso-aportaciones-realizadas.html)

### Deducciones

- [AEAT: porcentajes de deducción por donativos](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c16-deducciones-generales-cuota/deducciones-donativos-otras-aportaciones/donativos-realizados-entidades-incluidas/general-donativos-donaciones-entidades-beneficiarias-mecenazgo/porcentajes-deduccion.html)
- [AEAT: límite aplicable a donativos](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c16-deducciones-generales-cuota/deducciones-donativos-otras-aportaciones/limite-aplicable.html)
- [AEAT: alquiler de vivienda habitual, régimen transitorio](https://sede.agenciatributaria.gob.es/Sede/vivienda-otros-inmuebles/deduccion-arrendatario-alquiler-vivienda-habitual/deduccion-arrendatario-alquiler-vivienda-habitual.html)
- [AEAT: derecho a deducción por inversión en vivienda habitual](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c16-deducciones-generales-cuota/deduccion-inversion-vivienda-habitual-regimen-transitorio/modalidades-deduccion/adquisicion-construc-rehabilitacion-ampliacion-vivienda-habitual/quienes-tienen-derecho-deduccion.html)
- [AEAT: base máxima de inversión en vivienda](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c16-deducciones-generales-cuota/deduccion-inversion-vivienda-habitual-regimen-transitorio/modalidades-deduccion/adquisicion-construc-rehabilitacion-ampliacion-vivienda-habitual/cantidades-satisfechas-derecho-deduccion-base-deducible.html)
- [AEAT: porcentajes de inversión en vivienda](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c16-deducciones-generales-cuota/deduccion-inversion-vivienda-habitual-regimen-transitorio/modalidades-deduccion/adquisicion-construc-rehabilitacion-ampliacion-vivienda-habitual/porcentajes-deduccion.html)
- [AEAT: inversión en empresas de nueva o reciente creación](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c16-deducciones-generales-cuota/deduccion-inversion-empresas-nueva-reciente-creacion/objeto-base-maxima-porcentaje-deduccion.html)
- [AEAT: deducciones generales y autonómicas aplicables en 2025](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c16-deducciones-generales-cuota/introduccion/deducciones-generales-autonomicas-aplicables.html)

### Deducciones reembolsables

- [AEAT: cuantía y límite de la deducción por maternidad](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/resultado-declaracion/deduccion-maternidad-incremento-adicional-gastos-custodia/deduccion-maternidad/cuantia-limite-deduccion.html)
- [AEAT: requisitos del incremento por gastos de custodia](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/resultado-declaracion/deduccion-maternidad-incremento-adicional-gastos-custodia/incremento-adicional-gastos-custodia-guarderias/requisitos-condiciones-aplicar-incremento-adicional.html)
- [AEAT: cuantía del incremento por guardería](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/resultado-declaracion/deduccion-maternidad-incremento-adicional-gastos-custodia/incremento-adicional-gastos-custodia-guarderias/cuantia-incremento-adicional.html)
- [AEAT: importe de la deducción por familia numerosa](https://sede.agenciatributaria.gob.es/Sede/ciudadanos-familias-personas-discapacidad/deducciones-relacionadas-hijos-descendientes/deduccion-familia-numerosa/importe-deduccion.html)
- [AEAT: deducción por descendiente con discapacidad](https://sede.agenciatributaria.gob.es/Sede/ciudadanos-familias-personas-discapacidad/deducciones-personas-discapacidad/deduccion-descendiente-discapacidad-cargo/importe-deduccion.html)

### Retribuciones en especie

- [AEAT: rendimiento íntegro y valoración del trabajo](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c03-rendimientos-trabajo/rendimiento-neto-trabajo-integrar-base-imponible/fase-1-determinacion-rendimiento-integro-trabajo.html)
- [AEAT: comedores y vales de comida](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c03-rendimientos-trabajo/rendimientos-trabajo-especie/rendimientos-trabajo-especie-exentos/entregas-productos-rebajados-comedores-economatos-comida.html)
- [AEAT: transporte colectivo de empleados](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c03-rendimientos-trabajo/rendimientos-trabajo-especie/rendimientos-trabajo-especie-exentos/transporte-colectivo-empleados.html)
- [AEAT: seguros de enfermedad](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c03-rendimientos-trabajo/rendimientos-trabajo-especie/rendimientos-trabajo-especie-exentos/gastos-seguros-enfermedad.html)
- [AEAT: servicios educativos a hijos de empleados](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c03-rendimientos-trabajo/rendimientos-trabajo-especie/rendimientos-trabajo-especie-exentos/servicios-educacion-hijos-empleados.html)

## 15. Criterio de cierre de la implementación

Los pasos 4 y 5 solo podrán marcarse como fiscalmente fiables cuando:

1. el formulario recoja todos los campos obligatorios de la regla seleccionada;
2. el motor respete el orden del apartado 4;
3. todas las cantidades autonómicas necesarias estén versionadas;
4. los casos del apartado 13 cuadren a céntimos con Renta WEB 2025 o se documente cualquier diferencia de alcance;
5. cada resultado muestre fórmula, datos usados, límite, estado y fuente;
6. las reglas incompletas devuelvan `no_estimado` y no cero ni una cifra inventada.
