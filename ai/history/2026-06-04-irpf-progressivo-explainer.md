# 2026-06-04 - Componente educativo IRPF progresivo

## Objetivo

Crear una interfaz web dark mode de alta fidelidad para explicar como funciona el IRPF progresivo, la base liquidable, los tramos y la cuota resultante.

## Archivos modificados

- `src/components/fiscal-worker-dashboard/ProgressiveIrpfExplainer.tsx`
- `src/components/fiscal-worker-dashboard/ProgressiveIrpfExplainer.css`
- `src/components/fiscal-worker-dashboard/index.ts`
- `src/App.tsx`
- `ai/current.md`

## Resumen de cambios

- Creado el componente `ProgressiveIrpfExplainer` con tabs simulados, pasos superiores, flujo de base liquidable, tramos activos/inactivos, input editable, calculo acumulado, cuota estimada y tipo efectivo.
- Anadida ruta directa `/irpf`, enlace desde la home y entrada como Componente 14 en `/componentes`.
- Ajustado el layout para escritorio 16:9 y movil sin overflow horizontal.

## Verificacion

- `pnpm run build` no pudo ejecutarse porque `pnpm` no esta disponible en el shell.
- `.\node_modules\.bin\tsc.cmd --noEmit` correcto.
- `node node_modules\vite\bin\vite.js build` correcto, con avisos conocidos de chunk grande y tiempos de plugins.
- Revision visual en navegador integrado: escritorio 1440x900 correcto y movil 390x844 sin overflow horizontal.

## Estado siguiente

El componente queda como pieza educativa/prototipo. Los tramos e importes del ejemplo deben tratarse como contenido didactico hasta documentar fuente normativa y metadata antes de uso editorial publico.

No se hizo commit/push porque el arbol de trabajo ya contenia cambios previos no atribuibles a esta interaccion, incluidos archivos compartidos como `src/App.tsx` e `index.ts`; hacer `git add .` mezclaria trabajo anterior con este cambio.
