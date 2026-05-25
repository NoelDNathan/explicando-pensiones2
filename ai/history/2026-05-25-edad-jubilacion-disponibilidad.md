# Interaccion - disponibilidad de edad de jubilacion

- fecha: 2026-05-25
- objetivo: comprobar si el proyecto ya contiene datos sobre la edad a la que se jubilan las personas.
- archivos modificados:
  - `ai/current.md`
  - `ai/history/2026-05-25-edad-jubilacion-disponibilidad.md`
- resumen de cambios: se reviso el inventario y el libro bruto de Seguridad Social de abril de 2026. El dato existe en bruto en el libro mensual de pensiones: hojas `AJ_ambos_sexos`, `AJ_hombres`, `AJ_mujeres`, `EVO_acumula_altas_jub_edad` y `EVO_acumula_altas_jub_modalidad`. Aun no hay CSV procesado ni ficha propia de metadata para usarlo editorialmente.
- estado siguiente: si se quiere usar en la web, procesar desde el libro de Seguridad Social una serie de edad media de altas iniciales de jubilacion, separando datos mensuales recientes, acumulados anuales y modalidades de jubilacion.
