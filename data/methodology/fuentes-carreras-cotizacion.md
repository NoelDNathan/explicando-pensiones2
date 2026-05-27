# Fuentes para carreras de cotizacion al jubilarse

Fecha de revision: 2026-05-28

## Pregunta

Buscar una fuente oficial para saber cuantos anos ha trabajado o cotizado una persona antes de jubilarse, idealmente con evolucion anual desde 1975 hasta la actualidad.

## Conceptos

- `anos trabajados`: concepto laboral amplio. Puede aproximarse con episodios de alta/vida laboral, pero no siempre equivale a anos cotizados computables para pension.
- `dias cotizados`: concepto administrativo de Seguridad Social. Es el indicador preferente si se quiere explicar el derecho de jubilacion.
- `anos computables`: anos que computan a efectos de porcentaje de pension. Puede incluir reglas, bonificaciones o computos que no son dias efectivamente trabajados.

## Fuentes oficiales localizadas

1. Seguridad Social, fichero de altas de pensiones de jubilacion en sala segura.
   - Campos documentados: dias cotizados a lo largo de la vida laboral, dias cotizados en los ultimos 15 anos, anos computables a efectos de porcentaje y edad real en la fecha de jubilacion.
   - Uso potencial: mejor fuente para calcular media, mediana y distribucion de dias cotizados en las nuevas jubilaciones.
   - Limitacion: acceso no inmediato como descarga publica simple; requiere canal de microdatos/sala segura.

2. Seguridad Social, Muestra Continua de Vidas Laborales (MCVL).
   - Campos documentados: anos considerados cotizados para la jubilacion y periodo de cotizacion en meses.
   - La guia indica que el dato esta disponible para pensiones de jubilacion reconocidas despues de 1996; para pensiones mas antiguas puede no constar.
   - Uso potencial: reconstruccion microfundada desde ediciones MCVL, con cautelas de representatividad y acceso.

3. Seguridad Social, Informes Economico-Financieros de los Presupuestos de la Seguridad Social.
   - Publican distribuciones por anos cotizados de pensiones de jubilacion en vigor y de altas de jubilacion.
   - Uso potencial: evolucion agregada por tramos de cotizacion, no media exacta salvo que se estime a partir de intervalos.

4. eSTADISS.
   - Permite consultar y exportar estadisticas de pensiones en Excel o texto segun parametros.
   - Uso potencial: extraccion manual de tablas agregadas si ofrece la dimension de anos cotizados para altas o pensiones en vigor.
   - Limitacion: consulta interactiva con captcha; no debe tratarse como API automatizable sin validacion.

## Cobertura recomendada

- 1996-hoy: viable como dato administrativo de cotizacion, sujeto a acceso y extraccion. Es el tramo natural porque la Base de Datos de Prestaciones se crea en 1996.
- 2004-hoy: viable como investigacion con MCVL anual, si se dispone de microdatos y se documentan sesgos.
- 1975-1995: no se ha localizado una serie oficial homogenea y directamente comparable de dias cotizados o anos computables al jubilarse. Puede haber informacion historica en anuarios o publicaciones impresas, pero habria que tratarla como tramo separado y con ruptura metodologica.

## Primera extraccion incorporada

- Fecha: 2026-05-28.
- Dataset procesado: `data/processed/seguridad-social/2026-05-28_seguridad-social_altas-jubilacion-anos-cotizados-tramos_2013-2021.csv`.
- Cobertura de disponibilidad: `data/processed/seguridad-social/2026-05-28_seguridad-social_altas-jubilacion-anos-cotizados-cobertura_1975-2026.csv`.
- Fuente usada: Informes Economico-Financieros a los Presupuestos de la Seguridad Social, cuadros de altas de pensiones de jubilacion por regimenes y anos cotizados.
- Anos con valores transcritos: 2013, 2014 y 2016-2021. El dato de 2018 se publica a 30 de septiembre.
- Pendiente: localizar o exportar una tabla equivalente para 2015 y para 2022-2026, preferiblemente desde eSTADISS o informes recientes.
- Limitacion: es distribucion agregada por tramos, no dias cotizados ni media exacta. No permite responder literalmente "cuantos anos ha trabajado de media" sin introducir una estimacion adicional.

## Criterio editorial

No presentar una serie continua 1975-hoy de "anos trabajados antes de jubilarse" salvo que se documente una fuente historica oficial comparable para 1975-1995. Para la web, la formulacion mas segura es:

> "La Seguridad Social registra los dias/anos cotizados usados para reconocer la jubilacion. La serie administrativa moderna es trazable desde 1996; antes de esa fecha no se ha localizado una fuente comparable."
