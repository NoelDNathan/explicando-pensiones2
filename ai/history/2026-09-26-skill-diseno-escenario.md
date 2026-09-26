# 2026-09-26 · Skill «diseno-escenario»

## Objetivo
Elegida la dirección D (Escenario) para el rediseño de la calculadora fiscal, crear una skill
que permita diseñar cualquier paso con ese estilo de forma consistente.

## Archivos modificados
- `.claude/skills/diseno-escenario/SKILL.md`
- `.claude/skills/diseno-escenario/references/tokens-escenario.md`
- `.claude/skills/diseno-escenario/references/patrones.md`
- `.claude/skills/diseno-escenario/assets/escenario-paso3-escritorio.dc.html`
- `.claude/skills/diseno-escenario/assets/escenario-paso3-movil.dc.html`
- `ai/current.md`

## Resumen de cambios
- La skill fija las reglas acordadas (texto literal, nada de hover, solo tokens `--fiscal-*`,
  solo la calculadora, comprobar en pantalla) y el flujo: inventario del paso, protagonista,
  patrones, verificación y notas en `ai/`.
- Propone una capa de tokens de escenario como alias de la paleta actual (fondo, textos,
  acentos claros, tipografía, tamaños, espacios y movimiento) y cargar Anybody e Instrument
  Sans con Fontsource solo en la calculadora. Aún no se ha aplicado al código.
- Incluye el código de cada patrón y la maqueta aprobada del paso 3 como referencia.

## Estado siguiente
Probar la skill en el piloto de los pasos 0 y 5 y ajustarla con lo que salga.
