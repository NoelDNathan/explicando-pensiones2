# 2026-06-06 - Worker personal reductions card

## Fecha

2026-06-06

## Objetivo

Crear el componente del paso 4, `Reducciones y situacion personal`, dentro de `src/components/worker-salary-dashboard/`.

## Archivos modificados

- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.tsx`
- `src/components/worker-salary-dashboard/WorkerPersonalReductionsCard.css`
- `src/components/worker-salary-dashboard/index.ts`
- `src/App.tsx`
- `ai/current.md`

## Resumen de cambios

- Anadido un componente oscuro de alta fidelidad con cabecera, boton de informacion, cuatro controles de situacion personal, panel de reducciones, panel de deducciones y resumen inferior de totales.
- Exportado el componente y sus tipos desde `worker-salary-dashboard`.
- Anadido al laboratorio `/componentes` como Componente 18.
- Los valores son de interfaz/prototipo y no deben tratarse como reglas fiscales cerradas sin conectar fuentes y metadata.

## Verificacion

- `.\node_modules\.bin\tsc.cmd --noEmit` correcto.
- `node node_modules\vite\bin\vite.js build` correcto tras ejecutarlo fuera del sandbox porque el intento normal de Vite suele fallar por `node.exe: Acceso denegado`; mantiene avisos conocidos de chunk grande y tiempos de plugins.
- Revision con navegador integrado en `/componentes`: escritorio 1280x720 con componente de 1120px sin overflow interno; movil 390x844 con componente de 347px sin overflow interno. La captura PNG del navegador integrado fallo por timeout en `Page.captureScreenshot`, por lo que la revision visual queda basada en DOM/medidas.

## Estado siguiente

- Pendiente conectar el componente a la calculadora fiscal real y sustituir los importes demo por reglas documentadas con fuentes oficiales antes de uso editorial publico.
- No se hizo commit/push porque el arbol de trabajo ya contiene cambios previos no atribuibles a esta interaccion, incluidos archivos compartidos como `src/App.tsx`; un commit mezclaria trabajos distintos.
