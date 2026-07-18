# 2026-07-19 - Barra fija de reducciones

- Objetivo: evitar que el resumen de base se desplace dentro del formulario durante el scroll.
- Archivos modificados: `WorkerPersonalReductionsCard.css`, `FiscalSoftTheme.css`, `ai/current.md`.
- Resumen: el resumen pasa a una bandeja fija inferior durante el paso de reducciones y se deja espacio al final del formulario para no ocultar campos.
- Verificación: TypeScript y Vite build correctos; comprobación DOM antes y después de scroll confirma posición fija idéntica y sin overflow horizontal.
- Estado siguiente: continuar los ajustes visuales y didácticos solicitados para la calculadora fiscal.
