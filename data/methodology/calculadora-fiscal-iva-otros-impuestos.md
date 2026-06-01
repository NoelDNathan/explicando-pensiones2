# IVA y otros impuestos en la calculadora fiscal

Fecha: 2026-06-01

Objetivo: definir como incorporar IVA y otros impuestos en la calculadora fiscal sin mezclarlos con el neto laboral. La calculadora debe distinguir siempre entre descuento de nomina y carga fiscal indirecta estimada.

## Principio de presentacion

La pantalla debe separar tres resultados:

| Bloque | Que mide | Precision esperada | Etiqueta |
| --- | --- | --- | --- |
| Neto laboral | Salario bruto menos cotizaciones del trabajador e IRPF/retencion | Alta si los parametros estan completos | `neto laboral` |
| IVA | IVA soportado al gastar parte del dinero disponible | Media o personalizada aproximada | `IVA estimado` |
| Otros impuestos | Impuestos indirectos/locales/especiales no incluidos en nomina | Baja/media | `otros impuestos estimados` |

No restar IVA ni otros impuestos dentro de `neto laboral`. Si se muestra una cifra ampliada, llamarla `carga fiscal ampliada estimada`.

## IVA: dos opciones

### Opcion A: media por rango salarial o renta

Sirve para que el usuario vea una referencia de cuanto IVA soportaria una persona u hogar parecido por nivel de ingresos.

Metodo:

1. Obtener de INE EPF el gasto medio anual por categorias COICOP y tramo de ingresos/renta disponible del hogar.
2. Decidir el denominador: hogar, persona, adulto equivalente o trabajador. Documentarlo antes de usarlo.
3. Mapear cada categoria COICOP a tipo de IVA: 21%, 10%, 4%, 0%/exento o mezcla.
4. Calcular el IVA incluido por categoria.
5. Sumar categorias y mostrar como media orientativa.

Formula cuando el gasto esta expresado con IVA incluido:

```text
iva_categoria = gasto_categoria * tipo_iva / (100 + tipo_iva)
```

Si una categoria tiene mezcla de tipos, usar pesos documentados:

```text
iva_categoria = suma(gasto_categoria * peso_tipo * tipo_iva / (100 + tipo_iva))
```

Estado actual: pendiente de procesar dataset INE EPF por tramo de ingresos. Hasta tenerlo, no mostrar cifras medias por rango salarial.

### Opcion B: gasto introducido por el usuario

Sirve para una estimacion personal. El usuario introduce cuanto gasta al ano en categorias comprensibles.

Categorias iniciales recomendadas:

| Categoria UI | Tipo por defecto | Cautela |
| --- | ---: | --- |
| Vivienda: alquiler o hipoteca | 0% | No equivale a todo gasto de vivienda; reformas, reparaciones y vivienda nueva van aparte |
| Suministros del hogar | 21% | Electricidad, gas y agua pueden tener reglas especificas por ano |
| Alimentos basicos | 4% | Algunos productos pueden estar al 0%, 4% o 10% |
| Alimentacion general | 10% | Simplificacion para supermercado no basico |
| Restaurantes y hosteleria | 10% | Aproximacion generalmente razonable |
| Transporte publico | 10% | Puede variar por ayudas y servicios concretos |
| Carburantes | 21% | Ademas hay impuestos especiales, que van en otros impuestos |
| Ropa y calzado | 21% | Tipo general |
| Tecnologia, muebles y equipamiento | 21% | Tipo general |
| Ocio y cultura | 21% | Categoria mixta; libros/cine/espectaculos pueden diferir |
| Salud, educacion y seguros | 0% | Muchos servicios estan exentos, pero no todos los productos lo estan |
| Otros consumos | 21% | Categoria residual; permitir ajuste avanzado si se implementa |

Regla de interfaz: mostrar el tipo aplicado y permitir que el usuario cambie a modo avanzado solo si entiende que es una aproximacion.

## Otros impuestos: media espanola estimada

Para la primera version, el usuario ha decidido que `otros impuestos` sea una media de lo que paga un espanol, no un formulario detallado.

Componentes candidatos:

| Componente | Fuente/method posible | Denominador recomendado |
| --- | --- | --- |
| Impuestos especiales sobre hidrocarburos | AEAT recaudacion o gasto EPF en carburantes + tipos legales | persona adulta, hogar o trabajador |
| Impuesto especial sobre electricidad | AEAT/recaudacion y normativa; alternativa con gasto EPF en electricidad | hogar |
| Alcohol y tabaco | AEAT recaudacion o EPF si se decide incluir consumo medio | persona adulta u hogar |
| IBI | Ministerio de Hacienda/catastro o liquidaciones de entidades locales | hogar o propietario |
| IVTM/circulacion | Liquidaciones locales o estadisticas tributarias territoriales | hogar con vehiculo o media por hogar |

Recomendacion de primera version:

1. Crear una unica cifra `otros_impuestos_media_espana`.
2. Documentar si el denominador es por hogar, por persona o por trabajador.
3. Si las fuentes no permiten repartir limpiamente por rango salarial, no fingir progresividad: mostrarlo como media nacional.
4. No incluir IVA dentro de otros impuestos para evitar doble conteo.

## Fuentes candidatas

- INE, Encuesta de Presupuestos Familiares: gasto por categorias de consumo y caracteristicas del hogar.
- Agencia Tributaria: estadisticas de recaudacion por IVA e impuestos especiales.
- AIReF: herramienta de focalizacion del IVA, util como contraste metodologico para efectos distributivos.
- Ministerio de Hacienda / Haciendas locales: liquidaciones o estadisticas para tributos locales cuando se incorporen IBI/IVTM.

## Criterios antes de publicar cifras

- Guardar cualquier tabla media procesada en `data/processed/fiscal/` o subcarpeta especifica.
- Documentar metadata: fuente, institucion, URL, fecha, periodo, unidad, denominador, metodologia, transformaciones y limitaciones.
- Recalcular `data/checksums.sha256`.
- Etiquetar `IVA medio` y `otros impuestos medios` como `estimado`.
- No mezclar gasto medio por hogar con salario individual sin explicar el denominador.
