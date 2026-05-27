# Fuentes para edad legal y efectiva de jubilacion

Fecha de revision: 2026-05-27

## Criterio

Para la narrativa principal se prioriza la `edad media de altas iniciales de jubilacion` de Seguridad Social. No se mezcla con la edad de salida efectiva del mercado laboral de OCDE/Eurostat, porque esa variable mide salida del empleo o actividad y no necesariamente acceso a pension contributiva de jubilacion.

## Fuentes oficiales utiles

1. Congreso de los Diputados / Seguridad Social, Informe Economico-Financiero a los Presupuestos de la Seguridad Social de 2017.
   - Uso: serie total de edad media de altas de jubilacion 2006-2016.
   - Estado: descargado en bruto local.
   - Archivo: `data/raw/seguridad-social/edad-jubilacion/2026-05-27_congreso-pge2017_seguridad-social_informe-economico-financiero-edad-altas-jubilacion_2006-2016.pdf`.

2. Seguridad Social, EVOMOD202501, `Evolucion de las altas iniciales de jubilacion por modalidades`.
   - Uso: serie 2016-2025 por modalidades, sexo y regimen; para el CSV se usa la fila `TOTAL ALTAS` de ambos sexos para 2017-2021.
   - Estado: localizado como PDF oficial indexado; no descargado localmente porque la URL del gestor documental devolvio 404 al intentar conservar el bruto.
   - Siguiente paso: buscar URL estable o descarga alternativa en el portal de Seguridad Social.

3. Seguridad Social, catalogo `Edad de jubilacion en el acceso a la prestacion`, CSV `Evolucion de altas iniciales de jubilacion por edades`.
   - Uso: 2022-2025 anuales y 2026 acumulado a marzo.
   - Estado: descargado en bruto local.
   - Archivo: `data/raw/seguridad-social/pensiones/2026-05-27_seguridad-social_catalogo-evolucion-altas-jubilacion-edad_2022-2026.csv`.

4. Ministerio de Empleo y Seguridad Social, nota de prensa de 2014 sobre edad real de jubilacion.
   - Uso: contraste puntual de valores 2012 y 2013 citados por el Ministerio.
   - Estado: descargado en bruto local.
   - Archivo: `data/raw/seguridad-social/edad-jubilacion/2026-05-27_inclusion_nota-prensa-edad-real-jubilacion-2012-2013.pdf`.

5. BOE / Seguridad Social, normativa de edad ordinaria.
   - Uso: reconstruccion de edad legal ordinaria general y via de 65 anos con carrera larga desde 2013.
   - Fuentes: Ley 27/2011, articulo 205 LGSS y cuadro gradual de Seguridad Social.

## Fuentes descartadas para rellenar la serie principal

- OCDE, `average effective age of labour market exit`: util para comparacion internacional, pero no equivalente a edad de alta inicial de jubilacion.
- Noticias economicas: utiles como pistas para localizar PGE, EVOMOD o notas oficiales, pero no se usan como fuente de datos en el CSV.
- Fuentes privadas o informes de think tanks: utiles para pistas metodologicas, pero no sustituyen al dato oficial.

## Hueco pendiente

Queda pendiente localizar una fuente oficial comparable para 1975-2005. Candidatas: anuarios estadisticos de Seguridad Social/MTAS, informes economico-financieros de presupuestos anteriores, Boletines de Estadisticas Laborales o reconstruccion desde tablas oficiales de altas por edad si publican distribucion completa.
