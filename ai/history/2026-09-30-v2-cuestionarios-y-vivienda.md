# 2026-09-30 · v2: cuestionarios y vivienda/coche

Objetivo: pulir los formularios de la v2 tras la revisión del usuario.

Archivos: Irpf2025StructuredAdjustmentsForm.tsx, escenario/EscenarioForms.css,
escenario/EscenarioLimits.css, escenario/EscenarioWealth.css.

Cambios:
- Campos de los pasos 4, 5 y 7: una fila por campo, cifra grande editable, cifra y unidad
  en la misma línea, sin flechas del navegador; contador con botones − y + (solo v2);
  marcador «0» en los importes vacíos; desplegables en cápsula.
- Paso 2: opciones del selector de grupo en tres columnas alineadas.
- Paso 9: con «Sí», sin paneles anidados; cada vivienda o coche es un capítulo con campos
  grandes, escala del tipo gruesa, cuota como cifra protagonista, compra como fila
  desplegable y totales alineados a la izquierda en móvil.

Verificado en pantalla: pasos 2, 3, 4, 7 y 9 a 1280 px; paso 9 a 375 px; sin scroll
horizontal en ningún paso a 375 px. tsc y verify:styles en verde.
Siguiente: coche del paso 9 solo comprobado por medidas; revisar con datos reales.
