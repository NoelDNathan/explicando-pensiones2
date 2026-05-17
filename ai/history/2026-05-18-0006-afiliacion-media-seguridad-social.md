# Historial de interaccion

Fecha: 2026-05-18

## Objetivo

Descargar el historico del numero de trabajadores que aportan al sistema de pensiones usando una fuente oficial.

## Archivos modificados

- `data/raw/seguridad-social/afiliacion/2026-05-18_seguridad-social_pagina-afiliados-medios-totales.html`
- `data/raw/seguridad-social/afiliacion/2026-05-18_seguridad-social_serie-afiliacion-media-regimenes_2001-2026-04.xlsx`
- `data/processed/seguridad-social/2026-05-18_seguridad-social_afiliacion-media-total-sistema_mensual_2001-2026.csv`
- `data/processed/seguridad-social/2026-05-18_seguridad-social_afiliacion-media-total-sistema_anual_2001-2026.csv`
- `data/sources.md`
- `data/methodology/transformations.md`
- `ai/current.md`

## Resumen de cambios

- Descargada desde Seguridad Social la serie oficial de afiliacion media por regimenes 2001-2026, actualizada a abril de 2026.
- Extraida la columna `TOTAL SISTEMA` para obtener la afiliacion media mensual total.
- Generada una serie anual como media simple de los meses disponibles, con 2026 marcado como ano parcial.
- Registradas fuente y metodologia, indicando que afiliacion media mide afiliaciones y no necesariamente personas unicas.

## Estado siguiente

- Usar esta serie para calcular el ratio afiliados/pensionista cuando se incorpore una serie historica observada de pensionistas.
- Evitar presentar la serie como personas unicas sin una nota explicativa.
