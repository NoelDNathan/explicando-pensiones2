# 2026-07-19 - Contorno de selectores de reducciones

- Objetivo: eliminar el aspecto de borde cortado en los desplegables de las tarjetas superiores de reducciones.
- Archivos modificados: `src/components/fiscal-worker-dashboard/FiscalSoftTheme.css`, `ai/current.md`.
- Resumen: el `select` interno conserva radio circular y pasa a fondo transparente, evitando que su fondo global blanco cubra el borde del contenedor.
- Verificacion: TypeScript, build de Vite y revision DOM en escritorio y movil 390 px sin overflow horizontal.
- Estado siguiente: continuar las correcciones visuales de la calculadora fiscal que se reporten.
