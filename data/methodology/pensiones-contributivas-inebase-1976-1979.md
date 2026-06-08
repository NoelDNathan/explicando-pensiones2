# INEbase Historia - pensiones contributivas 1976-1979

Fecha de revision: 2026-06-07

## Objetivo

Revisar el PDF candidato de INEbase Historia para cubrir el hueco 1976-1979 en numero de pensiones contributivas, sin sustituirlo por personas pensionistas ni interpolaciones.

## Fuente revisada

- Institucion: INE / INEbase Historia.
- Fuente: Anuario Estadistico de Espana 1980, tabla de pensiones en vigor a 31 de diciembre de 1976, 1977, 1978 y 1979.
- Archivo bruto local: `data/raw/inebase-historia/pensiones-contributivas/2026-05-25_inebase_189001_pensiones-1976-1979.pdf`.
- Periodo: 1976-1979.
- Unidad: pensiones en vigor.
- Corte temporal: 31 de diciembre de cada ano.
- Estado del dato: candidato pendiente de validacion; no incorporado a la serie editorial.

## Metodo de inspeccion

El PDF se renderizo localmente con Ghostscript para revision visual de paginas y se genero una capa de texto auxiliar con `txtwrite`. La capa de texto es ruidosa, por lo que la revision valida solo lo que se puede contrastar visualmente en las paginas renderizadas.

Cada ano aparece dividido en dos paginas: la primera contiene las clases principales de pension y la segunda contiene las columnas finales, incluida `TOTAL` cuando esta impresa. La tabla no muestra una fila unica de total sistema; el total debe reconstruirse sumando regimenes y cajas, lo que exige doble control para evitar duplicidades o filas no comparables.

## Resultado de la revision

Para 1979, los totales de regimen visibles en la columna `TOTAL` permiten una suma candidata de 3.947.153 pensiones:

| Regimen o caja | Pensiones |
| --- | ---: |
| Suma regimen general | 1.622.042 |
| Autonomos | 306.457 |
| Agraria cuenta ajena | 564.598 |
| Agraria cuenta propia | 816.830 |
| Mineria del carbon | 63.907 |
| Artistas | 3.598 |
| Empleadas de hogar | 72.956 |
| Escritores | 148 |
| Ferroviarios | 89.789 |
| Representantes de comercio | 6.004 |
| Toreros | 628 |
| Caja de compensacion / SOVI | 400.196 |
| Total candidato por suma | 3.947.153 |

Para 1976-1978, la revision no es suficiente para cerrar una serie validada. En esos anos hay regimenes agrarios con valores por clase de pension en la primera pagina, pero la columna `TOTAL` de la continuacion aparece en blanco, con puntos o no es legible de forma consistente. Es posible reconstruir importes parciales sumando clases, pero esa transformacion necesita una doble transcripcion y una regla metodologica explicita antes de usarla.

## Decision

No se incorpora ningun valor 1976-1979 al CSV maestro en esta revision.

El valor 1979 queda documentado como candidato transcrito visualmente, no como dato editorial. Para usarlo en la web habria que completar el bloque 1976-1979 con el mismo criterio, registrar las sumas por regimen, documentar cualquier interpretacion de celdas en blanco y, si es posible, contrastarlo con otra fuente oficial o institucional.

## Siguiente paso

Realizar una segunda pasada de transcripcion controlada del PDF:

1. Capturar por ano y regimen todas las clases de pension visibles.
2. Separar celdas impresas en `TOTAL` de totales reconstruidos por suma de clases.
3. Marcar cada fila como `observado_transcrito`, `observado_reconstruido_desde_clases` o `pendiente_validacion`.
4. Actualizar metadata y checksums solo si se crea un CSV procesado.
