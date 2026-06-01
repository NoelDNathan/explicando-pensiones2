# 2026-06-01 - Dashboard calculadora fiscal

## Objetivo

Crear una interfaz web de alta fidelidad tipo dashboard SaaS en espanol para la herramienta "Calculadora Fiscal del Trabajador", comparando salario neto, impuestos y aportacion a pensiones entre 2025 y 2030.

## Archivos modificados

- `src/App.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.tsx`
- `src/components/fiscal-worker-dashboard/FiscalWorkerDashboard.css`
- `src/components/fiscal-worker-dashboard/data.tsx`
- `src/components/fiscal-worker-dashboard/types.ts`
- `src/components/fiscal-worker-dashboard/MenuIcon.tsx`
- `src/components/fiscal-worker-dashboard/FiscalLineChart.tsx`
- `src/components/fiscal-worker-dashboard/Donut.tsx`
- `src/components/fiscal-worker-dashboard/index.ts`
- `ai/current.md`

## Resumen de cambios

- Anadida la ruta `/calculadora-fiscal` con un dashboard oscuro premium para comparar 2025 y 2030.
- Anadida la misma pantalla al laboratorio `/componentes` como componente 09.
- Reorganizada la feature en una carpeta propia con datos, tipos, subcomponentes de grafico/donut/menu y estilos separados.
- Reutilizados `DashboardPanel` e `InfoButton` para mantener patrones existentes.
- Validado TypeScript, build de Vite y respuesta HTTP 200 de la ruta local.

## Estado siguiente

La pantalla queda como mockup visual con cifras proporcionadas por el prompt, no como calculadora conectada a datasets oficiales. Si se incorporan calculos reales, habra que documentar fuentes, supuestos, metadata y trazabilidad antes de uso editorial.
