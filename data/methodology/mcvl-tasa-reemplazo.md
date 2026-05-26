# MCVL - reconstruccion de tasa de reemplazo de jubilacion

Fecha de preparacion: 2026-05-27.

## Objetivo

Reconstruir una tasa observada lo mas cercana posible a la definicion del Ageing Report:

`pension inicial media de nuevos pensionistas / salario final medio antes de la jubilacion`.

## Fuente candidata

- Fuente: Seguridad Social, Muestra Continua de Vidas Laborales (MCVL).
- Institucion: Ministerio de Inclusion, Seguridad Social y Migraciones / Seguridad Social.
- URL: https://portaldatos.seg-social.gob.es/mcvl
- Ediciones candidatas documentadas: 2004-2024 para MCVL sin datos fiscales.
- Estado local: microdatos no disponibles actualmente en `data/raw/seguridad-social/mcvl/`.

## Metodo propuesto

1. Seleccionar personas que causan una pension contributiva de jubilacion en la edicion MCVL de referencia.
2. Identificar pension inicial o pension efectiva mensual reconocida en la tabla de prestaciones.
3. Anualizar la pension con 14 pagas, salvo contingencias con 12 pagas si se decide incluirlas.
4. Reconstruir salario final desde bases de cotizacion mensuales previas a la fecha de efectos economicos de la pension.
5. Usar una ventana principal de 12 meses anteriores al mes previo a la jubilacion; documentar alternativas de sensibilidad con 24 o 36 meses.
6. Calcular `tasa_reemplazo = pension_anualizada / base_cotizacion_anualizada_previa * 100`.
7. Agregar por ano de alta de jubilacion, idealmente con media, mediana, percentiles y numero de observaciones.

## Comparabilidad con Ageing Report

- Alta en concepto, porque enlaza pension inicial y salario previo de la misma persona.
- No perfecta, porque Ageing Report es un escenario armonizado europeo y la MCVL seria una reconstruccion administrativa observada.
- Debe mostrarse como tramo `observado_reconstruido_mcvl` y no como continuidad homogenea directa del tramo `proyectado_ageing_report`.

## Limitaciones pendientes

- Sin los microdatos no se puede calcular ningun valor observado.
- La edicion 2004 tiene una advertencia especifica en la guia MCVL: la variable comparable figura como pension inicial; desde 2005 se documenta pension efectiva mensual.
- Las bases de cotizacion no son exactamente salario bruto final: tienen topes maximos/minimos y pueden diferir de la remuneracion real.
- Hay que decidir tratamiento de autonomos, pluriactividad, jubilacion parcial, jubilacion anticipada/demorada, concurrencia de pensiones y pensiones con importe cero por limite maximo.

## Archivos asociados

- Script de cobertura: `scripts/process-mcvl-replacement-rate-coverage.ps1`.
- CSV de cobertura candidata: `data/processed/seguridad-social/2026-05-27_mcvl_tasa-reemplazo-cobertura-candidata_2004-2024.csv`.
