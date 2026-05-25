# Gasto sanitario por edad: datos necesarios para un dashboard vital

Fecha de revision: 2026-05-25

## Objetivo

Construir una vista didactica tipo "gasto sanitario a lo largo de la vida" para Espana, usando un ano base trazable y separando datos observados, estimaciones institucionales y calculos propios.

## Datos necesarios

| Pieza visual / metrica | Dato necesario | Estado actual | Fuente localizada | Uso seguro |
|---|---|---|---|---|
| Perfil por edad | Gasto sanitario publico per capita por grupo de edad y sexo | Localizado y procesado para 2022 | AIReF, Documento tecnico 2025, graficos y cuadros | Mostrar como perfil estimado AIReF 2022 |
| Consumo vital esperado | Supervivencia / anos-persona por edad del mismo ano base | Localizado y ya disponible en bruto para 2022 | INE, Tablas de Mortalidad, tabla 27153 | Combinar con el perfil AIReF para un calculo derivado |
| Barras por tramo de edad | Agrupar los grupos quinquenales en bandas 0-14, 15-24, 25-44, 45-64, 65-74, 75-84 y 85+ | Generado como CSV derivado | AIReF + INE | Vista resumida para dashboard, no dato original publicado |
| Desglose por categoria sanitaria y edad | Gasto per capita por edad, sexo y categoria: hospitalaria, especializada, primaria, farmacia, resto | No localizado completo en el Excel 2025 | AIReF publica evoluciones por funcion y perfil total; no tabla cruzada completa en el Excel revisado | No construir barras apiladas por categoria salvo que se localice una tabla oficial/institucional adicional |
| Farmacia por edad | Gasto o consumo de farmacia por grupos de edad y sexo | Localizado parcialmente en AIReF/ENS 2017 | AIReF, graficos 6-8 | Puede documentarse como pieza separada, no como desglose completo del total |
| Total oficial del gasto sanitario publico | Gasto sanitario publico total del ano base | Pendiente para la vista 2022 si se quiere reconciliar con macro total | Ministerio de Sanidad EGSP / IGAE COFOG | Usar solo para anclar magnitudes agregadas, no para repartir por edad si no hay cruce |
| Categorias de cuidados de larga duracion | Beneficiarios/coste por edad y sexo | Localizado en AIReF 2025 para 2023 | AIReF, graficos 23-25 | Mantener separado de sanidad si se incluye como bloque de dependencia |

## Archivos generados

- `data/raw/airef/sanidad-educacion-cuidados/2026-05-25_airef_graficos-cuadros-dt-sanidad-educacion-cuidados.xlsx`
- `data/raw/airef/sanidad-educacion-cuidados/2026-05-25_airef_dt-sanidad-educacion-cuidados-2025.pdf`
- `data/processed/airef/2026-05-25_airef_perfil-gasto-sanitario-edad-sexo-percapita_2022.csv`
- `data/processed/airef/2026-05-25_airef_ine_gasto-sanitario-vital-esperado-edad-sexo_2022.csv`
- `data/processed/airef/2026-05-25_airef_ine_gasto-sanitario-vital-esperado-bandas-dashboard_2022.csv`
- `data/raw/ministerio-sanidad/gasto-sanitario-edad/2026-05-25_ministerio-sanidad_igtgs2005_perfiles-gasto-sanitario-edad.pdf`
- `data/raw/ministerio-sanidad/gasto-sanitario-edad/2026-05-25_ministerio-sanidad_egsp-principales-resultados-2024.pdf`
- `data/processed/ministerio-sanidad/2026-05-25_estimacion-gasto-sanitario-categoria-edad_airef-egsp-igtgs_2022.csv`
- `data/processed/ministerio-sanidad/2026-05-25_estimacion-gasto-sanitario-categoria-bandas-dashboard_airef-egsp-igtgs_2022.csv`
- `data/processed/ministerio-sanidad/2026-05-25_estimacion-gasto-sanitario-sistema-categoria-edad_airef-egsp-ine_2022.csv`
- `data/processed/ministerio-sanidad/2026-05-25_estimacion-gasto-sanitario-sistema-categoria-bandas-dashboard_airef-egsp-ine_2022.csv`

## Metodologia aplicada

1. Se extrae del Excel de AIReF el grafico 11: perfil del gasto sanitario por genero y grupo de edad, per capita, ano 2022.
2. Se conserva la serie AIReF en formato largo con sexo, grupo de edad y euros per capita de 2022.
3. Para una metrica derivada de consumo vital esperado, se cruza cada grupo de edad con la poblacion estacionaria de la tabla de mortalidad INE 2022.
4. El gasto esperado por tramo se calcula como:

```text
gasto esperado tramo = gasto per capita AIReF 2022 x anos-persona INE 2022 / 100000
```

5. Se genera una vista adicional agregada a bandas de dashboard. Esta agregacion es una transformacion propia y no debe presentarse como tabla publicada directamente por AIReF.

## Estimacion por categoria sanitaria

Ante la ausencia de un cruce institucional reciente categoria x edad, se genera una capa estimada separada para poder aproximar las barras por categoria sin inventar datos no documentados:

1. Se mantiene el total de gasto vital esperado por edad calculado con AIReF 2022 e INE 2022.
2. Se usan pesos funcionales de la EGSP 2022 del Ministerio de Sanidad para cinco bloques:
   hospitalaria y especializada; atencion primaria; farmacia; protesis y traslados; salud publica, servicios colectivos y capital.
3. Se aplican perfiles relativos por edad del informe ministerial IGTGS 2005 para hospitalaria, farmacia y ambulatoria.
4. La atencion primaria usa el perfil ambulatorio como proxy, con advertencia metodologica.
5. Protesis/traslados y salud publica/colectivos/capital se reparten con perfil plano al no haber localizado un perfil compatible.
6. En cada grupo de edad, los pesos funcionales se ajustan por el indice relativo de edad y se normalizan para que las categorias sumen el total AIReF de ese grupo.

Categorias no separadas: urgencias y salud mental. No se han localizado como cruce institucional compatible por edad, asi que no se muestran como categorias independientes en el dashboard.

## Vista colectiva

La vista colectiva responde a otra pregunta: cuanto representa cada rango de edad en el gasto anual del sistema. Para construirla:

1. Se toma el gasto anual per capita por categoria y edad de la estimacion AIReF/EGSP/IGTGS.
2. Se calcula la poblacion media trimestral INE 2022 por edad simple.
3. Se multiplica gasto per capita x poblacion del mismo tramo.
4. Se agregan los resultados a las mismas bandas visuales del dashboard.

Esta vista no es gasto vital ni gasto ejecutado observado por edad. Es una estimacion de sistema para comparar volumen colectivo entre edades.

## Limitaciones

- El calculo vital esperado es un ejercicio de periodo con perfil de gasto 2022 y tabla de mortalidad 2022. No representa una cohorte real nacida en 2022 ni incorpora cambios futuros en tecnologia, precios relativos, morbilidad o cartera de servicios.
- AIReF etiqueta el perfil como estimacion. Por tanto, los CSV se marcan como `estado_dato = estimado`.
- El Excel revisado no contiene una tabla completa por edad, sexo y categoria sanitaria para replicar de forma trazable las barras apiladas de la imagen de referencia.
- El desglose por categoria generado aqui tambien se marca como `estado_dato = estimado`: no es una tabla oficial categoria x edad, sino una combinacion documentada de AIReF, INE y Ministerio de Sanidad.
- Los perfiles relativos del IGTGS 2005 son antiguos. Sirven como forma institucional de edad relativa por funcion, no como nivel actual observado.
- No mezclar sanidad y cuidados de larga duracion en una sola categoria sin etiquetar la definicion, porque AIReF los modeliza como bloques distintos.
