# MCVL - carreras de cotizacion al jubilarse, tramo 1996-2012

Fecha de preparacion: 2026-06-01.

## Objetivo

Preparar la via administrativa para medir anos/periodo cotizado al reconocer una pension de jubilacion entre 1996 y 2012, sin confundirlo con anos trabajados ni con las tablas publicas por tramos de los Informes Economico-Financieros.

## Fuente candidata

- Fuente preferente completa: Seguridad Social, Base de Datos de Prestaciones o fichero de altas de jubilacion en sala segura.
- Fuente muestral candidata: Seguridad Social, Muestra Continua de Vidas Laborales (MCVL), tabla de pensiones/prestaciones.
- Documentacion bruta conservada:
  - `data/raw/seguridad-social/carreras-cotizacion/2026-06-01_seguridad-social_mcvl-guia-contenido-campos-cotizacion-jubilacion_2021.pdf`
  - `data/raw/seguridad-social/carreras-cotizacion/2026-06-01_seguridad-social_mcvl-guia-contenido-campos-cotizacion-jubilacion_2025.pdf`

## Campos MCVL relevantes

- `4.004 Clase de la prestacion`: filtrar jubilacion contributiva.
- `4.010 Regimen de la pension`: permitir desglose por regimen si la muestra lo soporta.
- `4.011 Fecha de efectos economicos de la pension`: aproximacion al ano de alta/reconocimiento.
- `4.015 Anos considerados cotizados para la jubilacion`: anos enteros que computan para la pension.
- `4.028 Tipo de situacion de jubilacion`: distinguir ordinaria, anticipada, demorada, parcial u otras modalidades cuando proceda.
- `4.041 Periodo de cotizacion`: periodo completo de cotizacion documentado en la guia reciente.
- `4.042 Porcentaje por anos cotizados`: porcentaje usado por carrera de cotizacion, util como control, no como anos.

## Cobertura realista

- 1996-2003:
  - La Base de Datos de Prestaciones conserva historicos desde 1996, por lo que la via completa existe administrativamente.
  - La MCVL publica ediciones desde 2004. Usar una edicion posterior para altas 1996-2003 observaria solo pensiones que sobreviven y personas incluidas en la muestra, no todas las altas originales. No debe usarse como media agregada completa sin corregir y documentar sesgo de supervivencia.
- 2004-2012:
  - Hay ediciones MCVL candidatas del mismo ano o posteriores.
  - Con microdatos autorizados puede calcularse una reconstruccion muestral de carreras de cotizacion de nuevas jubilaciones.
  - Para una serie oficial completa de altas, la fuente preferente sigue siendo Base de Datos de Prestaciones/sala segura.

## Transformacion propuesta si se obtienen microdatos

1. Guardar los ficheros autorizados bajo `data/raw/seguridad-social/mcvl/`, sin publicarlos si las condiciones de uso lo impiden.
2. Identificar tabla de pensiones/prestaciones de cada edicion candidata.
3. Filtrar prestaciones de jubilacion contributiva.
4. Derivar `anio_alta_jubilacion` desde `fecha de efectos economicos`.
5. Conservar `anos_considerados_cotizados` y, si la edicion lo incluye, `periodo_cotizacion` completo.
6. Agregar por `anio_alta_jubilacion` y, si la muestra lo permite, por regimen y modalidad.
7. Publicar solo agregados no identificables: numero de observaciones, media, mediana, percentiles y tramos.
8. Etiquetar el resultado como `observado_reconstruido_mcvl` si procede de MCVL; no mezclarlo con `observado_agregado` de Informes Economico-Financieros.

## Estado local

El script `scripts/process-mcvl-carreras-cotizacion-1996-2012-coverage.ps1` genera una tabla de cobertura candidata y escanea si hay microdatos locales de pensiones/prestaciones. En esta revision no se detectan microdatos locales, por lo que no se calculan valores.

Archivo generado:

- `data/processed/seguridad-social/2026-06-01_mcvl_carreras-cotizacion-jubilacion-cobertura-candidata_1996-2012.csv`

## Criterio editorial

Para la web, el tramo 1996-2012 puede describirse como `viable administrativamente, pendiente de acceso`, no como dato incorporado. Si se usa MCVL en vez de Base de Datos de Prestaciones completa, debe explicarse que es una reconstruccion muestral y que 1996-2003 no representa automaticamente todas las altas de jubilacion de esos anos.
