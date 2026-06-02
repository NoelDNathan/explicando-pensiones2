# 2026-06-02 - Documentacion impacto FIPROS ingresos Seguridad Social

- Fecha: 2026-06-02.
- Objetivo: documentar como afecta la anomalia del total 2002 de FIPROS al uso de la fuente candidata 1990-1994.
- Archivos modificados:
  - `data/methodology/validacion-ingresos-seguridad-social-1990-1994.md`
  - `data/methodology/transformations.md`
  - `data/sources.md`
  - `data/inventory.md`
  - `data/metadata.md`
  - `ai/current.md`
- Resumen de cambios: se dejo documentado que `cotizaciones_sociales` y `transferencias_corrientes` pueden usarse solo como candidatos pendientes de fuente primaria para 1990-1994, mientras que `total_neto_consolidado`, `otros_ingresos` y porcentajes sobre total quedan bloqueados por discrepancias en el solape 1995-2007, especialmente 2002.
- Estado siguiente: localizar la fuente primaria citada por FIPROS: Anuario de Estadisticas Laborales y Observatorio Social de Espana, Informe 2007.
